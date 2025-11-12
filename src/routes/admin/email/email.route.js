import express from "express";
import wrapAsync from "../../../middlewares/wrapErr.js";
import { protect } from "../../../middlewares/middleware.auth.js";
import { 
  updateEmail,
  verifyOtp 
} from "../../../controllers/admin/profile/update/updateEmail.controller.js";

const router = express.Router();

// routes require authentication
router.use(protect);

// Email update flow
router.post("/request-update", wrapAsync(updateEmail));      // Request email update OTP
router.post("/verify-otp", wrapAsync(verifyOtp));   // Verify & update email

export default router;