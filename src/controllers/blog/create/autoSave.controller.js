import {blogModel} from "../../../models/blogs/blog.model.js"

export const autoSaveDraft = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, content, topic, tags } = req.body;

    let blog;
    
    if (blogId) {
      // Update existing draft
      blog = await blogModel.findOneAndUpdate(
        { _id: blogId, author: req.user._id, status: 'draft' },
        {
          title,
          content,
          topic,
          tags: Array.isArray(tags) ? tags : tags?.split(',').map(t => t.trim()) || [],
          lastEditedBy: req.user._id,
          version: { $inc: 1 }
        },
        { new: true, runValidators: true }
      );

      if (!blog) {
        return res.status(404).json({
          success: false,
          error: 'Draft not found or you do not have permission to edit it'
        });
      }
    } else {
      // Create new draft
      blog = new blogModel({
        title: title || 'Untitled',
        content: content || '',
        topic: topic || 'Technology',
        tags: tags || [],
        author: req.user._id,
        status: 'draft'
      });
      await blog.save();
    }

    res.json({
      success: true,
      data: blog,
      message: 'Draft auto-saved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};