import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    unique: true,
    required: [true, "Username is required"],
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

  resume: {
    type: String,
    default: null,
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },

  role: {
    type: String,
    default: "Admin",
    enum: ["Admin", "SuperAdmin"],
  },

  profile_image: {
    type: String,
    default: "/assets/default_user.png",
  },

  banner_image: {
    type: String,
    default: "/assets/default_banner.png",
  },

  social_media: {
    type: Map,
    of: String,
    validate: {
      validator: function (socialMap) {
        const allowedPlatforms = [
          "github",
          "linkedin",
          "twitter",
          "portfolio",
          "facebook",
          "instagram",
        ];
        return Array.from(socialMap.keys()).every((platform) =>
          allowedPlatforms.includes(platform)
        );
      },
      message: "Invalid social media platform",
    },
  },

  hobbies: {
    type: [String],
    default: [],
  },

  reading_resources: [{
    title: String,
    url: String
  }],

  quote: {
    type: String,
    maxlength: [200, "Quote cannot exceed 200 characters"],
  },

  blog_count: {
    type: Number,
    default: 0,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  lastLogin: {
    type: Date,
    default: null,
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

  createdAt: {
    type: Date,
    default: Date.now,
  },

  passwordResetToken: String,
  passwordResetExpires: Date,
}, { timestamps: true });

// indexes for better performance  : {if any field is unique, then automatically it create an index}
userSchema.index({ isVerified: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ role: 1 });
userSchema.index({ lastLogin: -1 }); 

// password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// account lock check method
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// increment login attempts method
userSchema.methods.incrementLoginAttempts = function() {
  this.loginAttempts += 1;
  
  // Lock account after 3 failed attempts for 15 minutes
  if (this.loginAttempts >= 3) {
    this.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
  }
  
  return this.save();
};

// reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function() {
  if (this.loginAttempts > 0 || this.lockUntil) {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    return this.save();
  }
  return this;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

export default userSchema;