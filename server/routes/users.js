const express = require("express");
const router  = express.Router();
const { pool }   = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// ── GET all users (public listing) ───────────
// GET /api/users
router.get("/", async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.university,
        u.year,
        u.bio,
        u.location,
        u.avatar_url,
        u.skill_score,
        u.is_online,

        u.available_days,
        u.class_start_time,
        u.class_end_time,
        u.hours_per_day,

        ROUND(AVG(r.rating), 1) AS avg_rating,
        COUNT(DISTINCT s.id) AS session_count

      FROM users u

      LEFT JOIN sessions s 
        ON s.tutor_id = u.id 
        AND s.status = 'completed'

      LEFT JOIN reviews r 
        ON r.reviewee_id = u.id

      WHERE u.role = 'user'

      GROUP BY u.id

      ORDER BY avg_rating DESC
    `);

    res.json(users);

  } catch (err) {
    console.error("Get all users error:", err);

    res.status(500).json({
      message: "Server error."
    });
  }
});
// ── GET single user profile ───────────────────
// GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    const [users] = await pool.query(`
       SELECT u.id, u.full_name, u.email, u.university, u.year,
         u.bio, u.location, u.avatar_url, u.skill_score,
         u.is_online,
         u.created_at,
         u.available_days,
         u.class_start_time,
         u.class_end_time,
         u.hours_per_day,
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
    const [teaches] = await pool.query(`
  SELECT
    ust.id,
    ust.skill_id,
    ust.proficiency AS level,
    ust.proficiency,
    ust.hourly_rate,
    s.name,
    s.category
  FROM user_skills_teach ust
  JOIN skills s
    ON s.id = ust.skill_id
  WHERE ust.user_id = ?
`, [req.params.id]);

    // Skills they want to learn
    const [wants] = await pool.query(`
  SELECT
    usl.id,
    usl.skill_id,
    s.name,
    s.category
  FROM user_skills_learn usl
  JOIN skills s
    ON s.id = usl.skill_id
  WHERE usl.user_id = ?
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
// ── UPDATE user profile ───────────────────────
// PUT /api/users/profile
router.put("/profile", verifyToken, async (req, res) => {
  const {
  full_name,
  university,
  year,
  bio,
  location,
  available_days,
  class_start_time,
  class_end_time,
  hours_per_day
} = req.body;

  try {
    await pool.query(
      `UPDATE users
       SET full_name=?,
           university=?,
           year=?,
           bio=?,
           location=?,
           available_days=?,
           class_start_time = ?,
  class_end_time = ?,
  hours_per_day = ?
       WHERE id=?`,
      [
        full_name,
        university,
        year,
        bio,
        location,
        JSON.stringify(available_days || []),
         class_start_time,
  class_end_time,
  hours_per_day,
        req.user.id
      ]
    );

    res.json({
      message: "Profile updated successfully.",
      user: {
        full_name,
        university,
        year,
        bio,
        location,
        available_days: available_days || [],
       class_start_time,
      class_end_time,
  hours_per_day 
      }
    });

  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({
      message: "Server error."
    });
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
    await pool.query(
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
