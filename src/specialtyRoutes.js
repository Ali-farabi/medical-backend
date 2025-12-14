import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM specialties
      ORDER BY name ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching specialties:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch specialties",
      error: error.message,
    });
  }
});

export default router;
