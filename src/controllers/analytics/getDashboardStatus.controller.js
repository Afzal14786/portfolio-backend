import {blogModel} from '../../models/blogs/blog.model.js';
import {likesModel} from '../../models/likes/likes.model.js';
import {commentModel} from '../../models/comments/comments.model.js';
import {shareModel} from '../../models/share/share.model.js';

export const getDashboardStats = async (req, res) => {
  try {
    const authorId = req.user._id;
    
    // Get blog stats
    const blogStats = await blogModel.aggregate([
      { $match: { author: authorId } },
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          publishedBlogs: { 
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          draftBlogs: { 
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          scheduledBlogs: { 
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          totalViews: { $sum: '$views' },
          totalWords: { $sum: '$wordCount' }
        }
      }
    ]);

    // Get engagement stats from external schemas
    const publishedBlogs = await blogModel.find({ 
      author: authorId, 
      status: 'published' 
    }).select('_id');

    const blogIds = publishedBlogs.map(blog => blog._id);

    const [totalLikes, totalComments, totalShares] = await Promise.all([
      likesModel.countDocuments({ 
        target: { $in: blogIds }, 
        targetType: 'blog' 
      }),
      commentModel.countDocuments({ 
        blog: { $in: blogIds },
        status: 'active'
      }),
      shareModel.countDocuments({ 
        blog: { $in: blogIds }
      })
    ]);

    // Get trending blogs
    const trendingBlogs = await blogModel.find({ 
      author: authorId, 
      status: 'published' 
    })
      .sort({ views: -1 })
      .limit(5)
      .select('title slug views likesCount commentsCount shares publishedAt topic tags readTime coverImage');

    // Handle case when no blogs exist
    const stats = blogStats[0] || {
      totalBlogs: 0,
      publishedBlogs: 0,
      draftBlogs: 0,
      scheduledBlogs: 0,
      totalViews: 0,
      totalWords: 0
    };

    res.json({
      success: true,
      data: {
        overview: {
          ...stats,
          totalLikes,
          totalComments,
          totalShares,
          totalReaders: stats.totalViews || 0  // Use totalViews as readers for now
        },
        trending: trendingBlogs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};