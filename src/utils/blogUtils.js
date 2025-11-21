import slugify from 'slugify';
import {blogModel} from '../models/blogs/blog.model.js';

/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - The text to convert to slug
 * @param {boolean} unique - Whether to ensure uniqueness
 * @returns {Promise<string>} - The generated slug
 */
export const generateSlug = async (text, unique = true) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text provided for slug generation');
  }

  // Generate base slug
  let slug = slugify(text, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: true,
    trim: true
  });

  // If unique check is required, ensure slug is unique
  if (unique) {
    slug = await generateUniqueSlug(slug);
  }

  return slug;
};

/**
 * Generate a unique slug by appending counter if needed
 * @param {string} baseSlug - The base slug to check
 * @returns {Promise<string>} - Unique slug
 */
export const generateUniqueSlug = async (baseSlug) => {
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug exists and append counter if needed
  while (await blogModel.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    // Prevent infinite loop (safety measure)
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  
  return slug;
};

/**
 * Extract excerpt from HTML content
 * @param {string} content - HTML content
 * @param {number} length - Excerpt length (default: 200)
 * @returns {string} - Plain text excerpt
 */
export const extractExcerpt = (content, length = 200) => {
  if (!content) return '';
  
  try {
    // Remove HTML tags and get plain text
    const textContent = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    // Extract excerpt
    let excerpt = textContent.substring(0, length).trim();
    
    // Add ellipsis if content was truncated
    if (textContent.length > length) {
      excerpt += '...';
    }
    
    return excerpt;
  } catch (error) {
    console.error('Error extracting excerpt:', error);
    return content ? content.substring(0, length) : '';
  }
};

/**
 * Calculate read time from content
 * @param {string} content - HTML content
 * @param {number} wordsPerMinute - Reading speed (default: 200)
 * @returns {string} - Formatted read time
 */
export const calculateReadTime = (content, wordsPerMinute = 200) => {
  if (!content) return '1 min read';
  
  try {
    // Remove HTML tags and count words
    const textContent = content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    
    // Calculate minutes (always at least 1 minute)
    const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    
    return `${minutes} min read`;
  } catch (error) {
    console.error('Error calculating read time:', error);
    return '1 min read';
  }
};

/**
 * Calculate word count from content
 * @param {string} content - HTML content
 * @returns {number} - Word count
 */
export const calculateWordCount = (content) => {
  if (!content) return 0;
  
  try {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.split(/\s+/).filter(word => word.length > 0).length;
  } catch (error) {
    console.error('Error calculating word count:', error);
    return 0;
  }
};

/**
 * Extract images from HTML content
 * @param {string} content - HTML content
 * @returns {Array} - Array of image URLs
 */
export const extractImagesFromContent = (content) => {
  if (!content) return [];
  
  try {
    const imageRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
    const images = [];
    let match;
    
    while ((match = imageRegex.exec(content)) !== null) {
      images.push(match[1]);
    }
    
    return images;
  } catch (error) {
    console.error('Error extracting images from content:', error);
    return [];
  }
};

/**
 * Extract code blocks from HTML content
 * @param {string} content - HTML content
 * @returns {Array} - Array of code blocks with metadata
 */
export const extractCodeBlocks = (content) => {
  if (!content) return [];
  
  try {
    const codeBlockRegex = /<pre><code[^>]*data-language="([^"]*)"[^>]*>([\s\S]*?)<\/code><\/pre>/g;
    const codeBlocks = [];
    let match;
    let position = 0;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'plaintext';
      const code = match[2]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      const lineCount = code.split('\n').length;
      
      codeBlocks.push({
        id: `code_${Date.now()}_${position}`,
        language,
        code,
        lineCount,
        showLineNumbers: lineCount > 1,
        position: position++
      });
    }
    
    return codeBlocks;
  } catch (error) {
    console.error('Error extracting code blocks:', error);
    return [];
  }
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} content - HTML content
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHTML = (content) => {
  if (!content) return '';
  
  try {
    // Basic sanitization - in production, use a library like DOMPurify
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/on\w+="[^"]*"/g, '') // Remove event handlers
      .replace(/on\w+='[^']*'/g, '') // Remove event handlers
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/vbscript:/gi, '') // Remove vbscript: protocols
      .replace(/data:/gi, '') // Remove data: protocols (optional)
      .trim();
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    return content;
  }
};

/**
 * Validate blog data before saving
 * @param {Object} blogData - Blog data to validate
 * @returns {Object} - Validation result { isValid: boolean, errors: array }
 */
export const validateBlogData = (blogData) => {
  const errors = [];
  
  if (!blogData.title || blogData.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (blogData.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  if (!blogData.content || blogData.content.trim().length === 0) {
    errors.push('Content is required');
  }
  
  if (blogData.excerpt && blogData.excerpt.length > 200) {
    errors.push('Excerpt must be less than 200 characters');
  }
  
  if (blogData.metaTitle && blogData.metaTitle.length > 60) {
    errors.push('Meta title must be less than 60 characters');
  }
  
  if (blogData.metaDescription && blogData.metaDescription.length > 160) {
    errors.push('Meta description must be less than 160 characters');
  }
  
  const validStatuses = ['draft', 'published', 'archived', 'scheduled'];
  if (blogData.status && !validStatuses.includes(blogData.status)) {
    errors.push('Invalid status');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate meta tags for SEO
 * @param {Object} blog - Blog object
 * @returns {Object} - Meta tags object
 */
export const generateMetaTags = (blog) => {
  if (!blog) return {};
  
  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    keywords: blog.tags ? blog.tags.join(', ') : '',
    canonical: blog.canonicalUrl || '',
    og: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      image: blog.coverImage?.url || '',
      url: blog.canonicalUrl || '',
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      image: blog.coverImage?.url || ''
    }
  };
};

/**
 * Process tags array (clean and validate)
 * @param {string|Array} tags - Tags input
 * @returns {Array} - Cleaned tags array
 */
export const processTags = (tags) => {
  if (!tags) return [];
  
  try {
    let tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    
    return tagsArray
      .filter(tag => tag.length > 0 && tag.length <= 50) // Filter empty and too long tags
      .map(tag => tag.toLowerCase()) // Convert to lowercase
      .slice(0, 10); // Limit to 10 tags
  } catch (error) {
    console.error('Error processing tags:', error);
    return [];
  }
};

/**
 * Format blog for API response
 * @param {Object} blog - Blog document
 * @param {boolean} includeContent - Whether to include full content
 * @returns {Object} - Formatted blog object
 */
export const formatBlogResponse = (blog, includeContent = false) => {
  if (!blog) return null;
  
  const formatted = {
    id: blog._id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    author: blog.author,
    coverImage: blog.coverImage,
    readTime: blog.readTime,
    wordCount: blog.wordCount,
    topic: blog.topic,
    tags: blog.tags,
    status: blog.status,
    publishedAt: blog.publishedAt,
    scheduledFor: blog.scheduledFor,
    views: blog.views,
    metaTitle: blog.metaTitle,
    metaDescription: blog.metaDescription,
    canonicalUrl: blog.canonicalUrl,
    version: blog.version,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt
  };
  
  if (includeContent) {
    formatted.content = blog.content;
    formatted.images = blog.images || [];
    formatted.codeBlocks = blog.codeBlocks || [];
  }
  
  return formatted;
};

export default {
  generateSlug,
  generateUniqueSlug,
  extractExcerpt,
  calculateReadTime,
  calculateWordCount,
  extractImagesFromContent,
  extractCodeBlocks,
  sanitizeHTML,
  validateBlogData,
  generateMetaTags,
  processTags,
  formatBlogResponse
};