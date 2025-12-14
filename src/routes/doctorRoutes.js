import express from "express";
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAllSpecialties,
} from "../controllers/doctorController.js";
import { authenticate } from "../middleware/authenticate.js";
import { isAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/", getAllDoctors);
router.get("/specialties", getAllSpecialties);
router.get("/:id", getDoctorById);

router.post("/", authenticate, isAdmin, createDoctor);
router.put("/:id", authenticate, isAdmin, updateDoctor);
router.delete("/:id", authenticate, isAdmin, deleteDoctor);

export default router;
