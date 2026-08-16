import { useState, useEffect } from "react";
import LandingPage        from "./pages/LandingPage";
import RegisterPage       from "./pages/RegisterPage";
import LoginPage          from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage  from "./pages/ResetPasswordPage";
import Dashboard          from "./pages/Dashboard";
import ExplorePage        from "./pages/ExplorePage";
import SkillsPage         from "./pages/SkillsPage";
import ProfilePage        from "./pages/ProfilePage";
import AdminPage          from "./pages/AdminPage";
import Navbar             from "./components/Navbar";
import ChatBox            from "./components/ChatBox";
import usestore from "./zustand/Zustand";


export default function App() {
  const [page,       setPage]       = useState("landing");
  const [userRole,   setUserRole]   = useState(null);
  const [chatOpen,   setChatOpen]   = useState(false);
  const [resetToken, setResetToken] = useState("");
  const {authstore,check} = usestore()

  useEffect(()=>{
    check()
  },[authstore])
  console.log("the auth is ",authstore)

  useEffect(() => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role");

  if (token && user) {
    const parsed = JSON.parse(user);

    setUserRole(role || parsed.role);

    if ((role || parsed.role) === "admin") {
      setPage("admin");
    } else {
      setPage("dashboard");
    }
  }
}, []);

 const navigate = (p, data) => {
  if (p === "reset-password" && data) {
    setResetToken(data);
  }

  // Only admins can open Admin page
  if (p === "admin" && userRole !== "admin") {
    setPage("dashboard");
    return;
  }

  setPage(p);
  window.scrollTo(0, 0);
};

  const handleRegister = (user) => {
    setUserRole(user.role);
    navigate("dashboard");
  };

  const handleLogin = (role) => {
    setUserRole(role);
    navigate(role==="admin" ? "admin" : "dashboard");
  };

  const handleLogout = () => {
localStorage.removeItem("token");
localStorage.removeItem("user");
localStorage.removeItem("role");
    setUserRole(null);
    navigate("landing");
  };

  const noNavPages = ["landing","register","login","forgot-password","reset-password"];
  const showNav = !noNavPages.includes(page);

  return (
    <div>
      {showNav && (
        <Navbar
          navigate={navigate}
          currentPage={page}
          userRole={userRole}
          onLogout={handleLogout}
        />
      )}

      {page==="landing"         && <LandingPage        navigate={navigate} onLogin={() => navigate("register")}/>}
      {page==="register"        && <RegisterPage       navigate={navigate} onRegister={handleRegister}/>}
      {page==="login"           && <LoginPage          navigate={navigate} onLogin={handleLogin}/>}
      {page==="forgot-password" && <ForgotPasswordPage navigate={navigate}/>}
      {page==="reset-password"  && <ResetPasswordPage  navigate={navigate} resetToken={resetToken}/>}
      {page==="dashboard"       && <Dashboard          navigate={navigate}/>}
      {page==="explore"         && <ExplorePage        navigate={navigate}/>}
      {page==="skills"          && <SkillsPage         navigate={navigate}/>}
      {page==="profile"         && <ProfilePage        navigate={navigate}/>}
     {page === "admin" && userRole === "admin" && (
      <AdminPage navigate={navigate} />
     )}
      {userRole && (
        <>
          {!chatOpen && (
            <button onClick={() => setChatOpen(true)} style={{
              position:"fixed", bottom:28, right:28, zIndex:998,
              width:56, height:56, borderRadius:"50%",
              background:"linear-gradient(135deg,#6C63FF,#4F46E5)",
              border:"none", cursor:"pointer",
              boxShadow:"0 8px 28px rgba(108,99,255,0.35)",
              display:"flex", alignItems:"center", justifyContent:"center"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span style={{ position:"absolute", top:10, right:10, width:10, height:10, borderRadius:"50%", background:"#EF4444", border:"2px solid white" }}/>
            </button>
          )}
          {chatOpen && <ChatBox onClose={() => setChatOpen(false)}/>}
        </>
      )}
    </div>
  );
}