import pool from "../config/db.js";

async function createAppointmentsTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS appointments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        UNIQUE KEY unique_appointment (doctor_id, appointment_date, appointment_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await pool.query(createTableQuery);
    console.log(" Таблица appointments успешно создана");

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_patient_appointments 
      ON appointments(patient_id, appointment_date);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_doctor_appointments 
      ON appointments(doctor_id, appointment_date);
    `);

    console.log(" Индексы успешно созданы");
  } catch (error) {
    console.error(" Ошибка при создании таблицы appointments:", error);
    throw error;
  }
}

createAppointmentsTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { createAppointmentsTable };
