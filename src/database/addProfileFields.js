const pool = require("../config/db");

const addProfileFields = async () => {
  try {
    console.log("Adding profile fields to users table...");

    // Добавляем колонки, если их нет
    await pool.query(`
      DO $$ 
      BEGIN
        -- Добавляем phone
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'phone'
        ) THEN
          ALTER TABLE users ADD COLUMN phone VARCHAR(20);
        END IF;

        

        -- Добавляем address
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'address'
        ) THEN
          ALTER TABLE users ADD COLUMN address TEXT;
        END IF;

        -- Добавляем updated_at если его нет
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'updated_at'
        ) THEN
          ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `);

    console.log("✓ Profile fields added successfully");
  } catch (error) {
    console.error("✗ Error adding profile fields:", error);
    throw error;
  }
};

module.exports = { addProfileFields };
