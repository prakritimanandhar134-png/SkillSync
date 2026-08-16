const cron = require("node-cron");
const db   = require("../config/db");
const { sendAutoRejectionEmail } = require("../config/email");

// Runs every hour — checks for expired session requests
const startAutoRejectCron = () => {
 cron.schedule("0 * * * *", async () => {
    console.log("⏰ Running auto-reject check...");

    try {
      // Find all requested sessions that have passed expiry time
      const [expired] = await db.query(`
        SELECT s.*,
               sk.name AS skill_name,
               st.full_name AS student_name, st.email AS student_email,
               t.full_name AS tutor_name
        FROM sessions s
        JOIN skills sk ON sk.id = s.skill_id
        JOIN users  st ON st.id = s.student_id
        JOIN users   t ON t.id  = s.tutor_id
        WHERE s.status = 'requested'
          AND s.request_expires_at < NOW()
      `);

      for (const session of expired) {
        // Update status to rejected
      await db.query(
  `UPDATE sessions
   SET status='rejected',
       rejection_reason=?
   WHERE id=?
   AND status='requested'`,
  [
    "Auto-rejected: Tutor did not respond within 2 days.",
    session.id
  ]
);

        // Send auto-rejection email to student
        await sendAutoRejectionEmail({
          toEmail:     session.student_email,
          studentName: session.student_name,
          tutorName:   session.tutor_name,
          skillName:   session.skill_name,
        });

        console.log(`❌ Auto-rejected session ${session.id} — ${session.student_name} → ${session.tutor_name}`);
      }

      if (expired.length === 0) {
        console.log("✅ No expired requests found.");
      }

    } catch (err) {
      console.error("Auto-reject cron error:", err.message);
    }
  });

  console.log("✅ Auto-reject cron job started — runs every hour");
};

module.exports = startAutoRejectCron;
