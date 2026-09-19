import { useState, useEffect } from "react";
import { getNotifications, markNotificationRead, } from "../api";

function Logo({ size=34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="navLG" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E3A5F"/><stop offset="1" stopColor="#0EA5E9"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#navLG)"/>
      <rect x="7" y="15" width="26" height="15" rx="2" fill="none" stroke="white" strokeWidth="2"/>
      <path d="M4 30h32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="20,6 29,10.5 20,15 11,10.5" fill="#F59E0B"/>
      <line x1="29" y1="10.5" x2="29" y2="16" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="29" cy="16.5" r="1.2" fill="#F59E0B"/>
    </svg>
  );
}

export default function Navbar({
  navigate,
  currentPage,
  onLogout,
  userRole,
}) {
 const [user, setUser] = useState(null);
const [notifications, setNotifications] = useState([]);
const [notificationsOpen, setNotificationsOpen] = useState(false);

const unreadCount = notifications.filter(
  (notification) => !notification.is_read
).length;
  // Refresh user every time page changes
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch (e) {}
    }
  }, [currentPage]);

  useEffect(() => {
  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  loadNotifications();

  const interval = setInterval(loadNotifications, 10000);

  return () => clearInterval(interval);
}, []);

  // Also listen for storage changes
  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try { setUser(JSON.parse(stored)); }
        catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorage);
    // Check every 2 seconds for profile updates
    const interval = setInterval(handleStorage, 2000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
  };

  const navLinks =
  userRole === "admin"
    ? [
        { id: "admin", label: "Admin Dashboard" },
      ]
    : [
        { id: "skills", label: "Skills" },
        { id: "explore", label: "Find Mentors" },
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
      <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:66 }}>

        {/* Logo */}
       <button
  onClick={() =>
    navigate(userRole === "admin" ? "/admin" : "/")
  }
  style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer" }}>
          <Logo size={34}/>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20 }}>
            <span style={{ color:"#1E3A5F" }}>Skill</span>
            <span style={{ color:"#0EA5E9" }}>Sync</span>
          </span>
        </button>

        {/* Nav links */}
        <div style={{ display:"flex", gap:4 }}>
          {navLinks.map((link,i) => (
            <button key={i} onClick={() => navigate(`/${link.id}`)} style={{
              padding:"8px 16px",
              background:currentPage===`/${link.id}`?"#EEF2FF":"transparent",
              border:"none", borderRadius:99,
              fontSize:14, fontWeight:currentPage===`/${link.id}`?600:500,
              color:currentPage===`/${link.id}`?"#6C63FF":"#4B5563",
              cursor:"pointer", transition:"all 0.15s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background="#EEF2FF"; e.currentTarget.style.color="#6C63FF"; }}
            onMouseLeave={e => { e.currentTarget.style.background=currentPage===`/${link.id}`?"#EEF2FF":"transparent"; e.currentTarget.style.color=currentPage===`/${link.id}`?"#6C63FF":"#4B5563"; }}
            >{link.label}</button>
          ))}
        </div>

        {/* Right */}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          {/* Notifications */}
<div style={{ position: "relative" }}>
  <button
    onClick={() =>
      setNotificationsOpen((prev) => !prev)
    }
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      position: "relative",
      padding: 4,
    }}
  >
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6B7280"
      strokeWidth="2"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>

    {/* Notification badge */}
   {unreadCount > 0 && (
  <span
    style={{
      position: "absolute",
      top: -3,
      right: -3,
      minWidth: 18,
      height: 18,
      padding: "0 4px",
      borderRadius: 999,
      background: "#EF4444",
      color: "white",
      fontSize: 10,
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "2px solid white",
    }}
  >
    {unreadCount > 9 ? "9+" : unreadCount}
  </span>
)}
  </button>

 {/* Notification dropdown */}
{notificationsOpen && (
  <div
    style={{
      position: "absolute",
      top: 48,
      right: 0,
      width: 330,
      background: "white",
      border: "1px solid #E5E7EB",
      borderRadius: 14,
      boxShadow: "0 12px 35px rgba(0,0,0,0.12)",
      overflow: "hidden",
      zIndex: 1000,
    }}
  >
    {/* Notification header */}
    <div
      style={{
        padding: "16px 18px",
        borderBottom: "1px solid #F1F5F9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <strong
        style={{
          fontSize: 15,
          color: "#111827",
        }}
      >
        Notifications
      </strong>

      <span
        style={{
          fontSize: 11,
          color: "#6C63FF",
          fontWeight: 600,
        }}
      >
        {notifications.length}
      </span>
    </div>

    
        {notifications.length === 0 ? (
  <div
    style={{
      padding: 25,
      textAlign: "center",
      color: "#6B7280",
      fontSize: 13,
    }}
  >
    No notifications yet.
  </div>
) : (
  <div>
    {notifications.map((notification) => (
      <div
        key={notification.id}
        onClick={async () => {
          try {
            await markNotificationRead(notification.id);

            setNotifications((prev) =>
              prev.map((item) =>
                item.id === notification.id
                  ? { ...item, is_read: 1 }
                  : item
              )
            );

          
          } catch (err) {
            console.error(
              "Failed to mark notification:",
              err
            );
          }
        }}
        style={{
          padding: "14px 18px",
          display: "flex",
          gap: 12,
          borderBottom: "1px solid #F3F4F6",
          background: notification.is_read
            ? "#FFFFFF"
            : "#F8FAFF",
          cursor: "pointer",
        }}
      >
        <div style={{ fontSize: 20 }}>
          {notification.type === "session_request"
            ? "📅"
            : notification.type === "session_accepted"
            ? "✅"
            : notification.type === "session_rejected"
            ? "❌"
            : "🔔"}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: notification.is_read ? 500 : 700,
              color: "#111827",
            }}
          >
            {notification.title}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#6B7280",
              marginTop: 4,
              lineHeight: 1.4,
            }}
          >
            {notification.message}
          </div>

          <div
            style={{
              fontSize: 10,
              color: "#9CA3AF",
              marginTop: 5,
            }}
          >
            {new Date(
              notification.created_at
            ).toLocaleString()}
          </div>
        </div>

        {!notification.is_read && (
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#6C63FF",
              marginTop: 5,
              flexShrink: 0,
            }}
          />
        )}
      </div>
    ))}
  </div>
)}
      </div>
    )}
  </div>


          {/* User avatar */}
          <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }} onClick={() =>
  navigate(userRole === "admin" ? "/admin" : "/profile")
}>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="avatar" style={{ width:34, height:34, borderRadius:"50%", objectFit:"cover", border:"2px solid #E5E7EB" }}/>
            ) : (
              <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#6C63FF,#43D9AD)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:13, fontFamily:"'Space Grotesk',sans-serif" }}>
                {getInitials(user?.full_name)}
              </div>
            )}
            <span style={{ fontSize:14, fontWeight:600, color:"#111827" }}>
              {user?.full_name?.split(" ")[0] || "User"}
            </span>
            <span style={{ color:"#9CA3AF", fontSize:11 }}>▾</span>
          </div>

          {/* Logout */}
          <button onClick={onLogout} style={{
            padding:"8px 18px", background:"white",
            color:"#EF4444", border:"1.5px solid #EF4444",
            borderRadius:99, fontSize:13, fontWeight:600, cursor:"pointer"
          }}
          onMouseEnter={e => e.currentTarget.style.background="#FEF2F2"}
          onMouseLeave={e => e.currentTarget.style.background="white"}
          >Logout</button>
        </div>
        </div>
      
    </nav>
  );
}