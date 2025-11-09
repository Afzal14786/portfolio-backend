import mongoose from "mongoose";

const shareSchema = new mongoose.Schema({
  // share
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublicUser',
    required: true,
    index: true
  },

  // which blog is shared
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
    index: true
  },

  // in which platform the blog is shared
  platform: {
    type: String,
    enum: ['twitter', 'linkedin', 'facebook', 'reddit', 'whatsapp', 'telegram', 'other'],
    required: true
  },

  // share context
  sharedUrl: {
    type: String,
    required: true
  },

  customMessage: {
    type: String,
    maxlength: 280  // Twitter-friendly length
  },

  // analytics
  clickCount: {
    type: Number,
    default: 0
  },

  conversion: {
    type: String,
    enum: ['signup', 'comment', 'like', 'none'],
    default: 'none'
  },
  userAgent: {
    type: String,
    select: false
  },
  ipAddress: {
    type: String,
    select: false
  },

  // === VIRALITY TRACKING ===
  referralSource: {
    type: String  // Where did the sharer come from?
  }

}, {
  timestamps: true
});

// indexing
shareSchema.index({ blog: 1, platform: 1 }); // Platform-specific shares
shareSchema.index({ user: 1, createdAt: -1 }); // User's share history
shareSchema.index({ createdAt: -1 }); // Recent shares
shareSchema.index({ clickCount: -1 }); // Most clicked shares

// instance methods
shareSchema.methods.incrementClicks = function() {
  this.clickCount += 1;
  return this.save();
};

shareSchema.methods.trackConversion = function(action) {
  this.conversion = action;
  return this.save();
};

// statics methods
shareSchema.statics.getBlogShares = function(blogId, platform = null) {
  const query = { blog: blogId };
  if (platform) query.platform = platform;
  
  return this.find(query)
    .populate('user', 'username profile.name profile.profileImage')
    .sort({ createdAt: -1 });
};

shareSchema.statics.getPlatformStats = function(blogId) {
  return this.aggregate([
    { $match: { blog: blogId } },
    {
      $group: {
        _id: '$platform',
        count: { $sum: 1 },
        totalClicks: { $sum: '$clickCount' },
        lastShare: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

export default shareSchema;