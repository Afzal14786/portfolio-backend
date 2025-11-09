import express from "express";
import wrapAsync from "../../../middlewares/wrapErr.js";
import { protect } from "../../../middlewares/middleware.auth.js";
import { 
  updateEmailId, 
  verifyUpdateEmailOtp 
} from "../../../controllers/admin/profile/update/update.user.controller.js";

const router = express.Router();

// routes require authentication
router.use(protect);

// Email update flow
router.post("/request-update", wrapAsync(updateEmailId));      // Request email update OTP
router.post("/verify-otp", wrapAsync(verifyUpdateEmailOtp));   // Verify & update email

export default router;