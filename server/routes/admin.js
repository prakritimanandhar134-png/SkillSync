const express = require("express");
const router  = express.Router();
const db      = require("../config/db");
const { verifyAdmin } = require("../middleware/auth");

// All admin routes are protected by verifyAdmin middleware

// ── GET dashboard stats ───────────────────────
// GET /api/admin/stats
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    const [[{ total_users }]] = await db.query(
      "SELECT COUNT(*) AS total_users FROM users WHERE role='user'"
    );

    const [[{ total_skills }]] = await db.query(
      "SELECT COUNT(*) AS total_skills FROM skills"
    );

    const [[{ total_sessions }]] = await db.query(
      "SELECT COUNT(*) AS total_sessions FROM sessions"
    );

    const [[{ pending_sessions }]] = await db.query(
      "SELECT COUNT(*) AS pending_sessions FROM sessions WHERE status='pending'"
    );

    const [recentUsers] = await db.query(`
      SELECT id, full_name, email, created_at
      FROM users
      WHERE role='user'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const [recentSkills] = await db.query(`
      SELECT
        skills.id,
        skills.name,
        users.full_name
      FROM skills
      JOIN users ON users.id = skills.user_id
      ORDER BY skills.created_at DESC
      LIMIT 5
    `);

    res.json({
      total_users,
      total_skills,
      total_sessions,
      pending_sessions,
      recentUsers,
      recentSkills
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error."
    });
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
