import express from "express";
import wrapAsync from "../../middlewares/wrapErr.js";
import { register, verifyOtp } from "../../controllers/auth/register.user.controller.js";

const router = express.Router();

router.post("/", wrapAsync(register));
router.post("/verify-otp", wrapAsync(verifyOtp));

export default router;