import { useState } from "react";
import { resetPassword } from "../api";

export default function ResetPasswordPage({ navigate, resetToken }) {
  const [form,    setForm]    = useState({ new_password:"", confirm_password:"" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async () => {
    if (!form.new_password || !form.confirm_password) {
      setError("Please fill all fields"); return;
    }
    if (form.new_password !== form.confirm_password) {
      setError("Passwords do not match"); return;
    }
    if (form.new_password.length < 6) {
      setError("Password must be at least 6 characters"); return;
    }
    setLoading(true); setError("");
    try {
      const data = await resetPassword(resetToken, form.new_password);
      if (data.message?.includes("successfully")) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F9FAFB", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif", padding:24 }}>
      <div style={{ width:"100%", maxWidth:440 }}>

        <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", marginBottom:32 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#1E3A5F,#0EA5E9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🎓</div>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22 }}>
            <span style={{ color:"#1E3A5F" }}>Skill</span><span style={{ color:"#0EA5E9" }}>Sync</span>
          </span>
        </div>

        <div style={{ background:"white", borderRadius:20, padding:36, boxShadow:"0 4px 24px rgba(0,0,0,0.06)", border:"1px solid #F3F4F6" }}>

          {!success ? (
            <>
              <div style={{ textAlign:"center", marginBottom:28 }}>
                <div style={{ width:64, height:64, borderRadius:"50%", background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>🔑</div>
                <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:800, color:"#111827", marginBottom:6 }}>Set New Password</h1>
                <p style={{ fontSize:14, color:"#6B7280" }}>Enter your new password below</p>
              </div>

              {error && (
                <div style={{ padding:"10px 14px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, marginBottom:16 }}>
                  <p style={{ fontSize:13, color:"#DC2626" }}>⚠️ {error}</p>
                </div>
              )}

              {[
                { label:"New Password",     field:"new_password",     placeholder:"Enter new password" },
                { label:"Confirm Password", field:"confirm_password", placeholder:"Confirm new password" },
              ].map(f => (
                <div key={f.field} style={{ marginBottom:16 }}>
                  <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>{f.label}</label>
                  <input
                    type="password"
                    value={form[f.field]}
                    onChange={e => { setForm(p=>({...p,[f.field]:e.target.value})); setError(""); }}
                    placeholder={f.placeholder}
                    style={{ width:"100%", padding:"12px 16px", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:14, outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box" }}
                    onFocus={e => e.target.style.borderColor="#6C63FF"}
                    onBlur={e => e.target.style.borderColor="#E5E7EB"}
                  />
                </div>
              ))}

              <button onClick={handleSubmit} disabled={loading} style={{
                width:"100%", padding:"13px",
                background:loading?"#A89BFF":"linear-gradient(135deg,#6C63FF,#4F46E5)",
                color:"white", border:"none", borderRadius:10,
                fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer"
              }}>
                {loading ? "Resetting..." : "Reset Password →"}
              </button>
            </>
          ) : (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:"#ECFDF5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 16px" }}>✅</div>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:800, color:"#111827", marginBottom:8 }}>Password Reset!</h2>
              <p style={{ fontSize:14, color:"#6B7280", marginBottom:24 }}>Your password has been changed successfully.</p>
              <button onClick={() => navigate("login")} style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#6C63FF,#4F46E5)", color:"white", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer" }}>
                Login with New Password →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}