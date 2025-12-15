import pool from "./config/db.js";

async function fixAppointmentsTable() {
  try {
    console.log("=== Checking appointments table ===");

    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'appointments'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log("✓ Appointments table exists");

      const columnsCheck = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'appointments'
        ORDER BY ordinal_position;
      `);

      console.log("\nCurrent columns:");
      columnsCheck.rows.forEach((col) => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });

      const hasAppointmentTime = columnsCheck.rows.some(
        (col) => col.column_name === "appointment_time"
      );

      if (!hasAppointmentTime) {
        console.log(
          "\n  appointment_time column missing! Dropping and recreating table..."
        );
        await pool.query("DROP TABLE IF EXISTS appointments CASCADE;");
        console.log("✓ Dropped old appointments table");
      } else {
        console.log("\n✓ appointment_time column exists");
        console.log("Table structure looks correct!");
        await pool.end();
        process.exit(0);
        return;
      }
    } else {
      console.log("  Appointments table does not exist. Creating...");
    }

    console.log("\n=== Creating appointments table ===");

    await pool.query(`
      CREATE TABLE appointments (
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
    `);

    console.log("✓ Table created successfully");

    console.log("\n=== Creating indexes ===");

    await pool.query(`
      CREATE INDEX idx_patient_appointments 
      ON appointments(patient_id, appointment_date);
    `);
    console.log("✓ Created index: idx_patient_appointments");

    await pool.query(`
      CREATE INDEX idx_doctor_appointments 
      ON appointments(doctor_id, appointment_date);
    `);
    console.log("✓ Created index: idx_doctor_appointments");

    console.log("\n=== Creating trigger function ===");

    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✓ Trigger function created");

    await pool.query(`
      DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
    `);

    await pool.query(`
      CREATE TRIGGER update_appointments_updated_at
      BEFORE UPDATE ON appointments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log("✓ Trigger created");

    console.log("\n=== Verifying table structure ===");

    const verifyColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'appointments'
      ORDER BY ordinal_position;
    `);

    console.log("\nFinal table structure:");
    verifyColumns.rows.forEach((col) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
      );
    });

    console.log("\n=== Would you like to add sample appointments? ===");
    console.log(
      "You can manually add appointments through the booking interface"
    );

    console.log("\n Migration completed successfully!");
  } catch (error) {
    console.error("\n Error during migration:");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Detail:", error.detail);
    console.error("Stack:", error.stack);
    throw error;
  } finally {
    await pool.end();
    process.exit(0);
  }
}

fixAppointmentsTable();
