import { useState, useEffect } from "react";
import { getAllSkills } from "../api";

export default function SkillsPage({ navigate, showToast }) {
  const [skills,   setSkills]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
  getAllSkills()
    .then(data => {
      if (Array.isArray(data)) {
        setSkills(data);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("Get skills error:", err);
      setLoading(false);
      showToast("Failed to load skills.", "error");
    });
}, [showToast]);

  const filtered = skills.filter(s => {
    const matchCat    = category === "All" || s.category === category;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const programming = filtered.filter(s => s.category === "Programming");
  const design      = filtered.filter(s => s.category === "Design");

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F3F4F6" }}>
        <div style={{ width:48, height:48, border:"4px solid #E5E7EB", borderTopColor:"#6C63FF", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ background:"#F3F4F6", minHeight:"100vh", fontFamily:"'Inter',sans-serif" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:800, color:"#111827", marginBottom:4 }}>
            Browse Skills
          </h1>
          <p style={{ fontSize:14, color:"#6B7280" }}>
            {skills.length} skills available · Programming & Design
          </p>
        </div>

        {/* Search */}
        <div style={{ position:"relative", marginBottom:20 }}>
          <svg style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search skills..."
            style={{ width:"100%", padding:"12px 16px 12px 48px", border:"1.5px solid #E5E7EB", borderRadius:12, fontSize:14, outline:"none", background:"white", boxSizing:"border-box" }}
            onFocus={e => e.target.style.borderColor="#6C63FF"}
            onBlur={e => e.target.style.borderColor="#E5E7EB"}
          />
        </div>

        {/* Category filter */}
        <div style={{ display:"flex", gap:8, marginBottom:28 }}>
          {["All","Programming","Design"].map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding:"8px 20px", borderRadius:99, border:"1.5px solid",
              fontSize:14, fontWeight:500, cursor:"pointer",
              borderColor:category===cat?"#6C63FF":"#E5E7EB",
              background:category===cat?"#6C63FF":"white",
              color:category===cat?"white":"#6B7280",
              transition:"all 0.15s"
            }}>{cat}</button>
          ))}
        </div>

        {/* Programming Skills */}
        {(category==="All" || category==="Programming") && programming.length > 0 && (
          <div style={{ marginBottom:36 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:"linear-gradient(135deg,#7C3AED,#6C63FF)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>💻</div>
              <div>
                <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:700, color:"#111827" }}>Programming</h2>
                <p style={{ fontSize:13, color:"#9CA3AF" }}>{programming.length} skills</p>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
              {programming.map(skill => (
                <button key={skill.id} onClick={() => navigate("/explore")} style={{
                  background:"white", border:"1px solid #F3F4F6",
                  borderRadius:12, padding:"16px",
                  textAlign:"left", cursor:"pointer",
                  boxShadow:"0 1px 6px rgba(0,0,0,0.04)",
                  transition:"all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#6C63FF"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(108,99,255,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#F3F4F6"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 1px 6px rgba(0,0,0,0.04)"; }}
                >
                  <div style={{ width:36, height:36, borderRadius:8, background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:10 }}>💻</div>
                  <p style={{ fontSize:14, fontWeight:600, color:"#111827", marginBottom:4 }}>{skill.name}</p>
                  <p style={{ fontSize:11, color:"#9CA3AF" }}>Programming</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Design Skills */}
        {(category==="All" || category==="Design") && design.length > 0 && (
          <div style={{ marginBottom:36 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:"linear-gradient(135deg,#EC4899,#F97316)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🎨</div>
              <div>
                <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:700, color:"#111827" }}>Design</h2>
                <p style={{ fontSize:13, color:"#9CA3AF" }}>{design.length} skills</p>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
              {design.map(skill => (
                <button key={skill.id} onClick={() => navigate("/explore")} style={{
                  background:"white", border:"1px solid #F3F4F6",
                  borderRadius:12, padding:"16px",
                  textAlign:"left", cursor:"pointer",
                  boxShadow:"0 1px 6px rgba(0,0,0,0.04)",
                  transition:"all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#EC4899"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(236,72,153,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#F3F4F6"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 1px 6px rgba(0,0,0,0.04)"; }}
                >
                  <div style={{ width:36, height:36, borderRadius:8, background:"#FDF2F8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:10 }}>🎨</div>
                  <p style={{ fontSize:14, fontWeight:600, color:"#111827", marginBottom:4 }}>{skill.name}</p>
                  <p style={{ fontSize:11, color:"#9CA3AF" }}>Design</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"80px 20px", background:"white", borderRadius:16 }}>
            <p style={{ fontSize:32, marginBottom:12 }}>🔍</p>
            <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700, marginBottom:8 }}>No skills found</h3>
            <p style={{ color:"#9CA3AF" }}>Try a different search term</p>
          </div>
        )}

        {/* CTA */}
        <div style={{ background:"linear-gradient(135deg,#6C63FF,#4F46E5)", borderRadius:16, padding:"32px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:20 }}>
          <div>
            <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700, color:"white", marginBottom:6 }}>
              Don't see your skill?
            </h3>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.8)" }}>
              You can add any custom skill from your Profile page
            </p>
          </div>
          <button onClick={() => navigate("/profile")} style={{ padding:"12px 28px", background:"white", color:"#6C63FF", border:"none", borderRadius:99, fontSize:14, fontWeight:700, cursor:"pointer" }}>
            Add Custom Skill →
          </button>
        </div>
      </div>
    </div>
  );
}