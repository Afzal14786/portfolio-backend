import {commentModel} from '../../models/comments/comments.model.js';

/**
 * @desc    Update a comment (only by author)
 * @route   PUT /api/comments/:commentId
 * @access  Private
 * @param   {string} commentId - ID of the comment to update
 * @param   {string} content - New comment content
 * @returns {Object} Updated comment with edit history
 */
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Input validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Comment cannot exceed 2000 characters'
      });
    }

    // Find comment and verify ownership
    const comment = await commentModel.findOne({
      _id: commentId,
      author: req.user._id,
      status: 'active'
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found or not authorized to edit'
      });
    }

    // Add to edit history before updating
    comment.editHistory.push({
      content: comment.content,
      editedAt: new Date(),
      reason: 'User edit'
    });

    // Update comment
    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();

    // Populate author info for response
    await comment.populate('author', 'username profile.name profile.avatar');

    res.json({
      success: true,
      data: {
        comment,
        message: 'Comment updated successfully'
      }
    });

  } catch (error) {
    console.error('Update comment error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update comment'
    });
  }
};