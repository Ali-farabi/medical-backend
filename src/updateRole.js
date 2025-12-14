const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

const updateRole = async () => {
  try {
    console.log(" Updating user role to admin...");

    const result = await pool.query(
      `UPDATE users 
       SET role = $1 
       WHERE email = $2 
       RETURNING id, email, name, role`,
      ["admin", "Adminka@gmail.com"]
    );

    if (result.rows.length > 0) {
      console.log(" Role updated successfully!");
      console.log(result.rows[0]);
    } else {
      console.log(" User not found");
    }
  } catch (error) {
    console.error(" Error:", error.message);
  } finally {
    await pool.end();
  }
};

updateRole();
