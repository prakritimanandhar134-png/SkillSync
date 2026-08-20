import { useState } from "react";
import { loginUser } from "../api";

function Logo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
    >
      <defs>
        <linearGradient
          id="lg2"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            stopColor="#ffffff"
            stopOpacity="0.3"
          />
          <stop
            offset="1"
            stopColor="#ffffff"
            stopOpacity="0.1"
          />
        </linearGradient>
      </defs>

      <rect
        width="40"
        height="40"
        rx="10"
        fill="url(#lg2)"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />

      <polygon
        points="20,8 28,12.5 20,17 12,12.5"
        fill="#F59E0B"
      />

      <rect
        x="9"
        y="17"
        width="22"
        height="13"
        rx="2"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />

      <path
        d="M6 30h28"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LoginPage({ navigate }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Clear previous error
    setError("");

    // Validate email
    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    // Validate password
    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      console.log("LOGIN REQUEST:", {
        email: form.email,
      });

      const result = await loginUser({
        email: form.email,
        password: form.password,
      });

      console.log("LOGIN RESPONSE:", result);

      /*
        loginUser() normally returns JSON directly.

        But if later you change api.js to Axios,
        result.data will also work.
      */
      const data = result?.data || result;

      console.log("LOGIN DATA:", data);

      // ==========================================
      // CHECK LOGIN SUCCESS
      // ==========================================

      if (!data?.token || !data?.user) {
        setError(
          data?.message || "Login failed. Please try again."
        );
        return;
      }

      // ==========================================
      // GET TOKEN AND USER
      // ==========================================

      const token = data.token;
      const user = data.user;

      console.log("TOKEN:", token);
      console.log("USER:", user);

      // ==========================================
      // SAVE TOKEN
      // ==========================================

      localStorage.setItem("token", token);

      // ==========================================
      // SAVE USER
      // ==========================================

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // ==========================================
      // SAVE ROLE
      // ==========================================

      if (user.role) {
        localStorage.setItem("role", user.role);
      }

      console.log("================================");
      console.log("LOGIN SUCCESSFUL");
      console.log("Token:", token);
      console.log("User:", user);
      console.log("Role:", user.role);
      console.log("================================");

      // ==========================================
      // NAVIGATE AFTER LOGIN
      // ==========================================

      if (user.role === "admin") {
        console.log("Redirecting to Admin...");
        navigate("/admin", { replace: true });
      } else {
        console.log("Redirecting to Dashboard...");
        navigate("/dashboard", { replace: true });
      }

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Login failed. Please try again.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Inter',sans-serif",
      }}
    >

      {/* ==========================================
          LEFT SIDE
      ========================================== */}

      <div
        style={{
          width: "45%",
          flexShrink: 0,
          background:
            "linear-gradient(145deg,#6C63FF 0%,#4F46E5 50%,#3B82F6 100%)",
          padding: "40px 48px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >

        {/* Background Circle */}

        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            top: -80,
            right: -80,
          }}
        />

        {/* Logo */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 64,
            position: "relative",
          }}
        >
          <Logo size={34} />

          <span
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "white",
            }}
          >
            Skill
            <span
              style={{
                color: "#A5F3FC",
              }}
            >
              Sync
            </span>
          </span>
        </div>

        {/* Left Content */}

        <div
          style={{
            flex: 1,
            position: "relative",
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 42,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            Welcome
            <br />
            back!
          </h2>

          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.6,
              marginBottom: 40,
            }}
          >
            Sign in to continue your skill exchange
            journey and connect with your learning
            partners.
          </p>

          {/* Admin Login */}

          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: "20px",
              border:
                "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                marginBottom: 4,
              }}
            >
              💡 Admin login
            </p>

            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.85)",
                fontWeight: 500,
              }}
            >
              Use{" "}
              <span
                style={{
                  color: "#A5F3FC",
                }}
              >
                admin@skillsync.com
              </span>{" "}
              to access the Admin Console
            </p>
          </div>
        </div>

        {/* Footer */}

        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
            marginTop: 40,
            position: "relative",
          }}
        >
          © 2026 SkillSync
        </p>
      </div>

      {/* ==========================================
          RIGHT SIDE
      ========================================== */}

      <div
        style={{
          flex: 1,
          background: "#F9FAFB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 48px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
          }}
        >

          {/* Heading */}

          <h1
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: "#111827",
              marginBottom: 6,
            }}
          >
            Sign in
          </h1>

          <p
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginBottom: 28,
            }}
          >
            Welcome back — let's keep learning.
          </p>

          {/* ==========================================
              ERROR
          ========================================== */}

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
              <p
                style={{
                  fontSize: 13,
                  color: "#DC2626",
                  margin: 0,
                }}
              >
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* ==========================================
              EMAIL
          ========================================== */}

          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Email address
            </label>

            <input
              type="email"
              value={form.email}
              autoComplete="email"
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  email: e.target.value,
                }));

                setError("");
              }}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "12px 16px",
                border:
                  "1.5px solid #E5E7EB",
                borderRadius: 10,
                fontSize: 14,
                color: "#111827",
                background: "white",
                outline: "none",
                fontFamily:
                  "'Inter',sans-serif",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor =
                  "#6C63FF";
              }}
              onBlur={(e) => {
                e.target.style.borderColor =
                  "#E5E7EB";
              }}
            />
          </div>

          {/* ==========================================
              PASSWORD
          ========================================== */}

          <div style={{ marginBottom: 24 }}>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <label
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Password
              </label>

              <button
                type="button"
                onClick={() =>
                  navigate("/forgot-password")
                }
                style={{
                  background: "none",
                  border: "none",
                  color: "#6C63FF",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Forgot password?
              </button>
            </div>

            <div
              style={{
                position: "relative",
              }}
            >
              <input
                type={
                  showPass
                    ? "text"
                    : "password"
                }
                value={form.password}
                autoComplete="current-password"
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }));

                  setError("");
                }}
                placeholder="Enter your password"
                style={{
                  width: "100%",
                  padding:
                    "12px 44px 12px 16px",
                  border:
                    "1.5px solid #E5E7EB",
                  borderRadius: 10,
                  fontSize: 14,
                  color: "#111827",
                  background: "white",
                  outline: "none",
                  fontFamily:
                    "'Inter',sans-serif",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor =
                    "#6C63FF";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    "#E5E7EB";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(e);
                  }
                }}
              />

              {/* Show Password */}

              <button
                type="button"
                onClick={() =>
                  setShowPass(
                    (prev) => !prev
                  )
                }
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9CA3AF",
                  fontSize: 16,
                }}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* ==========================================
              LOGIN BUTTON
          ========================================== */}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading
                ? "#A89BFF"
                : "linear-gradient(135deg,#6C63FF,#4F46E5)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border:
                      "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    display:
                      "inline-block",
                    animation:
                      "spin 0.8s linear infinite",
                  }}
                />

                Signing in...
              </>
            ) : (
              "Sign In →"
            )}
          </button>

          {/* ==========================================
              REGISTER
          ========================================== */}

          <p
            style={{
              textAlign: "center",
              fontSize: 14,
              color: "#6B7280",
            }}
          >
            Don't have an account?{" "}

            <button
              type="button"
              onClick={() =>
                navigate("/register")
              }
              style={{
                background: "none",
                border: "none",
                color: "#6C63FF",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Create free account
            </button>
          </p>

        </div>
      </div>

      {/* ==========================================
          SPINNER
      ========================================== */}

      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

    </div>
  );
}