import { useState } from "react";

const STATS = [
  { label:"Total Users",    value:"42,186", sub:"+2,340 this month", delta:"+18%", icon:"👥", color:"#EEF2FF" },
  { label:"Active Skills",  value:"8,502",  sub:"+412 this week",    delta:"+5%",  icon:"📖", color:"#ECFDF5" },
  { label:"Sessions Today", value:"1,247",  sub:"Peak hour: 3-4 PM", delta:"+31%", icon:"📅", color:"#EFF6FF" },
  { label:"Revenue MRR",    value:"$48.2k", sub:"Pro subscriptions",  delta:"+12%", icon:"📈", color:"#FFFBEB" },
];
const SKILL_CATS = [
  { name:"Programming", count:1240, color:"#6C63FF" },
  { name:"Design",      count:890,  color:"#3B82F6" },
  
];
const USERS = [
  { name:"Priya Sharma",  email:"priya@example.com",  role:"User",  sessions:214, status:"Active",   avatar:"PS", color:"#7C3AED" },
  { name:"Marcus Chen",   email:"marcus@example.com",  role:"User",  sessions:156, status:"Active",   avatar:"MC", color:"#06B6D4" },
  { name:"Sofia Andrade", email:"sofia@example.com",   role:"User",  sessions:178, status:"Active",   avatar:"SA", color:"#10B981" },
  { name:"James Okafor",  email:"james@example.com",   role:"User",  sessions:98,  status:"Inactive", avatar:"JO", color:"#F59E0B" },
  { name:"Alex Johnson",  email:"alex@example.com",    role:"Admin", sessions:47,  status:"Active",   avatar:"AJ", color:"#6C63FF" },
];

// Tiny SVG line chart
function LineChart() {
  const pts = [0,5,8,15,20,25,35,38,42,44,48].map((v,i) => `${i*70},${200-v*4}`).join(" ");
  return (
    <svg width="100%" height="200" viewBox="0 0 700 210" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#6C63FF" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0,50,100,150,200].map(y => (
        <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="#F3F4F6" strokeWidth="1"/>
      ))}
      <polyline fill="none" stroke="#6C63FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts}/>
      <polygon fill="url(#chartGrad)" points={`0,200 ${pts} 700,200`}/>
      {["Jan","Feb","Mar","Apr","May","Jun"].map((m,i) => (
        <text key={m} x={i*112+20} y="215" fontSize="11" fill="#9CA3AF">{m}</text>
      ))}
      {[0,15000,30000,45000,60000].map((v,i) => (
        <text key={v} x="0" y={200-i*48} fontSize="10" fill="#9CA3AF">{v>0?v.toLocaleString():0}</text>
      ))}
    </svg>
  );
}

// Donut chart
function DonutChart() {
  const total = SKILL_CATS.reduce((a,c)=>a+c.count,0);
  let offset = 0;
  const r = 60, cx = 80, cy = 80, circ = 2*Math.PI*r;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      {SKILL_CATS.map(cat => {
        const pct = cat.count/total;
        const dash = pct*circ;
        const gap = circ - dash;
        const el = (
          <circle key={cat.name} cx={cx} cy={cy} r={r}
            fill="none" stroke={cat.color} strokeWidth="22"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset*circ}
            style={{ transform:"rotate(-90deg)", transformOrigin:"80px 80px" }}
          />
        );
        offset += pct;
        return el;
      })}
      <circle cx={cx} cy={cy} r={r-14} fill="white"/>
    </svg>
  );
}

export default function AdminPage({ navigate }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div style={{ background:"#F3F4F6", minHeight:"100vh", fontFamily:"'Inter',sans-serif" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#6C63FF,#4F46E5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>⚙️</div>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:800, color:"#111827" }}>Admin Console</h1>
                <span style={{ padding:"3px 10px", background:"#EEF2FF", color:"#6C63FF", borderRadius:99, fontSize:12, fontWeight:700 }}>Super Admin</span>
              </div>
            </div>
          </div>
          <button style={{ padding:"9px 18px", background:"white", color:"#374151", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            ⬇️ Export Data
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background:"white", borderRadius:16, padding:"22px 20px", border:"1px solid #F3F4F6", boxShadow:"0 1px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <p style={{ fontSize:13, color:"#6B7280" }}>{s.label}</p>
                <div style={{ width:36, height:36, borderRadius:10, background:s.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{s.icon}</div>
              </div>
              <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:800, color:"#111827", marginBottom:4 }}>{s.value}</p>
              <div style={{ display:"flex", gap:8 }}>
                <span style={{ fontSize:12, color:"#6B7280" }}>{s.sub}</span>
                <span style={{ fontSize:12, fontWeight:700, color:"#10B981" }}>↑ {s.delta}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:0, marginBottom:20, borderBottom:"2px solid #E5E7EB", background:"white", borderRadius:"12px 12px 0 0", padding:"0 20px" }}>
          {["Overview","Users","Skills","Reports"].map((tab,i) => (
            <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} style={{
              padding:"14px 20px", background:"none", border:"none",
              fontSize:14, fontWeight:600, cursor:"pointer",
              color:activeTab===tab.toLowerCase()?"#6C63FF":"#6B7280",
              borderBottom:activeTab===tab.toLowerCase()?"2px solid #6C63FF":"2px solid transparent",
              marginBottom:-2, position:"relative"
            }}>
              {tab}
              {tab==="Reports" && <span style={{ marginLeft:6, padding:"1px 7px", background:"#EF4444", color:"white", borderRadius:99, fontSize:10, fontWeight:700 }}>2</span>}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20, marginBottom:20 }}>
              {/* Line chart */}
              <div style={{ background:"white", borderRadius:16, padding:"24px", border:"1px solid #F3F4F6", boxShadow:"0 1px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                  <div>
                    <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:"#111827" }}>Platform Growth</p>
                    <p style={{ fontSize:12, color:"#9CA3AF" }}>Users & sessions over time</p>
                  </div>
                  <div style={{ display:"flex", gap:16 }}>
                    <span style={{ fontSize:12, color:"#6B7280", display:"flex", alignItems:"center", gap:5 }}><span style={{ width:8, height:8, borderRadius:"50%", background:"#6C63FF", display:"inline-block" }}/> Users</span>
                    <span style={{ fontSize:12, color:"#6B7280", display:"flex", alignItems:"center", gap:5 }}><span style={{ width:8, height:8, borderRadius:"50%", background:"#93C5FD", display:"inline-block" }}/> Sessions</span>
                  </div>
                </div>
                <LineChart/>
              </div>

              {/* Donut chart */}
              <div style={{ background:"white", borderRadius:16, padding:"24px", border:"1px solid #F3F4F6", boxShadow:"0 1px 8px rgba(0,0,0,0.04)" }}>
                <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:"#111827", marginBottom:16 }}>Skills by Category</p>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
                  <DonutChart/>
                </div>
                {SKILL_CATS.map(c => (
                  <div key={c.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <span style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#374151" }}>
                      <span style={{ width:10, height:10, borderRadius:"50%", background:c.color, display:"inline-block" }}/>
                      {c.name}
                    </span>
                    <span style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{c.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom metric cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {[
                { icon:"⚡", label:"Skill Score Avg.", value:"724", sub:"Platform-wide median", iconBg:"#EEF2FF", iconColor:"#6C63FF" },
                { icon:"📊", label:"Exchange Rate",    value:"68%", sub:"Requests → sessions",  iconBg:"#ECFDF5", iconColor:"#10B981" },
                { icon:"⚠️", label:"Open Reports",     value:"2",   sub:"1 high severity",       iconBg:"#FFFBEB", iconColor:"#F59E0B" },
              ].map(m => (
                <div key={m.label} style={{ background:"white", borderRadius:16, padding:"22px", border:"1px solid #F3F4F6", display:"flex", alignItems:"center", gap:16 }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:m.iconBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{m.icon}</div>
                  <div>
                    <p style={{ fontSize:12, color:"#9CA3AF", marginBottom:4 }}>{m.label}</p>
                    <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:26, fontWeight:800, color:"#111827", marginBottom:2 }}>{m.value}</p>
                    <p style={{ fontSize:12, color:"#6B7280" }}>{m.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div style={{ background:"white", borderRadius:16, border:"1px solid #F3F4F6", overflow:"hidden", boxShadow:"0 1px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ padding:"18px 24px", borderBottom:"1px solid #F3F4F6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:"#111827" }}>All Users</p>
              <input placeholder="Search users..." style={{ padding:"8px 14px", border:"1.5px solid #E5E7EB", borderRadius:8, fontSize:13, outline:"none", width:220 }}/>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#F9FAFB" }}>
                  {["User","Email","Role","Sessions","Status","Action"].map(h => (
                    <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {USERS.map((u,i) => (
                  <tr key={i} style={{ borderTop:"1px solid #F3F4F6" }}
                    onMouseEnter={e => e.currentTarget.style.background="#FAFAFA"}
                    onMouseLeave={e => e.currentTarget.style.background="white"}>
                    <td style={{ padding:"14px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:"50%", background:u.color, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:"white" }}>{u.avatar}</div>
                        <span style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:"14px 16px", fontSize:13, color:"#6B7280" }}>{u.email}</td>
                    <td style={{ padding:"14px 16px" }}>
                      <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:u.role==="Admin"?"#EEF2FF":"#F3F4F6", color:u.role==="Admin"?"#6C63FF":"#374151" }}>{u.role}</span>
                    </td>
                    <td style={{ padding:"14px 16px", fontSize:13, color:"#374151", fontWeight:600 }}>{u.sessions}</td>
                    <td style={{ padding:"14px 16px" }}>
                      <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:u.status==="Active"?"#ECFDF5":"#F3F4F6", color:u.status==="Active"?"#059669":"#9CA3AF" }}>{u.status}</span>
                    </td>
                    <td style={{ padding:"14px 16px" }}>
                      <button style={{ padding:"5px 12px", background:"#F5F3FF", color:"#6C63FF", border:"1px solid #E9D5FF", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === "skills" && (
          <div style={{ background:"white", borderRadius:16, padding:"24px", border:"1px solid #F3F4F6" }}>
            <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:"#111827", marginBottom:20 }}>Skills by Category</p>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {SKILL_CATS.map(c => (
                <div key={c.name}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:14, fontWeight:600, color:"#374151" }}>{c.name}</span>
                    <span style={{ fontSize:14, fontWeight:700, color:c.color }}>{c.count.toLocaleString()} skills</span>
                  </div>
                  <div style={{ height:8, background:"#F3F4F6", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(c.count/1240)*100}%`, background:c.color, borderRadius:4 }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[
              { title:"Spam content report", user:"Marcus Chen", severity:"High", time:"2 hours ago", status:"Open" },
              { title:"Inappropriate session behaviour", user:"Unknown User", severity:"Medium", time:"1 day ago", status:"Open" },
              { title:"Fake profile detected", user:"System Flag", severity:"Low", time:"3 days ago", status:"Resolved" },
            ].map((r,i) => (
              <div key={i} style={{ background:"white", borderRadius:14, padding:"20px 24px", border:"1px solid #F3F4F6", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                    <p style={{ fontWeight:700, fontSize:14, color:"#111827" }}>{r.title}</p>
                    <span style={{ padding:"2px 8px", borderRadius:99, fontSize:10, fontWeight:700, background:r.severity==="High"?"#FEF2F2":r.severity==="Medium"?"#FFFBEB":"#F3F4F6", color:r.severity==="High"?"#DC2626":r.severity==="Medium"?"#D97706":"#6B7280" }}>{r.severity}</span>
                  </div>
                  <p style={{ fontSize:12, color:"#9CA3AF" }}>Reported by {r.user} · {r.time}</p>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:r.status==="Open"?"#FEF2F2":"#ECFDF5", color:r.status==="Open"?"#DC2626":"#059669" }}>{r.status}</span>
                  {r.status==="Open" && <button style={{ padding:"6px 14px", background:"#6C63FF", color:"white", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>Resolve</button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer style={{ marginTop:40, background:"white", borderRadius:16, padding:"36px 32px 20px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:28 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#6C63FF,#4F46E5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>⚡</div>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:"#111827" }}>SkillSync</span>
              </div>
              <p style={{ fontSize:13, color:"#9CA3AF", lineHeight:1.6 }}>The premier platform for peer-to-peer skill exchange and mentorship.</p>
            </div>
            {[
              { title:"Platform", links:["Browse Skills","Find Mentors","How It Works","Pricing"] },
              { title:"Company",  links:["About Us","Blog","Careers","Press"] },
              { title:"Support",  links:["Help Center","Community","Contact Us","Status"] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontWeight:700, fontSize:13, color:"#111827", marginBottom:14 }}>{col.title}</p>
                {col.links.map(l => (
                  <p key={l} style={{ fontSize:13, color:"#9CA3AF", marginBottom:10, cursor:"pointer" }}
                    onMouseEnter={e => e.target.style.color="#6C63FF"}
                    onMouseLeave={e => e.target.style.color="#9CA3AF"}
                  >{l}</p>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid #F3F4F6", paddingTop:18, display:"flex", justifyContent:"space-between" }}>
            <p style={{ fontSize:12, color:"#9CA3AF" }}>© 2026 SkillSync. All rights reserved.</p>
            <div style={{ display:"flex", gap:20 }}>
              {["Privacy","Terms","Cookies"].map(l => <p key={l} style={{ fontSize:12, color:"#9CA3AF", cursor:"pointer" }}>{l}</p>)}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
