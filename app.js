import express from "express";
import dotenv from "dotenv"
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// File path fix for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Load the swagger.yaml file
const swaggerDocument = YAML.load(path.join(__dirname, "./src/docs/swagger.yaml"));

// Middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Example route
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});


export default app;