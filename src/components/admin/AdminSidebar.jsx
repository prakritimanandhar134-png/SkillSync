import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Star,
  LogOut,
  X,
} from "lucide-react";

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  onLogout,
  mobileOpen,
  setMobileOpen,
}) {
  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
    },
    {
      id: "sessions",
      label: "Sessions",
      icon: CalendarDays,
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: Star,
    },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 40,
          }}
        />
      )}

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: 250,
          background: "#ffffff",
          borderRight: "1px solid #E5E7EB",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          transform: mobileOpen
            ? "translateX(0)"
            : undefined,
        }}
        className="admin-sidebar"
      >
        {/* Header */}

        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid #F3F4F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background:
                  "linear-gradient(135deg,#6C63FF,#4F46E5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 800,
              }}
            >
              S
            </div>

            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                SkillSync
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                }}
              >
                Admin Panel
              </div>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="admin-close"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}

        <nav
          style={{
            padding: "20px 12px",
            flex: 1,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "0 10px",
              marginBottom: 10,
            }}
          >
            Management
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 12px",
                  marginBottom: 5,
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: active
                    ? "#EEF2FF"
                    : "transparent",
                  color: active
                    ? "#4F46E5"
                    : "#6B7280",
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  textAlign: "left",
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}

        <div
          style={{
            padding: 16,
            borderTop: "1px solid #F3F4F6",
          }}
        >
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 12px",
              border: "none",
              borderRadius: 10,
              background: "#FEF2F2",
              color: "#DC2626",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <style>{`
        .admin-sidebar {
          transform: translateX(0);
          transition: transform 0.25s ease;
        }

        .admin-close {
          display: none;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }

          .admin-sidebar[style*="translateX(0)"] {
            transform: translateX(0) !important;
          }

          .admin-close {
            display: block;
          }
        }
      `}</style>
    </>
  );
}