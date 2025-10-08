import express from "express";
import {updatePassword,verifyOtpPassword, resetPassword, verifyReset} from "../../controllers/user/update.password.controller.js";
import {protect} from "../../middlewares/middleware.auth.js";
import wrapAsync from "../../middlewares/wrapErr.js";

const router = express.Router();

// this route should protected
router.post("/update-password", protect, wrapAsync(updatePassword));
router.post("/update-password/verify-otp", protect, wrapAsync(verifyOtpPassword));

// reset the user
router.post("/forgot-password", resetPassword);
router.post("/reset-password", verifyReset);
export default router;
