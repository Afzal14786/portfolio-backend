import express from "express";
import {profileUpload} from "../../../middlewares/profileUpload.js";
import wrapAsync from "../../../middlewares/wrapErr.js";
import { protect } from "../../../middlewares/middleware.auth.js";
import { 
  updateProfileImage, 
  updateBannerImage, 
  updateResume,
  updateSocialMedia,
  updateReadingResources,
  updateQuote,
  updateHobbies,
  updateBasicInfo,
  updateProfileBulk
} from "../../../controllers/admin/profile/update/updateProfile.controller.js";



const router = express.Router();


router.use(protect);

router.patch("/image", profileUpload.single("profile_image"), wrapAsync(updateProfileImage));    // Profile image
router.patch("/banner", profileUpload.single("banner_image"), wrapAsync(updateBannerImage));     // Banner image
router.patch("/resume", profileUpload.single("resume"), wrapAsync(updateResume));                // Resume

router.patch("/social-media", wrapAsync(updateSocialMedia));          // Social media links
router.patch("/reading-resources", wrapAsync(updateReadingResources)); // Reading resources
router.patch("/quote", wrapAsync(updateQuote));                       // Quote
router.patch("/hobbies", wrapAsync(updateHobbies));                   // Hobbies
router.patch("/basic-info", wrapAsync(updateBasicInfo));              // Name & username
router.patch("/bulk-update", wrapAsync(updateProfileBulk));

export default router;