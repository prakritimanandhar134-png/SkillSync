const express = require("express");
const router  = express.Router();
const db      = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// ── POST a review ─────────────────────────────
// POST /api/reviews
router.post("/", verifyToken, async (req, res) => {
  const { session_id, reviewee_id, rating, comment } = req.body;
  const reviewer_id = req.user.id;

  if (!session_id || !reviewee_id || !rating) {
    return res.status(400).json({ message: "session_id, reviewee_id and rating are required." });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  try {
    await db.query(
      "INSERT INTO reviews (session_id, reviewer_id, reviewee_id, rating, comment) VALUES (?,?,?,?,?)",
      [session_id, reviewer_id, reviewee_id, rating, comment || null]
    );

    // Update skill_score of reviewee (avg rating × 100)
    const [avg] = await db.query(
      "SELECT ROUND(AVG(rating)*100) AS score FROM reviews WHERE reviewee_id = ?",
      [reviewee_id]
    );
    await db.query(
      "UPDATE users SET skill_score = ? WHERE id = ?",
      [avg[0].score || 0, reviewee_id]
    );

    res.status(201).json({ message: "Review submitted successfully." });
  } catch (err) {
    console.error("Review error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET reviews for a user ────────────────────
// GET /api/reviews/user/:id
router.get("/user/:id", async (req, res) => {
  try {
    const [reviews] = await db.query(`
      SELECT r.*, u.full_name AS reviewer_name, u.avatar_url AS reviewer_avatar
      FROM reviews r
      JOIN users u ON u.id = r.reviewer_id
      WHERE r.reviewee_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.id]);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
