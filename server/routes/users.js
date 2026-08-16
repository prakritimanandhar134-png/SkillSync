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
             u.bio, u.location, u.avatar_url, u.skill_score,
             u.is_online, u.created_at,
             ROUND(AVG(r.rating),1) AS avg_rating,
             COUNT(DISTINCT s.id) AS session_count
      FROM users u
      LEFT JOIN sessions s
        ON s.tutor_id = u.id AND s.status='completed'
      LEFT JOIN reviews r
        ON r.reviewee_id = u.id
      WHERE u.id = ?
      GROUP BY u.id
    `, [req.params.id]);

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    // Skills they teach
    const [teaches] = await db.query(`
      SELECT
        us.id,
        us.level,
        s.id AS skill_id,
        s.name,
        s.category
      FROM user_skills us
      JOIN skills s ON s.id = us.skill_id
      WHERE us.user_id = ?
      AND us.type = 'teach'
    `, [req.params.id]);

    // Skills they want to learn
    const [wants] = await db.query(`
      SELECT
        us.id,
        us.level,
        s.id AS skill_id,
        s.name,
        s.category
      FROM user_skills us
      JOIN skills s ON s.id = us.skill_id
      WHERE us.user_id = ?
      AND us.type = 'learn'
    `, [req.params.id]);

    res.json({
      ...users[0],
      teaches,
      wants,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error."
    });
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


// ── ADD skill to learn ────────────────────────
// POST /api/users/skills/learn


// POST /api/users/avatar
router.post("/avatar", verifyToken, async (req, res) => {
  const { avatar_url } = req.body;

  try {
    await db.query(
      "UPDATE users SET avatar_url = ? WHERE id = ?",
      [avatar_url, req.user.id]
    );

    res.json({
      message: "Avatar updated.",
      avatar_url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error."
    });
  }
});

module.exports = router;
