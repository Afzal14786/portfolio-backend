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

// Public routes (no authentication required)
router.use("/", publicRoutes);

// Admin routes (authentication may be required at sub-route level)
router.use("/admin", adminRoutes);

// ==================== 404 HANDLER ====================
// Using regex pattern to avoid path-to-regexp error
router.use(/.*/, (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `The route ${req.originalUrl} does not exist on this server`,
    availableEndpoints: {
      public: {
        "GET /": "API health check and information",
        "GET /blogs": "Get all published blogs with pagination",
        "GET /blogs/:slug": "Get specific blog by slug",
        "POST /auth/*": "Public user authentication endpoints",
        "GET /profile/*": "Public profile routes",
        "POST /password/*": "Public password management"
      },
      admin: {
        "GET /admin": "Admin API health check", 
        "GET /admin/blogs": "Get admin's blogs (protected)",
        "POST /admin/blogs": "Create new blog (protected)",
        "POST /admin/auth/*": "Admin authentication endpoints",
        "GET /admin/profile/*": "Admin profile management (protected)"
      }
    },
    tip: "Check the root endpoint GET / for complete API documentation and health status"
  });
});

export default router;