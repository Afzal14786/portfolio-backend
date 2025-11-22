import express from "express";
import publicLoginRoute from './publicLogin.route.js';
import publicRegisterRoute from './publicRegister.route.js';
import publicOtpRoute from './publicOtp.route.js';
import publicRegistrationOtpRoute from './publicRegistrationOtp.route.js';

const router = express.Router();

// Auth routes
router.use("/signin", publicLoginRoute);
router.use("/signup", publicRegisterRoute);
router.use("/otp", publicOtpRoute);
router.use("/auth-otp", publicRegistrationOtpRoute);

// ==================== AUTH HEALTH CHECK ====================
router.get("/", (req, res) => {
  res.json({
    message: "Public Auth API is working!",
    endpoints: {
      login: {
        "POST /signin": "Public Login request",
        "POST /verify": "Verify public login OTP", 
      },
      register: {
        "POST /signup": "Public register request",
        "POST /verify-otp": "Verify public registration OTP"
      },
      otp: {
        "POST /resend": "Resend OTP for logged-in users (login, email-update, etc.)",
        "GET /status": "Check OTP status for logged-in users"
      },
      "registration-otp": {
        "POST /resend": "Resend registration OTP (no auth required)",
        "GET /status": "Check registration OTP status (no auth required)"
      }
    }
  });
});

export default router;