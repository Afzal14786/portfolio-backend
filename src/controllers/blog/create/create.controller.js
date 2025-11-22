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

    console.log("📝 Received blog creation request:", {
      title: title?.substring(0, 50) + '...',
      contentLength: content?.length,
      topic,
      tagsCount: tags?.length,
      hasCoverImage: !!coverImage,
      coverImageType: typeof coverImage,
      status
    });

    // Validate blog data
    const validation = validateBlogData({ title, content, topic, status, metaTitle, metaDescription });
    if (!validation.isValid) {
      console.log("❌ Validation failed:", validation.errors);
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    // Generate unique slug (this function already handles uniqueness)
    const slug = await generateSlug(title);

    // Process tags
    const processedTags = processTags(tags);

    const truncatedMetaTitle = metaTitle 
      ? metaTitle.substring(0, 60)
      : title.substring(0, 60);

    // Truncate metaDescription to 160 characters if it's too long
    const truncatedMetaDescription = metaDescription 
      ? metaDescription.substring(0, 160)
      : '';

    // Create blog with processed data
    const blogData = {
      title,
      slug,
      content,
      topic: topic || 'Technology',
      tags: processedTags,
      status,
      author: req.user._id,
      metaTitle: truncatedMetaTitle,
      metaDescription: truncatedMetaDescription,
      canonicalUrl: canonicalUrl || undefined,
    };

    if (coverImage) {
      if (typeof coverImage === 'object' && coverImage.url) {
        // If it's already an object with url, use it directly
        blogData.coverImage = {
          url: coverImage.url,
          alt: coverImage.alt || title,
          caption: coverImage.caption || ""
        };
      } else if (typeof coverImage === 'string') {
        // If it's a string (backward compatibility), convert to object
        blogData.coverImage = {
          url: coverImage,
          alt: title,
          caption: ""
        };
      }
    }

    console.log("✅ Creating blog with data:", {
      title: blogData.title,
      slug: blogData.slug,
      topic: blogData.topic,
      status: blogData.status,
      tagsCount: blogData.tags.length,
      metaTitleLength: blogData.metaTitle?.length,
      metaDescriptionLength: blogData.metaDescription?.length,
      hasCoverImage: !!blogData.coverImage
    });

    const blog = new blogModel(blogData);

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
    console.error("💥 Create blog error:", error);
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