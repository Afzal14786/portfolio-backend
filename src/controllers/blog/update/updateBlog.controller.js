import { blogModel } from '../../../models/blogs/blog.model.js';
import { generateSlug } from '../../../utils/blogUtils.js';

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const blog = await blogModel.findOne({ _id: id, author: req.user._id });

    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }

    delete updates._id;
    delete updates.author;
    delete updates.createdAt;

    if (updates.excerpt && updates.excerpt.length > 200) {
      updates.excerpt = updates.excerpt.trim().substring(0, 196) + '...';
    }

    if (!updates.excerpt && blog.excerpt && blog.excerpt.length > 200) {
      updates.excerpt = blog.excerpt.substring(0, 196) + '...';
    }

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

    if (typeof blog.version === 'number') {
      updates.version = blog.version + 1;
    } else {
      updates.version = 1; 
    }
    updates.lastEditedBy = req.user._id;

    blog.set(updates);
    await blog.save();

    res.json({
      success: true,
      data: blog,
      message: 'Blog updated successfully'
    });
  } catch (error) {
    console.error("Blog Update Error: ", error);
    res.status(400).json({
      success: false,
      error: error.message || 'Validation failed while updating the blog.'
    });
  }
};