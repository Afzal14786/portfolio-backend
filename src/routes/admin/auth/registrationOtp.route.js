import express from "express";
import wrapAsync from "../../../middlewares/wrapErr.js";
import { resendOtpController, checkOtpStatus } from "../../../controllers/otp/otp.controller.js";

const router = express.Router();

router.post("/resend", wrapAsync((req, res) => {
  // For POST requests, req.body is mutable
  req.body.userType = 'admin';
  
  // Only allow registration OTP type for unauthenticated admin registration
  if (req.body.type && req.body.type !== 'registration') {
    return res.status(403).json({
      message: "Unauthorized OTP type for admin registration",
      success: false
    });
  }
  return resendOtpController(req, res);
}));

router.get("/status", wrapAsync((req, res) => {
  const modifiedQuery = {
    ...req.query,
    userType: 'admin'
  };
  
  // Create a modified request object
  const modifiedReq = {
    ...req,                // all request properties
    query: modifiedQuery   // Override the query with our modified version
  };
  
  return checkOtpStatus(modifiedReq, res);
}));

export default router;