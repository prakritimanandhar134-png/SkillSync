import { useState } from "react";

const POPULAR_TAGS = ["React", "Python", "Figma", "Spanish", "Guitar", "Machine Learning"];

const STATS = [
  { value: "42,000+", label: "Active Learners" },
  { value: "8,500+",  label: "Skill Listings" },
  { value: "12,000+", label: "Sessions Held" },
  { value: "96%",     label: "Satisfaction Rate" },
];

const HOW_IT_WORKS = [
  { num: "01", title: "Create Your Profile",  desc: "List the skills you can teach and the skills you want to learn." },
  { num: "02", title: "Find Your Match",       desc: "Our smart algorithm connects you with complementary skill partners." },
  { num: "03", title: "Start Exchanging",      desc: "Schedule sessions, learn together, and grow your skill set for free." },
];

const CATEGORIES = [
  { name: "Programming", count: "1,240 skills", icon: "💻", bg: "linear-gradient(135deg,#7C3AED,#6C63FF)" },
  { name: "Design",       count: "890 skills",  icon: "🎨", bg: "linear-gradient(135deg,#EC4899,#F97316)" },
];

const MENTORS = [
  { initials:"PS", name:"Priya Sharma",  role:"Full-Stack Engineer at Stripe",  tags:["React","TypeScript","Node.js"], reviews:127, sessions:214, rating:4.9, color:"#7C3AED" },
  { initials:"MC", name:"Marcus Chen",   role:"Product Designer at Figma",       tags:["UI/UX","Figma","Prototyping"],  reviews:89,  sessions:156, rating:4.8, color:"#06B6D4" },
  { initials:"SA", name:"Sofia Andrade", role:"Data Scientist at Spotify",        tags:["Python","ML/AI","Statistics"],   reviews:103, sessions:178, rating:4.9, color:"#10B981" },
  { initials:"JO", name:"James Okafor",  role:"Marketing Lead at HubSpot",        tags:["SEO","Content Strategy","Analytics"], reviews:64, sessions:98, rating:4.7, color:"#F59E0B" },
];

const TESTIMONIALS = [
  { stars:5, text:"I traded React lessons for Spanish coaching. Learned more in 3 weeks than I did in a year of apps. SkillSync is genuinely magical.", name:"Elena Torres",   role:"Software Engineer", initials:"ET", color:"#7C3AED" },
  { stars:5, text:"The quality of mentors here is incredible. My UI/UX skills went from zero to landing a design role at a startup within 4 months.",   name:"Ryan Park",      role:"Product Designer",  initials:"RP", color:"#06B6D4" },
  { stars:5, text:"As a teacher I got so much more than a student. The exchange model makes both sides more committed and engaged. Highly recommend.",      name:"Aisha Mohammed", role:"Data Analyst",      initials:"AM", color:"#10B981" },
];

/* ── Inline SVG logo matching the SkillSync logo (laptop + grad cap) ── */
function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E3A5F"/>
          <stop offset="1" stopColor="#0EA5E9"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#logoGrad)"/>
      {/* laptop screen */}
      <rect x="7" y="15" width="26" height="15" rx="2" fill="none" stroke="white" strokeWidth="2"/>
      {/* laptop base */}
      <path d="M4 30h32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 30h6v2h-6z" fill="white"/>
      {/* graduation cap */}
      <polygon points="20,6 29,10.5 20,15 11,10.5" fill="#F59E0B"/>
      <line x1="29" y1="10.5" x2="29" y2="16" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="29" cy="16.5" r="1.2" fill="#F59E0B"/>
    </svg>
  );
}

export default function LandingPage({ navigate, onLogin }) {
  const [search, setSearch] = useState("");

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"white" }}>

      {/* ══════════════════════════════
          NAVBAR
      ══════════════════════════════ */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        background:"rgba(255,255,255,0.97)",
        backdropFilter:"blur(12px)",
        borderBottom:"1px solid #EBEBF0",
        padding:"0 48px",
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:66 }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Logo size={36}/>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20 }}>
              <span style={{ color:"#1E3A5F" }}>Skill</span>
              <span style={{ color:"#0EA5E9" }}>Sync</span>
            </span>
          </div>

          {/* Links */}
          <div style={{ display:"flex", gap:36 }}>
            {[
              { label:"Skills",        action:() => navigate("explore") },
              { label:"Find Mentors",  action:() => navigate("explore") },
              { label:"Dashboard",     action:() => navigate("dashboard") },
            ].map(l => (
              <button key={l.label} onClick={l.action} style={{
                background:"none", border:"none", fontSize:15,
                color:"#4B5563", cursor:"pointer", fontWeight:500,
                transition:"color 0.15s"
              }}
              onMouseEnter={e => e.target.style.color="#6C63FF"}
              onMouseLeave={e => e.target.style.color="#4B5563"}
              >{l.label}</button>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            {/* Bell */}
            <button style={{ background:"none", border:"none", cursor:"pointer", position:"relative", padding:4 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span style={{ position:"absolute", top:2, right:2, width:8, height:8, borderRadius:"50%", background:"#6C63FF", border:"2px solid white" }}/>
            </button>

            {/* User */}
            <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }} onClick={() => navigate("profile")}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:"#6C63FF", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:13 }}>A</div>
              <span style={{ fontSize:14, fontWeight:500, color:"#111827" }}>Alex</span>
              <span style={{ color:"#9CA3AF", fontSize:11 }}>▾</span>
            </div>

            <button onClick={onLogin} style={{
              padding:"9px 22px", background:"#6C63FF", color:"white",
              border:"none", borderRadius:99, fontSize:14, fontWeight:600, cursor:"pointer",
              transition:"background 0.2s"
            }}
            onMouseEnter={e => e.target.style.background="#4F46E5"}
            onMouseLeave={e => e.target.style.background="#6C63FF"}
            >Get Started</button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section style={{
        background:"linear-gradient(160deg, #EEEEFF 0%, #EEF2FF 50%, #E8F4FD 100%)",
        padding:"96px 48px 72px",
        textAlign:"center",
        position:"relative", overflow:"hidden"
      }}>
        {/* soft bg blobs */}
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(108,99,255,0.09) 0%,transparent 70%)", top:-160, right:-80, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle,rgba(14,165,233,0.07) 0%,transparent 70%)", bottom:-100, left:40, pointerEvents:"none" }}/>

        <div style={{ maxWidth:820, margin:"0 auto", position:"relative" }}>
          {/* pill */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"7px 18px", background:"white",
            borderRadius:99, fontSize:13, fontWeight:500, color:"#4B5563",
            border:"1px solid #E5E7EB", marginBottom:32,
            boxShadow:"0 2px 10px rgba(108,99,255,0.08)"
          }}>
            <span style={{ fontSize:15 }}>⚡</span>
            The skill economy is here — join 42,000+ learners
          </div>

          <h1 style={{
            fontFamily:"'Space Grotesk',sans-serif",
            fontSize:70, fontWeight:800, lineHeight:1.06,
            color:"#111827", marginBottom:24
          }}>
            Exchange Skills,<br/>
            <span style={{ color:"#6C63FF" }}>Grow Together</span>
          </h1>

          <p style={{ fontSize:18, color:"#6B7280", lineHeight:1.7, maxWidth:580, margin:"0 auto 48px" }}>
            SkillSync connects people who want to teach what they know with people who want to learn. No money needed — just mutual expertise and genuine curiosity.
          </p>

          {/* Search */}
          <div style={{
            display:"flex", alignItems:"center",
            background:"white", borderRadius:14,
            border:"1.5px solid #E5E7EB",
            boxShadow:"0 4px 24px rgba(108,99,255,0.10)",
            padding:"6px 6px 6px 20px",
            maxWidth:600, margin:"0 auto 18px"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ marginRight:10, flexShrink:0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key==="Enter" && navigate("explore")}
              placeholder="What skill do you want to learn?"
              style={{ flex:1, border:"none", outline:"none", fontSize:15, color:"#374151", background:"transparent", fontFamily:"'Inter',sans-serif" }}
            />
            <button onClick={() => navigate("explore")} style={{
              padding:"12px 28px", background:"#6C63FF", color:"white",
              border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap"
            }}>Find Skills</button>
          </div>

          {/* Popular tags */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, color:"#9CA3AF" }}>Popular:</span>
            {POPULAR_TAGS.map(t => (
              <button key={t} onClick={() => navigate("explore")} style={{
                background:"none", border:"none", fontSize:13,
                fontWeight:600, color:"#6C63FF", cursor:"pointer", padding:"2px 4px"
              }}>{t}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          STATS
      ══════════════════════════════ */}
      <section style={{ background:"linear-gradient(160deg,#EEEEFF 0%,#EEF2FF 100%)", padding:"0 48px 64px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
          {STATS.map(s => (
            <div key={s.label} style={{
              background:"white", borderRadius:16, padding:"28px 20px",
              border:"1px solid #F3F4F6", textAlign:"center",
              boxShadow:"0 2px 12px rgba(108,99,255,0.06)"
            }}>
              <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:38, fontWeight:800, color:"#111827", marginBottom:4 }}>{s.value}</p>
              <p style={{ fontSize:14, color:"#6B7280" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          HOW IT WORKS
      ══════════════════════════════ */}
      <section style={{ background:"white", padding:"80px 48px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", color:"#6C63FF", textTransform:"uppercase", marginBottom:12 }}>SIMPLE PROCESS</p>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:40, fontWeight:800, color:"#111827" }}>How SkillSync Works</h2>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:0, position:"relative" }}>
            {/* connector line */}
            <div style={{ position:"absolute", top:27, left:"17%", right:"17%", height:2, background:"#E5E7EB", zIndex:0 }}/>

            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} style={{ padding:"0 24px", position:"relative", zIndex:1 }}>
                <div style={{
                  width:56, height:56, borderRadius:14,
                  background:"linear-gradient(135deg,#6C63FF,#8B5CF6)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:18, color:"white",
                  marginBottom:24, boxShadow:"0 4px 16px rgba(108,99,255,0.25)"
                }}>{step.num}</div>
                <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:700, color:"#111827", marginBottom:10 }}>{step.title}</h3>
                <p style={{ fontSize:14, color:"#6B7280", lineHeight:1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          BROWSE BY CATEGORY
      ══════════════════════════════ */}
      <section style={{ background:"#F9FAFB", padding:"80px 48px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:36 }}>
            <div>
              <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", color:"#6C63FF", textTransform:"uppercase", marginBottom:8 }}>EXPLORE</p>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:36, fontWeight:800, color:"#111827" }}>Browse by Category</h2>
            </div>
            <button onClick={() => navigate("explore")} style={{ background:"none", border:"none", color:"#6C63FF", fontWeight:600, fontSize:14, cursor:"pointer" }}>View all ›</button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:20, maxWidth:680 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.name} onClick={() => navigate("explore")} style={{
                background:"white", border:"1px solid #F3F4F6",
                borderRadius:16, padding:"28px 24px",
                textAlign:"left", cursor:"pointer",
                boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
                transition:"all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow="0 8px 28px rgba(108,99,255,0.14)"; e.currentTarget.style.transform="translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.04)"; e.currentTarget.style.transform="translateY(0)"; }}
              >
                <div style={{
                  width:52, height:52, borderRadius:14,
                  background:cat.bg,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:26, marginBottom:16
                }}>{cat.icon}</div>
                <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:17, color:"#111827", marginBottom:4 }}>{cat.name}</p>
                <p style={{ fontSize:13, color:"#9CA3AF" }}>{cat.count}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FEATURED MENTORS
      ══════════════════════════════ */}
      <section style={{ background:"white", padding:"80px 48px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:36 }}>
            <div>
              <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", color:"#6C63FF", textTransform:"uppercase", marginBottom:8 }}>TOP RATED</p>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:36, fontWeight:800, color:"#111827" }}>Featured Mentors</h2>
            </div>
            <button onClick={() => navigate("explore")} style={{ background:"none", border:"none", color:"#6C63FF", fontWeight:600, fontSize:14, cursor:"pointer" }}>View all ›</button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
            {MENTORS.map((m, i) => (
              <div key={i} style={{
                background:"white", border:"1px solid #F3F4F6",
                borderRadius:16, padding:"24px",
                boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
                transition:"all 0.2s", cursor:"pointer"
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow="0 8px 28px rgba(108,99,255,0.12)"; e.currentTarget.style.transform="translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.04)"; e.currentTarget.style.transform="translateY(0)"; }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <div style={{
                    width:48, height:48, borderRadius:"50%", background:m.color,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:"white"
                  }}>{m.initials}</div>
                  <span style={{ fontSize:13, fontWeight:600, color:"#F59E0B" }}>★ {m.rating}</span>
                </div>
                <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15, color:"#111827", marginBottom:4 }}>{m.name}</p>
                <p style={{ fontSize:12, color:"#9CA3AF", marginBottom:14 }}>{m.role}</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:16 }}>
                  {m.tags.map(t => (
                    <span key={t} style={{ padding:"3px 10px", background:"#F3F4F6", color:"#374151", borderRadius:99, fontSize:11, fontWeight:500 }}>{t}</span>
                  ))}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#9CA3AF", borderTop:"1px solid #F3F4F6", paddingTop:12 }}>
                  <span>{m.reviews} reviews</span>
                  <span>{m.sessions} sessions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FIND YOUR PERFECT MATCH CTA
      ══════════════════════════════ */}
      <section style={{ background:"#F9FAFB", padding:"60px 48px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{
            background:"linear-gradient(135deg,#6C63FF 0%,#4F46E5 55%,#3B82F6 100%)",
            borderRadius:20, padding:"52px 56px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            boxShadow:"0 16px 56px rgba(108,99,255,0.28)",
            position:"relative", overflow:"hidden"
          }}>
            <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"rgba(255,255,255,0.05)", top:-100, right:200, pointerEvents:"none" }}/>
            <div style={{ position:"relative" }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:34, fontWeight:800, color:"white", marginBottom:12 }}>
                Find Your Perfect Match
              </h2>
              <p style={{ fontSize:15, color:"rgba(255,255,255,0.8)", marginBottom:24, maxWidth:440, lineHeight:1.65 }}>
                Answer 3 quick questions and our AI algorithm will find your ideal skill exchange partner in seconds.
              </p>
              <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
                {["Instant Matching","Verified Profiles","Smart Scheduling"].map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.85)", fontWeight:500 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12, flexShrink:0, position:"relative" }}>
              <button onClick={onLogin} style={{
                padding:"13px 30px", background:"white", color:"#6C63FF",
                border:"none", borderRadius:99, fontSize:15, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap"
              }}>Get Matched Now</button>
              <button style={{
                padding:"13px 30px", background:"rgba(255,255,255,0.15)",
                color:"white", border:"1.5px solid rgba(255,255,255,0.4)",
                borderRadius:99, fontSize:15, fontWeight:600, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8
              }}>
                <span style={{ fontSize:12 }}>▶</span> Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          TESTIMONIALS
      ══════════════════════════════ */}
      <section style={{ background:"white", padding:"80px 48px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <p style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", color:"#6C63FF", textTransform:"uppercase", marginBottom:12 }}>SUCCESS STORIES</p>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:40, fontWeight:800, color:"#111827" }}>Loved by learners worldwide</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background:"white", border:"1px solid #F3F4F6",
                borderRadius:16, padding:"28px",
                boxShadow:"0 2px 12px rgba(0,0,0,0.04)"
              }}>
                <div style={{ color:"#F59E0B", fontSize:18, marginBottom:16, letterSpacing:2 }}>{"★".repeat(t.stars)}</div>
                <p style={{ fontSize:14, color:"#374151", lineHeight:1.75, marginBottom:24 }}>"{t.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{
                    width:40, height:40, borderRadius:"50%", background:t.color,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:"white"
                  }}>{t.initials}</div>
                  <div>
                    <p style={{ fontWeight:600, fontSize:14, color:"#111827" }}>{t.name}</p>
                    <p style={{ fontSize:12, color:"#9CA3AF" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FINAL CTA
      ══════════════════════════════ */}
      <section style={{ background:"#F9FAFB", padding:"88px 48px", textAlign:"center" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:46, fontWeight:800, color:"#111827", marginBottom:16 }}>
            Start Learning for Free Today
          </h2>
          <p style={{ fontSize:16, color:"#6B7280", marginBottom:44, lineHeight:1.6 }}>
            Join thousands who are leveling up their skills through peer exchange. No credit card required.
          </p>
          <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={onLogin} style={{
              padding:"15px 34px", background:"#6C63FF", color:"white",
              border:"none", borderRadius:99, fontSize:16, fontWeight:700, cursor:"pointer",
              display:"flex", alignItems:"center", gap:8
            }}>Create Free Account <span>→</span></button>
            <button onClick={() => navigate("explore")} style={{
              padding:"15px 34px", background:"white", color:"#374151",
              border:"1.5px solid #E5E7EB", borderRadius:99,
              fontSize:16, fontWeight:600, cursor:"pointer",
              display:"flex", alignItems:"center", gap:8
            }}>📖 Browse Skills</button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FOOTER
      ══════════════════════════════ */}
      <footer style={{ background:"#111827", padding:"56px 48px 36px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:48 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <Logo size={32}/>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18 }}>
                  <span style={{ color:"white" }}>Skill</span><span style={{ color:"#0EA5E9" }}>Sync</span>
                </span>
              </div>
              <p style={{ fontSize:13, color:"#9CA3AF", lineHeight:1.65, maxWidth:230 }}>
                The peer-to-peer skill exchange platform for students and lifelong learners.
              </p>
            </div>
            {[
              { title:"Platform", links:["Browse Skills","Find Mentors","Dashboard","How it works"] },
              { title:"Company",  links:["About Us","Blog","Careers","Press"] },
              { title:"Support",  links:["Help Center","Community","Privacy","Terms"] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontWeight:700, fontSize:14, color:"white", marginBottom:18 }}>{col.title}</p>
                {col.links.map(l => (
                  <p key={l} style={{ fontSize:13, color:"#9CA3AF", marginBottom:12, cursor:"pointer", transition:"color 0.15s" }}
                    onMouseEnter={e => e.target.style.color="white"}
                    onMouseLeave={e => e.target.style.color="#9CA3AF"}
                  >{l}</p>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid #1F2937", paddingTop:28, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <p style={{ fontSize:13, color:"#6B7280" }}>© 2025 SkillSync. All rights reserved.</p>
            <p style={{ fontSize:13, color:"#6B7280" }}>Built for students, by students 🎓</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
