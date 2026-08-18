const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function seedAdmin() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const email = "admin@skillsync.com";
  const password = "Admin@123";
  const name = "SkillSync Admin";

  try {
    const [existingUser] = await db.execute(
      "SELECT id, email, role FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      console.log(" Admin already exists");
      console.log(existingUser[0]);

      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO users
       (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, "admin"]
    );

    console.log(" Admin seeded successfully");
    console.log("ID:", result.insertId);
    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    console.error(" Seed failed:", error);
  } finally {
    await db.end();
  }
}

seedAdmin();