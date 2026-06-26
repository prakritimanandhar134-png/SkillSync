import { useState } from "react";

function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.3"/>
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#rg)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
      <polygon points="20,8 28,12.5 20,17 12,12.5" fill="#F59E0B"/>
      <rect x="9" y="17" width="22" height="13" rx="2" fill="none" stroke="white" strokeWidth="2"/>
      <path d="M6 30h28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const FEATURES = [
  "Exchange skills with 42,000+ members",
  "AI-powered matching algorithm",
  "Verified mentor profiles",
  "Free forever — no credit card",
];

const STATS = [
  { value: "42k+", label: "Members" },
  { value: "8.5k+", label: "Skills" },
  { value: "96%", label: "Satisfaction" },
];

export default function RegisterPage({ navigate, onRegister }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.password.length < 6) e.password = "Password must be 6+ characters";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onRegister(form);
    }, 1200);
  };

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: "" }));
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        width: "45%", flexShrink: 0,
        background: "linear-gradient(145deg, #6C63FF 0%, #4F46E5 50%, #3B82F6 100%)",
        padding: "40px 48px",
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden"
      }}>
        {/* bg circles */}
        <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"rgba(255,255,255,0.06)", top:-80, right:-80 }}/>
        <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.04)", bottom:100, left:-60 }}/>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:64, position:"relative" }}>
          <Logo size={34}/>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:"white" }}>
            Skill<span style={{ color:"#A5F3FC" }}>Sync</span>
          </span>
        </div>

        {/* Headline */}
        <div style={{ flex:1, position:"relative" }}>
          <h2 style={{
            fontFamily:"'Space Grotesk',sans-serif",
            fontSize: 42, fontWeight: 800, color: "white",
            lineHeight: 1.15, marginBottom: 20
          }}>
            Your skills have<br/>more value than<br/>you think.
          </h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.8)", marginBottom:36, lineHeight:1.6 }}>
            Create your free profile in 2 minutes and start exchanging skills today.
          </p>

          {/* Feature list */}
          <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:48 }}>
            {FEATURES.map(f => (
              <div key={f} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{
                  width:22, height:22, borderRadius:"50%",
                  background:"rgba(255,255,255,0.2)",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span style={{ fontSize:14, color:"rgba(255,255,255,0.9)", fontWeight:500 }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display:"flex", gap:12 }}>
            {STATS.map(s => (
              <div key={s.label} style={{
                flex:1, background:"rgba(255,255,255,0.15)",
                borderRadius:14, padding:"16px 12px", textAlign:"center",
                border:"1px solid rgba(255,255,255,0.2)"
              }}>
                <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:800, color:"white", marginBottom:2 }}>{s.value}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:40, position:"relative" }}>
          © 2026 SkillSync
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex:1, background:"#F9FAFB",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"40px 48px"
      }}>
        <div style={{ width:"100%", maxWidth:440 }}>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:800, color:"#111827", marginBottom:6 }}>
            Create your account
          </h1>
          <p style={{ fontSize:14, color:"#6B7280", marginBottom:28 }}>Free forever. No credit card required.</p>

          {/* OAuth buttons */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
            {[
              { label:"GitHub", icon:"⌨" },
              { label:"Google", icon:"G" },
            ].map(b => (
              <button key={b.label} style={{
                padding:"11px", background:"white", border:"1.5px solid #E5E7EB",
                borderRadius:10, fontSize:14, fontWeight:600, color:"#374151",
                cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                transition:"all 0.15s"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#6C63FF"; e.currentTarget.style.background="#F5F3FF"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#E5E7EB"; e.currentTarget.style.background="white"; }}
              >
                <span style={{ fontSize:16 }}>{b.icon}</span> {b.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <div style={{ flex:1, height:1, background:"#E5E7EB" }}/>
            <span style={{ fontSize:13, color:"#9CA3AF" }}>or sign up with email</span>
            <div style={{ flex:1, height:1, background:"#E5E7EB" }}/>
          </div>

          {/* Form fields */}
          {[
            { label:"Full name", field:"name", type:"text", placeholder:"Alex Johnson" },
            { label:"Email address", field:"email", type:"email", placeholder:"you@example.com" },
          ].map(f => (
            <div key={f.field} style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:14, fontWeight:600, color:"#374151", marginBottom:6 }}>
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.field]}
                onChange={e => set(f.field, e.target.value)}
                placeholder={f.placeholder}
                style={{
                  width:"100%", padding:"12px 16px",
                  border:`1.5px solid ${errors[f.field] ? "#EF4444" : "#E5E7EB"}`,
                  borderRadius:10, fontSize:14, color:"#111827",
                  background:"white", outline:"none",
                  fontFamily:"'Inter',sans-serif", boxSizing:"border-box",
                  transition:"border-color 0.15s"
                }}
                onFocus={e => e.target.style.borderColor="#6C63FF"}
                onBlur={e => e.target.style.borderColor=errors[f.field]?"#EF4444":"#E5E7EB"}
              />
              {errors[f.field] && <p style={{ fontSize:12, color:"#EF4444", marginTop:4 }}>{errors[f.field]}</p>}
            </div>
          ))}

          {/* Password */}
          <div style={{ marginBottom:24 }}>
            <label style={{ display:"block", fontSize:14, fontWeight:600, color:"#374151", marginBottom:6 }}>
              Password
            </label>
            <div style={{ position:"relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={e => set("password", e.target.value)}
                placeholder="Create a strong password"
                style={{
                  width:"100%", padding:"12px 44px 12px 16px",
                  border:`1.5px solid ${errors.password ? "#EF4444" : "#E5E7EB"}`,
                  borderRadius:10, fontSize:14, color:"#111827",
                  background:"white", outline:"none",
                  fontFamily:"'Inter',sans-serif", boxSizing:"border-box"
                }}
                onFocus={e => e.target.style.borderColor="#6C63FF"}
                onBlur={e => e.target.style.borderColor=errors.password?"#EF4444":"#E5E7EB"}
              />
              <button onClick={() => setShowPass(!showPass)} style={{
                position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", fontSize:16
              }}>{showPass ? "🙈" : "👁"}</button>
            </div>
            {errors.password && <p style={{ fontSize:12, color:"#EF4444", marginTop:4 }}>{errors.password}</p>}
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width:"100%", padding:"14px",
            background: loading ? "#A89BFF" : "linear-gradient(135deg,#6C63FF,#4F46E5)",
            color:"white", border:"none", borderRadius:10,
            fontSize:15, fontWeight:700, cursor: loading ? "not-allowed" : "pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            transition:"opacity 0.2s", marginBottom:16
          }}>
            {loading ? (
              <>
                <span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"white", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite" }}/>
                Creating account...
              </>
            ) : (
              <>Create Free Account →</>
            )}
          </button>

          <p style={{ fontSize:12, color:"#9CA3AF", textAlign:"center", marginBottom:20, lineHeight:1.5 }}>
            By signing up, you agree to our{" "}
            <span style={{ color:"#6C63FF", cursor:"pointer" }}>Terms of Service</span>{" "}
            and{" "}
            <span style={{ color:"#6C63FF", cursor:"pointer" }}>Privacy Policy</span>.
          </p>

          <p style={{ textAlign:"center", fontSize:14, color:"#6B7280" }}>
            Already have an account?{" "}
            <button onClick={() => navigate("login")} style={{
              background:"none", border:"none", color:"#6C63FF", fontWeight:700,
              cursor:"pointer", fontSize:14
            }}>Sign in</button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
