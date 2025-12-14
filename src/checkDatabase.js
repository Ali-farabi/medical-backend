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

const checkDatabase = async () => {
  try {
    console.log(" Checking database connection...");
    console.log("Host:", process.env.DB_HOST);
    console.log("Database:", process.env.DB_NAME);
    console.log("User:", process.env.DB_USER);

    const dbResult = await pool.query(
      "SELECT current_database(), current_user"
    );
    console.log(" Connected to database:", dbResult.rows[0]);

    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("\n Tables in database:");
    tablesResult.rows.forEach((row) => {
      console.log("  -", row.table_name);
    });

    const userCheck = await pool.query(
      `
      SELECT * FROM users WHERE email = $1
    `,
      ["Adminka@gmail.com"]
    );

    console.log("\n User found:", userCheck.rows.length > 0 ? "YES" : "NO");
    if (userCheck.rows.length > 0) {
      console.log(userCheck.rows[0]);
    }
  } catch (error) {
    console.error(" Error:", error.message);
  } finally {
    await pool.end();
  }
};

checkDatabase();
