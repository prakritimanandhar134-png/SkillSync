const nodemailer = require("nodemailer");
require("dotenv").config();

// ── Gmail transporter ──
// To set this up:
// 1. Go to your Gmail account → Security
// 2. Enable 2-Step Verification
// 3. Search "App Passwords" → generate one for "Mail"
// 4. Paste that 16-digit password in .env as EMAIL_PASS
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Send barter request ACCEPTED email ──
async function sendAcceptedEmail(toEmail, toName, partnerName, skillName, duration) {
  const mailOptions = {
    from: `"SkillSync" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🎉 Your Skill Exchange Request was Accepted!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6C63FF, #4F46E5); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">SkillSync</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827;">Hi ${toName} 👋</h2>
          <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">
            Great news! <b>${partnerName}</b> has accepted your skill exchange request for 
            <b>${skillName}</b>.
          </p>
          <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">
            <b>Duration:</b> ${duration}
          </p>
          <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">
            Log in to SkillSync to schedule your first session and start exchanging skills!
          </p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="http://localhost:3000" style="background: #6C63FF; color: white; padding: 12px 28px; border-radius: 99px; text-decoration: none; font-weight: 600;">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// ── Send barter request REJECTED email ──
async function sendRejectedEmail(toEmail, toName, partnerName, skillName, reason) {
  const mailOptions = {
    from: `"SkillSync" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your Skill Exchange Request Update",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: #6B7280; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">SkillSync</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827;">Hi ${toName},</h2>
          <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">
            Unfortunately <b>${partnerName}</b> was unable to accept your request for 
            <b>${skillName}</b> at this time.
          </p>
          <p style="color: #4B5563; font-size: 15px; line-height: 1.6; background:#FEF2F2; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #EF4444;">
            <b>Reason:</b> ${reason}
          </p>
          <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">
            Don't worry — there are plenty of other tutors on SkillSync. Try browsing more matches!
          </p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="http://localhost:3000" style="background: #6C63FF; color: white; padding: 12px 28px; border-radius: 99px; text-decoration: none; font-weight: 600;">
              Find Another Match
            </a>
          </div>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// ── Send AUTO-REJECTED email (after 3 days no response) ──
async function sendAutoRejectedEmail(toEmail, toName, partnerName, skillName) {
  const mailOptions = {
    from: `"SkillSync" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your Skill Exchange Request Expired",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: #6B7280; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">SkillSync</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827;">Hi ${toName},</h2>
          <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">
            Your skill exchange request to <b>${partnerName}</b> for <b>${skillName}</b> 
            was automatically declined because there was no response within 3 days.
          </p>
          <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">
            Try reaching out to another tutor who might respond faster!
          </p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="http://localhost:3000" style="background: #6C63FF; color: white; padding: 12px 28px; border-radius: 99px; text-decoration: none; font-weight: 600;">
              Browse Tutors
            </a>
          </div>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendAcceptedEmail, sendRejectedEmail, sendAutoRejectedEmail };
