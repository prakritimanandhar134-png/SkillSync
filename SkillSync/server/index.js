const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ── Middleware ──
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// ── Routes ──
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/users",    require("./routes/users"));
app.use("/api/skills",   require("./routes/skills"));
app.use("/api/sessions", require("./routes/sessions"));
app.use("/api/reviews",  require("./routes/reviews"));
app.use("/api/match",    require("./routes/match"));
app.use("/api/admin",    require("./routes/admin"));

// ── Health check ──
app.get("/", (req, res) => res.json({ message: "SkillSync API running ✅" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SkillSync server running on port ${PORT}`));
