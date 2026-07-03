const cron = require("node-cron");
const db = require("../config/db");
const { sendAutoRejectedEmail } = require("./emailService");

// ── Runs every day at midnight to check for expired requests ──
function startAutoRejectJob() {
  // Cron format: minute hour day month weekday
  // "0 0 * * *" = runs every day at 00:00 (midnight)
  cron.schedule("0 0 * * *", async () => {
    console.log("🕐 Running daily auto-reject check...");
    await checkExpiredRequests();
  });

  // ALSO run once immediately when server starts (useful for testing)
  checkExpiredRequests();
}

async function checkExpiredRequests() {
  try {
    // Find all pending requests older than 3 days
    const [expiredRequests] = await db.query(`
      SELECT br.*, 
             req.full_name AS requester_name, req.email AS requester_email,
             rec.full_name AS receiver_name,  rec.email AS receiver_email,
             sk.name AS skill_name
      FROM barter_requests br
      JOIN users  req ON req.id = br.requester_id
      JOIN users  rec ON rec.id = br.receiver_id
      JOIN skills sk  ON sk.id  = br.requester_skill
      WHERE br.status = 'pending'
        AND br.created_at <= DATE_SUB(NOW(), INTERVAL 3 DAY)
    `);

    if (expiredRequests.length === 0) {
      console.log("✅ No expired requests found.");
      return;
    }

    for (const req of expiredRequests) {
      // Mark as auto-rejected
      await db.query(
        `UPDATE barter_requests 
         SET status = 'rejected', auto_rejected = TRUE, 
             reject_reason = 'No response within 3 days', responded_at = NOW()
         WHERE id = ?`,
        [req.id]
      );

      // Send email to the requester
      try {
        await sendAutoRejectedEmail(
          req.requester_email,
          req.requester_name,
          req.receiver_name,
          req.skill_name
        );
        console.log(`📧 Auto-reject email sent to ${req.requester_email}`);
      } catch (emailErr) {
        console.error("Email send failed:", emailErr.message);
      }
    }

    console.log(`✅ Auto-rejected ${expiredRequests.length} expired request(s).`);
  } catch (err) {
    console.error("Auto-reject job error:", err);
  }
}

module.exports = { startAutoRejectJob, checkExpiredRequests };
