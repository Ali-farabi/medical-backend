import express from "express";
import pool from "../config/db.js";
import authenticate from "../middleware/authenticate.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// GET all doctors (public)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.*,
        s.name as specialty_name
      FROM doctors d
      LEFT JOIN specialties s ON d.specialty_id = s.id
      ORDER BY d.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
});

// GET single doctor by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        d.*,
        s.name as specialty_name
      FROM doctors d
      LEFT JOIN specialties s ON d.specialty_id = s.id
      WHERE d.id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
      error: error.message,
    });
  }
});

router.post("/", authenticate, adminAuth, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialty_id,
      experience_years,
      education,
      description,
      consultation_price,
      photo,
    } = req.body;

    // Validation
    if (!name || !specialty_id) {
      return res.status(400).json({
        success: false,
        message: "Name and specialty are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO doctors 
        (name, email, phone, specialty_id, experience_years, education, description, consultation_price, photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        email,
        phone,
        specialty_id,
        experience_years,
        education,
        description,
        consultation_price,
        photo,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating doctor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create doctor",
      error: error.message,
    });
  }
});

router.put("/:id", authenticate, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      specialty_id,
      experience_years,
      education,
      description,
      consultation_price,
      photo,
    } = req.body;

    const result = await pool.query(
      `UPDATE doctors 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           specialty_id = COALESCE($4, specialty_id),
           experience_years = COALESCE($5, experience_years),
           education = COALESCE($6, education),
           description = COALESCE($7, description),
           consultation_price = COALESCE($8, consultation_price),
           photo = COALESCE($9, photo),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        name,
        email,
        phone,
        specialty_id,
        experience_years,
        education,
        description,
        consultation_price,
        photo,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json({
      success: true,
      message: "Doctor updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update doctor",
      error: error.message,
    });
  }
});

router.delete("/:id", authenticate, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM doctors WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
      error: error.message,
    });
  }
});

export default router;
