import { useState } from "react";
import BookingModal from "../components/BookingModal";

const RECOMMENDED_TUTORS = [
  {
    id: 1, name: "Tanvir Khan", university: "IIT Bombay", year: "CS 3rd Year",
    rating: 4.9, sessions: 87, rate: 0,
    skills: ["React", "Node.js", "TypeScript"], primarySkill: "Web Dev",
    bio: "Full-stack dev specializing in React & Node. I'll teach you to build real projects, not just tutorials.",
    matchScore: 98, isOnline: true,
    avatarGrad: "linear-gradient(135deg, #6C63FF, #A89BFF)"
  },
  {
    id: 2, name: "Aisha Patel", university: "BITS Pilani", year: "AI/ML 4th Year",
    rating: 4.8, sessions: 62, rate: 150,
    skills: ["ML/AI", "Python", "Data Science"], primarySkill: "ML/AI",
    bio: "NLP researcher. I make machine learning click through intuition, not just math.",
    matchScore: 94, isOnline: true,
    avatarGrad: "linear-gradient(135deg, #FF6584, #FFB347)"
  },
  {
    id: 3, name: "Dev Mehta", university: "NIT Surathkal", year: "CS 2nd Year",
    rating: 4.7, sessions: 34, rate: 100,
    skills: ["UI/UX", "Design", "Figma"], primarySkill: "Design",
    bio: "Product designer who cracked Figma from scratch. I'll take you from wireframe to pixel-perfect in weeks.",
    matchScore: 89, isOnline: false,
    avatarGrad: "linear-gradient(135deg, #43D9AD, #4ADE80)"
  },
];

const MY_SESSIONS = [
  { tutor: "Tanvir Khan", skill: "React", time: "Today, 4:00 PM", status: "upcoming", avatar: "TK", grad: "linear-gradient(135deg, #6C63FF, #A89BFF)" },
  { tutor: "Aisha Patel", skill: "Python ML", time: "Tomorrow, 2:00 PM", status: "upcoming", avatar: "AP", grad: "linear-gradient(135deg, #FF6584, #FFB347)" },
  { tutor: "Rohan Das", skill: "DSA", time: "Yesterday, 6:00 PM", status: "completed", avatar: "RD", grad: "linear-gradient(135deg, #3B82F6, #06B6D4)" },
];

const SKILL_PROGRESS = [
  { name: "React", progress: 72, color: "#6C63FF" },
  { name: "Node.js", progress: 55, color: "#10B981" },
  { name: "Python", progress: 88, color: "#3B82F6" },
  { name: "UI/UX", progress: 40, color: "#EC4899" },
];

export default function Dashboard({ navigate }) {
  const [bookingTutor, setBookingTutor] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF", padding: "32px 0" }}>
      <div className="container">
        {/* Welcome header */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Good afternoon 👋</p>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>
              Welcome back, Alex
            </h1>
          </div>
          <button onClick={() => navigate("explore")} className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Find a Tutor
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Sessions Completed", value: "24", icon: "✅", delta: "+3 this week" },
            { label: "Skills Learning", value: "4", icon: "📚", delta: "+1 this month" },
            { label: "Credits Earned", value: "180", icon: "💎", delta: "From teaching" },
            { label: "Avg. Session Rating", value: "4.8★", icon: "⭐", delta: "Top 10%" },
          ].map(s => (
            <div key={s.label} style={{
              background: "white", borderRadius: 14,
              padding: "20px", border: "1px solid var(--border)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{s.label}</p>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 11, color: "#10B981", fontWeight: 600 }}>{s.delta}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          {/* Main content */}
          <div>
            {/* AI Recommended Tutors */}
            <div style={{
              background: "white", borderRadius: 16,
              border: "1px solid var(--border)", padding: 24, marginBottom: 24
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>🤖</span>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      AI Recommendations
                    </p>
                  </div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>
                    Top tutors for you
                  </h2>
                </div>
                <button onClick={() => navigate("explore")} style={{
                  fontSize: 13, color: "var(--primary)", fontWeight: 600,
                  background: "none", border: "none", cursor: "pointer"
                }}>View all →</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {RECOMMENDED_TUTORS.map(tutor => (
                  <TutorRow key={tutor.id} tutor={tutor} onBook={() => setBookingTutor(tutor)} />
                ))}
              </div>
            </div>

            {/* Skill Progress */}
            <div style={{
              background: "white", borderRadius: 16,
              border: "1px solid var(--border)", padding: 24
            }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
                My Skill Progress
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {SKILL_PROGRESS.map(skill => (
                  <div key={skill.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{skill.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: skill.color }}>{skill.progress}%</span>
                    </div>
                    <div style={{ height: 8, background: "#F3F0FF", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${skill.progress}%`,
                        background: skill.color, borderRadius: 4,
                        transition: "width 1s ease"
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Upcoming Sessions */}
            <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: 24 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                📅 My Sessions
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {MY_SESSIONS.map((s, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px", background: s.status === "upcoming" ? "#F8F7FF" : "white",
                    borderRadius: 10, border: "1px solid var(--border)"
                  }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 12, background: s.grad }}>
                      {s.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.tutor}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.skill} · {s.time}</p>
                    </div>
                    {s.status === "upcoming" ? (
                      <button style={{
                        padding: "4px 10px",
                        background: "#6C63FF", color: "white",
                        border: "none", borderRadius: 99,
                        fontSize: 11, fontWeight: 600, cursor: "pointer"
                      }}>
                        🎥 Join
                      </button>
                    ) : (
                      <span style={{
                        padding: "4px 10px", background: "#F3F4F6",
                        color: "#6B7280", borderRadius: 99,
                        fontSize: 11, fontWeight: 500
                      }}>Done</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Credits card */}
            <div style={{
              background: "linear-gradient(135deg, #6C63FF, #4B44CC)",
              borderRadius: 16, padding: 24, color: "white"
            }}>
              <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>SkillBridge Credits</p>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
                180 <span style={{ fontSize: 20 }}>💎</span>
              </p>
              <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 20 }}>Earned by teaching peers</p>
              <button style={{
                width: "100%", padding: "10px",
                background: "rgba(255,255,255,0.2)",
                color: "white", border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 99, fontSize: 13, fontWeight: 600,
                cursor: "pointer"
              }}>Use credits to book sessions</button>
            </div>

            {/* Post a skill you can teach */}
            <div style={{
              background: "#ECFDF5", borderRadius: 16,
              border: "1px solid #BBF7D0", padding: 24
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#065F46", marginBottom: 6 }}>
                🎓 Start Teaching
              </p>
              <p style={{ fontSize: 13, color: "#047857", marginBottom: 16, lineHeight: 1.5 }}>
                Share a skill you know and earn credits to spend on your own learning.
              </p>
              <button style={{
                width: "100%", padding: "10px",
                background: "#10B981", color: "white",
                border: "none", borderRadius: 99,
                fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>
                + Add a skill to teach
              </button>
            </div>
          </div>
        </div>
      </div>

      {bookingTutor && (
        <BookingModal tutor={bookingTutor} onClose={() => setBookingTutor(null)} />
      )}
    </div>
  );
}

function TutorRow({ tutor, onBook }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px", borderRadius: 12,
      border: "1px solid var(--border)",
      transition: "all 0.2s", cursor: "pointer",
      background: "white"
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.background = "#FAFAFE"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "white"; }}
    >
      <div className="avatar" style={{ width: 48, height: 48, fontSize: 16, background: tutor.avatarGrad, position: "relative" }}>
        {tutor.name[0]}
        {tutor.isOnline && (
          <span style={{
            position: "absolute", bottom: 0, right: 0,
            width: 12, height: 12, borderRadius: "50%",
            background: "#10B981", border: "2px solid white"
          }}/>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <p style={{ fontWeight: 600, fontSize: 14 }}>{tutor.name}</p>
          {tutor.matchScore >= 90 && (
            <span style={{
              padding: "2px 8px", background: "#ECFDF5",
              color: "#065F46", borderRadius: 99,
              fontSize: 10, fontWeight: 700
            }}>{tutor.matchScore}% match</span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
          {tutor.university} · {tutor.year}
        </p>
        <div style={{ display: "flex", gap: 4 }}>
          {tutor.skills.slice(0, 2).map(s => (
            <span key={s} style={{
              padding: "2px 8px", background: "var(--primary-bg)",
              color: "var(--primary-dark)", borderRadius: 99,
              fontSize: 10, fontWeight: 500
            }}>{s}</span>
          ))}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: "var(--primary)" }}>
          {tutor.rate === 0 ? "Free" : `$${tutor.rate}/hr`}
        </p>
        <div style={{ color: "#FFB347", fontSize: 11, marginBottom: 6 }}>{"★".repeat(Math.floor(tutor.rating))}</div>
        <button onClick={e => { e.stopPropagation(); onBook(); }} style={{
          padding: "6px 14px", background: "var(--primary)",
          color: "white", border: "none", borderRadius: 99,
          fontSize: 12, fontWeight: 600, cursor: "pointer"
        }}>Book</button>
      </div>
    </div>
  );
}
