import { useState, useEffect } from "react";
import {getAllSkills,addMySkill} from "../api";
const BASE_URL = "http://localhost:5001/api";
const getToken = () => localStorage.getItem("token");

const categories = [
"All",
"Programming",
"Design"
];

export default function SkillSelector({
  mode = "teach",
  onClose,
  onSkillAdded
}) {
  const [skills,      setSkills]      = useState([]);
  const [filtered,    setFiltered]    = useState([]);
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState("All");
  const [proficiency, setProficiency] = useState("Intermediate");
  const [hourlyRate,  setHourlyRate]  = useState(0);
  const [selected,    setSelected]    = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState("");
  const [error,       setError]       = useState("");

  // Custom skill
  const [customMode,      setCustomMode]      = useState(false);
  const [customSkillName, setCustomSkillName] = useState("");
  const [customCategory,  setCustomCategory]  = useState("Programming");

  useEffect(() => {
    getAllSkills().then(data => {
      if (Array.isArray(data)) { setSkills(data); setFiltered(data); }
    });
  }, []);

  useEffect(() => {
    let list = skills;
    if (category !== "All") list = list.filter(s => s.category === category);
    if (search) list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list);
  }, [search, category, skills]);

  // Add custom skill to DB then assign to user
  const handleAddCustom = async () => {
    if (!customSkillName.trim()) { setError("Please enter a skill name"); return; }
    setLoading(true); setError("");
    try {
      // First create the skill in DB
      const res = await fetch(`${BASE_URL}/skills/add`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ name: customSkillName.trim(), category: customCategory })
      });
      const data = await res.json();
      const skillId = data.skill_id;

      // Then assign to user
   await addMySkill({
  skill_id: skillId,
  type: mode,
  level: proficiency,
  hourly_rate: mode === "teach" ? Number(hourlyRate) : 0
});
      setSuccess(`✅ "${customSkillName}" added to your ${mode==="teach"?"teaching":"learning"} list!`);
      setCustomSkillName("");
      if (onSkillAdded) onSkillAdded();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to add custom skill. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selected) { setError("Please select a skill first"); return; }
    setLoading(true); setError("");
    try {
     await addMySkill({
  skill_id: selected.id,
  type: mode,
  level: proficiency,
  hourly_rate:mode === "teach" ? Number(hourlyRate) : 0
});
      setSuccess(`✅ "${selected.name}" added!`);
      setSelected(null);
      if (onSkillAdded) onSkillAdded();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to add skill.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(17,24,39,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div style={{ background:"white", borderRadius:20, width:"100%", maxWidth:580, maxHeight:"88vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 24px 80px rgba(108,99,255,0.2)" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:"1px solid #F3F4F6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700, color:"#111827" }}>Add a Skill</h2>
            <p style={{ fontSize:13, color:"#9CA3AF", marginTop:2 }}>Choose from list or add your own custom skill</p>
          </div>
          <button onClick={onClose} style={{ background:"#F3F4F6", border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer", fontSize:16 }}>✕</button>
        </div>

        {/* Teach / Learn toggle */}
        <div style={{ padding:"14px 24px", borderBottom:"1px solid #F3F4F6" }}>
          <div style={{ display:"flex", gap:0, background:"#F3F4F6", borderRadius:10, padding:4 }}>
            {["teach","learn"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex:1, padding:"8px", border:"none", cursor:"pointer",
                background:mode===m?"white":"transparent",
                color:mode===m?"#6C63FF":"#6B7280",
                fontWeight:mode===m?700:500, fontSize:14,
                borderRadius:8, transition:"all 0.15s",
                boxShadow:mode===m?"0 1px 4px rgba(0,0,0,0.1)":"none"
              }}>
                {m==="teach"?"⚡ I can Teach this":"📚 I want to Learn this"}
              </button>
            ))}
          </div>
        </div>

        {/* Custom / Browse toggle */}
        <div style={{ padding:"10px 24px", borderBottom:"1px solid #F3F4F6", display:"flex", gap:8 }}>
          <button onClick={() => setCustomMode(false)} style={{ padding:"6px 16px", borderRadius:99, border:"1.5px solid", fontSize:13, fontWeight:500, cursor:"pointer", borderColor:!customMode?"#6C63FF":"#E5E7EB", background:!customMode?"#6C63FF":"white", color:!customMode?"white":"#6B7280" }}>
            📋 Browse Skills
          </button>
          <button onClick={() => setCustomMode(true)} style={{ padding:"6px 16px", borderRadius:99, border:"1.5px solid", fontSize:13, fontWeight:500, cursor:"pointer", borderColor:customMode?"#6C63FF":"#E5E7EB", background:customMode?"#6C63FF":"white", color:customMode?"white":"#6B7280" }}>
            ✏️ Add Custom Skill
          </button>
        </div>

        {/* Custom skill input */}
        {customMode ? (
          <div style={{ padding:"20px 24px", flex:1 }}>
            <p style={{ fontSize:14, color:"#374151", fontWeight:600, marginBottom:16 }}>
              Can't find your skill? Add it manually!
            </p>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Skill Name</label>
              <input
                value={customSkillName}
                onChange={e => setCustomSkillName(e.target.value)}
                placeholder="e.g. Blender 3D, Kotlin, Ethical Hacking..."
                style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box" }}
                onFocus={e => e.target.style.borderColor="#6C63FF"}
                onBlur={e => e.target.style.borderColor="#E5E7EB"}
              />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Category</label>
              <select value={customCategory} onChange={e => setCustomCategory(e.target.value)} style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:14, outline:"none", background:"white" }}>
                {["Programming","Design"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {mode==="teach" && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Proficiency</label>
                  <select value={proficiency} onChange={e => setProficiency(e.target.value)} style={{ width:"100%", padding:"9px 10px", border:"1.5px solid #E5E7EB", borderRadius:8, fontSize:13, outline:"none", background:"white" }}>
                    {["Beginner","Intermediate","Advanced","Expert"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Rate (0 = Free)</label>
                  <input type="number" min="0" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} style={{ width:"100%", padding:"9px 10px", border:"1.5px solid #E5E7EB", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box" }}/>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Search + category filter */}
            <div style={{ padding:"12px 24px", borderBottom:"1px solid #F3F4F6" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills..." style={{ width:"100%", padding:"9px 14px", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:10 }}
                onFocus={e => e.target.style.borderColor="#6C63FF"}
                onBlur={e => e.target.style.borderColor="#E5E7EB"}
              />
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} style={{ padding:"4px 12px", borderRadius:99, border:"1.5px solid", fontSize:12, fontWeight:500, cursor:"pointer", borderColor:category===cat?"#6C63FF":"#E5E7EB", background:category===cat?"#6C63FF":"white", color:category===cat?"white":"#6B7280" }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills grid */}
            <div style={{ flex:1, overflowY:"auto", padding:"12px 24px" }}>
              {filtered.length===0 ? (
                <div style={{ textAlign:"center", padding:"30px 0" }}>
                  <p style={{ color:"#9CA3AF", marginBottom:10 }}>No skills found</p>
                  <button onClick={() => setCustomMode(true)} style={{ padding:"8px 18px", background:"#6C63FF", color:"white", border:"none", borderRadius:99, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    + Add custom skill
                  </button>
                </div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {filtered.map(skill => (
                    <button key={skill.id} onClick={() => setSelected(selected?.id===skill.id?null:skill)} style={{
                      padding:"10px 14px", borderRadius:10, cursor:"pointer",
                      border:`1.5px solid ${selected?.id===skill.id?"#6C63FF":"#E5E7EB"}`,
                      background:selected?.id===skill.id?"#F5F3FF":"white",
                      color:selected?.id===skill.id?"#6C63FF":"#374151",
                      fontSize:13, fontWeight:selected?.id===skill.id?600:400,
                      textAlign:"left", transition:"all 0.15s",
                      display:"flex", alignItems:"center", gap:8
                    }}>
                      {selected?.id===skill.id&&<span>✓</span>}
                      <div>
                        <p style={{ fontWeight:600 }}>{skill.name}</p>
                        <p style={{ fontSize:11, color:"#9CA3AF" }}>{skill.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Proficiency + rate for teach mode */}
            {selected && mode==="teach" && (
              <div style={{ padding:"12px 24px", borderTop:"1px solid #F3F4F6", background:"#F9FAFB" }}>
                <p style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:10 }}>Options for <strong>{selected.name}</strong></p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <label style={{ fontSize:12, color:"#6B7280", display:"block", marginBottom:4 }}>Proficiency</label>
                    <select value={proficiency} onChange={e => setProficiency(e.target.value)} style={{ width:"100%", padding:"8px 10px", border:"1.5px solid #E5E7EB", borderRadius:8, fontSize:13, outline:"none", background:"white" }}>
                      {["Beginner","Intermediate","Advanced","Expert"].map(p=><option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:12, color:"#6B7280", display:"block", marginBottom:4 }}>Rate (0 = Free/Barter)</label>
                    <input type="number" min="0" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} style={{ width:"100%", padding:"8px 10px", border:"1.5px solid #E5E7EB", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box" }}/>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ padding:"16px 24px", borderTop:"1px solid #F3F4F6" }}>
          {success && <p style={{ fontSize:13, color:"#059669", fontWeight:600, marginBottom:8 }}>{success}</p>}
          {error   && <p style={{ fontSize:13, color:"#DC2626", marginBottom:8 }}>⚠️ {error}</p>}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onClose} style={{ flex:1, padding:"11px", background:"white", color:"#374151", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer" }}>Cancel</button>
            <button
              onClick={customMode ? handleAddCustom : handleAdd}
              disabled={customMode ? !customSkillName.trim() : !selected || loading}
              style={{
                flex:2, padding:"11px",
                background:(customMode?!customSkillName.trim():!selected)||loading ? "#E5E7EB" : "linear-gradient(135deg,#6C63FF,#4F46E5)",
                color:(customMode?!customSkillName.trim():!selected)||loading ? "#9CA3AF" : "white",
                border:"none", borderRadius:10, fontSize:14, fontWeight:700,
                cursor:(customMode?!customSkillName.trim():!selected)||loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Adding..." : mode==="teach" ? "⚡ Add to Teach List" : "📚 Add to Learn List"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
