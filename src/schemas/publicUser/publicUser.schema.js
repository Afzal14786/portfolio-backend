import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const publicUser = new mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: [true, "Full Name is required"],
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/,
        "Please provide a valid email id",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    role: {
      type: String,
      default: "public",
    },

    profile: {
      name: {
        type: String,
        trim: true, // Removes extra spaces
        maxlength: 25, // Maximum 25 characters
      },
      bio: {
        type: String,
        maxlength: 160, // Like Twitter bio length
        default: "", // Empty by default
      },
      profileImage: {
        type: String, // URL to image (Cloudinary/S3)
        default: null, // No image by default
      },
      website: {
        type: String,
        trim: true,
      },
      location: {
        type: String,
        trim: true,
        maxlength: 30, // "Mumbai, Maharashtra"
      },
    },

    authProvider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },

    providerId: {
      type: String, // Google/GitHub user ID
      sparse: true,
    },

    providerData: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationToken: {
      type: String,
      select: false, // Don't include in queries by default
    },

    engagement: {
      commentsCount: { type: Number, default: 0 },
      likesCount: { type: Number, default: 0 },
      sharesCount: { type: Number, default: 0 },
      lastActive: { type: Date, default: Date.now },
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      select: false,
    },

    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lockUntil: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// indexing

publicUser.index({ "engagement.lastActive": -1 });
publicUser.index({ authProvider: 1, providerId: 1 });
publicUser.index({ isVerified: 1 });
publicUser.index({ isActive: 1 }); 

publicUser.pre("save", function (next) {
  // Auto-generate username from email if not provided for OAuth users
  if (this.authProvider !== "local" && !this.username && this.email) {
    this.username =
      this.email.split("@")[0] + "_" + Math.random().toString(36).substr(2, 5);
  }

  // Update last active timestamp
  if (
    this.isModified("engagement.likesCount") ||
    this.isModified("engagement.commentsCount")
  ) {
    this.engagement.lastActive = new Date();
  }

  next();
});

// === INSTANCE METHODS ===
publicUser.methods.incrementCommentsCount = function () {
  this.engagement.commentsCount += 1;
  return this.save();
};

publicUser.methods.incrementLikesCount = function () {
  this.engagement.likesCount += 1;
  return this.save();
};

publicUser.methods.incrementSharesCount = function () {
  this.engagement.sharesCount += 1;
  return this.save();
};

// Check if account is locked
publicUser.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

publicUser.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default publicUser;
