import pool from "../config/db.js";

export const getAllDoctors = async (req, res) => {
  try {
    const { specialty_id, search } = req.query;

    let query = `
      SELECT d.*, s.name as specialty_name 
      FROM doctors d
      LEFT JOIN specialties s ON d.specialty_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (specialty_id) {
      params.push(specialty_id);
      query += ` AND d.specialty_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND d.name ILIKE $${params.length}`;
    }

    query += ` ORDER BY d.rating DESC, d.name ASC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting doctors:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения докторов",
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT d.*, s.name as specialty_name 
      FROM doctors d
      LEFT JOIN specialties s ON d.specialty_id = s.id
      WHERE d.id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Доктор не найден",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error getting doctor:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения доктора",
    });
  }
};

export const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialty_id,
      experience_years,
      education,
      description,
      achievements,
      consultation_price,
      photo,
    } = req.body;

    // Валидация
    if (!name || !specialty_id) {
      return res.status(400).json({
        success: false,
        message: "Имя и специальность обязательны",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO doctors (
        name, email, phone, specialty_id, experience_years, 
        education, description, achievements, consultation_price, photo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `,
      [
        name,
        email || null,
        phone || null,
        specialty_id,
        experience_years || 0,
        education || null,
        description || null,
        achievements || [],
        consultation_price || 0,
        photo || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Доктор успешно создан",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating doctor:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка создания доктора",
      error: error.message,
    });
  }
};

export const updateDoctor = async (req, res) => {
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
      achievements,
      consultation_price,
      photo,
    } = req.body;

    const checkDoctor = await pool.query(
      "SELECT id FROM doctors WHERE id = $1",
      [id]
    );
    if (checkDoctor.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Доктор не найден",
      });
    }

    const result = await pool.query(
      `
      UPDATE doctors 
      SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        specialty_id = COALESCE($4, specialty_id),
        experience_years = COALESCE($5, experience_years),
        education = COALESCE($6, education),
        description = COALESCE($7, description),
        achievements = COALESCE($8, achievements),
        consultation_price = COALESCE($9, consultation_price),
        photo = COALESCE($10, photo),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `,
      [
        name,
        email,
        phone,
        specialty_id,
        experience_years,
        education,
        description,
        achievements,
        consultation_price,
        photo,
        id,
      ]
    );

    res.json({
      success: true,
      message: "Доктор успешно обновлен",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка обновления доктора",
      error: error.message,
    });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM doctors WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Доктор не найден",
      });
    }

    res.json({
      success: true,
      message: "Доктор успешно удален",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка удаления доктора",
      error: error.message,
    });
  }
};

export const getAllSpecialties = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM specialties ORDER BY name");

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error getting specialties:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения специальностей",
    });
  }
};
