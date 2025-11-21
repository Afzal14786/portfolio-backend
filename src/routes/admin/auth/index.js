import express from "express";
import loginRoutes from "./login.route.js";
import registerRoutes from "./register.route.js";
import otpRoutes from "./Otp.route.js";
import registrationOtpRoutes from "./registrationOtp.route.js";

const router = express.Router();

// ==================== AUTH ROUTES ====================
router.use("/signin", loginRoutes);
router.use("/signup", registerRoutes);
router.use("/auth-otp", registrationOtpRoutes); // for non-authorized persons
router.use("/otp", otpRoutes); // for only authorized persons

// ==================== AUTH HEALTH CHECK ====================
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🔐 Admin Authentication API is running!",
    status: "operational",
    timestamp: new Date().toISOString(),
    features: {
      authentication: "OTP-based email verification",
      security: "JWT tokens + refresh tokens",
      rateLimiting: "Enabled for all endpoints"
    },
    endpoints: {
      login: {
        "POST /admin/auth/signin": "Initiate admin login (sends OTP)",
        "POST /admin/auth/signin/verify": "Verify login OTP and get access token"
      },
      register: {
        "POST /admin/auth/signup": "Register new admin account (sends OTP)",
        "POST /admin/auth/signup/verify-otp": "Verify registration OTP"
      },
      otp: {
        "POST /admin/auth/otp/resend": "Resend OTP for logged-in admins",
        "GET /admin/auth/otp/status": "Check OTP status for logged-in admins"
      },
      "registration-otp": {
        "POST /admin/auth/auth-otp/resend": "Resend admin registration OTP (no auth required)",
        "GET /admin/auth/auth-otp/status": "Check admin registration OTP status (no auth required)"
      }
    },
    flow: "All authentication requires OTP verification via email",
    note: "Check your email for OTP codes after registration/login requests"
  });
});

export default router;