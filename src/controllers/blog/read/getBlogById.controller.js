import {blogModel} from '../../../models/blogs/blog.model.js';

export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await blogModel.findOne({ _id: id, author: req.user._id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};