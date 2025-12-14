import pool from "../config/db.js";

export const addAvatarColumn = async () => {
  try {
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'avatar'
    `);

    if (checkColumn.rows.length === 0) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN avatar TEXT
      `);
      console.log("Avatar column added to users table");
    } else {
      console.log(" Avatar column already exists");
    }
  } catch (error) {
    console.error(" Error adding avatar column:", error.message);
  }
};
