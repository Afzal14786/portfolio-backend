import express from "express";
import wrapAsync from "../../../middlewares/wrapErr.js";
import { resendOtpController, checkOtpStatus } from "../../../controllers/otp/otp.controller.js";

const router = express.Router();

router.post("/resend", wrapAsync((req, res) => {
  req.body.userType = 'public';
  
  // Only allow registration OTP type for unauthenticated users
  if (req.body.type && req.body.type !== 'registration') {
    return res.status(403).json({
      message: "Unauthorized OTP type for unauthenticated request",
      success: false
    });
  }
  return resendOtpController(req, res);
}));

router.get("/status", wrapAsync((req, res) => {
  const modifiedQuery = {
    ...req.query,
    userType: 'public'
  };
  
  const modifiedReq = {
    ...req,
    query: modifiedQuery
  };
  
  return checkOtpStatus(modifiedReq, res);
}));

export default router;