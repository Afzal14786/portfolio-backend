import mongoose from "mongoose";
import crypto from "crypto";

export const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true,
    required: true,
  },

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
    default: null
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },

  profile_img: {
    type: String,
    default: "/assets/default_user.png",
  },

  banner_img: {
    type: String,
    default: "/assets/default_banner.png",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  passwordResetToken: string,
  passwordResetExpires: Date,
});

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // 10 minute
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

