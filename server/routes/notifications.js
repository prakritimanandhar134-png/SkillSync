const express = require("express");
const router = express.Router();
const { pool} = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// GET my notifications
router.get("/", verifyToken, async (req, res) => {
  try {
    const [notifications] = await pool.query(
      `
      SELECT
        id,
        type,
        title,
        message,
        reference_id,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 30
      `,
      [req.user.id]
    );

    res.json(notifications);

  } catch (err) {
    console.error("Get notifications error:", err);

    res.status(500).json({
      message: "Server error."
    });
  }
});

// GET unread count
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM notifications
      WHERE user_id = ?
      AND is_read = 0
      `,
      [req.user.id]
    );

    res.json({
      count: rows[0].count
    });

  } catch (err) {
    console.error("Unread count error:", err);

    res.status(500).json({
      message: "Server error."
    });
  }
});

// Mark one notification as read
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ?
      AND user_id = ?
      `,
      [req.params.id, req.user.id]
    );

    res.json({
      message: "Notification marked as read."
    });

  } catch (err) {
    console.error("Mark notification error:", err);

    res.status(500).json({
      message: "Server error."
    });
  }
});

// Mark all as read
router.put("/read-all", verifyToken, async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE user_id = ?
      `,
      [req.user.id]
    );

    res.json({
      message: "All notifications marked as read."
    });

  } catch (err) {
    console.error("Mark all notifications error:", err);

    res.status(500).json({
      message: "Server error."
    });
  }
});

module.exports = router;