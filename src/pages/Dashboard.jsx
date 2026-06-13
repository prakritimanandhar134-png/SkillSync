import { useState } from "react";
import BookingModal from "../components/BookingModal";

const MY_PROFILE = { teaches:["Java","DSA"], wants:["UI/UX","Figma"] };

const ALL_TUTORS = [
  { id:1, name:"Priya mahaju",  university:"KU Dhulikhel", year:"Design 3rd Year", rating:4.8, reviews:45, sessions:45, rate:0,   teaches:["UI/UX","Figma","Design"], wants:["Java","DSA"],      bio:"Designer happy to swap Figma for Java.", isOnline:true,  avatarGrad:"linear-gradient(135deg,#EC4899,#F97316)", initials:"PN" },
  { id:2, name:"Dev mahato",   university:"TU Bhaktapur", year:"CS 2nd Year",     rating:4.7, reviews:34, sessions:34, rate:0,   teaches:["UI/UX","Figma"],         wants:["Node.js","React"],  bio:"Product designer. Swap Figma for web dev.", isOnline:false, avatarGrad:"linear-gradient(135deg,#10B981,#4ADE80)", initials:"DM" },
  { id:3, name:"Tanish karki", university:"TU Kavrepalanchowk",    year:"CS 3rd Year",     rating:4.9, reviews:87, sessions:87, rate:150, teaches:["React","Node.js"],       wants:["Python","ML/AI"],   bio:"Full-stack dev. Teach React & Node.",      isOnline:true,  avatarGrad:"linear-gradient(135deg,#6C63FF,#A89BFF)", initials:"TK" },
  { id:4, name:"Sanya Gupta", university:"KU Dhullikhel",year:"CS 4th Year",     rating:4.9, reviews:120,sessions:120,rate:200, teaches:["Java","DSA"],            wants:["ML/AI","Python"],   bio:"Google intern. Java & DSA expert.",        isOnline:true,  avatarGrad:"linear-gradient(135deg,#3B82F6,#8B5CF6)", initials:"SG" },
];

function computeMatch(t)  { const a=t.teaches.filter(s=>MY_PROFILE.wants.includes(s)).length, b=t.wants.filter(s=>MY_PROFILE.teaches.includes(s)).length; return Math.min(100,Math.round((a+b)/Math.max(MY_PROFILE.wants.length,1)*100)); }
function isBarter(t)      { return t.teaches.some(s=>MY_PROFILE.wants.includes(s)) && t.wants.some(s=>MY_PROFILE.teaches.includes(s)); }
function recommendScore(t){ return computeMatch(t)*0.4 + (t.rating/5)*100*0.3 + Math.min(t.sessions/150*100,100)*0.2 + (t.isOnline?10:0); }

const SESSIONS = [
  { tutor:"Priya mahaju",  skill:"UI/UX Design", time:"Today, 4:00 PM",    status:"upcoming", initials:"PN", grad:"linear-gradient(135deg,#EC4899,#F97316)", barter:true },
  { tutor:"Dev Mahato",   skill:"Figma",         time:"Tomorrow, 2:00 PM", status:"upcoming", initials:"DM", grad:"linear-gradient(135deg,#10B981,#4ADE80)", barter:true },
  { tutor:"Tanvir ", skill:"React",         time:"Yesterday, 6:00 PM",status:"done",     initials:"TK", grad:"linear-gradient(135deg,#6C63FF,#A89BFF)", barter:false },
];

function Avatar({ grad, initials, size=46 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:grad, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:size*0.28, color:"white", flexShrink:0 }}>{initials}</div>
  );
}

export default function Dashboard({ navigate }) {
  const [bookingTutor, setBookingTutor] = useState(null);

  const sorted = [...ALL_TUTORS]
    .map(t=>({...t, match:computeMatch(t), barter:isBarter(t), rec:recommendScore(t)}))
    .sort((a,b)=>b.rec-a.rec);

  return (
    <div style={{ background:"#F3F4F6", minHeight:"100vh", fontFamily:"'Inter',sans-serif", padding:"32px 0" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
          <div>
            <p style={{ fontSize:13, color:"#9CA3AF", marginBottom:2 }}>Good afternoon 👋</p>
            <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:26, fontWeight:800, color:"#111827" }}>Welcome back, Alex</h1>
          </div>
          <button onClick={()=>navigate("explore")} style={{ padding:"10px 22px", background:"linear-gradient(135deg,#6C63FF,#4F46E5)", color:"white", border:"none", borderRadius:99, fontSize:14, fontWeight:600, cursor:"pointer" }}>
            🔍 Find a Match
          </button>
        </div>

        {/* Barter profile banner */}
        <div style={{ background:"linear-gradient(135deg,#EEF2FF,#E0E7FF)", borderRadius:14, padding:"16px 22px", marginBottom:24, border:"1px solid #C7D2FE", display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#4338CA", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>⚡ Your Barter Profile</p>
            <div style={{ display:"flex", gap:24 }}>
              <div>
                <p style={{ fontSize:11, color:"#6B7280", marginBottom:4 }}>You Teach:</p>
                <div style={{ display:"flex", gap:5 }}>
                  {MY_PROFILE.teaches.map(s=><span key={s} style={{ padding:"3px 10px", background:"#EEF2FF", color:"#4338CA", borderRadius:99, fontSize:11, fontWeight:600, border:"1px solid #C7D2FE" }}>⚡ {s}</span>)}
                </div>
              </div>
              <div>
                <p style={{ fontSize:11, color:"#6B7280", marginBottom:4 }}>You Want to Learn:</p>
                <div style={{ display:"flex", gap:5 }}>
                  {MY_PROFILE.wants.map(s=><span key={s} style={{ padding:"3px 10px", background:"#ECFDF5", color:"#059669", borderRadius:99, fontSize:11, fontWeight:600, border:"1px solid #BBF7D0" }}>✓ {s}</span>)}
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign:"center", background:"white", padding:"12px 20px", borderRadius:12, border:"1px solid #C7D2FE" }}>
            <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:800, color:"#059669" }}>{sorted.filter(t=>t.barter).length}</p>
            <p style={{ fontSize:11, color:"#6B7280" }}>Free barter matches</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
          {[
            { label:"Sessions Done",   value:"24",  icon:"✅", delta:"+3 this week",  color:"#EEF2FF" },
            { label:"Skills Learning", value:"2",   icon:"📚", delta:"UI/UX + Figma", color:"#ECFDF5" },
            { label:"Free Matches",    value:"2",   icon:"🔄", delta:"Barter ready",  color:"#FEF3C7" },
            { label:"Avg. Rating",     value:"4.8★",icon:"⭐", delta:"Top 10%",       color:"#FDF2F8" },
          ].map(s=>(
            <div key={s.label} style={{ background:"white", borderRadius:14, padding:"18px 16px", border:"1px solid #F3F4F6", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <p style={{ fontSize:12, color:"#9CA3AF" }}>{s.label}</p>
                <div style={{ width:32, height:32, borderRadius:8, background:s.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{s.icon}</div>
              </div>
              <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:800, color:"#111827", marginBottom:2 }}>{s.value}</p>
              <p style={{ fontSize:11, color:"#10B981", fontWeight:600 }}>{s.delta}</p>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:24 }}>
          {/* Main */}
          <div>
            {/* AI Recommended */}
            <div style={{ background:"white", borderRadius:16, border:"1px solid #F3F4F6", padding:22, marginBottom:22 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                    <span style={{ fontSize:16 }}>🤖</span>
                    <p style={{ fontSize:11, fontWeight:700, color:"#6C63FF", textTransform:"uppercase", letterSpacing:"0.06em" }}>AI Recommendations</p>
                  </div>
                  <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:17, fontWeight:700, color:"#111827" }}>Best matches for you</h2>
                </div>
                <button onClick={()=>navigate("explore")} style={{ fontSize:13, color:"#6C63FF", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>View all →</button>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {sorted.map(tutor=>(
                  <div key={tutor.id} style={{
                    display:"flex", alignItems:"center", gap:14,
                    padding:"14px", borderRadius:12,
                    border:`1.5px solid ${tutor.barter?"#BBF7D0":"#F3F4F6"}`,
                    background:tutor.barter?"#FAFFFE":"white",
                    transition:"all 0.2s", cursor:"pointer"
                  }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor="#6C63FF"; e.currentTarget.style.background="#FAFAFE"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=tutor.barter?"#BBF7D0":"#F3F4F6"; e.currentTarget.style.background=tutor.barter?"#FAFFFE":"white"; }}
                  >
                    <div style={{ position:"relative" }}>
                      <Avatar grad={tutor.avatarGrad} initials={tutor.initials} size={46}/>
                      {tutor.isOnline && <span style={{ position:"absolute", bottom:1, right:1, width:11, height:11, borderRadius:"50%", background:"#10B981", border:"2px solid white" }}/>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                        <p style={{ fontWeight:700, fontSize:14, color:"#111827" }}>{tutor.name}</p>
                        {tutor.barter && <span style={{ padding:"2px 8px", background:"#ECFDF5", color:"#059669", borderRadius:99, fontSize:10, fontWeight:700, border:"1px solid #BBF7D0" }}>🔄 Free Barter</span>}
                        {tutor.match>0 && <span style={{ padding:"2px 8px", background:"#EEF2FF", color:"#4338CA", borderRadius:99, fontSize:10, fontWeight:700 }}>{tutor.match}% match</span>}
                      </div>
                      <p style={{ fontSize:12, color:"#9CA3AF", marginBottom:4 }}>{tutor.university} · {tutor.year}</p>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {tutor.teaches.slice(0,2).map(s=>(
                          <span key={s} style={{ padding:"2px 8px", background:MY_PROFILE.wants.includes(s)?"#ECFDF5":"#F3F4F6", color:MY_PROFILE.wants.includes(s)?"#059669":"#374151", borderRadius:99, fontSize:10, fontWeight:500 }}>{MY_PROFILE.wants.includes(s)?"✓ ":""}{s}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <p style={{ fontSize:11, color:"#9CA3AF", marginBottom:2 }}>⭐ {tutor.rating}</p>
                      <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, fontWeight:800, color:tutor.barter?"#059669":"#6C63FF", marginBottom:6 }}>
                        {tutor.barter ? "FREE" : tutor.rate===0?"FREE":`$${tutor.rate}/hr`}
                      </p>
                      <button onClick={e=>{e.stopPropagation();setBookingTutor(tutor);}} style={{ padding:"6px 14px", background:tutor.barter?"#059669":"#6C63FF", color:"white", border:"none", borderRadius:99, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                        {tutor.barter?"🔄 Barter":"📅 Book"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            {/* Sessions */}
            <div style={{ background:"white", borderRadius:16, border:"1px solid #F3F4F6", padding:20 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, fontWeight:700, color:"#111827", marginBottom:14 }}>📅 My Sessions</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {SESSIONS.map((s,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:10, background:s.status==="upcoming"?"#F8F7FF":"white", borderRadius:10, border:"1px solid #F3F4F6" }}>
                    <Avatar grad={s.grad} initials={s.initials} size={34}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{s.tutor}</p>
                      <p style={{ fontSize:11, color:"#9CA3AF" }}>{s.skill} · {s.time}</p>
                    </div>
                    {s.status==="upcoming"
                      ? <button style={{ padding:"4px 10px", background:"#6C63FF", color:"white", border:"none", borderRadius:99, fontSize:11, fontWeight:600, cursor:"pointer" }}>🎥 Join</button>
                      : <span style={{ fontSize:11, color:"#9CA3AF", fontWeight:500 }}>Done</span>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Barter status */}
            <div style={{ background:"linear-gradient(135deg,#059669,#10B981)", borderRadius:16, padding:22, color:"white" }}>
              <p style={{ fontSize:12, opacity:0.8, marginBottom:4 }}>Barter Status</p>
              <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:800, marginBottom:4 }}>2 Free <span style={{ fontSize:20 }}>🔄</span></p>
              <p style={{ fontSize:12, opacity:0.8, marginBottom:18 }}>Skill exchange matches ready</p>
              <button onClick={()=>navigate("explore")} style={{ width:"100%", padding:10, background:"rgba(255,255,255,0.2)", color:"white", border:"1px solid rgba(255,255,255,0.3)", borderRadius:99, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                View all barter matches
              </button>
            </div>

            {/* Teach & earn */}
            <div style={{ background:"#FFFBEB", borderRadius:16, border:"1px solid #FDE68A", padding:20 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#92400E", marginBottom:6 }}>🎓 Expand your barter profile</p>
              <p style={{ fontSize:13, color:"#B45309", marginBottom:14, lineHeight:1.5 }}>Add more skills you can teach to unlock more free barter matches.</p>
              <button style={{ width:"100%", padding:10, background:"#F59E0B", color:"white", border:"none", borderRadius:99, fontSize:13, fontWeight:600, cursor:"pointer" }}>+ Add a skill</button>
            </div>
          </div>
        </div>
      </div>

      {bookingTutor && <BookingModal tutor={bookingTutor} onClose={()=>setBookingTutor(null)}/>}
    </div>
  );
}
