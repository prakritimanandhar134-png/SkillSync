const express = require("express");
const router  = express.Router();
const db      = require("../config/db");

// ── GET all skills ────────────────────────────
// GET /api/skills
router.get("/", async (req, res) => {
  try {
    const [skills] = await db.query("SELECT * FROM skills ORDER BY category, name");
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ── GET skills by category ────────────────────
// GET /api/skills/category/:cat
router.get("/category/:cat", async (req, res) => {
  try {
    const [skills] = await db.query(
      "SELECT * FROM skills WHERE category = ? ORDER BY name",
      [req.params.cat]
    );
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
