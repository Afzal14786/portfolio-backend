import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
// import mongoSanitize from "express-mongo-sanitize";  caused error 
import hpp from "hpp";
import { fileURLToPath } from "url";

import connectDB from "./src/config/database.js";
import routes from "./src/routes/index.js";
import refreshRouter from './src/routes/auth/refresh.route.js';

// Environment Setup
dotenv.config();

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express app initialization
const app = express();

// ==================== SECURITY MIDDLEWARE ====================

// Trust proxy (important for rate limiting and secure cookies in production)
app.set('trust proxy', 1);

// Helmet Configuration (API-focused, removed session-related headers)
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Disable for API
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:", "res.cloudinary.com"], // Added Cloudinary
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS Configuration for JWT + Cookies
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 Blocked CORS request from: ${origin}`);
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true, // Essential for cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-API-Key"
  ],
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// ==================== RATE LIMITING CONFIGURATION ====================

const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: { 
      success: false, 
      message,
      code: 429
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000),
        code: 429
      });
    }
  });
};

// Different rate limits for different scenarios
const generalLimiter = createRateLimit(15 * 60 * 1000, 1000, "Too many requests, please try again later.");
const authLimiter = createRateLimit(15 * 60 * 1000, 10, "Too many authentication attempts, please try again in 15 minutes.");
const strictLimiter = createRateLimit(15 * 60 * 1000, 50, "Too many requests to this endpoint.");
const criticalLimiter = createRateLimit(60 * 1000, 5, "Too many attempts, please slow down.");

// ==================== BASIC MIDDLEWARE ====================

// Body parsing with limits
app.use(express.json({ 
  limit: "10mb",
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: "10mb",
  parameterLimit: 100
}));

// Enhanced cookie parser for JWT tokens
app.use(cookieParser(process.env.JWT_SECRET)); // Signed cookies

app.use(compression({ level: 6 }));

// Security middleware
// app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent parameter pollution

// ==================== REQUEST LOGGING MIDDLEWARE ====================

app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms - IP: ${req.ip}`);
  });
  
  next();
});

// ==================== CLOUDINARY CONFIGURATION MIDDLEWARE ====================

// Add Cloudinary configuration to request object
app.use((req, res, next) => {
  req.cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'portfolio_uploads'
  };
  next();
});

// ==================== HEALTH CHECK & DOCUMENTATION ====================

// Health check (no rate limiting)
app.get("/health", (req, res) => {
  const healthcheck = {
    success: true,
    message: "✅ Portfolio Dashboard API is healthy and running 🚀",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    pid: process.pid,
    nodeVersion: process.version,
    authentication: "JWT + Cookies",
    fileStorage: "Cloudinary",
    cache: "Redis"
  };
  
  res.status(200).json(healthcheck);
});

// Ready check for load balancers
app.get("/ready", (req, res) => {
  res.status(200).json({ 
    success: true, 
    status: "ready",
    timestamp: new Date().toISOString(),
    services: {
      database: "MongoDB",
      authentication: "JWT",
      fileStorage: "Cloudinary",
      cache: "Redis"
    }
  });
});

// Swagger Documentation
try {
  const swaggerDocument = YAML.load(path.join(__dirname, "./docs/swagger.yaml"));
  app.use("/api-docs", 
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: "Portfolio Dashboard API Documentation",
      swaggerOptions: {
        persistAuthorization: true, // Keep JWT token in Swagger
      }
    })
  );
} catch (error) {
  console.warn("⚠️ Swagger documentation not found. Continuing without API docs.");
}

// ==================== ROUTES WITH RATE LIMITING ====================

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Apply specific rate limiting to sensitive routes
app.use("/api/v1/auth", authLimiter);
app.use("/api/v1/admin/auth", authLimiter);
app.use("/api/v1/public-auth", authLimiter);

app.use("/api/v1/admin/password", criticalLimiter);
app.use("/api/v1/admin/email", criticalLimiter);
app.use("/api/v1/password", criticalLimiter);

app.use("/api/v1/admin/blogs", strictLimiter);

// Refresh token route
app.use('/api/v1/auth', refreshRouter);

// ==================== MAIN API ROUTES ====================
app.use("/api/v1", routes);

// ==================== ROOT ROUTE ====================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Portfolio Dashboard API Server is running successfully!",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    authentication: "JWT + HTTP-only Cookies",
    timestamp: new Date().toISOString(),
    documentation: "/api-docs",
    health: "/health",
    ready: "/ready",
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
    features: {
      fileUpload: "Cloudinary Integration",
      caching: "Redis for OTP & Sessions",
      security: "JWT + Rate Limiting",
      documentation: "Swagger/OpenAPI"
    }
  });
});

// ==================== ERROR HANDLING MIDDLEWARE ====================

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `The route ${req.originalUrl} does not exist on this server`,
    suggestion: "Check the API documentation at /api-docs or visit the root endpoint /",
    code: 404,
    availableEndpoints: [
      "GET / - API Information",
      "GET /health - Health Check", 
      "GET /api-docs - API Documentation",
      "POST /api/v1/auth/* - Authentication",
      "GET /api/v1/blogs/* - Public Blogs",
      "GET /api/v1/admin/* - Admin Routes (Protected)"
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("🔥 Global Error Handler:", {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
      code: 400
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate field value: ${field}. Please use another value.`,
      code: 409
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again.",
      code: 401
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: "Your token has expired. Please log in again.",
      code: 401
    });
  }

  // Rate limit errors
  if (error.status === 429) {
    return res.status(429).json({
      success: false,
      message: error.message || "Too many requests, please try again later.",
      code: 429
    });
  }

  // CORS errors
  if (error.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: "CORS policy: Access denied from this origin",
      code: 403
    });
  }

  // Cloudinary errors
  if (error.message.includes('Cloudinary') || error.http_code) {
    return res.status(400).json({
      success: false,
      message: "File upload error. Please try again.",
      code: 400
    });
  }

  // Redis errors
  if (error.code === 'ECONNREFUSED' && error.port === 6379) {
    console.error('Redis connection failed - running without cache');
    // Continue without Redis (graceful degradation)
    return next();
  }

  // Default error response
  const statusCode = error.status || error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500 
      ? "Internal server error" 
      : error.message,
    ...(!isProduction && { 
      stack: error.stack,
      details: error.details 
    }),
    code: statusCode
  });
});

// ==================== GRACEFUL SHUTDOWN HANDLERS ====================

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Starting graceful shutdown...');
  // Add cleanup logic here if needed (close Redis connections, etc.)
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Starting graceful shutdown...');
  // Add cleanup logic here if needed
  process.exit(0);
});

// ==================== DATABASE & REDIS CONNECTION ====================
connectDB();

console.log(`🚀 Portfolio Dashboard API Server initialized with:
  - Environment: ${process.env.NODE_ENV || 'development'}
  - Authentication: JWT + HTTP-only Cookies
  - File Storage: Cloudinary
  - Cache: Redis
  - CORS: Enabled for ${allowedOrigins.length} origins
`);

export default app;