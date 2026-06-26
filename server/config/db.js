const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "skillsync",
  waitForConnections: true,
  connectionLimit: 10,
});

// Test connection
pool.getConnection()
  .then(conn => {
    console.log("✅ MySQL connected successfully");
    conn.release();
  })
  .catch(err => console.error("❌ MySQL connection failed:", err.message));

module.exports = pool;
