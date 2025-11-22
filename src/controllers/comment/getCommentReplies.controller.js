import {commentModel} from '../../models/comments/comments.model.js';
import {likesModel} from '../../models/likes/likes.model.js';

/**
 * @desc    Get paginated replies for a comment
 * @route   GET /api/comments/:commentId/replies
 * @access  Public (Optional authentication for like status)
 * @param   {string} commentId - ID of the parent comment
 * @param   {number} page - Page number (default: 1)
 * @param   {number} limit - Replies per page (default: 10)
 * @returns {Object} Paginated replies with user like status
 */
export const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const {
      page = 1,
      limit = 10
    } = req.query;

    // Validate parent comment exists
    const parentComment = await commentModel.findOne({
      _id: commentId,
      status: 'active'
    });

    if (!parentComment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Get paginated replies
    const replies = await commentModel.find({
      parentComment: commentId,
      status: 'active'
    })
      .populate('author', 'username profile.name profile.avatar')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const total = await commentModel.countDocuments({
      parentComment: commentId,
      status: 'active'
    });

    // Add user like status if authenticated
    if (req.user) {
      for (let reply of replies) {
        reply._doc.hasLiked = await likesModel.hasLiked(req.user._id, reply._id, 'Comment');
      }
    }

    res.json({
      success: true,
      data: {
        replies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        parentComment: {
          _id: parentComment._id,
          content: parentComment.content
        }
      }
    });

  } catch (error) {
    console.error('Get comment replies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comment replies'
    });
  }
};