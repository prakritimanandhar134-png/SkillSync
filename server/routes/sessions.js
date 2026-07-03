const express = require("express");
const router  = express.Router();
const db      = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// Generate a Google Meet-style link
const generateMeetLink = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const rand  = (n) => Array.from({length:n}, () => chars[Math.floor(Math.random()*chars.length)]).join("");
  return `https://meet.google.com/${rand(3)}-${rand(4)}-${rand(3)}`;
};

// ── BOOK a session ────────────────────────────
// POST /api/sessions
router.post("/", verifyToken, async (req, res) => {
  const { tutor_id, skill_id, scheduled_at, topic, is_barter } = req.body;
  const student_id = req.user.id;

  if (!tutor_id || !skill_id || !scheduled_at) {
    return res.status(400).json({ message: "tutor_id, skill_id and scheduled_at are required." });
  }

  try {
    // Check if barter is possible
    let barterValid = false;
    let amount = 0;

    if (is_barter) {
      // Check mutual skill overlap
      const [tutorTeaches] = await db.query(
        "SELECT skill_id FROM user_skills_teach WHERE user_id = ?", [tutor_id]
      );
      const [studentWants] = await db.query(
        "SELECT skill_id FROM user_skills_learn WHERE user_id = ?", [student_id]
      );
      const [studentTeaches] = await db.query(
        "SELECT skill_id FROM user_skills_teach WHERE user_id = ?", [student_id]
      );
      const [tutorWants] = await db.query(
        "SELECT skill_id FROM user_skills_learn WHERE user_id = ?", [tutor_id]
      );

      const tutorTeachIds   = tutorTeaches.map(r => r.skill_id);
      const studentWantIds  = studentWants.map(r => r.skill_id);
      const studentTeachIds = studentTeaches.map(r => r.skill_id);
      const tutorWantIds    = tutorWants.map(r => r.skill_id);

      const canTeachStudent = tutorTeachIds.some(id => studentWantIds.includes(id));
      const studentCanTeach = studentTeachIds.some(id => tutorWantIds.includes(id));

      barterValid = canTeachStudent && studentCanTeach;
      amount = 0; // free if barter
    } else {
      // Get tutor's hourly rate for this skill
      const [rates] = await db.query(
        "SELECT hourly_rate FROM user_skills_teach WHERE user_id = ? AND skill_id = ?",
        [tutor_id, skill_id]
      );
      amount = rates.length > 0 ? rates[0].hourly_rate : 0;
    }

    const meet_link = generateMeetLink();

    const [result] = await db.query(
      `INSERT INTO sessions (tutor_id, student_id, skill_id, scheduled_at, topic, meet_link, is_barter, amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tutor_id, student_id, skill_id, scheduled_at, topic || null, meet_link, barterValid, amount]
    );

    res.status(201).json({
      message: "Session booked successfully!",
      session_id: result.insertId,
      meet_link,
      is_barter: barterValid,
      amount,
    });

  } catch (err) {
    console.error("Session booking error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET my sessions ───────────────────────────
// GET /api/sessions/my
router.get("/my", verifyToken, async (req, res) => {
  try {
    const [sessions] = await db.query(`
      SELECT s.*, 
             sk.name AS skill_name,
             t.full_name AS tutor_name,   t.avatar_url AS tutor_avatar,
             st.full_name AS student_name, st.avatar_url AS student_avatar
      FROM sessions s
      JOIN skills sk ON sk.id = s.skill_id
      JOIN users   t ON t.id  = s.tutor_id
      JOIN users  st ON st.id = s.student_id
      WHERE s.tutor_id = ? OR s.student_id = ?
      ORDER BY s.scheduled_at DESC
    `, [req.user.id, req.user.id]);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── UPDATE session status ─────────────────────
// PUT /api/sessions/:id/status
router.put("/:id/status", verifyToken, async (req, res) => {
  const { status } = req.body;
  try {
    await db.query("UPDATE sessions SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: "Session status updated." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
