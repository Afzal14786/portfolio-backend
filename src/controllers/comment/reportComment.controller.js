import {commentModel} from '../../models/comments/comments.model.js';

/**
 * @desc    Report a comment for moderation
 * @route   POST /api/comments/:commentId/report
 * @access  Private
 * @param   {string} commentId - ID of the comment to report
 * @param   {string} reason - Report reason
 * @param   {string} details - Additional details (optional)
 * @returns {Object} Report status and count
 */
export const reportComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reason, details = '' } = req.body;

    // Validate report reason
    const validReasons = ['spam', 'harassment', 'hate_speech', 'misinformation', 'inappropriate', 'other'];
    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        error: `Invalid reason. Must be one of: ${validReasons.join(', ')}`
      });
    }

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

    // Prevent reporting own comment
    if (comment.author.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: 'You cannot report your own comment'
      });
    }

    // Report comment
    await comment.report(req.user._id, reason, details);

    res.json({
      success: true,
      data: {
        reportCount: comment.reportCount,
        status: comment.status
      },
      message: 'Comment reported successfully. Our moderators will review it.'
    });

  } catch (error) {
    console.error('Report comment error:', error);
    
    if (error.message === 'You have already reported this comment') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to report comment'
    });
  }
};