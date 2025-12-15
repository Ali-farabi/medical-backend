import pool from "../config/db.js";

async function createAppointmentsTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
        CONSTRAINT unique_appointment UNIQUE (doctor_id, appointment_date, appointment_time)
      );
    `;

    await pool.query(createTableQuery);
    console.log("Таблица appointments успешно создана");

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_patient_appointments 
      ON appointments(patient_id, appointment_date);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_doctor_appointments 
      ON appointments(doctor_id, appointment_date);
    `);

    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
    `);

    await pool.query(`
      CREATE TRIGGER update_appointments_updated_at
      BEFORE UPDATE ON appointments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log(" Индексы и триггеры успешно созданы");
  } catch (error) {
    console.error(" Ошибка при создании таблицы appointments:", error);
    throw error;
  }
}

createAppointmentsTable()
  .then(() => {
    console.log(" Миграция завершена успешно");
    process.exit(0);
  })
  .catch((error) => {
    console.error(" Ошибка миграции:", error);
    process.exit(1);
  });

export { createAppointmentsTable };
