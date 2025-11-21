import {blogModel} from '../../../models/blogs/blog.model.js';
import { generateSlug } from '../../../utils/blogUtils.js';

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const blog = await blogModel.findOne({ _id: id, author: req.user._id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    // Handle slug regeneration if title changed
    if (updates.title && updates.title !== blog.title) {
      const baseSlug = generateSlug(updates.title);
      let newSlug = baseSlug;
      let counter = 1;
      
      while (await blogModel.findOne({ slug: newSlug, _id: { $ne: id } })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      updates.slug = newSlug;
    }

    // Update version
    updates.version = blog.version + 1;
    updates.lastEditedBy = req.user._id;

    // Apply updates
    Object.assign(blog, updates);
    await blog.save();

    res.json({
      success: true,
      data: blog,
      message: 'Blog updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};