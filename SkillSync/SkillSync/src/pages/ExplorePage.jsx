import { useState, useMemo } from "react";
import TutorCard from "../components/TutorCard";
import BookingModal from "../components/BookingModal";

const ALL_TUTORS = [
  { id: 1, name: "Tanvir Khan", university: "IIT Bombay", year: "CS 3rd Year", rating: 4.9, sessions: 87, rate: 0, skills: ["React", "Web Dev", "Node.js"], primarySkill: "Web Dev", bio: "Full-stack dev. I'll help you build real-world projects using React & Node. Learn by building.", matchScore: 98, isOnline: true, avatarGrad: "linear-gradient(135deg, #6C63FF, #A89BFF)" },
  { id: 2, name: "Aisha Patel", university: "BITS Pilani", year: "AI/ML 4th Year", rating: 4.8, sessions: 62, rate: 150, skills: ["ML/AI", "Data Science", "Python"], primarySkill: "ML/AI", bio: "NLP researcher passionate about teaching. I make complex algorithms feel intuitive.", matchScore: 94, isOnline: true, avatarGrad: "linear-gradient(135deg, #FF6584, #FFB347)" },
  { id: 3, name: "Dev Mehta", university: "NIT Surathkal", year: "CS 2nd Year", rating: 4.7, sessions: 34, rate: 100, skills: ["UI/UX", "Design", "Figma"], primarySkill: "Design", bio: "Product designer. From wireframe to pixel-perfect Figma — I'll get you there fast.", matchScore: 89, isOnline: false, avatarGrad: "linear-gradient(135deg, #43D9AD, #4ADE80)" },
  { id: 4, name: "Sanya Gupta", university: "IIIT Hyderabad", year: "CS 4th Year", rating: 4.9, sessions: 120, rate: 200, skills: ["Programming", "Data Science", "Python"], primarySkill: "Programming", bio: "Google SWE intern. I specialize in cracking coding interviews and DSA patterns.", matchScore: 85, isOnline: true, avatarGrad: "linear-gradient(135deg, #3B82F6, #8B5CF6)" },
  { id: 5, name: "Rohan Das", university: "VIT Vellore", year: "ECE 3rd Year", rating: 4.6, sessions: 28, rate: 80, skills: ["Mobile", "Programming", "Web Dev"], primarySkill: "Mobile", bio: "Android & Flutter dev. I'll take you from zero to your first published app.", matchScore: 76, isOnline: false, avatarGrad: "linear-gradient(135deg, #F59E0B, #EF4444)" },
  { id: 6, name: "Priya Nair", university: "IIT Delhi", year: "Design 3rd Year", rating: 4.8, sessions: 45, rate: 120, skills: ["UI/UX", "Design", "Figma"], primarySkill: "UI/UX", bio: "Interaction designer and Figma power-user. I teach design systems and motion design too.", matchScore: 92, isOnline: true, avatarGrad: "linear-gradient(135deg, #EC4899, #F97316)" },
  { id: 7, name: "Arjun Verma", university: "DTU", year: "CS 2nd Year", rating: 4.5, sessions: 19, rate: 60, skills: ["Web Dev", "Programming", "React"], primarySkill: "Web Dev", bio: "Enthusiastic full-stack learner. Great at explaining HTML/CSS/JS basics to absolute beginners.", matchScore: 70, isOnline: false, avatarGrad: "linear-gradient(135deg, #14B8A6, #0EA5E9)" },
  { id: 8, name: "Meera Joshi", university: "BITS Goa", year: "CS 4th Year", rating: 4.9, sessions: 74, rate: 180, skills: ["DevOps", "Programming", "ML/AI"], primarySkill: "DevOps", bio: "AWS-certified. Docker, K8s, CI/CD pipelines — I'll have you DevOps-ready in weeks.", matchScore: 81, isOnline: true, avatarGrad: "linear-gradient(135deg, #6366F1, #8B5CF6)" },
];

const SKILL_FILTERS = ["All", "Web Dev", "Programming", "Design", "ML/AI", "UI/UX", "Data Science", "Mobile", "DevOps"];
const SORT_OPTIONS = ["Best Match", "Top Rated", "Most Sessions", "Price: Low to High"];

export default function ExplorePage({ navigate }) {
  const [search, setSearch] = useState("");
  const [activeSkill, setActiveSkill] = useState("All");
  const [sortBy, setSortBy] = useState("Best Match");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [bookingTutor, setBookingTutor] = useState(null);

  const filtered = useMemo(() => {
    let list = ALL_TUTORS.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.skills.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
        t.bio.toLowerCase().includes(search.toLowerCase());
      const matchSkill = activeSkill === "All" || t.skills.includes(activeSkill) || t.primarySkill === activeSkill;
      const matchOnline = !onlineOnly || t.isOnline;
      const matchFree = !freeOnly || t.rate === 0;
      return matchSearch && matchSkill && matchOnline && matchFree;
    });

    if (sortBy === "Top Rated") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sortBy === "Most Sessions") list = [...list].sort((a, b) => b.sessions - a.sessions);
    else if (sortBy === "Price: Low to High") list = [...list].sort((a, b) => a.rate - b.rate);
    else list = [...list].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return list;
  }, [search, activeSkill, sortBy, onlineOnly, freeOnly]);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF", padding: "32px 0" }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
            Explore Tutors
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {filtered.length} tutors found · AI-ranked by skill match
          </p>
        </div>

        {/* Search bar */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by skill, name, or topic..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: 48, fontSize: 15, height: 48 }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)"
            }}>✕</button>
          )}
        </div>

        {/* Skill filter pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {SKILL_FILTERS.map(skill => (
            <button key={skill} onClick={() => setActiveSkill(skill)} style={{
              padding: "7px 16px", borderRadius: 99,
              border: "1.5px solid", fontSize: 13, fontWeight: 500, cursor: "pointer",
              transition: "all 0.15s",
              borderColor: activeSkill === skill ? "var(--primary)" : "var(--border)",
              background: activeSkill === skill ? "var(--primary)" : "white",
              color: activeSkill === skill ? "white" : "var(--text-secondary)",
            }}>{skill}</button>
          ))}
        </div>

        {/* Filters row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24, padding: "14px 20px",
          background: "white", borderRadius: 12, border: "1px solid var(--border)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Online toggle */}
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div onClick={() => setOnlineOnly(!onlineOnly)} style={{
                width: 38, height: 20, borderRadius: 10,
                background: onlineOnly ? "var(--primary)" : "var(--border)",
                position: "relative", transition: "background 0.2s", cursor: "pointer"
              }}>
                <div style={{
                  position: "absolute", top: 2, left: onlineOnly ? 20 : 2,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "white", transition: "left 0.2s"
                }}/>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Online now</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div onClick={() => setFreeOnly(!freeOnly)} style={{
                width: 38, height: 20, borderRadius: 10,
                background: freeOnly ? "var(--primary)" : "var(--border)",
                position: "relative", transition: "background 0.2s", cursor: "pointer"
              }}>
                <div style={{
                  position: "absolute", top: 2, left: freeOnly ? 20 : 2,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "white", transition: "left 0.2s"
                }}/>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Free only</span>
            </label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Sort by</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: "6px 12px", borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border)", fontSize: 13, fontWeight: 500,
                color: "var(--text-primary)", background: "white", cursor: "pointer"
              }}
            >
              {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Results grid */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 20px",
            background: "white", borderRadius: 16, border: "1px solid var(--border)"
          }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              No tutors found
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {filtered.map(tutor => (
              <TutorCard key={tutor.id} tutor={tutor} onBookSession={() => setBookingTutor(tutor)} />
            ))}
          </div>
        )}
      </div>

      {bookingTutor && (
        <BookingModal tutor={bookingTutor} onClose={() => setBookingTutor(null)} />
      )}
    </div>
  );
}
