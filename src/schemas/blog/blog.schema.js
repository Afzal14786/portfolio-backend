import mongoose from "mongoose";
import { 
  extractExcerpt, 
  calculateReadTime, 
  calculateWordCount,
  extractCodeBlocks,
  sanitizeHTML 
} from '../../utils/blogUtils.js';



const blogSchema = new mongoose.Schema({
  // basic requirements
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 200 
  },
  slug: { 
    type: String, 
    unique: true, 
    lowercase: true,
    required: true 
  },
  
  // content  -- html integrated from integrated platform
  content: { 
    type: String, 
    required: true 
  },

  excerpt: { 
    type: String, 
    maxlength: 200 
  }, // Auto-generated from content
  

  // Only the admin can create blogs
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Cover Image
  coverImage: { 
    url: String,
    cloudinaryId: String,
    alt: String,
    caption: String
  },

  images: [{
    cloudinaryId: { type: String, required: true },
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    caption: { type: String, default: '' },
    position: { type: Number },
    uploadedAt: { type: Date, default: Date.now }
  }],

  // user can also write codes
  codeBlocks: [{
    id: { type: String, required: true }, // Unique ID for each code block
    language: { 
      type: String, 
      required: true,
      enum: [
        'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
        'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css', 'scss',
        'sql', 'bash', 'shell', 'json', 'yaml', 'xml', 'markdown', 'dockerfile',
        'graphql', 'rust', 'scala', 'r', 'matlab', 'plaintext'
      ],
      default: 'cpp'
    },
    code: { type: String, required: true }, // The actual code content
    lineCount: { type: Number, default: 0 },
    showLineNumbers: { type: Boolean, default: true },
    position: { type: Number }, // Order in content
    createdAt: { type: Date, default: Date.now }
  }],
  
  // reading matrices
  readTime: { 
    type: String, 
    default: "1 min read" 
  },
  // total no of words in perticular blogs
  wordCount: { 
    type: Number, 
    default: 0 
  },
  
  // more information about blogs

  // category
  topic: { 
    type: String, 
    required: true,
    trim: true,
    default: "Technology" 
  },
  tags: [{ 
    type: String, 
    lowercase: true,
    trim: true 
  }],
  
  // publication status
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'published', 'archived'], 
    default: 'draft' 
  },
  // when the blog is published
  publishedAt: { 
    type: Date 
  },

  // is it schedule for future publishing
  scheduledFor: { 
    type: Date 
  },
  
  // engagement in bloogs
  views: { 
    type: Number, 
    default: 0 
  },

  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PublicUser' 
  }],

  likesCount: { 
    type: Number, 
    default: 0 
  },

  commentsCount: { 
    type: Number, 
    default: 0 
  },
  shares: { 
    type: Number, 
    default: 0 
  },
  
  // seo optimizations
  metaTitle: { 
    type: String, 
    maxlength: 60 
  },
  metaDescription: { 
    type: String, 
    maxlength: 160 
  },
  canonicalUrl: { 
    type: String 
  },
  
  // === VERSION CONTROL ===
  version: { 
    type: Number, 
    default: 1 
  },
  lastEditedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }

}, {
  timestamps: true // createdAt, updatedAt
});

// indexing for better performance
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ topic: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ 'images.cloudinaryId': 1 });

// === MIDDLEWARE ===
blogSchema.pre('save', function(next) {
  // Sanitize HTML content
  if (this.isModified('content')) {
    this.content = sanitizeHTML(this.content);
  }
  
  // Auto-generate excerpt from content
  if (this.isModified('content') && !this.excerpt) {
    this.excerpt = extractExcerpt(this.content, 200);
  }
  
  // Calculate word count and read time
  if (this.isModified('content')) {
    this.wordCount = calculateWordCount(this.content);
    this.readTime = calculateReadTime(this.content);
  }
  
  // Update likes count (if using embedded likes)
  if (this.isModified('likes')) {
    this.likesCount = this.likes.length;
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Extract and track code blocks
  if (this.isModified('content')) {
    this.codeBlocks = extractCodeBlocks(this.content);
  }

  next();
});

// Extract images from content and track them
blogSchema.methods.extractAndTrackImages = function() {
  const imagesInContent = extractImagesFromContent(this.content);
  
  // Filter out images that are already tracked
  const newImages = imagesInContent.filter(src => {
    return !this.images.find(img => img.url === src);
  }).map(src => {
    // Extract Cloudinary public_id from URL
    const cloudinaryId = src.split('/').pop().split('.')[0];
    return {
      cloudinaryId,
      url: src,
      alt: '',
      uploadedAt: new Date()
    };
  });
  
  // Add new images to tracking
  this.images = [...this.images, ...newImages];
};

// extrck the code section
blogSchema.methods.extractAndTrackCodeBlocks = function() {
  const codeBlockRegex = /<pre><code[^>]*data-language="([^"]*)"[^>]*>([\s\S]*?)<\/code><\/pre>/g;
  const codeBlocks = [];
  let match;
  let position = 0;
  
  while ((match = codeBlockRegex.exec(this.content)) !== null) {
    const language = match[1] || 'plaintext';
    const code = match[2].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
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
  
  this.codeBlocks = codeBlocks;
};


export default blogSchema;