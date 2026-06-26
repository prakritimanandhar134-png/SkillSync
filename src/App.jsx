import { useState } from "react";
import LandingPage  from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage    from "./pages/LoginPage";
import Dashboard    from "./pages/Dashboard";
import ExplorePage  from "./pages/ExplorePage";
import ProfilePage  from "./pages/ProfilePage";
import AdminPage    from "./pages/AdminPage";
import Navbar       from "./components/Navbar";
import ChatBox      from "./components/ChatBox";

export default function App() {
  const [page,     setPage]     = useState("landing");
  const [userRole, setUserRole] = useState(null); // null | "user" | "admin"
  const [chatOpen, setChatOpen] = useState(false);

  const navigate = (p) => { setPage(p); window.scrollTo(0,0); };

  const handleRegister = (formData) => {
    setUserRole("user");
    navigate("dashboard");
  };

  const handleLogin = (role) => {
    setUserRole(role);
    navigate(role === "admin" ? "admin" : "dashboard");
  };

  const handleLogout = () => {
    setUserRole(null);
    navigate("landing");
  };

  const showNav = !["landing","register","login"].includes(page);

  return (
    <div>
      {showNav && (
        <Navbar navigate={navigate} currentPage={page} userRole={userRole} onLogout={handleLogout}/>
      )}

      {page === "landing"   && <LandingPage  navigate={navigate} onLogin={() => navigate("register")}/>}
      {page === "register"  && <RegisterPage navigate={navigate} onRegister={handleRegister}/>}
      {page === "login"     && <LoginPage    navigate={navigate} onLogin={handleLogin}/>}
      {page === "dashboard" && <Dashboard    navigate={navigate}/>}
      {page === "explore"   && <ExplorePage  navigate={navigate}/>}
      {page === "profile"   && <ProfilePage  navigate={navigate}/>}
      {page === "admin"     && <AdminPage    navigate={navigate}/>}

      {/* Floating chat — only when logged in */}
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
