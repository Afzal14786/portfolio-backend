import {commentModel} from '../../models/comments/comments.model.js';
import {likesModel} from '../../models/likes/likes.model.js';

/**
 * @desc    Toggle like on a comment
 * @route   POST /api/comments/:commentId/like
 * @access  Private
 * @param   {string} commentId - ID of the comment to like/unlike
 * @param   {string} intensity - Like intensity: 'like', 'love', etc. (optional)
 * @returns {Object} Updated like status and count
 */
export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { intensity = 'like' } = req.body;

    // Validate comment exists
    const comment = await commentModel.findOne({
      _id: commentId,
      status: 'active'
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Toggle like using Like model's static method
    const result = await likesModel.toggleLike({
      userId: req.user._id,
      targetId: commentId,
      targetType: 'comment',
      intensity
    });

    // Get updated comment with like count
    const updatedComment = await commentModel.findById(commentId).select('likesCount');

    res.json({
      success: true,
      data: {
        hasLiked: result.hasLiked,
        likesCount: updatedComment.likesCount,
        intensity: result.hasLiked ? intensity : null,
        action: result.action
      },
      message: result.hasLiked ? 'Comment liked successfully' : 'Comment unliked successfully'
    });

  } catch (error) {
    console.error('Like comment error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'You have already liked this comment'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to toggle like'
    });
  }
};