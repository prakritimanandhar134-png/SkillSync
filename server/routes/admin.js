const express = require("express");
const router  = express.Router();
const db      = require("../config/db");
const { verifyAdmin } = require("../middleware/auth");

// All admin routes are protected by verifyAdmin middleware

// ── GET dashboard stats ───────────────────────
// GET /api/admin/stats
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    const [[{ total_users }]]    = await db.query("SELECT COUNT(*) AS total_users FROM users WHERE role='user'");
    const [[{ total_skills }]]   = await db.query("SELECT COUNT(*) AS total_skills FROM skills");
    const [[{ sessions_today }]] = await db.query("SELECT COUNT(*) AS sessions_today FROM sessions WHERE DATE(created_at) = CURDATE()");
    const [[{ avg_rating }]]     = await db.query("SELECT ROUND(AVG(rating),1) AS avg_rating FROM reviews");
    const [[{ exchange_rate }]]  = await db.query("SELECT ROUND(COUNT(CASE WHEN is_barter=1 THEN 1 END)/COUNT(*)*100) AS exchange_rate FROM sessions");

    res.json({ total_users, total_skills, sessions_today, avg_rating, exchange_rate });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET all users ─────────────────────────────
// GET /api/admin/users
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT u.id, u.full_name, u.email, u.role, u.university,
             u.skill_score, u.created_at,
             COUNT(DISTINCT s.id) AS session_count
      FROM users u
      LEFT JOIN sessions s ON s.tutor_id = u.id OR s.student_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── DELETE a user ─────────────────────────────
// DELETE /api/admin/users/:id
router.delete("/users/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = ? AND role != 'admin'", [req.params.id]);
    res.json({ message: "User deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET all sessions ──────────────────────────
// GET /api/admin/sessions
router.get("/sessions", verifyAdmin, async (req, res) => {
  try {
    const [sessions] = await db.query(`
      SELECT s.*, sk.name AS skill_name,
             t.full_name AS tutor_name,
             st.full_name AS student_name
      FROM sessions s
      JOIN skills sk ON sk.id = s.skill_id
      JOIN users   t ON t.id  = s.tutor_id
      JOIN users  st ON st.id = s.student_id
      ORDER BY s.created_at DESC
      LIMIT 100
    `);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
