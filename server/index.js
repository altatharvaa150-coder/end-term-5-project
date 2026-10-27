import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import assessmentRoutes from "./routes/assessment.routes.js";
import evaluationRoutes from "./routes/evaluation.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => res.send("HireStream API is running ??"));
app.get("/health", (req, res) => res.status(200).json({ status: "ok", message: "HireStream server is healthy" }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("⚠️  MongoDB connection failed. Server will start but DB features won't work.");
    console.error("   Fix: Go to MongoDB Atlas → Network Access → Add Current IP or 0.0.0.0/0");
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ HireStream server running on port ${PORT}`);
  });
};

startServer();
