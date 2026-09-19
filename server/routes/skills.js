const express = require("express");
const router = express.Router();

const { pool } = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// ═══════════════════════════════════════════════
// GET ALL SKILLS
// GET /api/skills
// ═══════════════════════════════════════════════

router.get("/", async (req, res) => {
  try {
    const [skills] = await pool.query(`
      SELECT *
      FROM skills
      WHERE category IN ('Programming', 'Design')
      ORDER BY category, name
    `);

    res.json(skills);

  } catch (err) {
    console.error("Get skills error:", err);

    res.status(500).json({
      message: "Server error.",
    });
  }
});


// ═══════════════════════════════════════════════
// ADD CUSTOM SKILL
// POST /api/skills/add
// ═══════════════════════════════════════════════

router.post("/add", verifyToken, async (req, res) => {
  const { name, category } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Skill name required.",
    });
  }

  const allowedCats = [
    "Programming",
    "Design",
  ];

  const cat = allowedCats.includes(category)
    ? category
    : "Programming";

  try {
    // Check existing skill
    const [existing] = await pool.query(
      "SELECT id FROM skills WHERE name = ?",
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.json({
        skill_id: existing[0].id,
        message: "Skill already exists.",
      });
    }

    // Insert new skill
    const [result] = await pool.query(
      `
      INSERT INTO skills (name, category)
      VALUES (?, ?)
      `,
      [name.trim(), cat]
    );

    res.json({
      skill_id: result.insertId,
      message: "Skill added!",
    });

  } catch (err) {
    console.error("Add skill error:", err);

    res.status(500).json({
      message: "Server error.",
    });
  }
});


// ═══════════════════════════════════════════════
// GET MY SKILLS
// GET /api/skills/my
// ═══════════════════════════════════════════════

router.get("/my", verifyToken, async (req, res) => {
  try {

    const userId = req.user.id;

    // Get teaching skills
    const [teachSkills] = await pool.query(
      `
      SELECT
        ust.id,
        ust.skill_id,
        'teach' AS type,
        ust.proficiency AS level,
        s.name,
        s.category
      FROM user_skills_teach ust
      JOIN skills s
        ON s.id = ust.skill_id
      WHERE ust.user_id = ?
      `,
      [userId]
    );


    // Get learning skills
    const [learnSkills] = await pool.query(
      `
      SELECT
        usl.id,
        usl.skill_id,
        'learn' AS type,
        'Beginner' AS level,
        s.name,
        s.category
      FROM user_skills_learn usl
      JOIN skills s
        ON s.id = usl.skill_id
      WHERE usl.user_id = ?
      `,
      [userId]
    );


    // Combine both
    const skills = [
      ...teachSkills,
      ...learnSkills,
    ];


    // Sort by type then name
    skills.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }

      return a.type === "teach" ? -1 : 1;
    });


    res.json(skills);

  } catch (err) {

    console.error("Get my skills error:", err);

    res.status(500).json({
      message: "Server error.",
    });
  }
});


// ═══════════════════════════════════════════════
// ADD SKILL TO MY PROFILE
// POST /api/skills/my
// ═══════════════════════════════════════════════

router.post("/my", verifyToken, async (req, res) => {

const {
  skill_id,
  type,
  level,
  hourly_rate
} = req.body;

  if (!skill_id || !type) {
    return res.status(400).json({
      message: "Skill and type required.",
    });
  }


  if (!["teach", "learn"].includes(type)) {
    return res.status(400).json({
      message: "Type must be teach or learn.",
    });
  }


  try {

    // ═══════════════════════════════════════
    // TEACH SKILL
    // ═══════════════════════════════════════

    if (type === "teach") {

      const [existing] = await pool.query(
        `
        SELECT id
        FROM user_skills_teach
        WHERE user_id = ?
        AND skill_id = ?
        `,
        [
          req.user.id,
          skill_id,
        ]
      );


      if (existing.length > 0) {
        return res.status(400).json({
          message: "Teaching skill already added.",
        });
      }


      const allowedLevels = [
        "Beginner",
        "Intermediate",
        "Advanced",
        "Expert",
      ];


    const proficiency =
  allowedLevels.includes(level)
    ? level
    : "Beginner";

     await pool.query(
  `
  INSERT INTO user_skills_teach
  (
    user_id,
    skill_id,
    proficiency,
    hourly_rate
  )
  VALUES (?, ?, ?, ?)
  `,
  [
    req.user.id,
    skill_id,
    proficiency,
    Number(hourly_rate || 0)
  ]
);


      return res.json({
        message: "Teaching skill added successfully.",
      });
    }


    // ═══════════════════════════════════════
    // LEARN SKILL
    // ═══════════════════════════════════════

    if (type === "learn") {

      const [existing] = await pool.query(
        `
        SELECT id
        FROM user_skills_learn
        WHERE user_id = ?
        AND skill_id = ?
        `,
        [
          req.user.id,
          skill_id,
        ]
      );


      if (existing.length > 0) {
        return res.status(400).json({
          message: "Learning skill already added.",
        });
      }


      await pool.query(
        `
        INSERT INTO user_skills_learn
        (
          user_id,
          skill_id
        )
        VALUES (?, ?)
        `,
        [
          req.user.id,
          skill_id,
        ]
      );


      return res.json({
        message: "Learning skill added successfully.",
      });
    }

  } catch (err) {

    console.error("Add my skill error:", err);


    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Skill already added.",
      });
    }


    res.status(500).json({
      message: "Server error.",
    });
  }
});


// ═══════════════════════════════════════════════
// DELETE MY SKILL
// DELETE /api/skills/my/:id
// ═══════════════════════════════════════════════

router.delete("/my/:id", verifyToken, async (req, res) => {

  try {

    const skillId = req.params.id;
    const userId = req.user.id;


    // Try deleting from teaching skills
    const [teachResult] = await pool.query(
      `
      DELETE FROM user_skills_teach
      WHERE id = ?
      AND user_id = ?
      `,
      [
        skillId,
        userId,
      ]
    );


    if (teachResult.affectedRows > 0) {
      return res.json({
        message: "Teaching skill removed.",
      });
    }


    // If not found, try learning skills
    const [learnResult] = await pool.query(
      `
      DELETE FROM user_skills_learn
      WHERE id = ?
      AND user_id = ?
      `,
      [
        skillId,
        userId,
      ]
    );


    if (learnResult.affectedRows > 0) {
      return res.json({
        message: "Learning skill removed.",
      });
    }


    // Nothing deleted
    return res.status(404).json({
      message: "Skill not found.",
    });

  } catch (err) {

    console.error("Delete skill error:", err);

    res.status(500).json({
      message: "Server error.",
    });
  }
});


module.exports = router;