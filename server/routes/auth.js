const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { pool: db } = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// ── REGISTER ──────────────────────────────────
router.post("/register", async (req, res) => {
  const { full_name, email, password, university, year } = req.body;
  if (!full_name || !email || !password)
    return res.status(400).json({ message:"Name, email and password are required." });

  if (email.toLowerCase() === "admin@skillsync.com")
    return res.status(403).json({ message:"This email is reserved." });
  try {
    const [existing] = await db.query("SELECT id FROM users WHERE email=?", [email]);
    if (existing.length > 0)
      
      return res.status(409).json({ message:"Email already registered." });
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (full_name,email,password,university,year) VALUES (?,?,?,?,?)",
      [full_name, email, hashed, university||null, year||null]
    );
    const token = jwt.sign(
      { id:result.insertId, email, role:"user" },
      process.env.JWT_SECRET, { expiresIn:"7d" }
    );
    res.status(201).json({
      message:"Account created successfully!",
      token,
      user:{ id:result.insertId, full_name, email, role:"user", university, year }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message:"Server error." });
  }
});

// ── LOGIN ──────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message:"Email and password are required." });
  try {
    const [users] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (users.length === 0)
      return res.status(401).json({ message:"Invalid email or password." });
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message:"Invalid email or password." });
    const token = jwt.sign(
      { id:user.id, email:user.email, role:user.role },
      process.env.JWT_SECRET, { expiresIn:"7d" }
    );
    res.json({
      message:"Login successful!",
      token,
      user:{
        id:user.id, full_name:user.full_name, email:user.email,
        role:user.role, university:user.university, year:user.year,
        avatar_url:user.avatar_url, skill_score:user.skill_score,
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message:"Server error." });
  }
});

// ── GET ME ─────────────────────────────────────
router.get("/me", verifyToken, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id,full_name,email,role,university,year,bio,location,avatar_url,skill_score,created_at FROM users WHERE id=?",
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ message:"User not found." });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message:"Server error." });
  }
});

// ── SEND OTP ───────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message:"Email is required." });
  try {
    const [users] = await db.query("SELECT id,full_name FROM users WHERE email=?", [email]);
    if (users.length === 0)
      return res.json({ message:"If this email exists, an OTP has been sent." });

    const user = users[0];
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await db.query(
      "UPDATE users SET otp_code=?, otp_expires=? WHERE id=?",
      [otp, expires, user.id]
    );

    // Send OTP email
    try {
      const { sendOTPEmail } = require("../config/email");
      await sendOTPEmail({ toEmail:email, userName:user.full_name, otp });
      console.log(`OTP sent to ${email}: ${otp}`);
    } catch (emailErr) {
  console.error("EMAIL ERROR:");
  console.error(emailErr);
}

    res.json({
      message:"OTP sent to your email. Valid for 10 minutes.",
      // Show in dev mode — remove in production
      dev_otp: otp
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message:"Server error." });
  }
});

// ── VERIFY OTP ─────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message:"Email and OTP are required." });
  try {
    const [users] = await db.query(
      "SELECT id FROM users WHERE email=? AND otp_code=? AND otp_expires > NOW()",
      [email, otp]
    );
    if (users.length === 0)
      return res.status(400).json({ message:"Invalid or expired OTP." });

    // Generate temp reset token
    const resetToken = jwt.sign(
      { id:users[0].id, email, purpose:"reset" },
      process.env.JWT_SECRET, { expiresIn:"15m" }
    );
    // Clear OTP
    await db.query("UPDATE users SET otp_code=NULL, otp_expires=NULL WHERE id=?", [users[0].id]);

    res.json({ message:"OTP verified!", reset_token:resetToken });
  } catch (err) {
    res.status(500).json({ message:"Server error." });
  }
});

// ── RESET PASSWORD ─────────────────────────────
router.post("/reset-password", async (req, res) => {
  const { token, new_password } = req.body;
  if (!token || !new_password)
    return res.status(400).json({ message:"Token and new password are required." });
  if (new_password.length < 6)
    return res.status(400).json({ message:"Password must be at least 6 characters." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== "reset")
      return res.status(400).json({ message:"Invalid reset token." });
    const hashed = await bcrypt.hash(new_password, 10);
    await db.query("UPDATE users SET password=? WHERE id=?", [hashed, decoded.id]);
    res.json({ message:"Password reset successfully! Please login." });
  } catch (err) {
    if (err.name==="TokenExpiredError")
      return res.status(400).json({ message:"Reset token expired. Request a new OTP." });
    res.status(500).json({ message:"Server error." });
  }
});

// ── CHANGE PASSWORD ────────────────────────────
router.post("/change-password", verifyToken, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password)
    return res.status(400).json({ message:"Both passwords are required." });
  try {
    const [users] = await db.query("SELECT * FROM users WHERE id=?", [req.user.id]);
    const isMatch = await bcrypt.compare(current_password, users[0].password);
    if (!isMatch)
      return res.status(401).json({ message:"Current password is incorrect." });
    const hashed = await bcrypt.hash(new_password, 10);
    await db.query("UPDATE users SET password=? WHERE id=?", [hashed, req.user.id]);
    res.json({ message:"Password changed successfully!" });
  } catch (err) {
    res.status(500).json({ message:"Server error." });
  }
});

module.exports = router;