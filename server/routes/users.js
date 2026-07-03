const express = require("express");
const router  = express.Router();
const db      = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// ── GET all users (public listing) ───────────
// GET /api/users
router.get("/", async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT u.id, u.full_name, u.email, u.university, u.year,
             u.bio, u.avatar_url, u.skill_score, u.is_online,
             ROUND(AVG(r.rating), 1) AS avg_rating,
             COUNT(DISTINCT s.id)    AS session_count
      FROM users u
      LEFT JOIN sessions s ON s.tutor_id = u.id AND s.status = 'completed'
      LEFT JOIN reviews  r ON r.reviewee_id = u.id
      WHERE u.role = 'user'
      GROUP BY u.id
      ORDER BY avg_rating DESC
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET single user profile ───────────────────
// GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT u.id, u.full_name, u.email, u.university, u.year,
             u.bio, u.location, u.avatar_url, u.skill_score, u.is_online, u.created_at,
             ROUND(AVG(r.rating), 1) AS avg_rating,
             COUNT(DISTINCT s.id)    AS session_count
      FROM users u
      LEFT JOIN sessions s ON s.tutor_id = u.id AND s.status = 'completed'
      LEFT JOIN reviews  r ON r.reviewee_id = u.id
      WHERE u.id = ?
      GROUP BY u.id
    `, [req.params.id]);

    if (users.length === 0) return res.status(404).json({ message: "User not found." });

    // Get skills they teach
    const [teaches] = await db.query(`
      SELECT s.id, s.name, s.category, ust.proficiency, ust.hourly_rate
      FROM user_skills_teach ust
      JOIN skills s ON s.id = ust.skill_id
      WHERE ust.user_id = ?
    `, [req.params.id]);

    // Get skills they want to learn
    const [wants] = await db.query(`
      SELECT s.id, s.name, s.category
      FROM user_skills_learn usl
      JOIN skills s ON s.id = usl.skill_id
      WHERE usl.user_id = ?
    `, [req.params.id]);

    res.json({ ...users[0], teaches, wants });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── UPDATE user profile ───────────────────────
// PUT /api/users/profile
router.put("/profile", verifyToken, async (req, res) => {
  const { full_name, university, year, bio, location } = req.body;
  try {
    await db.query(
      "UPDATE users SET full_name=?, university=?, year=?, bio=?, location=? WHERE id=?",
      [full_name, university, year, bio, location, req.user.id]
    );
    res.json({ message: "Profile updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── ADD skill to teach ────────────────────────
// POST /api/users/skills/teach
router.post("/skills/teach", verifyToken, async (req, res) => {
  const { skill_id, proficiency, hourly_rate } = req.body;
  try {
    await db.query(
      "INSERT IGNORE INTO user_skills_teach (user_id, skill_id, proficiency, hourly_rate) VALUES (?,?,?,?)",
      [req.user.id, skill_id, proficiency || "Intermediate", hourly_rate || 0]
    );
    res.json({ message: "Skill added to teach list." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── ADD skill to learn ────────────────────────
// POST /api/users/skills/learn
router.post("/skills/learn", verifyToken, async (req, res) => {
  const { skill_id } = req.body;
  try {
    await db.query(
      "INSERT IGNORE INTO user_skills_learn (user_id, skill_id) VALUES (?,?)",
      [req.user.id, skill_id]
    );
    res.json({ message: "Skill added to learn list." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
