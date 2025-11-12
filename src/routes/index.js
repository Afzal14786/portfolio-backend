import express from "express";

import adminAuth from "./admin/auth/index.js";
import adminRoutes from "./admin/index.js";
import publicAuth from "./publicRoutes/auth/index.js";

const router = express.Router();

// ==================== ROOT ROUTE ====================
router.get("/", (req, res) => {
  res.json({
    message: "API is working!",
    version: "1.0.0",
    endpoints: {
      public: {
        auth: "/api/v1/public-auth",
      },
      admin: {
        auth: "/api/v1/admin-auth", 
        dashboard: "/api/v1/admin"
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ==================== API ROUTES ====================

router.use("/admin-auth", adminAuth);     // Admin authentication
router.use("/admin", adminRoutes);        // Admin dashboard & management and reset the password without authentication

router.use("/public-auth", publicAuth);   // public authentication

export default router;