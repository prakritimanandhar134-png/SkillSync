const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Send session accepted email ──────────────
const sendAcceptanceEmail = async ({ toEmail, studentName, tutorName, skillName, scheduledAt, meetLink, hoursPerDay, durationWeeks, durationMonths }) => {
  const duration = durationMonths
    ? `${durationMonths} month(s)`
    : `${durationWeeks} week(s)`;

  const mailOptions = {
    from: `"SkillSync" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `✅ Your session request with ${tutorName} has been accepted!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #6C63FF, #4F46E5); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">SkillSync</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Session Accepted! 🎉</p>
        </div>

        <div style="background: white; padding: 24px; border-radius: 12px; margin-bottom: 16px;">
          <h2 style="color: #111827; margin-top: 0;">Hi ${studentName}! 👋</h2>
          <p style="color: #6B7280;">Great news! <strong>${tutorName}</strong> has accepted your session request for <strong>${skillName}</strong>.</p>

          <div style="background: #F5F3FF; border-radius: 10px; padding: 16px; margin: 20px 0;">
            <h3 style="color: #6C63FF; margin-top: 0;">📋 Session Details</h3>
            <p style="margin: 6px 0; color: #374151;"><strong>Skill:</strong> ${skillName}</p>
            <p style="margin: 6px 0; color: #374151;"><strong>Tutor:</strong> ${tutorName}</p>
            <p style="margin: 6px 0; color: #374151;"><strong>Starts:</strong> ${new Date(scheduledAt).toDateString()}</p>
            <p style="margin: 6px 0; color: #374151;"><strong>Duration:</strong> ${duration}</p>
            <p style="margin: 6px 0; color: #374151;"><strong>Hours per day:</strong> ${hoursPerDay} hour(s)</p>
          </div>

          <div style="background: #ECFDF5; border-radius: 10px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="color: #065F46; margin: 0 0 12px; font-weight: 600;">🎥 Your Google Meet Link</p>
            <a href="${meetLink}" style="background: #059669; color: white; padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: 600; display: inline-block;">${meetLink}</a>
          </div>

          <p style="color: #6B7280; font-size: 14px;">Make sure to join on time. Good luck with your learning journey! 🚀</p>
        </div>

        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">© 2026 SkillSync · The peer-to-peer skill exchange platform</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ── Send rejection email ──────────────────────
const sendRejectionEmail = async ({ toEmail, studentName, tutorName, skillName, reason }) => {
  const mailOptions = {
    from: `"SkillSync" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `❌ Session request with ${tutorName} was not accepted`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #6C63FF, #4F46E5); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">SkillSync</h1>
        </div>
        <div style="background: white; padding: 24px; border-radius: 12px;">
          <h2 style="color: #111827; margin-top: 0;">Hi ${studentName},</h2>
          <p style="color: #6B7280;">Unfortunately, <strong>${tutorName}</strong> was unable to accept your session request for <strong>${skillName}</strong>.</p>
          <div style="background: #FEF2F2; border-radius: 10px; padding: 16px; margin: 20px 0; border-left: 4px solid #EF4444;">
            <p style="color: #991B1B; margin: 0;"><strong>Reason:</strong> ${reason || "No reason provided"}</p>
          </div>
          <p style="color: #6B7280;">Don't worry — there are many other great tutors on SkillSync. Browse and find your perfect match!</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:3000" style="background: #6C63FF; color: white; padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: 600; display: inline-block;">Find Another Tutor</a>
          </div>
        </div>
        <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin-top: 16px;">© 2026 SkillSync</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ── Send auto-rejection email ─────────────────
const sendAutoRejectionEmail = async ({ toEmail, studentName, tutorName, skillName }) => {
  const mailOptions = {
    from: `"SkillSync" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `⏰ Session request expired — ${skillName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #6C63FF, #4F46E5); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0;">SkillSync</h1>
        </div>
        <div style="background: white; padding: 24px; border-radius: 12px;">
          <h2 style="color: #111827; margin-top: 0;">Hi ${studentName},</h2>
          <p style="color: #6B7280;">Your session request to <strong>${tutorName}</strong> for <strong>${skillName}</strong> was automatically cancelled because it was not responded to within <strong>2 days</strong>.</p>
          <div style="background: #FFFBEB; border-radius: 10px; padding: 16px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            <p style="color: #92400E; margin: 0;">⏰ Requests expire after 48 hours if not accepted or rejected by the tutor.</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:3000" style="background: #6C63FF; color: white; padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: 600; display: inline-block;">Find Another Tutor</a>
          </div>
        </div>
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">© 2026 SkillSync</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ── Send OTP email ────────────────────────────
const sendOTPEmail = async ({ toEmail, userName, otp }) => {
  const recipient =
    process.env.RESEND_ALLOWED_TO || toEmail;

  const { error } = await resend.emails.send({
    from: `SkillSync <${process.env.FROM_EMAIL}>`,
    to: recipient,
    subject: "Your SkillSync OTP",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:20px;">
        <h2>Hello ${userName},</h2>

        <p>Your password reset OTP is:</p>

        <h1 style="
          text-align:center;
          letter-spacing:8px;
          color:#6C63FF;
          font-size:42px;
        ">
          ${otp}
        </h1>

        <p>This OTP expires in <strong>10 minutes</strong>.</p>

        <p>If you didn't request this, ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend Error:", error);
    throw error;
  }

  console.log("✅ OTP Email sent successfully");
};

module.exports = { sendAcceptanceEmail, sendRejectionEmail, sendAutoRejectionEmail, sendOTPEmail };
