import {blogModel} from '../../models/blogs/blog.model.js';

export const getBlogsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const authorId = req.user._id;

    const blogs = await blogModel.find({ 
      author: authorId, 
      status: status 
    })
    .sort({ createdAt: -1 })
    .select('title slug views likesCount commentsCount shares status publishedAt topic coverImage readTime');

    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};