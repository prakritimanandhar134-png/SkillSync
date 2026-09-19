import { useState, useEffect, useRef } from "react";
import { getMe, getUserReviews, getMySessions, getUserById,
         updateProfile, uploadAvatar, removeMySkill,
         changePassword } from "../api";
import SkillSelector from "../components/SkillSelector";

export default function ProfilePage({ navigate, showToast }) {
  const [activeTab,      setActiveTab]      = useState("overview");
  const [user,           setUser]           = useState(null);
  const [reviews,        setReviews]        = useState([]);
  const [sessions,       setSessions]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [skillMode, setSkillMode] = useState("teach");
  const [saveMsg,        setSaveMsg]        = useState("");
  const [saveError,      setSaveError]      = useState("");
  const [saving,         setSaving]         = useState(false);
  const [pwMsg,          setPwMsg]          = useState("");
  const [pwError,        setPwError]        = useState("");
  const fileRef = useRef();

  // Settings form state
  const [form, setForm] = useState({
  full_name: "",
  university: "",
  year: "",
  bio: "",
  location: "",
  available_days: [],
  class_start_time: "",
  class_end_time: "",
  hours_per_day: ""
});
  const [pwForm, setPwForm] = useState({
    current_password:"", new_password:"", confirm_password:""
  });

  const fetchData = async () => {
    try {
      const [userData, sessionData] = await Promise.all([getMe(), getMySessions()]);
      setUser(userData);
      setForm({
  full_name: userData.full_name || "",
  university: userData.university || "",
  year: userData.year || "",
  bio: userData.bio || "",
  location: userData.location || "",
  available_days: Array.isArray(userData.available_days)
  ? userData.available_days
  : userData.available_days
    ? JSON.parse(userData.available_days)
    : [],
  class_start_time: userData.class_start_time || "",
  class_end_time: userData.class_end_time || "",
  hours_per_day: userData.hours_per_day || ""
});
      setSessions(Array.isArray(sessionData) ? sessionData : []);
      if (userData?.id) {
        const fullProfile = await getUserById(userData.id);
        if (fullProfile) setUser(prev => ({ ...prev, ...fullProfile }));
        const reviewData = await getUserReviews(userData.id);
        setReviews(Array.isArray(reviewData) ? reviewData : []);
      }
    } catch (err) {
      console.error("Profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1)
    : null;
  const completedSessions = sessions.filter(s=>s.status==="completed").length;

  // ── Save profile ──────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true); setSaveMsg(""); setSaveError("");
    try {
      const data = await updateProfile(form);
      if (data.user) {
        setUser(prev => ({ ...prev, ...data.user }));
        // Update localStorage
        const stored = JSON.parse(localStorage.getItem("user")||"{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, ...data.user }));
      }
    
showToast("Profile updated successfully!", "success");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ───────────────────────────
  const handleChangePassword = async () => {
    setPwMsg(""); setPwError("");
    if (!pwForm.current_password || !pwForm.new_password) {
      setPwError("Please fill all password fields."); return;
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError("New passwords do not match."); return;
    }
    if (pwForm.new_password.length < 6) {
      setPwError("Password must be at least 6 characters."); return;
    }
    try {
      const data = await changePassword(pwForm.current_password, pwForm.new_password);
      if (data.message?.includes("successfully")) {
       
showToast("Password changed successfully!", "success");
        setPwForm({ current_password:"", new_password:"", confirm_password:"" });
      } else {
        setPwError(data.message || "Failed to change password.");
      }
    } catch (err) {
      setPwError("Server error. Try again.");
    }
  };

  // ── Avatar upload ─────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
  showToast("Image must be under 10MB.", "error");
  return;
}
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        const data = await uploadAvatar(base64);
        if (data.avatar_url) {
        
          setUser(prev => ({ ...prev, avatar_url: data.avatar_url }));
          const stored = JSON.parse(localStorage.getItem("user")||"{}");
          localStorage.setItem("user", JSON.stringify({ ...stored, avatar_url: data.avatar_url }));
        showToast("Profile picture updated successfully!", "success");
        }
      } catch (err) {
        console.error("Avatar upload error:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  // ── Remove skill ──────────────────────────────
 const handleRemoveTeach = async (id) => {
  try {
    await removeMySkill(id);
    showToast("Teaching skill removed successfully!", "success");
    fetchData();
  } catch (err) {
    showToast("Failed to remove skill.", "error");
  }
};

const handleRemoveLearn = async (id) => {
  try {
    await removeMySkill(id);
    showToast("Learning skill removed successfully!", "success");
    fetchData();
  } catch (err) {
    showToast("Failed to remove skill.", "error");
  }
};

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F3F4F6" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:48, height:48, border:"4px solid #E5E7EB", borderTopColor:"#6C63FF", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
          <p style={{ color:"#6B7280", fontSize:14 }}>Loading profile...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ background:"#F3F4F6", minHeight:"100vh", fontFamily:"'Inter',sans-serif" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 24px" }}>

        {/* Profile header */}
        <div style={{ background:"white", borderRadius:20, overflow:"hidden", marginBottom:24, boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
          <div style={{ height:160, background:"linear-gradient(135deg,#6C63FF 0%,#4F46E5 50%,#3B82F6 100%)", position:"relative" }}/>
          <div style={{ padding:"0 32px 28px", position:"relative" }}>
            {/* Avatar */}
            <div style={{ position:"relative", display:"inline-block", marginTop:-44 }}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" style={{ width:88, height:88, borderRadius:18, objectFit:"cover", border:"4px solid white", boxShadow:"0 4px 16px rgba(108,99,255,0.3)" }}/>
              ) : (
                <div style={{ width:88, height:88, borderRadius:18, background:"linear-gradient(135deg,#6C63FF,#4F46E5)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:28, color:"white", border:"4px solid white", boxShadow:"0 4px 16px rgba(108,99,255,0.3)" }}>
                  {getInitials(user?.full_name)}
                </div>
              )}
              {/* Camera icon to change photo */}
              <button onClick={() => fileRef.current.click()} style={{ position:"absolute", bottom:0, right:0, width:28, height:28, borderRadius:"50%", background:"#6C63FF", border:"2px solid white", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:13 }}>
                📷
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleAvatarChange} style={{ display:"none" }}/>
            </div>

            {/* Actions */}
            <div style={{ position:"absolute", top:20, right:32, display:"flex", gap:10 }}>
              <button onClick={() => setActiveTab("settings")} style={{ padding:"9px 18px", background:"white", color:"#374151", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                ✏️ Edit Profile
              </button>
            </div>

            {/* User info */}
            <div style={{ marginTop:12, display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:800, color:"#111827" }}>
                    {user?.full_name || "Your Name"}
                  </h2>
                  <span style={{ fontSize:16 }}>✅</span>
                </div>
                <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:8 }}>
                  {user?.university && <span style={{ fontSize:13, color:"#6B7280" }}>🏫 {user.university}</span>}
                  {user?.year       && <span style={{ fontSize:13, color:"#6B7280" }}>📅 {user.year}</span>}
                  {user?.location   && <span style={{ fontSize:13, color:"#6B7280" }}>📍 {user.location}</span>}
                </div>
                <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                  {avgRating && <span style={{ fontSize:13, color:"#F59E0B", fontWeight:600 }}>★ {avgRating}</span>}
                  <span style={{ fontSize:13, color:"#6B7280" }}>{reviews.length} reviews</span>
                  <span style={{ fontSize:13, color:"#6B7280" }}>{completedSessions} sessions</span>
                  <span style={{ fontSize:13, color:"#6B7280" }}>
                    Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US",{month:"short",year:"numeric"}) : ""}
                  </span>
                </div>
              </div>
              <div style={{ textAlign:"center", padding:"16px 20px", background:"#F5F3FF", borderRadius:14, border:"1px solid #E9D5FF", minWidth:90 }}>
                <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:800, color:"#6C63FF", marginBottom:2 }}>{user?.skill_score||0}</p>
                <p style={{ fontSize:11, fontWeight:600, color:"#7C3AED" }}>Skill Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:0, marginBottom:20, borderBottom:"2px solid #F3F4F6", background:"white", borderRadius:"12px 12px 0 0", padding:"0 20px" }}>
          {["overview","sessions","reviews","settings"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding:"14px 20px", background:"none", border:"none",
              fontSize:14, fontWeight:600, cursor:"pointer", textTransform:"capitalize",
              color:activeTab===tab?"#6C63FF":"#6B7280",
              borderBottom:activeTab===tab?"2px solid #6C63FF":"2px solid transparent",
              marginBottom:-2
            }}>{tab}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab==="overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* About */}
            <div style={{ background:"white", borderRadius:16, padding:24, border:"1px solid #F3F4F6", gridColumn:"1/-1" }}>
              <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700, color:"#111827", marginBottom:12 }}>About Me</h3>
              <p style={{ fontSize:14, color:"#6B7280", lineHeight:1.7 }}>
                {user?.bio || "No bio yet. Click Edit Profile → Settings to add one."}
              </p>
            </div>

            {/* Skills I Teach */}
            <div style={{ background:"white", borderRadius:16, padding:24, border:"1px solid #F3F4F6" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700, color:"#111827" }}>⚡ Skills I Teach</h3>
                <button onClick={() => {setSkillMode("teach"); setShowSkillModal(true);}} style={{ fontSize:12, color:"#6C63FF", fontWeight:600, background:"#F5F3FF", border:"1px solid #E9D5FF", borderRadius:99, padding:"4px 12px", cursor:"pointer" }}>
                  + Add
                </button>
              </div>
              {user?.teaches && user.teaches.length > 0 ? (
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {user.teaches.map(s => (
                    <div key={s.id||s.name} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", background:"#ECFDF5", color:"#059669", borderRadius:99, fontSize:13, fontWeight:600, border:"1px solid #BBF7D0" }}>
                      ✓ {s.name||s}
                      <button onClick={() => handleRemoveTeach(s.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#059669", fontSize:14, padding:"0 0 0 4px", lineHeight:1 }}>×</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <p style={{ fontSize:13, color:"#9CA3AF", marginBottom:10 }}>No skills added yet</p>
                  <button onClick={() => {
                    setSkillMode("teach");
                    setShowSkillModal(true);
                  }} style={{ padding:"8px 20px", background:"#6C63FF", color:"white", border:"none", borderRadius:99, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    + Add your first skill
                  </button>
                </div>
              )}
            </div>

            {/* Skills I Want */}
            <div style={{ background:"white", borderRadius:16, padding:24, border:"1px solid #F3F4F6" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700, color:"#111827" }}>📚 Skills I Want to Learn</h3>
                <button onClick={() => {
                  setSkillMode("learn");
                  setShowSkillModal(true);
                }} style={{ fontSize:12, color:"#6C63FF", fontWeight:600, background:"#F5F3FF", border:"1px solid #E9D5FF", borderRadius:99, padding:"4px 12px", cursor:"pointer" }}>
                  + Add 
                </button>
              </div>
              {user?.wants && user.wants.length > 0 ? (
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {user.wants.map(s => (
                    <div key={s.id||s.name} style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", background:"#EEF2FF", color:"#4338CA", borderRadius:99, fontSize:13, fontWeight:600, border:"1px solid #C7D2FE" }}>
                      → {s.name||s}
                      <button onClick={() => handleRemoveLearn(s.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#4338CA", fontSize:14, padding:"0 0 0 4px", lineHeight:1 }}>×</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <p style={{ fontSize:13, color:"#9CA3AF", marginBottom:10 }}>No learning goals yet</p>
                  <button onClick={() => {
                    setSkillMode("learn");
                    setShowSkillModal(true);
                  }} style={{ padding:"8px 20px", background:"#6C63FF", color:"white", border:"none", borderRadius:99, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    + Add what you want to learn
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ background:"white", borderRadius:16, padding:24, border:"1px solid #F3F4F6", gridColumn:"1/-1" }}>
              <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700, color:"#111827", marginBottom:16 }}>Stats</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
                {[
                  { icon:"📅", label:"Sessions Completed", value:completedSessions },
                  { icon:"💬", label:"Reviews",            value:reviews.length },
                  { icon:"⭐", label:"Avg Rating",         value:avgRating||"—" },
                  { icon:"⚡", label:"Skill Score",        value:user?.skill_score||0 },
                ].map(s => (
                  <div key={s.label} style={{ textAlign:"center", padding:"16px", background:"#F9FAFB", borderRadius:12, border:"1px solid #F3F4F6" }}>
                    <p style={{ fontSize:24, marginBottom:4 }}>{s.icon}</p>
                    <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:800, color:"#111827", marginBottom:2 }}>{s.value}</p>
                    <p style={{ fontSize:12, color:"#9CA3AF" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SESSIONS */}
        {activeTab==="sessions" && (
          <div style={{ background:"white", borderRadius:16, border:"1px solid #F3F4F6", overflow:"hidden" }}>
            <div style={{ padding:"18px 24px", borderBottom:"1px solid #F3F4F6" }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700 }}>My Sessions</h2>
            </div>
            {sessions.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <p style={{ fontSize:32, marginBottom:8 }}>📅</p>
                <p style={{ fontSize:15, fontWeight:600, color:"#374151", marginBottom:4 }}>No sessions yet</p>
                <button onClick={() => navigate("/explore")} style={{ padding:"10px 24px", background:"#6C63FF", color:"white", border:"none", borderRadius:99, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                  Find a Tutor
                </button>
              </div>
            ) : sessions.map((s,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 24px", borderBottom:i<sessions.length-1?"1px solid #F3F4F6":"none" }}>
                <div style={{ width:44, height:44, borderRadius:10, background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>💻</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:600, fontSize:14, color:"#111827", marginBottom:2 }}>
                    {s.skill_name} with {s.tutor_name||s.student_name}
                  </p>
                  <p style={{ fontSize:12, color:"#9CA3AF" }}>
                    {new Date(s.scheduled_at).toLocaleDateString()} · {s.is_barter?"🔄 Free Exchange":"Paid"}
                  </p>
                </div>
                <span style={{
                  padding:"4px 12px", borderRadius:99, fontSize:11, fontWeight:600,
                  background:s.status==="completed"?"#ECFDF5":s.status==="upcoming"?"#EEF2FF":s.status==="requested"?"#FFFBEB":"#F3F4F6",
                  color:s.status==="completed"?"#059669":s.status==="upcoming"?"#4338CA":s.status==="requested"?"#D97706":"#6B7280"
                }}>
                  {s.status==="requested"?"⏳ Pending":s.status}
                </span>
                {s.meet_link && s.status==="upcoming" && (
                  <a href={s.meet_link} target="_blank" rel="noreferrer" style={{ padding:"6px 14px", background:"#6C63FF", color:"white", borderRadius:99, fontSize:12, fontWeight:600, textDecoration:"none" }}>
                    🎥 Join
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* REVIEWS */}
        {activeTab==="reviews" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {reviews.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", background:"white", borderRadius:16, border:"1px solid #F3F4F6" }}>
                <p style={{ fontSize:32, marginBottom:8 }}>⭐</p>
                <p style={{ fontSize:15, fontWeight:600, color:"#374151", marginBottom:4 }}>No reviews yet</p>
                <p style={{ fontSize:13, color:"#9CA3AF" }}>Complete sessions to receive reviews</p>
              </div>
            ) : reviews.map((r,i) => (
              <div key={i} style={{ background:"white", borderRadius:14, padding:"20px 24px", border:"1px solid #F3F4F6" }}>
                <div style={{ display:"flex", gap:12, marginBottom:10 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#6C63FF,#43D9AD)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:"white" }}>
                    {r.reviewer_name?.[0]||"?"}
                  </div>
                  <div>
                    <p style={{ fontWeight:600, fontSize:14, color:"#111827" }}>{r.reviewer_name}</p>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ color:"#F59E0B", fontSize:12 }}>{"★".repeat(r.rating)}</span>
                      <span style={{ fontSize:11, color:"#9CA3AF" }}>· {new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize:13, color:"#6B7280", lineHeight:1.65 }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab==="settings" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

            {/* Profile info */}
            <div style={{ background:"white", borderRadius:16, border:"1px solid #F3F4F6", padding:28 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:17, fontWeight:700, marginBottom:6 }}>Profile Information</h2>
              <p style={{ fontSize:13, color:"#9CA3AF", marginBottom:20 }}>Update your personal details</p>

              {/* Avatar section */}
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24, padding:16, background:"#F9FAFB", borderRadius:12, border:"1px solid #F3F4F6" }}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="avatar" style={{ width:64, height:64, borderRadius:14, objectFit:"cover" }}/>
                ) : (
                  <div style={{ width:64, height:64, borderRadius:14, background:"linear-gradient(135deg,#6C63FF,#4F46E5)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:22, color:"white" }}>
                    {getInitials(user?.full_name)}
                  </div>
                )}
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:"#374151", marginBottom:6 }}>Profile Picture</p>
                  <button onClick={() => fileRef.current.click()} style={{ padding:"7px 16px", background:"#6C63FF", color:"white", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    📷 Upload Photo
                  </button>
                  <p style={{ fontSize:11, color:"#9CA3AF", marginTop:4 }}>JPG, PNG under 10MB</p>
                </div>
              </div>

              {[
                { label:"Full Name",   field:"full_name",  placeholder:"Your full name" },
                { label:"University",  field:"university", placeholder:"Your university" },
                { label:"Year",        field:"year",       placeholder:"e.g. 3rd Year" },
                { label:"Location",    field:"location",   placeholder:"e.g. Kathmandu, Nepal" },
              ].map(f => (
                <div key={f.field} style={{ marginBottom:16 }}>
                  <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>{f.label}</label>
                  <input
                    value={form[f.field]}
                    onChange={e => setForm(prev => ({ ...prev, [f.field]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:14, outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box" }}
                    onFocus={e => e.target.style.borderColor="#6C63FF"}
                    onBlur={e => e.target.style.borderColor="#E5E7EB"}
                  />
                </div>
              ))}

              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell others about yourself and what you can teach..."
                  rows={3}
                  style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:14, outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box", resize:"vertical" }}
                  onFocus={e => e.target.style.borderColor="#6C63FF"}
                  onBlur={e => e.target.style.borderColor="#E5E7EB"}
                />
              </div>
             {/* Available Days */}
<div style={{ marginTop: 20 }}>
  <label
    style={{
      display: "block",
      fontSize: 13,
      fontWeight: 700,
      color: "#374151",
      marginBottom: 8
    }}
  >
    Available Days for Teaching
  </label>

  <p
    style={{
      fontSize: 12,
      color: "#9CA3AF",
      marginBottom: 10
    }}
  >
    Select the days when students can request a session with you.
  </p>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }}
  >
    {[
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ].map(day => {
      const selected = form.available_days.includes(day);

      return (
        <button
          key={day}
          type="button"
          onClick={() => {
            setForm(prev => ({
              ...prev,
              available_days: selected
                ? prev.available_days.filter(d => d !== day)
                : [...prev.available_days, day]
            }));
          }}
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "1.5px solid",
            borderColor: selected ? "#6C63FF" : "#E5E7EB",
            background: selected ? "#6C63FF" : "white",
            color: selected ? "white" : "#6B7280",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {selected ? "✓ " : ""}
          {day}
        </button>
      );
    })}
  </div>
</div>

{/* Class Schedule */}
<div style={{ marginTop: 20 }}>

  <label
    style={{
      display: "block",
      fontSize: 13,
      fontWeight: 700,
      color: "#374151",
      marginBottom: 8
    }}
  >
    Class Schedule
  </label>

  <p
    style={{
      fontSize: 12,
      color: "#9CA3AF",
      marginBottom: 12
    }}
  >
    Set the time when you are available to teach.
  </p>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }}
  >

    {/* Start Time */}
    <div>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "#6B7280",
          marginBottom: 6
        }}
      >
        Start Time
      </label>

     <input
  type="time"
  value={form.class_start_time}
  onChange={e =>
    setForm(prev => ({
      ...prev,
      class_start_time: e.target.value
    }))
  }
        style={{
          width: "100%",
          padding: "10px 14px",
          border: "1.5px solid #E5E7EB",
          borderRadius: 10,
          fontSize: 14,
          boxSizing: "border-box"
        }}
      />
    </div>

    {/* End Time */}
    <div>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "#6B7280",
          marginBottom: 6
        }}
      >
        End Time
      </label>

     <input
  type="time"
  value={form.class_end_time}
  onChange={e =>
    setForm(prev => ({
      ...prev,
      class_end_time: e.target.value
    }))
  }

        style={{
          width: "100%",
          padding: "10px 14px",
          border: "1.5px solid #E5E7EB",
          borderRadius: 10,
          fontSize: 14,
          boxSizing: "border-box"
        }}
      />
    </div>

  </div>

  {/* Hours per day */}
  <div style={{ marginTop: 12 }}>

    <label
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 600,
        color: "#6B7280",
        marginBottom: 6
      }}
    >
      Hours Per Day
    </label>

    <input
      type="number"
      min="1"
      max="12"
      step="0.5"
      value={form.hours_per_day}
      onChange={e =>
        setForm(prev => ({
          ...prev,
          hours_per_day: e.target.value
        }))
      }
      placeholder="e.g. 2"
      style={{
        width: "100%",
        padding: "10px 14px",
        border: "1.5px solid #E5E7EB",
        borderRadius: 10,
        fontSize: 14,
        boxSizing: "border-box"
      }}
    />

  </div>

</div>

              {saveMsg   && <p style={{ fontSize:13, color:"#059669", fontWeight:600, marginBottom:12 }}>{saveMsg}</p>}
              {saveError && <p style={{ fontSize:13, color:"#DC2626", marginBottom:12 }}>⚠️ {saveError}</p>}

              <button onClick={handleSaveProfile} disabled={saving} style={{
                width:"100%", padding:"12px",
                background:saving?"#A89BFF":"linear-gradient(135deg,#6C63FF,#4F46E5)",
                color:"white", border:"none", borderRadius:10,
                fontSize:14, fontWeight:700, cursor:saving?"not-allowed":"pointer"
              }}>
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>

            {/* Change password */}
            <div style={{ background:"white", borderRadius:16, border:"1px solid #F3F4F6", padding:28 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:17, fontWeight:700, marginBottom:6 }}>Change Password</h2>
              <p style={{ fontSize:13, color:"#9CA3AF", marginBottom:20 }}>Update your account password</p>

              {[
                { label:"Current Password",  field:"current_password",  placeholder:"Enter current password" },
                { label:"New Password",      field:"new_password",      placeholder:"Enter new password (6+ chars)" },
                { label:"Confirm Password",  field:"confirm_password",  placeholder:"Confirm new password" },
              ].map(f => (
                <div key={f.field} style={{ marginBottom:16 }}>
                  <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>{f.label}</label>
                  <input
                    type="password"
                    value={pwForm[f.field]}
                    onChange={e => setPwForm(prev => ({ ...prev, [f.field]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width:"100%", padding:"10px 14px", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:14, outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box" }}
                    onFocus={e => e.target.style.borderColor="#6C63FF"}
                    onBlur={e => e.target.style.borderColor="#E5E7EB"}
                  />
                </div>
              ))}

              {pwMsg   && <p style={{ fontSize:13, color:"#059669", fontWeight:600, marginBottom:12 }}>{pwMsg}</p>}
              {pwError && <p style={{ fontSize:13, color:"#DC2626", marginBottom:12 }}>⚠️ {pwError}</p>}

              <button onClick={handleChangePassword} style={{
                width:"100%", padding:"12px",
                background:"linear-gradient(135deg,#6C63FF,#4F46E5)",
                color:"white", border:"none", borderRadius:10,
                fontSize:14, fontWeight:700, cursor:"pointer"
              }}>
                🔐 Change Password
              </button>

              {/* Account info */}
              <div style={{ marginTop:24, padding:16, background:"#F9FAFB", borderRadius:12, border:"1px solid #F3F4F6" }}>
                <p style={{ fontSize:13, fontWeight:600, color:"#374151", marginBottom:12 }}>Account Info</p>
                {[
                  { label:"Email",  value:user?.email },
                  { label:"Role",   value:user?.role },
                  { label:"Member", value:user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—" },
                ].map(item => (
                  <div key={item.label} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:13, color:"#6B7280" }}>{item.label}</span>
                    <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showSkillModal && (
     <SkillSelector
  mode={skillMode}
  onClose={() => setShowSkillModal(false)}
  onSkillAdded={() => {
    fetchData();
    setShowSkillModal(false);
    showToast("Skill added successfully!", "success");
  }}
/>
      )}
    </div>
  );
}