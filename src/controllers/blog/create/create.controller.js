import {blogModel} from '../../../models/blogs/blog.model.js';
import { 
  generateSlug, 
  validateBlogData, 
  processTags,
  formatBlogResponse 
} from '../../../utils/blogUtils.js';

export const createBlog = async (req, res) => {
  try {
    const {
      title, 
      content, 
      topic, 
      tags,
      coverImage, 
      status = 'draft',
      metaTitle, 
      metaDescription, 
      canonicalUrl
    } = req.body;

    // Validate blog data
    const validation = validateBlogData({ title, content, topic, status, metaTitle, metaDescription });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    // Generate unique slug (this function already handles uniqueness)
    const slug = await generateSlug(title);

    // Process tags
    const processedTags = processTags(tags);

    // Create blog with processed data
    const blog = new blogModel({
      title,
      slug,
      content,
      topic: topic || 'Technology',
      tags: processedTags,
      coverImage,
      status,
      author: req.user._id,
      metaTitle: metaTitle || title,
      metaDescription,
      canonicalUrl,
    });

    // Save the blog instance, not the model
    await blog.save();

    // Format response
    const response = formatBlogResponse(blog, true);

    res.status(201).json({
      success: true,
      data: response,
      message: `Blog ${status === 'published' ? 'published' : 'saved as draft'} successfully`
    });
  } catch (error) {
    // Handle duplicate key errors (like duplicate slug)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A blog with this title already exists. Please choose a different title.'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        errors
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};