import pool from "../config/db.js";

async function fixAppointmentsTable() {
  try {
    console.log("=== Starting Appointments Table Fix ===\n");

    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'appointments'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log("✓ Appointments table exists - checking structure...\n");

      const columnsCheck = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'appointments'
        ORDER BY ordinal_position;
      `);

      console.log("Current columns:");
      columnsCheck.rows.forEach((col) => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });

      const hasAppointmentTime = columnsCheck.rows.some(
        (col) => col.column_name === "appointment_time"
      );

      if (hasAppointmentTime) {
        console.log("\n✓ Table structure is correct! No changes needed.\n");
        await pool.end();
        return;
      }

      console.log("\n⚠ appointment_time column is missing!");
      console.log("⚠ Dropping and recreating table...\n");

      await pool.query("DROP TABLE IF EXISTS appointments CASCADE;");
      console.log("✓ Dropped old appointments table\n");
    } else {
      console.log("⚠ Appointments table does not exist. Creating new one...\n");
    }

    console.log("Creating appointments table with correct structure...");

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

    console.log("✓ Table created successfully\n");

    console.log("Creating indexes...");

    await pool.query(`
      CREATE INDEX idx_patient_appointments 
      ON appointments(patient_id, appointment_date);
    `);
    console.log("✓ Created index: idx_patient_appointments");

    await pool.query(`
      CREATE INDEX idx_doctor_appointments 
      ON appointments(doctor_id, appointment_date);
    `);
    console.log("✓ Created index: idx_doctor_appointments\n");

    console.log("Creating trigger function and trigger...");

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
    console.log("✓ Trigger created\n");

    console.log("=== Verifying Final Structure ===\n");

    const finalColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'appointments'
      ORDER BY ordinal_position;
    `);

    console.log("Final table structure:");
    finalColumns.rows.forEach((col) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
      );
    });

    console.log("\n Migration completed successfully!\n");
    console.log("Your appointments table is now ready to use.");
    console.log("Users can book appointments through the application.\n");
  } catch (error) {
    console.error("\n Error during migration:");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    if (error.detail) console.error("Detail:", error.detail);
    console.error("\nFull error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

fixAppointmentsTable()
  .then(() => {
    console.log("Process completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exit(1);
  });
