function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="navLogoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E3A5F"/>
          <stop offset="1" stopColor="#0EA5E9"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#navLogoGrad)"/>
      <rect x="7" y="15" width="26" height="15" rx="2" fill="none" stroke="white" strokeWidth="2"/>
      <path d="M4 30h32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 30h6v2h-6z" fill="white"/>
      <polygon points="20,6 29,10.5 20,15 11,10.5" fill="#F59E0B"/>
      <line x1="29" y1="10.5" x2="29" y2="16" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="29" cy="16.5" r="1.2" fill="#F59E0B"/>
    </svg>
  );
}

export default function Navbar({ navigate, currentPage }) {
  const navLinks = [
    { id: "explore",   label: "Skills" },
    { id: "explore",   label: "Find Mentors" },
    { id: "dashboard", label: "Dashboard" },
  ];

  return (
    <nav style={{
      position:"sticky", top:0, zIndex:100,
      background:"rgba(255,255,255,0.97)",
      backdropFilter:"blur(12px)",
      borderBottom:"1px solid #EBEBF0",
      padding:"0 48px",
    }}>
      <div style={{
        maxWidth:1200, margin:"0 auto",
        display:"flex", alignItems:"center",
        justifyContent:"space-between", height:66
      }}>
        {/* Logo */}
        <button onClick={() => navigate("landing")} style={{
          display:"flex", alignItems:"center", gap:10,
          background:"none", border:"none", cursor:"pointer"
        }}>
          <Logo size={34}/>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20 }}>
            <span style={{ color:"#1E3A5F" }}>Skill</span>
            <span style={{ color:"#0EA5E9" }}>Sync</span>
          </span>
        </button>

        {/* Nav links */}
        <div style={{ display:"flex", gap:32 }}>
          {navLinks.map((link, i) => (
            <button key={i} onClick={() => navigate(link.id)} style={{
              background:"none", border:"none", fontSize:15,
              color: currentPage === link.id ? "#6C63FF" : "#4B5563",
              fontWeight: currentPage === link.id ? 600 : 500,
              cursor:"pointer", transition:"color 0.15s"
            }}
            onMouseEnter={e => e.target.style.color="#6C63FF"}
            onMouseLeave={e => e.target.style.color = currentPage === link.id ? "#6C63FF" : "#4B5563"}
            >{link.label}</button>
          ))}
        </div>

        {/* Right */}
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <button style={{ background:"none", border:"none", cursor:"pointer", position:"relative", padding:4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span style={{ position:"absolute", top:2, right:2, width:8, height:8, borderRadius:"50%", background:"#6C63FF", border:"2px solid white" }}/>
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }} onClick={() => navigate("profile")}>
            <div style={{
              width:32, height:32, borderRadius:"50%",
              background:"#6C63FF",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"white", fontWeight:700, fontSize:13
            }}>A</div>
            <span style={{ fontSize:14, fontWeight:500, color:"#111827" }}>Alex</span>
            <span style={{ color:"#9CA3AF", fontSize:11 }}>▾</span>
          </div>

          <button onClick={() => navigate("explore")} style={{
            padding:"9px 22px", background:"#6C63FF", color:"white",
            border:"none", borderRadius:99, fontSize:14, fontWeight:600, cursor:"pointer"
          }}>Get Started</button>
        </div>
      </div>
    </nav>
  );
}
