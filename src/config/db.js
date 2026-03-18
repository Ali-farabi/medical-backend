import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;
const hasConnectionString = Boolean(process.env.DATABASE_URL);
const isRender =
  process.env.DATABASE_URL?.includes("render.com") ||
  process.env.DB_HOST?.includes("render.com") ||
  false;

const connectionConfig = hasConnectionString
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isRender ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: isRender ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(connectionConfig);

pool.on("connect", () => {
  console.log(" Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error(" Unexpected error on idle client", err);
});

export default pool;
