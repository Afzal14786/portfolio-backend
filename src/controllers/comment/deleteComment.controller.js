import {commentModel} from '../../models/comments/comments.model.js';
import {blogModel} from '../../models/blogs/blog.model.js';

/**
 * @desc    Soft delete a comment (only by author or admin)
 * @route   DELETE /api/comments/:commentId
 * @access  Private
 * @param   {string} commentId - ID of the comment to delete
 * @returns {Object} Success message
 */
export const deleteComment = async (req, res) => {
  const session = await commentModel.startSession();
  
  try {
    session.startTransaction();
    
    const { commentId } = req.params;

    // Find comment and verify ownership/admin rights
    const comment = await commentModel.findOne({
      _id: commentId,
      $or: [
        { author: req.user._id },
        { ...(req.user.role === 'admin' && {}) } // Admin can delete any comment
      ]
    }).session(session);

    if (!comment) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: 'Comment not found or not authorized to delete'
      });
    }

    // Soft delete - change status
    comment.status = 'deleted';
    await comment.save({ session });

    // Update blog comments count (only for top-level comments)
    if (!comment.parentComment) {
      const activeCommentsCount = await commentModel.countDocuments({
        blog: comment.blog,
        parentComment: null,
        status: 'active'
      }).session(session);

      await blogModel.findByIdAndUpdate(
        comment.blog,
        { commentsCount: activeCommentsCount },
        { session }
      );
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete comment'
    });
  } finally {
    session.endSession();
  }
};