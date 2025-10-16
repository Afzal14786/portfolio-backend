import express from "express"
const router = express.Router();
import wrapAsync from "../../middlewares/wrapErr.js";
import {register} from "../../controllers/user/register.user.controller.js";
import { verifyOtp } from "../../controllers/user/verifyOtp.user.controller.js";

// register the user
router.post('/register', wrapAsync(register)); 
router.post('/verify-otp', verifyOtp);

export default router;