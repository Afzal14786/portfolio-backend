import express from "express";
import wrapAsync from "../../../middlewares/wrapErr.js";
import { login, verifyLogin, logout } from "../../../controllers/admin/auth/login.admin.controller.js";

const router = express.Router();

router.post("/", wrapAsync(login));
router.post("/verify-otp", wrapAsync(verifyLogin));
router.post("/logout", wrapAsync(logout));

export default router;