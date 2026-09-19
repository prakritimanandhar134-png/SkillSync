const express = require("express");
const router = express.Router();

const { pool } = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// Get unread message counts for the logged-in user
router.get("/unread/counts", verifyToken, async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const [rows] = await pool.query(
      `
      SELECT sender_id, COUNT(*) AS unread_count
      FROM messages
      WHERE receiver_id = ? AND is_read = 0
      GROUP BY sender_id
      `,
      [currentUserId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error loading unread counts:", error);
    res.status(500).json({
      message: "Server error while loading unread counts.",
    });
  }
});
// ─────────────────────────────────────────────
// GET conversation with another user
// GET /api/messages/:userId
// ─────────────────────────────────────────────
router.get("/:userId", verifyToken, async (req, res) => {
  const currentUserId = req.user.id;
  const otherUserId = Number(req.params.userId);

  if (!Number.isInteger(otherUserId)) {
    return res.status(400).json({
      message: "Invalid user ID.",
    });
  }

  try {
    const [messages] = await pool.query(
      `
      SELECT
        m.id,
        m.sender_id,
        m.receiver_id,
        m.message,
        m.is_read,
        m.created_at
      FROM messages m
      WHERE
        (m.sender_id = ? AND m.receiver_id = ?)
        OR
        (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC, m.id ASC
      `,
      [
        currentUserId,
        otherUserId,
        otherUserId,
        currentUserId,
      ]
    );

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      message: "Server error while loading messages.",
    });
  }
});

// ─────────────────────────────────────────────
// SEND a new message
// POST /api/messages
// ─────────────────────────────────────────────
router.post("/", verifyToken, async (req, res) => {
  const senderId = req.user.id;
  const { receiver_id, message } = req.body;

  const receiverId = Number(receiver_id);
  const cleanMessage = String(message || "").trim();

  if (!Number.isInteger(receiverId)) {
    return res.status(400).json({
      message: "A valid receiver ID is required.",
    });
  }

  if (!cleanMessage) {
    return res.status(400).json({
      message: "Message cannot be empty.",
    });
  }

  if (receiverId === senderId) {
    return res.status(400).json({
      message: "You cannot send a message to yourself.",
    });
  }

  try {
    // Check whether the receiver exists
    const [users] = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = ? AND role = 'user'
      `,
      [receiverId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "Receiver not found.",
      });
    }

    const [result] = await pool.query(
  `
  INSERT INTO messages
    (sender_id, receiver_id, message, is_read)
  VALUES (?, ?, ?, 0)
  `,
  [
    senderId,
    receiverId,
    cleanMessage,
  ]
);

    const [newMessages] = await pool.query(
      `
      SELECT
        id,
        sender_id,
        receiver_id,
        message,
        is_read,
        created_at
      FROM messages
      WHERE id = ?
      `,
      [result.insertId]
    );

    res.status(201).json(newMessages[0]);
  } catch (error) {
    console.error("Send message error:", error);

    res.status(500).json({
      message: "Server error while sending message.",
    });
  }
});

// ─────────────────────────────────────────────
// MARK received messages as read
// PATCH /api/messages/:userId/read
// ─────────────────────────────────────────────
router.patch("/:userId/read", verifyToken, async (req, res) => {
  const currentUserId = req.user.id;
  const senderId = Number(req.params.userId);

  if (!Number.isInteger(senderId)) {
    return res.status(400).json({
      message: "Invalid user ID.",
    });
  }

  try {
    await pool.query(
      `
      UPDATE messages
      SET is_read = 1
      WHERE
        sender_id = ?
        AND receiver_id = ?
        AND is_read = 0
      `,
      [
        senderId,
        currentUserId,
      ]
    );

    res.json({
      message: "Messages marked as read.",
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);

    res.status(500).json({
      message: "Server error while marking messages as read.",
    });
  }
});

module.exports = router;