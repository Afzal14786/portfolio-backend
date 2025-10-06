import mongoose from "mongoose";

const otpCodeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user_name: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 1-minute expiration
otpCodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });

export const OtpCodeModel = mongoose.model("OtpCode", otpCodeSchema);
