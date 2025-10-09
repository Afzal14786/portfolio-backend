import express, {urlencoded} from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";


import connectDB from "./src/config/database.js";
import registerRoute from "./src/routes/user/register.user.route.js";
import loginRoute from "./src/routes/user/login.user.route.js";
import updateRoute from "./src/routes/user/update.route.js";

// environment Setup
dotenv.config({ quiet: true });
// express app initialization
const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
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
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json()); 
app.use(cookieParser());
app.use(helmet()); // secure headers
// app.use(mongoSanitize({
//   replaceWith: '_'
// })); // prevent NoSQL injection
app.use(compression()); // optimize response size

// Rate Limiter (Security)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100, // max 100 requests/IP
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "very$-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);


app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
const swaggerDocument = YAML.load(
  path.join(__dirname, "./src/docs/swagger.yaml")
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// register + verify the otp
app.use("/api/v1/auth/user", registerRoute);

// login routes {email + password}
app.use("/api/v1/auth/user", loginRoute);

// now update route
// update password
app.use("/api/v1/user", updateRoute);


// routes
app.get("/", (req, res) => {
  res.send("Backend API is running successfully!");
});

// Database Connection
connectDB();

export default app;
