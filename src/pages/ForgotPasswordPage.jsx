import { useState } from "react";
import { forgotPassword, verifyOTP } from "../api";

function Logo({ size=32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="fpg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E3A5F"/><stop offset="1" stopColor="#0EA5E9"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#fpg)"/>
      <rect x="7" y="15" width="26" height="15" rx="2" fill="none" stroke="white" strokeWidth="2"/>
      <path d="M4 30h32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="20,6 29,10.5 20,15 11,10.5" fill="#F59E0B"/>
    </svg>
  );
}

export default function ForgotPasswordPage({ navigate }) {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const [otp, setOtp] = useState("");
  const [loadingOTP, setLoadingOTP] = useState(false);

  const handleSubmit = async () => {
  if (!email) {
    setError("Please enter your email");
    return;
  }

  setLoading(true);
  setError("");

  try {
    await forgotPassword(email);
    setSent(true);
  } catch (err) {
    setError("Server error. Make sure backend is running.");
  } finally {
    setLoading(false);
  }
};


  const handleVerifyOTP = async () => {
 console.log("Verify button clicked");

    if (!otp) {
    setError("Please enter the OTP.");
    return;
  }

  setLoadingOTP(true);
  setError("");

  try {
    const data = await verifyOTP(email, otp);

    if (data.reset_token) {
      navigate("reset-password", data.reset_token);
    } else {
      setError(data.message || "Invalid OTP");
    }
  } catch (err) {
    setError("Server error.");
  } finally {
    setLoadingOTP(false);
  }
};

  return (
    <div style={{ minHeight:"100vh", background:"#F9FAFB", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif", padding:24 }}>
      <div style={{ width:"100%", maxWidth:440 }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", marginBottom:32 }}>
          <Logo size={36}/>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22 }}>
            <span style={{ color:"#1E3A5F" }}>Skill</span><span style={{ color:"#0EA5E9" }}>Sync</span>
          </span>
        </div>

        <div style={{ background:"white", borderRadius:20, padding:36, boxShadow:"0 4px 24px rgba(0,0,0,0.06)", border:"1px solid #F3F4F6" }}>

          {!sent ? (
            <>
              <div style={{ textAlign:"center", marginBottom:28 }}>
                <div style={{ width:64, height:64, borderRadius:"50%", background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>🔐</div>
                <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:800, color:"#111827", marginBottom:6 }}>Forgot Password?</h1>
                <p style={{ fontSize:14, color:"#6B7280" }}>Enter your email and we'll send you a 6-digit OTP</p>
              </div>

              {error && (
                <div style={{ padding:"10px 14px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, marginBottom:16 }}>
                  <p style={{ fontSize:13, color:"#DC2626" }}>⚠️ {error}</p>
                </div>
              )}

              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 }}>Email address</label>
                <input
                  type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.com"
                  onKeyDown={e => e.key==="Enter" && handleSubmit()}
                  style={{ width:"100%", padding:"12px 16px", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:14, outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box" }}
                  onFocus={e => e.target.style.borderColor="#6C63FF"}
                  onBlur={e => e.target.style.borderColor="#E5E7EB"}
                />
              </div>

              <button onClick={handleSubmit} disabled={loading} style={{
                width:"100%", padding:"13px",
                background:loading?"#A89BFF":"linear-gradient(135deg,#6C63FF,#4F46E5)",
                color:"white", border:"none", borderRadius:10,
                fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer",
                marginBottom:16
              }}>
                {loading ? "Sending..." : "Send OTP→"}
              </button>

              <button onClick={() => navigate("login")} style={{ width:"100%", padding:"12px", background:"white", color:"#374151", border:"1.5px solid #E5E7EB", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                ← Back to Login
              </button>
            </>
          ) : (
           <>
  <div style={{ textAlign: "center", marginBottom: 24 }}>
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "#EEF2FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        margin: "0 auto 16px",
      }}
    >
      🔢
    </div>

    <h2
      style={{
        fontFamily: "'Space Grotesk',sans-serif",
        fontSize: 22,
        fontWeight: 800,
        color: "#111827",
        marginBottom: 8,
      }}
    >
      Enter OTP
    </h2>

    <p style={{ fontSize: 14, color: "#6B7280" }}>
      We have sent a 6-digit OTP to
      <br />
      <strong>{email}</strong>
    </p>
  </div>

  {error && (
    <div
      style={{
        padding: "10px 14px",
        background: "#FEF2F2",
        border: "1px solid #FECACA",
        borderRadius: 8,
        marginBottom: 16,
      }}
    >
      <p style={{ fontSize: 13, color: "#DC2626" }}>
        ⚠️ {error}
      </p>
    </div>
  )}

  <input
  type="text"
  inputMode="numeric"
  autoComplete="one-time-code"
  placeholder="Enter 6-digit OTP"
  value={otp}
 onChange={(e) => {
  const value = e.target.value.replace(/[^0-9]/g, "");
  if (value.length <= 6) {
    setOtp(value);
  }
  setError("");
}}
onKeyDown={(e) => {
  if (e.key === "Enter" && otp.length === 6) {
    handleVerifyOTP();
  }
}}
    style={{
      width: "100%",
      padding: "12px 16px",
      border: "1.5px solid #E5E7EB",
      borderRadius: 10,
      fontSize: 18,
      textAlign: "center",
      letterSpacing: "6px",
      marginBottom: 20,
      boxSizing: "border-box",
    }}
  />

  <button
    onClick={handleVerifyOTP}
    disabled={loadingOTP || otp.length !== 6}
    style={{
      width: "100%",
      padding: "13px",
      background: "linear-gradient(135deg,#6C63FF,#4F46E5)",
      color: "white",
      border: "none",
      borderRadius: 10,
      fontSize: 15,
      fontWeight: 700,
      cursor: loadingOTP || otp.length !== 6 ? "not-allowed" : "pointer",
    }}
  >
    {loadingOTP ? "Verifying..." : "Verify OTP"}
  </button>
</>
          )}
        </div>
      </div>
    </div>
  );
}