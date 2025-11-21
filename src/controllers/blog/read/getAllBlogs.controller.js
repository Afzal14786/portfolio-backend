import {blogModel} from "../../../models/blogs/blog.model.js"
import {likesModel} from '../../../models/likes/likes.model.js';
import {commentModel} from '../../../models/comments/comments.model.js';
import {shareModel} from '../../../models/share/share.model.js';

export const getAllBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      topic, 
      tag, 
      sort = 'newest',
      search 
    } = req.query;

    // Build filter for published blogs only
    const filter = { status: 'published' };
    
    // Apply filters
    if (topic) filter.topic = topic;
    if (tag) filter.tags = { $in: [tag] };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {
      newest: { publishedAt: -1 },
      popular: { views: -1 },
      trending: { 'engagementScore': -1 }
    };

    const blogs = await blogModel.find(filter)
      .populate('author', 'name avatar bio')
      .select('title slug excerpt coverImage readTime publishedAt views topic tags')
      .sort(sortOptions[sort] || { publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get counts from external schemas
    const blogsWithCounts = await Promise.all(
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
          sharesCount
        };
      })
    );

    const total = await blogModel.countDocuments(filter);

    res.json({
      success: true,
      data: blogsWithCounts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};