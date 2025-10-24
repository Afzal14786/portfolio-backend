import express from "express";
import wrapAsync from "../../../middlewares/wrapErr.js";
import { 
  resetPassword, 
  verifyReset,
} from "../../../controllers/password/reset.controller.js";

const router = express.Router();

// Password reset --- authentication not required
router.post("/request", wrapAsync(resetPassword));           // Request for token
router.post("/verify-otp", wrapAsync(verifyReset));       // Verify the token

export default router;