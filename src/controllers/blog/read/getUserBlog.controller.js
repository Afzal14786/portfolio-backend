import {blogModel} from "../../../models/blogs/blog.model.js"
import {likesModel} from '../../../models/likes/likes.model.js';
import {commentModel} from '../../../models/comments/comments.model.js';
import {shareModel} from '../../../models/share/share.model.js';

export const getUserBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      sort = 'updated' 
    } = req.query;

    const filter = { author: req.user._id };
    if (status) filter.status = status;

    const sortOptions = {
      updated: { updatedAt: -1 },
      created: { createdAt: -1 },
      published: { publishedAt: -1 },
      views: { views: -1 }
    };

    const blogs = await blogModel.find(filter)
      .select('title slug excerpt coverImage status readTime views publishedAt scheduledFor createdAt updatedAt')
      .sort(sortOptions[sort] || { updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get engagement counts for dashboard
    const blogsWithAnalytics = await Promise.all(
      blogs.map(async (blog) => {
        const [likesCount, commentsCount, sharesCount] = await Promise.all([
          likesModel.countDocuments({ target: blog._id, targetType: 'blog' }),
          commentModel.countDocuments({ blog: blog._id, status: 'active' }),
          shareModel.countDocuments({ blog: blog._id })
        ]);

        return {
          ...blog.toObject(),
          likesCount,
          commentsCount,
          sharesCount,
          engagementRate: ((likesCount + commentsCount) / blog.views * 100) || 0
        };
      })
    );

    const total = await blogModel.countDocuments(filter);
    const statusCounts = await blogModel.aggregate([
      { $match: { author: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: blogsWithAnalytics,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      statusCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};