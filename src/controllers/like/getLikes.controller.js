import {likesModel} from '../../models/likes/likes.model.js';
import {blogModel} from '../../models/blogs/blog.model.js';
import {commentModel} from '../../models/comments/comments.model.js';

/**
 * @desc    Get paginated likes for a blog or comment
 * @route   GET /api/likes/:targetType/:targetId
 * @access  Public
 * @param   {string} targetType - Type of target: 'blog' or 'comment'
 * @param   {string} targetId - ID of the target
 * @param   {number} page - Page number (default: 1)
 * @param   {number} limit - Likes per page (default: 20)
 * @returns {Object} Paginated likes with user details
 */
export const getLikes = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate target type
    if (!['blog', 'comment'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid target type'
      });
    }

    // Verify target exists
    const TargetModel = targetType === 'blog' ? blogModel : commentModel;
    const target = await TargetModel.findById(targetId).select('_id');
    
    if (!target) {
      return res.status(404).json({
        success: false,
        error: `${targetType} not found`
      });
    }

    // Get paginated likes
    const likes = await likesModel.find({ 
      target: targetId, 
      targetType 
    })
      .populate('user', 'username profile.name profile.avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const total = await likesModel.countDocuments({ 
      target: targetId, 
      targetType 
    });

    // Group by intensity for summary
    const intensitySummary = await likesModel.aggregate([
      {
        $match: {
          target: targetId,
          targetType
        }
      },
      {
        $group: {
          _id: '$intensity',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        likes,
        summary: {
          total,
          intensity: intensitySummary.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {})
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch likes'
    });
  }
};