import express from "express";

import authRoutes from "./auth/index.js";
import userRoutes from "./user/index.js";
// import blogRoutes from "./blog/index.js";

const router = express.Router();

// ==================== ROOT ROUTE ====================
router.get("/", (req, res) => {
  res.json({
    message: "API is working!",
    endpoints: {
      auth: "/api/v1/auth",
      user: "/api/v1/user", 
      // blog: "/api/v1/blog"
    },
    timestamp: new Date().toISOString()
  });
});

// ==================== API ROUTES ====================
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
// router.use("/blog", blogRoutes);

export default router;