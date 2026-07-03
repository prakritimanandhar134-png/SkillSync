// ── Utility script to verify if passwords are properly hashed ──
// Run this with: node utils/checkPassword.js

const bcrypt = require("bcryptjs");
const db = require("../config/db");

async function checkPasswords() {
  const [users] = await db.query("SELECT id, email, password FROM users");

  console.log("\n🔍 Checking password security for all users:\n");

  users.forEach(u => {
    const isHashed = u.password.startsWith("$2a$") || u.password.startsWith("$2b$");
    console.log(`${isHashed ? "✅" : "❌"} ${u.email} — ${isHashed ? "Properly hashed" : "PLAIN TEXT - INSECURE!"}`);
  });

  process.exit();
}

checkPasswords();
