import {blogModel} from "../../../models/blogs/blog.model.js"

export const createDraft = async (req, res) => {
  try {
    const { title, content, topic, tags } = req.body;

    const blog = new blogModel({
      title: title || 'Untitled',
      content: content || '',
      topic: topic || 'Technology',
      tags: tags || [],
      author: req.user._id,
      status: 'draft'
    });

    await blog.save();

    res.status(201).json({
      success: true,
      data: blog,
      message: 'Draft created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};