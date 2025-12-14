const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const createAdmin = async () => {
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, email, name, role`,
      [
        "Adminka@gmail.com",
        "$2a$10$iXlyMWlc8t/RHxeiXycYzO4uW0YoVxh3ZLlDBN4Gtx3w.6pFZVDtO",
        "Admin",
        "admin",
      ]
    );

    console.log(" Admin created successfully!");
    console.log(result.rows[0]);
  } catch (error) {
    console.error(" Error:", error.message);
  } finally {
    await pool.end();
  }
};

createAdmin();
