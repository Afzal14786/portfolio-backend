import express from "express";
import wrapAsync from "../../../middlewares/wrapErr.js";
import { protect, requirePublicUser } from "../../../middlewares/middleware.auth.js";
import { resendOtpController, checkOtpStatus } from "../../../controllers/otp/otp.controller.js";

const router = express.Router();

// route is now protacted
router.use(protect, requirePublicUser);

router.post("/resend", wrapAsync((req, res) => {
  req.body.userType = 'public';
  req.body.email = req.user.email; // Force current user's email
  return resendOtpController(req, res);
}));

router.get("/status", wrapAsync((req, res) => {
  req.query.userType = 'public'; 
  req.query.email = req.user.email; // Force current user's email
  return checkOtpStatus(req, res);
}));

export default router;