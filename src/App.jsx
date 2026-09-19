import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  Outlet,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Dashboard from "./pages/Dashboard";
import ExplorePage from "./pages/ExplorePage";
import SkillsPage from "./pages/SkillsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";

import Navbar from "./components/Navbar";
import ChatBox from "./components/ChatBox";
import Toast from "./components/Toast";
import usestore from "./zustand/Zustand";



function ProtectedRoute({ adminOnly = false }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  let parsedUser;

  try {
    parsedUser = JSON.parse(user);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    return <Navigate to="/login" replace />;
  }

  const userRole = role || parsedUser.role;

  // Admin-only route
  if (adminOnly && userRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Normal-user routes should NOT be accessible by admin
  if (!adminOnly && userRole === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}



function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [chatOpen, setChatOpen] = useState(false);
  const [toast, setToast] = useState(null);

 const showToast = (message, type = "success") => {
  setToast({
    message,
    type,
  });

  setTimeout(() => {
    setToast(null);
  }, 3000);
};
  const { authstore, check } = usestore();


 useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    check();
  }
}, [check]);

  console.log("the auth is ", authstore);



  const noNavPages = [
    "/",
    "/register",
    "/login",
    "/forgot-password",
  ];

  const isResetPassword =
    location.pathname.startsWith("/reset-password");

  const showNav =
    !noNavPages.includes(location.pathname) &&
    !isResetPassword;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    setChatOpen(false);

    navigate("/");
  };



  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  let userRole = null;

  if (token && user) {
    try {
      const parsedUser = JSON.parse(user);
      userRole =
        localStorage.getItem("role") ||
        parsedUser.role;
    } catch (error) {
      userRole = null;
    }
  }


  return (
    <div>

      {/* Navbar */}

      {showNav && (
        <Navbar
          navigate={navigate}
          currentPage={location.pathname}
          userRole={userRole}
          onLogout={handleLogout}
        />
      )}
      <Routes>

        <Route
          path="/"
          element={
            <LandingPage
              navigate={navigate}
              onLogin={() => navigate("/login")}
            />
          }
        />

        <Route
          path="/register"
          element={
            <RegisterPage
              navigate={navigate}
            />
          }
        />

        <Route
          path="/login"
          element={
            <LoginPage
              navigate={navigate}
            />
          }
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage
              navigate={navigate}
            />
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <ResetPasswordPage
              navigate={navigate}
            />
          }
        />

       <Route element={<ProtectedRoute />}>

  <Route
    path="/dashboard"
    element={
      <Dashboard
        navigate={navigate}
        showToast={showToast}
      />
    }
  />

  <Route
    path="/explore"
    element={
      <ExplorePage
        navigate={navigate}
        showToast={showToast}
      />
    }
  />

  <Route
    path="/skills"
    element={
      <SkillsPage
        navigate={navigate}
        showToast={showToast}
      />
    }
  />

  <Route
    path="/profile"
    element={
      <ProfilePage
        navigate={navigate}
        showToast={showToast}
      />
    }
  />

</Route>
        <Route
          element={
            <ProtectedRoute adminOnly={true} />
          }
        >
          <Route
            path="/admin"
            element={
              <AdminPage
                navigate={navigate}
              />
            }
          />
        </Route>
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

      {userRole && userRole !== "admin" && (
        <>
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              style={{
                position: "fixed",
                bottom: 28,
                right: 28,
                zIndex: 998,
                width: 56,
                height: 56,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg,#6C63FF,#4F46E5)",
                border: "none",
                cursor: "pointer",
                boxShadow:
                  "0 8px 28px rgba(108,99,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >

              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>

              <span
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#EF4444",
                  border: "2px solid white",
                }}
              />

            </button>
          )}

          {chatOpen && (
            <ChatBox
              onClose={() => setChatOpen(false)}
            />
          )}
        </>
      )}

 {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}