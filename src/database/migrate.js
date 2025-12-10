const pool = require("../config/db");

const addAvatarColumn = async () => {
  try {
    console.log("Adding avatar column to users table...");

    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS avatar TEXT
    `);

    console.log("✓ Avatar column added successfully");
  } catch (error) {
    console.error("✗ Error adding avatar column:", error);
    throw error;
  }
};

module.exports = { addAvatarColumn };
