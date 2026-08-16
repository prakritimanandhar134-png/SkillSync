const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// ══════════════════════════════════════════════════════
// ALGORITHM 1: SKILL MATCH SCORE
// ══════════════════════════════════════════════════════

function skillMatchScore(
  myTeachIds,
  myWantIds,
  theirTeachIds,
  theirWantIds
) {
  // Their teaching skills match what I want to learn
  const theyCanTeachMe = theirTeachIds.filter((id) =>
    myWantIds.includes(id)
  ).length;

  // My teaching skills match what they want to learn
  const iCanTeachThem = myTeachIds.filter((id) =>
    theirWantIds.includes(id)
  ).length;

  const totalOverlap = theyCanTeachMe + iCanTeachThem;

  const maxPossible = Math.max(
    myWantIds.length + myTeachIds.length,
    1
  );

  return Math.min(
    100,
    Math.round((totalOverlap / maxPossible) * 100)
  );
}

// ══════════════════════════════════════════════════════
// ALGORITHM 2: RATING SCORE
// ══════════════════════════════════════════════════════

function ratingScore(avgRating) {
  if (!avgRating) return 0;

  return Math.round(
    (parseFloat(avgRating) / 5) * 100
  );
}

// ══════════════════════════════════════════════════════
// ALGORITHM 3: RECOMMENDATION SCORE
// ══════════════════════════════════════════════════════

function recommendScore(
  matchScore,
  avgRating,
  sessionCount,
  isOnline
) {
  const match = matchScore * 0.40;

  const rating =
    ratingScore(avgRating) * 0.30;

  const exp =
    Math.min(
      (sessionCount / 150) * 100,
      100
    ) * 0.20;

  const online = isOnline ? 10 : 0;

  return Math.round(
    match + rating + exp + online
  );
}

// ══════════════════════════════════════════════════════
// GET RECOMMENDATIONS
// GET /api/match/recommendations
// ══════════════════════════════════════════════════════

router.get(
  "/recommendations",
  verifyToken,
  async (req, res) => {
    try {
      const myId = req.user.id;

      // ════════════════════════════════════════════════
      // 1. GET MY SKILLS
      // ════════════════════════════════════════════════

      const [mySkillRows] = await db.query(
        `
        SELECT
          skill_id,
          type
        FROM user_skills
        WHERE user_id = ?
        `,
        [myId]
      );

      // Skills I can teach
      const myTeachIds = mySkillRows
        .filter((row) => row.type === "teach")
        .map((row) => row.skill_id);

      // Skills I want to learn
      const myWantIds = mySkillRows
        .filter((row) => row.type === "learn")
        .map((row) => row.skill_id);

      console.log("My ID:", myId);
      console.log("My teach IDs:", myTeachIds);
      console.log("My want IDs:", myWantIds);

      // ════════════════════════════════════════════════
      // 2. GET ALL OTHER USERS
      // ════════════════════════════════════════════════

      const [users] = await db.query(
        `
        SELECT
          u.id,
          u.full_name,
          u.email,
          u.university,
          u.year,
          u.bio,
          u.location,
          u.avatar_url,
          u.skill_score,
          u.is_online,
          u.created_at,
         
          ROUND(AVG(r.rating), 1) AS avg_rating,

          COUNT(
            DISTINCT CASE
              WHEN s.status = 'completed'
              THEN s.id
            END
          ) AS session_count

        FROM users u

        LEFT JOIN sessions s
          ON s.tutor_id = u.id

        LEFT JOIN reviews r
          ON r.reviewee_id = u.id

        WHERE u.id != ?
          AND u.role = 'user'

        GROUP BY
          u.id,
          u.full_name,
          u.email,
          u.university,
          u.year,
          u.bio,
          u.location,
          u.avatar_url,
          u.skill_score,
          u.is_online,
          u.created_at
         
        `,
        [myId]
      );

      // ════════════════════════════════════════════════
      // 3. CALCULATE RECOMMENDATION FOR EACH USER
      // ════════════════════════════════════════════════

      const results = await Promise.all(
        users.map(async (user) => {

          // ══════════════════════════════════════════
          // GET THIS USER'S SKILLS
          // ══════════════════════════════════════════

          const [skillRows] = await db.query(
            `
            SELECT
              us.skill_id,
              us.type,
              us.level,
              sk.name,
              sk.category

            FROM user_skills us

            JOIN skills sk
              ON sk.id = us.skill_id

            WHERE us.user_id = ?
            `,
            [user.id]
          );

          // ══════════════════════════════════════════
          // SEPARATE TEACHING AND LEARNING SKILLS
          // ══════════════════════════════════════════

          const teachRows = skillRows.filter(
            (skill) => skill.type === "teach"
          );

          const wantRows = skillRows.filter(
            (skill) => skill.type === "learn"
          );

          // Their skill IDs
          const theirTeachIds = teachRows.map(
            (skill) => skill.skill_id
          );

          const theirWantIds = wantRows.map(
            (skill) => skill.skill_id
          );

          console.log(
            `User ${user.id} teaches:`,
            theirTeachIds,
            "wants:",
            theirWantIds
          );

          // ══════════════════════════════════════════
          // MATCH SCORE
          // ══════════════════════════════════════════

          const mScore = skillMatchScore(
            myTeachIds,
            myWantIds,
            theirTeachIds,
            theirWantIds
          );

          // ══════════════════════════════════════════
          // RECOMMENDATION SCORE
          // ══════════════════════════════════════════

          const rScore = recommendScore(
            mScore,
            user.avg_rating,
            user.session_count,
            user.is_online
          );

          // ══════════════════════════════════════════
          // BARTER CHECK
          // ══════════════════════════════════════════

          /*
            Barter is available when:

            1. They can teach me something I want
            AND
            2. I can teach them something they want
          */

          const barter =
            theirTeachIds.some((id) =>
              myWantIds.includes(id)
            ) &&
            myTeachIds.some((id) =>
              theirWantIds.includes(id)
            );

          // ══════════════════════════════════════════
          // RETURN USER DATA
          // ══════════════════════════════════════════

          return {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            university: user.university,
            year: user.year,
            bio: user.bio,
            location: user.location,
            avatar_url: user.avatar_url,
            skill_score: user.skill_score,
            is_online: user.is_online,
            created_at: user.created_at,

            // Rating and experience
            avg_rating: user.avg_rating,
            session_count: user.session_count,

            // ══════════════════════════════════════
            // SKILLS
            // ══════════════════════════════════════

            // Names for frontend
            teaches: teachRows.map(
              (skill) => skill.name
            ),

            wants: wantRows.map(
              (skill) => skill.name
            ),

            // Full skill information
            teach_skills: teachRows.map(
              (skill) => ({
                id: skill.skill_id,
                name: skill.name,
                category: skill.category,
                level: skill.level
              })
            ),

            want_skills: wantRows.map(
              (skill) => ({
                id: skill.skill_id,
                name: skill.name,
                category: skill.category,
                level: skill.level
              })
            ),

            // Skill IDs
            teach_ids: theirTeachIds,
            want_ids: theirWantIds,

            // ══════════════════════════════════════
            // MATCHING
            // ══════════════════════════════════════

            match_score: mScore,
            recommend_score: rScore,

            // ══════════════════════════════════════
            // BARTER
            // ══════════════════════════════════════

            barter_ready: barter,

            // ══════════════════════════════════════
            // PAYMENT
            // ══════════════════════════════════════

            
          };
        })
      );

      // ════════════════════════════════════════════════
      // 4. SORT BEST MATCH FIRST
      // ════════════════════════════════════════════════

      results.sort(
        (a, b) =>
          b.recommend_score -
          a.recommend_score
      );

      // ════════════════════════════════════════════════
      // 5. SEND RESULTS
      // ════════════════════════════════════════════════

      res.json(results);

    } catch (err) {

      console.error(
        "Match error:",
        err
      );

      res.status(500).json({
        message: "Server error."
      });
    }
  }
);

// ══════════════════════════════════════════════════════
// CHECK BARTER BETWEEN TWO USERS
// GET /api/match/barter/:targetId
// ══════════════════════════════════════════════════════

router.get(
  "/barter/:targetId",
  verifyToken,
  async (req, res) => {

    try {

      const myId = req.user.id;

      const targetId =
        parseInt(req.params.targetId);

      // ══════════════════════════════════════════════
      // GET MY SKILLS
      // ══════════════════════════════════════════════

      const [mySkills] = await db.query(
        `
        SELECT
          skill_id,
          type
        FROM user_skills
        WHERE user_id = ?
        `,
        [myId]
      );

      // ══════════════════════════════════════════════
      // GET TARGET USER SKILLS
      // ══════════════════════════════════════════════

      const [theirSkills] = await db.query(
        `
        SELECT
          skill_id,
          type
        FROM user_skills
        WHERE user_id = ?
        `,
        [targetId]
      );

      // ══════════════════════════════════════════════
      // SEPARATE MY SKILLS
      // ══════════════════════════════════════════════

      const myTeachIds = mySkills
        .filter((skill) =>
          skill.type === "teach"
        )
        .map((skill) =>
          skill.skill_id
        );

      const myWantIds = mySkills
        .filter((skill) =>
          skill.type === "learn"
        )
        .map((skill) =>
          skill.skill_id
        );

      // ══════════════════════════════════════════════
      // SEPARATE THEIR SKILLS
      // ══════════════════════════════════════════════

      const theirTeachIds = theirSkills
        .filter((skill) =>
          skill.type === "teach"
        )
        .map((skill) =>
          skill.skill_id
        );

      const theirWantIds = theirSkills
        .filter((skill) =>
          skill.type === "learn"
        )
        .map((skill) =>
          skill.skill_id
        );

      // ══════════════════════════════════════════════
      // MATCH SCORE
      // ══════════════════════════════════════════════

      const mScore = skillMatchScore(
        myTeachIds,
        myWantIds,
        theirTeachIds,
        theirWantIds
      );

      // ══════════════════════════════════════════════
      // BARTER CHECK
      // ══════════════════════════════════════════════

      const barter =
        theirTeachIds.some((id) =>
          myWantIds.includes(id)
        ) &&
        myTeachIds.some((id) =>
          theirWantIds.includes(id)
        );

      // ══════════════════════════════════════════════
      // RETURN RESULT
      // ══════════════════════════════════════════════

      res.json({
        barter_ready: barter,
        match_score: mScore
      });

    } catch (err) {

      console.error(
        "Barter check error:",
        err
      );

      res.status(500).json({
        message: "Server error."
      });
    }
  }
);

// ══════════════════════════════════════════════════════
// EXPORT ROUTER
// ══════════════════════════════════════════════════════

module.exports = router;