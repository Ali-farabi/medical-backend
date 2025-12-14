import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import specialtyRoutes from "./routes/specialtyRoutes.js";
import { createTables } from "./database/schema.js";
import { addAvatarColumn } from "./database/migrate.js";
import { addProfileFields } from "./database/addProfileFields.js";
import pool from "./config/db.js";

const app = express();

const allowedOrigins = [
  "https://medical-project-orpin.vercel.app",
  "http://localhost:5173",
  "https://food-recipes-eight-ivory.vercel.app",
  "https://markett-self.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
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

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Medical Appointment API",
    version: "1.0.0",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 8000;
const HOST = "0.0.0.0";

const startServer = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✓ Database connection successful");

    await createTables();
    await addAvatarColumn();
    await addProfileFields();

    app.listen(PORT, HOST, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
