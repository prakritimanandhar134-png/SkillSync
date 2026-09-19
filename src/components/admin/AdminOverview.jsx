import {
  Users,
  BookOpen,
  CalendarDays,
  Clock,
  TrendingUp,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

function LineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-gray-400">
        No growth data available
      </div>
    );
  }

  const width = 700;
  const height = 220;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(
    ...data.map((item) => Number(item.value) || 0),
    1
  );

  const points = data
    .map((item, index) => {
      const x =
        data.length === 1
          ? paddingLeft + chartWidth / 2
          : paddingLeft +
            (index / (data.length - 1)) * chartWidth;

      const value = Number(item.value) || 0;

      const y =
        paddingTop +
        chartHeight -
        (value / maxValue) * chartHeight;

      return {
        x,
        y,
        value,
        label: item.label,
      };
    });

  const polylinePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-56 w-full"
        preserveAspectRatio="none"
      >
        {/* Horizontal grid lines */}

        {[0, 1, 2, 3, 4].map((line) => {
          const y =
            paddingTop +
            (line / 4) * chartHeight;

          return (
            <line
              key={line}
              x1={paddingLeft}
              y1={y}
              x2={width - paddingRight}
              y2={y}
              stroke="#F3F4F6"
              strokeWidth="1"
            />
          );
        })}

        {/* Area under chart */}

        {points.length > 1 && (
          <polygon
            points={[
              `${points[0].x},${paddingTop + chartHeight}`,
              ...points.map(
                (point) =>
                  `${point.x},${point.y}`
              ),
              `${points[points.length - 1].x},${
                paddingTop + chartHeight
              }`,
            ].join(" ")}
            fill="#6C63FF"
            fillOpacity="0.08"
          />
        )}

        {/* Line */}

        {points.length > 1 && (
          <polyline
            fill="none"
            stroke="#6C63FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />
        )}

        {/* Points */}

        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#ffffff"
            stroke="#6C63FF"
            strokeWidth="2.5"
          />
        ))}

        {/* Labels */}

        {points.map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={height - 10}
            textAnchor="middle"
            fontSize="11"
            fill="#9CA3AF"
          >
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBackground,
  iconColor,
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>

        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            background: iconBackground,
            color: iconColor,
          }}
        >
          <Icon size={21} />
        </div>
      </div>

      <p className="text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}

export default function AdminOverview({
  stats,
  users,
  sessions,
  onRefresh,
}) {
  const totalUsers =
    Number(stats?.total_users) || users.length;

  const totalSkills =
    Number(stats?.total_skills) || 0;

  const totalSessions =
    Number(stats?.total_sessions) || sessions.length;

  const pendingSessions =
    Number(stats?.pending_sessions) ||
    sessions.filter(
      (session) =>
        session.status === "pending" ||
        session.status === "requested"
    ).length;

  const completedSessions = sessions.filter(
    (session) => session.status === "completed"
  ).length;

  const barterSessions = sessions.filter(
    (session) =>
      session.is_barter === true ||
      session.is_barter === 1
  ).length;

  const completionRate =
    totalSessions > 0
      ? Math.round(
          (completedSessions / totalSessions) * 100
        )
      : 0;

  /*
   * Build the last six months from registered users.
   */

  const now = new Date();

  const chartData = Array.from(
    { length: 6 },
    (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - 5 + index,
        1
      );

      const month = date.toLocaleString(
        "default",
        {
          month: "short",
        }
      );

      const count = users.filter((user) => {
        if (!user.created_at) return false;

        const created = new Date(
          user.created_at
        );

        return (
          created.getMonth() ===
            date.getMonth() &&
          created.getFullYear() ===
            date.getFullYear()
        );
      }).length;

      return {
        label: month,
        value: count,
      };
    }
  );

  /*
   * Recent users
   */

  const recentUsers = [...users]
    .sort((a, b) => {
      return (
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
      );
    })
    .slice(0, 5);

  /*
   * Session status summary
   */

  const statusData = [
    {
      label: "Completed",
      value: completedSessions,
      color: "bg-emerald-500",
    },
    {
      label: "Pending",
      value: pendingSessions,
      color: "bg-amber-500",
    },
    {
      label: "Upcoming",
      value: sessions.filter(
        (s) => s.status === "upcoming"
      ).length,
      color: "bg-indigo-500",
    },
    {
      label: "Cancelled",
      value: sessions.filter(
        (s) => s.status === "cancelled"
      ).length,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Page heading */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor your SkillSync platform performance.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Users"
          value={totalUsers}
          description="Registered users on SkillSync"
          icon={Users}
          iconBackground="#EEF2FF"
          iconColor="#4F46E5"
        />

        <StatCard
          title="Available Skills"
          value={totalSkills}
          description="Skills available on platform"
          icon={BookOpen}
          iconBackground="#ECFDF5"
          iconColor="#059669"
        />

        <StatCard
          title="Total Sessions"
          value={totalSessions}
          description="All booked learning sessions"
          icon={CalendarDays}
          iconBackground="#EFF6FF"
          iconColor="#2563EB"
        />

        <StatCard
          title="Pending Sessions"
          value={pendingSessions}
          description="Sessions waiting for action"
          icon={Clock}
          iconBackground="#FFFBEB"
          iconColor="#D97706"
        />

      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">

        {/* Growth chart */}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-bold text-gray-900">
                Platform Growth
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                New users registered during the last six months
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              New Users
            </div>
          </div>

          <LineChart data={chartData} />

        </div>

        {/* Session performance */}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="font-bold text-gray-900">
              Session Performance
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Current session status
            </p>
          </div>

          <div className="mb-6 flex items-center gap-5">

            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-indigo-50">

              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">
                    {completionRate}%
                  </p>

                  <p className="text-[10px] text-gray-400">
                    Completed
                  </p>
                </div>
              </div>

            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <TrendingUp
                  size={16}
                  className="text-emerald-500"
                />
                {completionRate}% completion
              </div>

              <p className="mt-1 text-xs text-gray-400">
                {completedSessions} of{" "}
                {totalSessions} sessions completed
              </p>
            </div>

          </div>

          <div className="space-y-4">

            {statusData.map((item) => (
              <div key={item.label}>

                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                    />

                    <span className="text-xs font-medium text-gray-600">
                      {item.label}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-gray-800">
                    {item.value}
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{
                      width:
                        totalSessions > 0
                          ? `${Math.min(
                              100,
                              (item.value /
                                totalSessions) *
                                100
                            )}%`
                          : "0%",
                    }}
                  />
                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

      {/* Bottom information */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Recent users */}

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">

            <div>
              <h2 className="font-bold text-gray-900">
                Recent Users
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Latest registered users
              </p>
            </div>

            <Users
              size={19}
              className="text-indigo-500"
            />

          </div>

          <div className="divide-y divide-gray-100">

            {recentUsers.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-400">
                No users available.
              </div>
            ) : (
              recentUsers.map((user) => {

                const initials =
                  user.full_name
                    ?.split(" ")
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "?";

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between px-6 py-4"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white">
                        {initials}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {user.full_name || "Unknown User"}
                        </p>

                        <p className="text-xs text-gray-400">
                          {user.email || "No email"}
                        </p>
                      </div>

                    </div>

                    <span className="hidden text-xs text-gray-400 sm:block">
                      {user.created_at
                        ? new Date(
                            user.created_at
                          ).toLocaleDateString()
                        : "—"}
                    </span>

                  </div>
                );
              })
            )}

          </div>

        </div>

        {/* Platform summary */}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="font-bold text-gray-900">
              Platform Summary
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Important platform metrics
            </p>
          </div>

          <div className="space-y-5">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <CheckCircle
                    size={19}
                    className="text-emerald-500"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Completed Sessions
                  </p>

                  <p className="text-xs text-gray-400">
                    Successfully finished
                  </p>
                </div>

              </div>

              <span className="text-lg font-bold text-gray-900">
                {completedSessions}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <Clock
                    size={19}
                    className="text-amber-500"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Pending Sessions
                  </p>

                  <p className="text-xs text-gray-400">
                    Waiting for approval
                  </p>
                </div>

              </div>

              <span className="text-lg font-bold text-gray-900">
                {pendingSessions}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                  <RefreshCw
                    size={19}
                    className="text-purple-500"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Barter Sessions
                  </p>

                  <p className="text-xs text-gray-400">
                    Skill exchange sessions
                  </p>
                </div>

              </div>

              <span className="text-lg font-bold text-gray-900">
                {barterSessions}
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}