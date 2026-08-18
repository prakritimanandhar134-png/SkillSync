const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "skillsync",

  waitForConnections: true,
  connectionLimit: 10,
});

async function connectDB() {
  let attempts = 10;

  while (attempts > 0) {
    try {
      const conn = await pool.getConnection();

      console.log("✅ MySQL connected successfully");

      conn.release();

      return true;
    } catch (error) {
      attempts--;

      console.log(
        `❌ MySQL connection failed. Retrying... (${10 - attempts}/10)`
      );

      console.log(error.message);

      if (attempts === 0) {
        console.error("❌ Could not connect to MySQL");
        return false;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 3000)
      );
    }
  }
}

module.exports = {
  pool,
  connectDB,
};