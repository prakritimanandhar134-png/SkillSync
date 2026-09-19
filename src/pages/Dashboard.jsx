import { useState, useEffect } from "react";
import {
  getRecommendations,
  getMySessions,
  getMySkills,
  getPendingSessions,
  completeSession,
  submitReview,
  getSessionReview,
} from "../api";
import BookingModal from "../components/BookingModal";


function Avatar({ grad, initials, size = 46 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          grad || "linear-gradient(135deg,#6C63FF,#A89BFF)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Space Grotesk',sans-serif",
        fontWeight: 700,
        fontSize: size * 0.28,
        color: "white",
        flexShrink: 0
      }}
    >
      {initials}
    </div>
  );
}


function getInitials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}


function getGrad(id) {
  const grads = [
    "linear-gradient(135deg,#6C63FF,#A89BFF)",
    "linear-gradient(135deg,#FF6584,#FFB347)",
    "linear-gradient(135deg,#43D9AD,#4ADE80)",
    "linear-gradient(135deg,#3B82F6,#8B5CF6)",
    "linear-gradient(135deg,#F59E0B,#EF4444)",
    "linear-gradient(135deg,#EC4899,#F97316)",
    "linear-gradient(135deg,#14B8A6,#0EA5E9)"
  ];

  return grads[id % grads.length];
}


export default function Dashboard({ navigate, showToast }) {
  const [tutors, setTutors] = useState([]);
  const [sessions, setSessions] = useState([]);
 const [pendingRequests, setPendingRequests] = useState([]);
  const [mySkills, setMySkills] = useState([]);
 

 const [loading, setLoading] = useState(true);
const [bookingTutor, setBookingTutor] = useState(null);
const [currentUser, setCurrentUser] = useState(null);

// Rating states
const [reviewSession, setReviewSession] = useState(null);
const [reviewRating, setReviewRating] = useState(0);
const [reviewComment, setReviewComment] = useState("");
const [reviewSubmitting, setReviewSubmitting] = useState(false);
const [reviewedSessions, setReviewedSessions] = useState({});
  const refreshSessions = async () => {
  try {
    const [updatedSessions, updatedPending] = await Promise.all([
      getMySessions(),
      getPendingSessions()
    ]);

    setSessions(
      Array.isArray(updatedSessions)
        ? updatedSessions
        : []
    );

    setPendingRequests(
      Array.isArray(updatedPending)
        ? updatedPending
        : []
    );

  } catch (error) {
    console.error(
      "Failed to refresh sessions:",
      error
    );
  }
};


// ============================================
// ACCEPT SESSION
// ============================================

const handleAcceptSession = async (sessionId) => {

  try {

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5001/api/sessions/${sessionId}/accept`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to accept session."
      );
    }

    showToast("Session accepted successfully! 🎉", "success");
    // Refresh sessions + pending requests
    await refreshSessions();

  } catch (error) {

    console.error(
      "Accept session error:",
      error
    );

    showToast(
  error.message ||
  "Failed to accept session.",
  "error"
);
  }
};


// ============================================
// REJECT SESSION
// ============================================

const handleRejectSession = async (sessionId) => {

  const reason = window.prompt(
    "Please enter a reason for rejecting this request:"
  );

  if (reason === null) {
    return;
  }

  if (!reason.trim()) {
    alert("Rejection reason is required.");
    return;
  }

  try {

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5001/api/sessions/${sessionId}/reject`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: reason.trim()
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to reject session."
      );
    }

    showToast("Session rejected.", "success");
    // Refresh sessions + pending requests
    await refreshSessions();

  } catch (error) {

    console.error(
      "Reject session error:",
      error
    );

    showToast(
      error.message ||
      "Failed to reject session.",
      "error"
    );
  }
};

// ============================================
// CANCEL SESSION
// ============================================

const handleCancelSession = async (sessionId) => {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this session?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5001/api/sessions/${sessionId}/cancel`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Failed to cancel session."
      );
    }

    showToast("Session cancelled successfully.", "success");

    await refreshSessions();

  } catch (error) {
    console.error(
      "Cancel session error:",
      error
    );

     showToast(
    error.message ||
    "Failed to cancel session.",
    "error"
  );
  }
};

const handleCompleteSession = async (sessionId) => {
  try {
    await completeSession(sessionId);

  setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId
          ? { ...session, status: "completed" }
          : session
      )
    );
    
    showToast("Session marked as completed.", "success");

    // Use your existing function that refreshes Dashboard data
    await loadDashboardData();
  } catch (error) {
    console.error("Complete session error:", error);

    showToast(
      error.message || "Failed to mark session as completed.",
      "error"
    );
  }
};

// ============================================
// OPEN REVIEW MODAL
// ============================================

const handleOpenReview = async (session) => {
  try {
    const existingReview = await getSessionReview(session.id);

    // If a review already exists, do not allow another review
    if (existingReview) {
      showToast("You have already reviewed this session.", "info");
      return;
    }

    setReviewSession(session);
    setReviewRating(0);
    setReviewComment("");

  } catch (error) {
    console.error("Check review error:", error);

    // If the backend returns 404, it normally means
    // no review exists yet, so open the modal.
    if (
      error.message?.toLowerCase().includes("not found") ||
      error.message?.includes("404")
    ) {
      setReviewSession(session);
      setReviewRating(0);
      setReviewComment("");
    } else {
      showToast(
        error.message || "Unable to check review status.",
        "error"
      );
    }
  }
};


// ============================================
// SUBMIT REVIEW
// ============================================

const handleSubmitReview = async () => {
  if (!reviewSession) return;

  if (!reviewRating) {
    showToast("Please select a rating first.", "error");
    return;
  }

  try {
    setReviewSubmitting(true);

    await submitReview({
      session_id: reviewSession.id,
      rating: reviewRating,
      comment: reviewComment.trim()
    });

    setReviewedSessions(previous => ({
      ...previous,
      [reviewSession.id]: true
    }));

    showToast("Thank you for your review! ⭐", "success");

    setReviewSession(null);
    setReviewRating(0);
    setReviewComment("");

    await refreshSessions();

  } catch (error) {
    console.error("Submit review error:", error);

    showToast(
      error.message || "Failed to submit review.",
      "error"
    );

  } finally {
    setReviewSubmitting(false);
  }
};

  // ============================================
  // LOAD DASHBOARD DATA
  // ============================================

  useEffect(() => {

    const user = localStorage.getItem("user");

    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (error) {
        console.error("Invalid user data:", error);
      }
    }


    const fetchData = async () => {

      try {

       const [
  tutorData,
  sessionData,
  mySkillsData,
  pendingData
] = await Promise.all([
  getRecommendations(),
  getMySessions(),
  getMySkills(),
  getPendingSessions()
]);
console.log("PENDING DATA:", pendingData);

        setTutors(
          Array.isArray(tutorData)
            ? tutorData
            : []
        );


        setSessions(
          Array.isArray(sessionData)
            ? sessionData
            : []
        );
setPendingRequests(
  Array.isArray(pendingData)
    ? pendingData
    : []
);

        setMySkills(
          Array.isArray(mySkillsData)
            ? mySkillsData
            : []
        );

      } catch (err) {

        console.error(
          "Dashboard fetch error:",
          err
        );

      } finally {

        setLoading(false);

      }

    };

    fetchData();

  }, []);


  // ============================================
  // MY SKILLS
  // ============================================

  const myTeaches = mySkills.filter(
    skill => skill.type === "teach"
  );


  const myWants = mySkills.filter(
    skill => skill.type === "learn"
  );


  // IMPORTANT:
  // Convert skill objects into lowercase names.
  //
  // Example:
  // { id: 1, name: "React" }
  //
  // becomes:
  // "react"

  const myWantNames = myWants.map(
    skill => String(skill.name || "").toLowerCase()
  );


  // ============================================
  // SESSIONS
  // ============================================

  const upcomingSessions = sessions.filter(
    s =>
      s.status === "upcoming" 
  );
  
const myPendingRequests = sessions.filter(
  s =>
    s.status === "requested" &&
    s.student_id === currentUser?.id
);

const incomingPendingRequests =
  pendingRequests;
  // ============================================
  // BARTER MATCHES
  // ============================================

  const barterMatches = tutors.filter(
    tutor => tutor.barter_ready
  );


  // ============================================
  // LOADING
  // ============================================

  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F3F4F6"
        }}
      >

        <div style={{ textAlign: "center" }}>

          <div
            style={{
              width: 48,
              height: 48,
              border: "4px solid #E5E7EB",
              borderTopColor: "#6C63FF",
              borderRadius: "50%",
              animation:
                "spin 0.8s linear infinite",
              margin: "0 auto 16px"
            }}
          />

          <p
            style={{
              color: "#6B7280",
              fontSize: 14
            }}
          >
            Loading your dashboard...
          </p>

        </div>

        <style>
          {`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>

      </div>
    );
  }


  // ============================================
  // DASHBOARD
  // ============================================

  return (

    <div
      style={{
        background: "#F3F4F6",
        minHeight: "100vh",
        fontFamily: "'Inter',sans-serif",
        padding: "32px 0"
      }}
    >

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px"
        }}
      >


        {/* =========================================
            HEADER
        ========================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28
          }}
        >

          <div>

            <p
              style={{
                fontSize: 13,
                color: "#9CA3AF",
                marginBottom: 2
              }}
            >
              Good afternoon 👋
            </p>

            <h1
              style={{
                fontFamily:
                  "'Space Grotesk',sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: "#111827"
              }}
            >
              Welcome back,{" "}
              {currentUser?.full_name
                ?.split(" ")[0] || "there"}!
            </h1>

          </div>


          <button
            onClick={() => navigate("explore")}
            style={{
              padding: "10px 22px",
              background:
                "linear-gradient(135deg,#6C63FF,#4F46E5)",
              color: "white",
              border: "none",
              borderRadius: 99,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            🔍 Find a Match
          </button>

        </div>



        {/* =========================================
            BARTER PROFILE
        ========================================== */}

        <div
          style={{
            background:
              "linear-gradient(135deg,#EEF2FF,#E0E7FF)",
            borderRadius: 14,
            padding: "16px 22px",
            marginBottom: 24,
            border: "1px solid #C7D2FE",
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap"
          }}
        >

          <div style={{ flex: 1 }}>

            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#4338CA",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 8
              }}
            >
              ⚡ Your Barter Profile
            </p>


            <div
              style={{
                display: "flex",
                gap: 24,
                flexWrap: "wrap"
              }}
            >


              {/* ===========================
                  TEACH SKILLS
              ============================ */}

              <div>

                <p
                  style={{
                    fontSize: 11,
                    color: "#6B7280",
                    marginBottom: 4
                  }}
                >
                  You Teach:
                </p>


                <div
                  style={{
                    display: "flex",
                    gap: 5,
                    flexWrap: "wrap"
                  }}
                >

                  {myTeaches.length === 0 ? (

                    <span
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF"
                      }}
                    >
                      No skills added
                    </span>

                  ) : (

                    myTeaches.map(skill => (

                      <span
                        key={skill.id}
                        style={{
                          padding: "3px 10px",
                          background: "#EEF2FF",
                          color: "#4338CA",
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 600,
                          border:
                            "1px solid #C7D2FE"
                        }}
                      >
                        ⚡ {skill.name}
                      </span>

                    ))

                  )}

                </div>

              </div>



              {/* ===========================
                  LEARN SKILLS
              ============================ */}

              <div>

                <p
                  style={{
                    fontSize: 11,
                    color: "#6B7280",
                    marginBottom: 4
                  }}
                >
                  You Want to Learn:
                </p>


                <div
                  style={{
                    display: "flex",
                    gap: 5,
                    flexWrap: "wrap"
                  }}
                >

                  {myWants.length === 0 ? (

                    <span
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF"
                      }}
                    >
                      No skills added
                    </span>

                  ) : (

                    myWants.map(skill => (

                      <span
                        key={skill.id}
                        style={{
                          padding: "3px 10px",
                          background: "#ECFDF5",
                          color: "#059669",
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 600,
                          border:
                            "1px solid #BBF7D0"
                        }}
                      >
                        ✓ {skill.name}
                      </span>

                    ))

                  )}

                </div>

              </div>

            </div>

          </div>


          {/* BARTER COUNT */}

          <div
            style={{
              textAlign: "center",
              background: "white",
              padding: "12px 20px",
              borderRadius: 12,
              border: "1px solid #C7D2FE"
            }}
          >

            <p
              style={{
                fontFamily:
                  "'Space Grotesk',sans-serif",
                fontSize: 24,
                fontWeight: 800,
                color: "#059669"
              }}
            >
              {barterMatches.length}
            </p>

            <p
              style={{
                fontSize: 11,
                color: "#6B7280"
              }}
            >
              Free barter matches
            </p>

          </div>

        </div>



        {/* =========================================
            STATS
        ========================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(5,1fr)",
            gap: 16,
            marginBottom: 28
          }}
        >

          {[
            {
              label: "Sessions Done",
              value:
                sessions.filter(
                  s => s.status === "completed"
                ).length,
              icon: "✅",
              delta: "Total completed",
              color: "#EEF2FF"
            },
            {
              label: "Upcoming",
              value:
                upcomingSessions.length,
              icon: "📅",
              delta: "Scheduled sessions",
              color: "#ECFDF5"
            },
           {
  label: "Pending Requests",
  value:
    myPendingRequests.length,
  icon: "⏳",
  delta: "Waiting for response",
  color: "#FFFBEB"
},
            {
              label: "Free Matches",
              value:
                barterMatches.length,
              icon: "🔄",
              delta: "Barter ready",
              color: "#FEF3C7"
            },
            {
              label: "Total Tutors",
              value:
                tutors.length,
              icon: "👥",
              delta: "In your network",
              color: "#FDF2F8"
            }
          ].map(s => (

            <div
              key={s.label}
              style={{
                background: "white",
                borderRadius: 14,
                padding: "18px 16px",
                border: "1px solid #F3F4F6",
                boxShadow:
                  "0 1px 6px rgba(0,0,0,0.04)"
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: 8
                }}
              >

                <p
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF"
                  }}
                >
                  {s.label}
                </p>

                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: s.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16
                  }}
                >
                  {s.icon}
                </div>

              </div>

              <p
                style={{
                  fontFamily:
                    "'Space Grotesk',sans-serif",
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: 2
                }}
              >
                {s.value}
              </p>

              <p
                style={{
                  fontSize: 11,
                  color: "#10B981",
                  fontWeight: 600
                }}
              >
                {s.delta}
              </p>

            </div>

          ))}

        </div>



        {/* =========================================
            MAIN CONTENT
        ========================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 320px",
            gap: 24
          }}
        >


          {/* =======================================
              AI RECOMMENDATIONS
          ======================================== */}

          <div>

            <div
              style={{
                background: "white",
                borderRadius: 16,
                border:
                  "1px solid #F3F4F6",
                padding: 22,
                marginBottom: 22
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: 18
                }}
              >

                <div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 2
                    }}
                  >

                    <span
                      style={{ fontSize: 16 }}
                    >
                      🤖
                    </span>

                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#6C63FF",
                        textTransform:
                          "uppercase",
                        letterSpacing: "0.06em"
                      }}
                    >
                      AI Recommendations
                    </p>

                  </div>

                  <h2
                    style={{
                      fontFamily:
                        "'Space Grotesk',sans-serif",
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#111827"
                    }}
                  >
                    Best matches for you
                  </h2>

                </div>


                <button
                  onClick={() =>
                    navigate("explore")
                  }
                  style={{
                    fontSize: 13,
                    color: "#6C63FF",
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  View all →
                </button>

              </div>



              {tutors.length === 0 ? (

                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px"
                  }}
                >

                  <p
                    style={{
                      fontSize: 32,
                      marginBottom: 8
                    }}
                  >
                    🔍
                  </p>

                  <p
                    style={{
                      fontSize: 14,
                      color: "#6B7280"
                    }}
                  >
                    No matches found yet.
                  </p>

                  <p
                    style={{
                      fontSize: 13,
                      color: "#9CA3AF"
                    }}
                  >
                    Add skills to your profile
                    to get matched!
                  </p>

                </div>

              ) : (

                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: 12
                  }}
                >

                  {tutors
                    .slice(0, 5)
                    .map(tutor => (

                    <div
                      key={tutor.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: 14,
                        borderRadius: 12,
                        border:
                          `1.5px solid ${
                            tutor.barter_ready
                              ? "#BBF7D0"
                              : "#F3F4F6"
                          }`,
                        background:
                          tutor.barter_ready
                            ? "#FAFFFE"
                            : "white",
                        transition:
                          "all 0.2s",
                        cursor: "pointer"
                      }}
                    >


                      {/* AVATAR */}

                      <div
                        style={{
                          position:
                            "relative"
                        }}
                      >

                        <Avatar
                          grad={getGrad(
                            tutor.id
                          )}
                          initials={getInitials(
                            tutor.full_name
                          )}
                          size={46}
                        />

                        {tutor.is_online ===
                          1 && (

                          <span
                            style={{
                              position:
                                "absolute",
                              bottom: 1,
                              right: 1,
                              width: 11,
                              height: 11,
                              borderRadius:
                                "50%",
                              background:
                                "#10B981",
                              border:
                                "2px solid white"
                            }}
                          />

                        )}

                      </div>



                      {/* USER INFORMATION */}

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0
                        }}
                      >

                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: 8,
                            marginBottom: 2
                          }}
                        >

                          <p
                            style={{
                              fontWeight: 700,
                              fontSize: 14,
                              color:
                                "#111827"
                            }}
                          >
                            {tutor.full_name}
                          </p>


                          {tutor.barter_ready && (

                            <span
                              style={{
                                padding:
                                  "2px 8px",
                                background:
                                  "#ECFDF5",
                                color:
                                  "#059669",
                                borderRadius:
                                  99,
                                fontSize: 10,
                                fontWeight: 700,
                                border:
                                  "1px solid #BBF7D0"
                              }}
                            >
                              🔄 Free Barter
                            </span>

                          )}


                          {tutor.match_score >
                            0 && (

                            <span
                              style={{
                                padding:
                                  "2px 8px",
                                background:
                                  "#EEF2FF",
                                color:
                                  "#4338CA",
                                borderRadius:
                                  99,
                                fontSize: 10,
                                fontWeight: 700
                              }}
                            >
                              {tutor.match_score}%
                              {" "}match
                            </span>

                          )}

                        </div>


                        <p
                          style={{
                            fontSize: 12,
                            color: "#9CA3AF",
                            marginBottom: 4
                          }}
                        >
                          {tutor.university ||
                            "University"}{" "}
                          ·{" "}
                          {tutor.year ||
                            "Student"}
                        </p>



                        {/* ==================================
                            TUTOR TEACHES SKILLS
                        =================================== */}

                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            flexWrap: "wrap"
                          }}
                        >

                          {(tutor.teaches || [])
                            .slice(0, 2)
                            .map((skill, index) => {

                              // Make sure skill is a string.
                              // Your backend normally sends
                              // skill names, but this prevents
                              // the React object error.

                              const skillName =
                                typeof skill ===
                                "object"
                                  ? skill.name
                                  : skill;

                              const normalizedSkill =
                                String(
                                  skillName || ""
                                ).toLowerCase();

                              const isWanted =
                                myWantNames.includes(
                                  normalizedSkill
                                );


                              return (

                                <span
                                  key={
                                    typeof skill ===
                                    "object"
                                      ? skill.id ||
                                        index
                                      : skill
                                  }
                                  style={{
                                    padding:
                                      "2px 8px",
                                    background:
                                      isWanted
                                        ? "#ECFDF5"
                                        : "#F3F4F6",
                                    color:
                                      isWanted
                                        ? "#059669"
                                        : "#374151",
                                    borderRadius:
                                      99,
                                    fontSize: 10,
                                    fontWeight: 500
                                  }}
                                >
                                  {isWanted
                                    ? "✓ "
                                    : ""}
                                  {skillName}
                                </span>

                              );

                            })}

                        </div>

                      </div>



                      {/* BOOKING */}

                      <div
                        style={{
                          textAlign: "right",
                          flexShrink: 0
                        }}
                      >

                        <p
                          style={{
                            fontSize: 11,
                            color: "#9CA3AF",
                            marginBottom: 2
                          }}
                        >
                          ⭐{" "}
                          {tutor.avg_rating ||
                            "New"}
                        </p>

                        <p
                          style={{
                            fontFamily:
                              "'Space Grotesk',sans-serif",
                            fontSize: 15,
                            fontWeight: 800,
                            color:
                              tutor.barter_ready
                                ? "#059669"
                                : "#6C63FF",
                            marginBottom: 6
                          }}
                        >
                          {tutor.barter_ready
                            ? "FREE"
                            : "Paid"}
                        </p>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setBookingTutor(
                              tutor
                            );
                          }}
                          style={{
                            padding:
                              "6px 14px",
                            background:
                              tutor.barter_ready
                                ? "#059669"
                                : "#6C63FF",
                            color: "white",
                            border: "none",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          {tutor.barter_ready
                            ? "🔄 Barter"
                            : "📅 Book"}
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>



          {/* =======================================
              SIDEBAR
          ======================================== */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18
            }}
          >


            {/* SESSIONS */}

            <div
              style={{
                background: "white",
                borderRadius: 16,
                border:
                  "1px solid #F3F4F6",
                padding: 20
              }}
            >

              <h2
                style={{
                  fontFamily:
                    "'Space Grotesk',sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#111827",
                  marginBottom: 14
                }}
              >
                📅 My Sessions
              </h2>


              {sessions.length === 0 ? (

                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 0"
                  }}
                >

                  <p
                    style={{
                      fontSize: 13,
                      color: "#9CA3AF"
                    }}
                  >
                    No sessions yet
                  </p>

                  <button
                    onClick={() =>
                      navigate("explore")
                    }
                    style={{
                      marginTop: 8,
                      padding: "6px 14px",
                      background:
                        "#6C63FF",
                      color: "white",
                      border: "none",
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Find a tutor
                  </button>

                </div>

              ) : (

                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: 10
                  }}
                >

                  {sessions
                    .slice(0, 4)
                    .map((s, i) => (

                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: 10,
                        padding: 10,
                        background:
                          s.status ===
                            "upcoming" ||
                          s.status ===
                            "requested"
                            ? "#F8F7FF"
                            : "white",
                        borderRadius: 10,
                        border:
                          "1px solid #F3F4F6"
                      }}
                    >

                     <Avatar
  grad={getGrad(
    s.tutor_id
  )}
  initials={getInitials(
    s.tutor_id === currentUser?.id
      ? s.student_name
      : s.tutor_name
  )}
  size={34}
/>

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0
                        }}
                      >

                        <p
  style={{
    fontSize: 13,
    fontWeight: 600,
    color: "#111827"
  }}
>
  {s.tutor_id === currentUser?.id
    ? s.student_name
    : s.tutor_name}
</p>

                        <p
                          style={{
                            fontSize: 11,
                            color: "#9CA3AF"
                          }}
                        >
                          {s.skill_name} ·{" "}
                          {new Date(
                            s.scheduled_at
                          ).toLocaleDateString()}
                        </p>

                      </div>

{s.status === "upcoming" ? (

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 5,
      alignItems: "flex-end"
    }}
  >

    <a
      href={s.meet_link}
      target="_blank"
      rel="noreferrer"
      style={{
        padding: "4px 10px",
        background: "#6C63FF",
        color: "white",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        textDecoration: "none"
      }}
    >
      🎥 Join
    </a>

{s.tutor_id === currentUser?.id &&
  s.status?.toLowerCase() === "upcoming" && (
  <button
    onClick={() => handleCompleteSession(s.id)}
    style={{
      padding: "4px 10px",
      background: "#ECFDF5",
      color: "#059669",
      border: "1px solid #A7F3D0",
      borderRadius: 99,
      fontSize: 10,
      fontWeight: 600,
      cursor: "pointer"
    }}
  >
    Mark as Completed
  </button>
)}

    <button
      onClick={() =>
        handleCancelSession(s.id)
      }
      style={{
        padding: "4px 10px",
        background: "#FEF2F2",
        color: "#DC2626",
        border: "1px solid #FECACA",
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 600,
        cursor: "pointer"
      }}
    >
      Cancel
    </button>

  </div>

) : s.status === "requested" ? (

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 5,
      alignItems: "flex-end"
    }}
  >

    <span
      style={{
        fontSize: 11,
        color: "#F59E0B",
        fontWeight: 600,
        background: "#FFFBEB",
        padding: "3px 8px",
        borderRadius: 99,
        border: "1px solid #FDE68A"
      }}
    >
      ⏳ Pending
    </span>

    <button
      onClick={() =>
        handleCancelSession(s.id)
      }
      style={{
        padding: "4px 10px",
        background: "#FEF2F2",
        color: "#DC2626",
        border: "1px solid #FECACA",
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 600,
        cursor: "pointer"
      }}
    >
      Cancel
    </button>

   

  </div>

) : s.status === "completed" ? (

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 5
    }}
  >

    <span
      style={{
        fontSize: 11,
        color: "#059669",
        fontWeight: 600
      }}
    >
      ✓ Completed
    </span>

    {s.tutor_id === currentUser?.id ? (

      <span
        style={{
          fontSize: 10,
          color: "#9CA3AF",
          textAlign: "right"
        }}
      >
        Student review
      </span>

    ) : reviewedSessions[s.id] ? (

      <span
        style={{
          fontSize: 10,
          color: "#059669",
          fontWeight: 600
        }}
      >
        ⭐ Reviewed
      </span>

    ) : (

      <button
        onClick={() => handleOpenReview(s)}
        style={{
          padding: "5px 10px",
          background: "#FEF3C7",
          color: "#B45309",
          border: "1px solid #FDE68A",
          borderRadius: 99,
          fontSize: 10,
          fontWeight: 700,
          cursor: "pointer"
        }}
      >
        ⭐ Rate Session
      </button>

    )}

  </div>

) : (

  <span
    style={{
      fontSize: 11,
      color: "#9CA3AF",
      fontWeight: 500
    }}
  >
    Done
  </span>

)}

                    </div>

                  ))}

                </div>

              )}

            </div>

            {/* =======================================
                PENDING SESSION REQUESTS
            ======================================== */}

            {pendingRequests.length > 0 && (
              <div
                style={{
                  background: "white",
                  borderRadius: 16,
                  border: "1px solid #FDE68A",
                  padding: 20
                }}
              >

                {/* HEADER */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14
                  }}
                >

                  <div>

                    <h2
                      style={{
                        fontFamily:
                          "'Space Grotesk',sans-serif",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#111827",
                        marginBottom: 3
                      }}
                    >
                      🔔 Pending Requests
                    </h2>

                    <p
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF"
                      }}
                    >
                      Students waiting for your response
                    </p>

                  </div>


                  <span
                    style={{
                      minWidth: 26,
                      height: 26,
                      padding: "0 8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#FEF3C7",
                      color: "#B45309",
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 700
                    }}
                  >
                    {pendingRequests.length}
                  </span>

                </div>


                {/* REQUEST LIST */}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                  }}
                >

                  {pendingRequests.map((request) => (

                    <div
                      key={request.id}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: "#FFFBEB",
                        border: "1px solid #FDE68A"
                      }}
                    >

                      {/* STUDENT INFORMATION */}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 10
                        }}
                      >

                        <Avatar
                          grad={getGrad(
                            request.student_id
                          )}
                          initials={getInitials(
                            request.student_name
                          )}
                          size={38}
                        />


                        <div
                          style={{
                            flex: 1,
                            minWidth: 0
                          }}
                        >

                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#111827"
                            }}
                          >
                            {request.student_name}
                          </p>

                          <p
                            style={{
                              fontSize: 11,
                              color: "#6B7280"
                            }}
                          >
                            {request.university ||
                              "Student"}{" "}
                            ·{" "}
                            {request.year ||
                              ""}
                          </p>

                        </div>

                      </div>


                      {/* SESSION DETAILS */}

                      <div
                        style={{
                          background: "white",
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 10
                        }}
                      >

                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#111827",
                            marginBottom: 5
                          }}
                        >
                          📚 {request.skill_name}
                        </p>


                        <p
                          style={{
                            fontSize: 11,
                            color: "#6B7280",
                            marginBottom: 3
                          }}
                        >
                          📅{" "}
                          {new Date(
                            request.scheduled_at
                          ).toLocaleString()}
                        </p>


                        {request.topic && (

                          <p
                            style={{
                              fontSize: 11,
                              color: "#6B7280"
                            }}
                          >
                            💬 {request.topic}
                          </p>

                        )}

                      </div>


                      {/* ACCEPT / REJECT */}

                      <div
                        style={{
                          display: "flex",
                          gap: 8
                        }}
                      >

                        <button
                          onClick={() =>
                            handleAcceptSession(
                              request.id
                            )
                          }
                          style={{
                            flex: 1,
                            padding: "8px 10px",
                            background: "#059669",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          ✓ Accept
                        </button>


                        <button
                          onClick={() =>
                            handleRejectSession(
                              request.id
                            )
                          }
                          style={{
                            flex: 1,
                            padding: "8px 10px",
                            background: "#FEF2F2",
                            color: "#DC2626",
                            border:
                              "1px solid #FECACA",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          ✕ Reject
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            )}

             

            {/* BARTER STATUS */}

            <div
              style={{
                background:
                  "linear-gradient(135deg,#059669,#10B981)",
                borderRadius: 16,
                padding: 22,
                color: "white"
              }}
            >

              <p
                style={{
                  fontSize: 12,
                  opacity: 0.8,
                  marginBottom: 4
                }}
              >
                Barter Status
              </p>

              <p
                style={{
                  fontFamily:
                    "'Space Grotesk',sans-serif",
                  fontSize: 28,
                  fontWeight: 800,
                  marginBottom: 4
                }}
              >
                {barterMatches.length}
                {" "}Free 🔄
              </p>

              <p
                style={{
                  fontSize: 12,
                  opacity: 0.8,
                  marginBottom: 18
                }}
              >
                Skill exchange matches ready
              </p>

              <button
                onClick={() =>
                  navigate("explore")
                }
                style={{
                  width: "100%",
                  padding: 10,
                  background:
                    "rgba(255,255,255,0.2)",
                  color: "white",
                  border:
                    "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 99,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                View all barter matches
              </button>

            </div>



            {/* ADD SKILL */}

            <div
              style={{
                background: "#FFFBEB",
                borderRadius: 16,
                border:
                  "1px solid #FDE68A",
                padding: 20
              }}
            >

              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#92400E",
                  marginBottom: 6
                }}
              >
                🎓 Expand your barter profile
              </p>

              <p
                style={{
                  fontSize: 13,
                  color: "#B45309",
                  marginBottom: 14,
                  lineHeight: 1.5
                }}
              >
                Add more skills to unlock
                free barter matches.
              </p>

              <button
                onClick={() =>
                  navigate("profile")
                }
                style={{
                  width: "100%",
                  padding: 10,
                  background: "#F59E0B",
                  color: "white",
                  border: "none",
                  borderRadius: 99,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                + Add a skill
              </button>

            </div>

          </div>

        </div>

      </div>



      {/* BOOKING MODAL */}

      {bookingTutor && (

        <BookingModal
  tutor={{
    ...bookingTutor,
    name: bookingTutor.full_name,
    barter: bookingTutor.barter_ready,
    rate: bookingTutor.hourly_rate || 0
  }}
  onClose={() => setBookingTutor(null)}
  showToast={showToast}
/>

      )}
{/* REVIEW MODAL */}

{reviewSession && (

  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      zIndex: 9999
    }}
  >

    <div
      style={{
        width: "100%",
        maxWidth: 420,
        background: "white",
        borderRadius: 18,
        padding: 24,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18
        }}
      >

        <div>
          <h2
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 20,
              fontWeight: 800,
              color: "#111827",
              marginBottom: 4
            }}
          >
            Rate Your Session ⭐
          </h2>

          <p
            style={{
              fontSize: 12,
              color: "#6B7280"
            }}
          >
            How was your session with{" "}
            <strong>
              {reviewSession.tutor_name}
            </strong>?
          </p>
        </div>

        <button
          onClick={() => setReviewSession(null)}
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "none",
            background: "#F3F4F6",
            color: "#6B7280",
            fontSize: 18,
            cursor: "pointer"
          }}
        >
          ×
        </button>

      </div>


      {/* STAR RATING */}

      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#374151",
          marginBottom: 10
        }}
      >
        Your rating
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 20
        }}
      >

        {[1, 2, 3, 4, 5].map(star => (

          <button
            key={star}
            onClick={() => setReviewRating(star)}
            style={{
              border: "none",
              background: "none",
              fontSize: 34,
              cursor: "pointer",
              color:
                star <= reviewRating
                  ? "#F59E0B"
                  : "#D1D5DB",
              transition: "transform 0.15s"
            }}
          >
            ★
          </button>

        ))}

      </div>


      {/* COMMENT */}

      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 700,
          color: "#374151",
          marginBottom: 8
        }}
      >
        Comment (optional)
      </label>

      <textarea
        value={reviewComment}
        onChange={e => setReviewComment(e.target.value)}
        placeholder="Share your experience..."
        rows={4}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #E5E7EB",
          resize: "vertical",
          fontFamily: "inherit",
          fontSize: 13,
          outline: "none",
          marginBottom: 18,
          boxSizing: "border-box"
        }}
      />


      {/* ACTIONS */}

      <div
        style={{
          display: "flex",
          gap: 10
        }}
      >

        <button
          onClick={() => setReviewSession(null)}
          disabled={reviewSubmitting}
          style={{
            flex: 1,
            padding: 11,
            background: "#F3F4F6",
            color: "#374151",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleSubmitReview}
          disabled={reviewSubmitting || !reviewRating}
          style={{
            flex: 1,
            padding: 11,
            background:
              reviewSubmitting || !reviewRating
                ? "#D1D5DB"
                : "#6C63FF",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor:
              reviewSubmitting || !reviewRating
                ? "not-allowed"
                : "pointer"
          }}
        >
          {reviewSubmitting
            ? "Submitting..."
            : "Submit Review"}
        </button>

      </div>

    </div>

  </div>

)}
    </div>

  );
}