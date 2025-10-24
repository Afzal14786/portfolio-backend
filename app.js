import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./src/config/database.js";

import routes from "./src/routes/index.js";

// Environment Setup
dotenv.config({ quiet: true });

// Express app initialization
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== SECURITY MIDDLEWARE ====================

// Helmet Configuration for Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL,
  "http://localhost:5173", // Add localhost for development
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn(`Blocked CORS request from: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Rate Limiting Configuration
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { 
      success: false, 
      message 
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Apply different rate limits for different endpoints
const generalLimiter = createRateLimit(15 * 60 * 1000, 100, "Too many requests, please try again later.");
const authLimiter = createRateLimit(15 * 60 * 1000, 5, "Too many authentication attempts, please try again later.");
const strictLimiter = createRateLimit(15 * 60 * 1000, 10, "Too many requests to this endpoint.");

// Apply general rate limiting to all routes
app.use(generalLimiter);

// ==================== BASIC MIDDLEWARE ====================
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(compression());

// Session Configuration
app.use(
  session({
    name: 'sessionId',
    secret: process.env.SESSION_SECRET || "your-very-secure-session-secret-key-here",
    resave: false,
    saveUninitialized: false, // Changed to false for security
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'strict',
    },
  })
);

// ==================== ROUTES WITH RATE LIMITING ====================

// Swagger Documentation
const swaggerDocument = YAML.load(
  path.join(__dirname, "./src/docs/swagger.yaml")
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check route (no rate limiting)
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy and running 🚀",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Apply strict rate limiting to auth routes
app.use("/api/v1/auth", authLimiter);

// Apply specific rate limiting to sensitive routes
app.use("/api/v1/user/password", strictLimiter);
app.use("/api/v1/user/email", strictLimiter);

// ==================== MAIN API ROUTES (NEW STRUCTURE) ====================
app.use("/api/v1", routes);

// ==================== ROOT ROUTE ====================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 TerminalX Backend API is running successfully!",
    version: "1.0.0",
    documentation: "/api-docs",
    health: "/health",
    endpoints: {
      auth: "/api/v1/auth",
      user: "/api/v1/user",
      blog: "/api/v1/blog"
    }
  });
});

// ==================== ERROR HANDLING MIDDLEWARE ====================

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    suggestion: "Check the API documentation at /api-docs"
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global Error Handler:", error);

  // Handle rate limit errors
  if (error.status === 429) {
    return res.status(429).json({
      success: false,
      message: error.message || "Too many requests, please try again later."
    });
  }

  // Handle CORS errors
  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy: Access denied from this origin"
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? "Internal server error" 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// ==================== DATABASE CONNECTION ====================
connectDB();

export default app;