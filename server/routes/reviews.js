const express = require("express");
const router = express.Router();

const { pool } = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// =====================================================
// POST /api/reviews
// Submit a review for a completed session
// =====================================================
router.post("/", verifyToken, async (req, res) => {
  const reviewer_id = req.user.id;

  const {
    session_id,
    rating,
    comment = "",
  } = req.body;

  if (!session_id || rating === undefined || rating === null) {
    return res.status(400).json({
      message: "session_id and rating are required.",
    });
  }

  const numericRating = Number(rating);

  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return res.status(400).json({
      message: "Rating must be an integer between 1 and 5.",
    });
  }

  try {
    // -------------------------------------------------
    // 1. Get the session
    // -------------------------------------------------
    const [sessions] = await pool.query(
      `
      SELECT
        id,
        student_id,
        tutor_id,
        status
      FROM sessions
      WHERE id = ?
      `,
      [session_id]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        message: "Session not found.",
      });
    }

    const session = sessions[0];

    // -------------------------------------------------
    // 2. Only the student can review the tutor
    // -------------------------------------------------
    if (Number(session.student_id) !== Number(reviewer_id)) {
      return res.status(403).json({
        message: "Only the student who attended this session can review it.",
      });
    }

    // -------------------------------------------------
    // 3. Only completed sessions can be reviewed
    // -------------------------------------------------
    if (session.status !== "completed") {
      return res.status(400).json({
        message: "You can review only completed sessions.",
      });
    }

    // -------------------------------------------------
    // 4. Prevent duplicate reviews
    // -------------------------------------------------
    const [existingReviews] = await pool.query(
      `
      SELECT id
      FROM reviews
      WHERE session_id = ?
        AND reviewer_id = ?
      `,
      [session_id, reviewer_id]
    );

    if (existingReviews.length > 0) {
      return res.status(409).json({
        message: "You have already reviewed this session.",
      });
    }

    // -------------------------------------------------
    // 5. Insert review
    // reviewee_id is taken from the actual session tutor
    // -------------------------------------------------
    const cleanComment =
      typeof comment === "string" ? comment.trim() : "";

    await pool.query(
      `
      INSERT INTO reviews
        (session_id, reviewer_id, reviewee_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        session_id,
        reviewer_id,
        session.tutor_id,
        numericRating,
        cleanComment || null,
      ]
    );

    // -------------------------------------------------
    // 6. Update tutor skill score
    // Average rating × 100
    // Example: 4.5 rating = 450 skill_score
    // -------------------------------------------------
    const [avgResult] = await pool.query(
      `
      SELECT ROUND(AVG(rating) * 100) AS score
      FROM reviews
      WHERE reviewee_id = ?
      `,
      [session.tutor_id]
    );

    await pool.query(
      `
      UPDATE users
      SET skill_score = ?
      WHERE id = ?
      `,
      [
        avgResult[0].score || 0,
        session.tutor_id,
      ]
    );

    res.status(201).json({
      message: "Review submitted successfully.",
    });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);

    // Duplicate protection at database level
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "You have already reviewed this session.",
      });
    }

    res.status(500).json({
      message: "Server error while submitting review.",
    });
  }
});

// =====================================================
// GET /api/reviews/user/:id
// Get reviews received by a user
// =====================================================
router.get("/user/:id", async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `
      SELECT
        r.id,
        r.session_id,
        r.reviewer_id,
        r.reviewee_id,
        r.rating,
        r.comment,
        r.created_at,
        u.full_name AS reviewer_name,
        u.avatar_url AS reviewer_avatar
      FROM reviews r
      JOIN users u
        ON u.id = r.reviewer_id
      WHERE r.reviewee_id = ?
      ORDER BY r.created_at DESC
      `,
      [req.params.id]
    );

    res.json(reviews);
  } catch (error) {
    console.error("GET USER REVIEWS ERROR:", error);

    res.status(500).json({
      message: "Server error while fetching reviews.",
    });
  }
});

// =====================================================
// GET /api/reviews/user/:id/summary
// Get average rating and review count
// =====================================================
router.get("/user/:id/summary", async (req, res) => {
  try {
    const [result] = await pool.query(
      `
      SELECT
        ROUND(AVG(rating), 1) AS average_rating,
        COUNT(*) AS review_count
      FROM reviews
      WHERE reviewee_id = ?
      `,
      [req.params.id]
    );

    res.json({
      average_rating: result[0].average_rating || 0,
      review_count: result[0].review_count || 0,
    });
  } catch (error) {
    console.error("GET RATING SUMMARY ERROR:", error);

    res.status(500).json({
      message: "Server error while fetching rating summary.",
    });
  }
});

// =====================================================
// GET /api/reviews/session/:sessionId
// Check whether the logged-in student reviewed a session
// =====================================================
router.get("/session/:sessionId", verifyToken, async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `
      SELECT
        id,
        session_id,
        reviewer_id,
        reviewee_id,
        rating,
        comment,
        created_at
      FROM reviews
      WHERE session_id = ?
        AND reviewer_id = ?
      `,
      [req.params.sessionId, req.user.id]
    );

    res.json(reviews[0] || null);
  } catch (error) {
    console.error("GET SESSION REVIEW ERROR:", error);

    res.status(500).json({
      message: "Server error while checking session review.",
    });
  }
});

module.exports = router;