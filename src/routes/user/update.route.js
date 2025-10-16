import express from "express";
import multer from "multer";
import {storage} from "../../config/cloudinary.js";
import {updatePassword,verifyOtpPassword, resetPassword, verifyReset} from "../../controllers/user/update.password.controller.js";
import {updateName, updateEmailId, verifyUpdateEmailOtp,updateProfileImage, updateBannerImage, updateResume} from "../../controllers/user/update.user.controller.js";
import {protect} from "../../middlewares/middleware.auth.js";
import wrapAsync from "../../middlewares/wrapErr.js";

const router = express.Router();
const upload = multer({storage});

// this route should protected
router.post("/update-password", protect, wrapAsync(updatePassword));
router.post("/update-password/verify-otp", protect, wrapAsync(verifyOtpPassword));

// reset the user
router.post("/forgot-password", resetPassword);
router.post("/reset-password", verifyReset);

// user can update name, user_name, email and all the routes are protected
router.put("/update-profile/name", protect, wrapAsync(updateName));
router.post("/update-email/request", protect, wrapAsync(updateEmailId));
router.post("/update-email/verify-otp", protect, wrapAsync(verifyUpdateEmailOtp));

// user can update profile image, banner and resume (pdf)
router.post("/update-profile-image", protect, upload.single("profile_image"), wrapAsync(updateProfileImage));
router.post("/update-banner-image", protect, upload.single("banner_image"), wrapAsync(updateBannerImage));
router.post("/update-resume", protect, upload.single("resume"), wrapAsync(updateResume));

export default router;
