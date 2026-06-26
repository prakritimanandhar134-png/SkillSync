const SKILL_COLORS = {
  "Programming": { bg: "#EEF2FF", color: "#4338CA" },
  "Design": { bg: "#FDF2F8", color: "#9D174D" },
  "Data Science": { bg: "#ECFDF5", color: "#065F46" },
  "Web Dev": { bg: "#FFF7ED", color: "#9A3412" },
  "ML/AI": { bg: "#F0FDF4", color: "#166534" },
  "DevOps": { bg: "#EFF6FF", color: "#1E40AF" },
  "UI/UX": { bg: "#FDF4FF", color: "#7E22CE" },
  "Mobile": { bg: "#FFF1F2", color: "#9F1239" },
};

export default function TutorCard({ tutor, onBookSession }) {
  const skillStyle = SKILL_COLORS[tutor.primarySkill] || { bg: "#F0EFFE", color: "#4B44CC" };

  return (
    <div className="card" style={{ padding: 20, cursor: "pointer" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
        <div className="avatar" style={{
          width: 52, height: 52, fontSize: 18,
          background: tutor.avatarGrad || "linear-gradient(135deg, #6C63FF, #43D9AD)"
        }}>
          {tutor.avatar || tutor.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>
              {tutor.name}
            </p>
            {tutor.isOnline && (
              <span style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, fontWeight: 600, color: "#059669"
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block" }}/>
                Online
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {tutor.university} · {tutor.year}
          </p>
          {/* Stars */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <div className="stars" style={{ fontSize: 12 }}>
              {"★".repeat(Math.floor(tutor.rating))}{"☆".repeat(5 - Math.floor(tutor.rating))}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
              {tutor.rating}
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              ({tutor.sessions} sessions)
            </span>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {tutor.skills.map(skill => (
          <span key={skill} style={{
            padding: "3px 10px",
            background: SKILL_COLORS[skill]?.bg || "#F0EFFE",
            color: SKILL_COLORS[skill]?.color || "#4B44CC",
            borderRadius: 99, fontSize: 11, fontWeight: 500
          }}>{skill}</span>
        ))}
      </div>

      {/* Bio */}
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.5 }}>
        {tutor.bio}
      </p>

      {/* Match score */}
      {tutor.matchScore && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 12px",
          background: "#ECFDF5", borderRadius: "var(--radius-md)",
          marginBottom: 14
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#065F46" }}>
            {tutor.matchScore}% skill match
          </span>
          <span style={{ fontSize: 11, color: "#34D399", marginLeft: "auto" }}>Top Pick</span>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
            {tutor.rate === 0 ? "Free" : `$${tutor.rate}/hr`}
          </span>
          {tutor.rate > 0 && (
            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>via Google Meet</span>
          )}
        </div>
        <button
          onClick={() => onBookSession?.(tutor)}
          style={{
            padding: "8px 18px",
            background: "var(--primary)",
            color: "white", border: "none",
            borderRadius: "var(--radius-full)",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex", alignItems: "center", gap: 6
          }}
          onMouseEnter={e => e.target.style.background = "var(--primary-dark)"}
          onMouseLeave={e => e.target.style.background = "var(--primary)"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Book Session
        </button>
      </div>
    </div>
  );
}
