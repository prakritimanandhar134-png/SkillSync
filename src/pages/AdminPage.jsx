import { useState, useEffect } from "react";
import { getAdminStats, getAdminUsers, getAdminSessions, deleteUser } from "../api";

function LineChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const pts = data.map((d,i) => `${(i/(data.length-1))*680},${180-(d.value/max)*160}`).join(" ");
  return (
    <svg width="100%" height="200" viewBox="0 0 700 200" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#6C63FF" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0,45,90,135,180].map(y=>(
        <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="#F3F4F6" strokeWidth="1"/>
      ))}
      <polyline fill="none" stroke="#6C63FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts}/>
      <polygon fill="url(#cg)" points={`0,180 ${pts} 680,180`}/>
      {data.map((d,i) => (
        <text key={i} x={(i/(data.length-1))*680} y="198" fontSize="10" fill="#9CA3AF" textAnchor="middle">{d.label}</text>
      ))}
    </svg>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((a,c)=>a+c.count,0)||1;
  const colors = ["#6C63FF","#3B82F6","#10B981","#F59E0B","#EC4899"];
  let offset = 0;
  const r=60, cx=80, cy=80, circ=2*Math.PI*r;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      {data.map((cat,i) => {
        const pct = cat.count/total;
        const dash = pct*circ;
        const el = (
          <circle key={cat.name} cx={cx} cy={cy} r={r}
            fill="none" stroke={colors[i%colors.length]} strokeWidth="22"
            strokeDasharray={`${dash} ${circ-dash}`}
            strokeDashoffset={-offset*circ}
            style={{ transform:"rotate(-90deg)", transformOrigin:"80px 80px" }}
          />
        );
        offset += pct;
        return el;
      })}
      <circle cx={cx} cy={cy} r={r-14} fill="white"/>
      <text x={cx} y={cy+5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#6C63FF">{total}</text>
    </svg>
  );
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AdminPage({ navigate }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats,     setStats]     = useState(null);
  const [users,     setUsers]     = useState([]);
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [confirm,   setConfirm]   = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsData, usersData, sessionsData] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminSessions(),
      ]);
      setStats(statsData);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setConfirm(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Chart data — last 6 months
  const now = new Date();
  const chartData = Array.from({length:6}, (_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1);
    const count = users.filter(u => {
      const created = new Date(u.created_at);
      return created.getMonth()===d.getMonth() && created.getFullYear()===d.getFullYear();
    }).length;
    return { label: MONTHS[d.getMonth()], value: count };
  });

  // Skills by category from sessions
  const skillCategories = [
    { name:"Programming", count: sessions.filter(s=>s.skill_name&&!["UI/UX","Figma","Design","Illustration","Graphic Design"].includes(s.skill_name)).length },
    { name:"Design",      count: sessions.filter(s=>["UI/UX","Figma","Design","Illustration","Graphic Design"].includes(s.skill_name)).length },
  ];

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F3F4F6" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:48, height:48, border:"4px solid #E5E7EB", borderTopColor:"#6C63FF", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
          <p style={{ color:"#6B7280", fontSize:14 }}>Loading admin console...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

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
              <p style={{ fontSize:13, color:"#9CA3AF" }}>Manage users, sessions and platform data</p>
            </div>
          </div>
          <button onClick={fetchAll} style={{ padding:"9px 18px", background:"white", color:"#374151", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer" }}>
            🔄 Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
          {[
            { label:"Total Users",    value:stats?.total_users||users.length,        sub:"Registered students",    delta:"+Active",  icon:"👥", color:"#EEF2FF" },
            { label:"Active Skills",  value:stats?.total_skills||"—",                sub:"Available on platform",  delta:"Programming & Design", icon:"📖", color:"#ECFDF5" },
            { label:"Sessions Today", value:stats?.sessions_today||0,                sub:"Booked today",           delta:"All types", icon:"📅", color:"#EFF6FF" },
            { label:"Exchange Rate",  value:stats?.exchange_rate?`${stats.exchange_rate}%`:"—", sub:"Barter vs paid",  delta:"Platform wide", icon:"🔄", color:"#FFFBEB" },
          ].map(s => (
            <div key={s.label} style={{ background:"white", borderRadius:16, padding:"22px 20px", border:"1px solid #F3F4F6", boxShadow:"0 1px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <p style={{ fontSize:13, color:"#6B7280" }}>{s.label}</p>
                <div style={{ width:36, height:36, borderRadius:10, background:s.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{s.icon}</div>
              </div>
              <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:800, color:"#111827", marginBottom:4 }}>{s.value}</p>
              <p style={{ fontSize:11, color:"#6B7280" }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:0, marginBottom:20, borderBottom:"2px solid #E5E7EB", background:"white", borderRadius:"12px 12px 0 0", padding:"0 20px" }}>
          {["overview","users","sessions"].map(tab => (
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
          <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20, marginBottom:20 }}>
              {/* Line chart */}
              <div style={{ background:"white", borderRadius:16, padding:"24px", border:"1px solid #F3F4F6" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                  <div>
                    <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:"#111827" }}>Platform Growth</p>
                    <p style={{ fontSize:12, color:"#9CA3AF" }}>New users per month</p>
                  </div>
                  <span style={{ fontSize:12, color:"#6B7280", display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:"#6C63FF", display:"inline-block" }}/> Users
                  </span>
                </div>
                <LineChart data={chartData}/>
              </div>

              {/* Donut chart */}
              <div style={{ background:"white", borderRadius:16, padding:"24px", border:"1px solid #F3F4F6" }}>
                <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:"#111827", marginBottom:16 }}>Skills by Category</p>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
                  <DonutChart data={skillCategories}/>
                </div>
                {skillCategories.map((c,i) => (
                  <div key={c.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <span style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#374151" }}>
                      <span style={{ width:10, height:10, borderRadius:"50%", background:["#6C63FF","#3B82F6"][i], display:"inline-block" }}/>
                      {c.name}
                    </span>
                    <span style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{c.count} sessions</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary metrics */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {[
                { icon:"👥", label:"Total Registered Users", value:users.length,                                           iconBg:"#EEF2FF" },
                { icon:"✅", label:"Completed Sessions",      value:sessions.filter(s=>s.status==="completed").length,      iconBg:"#ECFDF5" },
                { icon:"🔄", label:"Barter Sessions",         value:sessions.filter(s=>s.is_barter).length,                iconBg:"#FFFBEB" },
              ].map(m => (
                <div key={m.label} style={{ background:"white", borderRadius:16, padding:"22px", border:"1px solid #F3F4F6", display:"flex", alignItems:"center", gap:16 }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:m.iconBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{m.icon}</div>
                  <div>
                    <p style={{ fontSize:12, color:"#9CA3AF", marginBottom:4 }}>{m.label}</p>
                    <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:26, fontWeight:800, color:"#111827" }}>{m.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* USERS */}
        {activeTab==="users" && (
          <div style={{ background:"white", borderRadius:16, border:"1px solid #F3F4F6", overflow:"hidden" }}>
            <div style={{ padding:"18px 24px", borderBottom:"1px solid #F3F4F6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:"#111827" }}>
                All Users ({filteredUsers.length})
              </p>
              <input
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding:"8px 14px", border:"1.5px solid #E5E7EB", borderRadius:8, fontSize:13, outline:"none", width:260 }}
                onFocus={e => e.target.style.borderColor="#6C63FF"}
                onBlur={e => e.target.style.borderColor="#E5E7EB"}
              />
            </div>
            {filteredUsers.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <p style={{ fontSize:32, marginBottom:8 }}>👥</p>
                <p style={{ fontSize:15, color:"#374151", fontWeight:600, marginBottom:4 }}>No users found</p>
                <p style={{ fontSize:13, color:"#9CA3AF" }}>Users will appear here once they register</p>
              </div>
            ) : (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"#F9FAFB" }}>
                    {["User","Email","University","Year","Sessions","Joined","Action"].map(h => (
                      <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.filter(u => u.role !== "admin").map((u,i) => (
                    <tr key={i} style={{ borderTop:"1px solid #F3F4F6" }}
                      onMouseEnter={e => e.currentTarget.style.background="#FAFAFA"}
                      onMouseLeave={e => e.currentTarget.style.background="white"}
                    >
                      <td style={{ padding:"14px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#6C63FF,#43D9AD)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:12, color:"white" }}>
                            {u.full_name?.[0]||"?"}
                          </div>
                          <span style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{u.full_name||"—"}</span>
                        </div>
                      </td>
                      <td style={{ padding:"14px 16px", fontSize:13, color:"#6B7280" }}>{u.email}</td>
                      <td style={{ padding:"14px 16px", fontSize:13, color:"#6B7280" }}>{u.university||"—"}</td>
                      <td style={{ padding:"14px 16px", fontSize:13, color:"#6B7280" }}>{u.year||"—"}</td>
                      <td style={{ padding:"14px 16px", fontSize:13, fontWeight:600, color:"#374151" }}>{u.session_count||0}</td>
                      <td style={{ padding:"14px 16px", fontSize:12, color:"#9CA3AF" }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td style={{ padding:"14px 16px" }}>
                        <button
                          onClick={() => setConfirm(u)}
                          style={{ padding:"5px 12px", background:"#FEF2F2", color:"#DC2626", border:"1px solid #FECACA", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SESSIONS */}
        {activeTab==="sessions" && (
          <div style={{ background:"white", borderRadius:16, border:"1px solid #F3F4F6", overflow:"hidden" }}>
            <div style={{ padding:"18px 24px", borderBottom:"1px solid #F3F4F6" }}>
              <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:"#111827" }}>
                All Sessions ({sessions.length})
              </p>
            </div>
            {sessions.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <p style={{ fontSize:32, marginBottom:8 }}>📅</p>
                <p style={{ fontSize:15, color:"#374151", fontWeight:600, marginBottom:4 }}>No sessions yet</p>
                <p style={{ fontSize:13, color:"#9CA3AF" }}>Sessions will appear here once users start booking</p>
              </div>
            ) : (
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"#F9FAFB" }}>
                    {["Student","Tutor","Skill","Date","Type","Status"].map(h => (
                      <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s,i) => (
                    <tr key={i} style={{ borderTop:"1px solid #F3F4F6" }}
                      onMouseEnter={e => e.currentTarget.style.background="#FAFAFA"}
                      onMouseLeave={e => e.currentTarget.style.background="white"}
                    >
                      <td style={{ padding:"14px 16px", fontSize:13, fontWeight:600, color:"#111827" }}>{s.student_name||"—"}</td>
                      <td style={{ padding:"14px 16px", fontSize:13, color:"#6B7280" }}>{s.tutor_name||"—"}</td>
                      <td style={{ padding:"14px 16px", fontSize:13, color:"#6B7280" }}>{s.skill_name||"—"}</td>
                      <td style={{ padding:"14px 16px", fontSize:12, color:"#9CA3AF" }}>
                        {s.scheduled_at ? new Date(s.scheduled_at).toLocaleDateString() : "—"}
                      </td>
                      <td style={{ padding:"14px 16px" }}>
                        <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:s.is_barter?"#ECFDF5":"#EEF2FF", color:s.is_barter?"#059669":"#4338CA" }}>
                          {s.is_barter?"🔄 Barter":"💳 Paid"}
                        </span>
                      </td>
                      <td style={{ padding:"14px 16px" }}>
                        <span style={{
                          padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600,
                          background:
                            s.status==="completed"?"#ECFDF5":
                            s.status==="upcoming"?"#EEF2FF":
                            s.status==="requested"?"#FFFBEB":
                            s.status==="rejected"?"#FEF2F2":"#F3F4F6",
                          color:
                            s.status==="completed"?"#059669":
                            s.status==="upcoming"?"#4338CA":
                            s.status==="requested"?"#D97706":
                            s.status==="rejected"?"#DC2626":"#6B7280"
                        }}>
                          {s.status==="requested"?"⏳ Pending":s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Footer */}
        <footer style={{ marginTop:40, background:"white", borderRadius:16, padding:"28px 32px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#6C63FF,#4F46E5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>⚡</div>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, color:"#111827" }}>SkillSync Admin</span>
            </div>
            <p style={{ fontSize:12, color:"#9CA3AF" }}>© 2026 SkillSync. Admin access only.</p>
          </div>
        </footer>
      </div>

      {/* Delete confirmation modal */}
      {confirm && (
        <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(17,24,39,0.6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"white", borderRadius:16, padding:32, maxWidth:400, width:"100%", margin:24 }}>
            <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700, color:"#111827", marginBottom:8 }}>Delete User?</h3>
            <p style={{ fontSize:14, color:"#6B7280", marginBottom:24 }}>
              Are you sure you want to delete <strong>{confirm.full_name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirm(null)} style={{ flex:1, padding:"11px", background:"white", color:"#374151", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(confirm.id)} style={{ flex:1, padding:"11px", background:"#DC2626", color:"white", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer" }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
