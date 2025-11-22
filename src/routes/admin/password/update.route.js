import express from "express";
import wrapAsync from "../../../middlewares/wrapErr.js";
import { protect } from "../../../middlewares/middleware.auth.js";
import { 
  updatePassword, 
  verifyOtpPassword 
} from "../../../controllers/admin/profile/password/updatePassword.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Logged-in password update flow
router.post("/", wrapAsync(updatePassword));          // Request update OTP
router.post("/verify-otp", wrapAsync(verifyOtpPassword));    // Verify & update password

export default router;