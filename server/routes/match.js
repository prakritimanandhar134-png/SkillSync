const express = require("express");
const router  = express.Router();
const db      = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// ══════════════════════════════════════════════
//  ALGORITHM 1 — Skill Matching Score
//  How many of tutor's teach skills match
//  what the current user wants to learn,
//  AND how many of user's teach skills match
//  what the tutor wants to learn.
// ══════════════════════════════════════════════
function skillMatchScore(myTeach, myWant, theirTeach, theirWant) {
  const canTeachMe   = theirTeach.filter(id => myWant.includes(id)).length;
  const iCanTeachThem = myTeach.filter(id => theirWant.includes(id)).length;
  const overlap      = canTeachMe + iCanTeachThem;
  const maxPossible  = Math.max(myWant.length + myTeach.length, 1);
  return Math.min(100, Math.round((overlap / maxPossible) * 100));
}

// ══════════════════════════════════════════════
//  ALGORITHM 2 — Rating Score
//  Normalized 0-100 from average star rating
// ══════════════════════════════════════════════
function ratingScore(avgRating) {
  return Math.round((parseFloat(avgRating) / 5) * 100);
}

// ══════════════════════════════════════════════
//  ALGORITHM 3 — Recommendation Score
//  Weighted combination of all signals
// ══════════════════════════════════════════════
function recommendScore(matchScore, avgRating, sessionCount, isOnline) {
  const match   = matchScore                                    * 0.40;
  const rating  = ratingScore(avgRating || 0)                  * 0.30;
  const exp     = Math.min((sessionCount / 150) * 100, 100)    * 0.20;
  const online  = isOnline ? 10 : 0;
  return Math.round(match + rating + exp + online);
}

// ── GET recommended tutors for logged-in user ─
// GET /api/match/recommendations
router.get("/recommendations", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user's teach and want skill IDs
    const [myTeachRows] = await db.query(
      "SELECT skill_id FROM user_skills_teach WHERE user_id = ?", [userId]
    );
    const [myWantRows] = await db.query(
      "SELECT skill_id FROM user_skills_learn WHERE user_id = ?", [userId]
    );

    const myTeach = myTeachRows.map(r => r.skill_id);
    const myWant  = myWantRows.map(r => r.skill_id);

    // Get all other users with their skills + ratings
    const [users] = await db.query(`
      SELECT u.id, u.full_name, u.university, u.year, u.bio,
             u.avatar_url, u.skill_score, u.is_online, u.created_at,
             ROUND(AVG(r.rating), 1)  AS avg_rating,
             COUNT(DISTINCT s.id)     AS session_count
      FROM users u
      LEFT JOIN sessions s ON s.tutor_id = u.id AND s.status = 'completed'
      LEFT JOIN reviews  r ON r.reviewee_id = u.id
      WHERE u.id != ? AND u.role = 'user'
      GROUP BY u.id
    `, [userId]);

    // For each user fetch their skills
    const results = await Promise.all(users.map(async (u) => {
      const [teachRows] = await db.query(
        "SELECT skill_id, name FROM user_skills_teach ust JOIN skills sk ON sk.id=ust.skill_id WHERE ust.user_id=?", [u.id]
      );
      const [wantRows] = await db.query(
        "SELECT skill_id, name FROM user_skills_learn usl JOIN skills sk ON sk.id=usl.skill_id WHERE usl.user_id=?", [u.id]
      );

      const theirTeach = teachRows.map(r => r.skill_id);
      const theirWant  = wantRows.map(r => r.skill_id);

      const matchScore  = skillMatchScore(myTeach, myWant, theirTeach, theirWant);
      const recScore    = recommendScore(matchScore, u.avg_rating, u.session_count, u.is_online);
      const barterReady = theirTeach.some(id => myWant.includes(id)) && myTeach.some(id => theirWant.includes(id));

      return {
        ...u,
        teaches:       teachRows.map(r => r.name),
        wants:         wantRows.map(r => r.name),
        match_score:   matchScore,
        recommend_score: recScore,
        barter_ready:  barterReady,
      };
    }));

    // Sort by recommendation score (Algorithm 3)
    results.sort((a, b) => b.recommend_score - a.recommend_score);

    res.json(results);
  } catch (err) {
    console.error("Match error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ── CHECK if barter is possible between 2 users ─
// GET /api/match/barter/:targetId
router.get("/barter/:targetId", verifyToken, async (req, res) => {
  try {
    const myId     = req.user.id;
    const targetId = req.params.targetId;

    const [myTeach]     = await db.query("SELECT skill_id FROM user_skills_teach WHERE user_id=?", [myId]);
    const [myWant]      = await db.query("SELECT skill_id FROM user_skills_learn WHERE user_id=?", [myId]);
    const [theirTeach]  = await db.query("SELECT skill_id FROM user_skills_teach WHERE user_id=?", [targetId]);
    const [theirWant]   = await db.query("SELECT skill_id FROM user_skills_learn WHERE user_id=?", [targetId]);

    const myTeachIds    = myTeach.map(r => r.skill_id);
    const myWantIds     = myWant.map(r => r.skill_id);
    const theirTeachIds = theirTeach.map(r => r.skill_id);
    const theirWantIds  = theirWant.map(r => r.skill_id);

    const canTeachMe    = theirTeachIds.some(id => myWantIds.includes(id));
    const iCanTeachThem = myTeachIds.some(id => theirWantIds.includes(id));
    const barterReady   = canTeachMe && iCanTeachThem;

    const matchScore = skillMatchScore(myTeachIds, myWantIds, theirTeachIds, theirWantIds);

    res.json({ barter_ready: barterReady, match_score: matchScore });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
