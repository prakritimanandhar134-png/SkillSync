const express = require("express");
const router = express.Router();

const { pool } = require("../config/db");
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

  const totalOverlap =
    theyCanTeachMe + iCanTeachThem;

  const maxPossible = Math.max(
    myWantIds.length + myTeachIds.length,
    1
  );

  return Math.min(
    100,
    Math.round(
      (totalOverlap / maxPossible) * 100
    )
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
  const match = matchScore * 0.4;

  const rating =
    ratingScore(avgRating) * 0.3;

  const exp =
    Math.min(
      (Number(sessionCount || 0) / 150) * 100,
      100
    ) * 0.2;

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
      // 1. GET MY TEACHING SKILLS
      // ════════════════════════════════════════════════

      const [myTeachRows] = await pool.query(
        `
        SELECT skill_id
        FROM user_skills_teach
        WHERE user_id = ?
        `,
        [myId]
      );

      // ════════════════════════════════════════════════
      // 2. GET MY LEARNING SKILLS
      // ════════════════════════════════════════════════

      const [myLearnRows] = await pool.query(
        `
        SELECT skill_id
        FROM user_skills_learn
        WHERE user_id = ?
        `,
        [myId]
      );

      const myTeachIds = myTeachRows.map(
        (row) => Number(row.skill_id)
      );

      const myWantIds = myLearnRows.map(
        (row) => Number(row.skill_id)
      );

      console.log("My ID:", myId);
      console.log(
        "My teach IDs:",
        myTeachIds
      );
      console.log(
        "My want IDs:",
        myWantIds
      );

      // ════════════════════════════════════════════════
      // 3. GET ALL OTHER USERS
      // ════════════════════════════════════════════════

      const [users] = await pool.query(
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
  u.available_days,
u.class_start_time,
u.class_end_time,
u.hours_per_day,
u.created_at,
          ROUND(
            AVG(DISTINCT r.rating),
            1
          ) AS avg_rating,

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
  u.available_days,
  u.created_at 

        `,
        [myId]
      );

      // ════════════════════════════════════════════════
      // 4. CALCULATE RECOMMENDATION
      //    FOR EACH USER
      // ════════════════════════════════════════════════

      const results = await Promise.all(
        users.map(async (user) => {

          // ══════════════════════════════════════════
          // GET THEIR TEACHING SKILLS
          // ══════════════════════════════════════════

          const [teachRows] =
            await pool.query(
              `
              SELECT
                ust.skill_id,
                ust.proficiency,
                ust.hourly_rate,
                sk.name,
                sk.category

              FROM user_skills_teach ust

              JOIN skills sk
                ON sk.id = ust.skill_id

              WHERE ust.user_id = ?
              `,
              [user.id]
            );

          // ══════════════════════════════════════════
          // GET THEIR LEARNING SKILLS
          // ══════════════════════════════════════════

          const [wantRows] =
            await pool.query(
              `
              SELECT
                usl.skill_id,
                sk.name,
                sk.category

              FROM user_skills_learn usl

              JOIN skills sk
                ON sk.id = usl.skill_id

              WHERE usl.user_id = ?
              `,
              [user.id]
            );

          // ══════════════════════════════════════════
          // SKILL IDs
          // ══════════════════════════════════════════

          const theirTeachIds =
            teachRows.map((skill) =>
              Number(skill.skill_id)
            );

          const theirWantIds =
            wantRows.map((skill) =>
              Number(skill.skill_id)
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

          const mScore =
            skillMatchScore(
              myTeachIds,
              myWantIds,
              theirTeachIds,
              theirWantIds
            );

// ══════════════════════════════════════════
// RELEVANCE CHECK
// ══════════════════════════════════════════

// Can they teach me something I want to learn?
const theyCanTeachMe =
  theirTeachIds.some((id) =>
    myWantIds.includes(id)
  );

// Can I teach them something they want to learn?
const iCanTeachThem =
  myTeachIds.some((id) =>
    theirWantIds.includes(id)
  );

// Both users can teach each other
const barter =
  theyCanTeachMe && iCanTeachThem;

// If there is no skill connection at all,
// don't recommend this user
if (!theyCanTeachMe && !iCanTeachThem) {
  return null;
}            
          // ══════════════════════════════════════════
          // RECOMMENDATION SCORE
          // ══════════════════════════════════════════

          const rScore =
            recommendScore(
              mScore,
              user.avg_rating,
              user.session_count,
              user.is_online
            );

         let availableDays = [];

try {
  if (user.available_days) {
    availableDays =
      typeof user.available_days === "string"
        ? JSON.parse(user.available_days)
        : user.available_days;
  }
} catch (err) {
  console.error(
    `Invalid available_days for user ${user.id}:`,
    user.available_days
  );

  availableDays = [];
}
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
  available_days: availableDays,

schedule: {
  startTime: user.class_start_time,
  endTime: user.class_end_time,
  hoursPerDay: Number(user.hours_per_day || 0),
  availableDays: availableDays
},


  created_at: user.created_at,

           

            // Rating
            avg_rating: user.avg_rating,

            // Experience
            session_count:
              Number(user.session_count || 0),

            // ══════════════════════════════════════
            // SKILL NAMES
            // ══════════════════════════════════════

            teaches: teachRows.map(
              (skill) => skill.name
            ),

            wants: wantRows.map(
              (skill) => skill.name
            ),

            // ══════════════════════════════════════
            // FULL TEACHING SKILLS
            // ══════════════════════════════════════

            teach_skills: teachRows.map(
              (skill) => ({
                id: skill.skill_id,
                name: skill.name,
                category: skill.category,

                // Existing DB column
                level:
                  skill.proficiency,

                proficiency:
                  skill.proficiency,

                hourly_rate:
                  skill.hourly_rate
              })
            ),

            // ══════════════════════════════════════
            // FULL LEARNING SKILLS
            // ══════════════════════════════════════

            want_skills: wantRows.map(
              (skill) => ({
                id: skill.skill_id,
                name: skill.name,
                category: skill.category,

                // Learn table has no level
                level: null
              })
            ),

            // ══════════════════════════════════════
            // SKILL IDs
            // ══════════════════════════════════════

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

            barter_ready: barter
          };
        })
      );

      // Remove users who have no relevant skill connection
      const filteredResults =
        results.filter((user) => user !== null);

      // ════════════════════════════════════════════════
      // 5. SORT BEST MATCH FIRST
      // ════════════════════════════════════════════════

     filteredResults.sort(
  (a, b) =>
    b.recommend_score -
    a.recommend_score
);

      // ════════════════════════════════════════════════
      // 6. SEND RESULTS
      // ════════════════════════════════════════════════

      res.json(filteredResults);

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

      if (isNaN(targetId)) {
        return res.status(400).json({
          message: "Invalid target user ID."
        });
      }

      // ══════════════════════════════════════════════
      // GET MY TEACHING SKILLS
      // ══════════════════════════════════════════════

      const [myTeachRows] =
        await pool.query(
          `
          SELECT skill_id
          FROM user_skills_teach
          WHERE user_id = ?
          `,
          [myId]
        );

      // ══════════════════════════════════════════════
      // GET MY LEARNING SKILLS
      // ══════════════════════════════════════════════

      const [myLearnRows] =
        await pool.query(
          `
          SELECT skill_id
          FROM user_skills_learn
          WHERE user_id = ?
          `,
          [myId]
        );

      // ══════════════════════════════════════════════
      // GET THEIR TEACHING SKILLS
      // ══════════════════════════════════════════════

      const [theirTeachRows] =
        await pool.query(
          `
          SELECT skill_id
          FROM user_skills_teach
          WHERE user_id = ?
          `,
          [targetId]
        );

      // ══════════════════════════════════════════════
      // GET THEIR LEARNING SKILLS
      // ══════════════════════════════════════════════

      const [theirLearnRows] =
        await pool.query(
          `
          SELECT skill_id
          FROM user_skills_learn
          WHERE user_id = ?
          `,
          [targetId]
        );

      // ══════════════════════════════════════════════
      // CONVERT TO IDs
      // ══════════════════════════════════════════════

      const myTeachIds =
        myTeachRows.map((skill) =>
          Number(skill.skill_id)
        );

      const myWantIds =
        myLearnRows.map((skill) =>
          Number(skill.skill_id)
        );

        // No skills = no recommendations
if (
  myTeachIds.length === 0 &&
  myWantIds.length === 0
) {
  return res.json([]);
}
      const theirTeachIds =
        theirTeachRows.map((skill) =>
          Number(skill.skill_id)
        );

      const theirWantIds =
        theirLearnRows.map((skill) =>
          Number(skill.skill_id)
        );
const theyCanTeachMe =
  theirTeachIds.some((id) =>
    myWantIds.includes(id)
  );

const iCanTeachThem =
  myTeachIds.some((id) =>
    theirWantIds.includes(id)
  );

// Both users can teach each other
const barter =
  theyCanTeachMe && iCanTeachThem;

// User is relevant only if there is
// at least one actual skill connection
if (!theyCanTeachMe && !iCanTeachThem) {
  return res.json({
    barter_ready: false,
    match_score: 0
  });
}
      // ══════════════════════════════════════════════
      // MATCH SCORE
      // ══════════════════════════════════════════════

      const mScore =
        skillMatchScore(
          myTeachIds,
          myWantIds,
          theirTeachIds,
          theirWantIds
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
// EXPORT
// ══════════════════════════════════════════════════════

module.exports = router;