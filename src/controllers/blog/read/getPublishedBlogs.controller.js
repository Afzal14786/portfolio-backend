import { blogModel } from "../../../models/blogs/blog.model.js";

export const getPublishedBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      topic,
      search 
    } = req.query;

    // Build query for published blogs only
    const query = { 
      status: { $in: ['published', 'scheduled'] } 
    };

    // Add topic filter if provided
    if (topic && topic !== 'all') {
      query.topic = topic;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query with pagination
    const blogs = await blogModel.find(query)
      .populate('author', 'name avatar')
      .select('title slug excerpt coverImage readTime topic tags publishedAt views likesCount commentsCount')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await blogModel.countDocuments(query);

    res.json({
      success: true,
      data: {
        blogs,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};