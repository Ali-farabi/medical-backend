import express from "express";
import pool from "../config/db.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/available-slots/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    console.log(`Fetching slots for doctor ${doctorId} on date ${date}`);

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "Неверный формат даты. Используйте YYYY-MM-DD",
      });
    }

    const doctorResult = await pool.query(
      "SELECT id FROM doctors WHERE id = $1",
      [doctorId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ message: "Врач не найден" });
    }

    const appointmentsResult = await pool.query(
      `SELECT appointment_time 
       FROM appointments 
       WHERE doctor_id = $1 
       AND appointment_date = $2 
       AND status != 'cancelled'`,
      [doctorId, date]
    );

    console.log(`Found ${appointmentsResult.rows.length} booked appointments`);

    const bookedSlots = appointmentsResult.rows.map((a) => {
      const time = a.appointment_time;
      if (typeof time === "string") {
        const parts = time.split(":");
        if (parts.length === 2) {
          return `${parts[0]}:${parts[1]}:00`;
        }
        return time.slice(0, 8);
      }
      return time;
    });

    console.log("Booked slots:", bookedSlots);

    const allSlots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 20 && minute === 30) break;
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}:00`;
        allSlots.push(time);
      }
    }

    console.log(`Generated ${allSlots.length} total slots`);

    const availableSlots = allSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    console.log(`${availableSlots.length} slots available`);

    res.json({
      date,
      availableSlots,
      bookedSlots,
      totalSlots: allSlots.length,
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({
      message: "Ошибка сервера при загрузке слотов",
      error: error.message,
    });
  }
});

router.post("/book", authenticate, async (req, res) => {
  try {
    const {
      doctor_id,
      appointment_date,
      appointment_time,
      complaints,
      chronic_diseases,
      height,
      weight,
    } = req.body;
    const user_id = req.user.id;

    console.log("Booking request:", {
      user_id,
      doctor_id,
      appointment_date,
      appointment_time,
    });

    if (req.user.role !== "user") {
      return res
        .status(403)
        .json({ message: "Только пациенты могут записываться на прием" });
    }

    if (!doctor_id || !appointment_date || !appointment_time || !complaints) {
      return res.status(400).json({
        message: "Необходимо указать врача, дату, время приема и жалобы",
      });
    }

    const doctorResult = await pool.query(
      "SELECT id, consultation_price FROM doctors WHERE id = $1",
      [doctor_id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ message: "Врач не найден" });
    }

    const existingResult = await pool.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = $1 
       AND appointment_date = $2 
       AND appointment_time = $3 
       AND status != 'cancelled'`,
      [doctor_id, appointment_date, appointment_time]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ message: "Это время уже занято" });
    }

    const insertResult = await pool.query(
      `INSERT INTO appointments 
       (user_id, doctor_id, appointment_date, appointment_time, complaints, chronic_diseases, height, weight, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [
        user_id,
        doctor_id,
        appointment_date,
        appointment_time,
        complaints,
        chronic_diseases,
        height,
        weight,
      ]
    );

    console.log("Appointment created:", insertResult.rows[0]);

    const appointmentResult = await pool.query(
      `SELECT 
        a.*,
        d.name as doctor_name,
        s.name as specialty_name,
        d.consultation_price,
        u.name as patient_name
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN specialties s ON d.specialty_id = s.id
       JOIN users u ON a.user_id = u.id
       WHERE a.id = $1`,
      [insertResult.rows[0].id]
    );

    res.status(201).json({
      message: "Запись успешно создана",
      appointment: appointmentResult.rows[0],
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({
      message: "Ошибка сервера при создании записи",
      error: error.message,
    });
  }
});

router.get("/my-appointments", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        a.*,
        d.name as doctor_name,
        s.name as specialty_name,
        d.consultation_price,
        d.photo as doctor_photo
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN specialties s ON d.specialty_id = s.id
       WHERE a.user_id = $1
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
});

router.patch("/:appointmentId/cancel", authenticate, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const appointmentResult = await pool.query(
      "SELECT * FROM appointments WHERE id = $1 AND user_id = $2",
      [appointmentId, userId]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ message: "Запись не найдена" });
    }

    if (appointmentResult.rows[0].status === "cancelled") {
      return res.status(400).json({ message: "Запись уже отменена" });
    }

    await pool.query("UPDATE appointments SET status = $1 WHERE id = $2", [
      "cancelled",
      appointmentId,
    ]);

    res.json({ message: "Запись успешно отменена" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    const result = await pool.query(
      `SELECT 
        a.*,
        d.name as doctor_name,
        s.name as specialty_name,
        u.name as patient_name,
        u.email as patient_email
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN specialties s ON d.specialty_id = s.id
       JOIN users u ON a.user_id = u.id
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
});

export default router;
