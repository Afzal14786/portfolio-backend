import {likesModel} from '../../models/likes/likes.model.js';

/**
 * @desc    Get paginated likes by the authenticated user
 * @route   GET /api/likes/user
 * @access  Private
 * @param   {string} targetType - Filter by target type: 'blog' or 'comment' (optional)
 * @param   {number} page - Page number (default: 1)
 * @param   {number} limit - Likes per page (default: 20)
 * @param   {string} sortBy - Sort order: 'recent' or 'oldest' (default: 'recent')
 * @returns {Object} Paginated user likes with target details
 */
export const getUserLikes = async (req, res) => {
  try {
    const { 
      targetType, 
      page = 1, 
      limit = 20, 
      sortBy = 'recent' 
    } = req.query;

    // Build query
    const query = { user: req.user._id };
    if (targetType) query.targetType = targetType;

    // Configure sorting
    const sortOptions = {
      recent: { createdAt: -1 },
      oldest: { createdAt: 1 }
    };

    // Get paginated likes
    const likes = await likesModel.find(query)
      .populate({
        path: 'target',
        select: targetType === 'blog' ? 'title slug author coverImage' : 'content blog author',
        populate: {
          path: targetType === 'blog' ? 'author' : 'author',
          select: 'username profile.name profile.avatar'
        }
      })
      .sort(sortOptions[sortBy] || sortOptions.recent)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const total = await likesModel.countDocuments(query);

    // Get like statistics
    const likeStats = await likesModel.aggregate([
      {
        $match: { user: req.user._id }
      },
      {
        $group: {
          _id: '$targetType',
          count: { $sum: 1 },
          recent: { $max: '$createdAt' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        likes,
        statistics: likeStats.reduce((acc, curr) => {
          acc[curr._id] = {
            count: curr.count,
            recent: curr.recent
          };
          return acc;
        }, {}),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get user likes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user likes'
    });
  }
};