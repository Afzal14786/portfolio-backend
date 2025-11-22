import {blogModel} from '../../models/blogs/blog.model.js';
import {likesModel} from '../../models/likes/likes.model.js';
import {commentModel} from '../../models/comments/comments.model.js';
import {shareModel} from '../../models/share/share.model.js';

export const getBlogAnalytics = async (req, res) => {
  try {
    const { blogId } = req.params;
    const authorId = req.user._id;

    const blog = await blogModel.findOne({ _id: blogId, author: authorId })
      .select('title views publishedAt likesCount commentsCount shares readTime topic');

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    // Get detailed analytics from all schemas
    const [likes, comments, shares, platformStats] = await Promise.all([
      likesModel.find({ target: blogId, targetType: 'blog' })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10),  // Limit to prevent overload
      commentModel.find({ blog: blogId, status: 'active' })
        .populate('author', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10),
      shareModel.find({ blog: blogId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10),
      shareModel.aggregate([
        { $match: { blog: blogId } },
        {
          $group: {
            _id: '$platform',
            count: { $sum: 1 },
            totalClicks: { $sum: '$clickCount' }
          }
        }
      ])
    ]);

    const totalEngagements = likes.length + comments.length + shares.length;
    const engagementRate = blog.views > 0 ? ((totalEngagements / blog.views) * 100) : 0;

    res.json({
      success: true,
      data: {
        blog,
        analytics: {
          engagementRate: engagementRate.toFixed(2),
          totalEngagements,
          platformStats
        },
        breakdown: {
          likes,
          comments,
          shares
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};