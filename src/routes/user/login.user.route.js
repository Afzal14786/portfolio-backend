import express from "express";
const router = express.Router();
import {login, logout} from "../../controllers/user/login.user.controller.js";
import {resetPassword, verifyReset} from "../../controllers/user/update.password.controller.js";

import { verifyOtp } from "../../controllers/user/verifyOtp.user.controller.js";


// login routes
router.post("/login", login);
router.post("/logout", logout);
/**
 * The login feature is not implemented successfully as well as there is significant issues in register and login
 * follow up pendings
 */
router.post('/verify-otp', verifyOtp);
router.post("/forgot-password", resetPassword);
router.post("/reset-password", verifyReset);

export default router;