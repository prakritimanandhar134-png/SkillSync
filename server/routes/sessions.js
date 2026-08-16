const express  = require("express");
const router   = express.Router();
const db       = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const { sendEmail } = require("../utils/sendEmail");

const generateMeetLink = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const rand  = (n) => Array.from({length:n}, () => chars[Math.floor(Math.random()*26)]).join("");
  return `https://meet.google.com/${rand(3)}-${rand(4)}-${rand(3)}`;
};

// REQUEST a session
router.post("/request", verifyToken, async (req, res) => {
  console.log("========== SESSION REQUEST ==========");
console.log("User:", req.user);
console.log("Body:", req.body);
  const { tutor_id, skill_id, scheduled_at, topic, is_barter, duration_weeks, duration_months, hours_per_day } = req.body;
  const student_id = req.user.id;

  if (!tutor_id || !skill_id || !scheduled_at) return res.status(400).json({ message: "tutor_id, skill_id and scheduled_at are required." });
  if (!hours_per_day) return res.status(400).json({ message: "hours_per_day is required." });
  if (!duration_weeks && !duration_months) return res.status(400).json({ message: "Duration is required." });

  try {
    const expiresAt = new Date();
   expiresAt.setDate(expiresAt.getDate() + 2
);
    let barterValid = false;
    let amount = 0;

    // CHECK FOR OVERLAPPING BOOKING
const [existingSessions] = await db.query(
  `SELECT id, student_id, status, scheduled_at
   FROM sessions
   WHERE tutor_id = ?
   AND scheduled_at = ?
   AND status IN ('requested', 'upcoming')`,
  [tutor_id, scheduled_at]
);

if (existingSessions.length > 0) {
  return res.status(409).json({
    message: "This tutor is already booked for this date and time."
  });
}

    if (is_barter) {
  // Tutor teaches skills
  const [tT] = await db.query(
    "SELECT skill_id FROM user_skills WHERE user_id=? AND type='teach'",
    [tutor_id]
  );

  // Student wants to learn
  const [sW] = await db.query(
    "SELECT skill_id FROM user_skills WHERE user_id=? AND type='learn'",
    [student_id]
  );

  // Student teaches skills
  const [sT] = await db.query(
    "SELECT skill_id FROM user_skills WHERE user_id=? AND type='teach'",
    [student_id]
  );

  // Tutor wants to learn
  const [tW] = await db.query(
    "SELECT skill_id FROM user_skills WHERE user_id=? AND type='learn'",
    [tutor_id]
  );

  const tutorTeachesStudentWants = tT.some(t =>
    sW.some(s => s.skill_id === t.skill_id)
  );

  const studentTeachesTutorWants = sT.some(s =>
    tW.some(t => t.skill_id === s.skill_id)
  );

  barterValid = tutorTeachesStudentWants && studentTeachesTutorWants;

    } else {
   const [rates] = await db.query(
  "SELECT hourly_rate FROM user_skills WHERE user_id=? AND skill_id=? AND type='teach'",
  [tutor_id, skill_id]
);
      amount = rates.length > 0 ? rates[0].hourly_rate : 0;
    }

    const [result] = await db.query(
      `INSERT INTO sessions (tutor_id,student_id,skill_id,scheduled_at,topic,is_barter,amount,duration_weeks,duration_months,hours_per_day,request_expires_at,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,'requested')`,
      [tutor_id,student_id,skill_id,scheduled_at,topic||null,barterValid,amount,duration_weeks||null,duration_months||null,hours_per_day,expiresAt]
    );

    const [tutorRows] = await db.query("SELECT full_name, email FROM users WHERE id=?", [tutor_id]);
    const [studentRows] = await db.query("SELECT full_name, email FROM users WHERE id=?", [student_id]);
    const [skillRows] = await db.query("SELECT name FROM skills WHERE id=?", [skill_id]);

    if (tutorRows.length > 0 && studentRows.length > 0 && skillRows.length > 0) {
      try {
        await sendEmail({
          to: tutorRows[0].email,
          replyTo: studentRows[0].email,
          subject: "New Session Booking",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>New session booking request</h2>
              <p><strong>${studentRows[0].full_name}</strong> wants to book a session with you.</p>
              <p><strong>Skill:</strong> ${skillRows[0].name}</p>
              <p><strong>Date:</strong> ${new Date(scheduled_at).toString()}</p>
              <p><strong>Details:</strong> ${topic || "No additional details provided"}</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error("Booking request email failed:", emailErr);
      }
    }

    res.status(201).json({ message:"Session request sent! Waiting for tutor to accept.", session_id:result.insertId, is_barter:barterValid, amount, expires_at:expiresAt });
} catch (err) {
  console.error("❌ SESSION REQUEST ERROR:");
  console.error(err);
  console.error("SQL ERROR MESSAGE:", err.message);
  console.error("SQL ERROR CODE:", err.code);
  console.error("SQL ERROR SQL:", err.sql);

  res.status(500).json({
    message: err.message || "Server error.",
    code: err.code || null
  });
}
});

// ACCEPT a session
router.put("/:id/accept", verifyToken, async (req, res) => {
  try {
    const meet_link = generateMeetLink();
    const [sessions] = await db.query(`
      SELECT s.*, sk.name AS skill_name,
             st.full_name AS student_name, st.email AS student_email,
             t.full_name AS tutor_name
      FROM sessions s
      JOIN skills sk ON sk.id=s.skill_id
      JOIN users st ON st.id=s.student_id
      JOIN users t ON t.id=s.tutor_id
      WHERE s.id=? AND s.tutor_id=? AND s.status='requested'
    `, [req.params.id, req.user.id]);

    if (sessions.length===0) return res.status(404).json({ message:"Session not found." });
    const session = sessions[0];

    await db.query("UPDATE sessions SET status='upcoming', meet_link=? WHERE id=?", [meet_link, req.params.id]);

    try {
      await sendEmail({
        to: session.student_email,
        subject: "Your session booking has been accepted",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Session confirmed</h2>
            <p>${session.tutor_name} has accepted your request for <strong>${session.skill_name}</strong>.</p>
            <p><strong>Date:</strong> ${new Date(session.scheduled_at).toString()}</p>
            <p><strong>Meet link:</strong> <a href="${meet_link}">${meet_link}</a></p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error("Acceptance email failed:", emailErr);
    }

    res.json({ message:"Session accepted! Email sent to student.", meet_link });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:"Server error." });
  }
});

// REJECT a session
router.put("/:id/reject", verifyToken, async (req, res) => {
  const { reason } = req.body;
  if (!reason || reason.trim()==="") return res.status(400).json({ message:"Rejection reason is required." });

  try {
    const [sessions] = await db.query(`
      SELECT s.*, sk.name AS skill_name,
             st.full_name AS student_name, st.email AS student_email,
             t.full_name AS tutor_name
      FROM sessions s
      JOIN skills sk ON sk.id=s.skill_id
      JOIN users st ON st.id=s.student_id
      JOIN users t ON t.id=s.tutor_id
      WHERE s.id=? AND s.tutor_id=? AND s.status='requested'
    `, [req.params.id, req.user.id]);

    if (sessions.length===0) return res.status(404).json({ message:"Session not found." });
    const session = sessions[0];

    await db.query("UPDATE sessions SET status='rejected', rejection_reason=? WHERE id=?", [reason, req.params.id]);

    try {
      await sendEmail({
        to: session.student_email,
        subject: "Your session request was not accepted",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Session request update</h2>
            <p>${session.tutor_name} could not accept your request for <strong>${session.skill_name}</strong>.</p>
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error("Rejection email failed:", emailErr);
    }

    res.json({ message:"Session rejected. Student notified by email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:"Server error." });
  }
});

// GET my sessions
router.get("/my", verifyToken, async (req, res) => {
  try {
    const [sessions] = await db.query(`
      SELECT s.*, sk.name AS skill_name,
             t.full_name AS tutor_name, t.avatar_url AS tutor_avatar,
             st.full_name AS student_name, st.avatar_url AS student_avatar
      FROM sessions s
      JOIN skills sk ON sk.id=s.skill_id
      JOIN users t ON t.id=s.tutor_id
      JOIN users st ON st.id=s.student_id
      WHERE s.tutor_id=? OR s.student_id=?
      ORDER BY s.scheduled_at DESC
    `, [req.user.id, req.user.id]);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message:"Server error." });
  }
});

// GET pending requests for tutor
router.get("/pending", verifyToken, async (req, res) => {
  try {
    const [sessions] = await db.query(`
      SELECT s.*, sk.name AS skill_name,
             st.full_name AS student_name, st.email AS student_email,
             st.university, st.year
      FROM sessions s
      JOIN skills sk ON sk.id=s.skill_id
      JOIN users st ON st.id=s.student_id
      WHERE s.tutor_id=? AND s.status='requested'
      ORDER BY s.created_at ASC
    `, [req.user.id]);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message:"Server error." });
  }
});

module.exports = router;
