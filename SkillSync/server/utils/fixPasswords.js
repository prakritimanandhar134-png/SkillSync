// ── One-time script to hash any plain-text passwords in the DB ──
// Run this with: node utils/fixPasswords.js

const bcrypt = require("bcryptjs");
const db = require("../config/db");

async function fixPasswords() {
  const [users] = await db.query("SELECT id, email, password FROM users");

  let fixedCount = 0;

  for (const u of users) {
    const isHashed = u.password.startsWith("$2a$") || u.password.startsWith("$2b$");

    if (!isHashed) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, u.id]);
      console.log(`🔒 Fixed password for: ${u.email}`);
      fixedCount++;
    }
  }

  console.log(`\n✅ Done! Fixed ${fixedCount} insecure password(s).`);
  console.log(`Note: All these users' original passwords still work the same way for login.`);
  process.exit();
}

fixPasswords();
