import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  // core identifications
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublicUser',
    required: true,
  },

  // comment content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },

  // reply to a comment
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  depth: {
    type: Number,
    default: 0,
    max: 12  // Prevent infinite nesting
  },

  // no of likes in a comments
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublicUser'
  }],

  likesCount: {
    type: Number,
    default: 0
  },
  replyCount: {
    type: Number,
    default: 0
  },

  // moderation & quality
  status: {
    type: String,
    enum: ['active', 'flagged', 'deleted', 'spam', 'pending'],
    default: 'active'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  editHistory: [{
    content: String,
    editedAt: { type: Date, default: Date.now },
    reason: String
  }],

  // community moderation
  reportedBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'PublicUser' },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'hate_speech', 'misinformation', 'other']
    },
    reportedAt: { type: Date, default: Date.now }
  }],
  reportCount: {
    type: Number,
    default: 0
  },

  // SEO & Discoverability
  slug: {
    type: String,
    unique: true,
    sparse: true
  },

  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

// indexing for better performance
commentSchema.index({ blog: 1, createdAt: -1 }); // Blog comments pagination
commentSchema.index({ author: 1, createdAt: -1 }); // User's comment history
commentSchema.index({ parentComment: 1 }); // Reply queries
commentSchema.index({ status: 1 }); // Moderation queries
commentSchema.index({ likesCount: -1 }); // Popular comments
commentSchema.index({ 'reportedBy.reportedAt': -1 }); // Recent reports

// middlewares
commentSchema.pre('save', function(next) {
  // Auto-update counts
  this.likesCount = this.likes.length;
  this.replyCount = this.replies.length;
  this.reportCount = this.reportedBy.length;
  
  // Generate slug for direct linking
  if (this.isNew && !this.slug) {
    this.slug = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }
  
  next();
});

// instance methods
commentSchema.methods.addReply = function(replyCommentId) {
  this.replies.push(replyCommentId);
  this.replyCount += 1;
  return this.save();
};

commentSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  this.likesCount = this.likes.length;
  return this.save();
};

commentSchema.methods.report = function(userId, reason) {
  // Prevent duplicate reports from same user
  const existingReport = this.reportedBy.find(report => 
    report.user.toString() === userId.toString()
  );
  
  if (!existingReport) {
    this.reportedBy.push({ user: userId, reason });
    this.reportCount = this.reportedBy.length;
  }
  
  return this.save();
};

export default commentSchema;