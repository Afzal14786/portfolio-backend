import express from "express";
import wrapAsync from "../../../middlewares/wrapErr.js";
import { register, verifyOtp } from "../../../controllers/admin/auth/register.admin.controller.js";

const router = express.Router();

router.post("/register", wrapAsync(register));
router.post("/verify-otp", wrapAsync(verifyOtp));

export default router;