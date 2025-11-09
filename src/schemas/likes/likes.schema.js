import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  // target identification  -- who likes the post
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublicUser',
    required: true,
    index: true
  },
  
  // what is the thing user likes : comment or blog
  targetType: {
    type: String,
    enum: ['blog', 'comment'],
    required: true
  },

  target: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'  // Dynamic reference based on targetType
  },

  // LIKE INTENSITY (Standout Feature)
  intensity: {
    type: String,
    enum: ['like', 'love', 'insightful', 'helpful', 'curious'],
    default: 'like'
  },

  // analytics
  userAgent: {
    type: String,
    select: false
  },

  ipAddress: {
    type: String,
    select: false
  }

}, {
  timestamps: true
});

// compund indexing
likeSchema.index({ user: 1, target: 1, targetType: 1 }, { unique: true }); // Prevent duplicates
likeSchema.index({ target: 1, targetType: 1 }); // Count likes for any target
likeSchema.index({ createdAt: -1 }); // Recent likes
likeSchema.index({ intensity: 1 }); // Like type analytics

// statics methods
likeSchema.statics.getLikesForTarget = function(targetId, targetType) {
  return this.find({ target: targetId, targetType })
    .populate('user', 'username profile.name profile.profileImage')
    .sort({ createdAt: -1 });
};

likeSchema.statics.getUserLikes = function(userId, targetType = null) {
  const query = { user: userId };
  if (targetType) query.targetType = targetType;
  
  return this.find(query)
    .populate('target')
    .sort({ createdAt: -1 });
};

export default likeSchema;