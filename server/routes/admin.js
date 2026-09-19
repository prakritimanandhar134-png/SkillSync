const express = require("express");
const router  = express.Router();
const { pool }  = require("../config/db");
const { verifyAdmin } = require("../middleware/auth");

// All admin routes are protected by verifyAdmin middleware

// ── GET dashboard stats ───────────────────────
// GET /api/admin/stats
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    // ==============================
    // BASIC COUNTS
    // ==============================

    const [[{ total_users }]] = await pool.query(`
      SELECT COUNT(*) AS total_users
      FROM users
      WHERE role = 'user'
    `);

    const [[{ total_skills }]] = await pool.query(`
      SELECT COUNT(*) AS total_skills
      FROM skills
    `);

    const [[{ total_sessions }]] = await pool.query(`
      SELECT COUNT(*) AS total_sessions
      FROM sessions
    `);

    const [[{ pending_sessions }]] = await pool.query(`
      SELECT COUNT(*) AS pending_sessions
      FROM sessions
      WHERE status = 'pending'
    `);


    // ==============================
    // RECENT USERS
    // ==============================

    const [recentUsers] = await pool.query(`
      SELECT
        id,
        full_name,
        email,
        created_at
      FROM users
      WHERE role = 'user'
      ORDER BY created_at DESC
      LIMIT 5
    `);


    // ==============================
    // RECENT SKILLS
    // ==============================

    const [recentSkills] = await pool.query(`
      SELECT
        id,
        name,
        category,
        created_at
      FROM skills
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // User growth by month
    const [userGrowth] = await pool.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS count
      FROM users
      WHERE role = 'user'
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // Skills grouped by category
    const [skillsByCategory] = await pool.query(`
      SELECT
        category,
        COUNT(*) AS count
      FROM skills
      GROUP BY category
      ORDER BY count DESC
    `);

    // Sessions grouped by status
    const [sessionsByStatus] = await pool.query(`
      SELECT
        status,
        COUNT(*) AS count
      FROM sessions
      GROUP BY status
      ORDER BY count DESC
    `);
     
    

    // ==============================
    // RESPONSE
    // ==============================
   console.log("USER GROWTH:", userGrowth);
console.log("SKILLS BY CATEGORY:", skillsByCategory);
console.log("SESSIONS BY STATUS:", sessionsByStatus);

    res.json({
      total_users: Number(total_users),
      total_skills: Number(total_skills),
      total_sessions: Number(total_sessions),
      pending_sessions: Number(pending_sessions),

      recentUsers,
      recentSkills,

      skillsByCategory,
      sessionsByStatus,
      userGrowth
    });

  } catch (err) {

    console.error("ADMIN STATS ERROR:", err);

    res.status(500).json({
      message: "Server error.",
      error: err.message
    });
  }
});

// ── GET all users ─────────────────────────────
// GET /api/admin/users
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(`
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
  console.error("ADMIN USERS ERROR:", err);
  res.status(500).json({
    message: "Server error.",
    error: err.message
  });
}
});

// ── DELETE a user ─────────────────────────────
// DELETE /api/admin/users/:id
router.delete("/users/:id", verifyAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = ? AND role != 'admin'", [req.params.id]);
    res.json({ message: "User deleted." });
  } catch (err) {
    console.error("ADMIN DELETE USER ERROR:", err);
    res.status(500).json({
      message: "Server error.",
      error: err.message
    });
  }
});

// ── GET all sessions ──────────────────────────
// GET /api/admin/sessions
router.get("/sessions", verifyAdmin, async (req, res) => {
  try {
    const [sessions] = await pool.query(`
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
  console.error("ADMIN SESSIONS ERROR:", err);
  res.status(500).json({
    message: "Server error.",
    error: err.message
  });
}
  });

module.exports = router;

