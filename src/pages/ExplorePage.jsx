import { useState, useEffect, useMemo } from "react";
import { getRecommendations, getAllUsers } from "../api";
import BookingModal from "../components/BookingModal";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
}
function getGrad(id) {
  const g = [
    "linear-gradient(135deg,#6C63FF,#A89BFF)",
    "linear-gradient(135deg,#FF6584,#FFB347)",
    "linear-gradient(135deg,#43D9AD,#4ADE80)",
    "linear-gradient(135deg,#3B82F6,#8B5CF6)",
    "linear-gradient(135deg,#F59E0B,#EF4444)",
    "linear-gradient(135deg,#EC4899,#F97316)",
    "linear-gradient(135deg,#14B8A6,#0EA5E9)",
  ];
  return g[id % g.length];
}

function TutorCard({ tutor, onBook }) {
  const barter = tutor.barter_ready;
  return (
    <div style={{
      background:"white", borderRadius:16, padding:"22px",
      border:`1.5px solid ${barter?"#BBF7D0":"#F3F4F6"}`,
      boxShadow:barter?"0 4px 20px rgba(5,150,105,0.08)":"0 2px 12px rgba(0,0,0,0.04)",
      transition:"all 0.2s", position:"relative", cursor:"pointer"
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(108,99,255,0.12)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=barter?"0 4px 20px rgba(5,150,105,0.08)":"0 2px 12px rgba(0,0,0,0.04)";}}>

      {/* Badges */}
      <div style={{position:"absolute",top:14,right:14,display:"flex",gap:6}}>
        {barter && <span style={{padding:"3px 10px",background:"#ECFDF5",color:"#059669",borderRadius:99,fontSize:11,fontWeight:700,border:"1px solid #BBF7D0"}}>🔄 Free Barter</span>}
        {tutor.match_score>0 && <span style={{padding:"3px 10px",background:"#EEF2FF",color:"#4338CA",borderRadius:99,fontSize:11,fontWeight:700}}>{tutor.match_score}% match</span>}
      </div>

      {/* Header */}
      <div style={{display:"flex",gap:12,marginBottom:16}}>
        <div style={{position:"relative"}}>
          {tutor.avatar_url ? (
            <img src={tutor.avatar_url} alt="avatar" style={{width:54,height:54,borderRadius:"50%",objectFit:"cover",border:"2px solid #E5E7EB"}}/>
          ) : (
            <div style={{width:54,height:54,borderRadius:"50%",background:getGrad(tutor.id),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:18,color:"white",flexShrink:0}}>
              {getInitials(tutor.full_name)}
            </div>
          )}
          {tutor.is_online===1&&<span style={{position:"absolute",bottom:2,right:2,width:12,height:12,borderRadius:"50%",background:"#10B981",border:"2px solid white"}}/>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontWeight:700,fontSize:15,color:"#111827",marginBottom:2}}>{tutor.full_name}</p>
          <p style={{fontSize:12,color:"#9CA3AF",marginBottom:4}}>{tutor.university||"University"} · {tutor.year||"Student"}</p>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <span style={{color:"#F59E0B",fontSize:12}}>★</span>
            <span style={{fontSize:12,fontWeight:700,color:"#374151"}}>{tutor.avg_rating?parseFloat(tutor.avg_rating).toFixed(1):"New"}</span>
            <span style={{fontSize:12,color:"#9CA3AF"}}>({tutor.session_count||0} sessions)</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {tutor.bio && <p style={{fontSize:13,color:"#6B7280",lineHeight:1.5,marginBottom:14,borderBottom:"1px solid #F3F4F6",paddingBottom:14}}>{tutor.bio}</p>}

      {/* Skills I Teach */}
      {tutor.teaches && tutor.teaches.length>0 && (
        <div style={{marginBottom:12}}>
          <p style={{fontSize:11,fontWeight:700,color:"#059669",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>✅ Can Teach</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {tutor.teaches.map(s=>(
              <span key={s} style={{padding:"4px 10px",borderRadius:99,fontSize:12,fontWeight:500,background:"#ECFDF5",color:"#059669",border:"1px solid #BBF7D0"}}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills I Want to Learn */}
      {tutor.wants && tutor.wants.length>0 && (
        <div style={{marginBottom:16}}>
          <p style={{fontSize:11,fontWeight:700,color:"#4338CA",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>📚 Wants to Learn</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {tutor.wants.map(s=>(
              <span key={s} style={{padding:"4px 10px",borderRadius:99,fontSize:12,fontWeight:500,background:"#EEF2FF",color:"#4338CA",border:"1px solid #C7D2FE"}}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"1px solid #F3F4F6",paddingTop:14}}>
        <div>
          <p style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:800,color:barter?"#059669":"#6C63FF"}}>
            {barter?"FREE":tutor.hourly_rate>0?`$${tutor.hourly_rate}/hr`:"Free"}
          </p>
          <p style={{fontSize:11,color:"#9CA3AF"}}>via Google Meet</p>
        </div>
        <button onClick={e=>{e.stopPropagation();onBook(tutor);}} style={{
          padding:"10px 22px",
          background:barter?"linear-gradient(135deg,#059669,#10B981)":"linear-gradient(135deg,#6C63FF,#4F46E5)",
          color:"white",border:"none",borderRadius:99,fontSize:13,fontWeight:700,cursor:"pointer"
        }}>
          {barter?"🔄 Request Barter":"📅 Book Session"}
        </button>
      </div>
    </div>
  );
}

export default function ExplorePage({ navigate, showToast }) {
  const [tutors,       setTutors]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [sortBy,       setSortBy]       = useState("Best Match");
  const [filterMode,   setFilterMode]   = useState("all"); // all | barter | paid
  const [onlineOnly,   setOnlineOnly]   = useState(false);
  const [bookingTutor, setBookingTutor] = useState(null);
  const [error,        setError]        = useState("");

useEffect(() => {
  const fetchTutors = async () => {
    try {
      // Get ALL users
      const allData = await getAllUsers();
      console.log("ALL USERS FROM API:", allData);
console.log("FIRST USER SCHEDULE DATA:", allData[0]?.class_start_time);
console.log("FIRST USER END TIME:", allData[0]?.class_end_time);

      // Get skill-based recommendations
      const recData = await getRecommendations();

      if (!Array.isArray(allData)) {
        setTutors([]);
        return;
      }

      // Create a map of recommendation data
      const recommendationMap = new Map(
        (Array.isArray(recData) ? recData : []).map(user => [
          user.id,
          user
        ])
      );

      // Combine ALL users with recommendation information
      const combinedUsers = allData
        .filter(user => user.role !== "admin")
        .map(user => {
          const recommendation =
            recommendationMap.get(user.id);

          return {
  ...user,

  ...(recommendation || {}),

  teaches: recommendation?.teaches || [],
  wants: recommendation?.wants || [],

  match_score: recommendation?.match_score || 0,
  recommend_score: recommendation?.recommend_score || 0,
  barter_ready: recommendation?.barter_ready || false,

  schedule: {
    startTime: user.class_start_time || "",
    endTime: user.class_end_time || "",
    hoursPerDay: Number(user.hours_per_day) || 0,

    availableDays: Array.isArray(user.available_days)
      ? user.available_days
      : typeof user.available_days === "string"
        ? JSON.parse(user.available_days || "[]")
        : []
  }
};
        });

      setTutors(combinedUsers);

    } catch (err) {
  console.error(err);

  setError(
    "Could not load tutors. Make sure server is running."
  );

  showToast?.(
    "Could not load tutors. Make sure server is running.",
    "error"
  );

} finally {
      setLoading(false);
    }
  };

  fetchTutors();
}, []);

  const filtered = useMemo(() => {
    let list = tutors.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        t.full_name?.toLowerCase().includes(q) ||
        (t.teaches||[]).some(s=>s.toLowerCase().includes(q)) ||
        (t.wants||[]).some(s=>s.toLowerCase().includes(q)) ||
        t.university?.toLowerCase().includes(q) ||
        t.bio?.toLowerCase().includes(q);
      const matchOnline = !onlineOnly || t.is_online===1;
const matchMode =
  filterMode === "all" ||
  (filterMode === "barter" && t.barter_ready) ||
  (
    filterMode === "paid" &&
    !t.barter_ready &&
    (t.teaches || []).length > 0
  );
      return matchSearch && matchOnline && matchMode;
    });

    if (sortBy==="Top Rated")       list=[...list].sort((a,b)=>(parseFloat(b.avg_rating)||0)-(parseFloat(a.avg_rating)||0));
    else if (sortBy==="Most Sessions") list=[...list].sort((a,b)=>(b.session_count||0)-(a.session_count||0));
    else if (sortBy==="Free First")    list=[...list].sort((a,b)=>(b.barter_ready?1:0)-(a.barter_ready?1:0));
    else list=[...list].sort((a,b)=>(b.recommend_score||0)-(a.recommend_score||0));

    return list;
  }, [tutors, search, sortBy, onlineOnly, filterMode]);

  const barterCount = tutors.filter(t=>t.barter_ready).length;
  const myUser = JSON.parse(localStorage.getItem("user")||"{}");

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F3F4F6"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:48,height:48,border:"4px solid #E5E7EB",borderTopColor:"#6C63FF",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px"}}/>
        <p style={{color:"#6B7280",fontSize:14}}>Finding your best matches...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  return (
    <div style={{background:"#F3F4F6",minHeight:"100vh",fontFamily:"'Inter',sans-serif"}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px"}}>

        {/* Header */}
        <div style={{marginBottom:24}}>
          <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:28,fontWeight:800,color:"#111827",marginBottom:4}}>Find Your Skill Match</h1>
          <p style={{fontSize:14,color:"#6B7280"}}>
  {filtered.length} users · {barterCount} free barter matches · Skill matches ranked first
</p>
</div>
       
        {/* Search */}
        <div style={{position:"relative",marginBottom:14}}>
          <svg style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)"}} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, skill, university..."
            style={{width:"100%",padding:"12px 16px 12px 48px",border:"1.5px solid #E5E7EB",borderRadius:12,fontSize:14,outline:"none",background:"white",boxSizing:"border-box",fontFamily:"'Inter',sans-serif"}}
            onFocus={e=>e.target.style.borderColor="#6C63FF"}
            onBlur={e=>e.target.style.borderColor="#E5E7EB"}
          />
          {search && <button onClick={()=>setSearch("")} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",fontSize:18}}>✕</button>}
        </div>

        {/* Filter pills */}
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
         {[
           { id: "all", label: "All Mentors" },
           { id: "barter", label: "🔄 Barter Available" },
           { id: "paid", label: "💳 Paid Sessions" },
          ].map(f => (
            <button key={f.id} onClick={()=>setFilterMode(f.id)} style={{
              padding:"7px 16px",borderRadius:99,border:"1.5px solid",fontSize:13,fontWeight:500,cursor:"pointer",
              borderColor:filterMode===f.id?"#6C63FF":"#E5E7EB",
              background:filterMode===f.id?"#6C63FF":"white",
              color:filterMode===f.id?"white":"#6B7280"
            }}>{f.label}</button>
          ))}
        </div>

        {/* Filter row */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"white",borderRadius:12,padding:"12px 18px",marginBottom:24,border:"1px solid #F3F4F6"}}>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
            <div onClick={()=>setOnlineOnly(!onlineOnly)} style={{width:38,height:20,borderRadius:10,background:onlineOnly?"#6C63FF":"#E5E7EB",position:"relative",transition:"background 0.2s",cursor:"pointer"}}>
              <div style={{position:"absolute",top:2,left:onlineOnly?20:2,width:16,height:16,borderRadius:"50%",background:"white",transition:"left 0.2s"}}/>
            </div>
            <span style={{fontSize:13,fontWeight:500,color:"#6B7280"}}>🟢 Online now</span>
          </label>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:13,color:"#9CA3AF"}}>Sort by</span>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:"7px 12px",border:"1.5px solid #E5E7EB",borderRadius:8,fontSize:13,color:"#374151",background:"white",cursor:"pointer",outline:"none"}}>
              {["Best Match","Top Rated","Most Sessions","Free First"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Results */}
        {filtered.length===0 ? (
          <div style={{textAlign:"center",padding:"80px 20px",background:"white",borderRadius:16,border:"1px solid #F3F4F6"}}>
            <p style={{fontSize:32,marginBottom:12}}>🔍</p>
            <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:700,marginBottom:8}}>No tutors found</h3>
            <p style={{color:"#9CA3AF",fontSize:14,marginBottom:16}}>Try adjusting your search or filters</p>
            <button onClick={()=>{setSearch("");setFilterMode("all");setOnlineOnly(false);}} style={{padding:"10px 24px",background:"#6C63FF",color:"white",border:"none",borderRadius:99,fontSize:14,fontWeight:600,cursor:"pointer"}}>
              Show All Tutors
            </button>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
            {filtered.map(tutor=>(
              <TutorCard key={tutor.id} tutor={tutor} onBook={()=>setBookingTutor({
                ...tutor, name:tutor.full_name, barter:tutor.barter_ready, rate:tutor.hourly_rate||0
              })}/>
            ))}
          </div>
        )}
      </div>

      {bookingTutor && (
  <BookingModal
    tutor={bookingTutor}
    onClose={() => setBookingTutor(null)}
    showToast={showToast}
  />
)}
    </div>
  );
}
