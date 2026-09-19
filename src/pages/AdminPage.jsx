import { useEffect, useMemo, useState } from "react";
import {
  getAdminStats,
  getAdminUsers,
  getAdminSessions,
  deleteUser,
} from "../api";

const purple = "#6C63FF";

const styles = {

  chartWrapper: {
    width: "100%",
    overflow: "hidden",
  },

  emptyChart: {
    minHeight: 220,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    textAlign: "center",
  },

  categoryChart: {
    padding: "15px 5px",
  },

  categoryRow: {
    marginBottom: 24,
  },

  categoryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    color: "#334155",
  },

  progressBackground: {
    width: "100%",
    height: 12,
    background: "#eef2ff",
    borderRadius: 20,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: 20,
    transition: "width 0.5s ease",
  },

  sessionChart: {
    padding: "10px 5px",
  },

  sessionRow: {
    marginBottom: 20,
  },

  sessionTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 7,
    color: "#334155",
  },

};

function UserGrowthChart({ data = [] }) {
  if (!data.length) {
    return (
      <div style={styles.emptyChart}>
        <div style={{ fontSize: 36 }}>📈</div>
        <p>No user growth data yet</p>
        <span>New registrations will appear here.</span>
      </div>
    );
  }

  const max = Math.max(...data.map(item => Number(item.count)), 1);

  const width = 700;
  const height = 250;
  const padding = 35;

  const points = data.map((item, index) => {
    const x =
      padding +
      (index / Math.max(data.length - 1, 1)) *
        (width - padding * 2);

    const y =
      height -
      padding -
      (Number(item.count) / max) *
        (height - padding * 2);

    return `${x},${y}`;
  }).join(" ");

  return (
    <div style={styles.chartWrapper}>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: 260 }}
      >

        {/* horizontal grid */}
        {[0, 1, 2, 3, 4].map(i => {
          const y =
            padding +
            (i / 4) *
              (height - padding * 2);

          return (
            <line
              key={i}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* area */}
        <polygon
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          fill="rgba(99,102,241,0.12)"
        />

        {/* line */}
        <polyline
          points={points}
          fill="none"
          stroke="#6366f1"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* points */}
        {data.map((item, index) => {

          const x =
            padding +
            (index / Math.max(data.length - 1, 1)) *
              (width - padding * 2);

          const y =
            height -
            padding -
            (Number(item.count) / max) *
              (height - padding * 2);

          return (
            <g key={index}>

              <circle
                cx={x}
                cy={y}
                r="6"
                fill="#6366f1"
                stroke="white"
                strokeWidth="3"
              />

              <text
                x={x}
                y={height - 10}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {item.month?.slice(5) || ""}
              </text>

            </g>
          );
        })}

      </svg>

    </div>
  );
}

  function SkillsCategoryChart({ data = [] }) {

  const total = data.reduce(
    (sum, item) => sum + Number(item.count),
    0
  );

  if (!total) {
    return (
      <div style={styles.emptyChart}>
        <div style={{ fontSize: 36 }}>🎯</div>
        <p>No skills available</p>
        <span>Add skills to see category statistics.</span>
      </div>
    );
  }

  return (
    <div style={styles.categoryChart}>

      {data.map((item, index) => {

        const percentage =
          (Number(item.count) / total) * 100;

        return (
          <div
            key={item.category}
            style={styles.categoryRow}
          >

            <div style={styles.categoryHeader}>

              <span>
                {item.category === "Programming"
                  ? "💻"
                  : "🎨"}{" "}
                {item.category}
              </span>

              <strong>
                {item.count}
              </strong>

            </div>

            <div style={styles.progressBackground}>

              <div
                style={{
                  ...styles.progressBar,
                  width: `${percentage}%`,
                  background:
                    index === 0
                      ? "#6366f1"
                      : "#06b6d4"
                }}
              />

            </div>

            <small>
              {percentage.toFixed(0)}% of all skills
            </small>

          </div>
        );
      })}

    </div>
  );
}

function SessionsStatusChart({ data = [] }) {

  const total = data.reduce(
    (sum, item) => sum + Number(item.count),
    0
  );

  if (!total) {
    return (
      <div style={styles.emptyChart}>
        <div style={{ fontSize: 36 }}>📊</div>
        <p>No sessions yet</p>
        <span>Session activity will appear here.</span>
      </div>
    );
  }

  const colors = {
    pending: "#f59e0b",
    accepted: "#10b981",
    completed: "#6366f1",
    rejected: "#ef4444",
    cancelled: "#64748b"
  };

  return (
    <div style={styles.sessionChart}>

      {data.map(item => {

        const status =
          String(item.status || "unknown").toLowerCase();

        const percentage =
          (Number(item.count) / total) * 100;

        return (
          <div
            key={status}
            style={styles.sessionRow}
          >

            <div style={styles.sessionTop}>

              <span
                style={{
                  textTransform: "capitalize"
                }}
              >
                {status}
              </span>

              <strong>
                {item.count}
              </strong>

            </div>

            <div style={styles.progressBackground}>

              <div
                style={{
                  ...styles.progressBar,
                  width: `${percentage}%`,
                  background:
                    colors[status] || "#6366f1"
                }}
              />

            </div>

          </div>
        );
      })}

    </div>
  );
}


 

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 16,
        padding: 22,
        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#6B7280",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {title}
          </p>

          <h2
            style={{
              margin: "8px 0 4px",
              color: "#111827",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            {value}
          </h2>

          <p
            style={{
              margin: 0,
              color: "#9CA3AF",
              fontSize: 12,
            }}
          >
            {subtitle}
          </p>
        </div>

        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "#EEF2FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const value = String(status || "unknown").toLowerCase();

  let background = "#F3F4F6";
  let color = "#6B7280";

  if (value === "completed") {
    background = "#ECFDF5";
    color = "#059669";
  } else if (
    value === "pending" ||
    value === "requested"
  ) {
    background = "#FFFBEB";
    color = "#D97706";
  } else if (value === "upcoming") {
    background = "#EEF2FF";
    color = "#4F46E5";
  } else if (
    value === "rejected" ||
    value === "cancelled"
  ) {
    background = "#FEF2F2";
    color = "#DC2626";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: 999,
        background,
        color,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "capitalize",
      }}
    >
      {value === "requested" ? "Pending" : value}
    </span>
  );
}

function EmptyState({ icon, title, message }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
      }}
    >
      <div
        style={{
          fontSize: 38,
          marginBottom: 12,
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          margin: "0 0 6px",
          color: "#374151",
          fontSize: 16,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#9CA3AF",
          fontSize: 13,
        }}
      >
        {message}
      </p>
    </div>
  );
}

export default function AdminPage({ navigate }) {
  const [activeTab, setActiveTab] = useState("overview");

 const [stats, setStats] = useState({
  total_users: 0,
  total_skills: 0,
  total_sessions: 0,
  pending_sessions: 0,
  recentUsers: [],
  recentSkills: [],
  userGrowth: [],
  skillsByCategory: [],
  sessionsByStatus: [],
});
  const [users, setUsers] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [confirmUser, setConfirmUser] = useState(null);

  const fetchAll = async () => {
    try {
      setRefreshing(true);

      const [statsResult, usersResult, sessionsResult] =
        await Promise.all([
          getAdminStats(),
          getAdminUsers(),
          getAdminSessions(),
        ]);

      console.log("ADMIN STATS:", statsResult);
      console.log("ADMIN USERS:", usersResult);
      console.log("ADMIN SESSIONS:", sessionsResult);

    if (statsResult && !statsResult.message) {
  setStats({
    total_users: statsResult.total_users || 0,
    total_skills: statsResult.total_skills || 0,
    total_sessions: statsResult.total_sessions || 0,
    pending_sessions: statsResult.pending_sessions || 0,

    recentUsers: Array.isArray(statsResult.recentUsers)
      ? statsResult.recentUsers
      : [],

    recentSkills: Array.isArray(statsResult.recentSkills)
      ? statsResult.recentSkills
      : [],

    userGrowth: Array.isArray(statsResult.userGrowth)
      ? statsResult.userGrowth
      : [],

    skillsByCategory: Array.isArray(statsResult.skillsByCategory)
      ? statsResult.skillsByCategory
      : [],

    sessionsByStatus: Array.isArray(statsResult.sessionsByStatus)
      ? statsResult.sessionsByStatus
      : [],
  });
}
      if (Array.isArray(usersResult)) {
        setUsers(usersResult);
      } else {
        console.error(
          "Admin users response is not an array:",
          usersResult
        );
        setUsers([]);
      }

      if (Array.isArray(sessionsResult)) {
        setSessions(sessionsResult);
      } else {
        console.error(
          "Admin sessions response is not an array:",
          sessionsResult
        );
        setSessions([]);
      }
    } catch (error) {
      console.error("Admin dashboard error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users
      .filter((user) => user.role !== "admin")
      .filter((user) => {
        if (!query) return true;

        return (
          user.full_name
            ?.toLowerCase()
            .includes(query) ||
          user.email
            ?.toLowerCase()
            .includes(query) ||
          user.university
            ?.toLowerCase()
            .includes(query)
        );
      });
  }, [users, search]);

  const handleDelete = async () => {
    if (!confirmUser) return;

    try {
      await deleteUser(confirmUser.id);

      setUsers((previous) =>
        previous.filter(
          (user) => user.id !== confirmUser.id
        )
      );

      setStats((previous) => ({
        ...previous,
        total_users: Math.max(
          0,
          previous.total_users - 1
        ),
      }));

      setConfirmUser(null);
    } catch (error) {
      console.error("Delete user error:", error);
      alert("Could not delete this user.");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F7FB",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 45,
              height: 45,
              border: "4px solid #E5E7EB",
              borderTopColor: purple,
              borderRadius: "50%",
              margin: "0 auto 15px",
              animation:
                "adminSpin 0.8s linear infinite",
            }}
          />

          <p
            style={{
              margin: 0,
              color: "#6B7280",
              fontSize: 14,
            }}
          >
            Loading admin dashboard...
          </p>

          <style>
            {`
              @keyframes adminSpin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F7FB",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#111827",
      }}
    >
      <div
        style={{
          maxWidth: 1250,
          margin: "0 auto",
          padding: "30px 24px 50px",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            marginBottom: 30,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: 27,
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                Admin Dashboard
              </h1>

              <span
                style={{
                  background: "#EEF2FF",
                  color: purple,
                  padding: "5px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                ADMIN
              </span>
            </div>

            <p
              style={{
                margin: 0,
                color: "#6B7280",
                fontSize: 14,
              }}
            >
              Manage SkillSync users, skills and sessions.
            </p>
          </div>

          <button
            onClick={fetchAll}
            disabled={refreshing}
            style={{
              border: "1px solid #E5E7EB",
              background: "#FFFFFF",
              color: "#374151",
              padding: "10px 16px",
              borderRadius: 10,
              cursor: refreshing
                ? "not-allowed"
                : "pointer",
              fontWeight: 700,
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <StatCard
            title="Total Users"
            value={stats.total_users}
            subtitle="Registered users"
            icon="👥"
          />

          <StatCard
            title="Total Skills"
            value={stats.total_skills}
            subtitle="Skills available"
            icon="🎯"
          />

          <StatCard
            title="Total Sessions"
            value={stats.total_sessions}
            subtitle="All booked sessions"
            icon="📅"
          />

          <StatCard
            title="Pending Sessions"
            value={stats.pending_sessions}
            subtitle="Waiting for action"
            icon="⏳"
          />
        </div>

        {/* TABS */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 14,
            border: "1px solid #E5E7EB",
            padding: 5,
            display: "flex",
            gap: 5,
            marginBottom: 20,
          }}
        >
          {[
            ["overview", "Overview"],
            ["users", "Users"],
            ["sessions", "Sessions"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              style={{
                flex: 1,
                border: "none",
                borderRadius: 10,
                padding: "11px 16px",
                background:
                  activeTab === value
                    ? purple
                    : "transparent",
                color:
                  activeTab === value
                    ? "#FFFFFF"
                    : "#6B7280",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1.5fr) minmax(280px, 1fr)",
                gap: 20,
                marginBottom: 20,
              }}
            >
              {/* RECENT USERS */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "20px 22px",
                    borderBottom:
                      "1px solid #F3F4F6",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 17,
                      fontWeight: 800,
                    }}
                  >
                    Recent Users
                  </h3>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#9CA3AF",
                      fontSize: 12,
                    }}
                  >
                    Latest registered users
                  </p>
                </div>

                {stats.recentUsers.length === 0 ? (
                  <EmptyState
                    icon="👥"
                    title="No users found"
                    message="No registered users are available."
                  />
                ) : (
                  <div>
                    {stats.recentUsers.map((user) => (
                      <div
                        key={user.id}
                        style={{
                          padding: "15px 22px",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          borderBottom:
                            "1px solid #F3F4F6",
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg,#6C63FF,#8B5CF6)",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                          }}
                        >
                          {user.full_name
                            ?.charAt(0)
                            .toUpperCase() || "?"}
                        </div>

                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            {user.full_name}
                          </p>

                          <p
                            style={{
                              margin: "3px 0 0",
                              color: "#9CA3AF",
                              fontSize: 12,
                            }}
                          >
                            {user.email}
                          </p>
                        </div>

                        <span
                          style={{
                            color: "#9CA3AF",
                            fontSize: 11,
                          }}
                        >
                          {user.created_at
                            ? new Date(
                                user.created_at
                              ).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECENT SKILLS */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "20px 22px",
                    borderBottom:
                      "1px solid #F3F4F6",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 17,
                      fontWeight: 800,
                    }}
                  >
                    Recent Skills
                  </h3>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#9CA3AF",
                      fontSize: 12,
                    }}
                  >
                    Recently added skills
                  </p>
                </div>

                {stats.recentSkills.length === 0 ? (
                  <EmptyState
                    icon="🎯"
                    title="No skills found"
                    message="No skills have been added yet."
                  />
                ) : (
                  <div>
                    {stats.recentSkills.map(
                      (skill) => (
                        <div
                          key={skill.id}
                          style={{
                            padding:
                              "15px 22px",
                            borderBottom:
                              "1px solid #F3F4F6",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            {skill.name}
                          </p>

                          <p
                            style={{
                              margin:
                                "4px 0 0",
                              color:
                                "#9CA3AF",
                              fontSize: 12,
                            }}
                          >
                            Added by{" "}
                            {skill.full_name ||
                              "Unknown user"}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 20,
    marginTop: 20
  }}
>

  {/* USER GROWTH */}
  <div style={styles.card}>

    <div style={styles.cardHeader}>

      <div>
        <h2>User Growth</h2>
        <p>New user registrations over time</p>
      </div>

      <div
        style={{
          fontSize: 26,
          background: "#eef2ff",
          padding: "10px 12px",
          borderRadius: 12
        }}
      >
        📈
      </div>

    </div>

    <UserGrowthChart
      data={stats?.userGrowth || []}
    />

  </div>


  {/* SKILLS */}
  <div style={styles.card}>

    <div style={styles.cardHeader}>

      <div>
        <h2>Skills by Category</h2>
        <p>Skill distribution</p>
      </div>

      <div
        style={{
          fontSize: 26,
          background: "#ecfeff",
          padding: "10px 12px",
          borderRadius: 12
        }}
      >
        🎯
      </div>

    </div>

    <SkillsCategoryChart
      data={stats?.skillsByCategory || []}
    />

  </div>

</div>

<div
  style={{
    ...styles.card,
    marginTop: 20
  }}
>

  <div style={styles.cardHeader}>

    <div>
      <h2>Session Activity</h2>
      <p>Current session status distribution</p>
    </div>

    <div
      style={{
        fontSize: 26,
        background: "#f0fdf4",
        padding: "10px 12px",
        borderRadius: 12
      }}
    >
      📊
    </div>

  </div>

  <SessionsStatusChart
    data={stats?.sessionsByStatus || []}
  />

</div>

            {/* QUICK SUMMARY */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: 16,
              }}
            >
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: 16,
                  padding: 22,
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    color: "#6B7280",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  User Accounts
                </p>

                <h3
                  style={{
                    margin: 0,
                    fontSize: 25,
                    fontWeight: 800,
                  }}
                >
                  {users.length}
                </h3>
              </div>

              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: 16,
                  padding: 22,
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    color: "#6B7280",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Completed Sessions
                </p>

                <h3
                  style={{
                    margin: 0,
                    fontSize: 25,
                    fontWeight: 800,
                  }}
                >
                  {
                    sessions.filter(
                      (session) =>
                        session.status ===
                        "completed"
                    ).length
                  }
                </h3>
              </div>

              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: 16,
                  padding: 22,
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    color: "#6B7280",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Barter Sessions
                </p>

                <h3
                  style={{
                    margin: 0,
                    fontSize: 25,
                    fontWeight: 800,
                  }}
                >
                  {
                    sessions.filter(
                      (session) =>
                        Number(session.is_barter) ===
                        1
                    ).length
                  }
                </h3>
              </div>
            </div>
          </>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: 20,
                borderBottom:
                  "1px solid #F3F4F6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 15,
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 800,
                  }}
                >
                  Users
                </h3>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#9CA3AF",
                    fontSize: 12,
                  }}
                >
                  {filteredUsers.length} users found
                </p>
              </div>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search name, email or university..."
                style={{
                  width: 300,
                  maxWidth: "100%",
                  padding: "10px 13px",
                  border: "1px solid #D1D5DB",
                  borderRadius: 9,
                  outline: "none",
                  fontSize: 13,
                }}
              />
            </div>

            {filteredUsers.length === 0 ? (
              <EmptyState
                icon="🔎"
                title={
                  search
                    ? "No matching users"
                    : "No users found"
                }
                message={
                  search
                    ? "Try another name, email or university."
                    : "No registered users are available."
                }
              />
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                    minWidth: 850,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#F9FAFB",
                      }}
                    >
                      {[
                        "User",
                        "Email",
                        "University",
                        "Skill Score",
                        "Sessions",
                        "Joined",
                        "Action",
                      ].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            padding:
                              "13px 16px",
                            textAlign: "left",
                            fontSize: 11,
                            color: "#6B7280",
                            fontWeight: 800,
                            textTransform:
                              "uppercase",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map(
                      (user) => (
                        <tr
                          key={user.id}
                          style={{
                            borderTop:
                              "1px solid #F3F4F6",
                          }}
                        >
                          <td
                            style={{
                              padding:
                                "14px 16px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems:
                                  "center",
                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius:
                                    "50%",
                                  background:
                                    "linear-gradient(135deg,#6C63FF,#8B5CF6)",
                                  color:
                                    "#FFFFFF",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  fontWeight:
                                    800,
                                  fontSize: 12,
                                }}
                              >
                                {user.full_name
                                  ?.charAt(
                                    0
                                  )
                                  .toUpperCase() ||
                                  "?"}
                              </div>

                              <span
                                style={{
                                  fontWeight:
                                    700,
                                  fontSize: 13,
                                }}
                              >
                                {user.full_name ||
                                  "—"}
                              </span>
                            </div>
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                              color: "#6B7280",
                              fontSize: 13,
                            }}
                          >
                            {user.email ||
                              "—"}
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                              color: "#6B7280",
                              fontSize: 13,
                            }}
                          >
                            {user.university ||
                              "—"}
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                              color: "#374151",
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {user.skill_score ??
                              "—"}
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                              color: "#374151",
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {user.session_count ||
                              0}
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                              color: "#9CA3AF",
                              fontSize: 12,
                            }}
                          >
                            {user.created_at
                              ? new Date(
                                  user.created_at
                                ).toLocaleDateString()
                              : "—"}
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                            }}
                          >
                            <button
                              onClick={() =>
                                setConfirmUser(
                                  user
                                )
                              }
                              style={{
                                border:
                                  "1px solid #FECACA",
                                background:
                                  "#FEF2F2",
                                color:
                                  "#DC2626",
                                padding:
                                  "7px 11px",
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor:
                                  "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SESSIONS */}
        {activeTab === "sessions" && (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: 20,
                borderBottom:
                  "1px solid #F3F4F6",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 800,
                }}
              >
                Sessions
              </h3>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#9CA3AF",
                  fontSize: 12,
                }}
              >
                {sessions.length} sessions
              </p>
            </div>

            {sessions.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No sessions found"
                message="Sessions will appear when users book sessions."
              />
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                    minWidth: 800,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#F9FAFB",
                      }}
                    >
                      {[
                        "Student",
                        "Tutor",
                        "Skill",
                        "Date",
                        "Type",
                        "Status",
                      ].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            padding:
                              "13px 16px",
                            textAlign: "left",
                            fontSize: 11,
                            color: "#6B7280",
                            fontWeight: 800,
                            textTransform:
                              "uppercase",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {sessions.map(
                      (session) => (
                        <tr
                          key={session.id}
                          style={{
                            borderTop:
                              "1px solid #F3F4F6",
                          }}
                        >
                          <td
                            style={{
                              padding:
                                "14px 16px",
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {session.student_name ||
                              "—"}
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                              fontSize: 13,
                              color:
                                "#6B7280",
                            }}
                          >
                            {session.tutor_name ||
                              "—"}
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                              fontSize: 13,
                              color:
                                "#6B7280",
                            }}
                          >
                            {session.skill_name ||
                              "—"}
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                              fontSize: 12,
                              color:
                                "#9CA3AF",
                            }}
                          >
                            {session.scheduled_at
                              ? new Date(
                                  session.scheduled_at
                                ).toLocaleDateString()
                              : "—"}
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                            }}
                          >
                            <span
                              style={{
                                padding:
                                  "5px 9px",
                                borderRadius:
                                  999,
                                background:
                                  Number(
                                    session.is_barter
                                  ) === 1
                                    ? "#ECFDF5"
                                    : "#EEF2FF",
                                color:
                                  Number(
                                    session.is_barter
                                  ) === 1
                                    ? "#059669"
                                    : "#4F46E5",
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              {Number(
                                session.is_barter
                              ) === 1
                                ? "Barter"
                                : "Paid"}
                            </span>
                          </td>

                          <td
                            style={{
                              padding:
                                "14px 16px",
                            }}
                          >
                            <StatusBadge
                              status={
                                session.status
                              }
                            />
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        <div
          style={{
            textAlign: "center",
            marginTop: 35,
            color: "#9CA3AF",
            fontSize: 12,
          }}
        >
          SkillSync Admin Dashboard • 2026
        </div>
      </div>

      {/* DELETE MODAL */}
      {confirmUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(17,24,39,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              width: "100%",
              maxWidth: 420,
              borderRadius: 16,
              padding: 25,
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: 19,
                fontWeight: 800,
              }}
            >
              Delete User?
            </h2>

            <p
              style={{
                margin: "0 0 22px",
                color: "#6B7280",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              Are you sure you want to delete{" "}
              <strong>
                {confirmUser.full_name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <button
                onClick={() =>
                  setConfirmUser(null)
                }
                style={{
                  flex: 1,
                  padding: 11,
                  border:
                    "1px solid #D1D5DB",
                  background: "#FFFFFF",
                  borderRadius: 9,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: 11,
                  border: "none",
                  background: "#DC2626",
                  color: "#FFFFFF",
                  borderRadius: 9,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}