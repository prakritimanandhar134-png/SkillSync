const express = require("express");
const router  = express.Router();
const db      = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const { sendAcceptedEmail, sendRejectedEmail } = require("../utils/emailService");

// ── SEND a barter request ─────────────────────
// POST /api/barter
// body: { receiver_id, requester_skill, receiver_skill, message, course_duration }
router.post("/", verifyToken, async (req, res) => {
  const { receiver_id, requester_skill, receiver_skill, message, course_duration } = req.body;
  const requester_id = req.user.id;

  if (!receiver_id || !requester_skill || !receiver_skill) {
    return res.status(400).json({ message: "receiver_id, requester_skill and receiver_skill are required." });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO barter_requests 
       (requester_id, receiver_id, requester_skill, receiver_skill, message, course_duration, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [requester_id, receiver_id, requester_skill, receiver_skill, message || null, course_duration || "1 Session"]
    );

    res.status(201).json({
      message: "Barter request sent! It will auto-expire in 3 days if not responded to.",
      request_id: result.insertId,
    });
  } catch (err) {
    console.error("Barter request error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET my barter requests (sent + received) ──
// GET /api/barter/my
router.get("/my", verifyToken, async (req, res) => {
  try {
    const [requests] = await db.query(`
      SELECT br.*,
             req.full_name AS requester_name, req.avatar_url AS requester_avatar,
             rec.full_name AS receiver_name,  rec.avatar_url AS receiver_avatar,
             sk1.name AS requester_skill_name,
             sk2.name AS receiver_skill_name,
             DATEDIFF(DATE_ADD(br.created_at, INTERVAL 3 DAY), NOW()) AS days_left
      FROM barter_requests br
      JOIN users  req ON req.id = br.requester_id
      JOIN users  rec ON rec.id = br.receiver_id
      JOIN skills sk1 ON sk1.id = br.requester_skill
      JOIN skills sk2 ON sk2.id = br.receiver_skill
      WHERE br.requester_id = ? OR br.receiver_id = ?
      ORDER BY br.created_at DESC
    `, [req.user.id, req.user.id]);

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── ACCEPT a barter request ───────────────────
// PUT /api/barter/:id/accept
router.put("/:id/accept", verifyToken, async (req, res) => {
  try {
    // Get full request details for the email
    const [rows] = await db.query(`
      SELECT br.*, 
             req.full_name AS requester_name, req.email AS requester_email,
             rec.full_name AS receiver_name,  rec.email AS receiver_email,
             sk1.name AS requester_skill_name
      FROM barter_requests br
      JOIN users  req ON req.id = br.requester_id
      JOIN users  rec ON rec.id = br.receiver_id
      JOIN skills sk1 ON sk1.id = br.requester_skill
      WHERE br.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ message: "Request not found." });
    const request = rows[0];

    // Only the receiver can accept
    if (request.receiver_id !== req.user.id) {
      return res.status(403).json({ message: "Only the receiver can accept this request." });
    }

    // Update status
    await db.query(
      "UPDATE barter_requests SET status = 'accepted', responded_at = NOW() WHERE id = ?",
      [req.params.id]
    );

    // Send acceptance email to requester (don't block response if email fails)
    sendAcceptedEmail(
      request.requester_email,
      request.requester_name,
      request.receiver_name,
      request.requester_skill_name,
      request.course_duration
    ).catch(err => console.error("Email error:", err.message));

    res.json({ message: "Barter request accepted! Email notification sent." });
  } catch (err) {
    console.error("Accept error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ── REJECT a barter request (reason required) ─
// PUT /api/barter/:id/reject
// body: { reason }
router.put("/:id/reject", verifyToken, async (req, res) => {
  const { reason } = req.body;

  if (!reason || reason.trim().length < 3) {
    return res.status(400).json({ message: "A rejection reason is required (min 3 characters)." });
  }

  try {
    const [rows] = await db.query(`
      SELECT br.*, 
             req.full_name AS requester_name, req.email AS requester_email,
             rec.full_name AS receiver_name,
             sk1.name AS requester_skill_name
      FROM barter_requests br
      JOIN users  req ON req.id = br.requester_id
      JOIN users  rec ON rec.id = br.receiver_id
      JOIN skills sk1 ON sk1.id = br.requester_skill
      WHERE br.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ message: "Request not found." });
    const request = rows[0];

    if (request.receiver_id !== req.user.id) {
      return res.status(403).json({ message: "Only the receiver can reject this request." });
    }

    await db.query(
      "UPDATE barter_requests SET status = 'rejected', reject_reason = ?, responded_at = NOW() WHERE id = ?",
      [reason, req.params.id]
    );

    // Send rejection email with reason
    sendRejectedEmail(
      request.requester_email,
      request.requester_name,
      request.receiver_name,
      request.requester_skill_name,
      reason
    ).catch(err => console.error("Email error:", err.message));

    res.json({ message: "Request rejected. Reason sent to requester via email." });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
