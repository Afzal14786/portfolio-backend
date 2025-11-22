import {shareModel} from '../../models/share/share.model.js';
import {blogModel} from '../../models/blogs/blog.model.js';

/**
 * @desc    Get paginated shares for a blog with platform statistics
 * @route   GET /api/shares/blogs/:blogId
 * @access  Public
 * @param   {string} blogId - ID of the blog
 * @param   {string} platform - Filter by platform (optional)
 * @param   {number} page - Page number (default: 1)
 * @param   {number} limit - Shares per page (default: 20)
 * @returns {Object} Paginated shares with platform statistics
 */
export const getShares = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { platform, page = 1, limit = 20 } = req.query;

    // Verify blog exists
    const blog = await blogModel.findById(blogId).select('_id title');
    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    // Build query
    const query = { blog: blogId };
    if (platform) query.platform = platform;

    // Get paginated shares
    const shares = await shareModel.find(query)
      .populate('user', 'username profile.name profile.avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const total = await shareModel.countDocuments(query);

    // Get platform statistics
    const platformStats = await shareModel.aggregate([
      { $match: { blog: blogId } },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          totalClicks: { $sum: '$clickCount' },
          lastShare: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Calculate total clicks and engagement rate
    const totalClicks = platformStats.reduce((sum, stat) => sum + stat.totalClicks, 0);
    const engagementRate = total > 0 ? (totalClicks / total).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        shares,
        statistics: {
          totalShares: total,
          totalClicks,
          engagementRate: parseFloat(engagementRate),
          platformStats
        },
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
    console.error('Get shares error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shares'
    });
  }
};