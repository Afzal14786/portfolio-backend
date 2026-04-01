import express from "express";
import authRoutes from "./auth/index.js";
import blogRoutes from "./blog/index.route.js";
import passwordRoutes from "./password/index.js";
import profileRoutes from "./profile/index.js";
import portfolioRoutes from "./portfolio/index.js";

const router = express.Router();

// Public routes
router.use("/auth", authRoutes);
router.use("/blogs", blogRoutes);
router.use("/password", passwordRoutes);
router.use("/profile", profileRoutes);
router.use("/portfolio", portfolioRoutes);

export default router;