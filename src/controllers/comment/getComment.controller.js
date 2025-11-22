import {commentModel} from '../../models/comments/comments.model.js';
import {blogModel} from '../../models/blogs/blog.model.js';
import {likesModel} from '../../models/likes/likes.model.js';

/**
 * @desc    Get paginated comments for a blog with nested replies
 * @route   GET /api/comments/blogs/:blogId
 * @access  Public (Optional authentication for like status)
 * @param   {string} blogId - ID of the blog
 * @param   {number} page - Page number (default: 1)
 * @param   {number} limit - Comments per page (default: 15)
 * @param   {string} sort - Sort order: 'newest', 'oldest', 'popular' (default: 'newest')
 * @param   {boolean} includeReplies - Include nested replies (default: true)
 * @returns {Object} Paginated comments with user like status
 */
export const getComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const {
      page = 1,
      limit = 15,
      sort = 'newest',
      includeReplies = 'true'
    } = req.query;

    // Validate blog existence
    const blog = await blogModel.findById(blogId).select('_id title status');
    if (!blog || blog.status !== 'published') {
      return res.status(404).json({
        success: false,
        error: 'Blog not found or not published'
      });
    }

    // Build query for top-level comments
    const query = { 
      blog: blogId,
      parentComment: null,
      status: 'active'
    };

    // Configure sorting
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { likesCount: -1, createdAt: -1 }
    };

    // Get paginated comments
    const comments = await commentModel.find(query)
      .populate('author', 'username profile.name profile.avatar')
      .populate({
        path: 'replies',
        match: { status: 'active' },
        populate: {
          path: 'author',
          select: 'username profile.name profile.avatar'
        },
        options: { 
          sort: { createdAt: 1 },
          limit: includeReplies === 'true' ? 10 : 0
        }
      })
      .sort(sortOptions[sort] || sortOptions.newest)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const total = await commentModel.countDocuments(query);

    // Add user like status if authenticated
    if (req.user) {
      for (let comment of comments) {
        comment._doc.hasLiked = await likesModel.hasLiked(req.user._id, comment._id, 'Comment');
        
        // Check replies too
        if (comment.replies && includeReplies === 'true') {
          for (let reply of comment.replies) {
            reply._doc.hasLiked = await Like.hasLiked(req.user._id, reply._id, 'Comment');
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        blog: {
          _id: blog._id,
          title: blog.title
        }
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments'
    });
  }
};