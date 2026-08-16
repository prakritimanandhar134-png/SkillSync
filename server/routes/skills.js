const express = require("express");
const router  = express.Router();
const db      = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// GET all skills (Programming + Design only)
router.get("/", async (req, res) => {
  try {
    const [skills] = await db.query(
      "SELECT * FROM skills WHERE category IN ('Programming','Design') ORDER BY category, name"
    );
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message:"Server error." });
  }
});

// ADD custom skill
router.post("/add", verifyToken, async (req, res) => {
  const { name, category } = req.body;
  if (!name) return res.status(400).json({ message:"Skill name required." });
  const allowedCats = ["Programming","Design"];
  const cat = allowedCats.includes(category) ? category : "Programming";
  try {
    const [existing] = await db.query("SELECT id FROM skills WHERE name=?", [name]);
    if (existing.length > 0) {
      return res.json({ skill_id: existing[0].id, message:"Skill already exists." });
    }
    const [result] = await db.query(
      "INSERT INTO skills (name, category) VALUES (?,?)", [name, cat]
    );
    res.json({ skill_id: result.insertId, message:"Skill added!" });
  } catch (err) {
    res.status(500).json({ message:"Server error." });
  }
});
router.get("/my", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        us.id,
        us.type,
        us.level,
        s.id AS skill_id,
        s.name,
        s.category
      FROM user_skills us
      JOIN skills s ON s.id = us.skill_id
      WHERE us.user_id = ?
      ORDER BY us.type, s.name
    `, [req.user.id]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});
//Add skill to user's profile
router.post("/my", verifyToken, async (req, res) => {
  const { skill_id, type, level } = req.body;

  if (!skill_id || !type) {
    return res.status(400).json({
      message: "Skill and type required."
    });
  }

  try {

    await db.query(
      `
      INSERT INTO user_skills
      (user_id, skill_id, type, level)
      VALUES (?,?,?,?)
      `,
      [
        req.user.id,
        skill_id,
        type,
        level || "Beginner"
      ]
    );

    res.json({
      message: "Skill added successfully."
    });

  } catch (err) {

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Skill already added."
      });
    }

    console.error(err);

    res.status(500).json({
      message: "Server error."
    });

  }

});
//Delete skill from user's profile
router.delete("/my/:id", verifyToken, async (req, res) => {

  try {

    await db.query(
      `
      DELETE FROM user_skills
      WHERE id=?
      AND user_id=?
      `,
      [
        req.params.id,
        req.user.id
      ]
    );

    res.json({
      message: "Skill removed."
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error."
    });

  }

});
module.exports = router;