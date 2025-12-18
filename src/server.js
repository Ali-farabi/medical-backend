import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import specialtyRoutes from "./routes/specialtyRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
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

console.log(" API Documentation: http://localhost:5000/api-docs");
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

export default app;
