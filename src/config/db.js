const { Pool } = require("pg");

const isRender = process.env.DB_HOST.includes("render.com");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: isRender ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => {
  console.log("✓ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("✗ Unexpected error on idle client", err);
  process.exit(-1);
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database time:", res.rows[0].now);
  }
});

module.exports = pool;
