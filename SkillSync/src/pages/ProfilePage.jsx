import { useState } from "react";

const MY_SKILLS_TEACH = ["Python", "Data Structures", "Git & GitHub"];
const MY_SKILLS_LEARN = ["React", "Machine Learning", "Figma"];
const REVIEWS = [
  { name: "Priya S.", rating: 5, text: "Alex explained Python OOP in a way that finally clicked for me. Great session!", avatar: "PS", time: "2 days ago" },
  { name: "Karan M.", rating: 5, text: "Very patient and knowledgeable. Highly recommend for DSA prep.", avatar: "KM", time: "1 week ago" },
  { name: "Neha R.", rating: 4, text: "Good session on Git workflows. Would book again!", avatar: "NR", time: "2 weeks ago" },
];
const HISTORY = [
  { skill: "React", tutor: "Tanvir Khan", date: "June 5, 2025", duration: "60 min", status: "completed" },
  { skill: "Python", tutor: "Sanya Gupta", date: "May 28, 2025", duration: "90 min", status: "completed" },
  { skill: "UI/UX", tutor: "Dev Mehta", date: "May 20, 2025", duration: "60 min", status: "completed" },
];

export default function ProfilePage({ navigate }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);

  const tabs = ["overview", "sessions", "reviews", "settings"];

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF", padding: "32px 0" }}>
      <div className="container">
        {/* Profile Header */}
        <div style={{
          background: "linear-gradient(135deg, #6C63FF 0%, #4B44CC 100%)",
          borderRadius: 20, padding: "40px 32px", marginBottom: 24,
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", width: 300, height: 300, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)", top: -100, right: -60
          }}/>
          <div style={{
            position: "absolute", width: 200, height: 200, borderRadius: "50%",
            background: "rgba(255,255,255,0.04)", bottom: -80, left: 100
          }}/>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, position: "relative" }}>
            <div style={{ position: "relative" }}>
              <div className="avatar" style={{
                width: 96, height: 96, fontSize: 32,
                background: "rgba(255,255,255,0.2)",
                border: "3px solid rgba(255,255,255,0.5)"
              }}>A</div>
              <div style={{
                position: "absolute", bottom: 4, right: 4,
                width: 16, height: 16, borderRadius: "50%",
                background: "#10B981", border: "2px solid white"
              }}/>
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: "white", marginBottom: 4 }}>
                Alex Johnson
              </h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginBottom: 12 }}>
                Computer Science · IIIT Bangalore · 3rd Year
              </p>
              <div style={{ display: "flex", gap: 20 }}>
                {[
                  { label: "Sessions", value: "24" },
                  { label: "Skills Taught", value: "3" },
                  { label: "Credits", value: "180 💎" },
                  { label: "Rating", value: "4.8 ★" },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "white" }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                padding: "10px 20px", background: "rgba(255,255,255,0.15)",
                color: "white", border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4,
          background: "white", borderRadius: 12,
          border: "1px solid var(--border)",
          padding: 6, marginBottom: 24,
          width: "fit-content"
        }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 20px", borderRadius: 8,
              border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, textTransform: "capitalize",
              background: activeTab === tab ? "var(--primary)" : "transparent",
              color: activeTab === tab ? "white" : "var(--text-secondary)",
              transition: "all 0.15s"
            }}>{tab}</button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* About */}
              <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: 24 }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>About Me</h2>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  CS student with a passion for algorithms and open source. I love teaching Python and DSA — I believe anyone can learn to code with the right guidance. When I'm not coding, I'm contributing to OSS or playing badminton.
                </p>
              </div>

              {/* Skills I Teach */}
              <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700 }}>🎓 Skills I Can Teach</h2>
                  <button style={{ fontSize: 12, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>+ Add skill</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {MY_SKILLS_TEACH.map(s => (
                    <div key={s} style={{
                      padding: "8px 16px", background: "#ECFDF5",
                      border: "1px solid #BBF7D0", borderRadius: 99,
                      fontSize: 13, fontWeight: 600, color: "#065F46",
                      display: "flex", alignItems: "center", gap: 6
                    }}>
                      ✓ {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills I'm Learning */}
              <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700 }}>📚 Skills I Want to Learn</h2>
                  <button style={{ fontSize: 12, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>+ Add skill</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {MY_SKILLS_LEARN.map(s => (
                    <div key={s} style={{
                      padding: "8px 16px", background: "var(--primary-bg)",
                      border: "1px solid var(--border)", borderRadius: 99,
                      fontSize: 13, fontWeight: 600, color: "var(--primary-dark)",
                      display: "flex", alignItems: "center", gap: 6
                    }}>
                      → {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Availability */}
              <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: 24 }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>My Availability</h2>
                {[
                  { day: "Mon-Wed", time: "6PM – 9PM", active: true },
                  { day: "Thursday", time: "7PM – 10PM", active: true },
                  { day: "Saturday", time: "10AM – 1PM", active: true },
                  { day: "Sunday", time: "Unavailable", active: false },
                ].map(slot => (
                  <div key={slot.day} style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: 10
                  }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{slot.day}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: "3px 10px",
                      borderRadius: 99,
                      background: slot.active ? "#ECFDF5" : "#F3F4F6",
                      color: slot.active ? "#065F46" : "#9CA3AF"
                    }}>{slot.time}</span>
                  </div>
                ))}
                <button style={{
                  width: "100%", marginTop: 8,
                  padding: "8px", background: "var(--primary-bg)",
                  color: "var(--primary)", border: "1.5px solid var(--primary)",
                  borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer"
                }}>Edit availability</button>
              </div>

              {/* Badge */}
              <div style={{
                background: "linear-gradient(135deg, #FFF7ED, #FFFBEB)",
                borderRadius: 16, border: "1px solid #FDE68A",
                padding: 24, textAlign: "center"
              }}>
                <span style={{ fontSize: 36 }}>🏆</span>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#92400E", marginTop: 8 }}>
                  Rising Star
                </p>
                <p style={{ fontSize: 12, color: "#B45309", marginTop: 4 }}>
                  Top 15% of tutors this month
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700 }}>Session History</h2>
            </div>
            {HISTORY.map((h, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "16px 24px",
                borderBottom: i < HISTORY.length - 1 ? "1px solid var(--border)" : "none"
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: "var(--primary-bg)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                }}>💻</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{h.skill} with {h.tutor}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{h.date} · {h.duration}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{
                    padding: "4px 12px", background: "#ECFDF5",
                    color: "#065F46", borderRadius: 99, fontSize: 12, fontWeight: 600
                  }}>Completed</span>
                  <button style={{
                    padding: "6px 14px", background: "var(--primary-bg)",
                    color: "var(--primary)", border: "1px solid var(--border)",
                    borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer"
                  }}>🎥 Replay Notes</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
              background: "white", borderRadius: 16, border: "1px solid var(--border)",
              padding: 24, display: "flex", alignItems: "center", gap: 32
            }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 48, fontWeight: 800, color: "var(--primary)" }}>4.8</p>
                <div style={{ color: "#FFB347", fontSize: 20 }}>★★★★★</div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>24 reviews</p>
              </div>
              <div style={{ flex: 1 }}>
                {[5, 4, 3, 2, 1].map(n => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", width: 16 }}>{n}</span>
                    <div style={{ flex: 1, height: 6, background: "#F3F0FF", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 3, background: "var(--primary)",
                        width: n === 5 ? "80%" : n === 4 ? "15%" : "5%"
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {REVIEWS.map((r, i) => (
              <div key={i} style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: 24 }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div className="avatar" style={{
                    width: 40, height: 40, fontSize: 13,
                    background: "linear-gradient(135deg, #6C63FF, #43D9AD)"
                  }}>{r.avatar}</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</p>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <span style={{ color: "#FFB347", fontSize: 12 }}>{"★".repeat(r.rating)}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>· {r.time}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>"{r.text}"</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "settings" && (
          <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: 32, maxWidth: 560 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Account Settings</h2>
            {[
              { label: "Full Name", value: "Alex Johnson", type: "text" },
              { label: "Email", value: "alex@iiitb.ac.in", type: "email" },
              { label: "University", value: "IIIT Bangalore", type: "text" },
              { label: "Year", value: "3rd Year", type: "text" },
            ].map(field => (
              <div key={field.label} style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  defaultValue={field.value}
                  className="input"
                />
              </div>
            ))}
            <button className="btn btn-primary" style={{ marginTop: 8 }}>Save Changes</button>
          </div>
        )}
      </div>
    </div>
  );
}
