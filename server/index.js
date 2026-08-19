const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Load routes one by one with error checking
const authRoute     = require("./routes/auth");
const usersRoute    = require("./routes/users");
const skillsRoute   = require("./routes/skills");
const sessionsRoute = require("./routes/sessions");
const reviewsRoute  = require("./routes/reviews");
const matchRoute    = require("./routes/match");
const adminRoute    = require("./routes/admin");
const checkAuthRoute = require("./routes/Checkauth");

console.log("auth type:",     typeof authRoute);
console.log("users type:",    typeof usersRoute);
console.log("skills type:",   typeof skillsRoute);
console.log("sessions type:", typeof sessionsRoute);
console.log("reviews type:",  typeof reviewsRoute);
console.log("match type:",    typeof matchRoute);
console.log("admin type:",    typeof adminRoute);
console.log("checkauth type:", typeof checkAuthRoute);

app.use("/api/auth",     authRoute);
app.use("/api/users",    usersRoute);
app.use("/api/skills",   skillsRoute);
app.use("/api/sessions", sessionsRoute);
app.use("/api/reviews",  reviewsRoute);
app.use("/api/match",    matchRoute);
app.use("/api/admin",    adminRoute);


app.use("/check", checkAuthRoute)

app.get("/", (req, res) => res.json({ message: "SkillSync API running ✅" }));

app.get("/api/test-email", async (req, res) => {
  try {
    const result = await require("./utils/sendEmail").sendEmail({
      to: process.env.TEST_EMAIL || process.env.FROM_EMAIL || "onboarding@resend.dev",
      subject: "SkillSync test email",
      html: "<p>This is a test email from SkillSync using Resend.</p>"
    });
    res.json({ success: true, message: "Email sent successfully", result });
  } catch (error) {
    console.error("Test email failed:", error);
    res.status(500).json({ success: false, message: error.message || "Email sending failed" });
  }
});

const PORT = process.env.PORT || 5000;
// Start auto-reject cron job
const startAutoRejectCron = require("./config/cron");
const router = require("./routes/auth");

startAutoRejectCron();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  startAutoRejectCron();
});