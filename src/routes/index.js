import express from "express";

// Admin routes
import adminRoutes from "./admin/index.js";

// Public routes  
import publicRoutes from "./publicRoutes/index.js";

const router = express.Router();

// ==================== ROOT ROUTE ====================
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Portfolio Dashboard API is running successfully!",
    version: "1.0.0",
    baseUrl: "http://localhost:8080/api/v1",
    status: "operational",
    timestamp: new Date().toISOString(),
    endpoints: {
      public: {
        auth: "/api/v1/auth",
        blogs: "/api/v1/blogs",
        profile: "/api/v1/profile",
        password: "/api/v1/password"
      },
      admin: {
        auth: "/api/v1/admin/auth",
        blogs: "/api/v1/admin/blogs",
        analysis: "/api/v1/admin/analysis", // NEW
        profile: "/api/v1/admin/profile",
        password: "/api/v1/admin/password",
        email: "/api/v1/admin/email"
      }
    },
    health: {
      database: "connected",
      server: "healthy", 
      uptime: process.uptime(),
      memory: process.memoryUsage()
    },
    documentation: "Visit /api-docs for complete API documentation"
  });
});

// ==================== API ROUTES ====================

// Public routes (no authentication required for most endpoints)
router.use("/", publicRoutes);

// Admin routes (authentication required)
router.use("/admin", adminRoutes);

// ==================== 404 HANDLER ====================
router.use(/.*/, (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `The route ${req.originalUrl} does not exist on this server`,
    availableEndpoints: {
      public: {
        "GET /": "API health check and information",
        "GET /blogs": "Get all published blogs",
        "GET /blogs/:slug": "Get specific blog by slug",
        "POST /blogs/:id/comments": "Add comment to blog",
        "POST /blogs/:id/like": "Like a blog",
        "POST /blogs/:id/share": "Share a blog",
        "POST /auth/*": "Public user authentication",
        "GET /profile/*": "Public profile routes",
        "POST /password/*": "Public password management"
      },
      admin: {
        "GET /admin": "Admin dashboard",
        "GET /admin/blogs": "Get all blogs with analytics",
        "POST /admin/blogs": "Create new blog",
        "GET /admin/analysis/comments": "Get comments analytics",
        "GET /admin/analysis/likes": "Get likes analytics",
        "GET /admin/analysis/shares": "Get shares analytics",
        "POST /admin/auth/*": "Admin authentication",
        "GET /admin/profile/*": "Admin profile management"
      }
    }
  });
});

export default router;