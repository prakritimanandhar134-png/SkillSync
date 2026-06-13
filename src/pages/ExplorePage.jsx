import { useState, useMemo } from "react";
import BookingModal from "../components/BookingModal";

// ─── Avatar colours + initials (simulating profile pictures) ───
const AVATARS = [
  { initials:"TK", grad:"linear-gradient(135deg,#6C63FF,#A89BFF)" },
  { initials:"AP", grad:"linear-gradient(135deg,#EC4899,#F97316)" },
  { initials:"DM", grad:"linear-gradient(135deg,#10B981,#4ADE80)" },
  { initials:"SG", grad:"linear-gradient(135deg,#3B82F6,#8B5CF6)" },
  { initials:"RD", grad:"linear-gradient(135deg,#F59E0B,#EF4444)" },
  { initials:"PN", grad:"linear-gradient(135deg,#EC4899,#F97316)" },
  { initials:"AV", grad:"linear-gradient(135deg,#14B8A6,#0EA5E9)" },
  { initials:"MJ", grad:"linear-gradient(135deg,#6366F1,#8B5CF6)" },
];

const ALL_TUTORS = [
  { id:1,  name:"Tanvir Khan",   university:"IIT Bombay",     year:"CS 3rd Year",
    rating:4.9, reviews:87,  sessions:87,  rate:0,
    teaches:["React","Node.js","TypeScript"], wants:["Python","ML/AI"],
    bio:"Full-stack dev. Teach React & Node in exchange for Python or ML knowledge.",
    isOnline:true,  avatarIdx:0 },

  { id:2,  name:"Aisha Patel",   university:"BITS Pilani",    year:"AI/ML 4th Year",
    rating:4.8, reviews:62,  sessions:62,  rate:150,
    teaches:["ML/AI","Python","Data Science"], wants:["UI/UX","Figma"],
    bio:"NLP researcher. Teach ML & Python, love to learn design in exchange.",
    isOnline:true,  avatarIdx:1 },

  { id:3,  name:"Dev Mehta",     university:"NIT Surathkal",  year:"CS 2nd Year",
    rating:4.7, reviews:34,  sessions:34,  rate:0,
    teaches:["UI/UX","Figma","Design"], wants:["Node.js","React"],
    bio:"Product designer. Swap Figma & UI/UX for web dev skills.",
    isOnline:false, avatarIdx:2 },

  { id:4,  name:"Sanya Gupta",   university:"IIIT Hyderabad", year:"CS 4th Year",
    rating:4.9, reviews:120, sessions:120, rate:200,
    teaches:["Java","DSA","Programming"], wants:["ML/AI","Python"],
    bio:"Google intern. Teach Java & DSA — looking for ML knowledge exchange.",
    isOnline:true,  avatarIdx:3 },

  { id:5,  name:"Rohan Das",     university:"VIT Vellore",    year:"ECE 3rd Year",
    rating:4.6, reviews:28,  sessions:28,  rate:80,
    teaches:["Android","Flutter","Mobile"], wants:["React","TypeScript"],
    bio:"Mobile dev. Teach Android & Flutter, want to learn React.",
    isOnline:false, avatarIdx:4 },

  { id:6,  name:"Priya Nair",    university:"IIT Delhi",      year:"Design 3rd Year",
    rating:4.8, reviews:45,  sessions:45,  rate:0,
    teaches:["UI/UX","Figma","Design"], wants:["Java","DSA"],
    bio:"Interaction designer. Swap Figma skills for Java & DSA prep.",
    isOnline:true,  avatarIdx:5 },

  { id:7,  name:"Arjun Verma",   university:"DTU",            year:"CS 2nd Year",
    rating:4.5, reviews:19,  sessions:19,  rate:60,
    teaches:["React","HTML/CSS","JavaScript"], wants:["Python","Data Science"],
    bio:"Frontend learner. Teach HTML/CSS/JS basics, want to learn Python.",
    isOnline:false, avatarIdx:6 },

  { id:8,  name:"Meera Joshi",   university:"BITS Goa",       year:"CS 4th Year",
    rating:4.9, reviews:74,  sessions:74,  rate:180,
    teaches:["DevOps","Docker","AWS"], wants:["UI/UX","Figma"],
    bio:"AWS-certified. Teach DevOps & cloud, want to learn design.",
    isOnline:true,  avatarIdx:7 },
];

// ─── Skill Matching Algorithm ───────────────────────────────────
// My skills I teach & want (current logged-in user profile)
const MY_PROFILE = {
  teaches: ["Java", "DSA"],
  wants:   ["UI/UX", "Figma"],
};

function computeMatchScore(tutor) {
  const canTeachMeWhat  = tutor.teaches.filter(s => MY_PROFILE.wants.includes(s)).length;
  const iWantToTeachHim = tutor.wants.filter(s => MY_PROFILE.teaches.includes(s)).length;
  const overlap = canTeachMeWhat + iWantToTeachHim;
  const maxPossible = Math.max(MY_PROFILE.wants.length, MY_PROFILE.teaches.length, 1);
  return Math.min(100, Math.round((overlap / maxPossible) * 100));
}

function isBarterPossible(tutor) {
  const teaches = tutor.teaches.some(s => MY_PROFILE.wants.includes(s));
  const wants   = tutor.wants.some(s => MY_PROFILE.teaches.includes(s));
  return teaches && wants;
}

// ─── Rating Algorithm ────────────────────────────────────────────
function computeRatingScore(tutor) {
  return (tutor.rating / 5) * 100;
}

// ─── Recommendation Algorithm ────────────────────────────────────
function computeRecommendScore(tutor) {
  const match  = computeMatchScore(tutor)   * 0.40;
  const rating = computeRatingScore(tutor)  * 0.30;
  const exp    = Math.min(tutor.sessions / 150 * 100, 100) * 0.20;
  const online = tutor.isOnline ? 10 : 0;
  return Math.round(match + rating + exp + online);
}

const SKILL_FILTERS = ["All","React","Python","UI/UX","Java","ML/AI","Design","Node.js","DSA","DevOps","Mobile"];
const SORT_OPTIONS  = ["Best Match","Top Rated","Most Sessions","Price: Low to High","Barter Only"];

function Avatar({ idx, size = 52 }) {
  const a = AVATARS[idx] || AVATARS[0];
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      background:a.grad, display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Space Grotesk',sans-serif", fontWeight:700,
      fontSize:size*0.3, color:"white", flexShrink:0
    }}>{a.initials}</div>
  );
}

function MatchBadge({ score, barter }) {
  if (score === 0) return null;
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:6,
      padding:"6px 12px", borderRadius:10, marginBottom:12,
      background: barter ? "#ECFDF5" : "#EEF2FF",
      border:`1px solid ${barter ? "#BBF7D0" : "#C7D2FE"}`
    }}>
      <span style={{ fontSize:14 }}>{barter ? "🔄" : "📊"}</span>
      <div>
        <p style={{ fontSize:12, fontWeight:700, color: barter ? "#059669" : "#4338CA" }}>
          {barter ? `${score}% Skill Match — Barter Available!` : `${score}% Partial Match`}
        </p>
        {barter && (
          <p style={{ fontSize:11, color:"#6B7280" }}>
            You teach {MY_PROFILE.teaches.join(" / ")} · They teach {MY_PROFILE.wants.join(" / ")}
          </p>
        )}
      </div>
    </div>
  );
}

function TutorCard({ tutor, onBook }) {
  const matchScore = computeMatchScore(tutor);
  const barter     = isBarterPossible(tutor);
  const isFree     = barter; // free if barter possible

  return (
    <div style={{
      background:"white", border:`1.5px solid ${barter ? "#BBF7D0" : "#F3F4F6"}`,
      borderRadius:16, padding:"20px",
      boxShadow: barter ? "0 4px 20px rgba(5,150,105,0.08)" : "0 2px 12px rgba(0,0,0,0.04)",
      transition:"all 0.2s", position:"relative"
    }}
    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(108,99,255,0.12)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=barter?"0 4px 20px rgba(5,150,105,0.08)":"0 2px 12px rgba(0,0,0,0.04)"; }}
    >
      {/* Barter badge top-right */}
      {barter && (
        <div style={{ position:"absolute", top:14, right:14, padding:"3px 10px", background:"#ECFDF5", color:"#059669", borderRadius:99, fontSize:11, fontWeight:700, border:"1px solid #BBF7D0" }}>
          🔄 Free Barter
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", gap:12, marginBottom:14 }}>
        <div style={{ position:"relative" }}>
          <Avatar idx={tutor.avatarIdx} size={52}/>
          {tutor.isOnline && (
            <span style={{ position:"absolute", bottom:2, right:2, width:12, height:12, borderRadius:"50%", background:"#10B981", border:"2px solid white" }}/>
          )}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontWeight:700, fontSize:15, color:"#111827", marginBottom:2 }}>{tutor.name}</p>
          <p style={{ fontSize:12, color:"#9CA3AF", marginBottom:4 }}>{tutor.university} · {tutor.year}</p>
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            <span style={{ color:"#F59E0B", fontSize:12 }}>★</span>
            <span style={{ fontSize:12, fontWeight:700, color:"#374151" }}>{tutor.rating}</span>
            <span style={{ fontSize:12, color:"#9CA3AF" }}>({tutor.reviews} reviews)</span>
          </div>
        </div>
      </div>

      {/* Match badge */}
      <MatchBadge score={matchScore} barter={barter}/>

      {/* Skills they teach */}
      <div style={{ marginBottom:10 }}>
        <p style={{ fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>Teaches</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
          {tutor.teaches.map(s => (
            <span key={s} style={{
              padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:500,
              background: MY_PROFILE.wants.includes(s) ? "#ECFDF5" : "#F3F4F6",
              color:       MY_PROFILE.wants.includes(s) ? "#059669" : "#374151",
              border:      MY_PROFILE.wants.includes(s) ? "1px solid #BBF7D0" : "1px solid #E5E7EB"
            }}>{MY_PROFILE.wants.includes(s) ? `✓ ${s}` : s}</span>
          ))}
        </div>
      </div>

      {/* Skills they want */}
      <div style={{ marginBottom:12 }}>
        <p style={{ fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>Wants to Learn</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
          {tutor.wants.map(s => (
            <span key={s} style={{
              padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:500,
              background: MY_PROFILE.teaches.includes(s) ? "#EEF2FF" : "#F3F4F6",
              color:       MY_PROFILE.teaches.includes(s) ? "#4338CA" : "#374151",
              border:      MY_PROFILE.teaches.includes(s) ? "1px solid #C7D2FE" : "1px solid #E5E7EB"
            }}>{MY_PROFILE.teaches.includes(s) ? `⚡ ${s}` : s}</span>
          ))}
        </div>
      </div>

      <p style={{ fontSize:13, color:"#6B7280", lineHeight:1.5, marginBottom:14 }}>{tutor.bio}</p>

      {/* Footer */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid #F3F4F6", paddingTop:12 }}>
        <div>
          {isFree ? (
            <div>
              <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:800, color:"#059669" }}>FREE</p>
              <p style={{ fontSize:11, color:"#6B7280" }}>Skill exchange / barter</p>
            </div>
          ) : (
            <div>
              <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:800, color:"#6C63FF" }}>
                {tutor.rate === 0 ? "FREE" : `$${tutor.rate}/hr`}
              </p>
              <p style={{ fontSize:11, color:"#6B7280" }}>via Google Meet</p>
            </div>
          )}
        </div>
        <button onClick={() => onBook(tutor)} style={{
          padding:"9px 20px",
          background: barter ? "linear-gradient(135deg,#059669,#10B981)" : "linear-gradient(135deg,#6C63FF,#4F46E5)",
          color:"white", border:"none", borderRadius:99,
          fontSize:13, fontWeight:700, cursor:"pointer",
          display:"flex", alignItems:"center", gap:6
        }}>
          {barter ? "🔄 Request Barter" : "📅 Book Session"}
        </button>
      </div>
    </div>
  );
}

export default function ExplorePage({ navigate }) {
  const [search,     setSearch]     = useState("");
  const [skillFilter,setSkillFilter]= useState("All");
  const [sortBy,     setSortBy]     = useState("Best Match");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [bookingTutor, setBookingTutor] = useState(null);

  const tutors = useMemo(() => {
    let list = ALL_TUTORS
      .map(t => ({ ...t, matchScore:computeMatchScore(t), recommendScore:computeRecommendScore(t), barter:isBarterPossible(t) }))
      .filter(t => {
        const q = search.toLowerCase();
        const matchSearch = !q || t.name.toLowerCase().includes(q) || t.teaches.some(s=>s.toLowerCase().includes(q)) || t.wants.some(s=>s.toLowerCase().includes(q));
        const matchSkill  = skillFilter==="All" || t.teaches.includes(skillFilter) || t.wants.includes(skillFilter);
        const matchOnline = !onlineOnly || t.isOnline;
        return matchSearch && matchSkill && matchOnline;
      });

    if (sortBy==="Best Match")           list.sort((a,b)=>b.recommendScore-a.recommendScore);
    else if (sortBy==="Top Rated")       list.sort((a,b)=>b.rating-a.rating);
    else if (sortBy==="Most Sessions")   list.sort((a,b)=>b.sessions-a.sessions);
    else if (sortBy==="Price: Low to High") list.sort((a,b)=>a.rate-b.rate);
    else if (sortBy==="Barter Only")     list = list.filter(t=>t.barter);

    return list;
  }, [search, skillFilter, sortBy, onlineOnly]);

  const barterCount = tutors.filter(t=>t.barter).length;

  return (
    <div style={{ background:"#F3F4F6", minHeight:"100vh", fontFamily:"'Inter',sans-serif" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:800, color:"#111827", marginBottom:6 }}>Find Your Skill Match</h1>
          <p style={{ fontSize:14, color:"#6B7280" }}>{tutors.length} tutors found · Ranked by AI recommendation score</p>
        </div>

        {/* My profile context box */}
        <div style={{ background:"linear-gradient(135deg,#EEF2FF,#E0E7FF)", borderRadius:14, padding:"16px 20px", marginBottom:20, border:"1px solid #C7D2FE", display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:"#4338CA", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>⚡ Your Skill Profile — used for matching</p>
            <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
              <div>
                <p style={{ fontSize:11, color:"#6B7280", marginBottom:4 }}>You can TEACH:</p>
                <div style={{ display:"flex", gap:5 }}>
                  {MY_PROFILE.teaches.map(s=>(
                    <span key={s} style={{ padding:"3px 10px", background:"#EEF2FF", color:"#4338CA", borderRadius:99, fontSize:11, fontWeight:600, border:"1px solid #C7D2FE" }}>⚡ {s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize:11, color:"#6B7280", marginBottom:4 }}>You want to LEARN:</p>
                <div style={{ display:"flex", gap:5 }}>
                  {MY_PROFILE.wants.map(s=>(
                    <span key={s} style={{ padding:"3px 10px", background:"#ECFDF5", color:"#059669", borderRadius:99, fontSize:11, fontWeight:600, border:"1px solid #BBF7D0" }}>✓ {s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginLeft:"auto", textAlign:"center", background:"white", padding:"10px 18px", borderRadius:12, border:"1px solid #C7D2FE" }}>
            <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:800, color:"#059669" }}>{barterCount}</p>
            <p style={{ fontSize:11, color:"#6B7280" }}>Free barter matches</p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position:"relative", marginBottom:16 }}>
          <svg style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by skill, name, or topic..."
            style={{ width:"100%", padding:"12px 16px 12px 48px", border:"1.5px solid #E5E7EB", borderRadius:12, fontSize:14, outline:"none", fontFamily:"'Inter',sans-serif", background:"white", boxSizing:"border-box" }}
            onFocus={e=>e.target.style.borderColor="#6C63FF"}
            onBlur={e=>e.target.style.borderColor="#E5E7EB"}
          />
        </div>

        {/* Skill pills */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
          {SKILL_FILTERS.map(s=>(
            <button key={s} onClick={()=>setSkillFilter(s)} style={{
              padding:"6px 16px", borderRadius:99, border:"1.5px solid", fontSize:13, fontWeight:500, cursor:"pointer", transition:"all 0.15s",
              borderColor: skillFilter===s?"#6C63FF":"#E5E7EB",
              background:  skillFilter===s?"#6C63FF":"white",
              color:       skillFilter===s?"white":"#6B7280",
            }}>{s}</button>
          ))}
        </div>

        {/* Filter row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"white", borderRadius:12, padding:"12px 18px", marginBottom:24, border:"1px solid #F3F4F6" }}>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            {/* Online toggle */}
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
              <div onClick={()=>setOnlineOnly(!onlineOnly)} style={{ width:38, height:20, borderRadius:10, background:onlineOnly?"#6C63FF":"#E5E7EB", position:"relative", transition:"background 0.2s", cursor:"pointer" }}>
                <div style={{ position:"absolute", top:2, left:onlineOnly?20:2, width:16, height:16, borderRadius:"50%", background:"white", transition:"left 0.2s" }}/>
              </div>
              <span style={{ fontSize:13, fontWeight:500, color:"#6B7280" }}>Online now</span>
            </label>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:13, color:"#9CA3AF" }}>Sort by</span>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"7px 12px", border:"1.5px solid #E5E7EB", borderRadius:8, fontSize:13, fontWeight:500, color:"#374151", background:"white", cursor:"pointer", outline:"none" }}>
              {SORT_OPTIONS.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Results */}
        {tutors.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 20px", background:"white", borderRadius:16, border:"1px solid #F3F4F6" }}>
            <p style={{ fontSize:32, marginBottom:12 }}>🔍</p>
            <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700, marginBottom:8 }}>No matches found</h3>
            <p style={{ color:"#9CA3AF", fontSize:14 }}>Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {tutors.map(tutor=>(
              <TutorCard key={tutor.id} tutor={tutor} onBook={setBookingTutor}/>
            ))}
          </div>
        )}
      </div>

      {bookingTutor && <BookingModal tutor={bookingTutor} onClose={()=>setBookingTutor(null)}/>}
    </div>
  );
}
