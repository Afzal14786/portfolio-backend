import {blogModel} from '../../../models/blogs/blog.model.js';

export const updateBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, publishedAt } = req.body;

    const blog = await blogModel.findOne({ _id: id, author: req.user._id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    blog.status = status;
    
    if (status === 'published' && !blog.publishedAt) {
      blog.publishedAt = publishedAt || new Date();
    }

    await blog.save();

    res.json({
      success: true,
      data: blog,
      message: `Blog ${status} successfully`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};