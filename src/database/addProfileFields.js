import pool from "../config/db.js";

export const addProfileFields = async () => {
  try {
    const columns = [
      { name: "phone", type: "VARCHAR(20)" },
      { name: "date_of_birth", type: "DATE" },
      { name: "address", type: "TEXT" },
    ];

    for (const column of columns) {
      const checkColumn = await pool.query(
        `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = $1
      `,
        [column.name]
      );

      if (checkColumn.rows.length === 0) {
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`${column.name} column added to users table`);
      } else {
        console.log(` ${column.name} column already exists`);
      }
    }
  } catch (error) {
    console.error(" Error adding profile fields:", error.message);
  }
};
