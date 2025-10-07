import mongoose from "mongoose";

const otpCodeSchema = new mongoose.Schema({
  name: String,
  user_name: String,
  email: { type: String, required: true },
  otp: { type: String, required: true },
  purpose: {
    type: String,
    enum: ["register", "update_password", "update_email"],
    required: true,
  },
  password: String,
  newEmail: String,
  createdAt: { type: Date, default: Date.now },
});

// Expire OTP after 2 minutes
otpCodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });

export const OtpCodeModel = mongoose.model("OtpCode", otpCodeSchema);
