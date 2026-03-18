import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import specialtyRoutes from "./routes/specialtyRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
import pool from "./config/db.js";
const app = express();

const defaultAllowedOrigins = [
  "https://medical-project-orpin.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

const allowedOrigins = [
  ...defaultAllowedOrigins,
  ...(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const allowedOriginPatterns = [
  /\.vercel\.app$/i,
  /\.onrender\.com$/i,
  /\.up\.railway\.app$/i,
  /^localhost$/i,
  /^127\.0\.0\.1$/i,
];

const isAllowedOrigin = (origin) => {
  if (!origin || process.env.ALLOW_ALL_ORIGINS === "true") {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const { hostname } = new URL(origin);
    return allowedOriginPatterns.some((pattern) => pattern.test(hostname));
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/specialties", specialtyRoutes);
app.use("/api/appointments", appointmentRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Care+ API Documentation",
  })
);

const PORT = process.env.PORT || 5000;

try {
  await pool.query("SELECT 1");
  console.log(" Database health check passed");
} catch (error) {
  console.error(" Database health check failed:", error.message);
  process.exit(1);
}

console.log(
  ` API Documentation: http://localhost:${process.env.PORT || 5000}/api-docs`
);

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

export default app;
