const { resend } = require("../config/resend");

const sendEmail = async ({ to, subject, html, replyTo }) => {
  if (!resend) {
    throw new Error("Resend is not configured. Missing RESEND_API_KEY.");
  }

  if (!to || !subject || !html) {
    throw new Error("to, subject and html are required.");
  }

  const from = process.env.FROM_EMAIL;
  if (!from) {
    throw new Error("Missing FROM_EMAIL. Use a Resend-verified sender address.");
  }

  const payload = {
    from,
    to: String(to).trim(),
    subject,
    html,
  };

  if (replyTo) payload.reply_to = replyTo;

  const response = await resend.emails.send(payload);

  if (response.error) {
    throw new Error(response.error.message || "Failed to send email.");
  }

  return response;
};

module.exports = { sendEmail };
