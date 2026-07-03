import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ExplorePage from "./pages/ExplorePage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Navbar";
import ChatBox from "./components/ChatBox";

export default function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("dashboard");
  };

  return (
    <div className="app">
      {currentPage !== "landing" && (
        <Navbar navigate={navigate} currentPage={currentPage} isLoggedIn={isLoggedIn} />
      )}

      {currentPage === "landing"   && <LandingPage navigate={navigate} onLogin={handleLogin} />}
      {currentPage === "dashboard" && <Dashboard   navigate={navigate} />}
      {currentPage === "explore"   && <ExplorePage navigate={navigate} />}
      {currentPage === "profile"   && <ProfilePage navigate={navigate} />}

      {/* Floating Chat Button — shown on all pages except landing */}
      {currentPage !== "landing" && (
        <>
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              style={{
                position:"fixed", bottom:28, right:28, zIndex:998,
                width:56, height:56, borderRadius:"50%",
                background:"linear-gradient(135deg,#6C63FF,#4F46E5)",
                border:"none", cursor:"pointer",
                boxShadow:"0 8px 28px rgba(108,99,255,0.35)",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"transform 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform="scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {/* unread dot */}
              <span style={{
                position:"absolute", top:8, right:8,
                width:10, height:10, borderRadius:"50%",
                background:"#FF6584", border:"2px solid white"
              }}/>
            </button>
          )}
          {chatOpen && <ChatBox onClose={() => setChatOpen(false)} />}
        </>
      )}
    </div>
  );
}
