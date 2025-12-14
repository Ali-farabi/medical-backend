import pkg from "pg";
const { Pool } = pkg;

console.log("=== DB Config Debug ===");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PASSWORD exists:", !!process.env.DB_PASSWORD);

const isRender = process.env.DB_HOST?.includes("render.com") || false;

let pool;

try {
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: isRender ? { rejectUnauthorized: false } : false,
  });

  pool.on("connect", () => {
    console.log(" Connected to PostgreSQL database");
  });

  pool.on("error", (err) => {
    console.error(" Unexpected error on idle client", err);
  });

  console.log(" Pool created successfully");
} catch (error) {
  console.error(" Error creating pool:", error);
  throw error;
}

export default pool;
