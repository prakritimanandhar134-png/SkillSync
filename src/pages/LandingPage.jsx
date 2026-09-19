import { useEffect, useMemo, useState } from "react";
import { getAllSkills } from "../api";

// ═══════════════════════════════════════
// LOGO
// ═══════════════════════════════════════

function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient
          id="landLogoGrad"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1E3A5F" />
          <stop offset="1" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>

      <rect
        width="40"
        height="40"
        rx="10"
        fill="url(#landLogoGrad)"
      />

      <rect
        x="7"
        y="15"
        width="26"
        height="15"
        rx="2"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />

      <path
        d="M4 30h32"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <polygon
        points="20,6 29,10.5 20,15 11,10.5"
        fill="#F59E0B"
      />

      <line
        x1="29"
        y1="10.5"
        x2="29"
        y2="16"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <circle
        cx="29"
        cy="16.5"
        r="1.2"
        fill="#F59E0B"
      />
    </svg>
  );
}


// ═══════════════════════════════════════
// HOW IT WORKS
// ═══════════════════════════════════════

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Create Your Profile",
    desc: "List the skills you can teach and the skills you want to learn.",
  },
  {
    num: "02",
    title: "Find Your Match",
    desc: "Find people with complementary skills and interests.",
  },
  {
    num: "03",
    title: "Start Exchanging",
    desc: "Request sessions, learn together, and exchange knowledge.",
  },
];


// ═══════════════════════════════════════
// CATEGORY ICONS
// ═══════════════════════════════════════

const CATEGORY_ICONS = {
  programming: "💻",
  designing: "🎨",
  design: "🎨",
  default: "📚",
};


// ═══════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════

export default function LandingPage({ navigate, onLogin }) {

  const [search, setSearch] = useState("");

  const [skills, setSkills] = useState([]);

  const [loadingSkills, setLoadingSkills] = useState(true);

  const [skillError, setSkillError] = useState("");


  // ═══════════════════════════════════════
  // GET LOGGED-IN USER
  // ═══════════════════════════════════════

  const storedUser = localStorage.getItem("user");

  let loggedInUser = null;

  try {
    loggedInUser = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    loggedInUser = null;
  }


  // ═══════════════════════════════════════
  // FETCH REAL SKILLS
  // ═══════════════════════════════════════

  useEffect(() => {

    const loadSkills = async () => {

      try {

        setLoadingSkills(true);
        setSkillError("");

        const data = await getAllSkills();

        /*
          Your API may return:

          [
            {...},
            {...}
          ]

          OR:

          {
            skills: [...]
          }

          OR:

          {
            data: [...]
          }

          This handles all three common formats.
        */

        const skillList =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.skills)
            ? data.skills
            : Array.isArray(data?.data)
            ? data.data
            : [];

        setSkills(skillList);

      } catch (error) {

        console.error("Failed to load skills:", error);

        setSkillError(
          "Unable to load skills right now."
        );

      } finally {

        setLoadingSkills(false);

      }
    };


    loadSkills();

  }, []);


  // ═══════════════════════════════════════
  // CALCULATE REAL SKILL INFORMATION
  // ═══════════════════════════════════════

  const skillCount = skills.length;


  const categories = useMemo(() => {

    if (!skills.length) {
      return [];
    }

    const categoryMap = {};

    skills.forEach((skill) => {

      const category =
        skill.category ||
        skill.skill_category ||
        "Other";

      const normalized =
        String(category).trim();

      if (!categoryMap[normalized]) {
        categoryMap[normalized] = 0;
      }

      categoryMap[normalized]++;

    });


    return Object.entries(categoryMap)
      .map(([name, count]) => ({
        name,
        count,
        icon:
          CATEGORY_ICONS[
            name.toLowerCase()
          ] || CATEGORY_ICONS.default,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

  }, [skills]);


  // ═══════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════

  const handleSearch = () => {

    const query = search.trim();

    if (query) {

      /*
        If your ExplorePage later supports
        search parameters, this is where
        you can pass the search value.

        For now we simply navigate there.
      */

      navigate("explore");

    } else {

      navigate("explore");

    }

  };


  // ═══════════════════════════════════════
  // USER INITIAL
  // ═══════════════════════════════════════

  const userInitial =
    loggedInUser?.full_name?.[0]?.toUpperCase() ||
    loggedInUser?.name?.[0]?.toUpperCase() ||
    "U";


  // ═══════════════════════════════════════
  // UI
  // ═══════════════════════════════════════

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "white",
        minHeight: "100vh",
      }}
    >

      {/* ═══════════════════════════════
          NAVBAR
      ═══════════════════════════════ */}

      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #EBEBF0",
          padding: "0 48px",
        }}
      >

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 66,
          }}
        >

          {/* LOGO */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >

            <Logo size={34} />

            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 20,
              }}
            >

              <span style={{ color: "#1E3A5F" }}>
                Skill
              </span>

              <span style={{ color: "#0EA5E9" }}>
                Sync
              </span>

            </span>

          </div>


          {/* NAVIGATION */}

          <div
            style={{
              display: "flex",
              gap: 36,
            }}
          >

            <button
              onClick={() => navigate("explore")}
              style={navButtonStyle}
            >
              Skills
            </button>

            <button
              onClick={() => navigate("explore")}
              style={navButtonStyle}
            >
              Find Mentors
            </button>

            <button
              onClick={() => navigate("dashboard")}
              style={navButtonStyle}
            >
              Dashboard
            </button>

          </div>


          {/* AUTH AREA */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >

            {loggedInUser ? (

              <>
                <div
                  onClick={() => navigate("dashboard")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >

                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg,#6C63FF,#43D9AD)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {userInitial}
                  </div>

                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#111827",
                    }}
                  >
                    {loggedInUser.full_name
                      ?.split(" ")[0] ||
                      loggedInUser.name ||
                      "User"}
                  </span>

                </div>


                <button
                  onClick={() => navigate("dashboard")}
                  style={primaryButtonStyle}
                >
                  Dashboard
                </button>
              </>

            ) : (

              <>

                <button
                  onClick={() => navigate("login")}
                  style={secondaryButtonStyle}
                >
                  Log in
                </button>

                <button
                  onClick={() => navigate("register")}
                  style={primaryButtonStyle}
                >
                  Get Started
                </button>

              </>

            )}

          </div>

        </div>

      </nav>


      {/* ═══════════════════════════════
          HERO
      ═══════════════════════════════ */}

      <section
        style={{
          background:
            "linear-gradient(160deg,#EEEEFF 0%,#EEF2FF 50%,#E8F4FD 100%)",
          padding: "96px 48px 72px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >

        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(108,99,255,0.09) 0%,transparent 70%)",
            top: -160,
            right: -80,
            pointerEvents: "none",
          }}
        />


        <div
          style={{
            maxWidth: 820,
            margin: "0 auto",
            position: "relative",
          }}
        >

          {/* BADGE */}

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 18px",
              background: "white",
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 500,
              color: "#4B5563",
              border: "1px solid #E5E7EB",
              marginBottom: 32,
              boxShadow:
                "0 2px 10px rgba(108,99,255,0.08)",
            }}
          >

            <span style={{ fontSize: 15 }}>
              ⚡
            </span>

            Learn. Teach. Exchange.

          </div>


          {/* HEADING */}

          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 70,
              fontWeight: 800,
              lineHeight: 1.06,
              color: "#111827",
              marginBottom: 24,
            }}
          >

            Exchange Skills,
            <br />

            <span style={{ color: "#6C63FF" }}>
              Grow Together
            </span>

          </h1>


          {/* DESCRIPTION */}

          <p
            style={{
              fontSize: 18,
              color: "#6B7280",
              lineHeight: 1.7,
              maxWidth: 580,
              margin: "0 auto 48px",
            }}
          >
            SkillSync connects people who want to
            teach what they know with people who
            want to learn. No money needed — just
            mutual expertise and genuine curiosity.
          </p>


          {/* SEARCH */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "white",
              borderRadius: 14,
              border: "1.5px solid #E5E7EB",
              boxShadow:
                "0 4px 24px rgba(108,99,255,0.10)",
              padding: "6px 6px 6px 20px",
              maxWidth: 600,
              margin: "0 auto 18px",
            }}
          >

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              style={{
                marginRight: 10,
                flexShrink: 0,
              }}
            >
              <circle
                cx="11"
                cy="11"
                r="8"
              />

              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
              />

            </svg>


            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="What skill do you want to learn?"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 15,
                color: "#374151",
                background: "transparent",
                fontFamily:
                  "'Inter',sans-serif",
              }}
            />


            <button
              onClick={handleSearch}
              style={{
                padding: "12px 28px",
                background: "#6C63FF",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Find Skills
            </button>

          </div>


          {/* SEARCH HINT */}

          <div
            style={{
              fontSize: 13,
              color: "#9CA3AF",
            }}
          >
            Browse programming, designing and
            other available skills.
          </div>

        </div>

      </section>


      {/* ═══════════════════════════════
          REAL SKILL STATS
      ═══════════════════════════════ */}

      <section
        style={{
          background:
            "linear-gradient(160deg,#EEEEFF 0%,#EEF2FF 100%)",
          padding: "0 48px 64px",
        }}
      >

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns:
              "repeat(2,1fr)",
            gap: 20,
          }}
        >

          {/* REAL SKILL COUNT */}

          <div style={statCardStyle}>

            <p style={statNumberStyle}>

              {loadingSkills
                ? "..."
                : skillCount}

            </p>

            <p style={statLabelStyle}>
              Available Skills
            </p>

          </div>


          {/* REAL CATEGORY COUNT */}

          <div style={statCardStyle}>

            <p style={statNumberStyle}>

              {loadingSkills
                ? "..."
                : categories.length}

            </p>

            <p style={statLabelStyle}>
              Skill Categories
            </p>

          </div>

        </div>

      </section>


      {/* ═══════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════ */}

      <section
        style={{
          background: "white",
          padding: "80px 48px",
        }}
      >

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >

          <div
            style={{
              textAlign: "center",
              marginBottom: 60,
            }}
          >

            <p style={sectionEyebrowStyle}>
              SIMPLE PROCESS
            </p>

            <h2 style={sectionTitleStyle}>
              How SkillSync Works
            </h2>

          </div>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3,1fr)",
              gap: 0,
              position: "relative",
            }}
          >

            <div
              style={{
                position: "absolute",
                top: 27,
                left: "17%",
                right: "17%",
                height: 2,
                background: "#E5E7EB",
                zIndex: 0,
              }}
            />


            {HOW_IT_WORKS.map(
              (step, index) => (

                <div
                  key={index}
                  style={{
                    padding: "0 24px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >

                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background:
                        "linear-gradient(135deg,#6C63FF,#8B5CF6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily:
                        "'Space Grotesk',sans-serif",
                      fontWeight: 800,
                      fontSize: 18,
                      color: "white",
                      marginBottom: 24,
                      boxShadow:
                        "0 4px 16px rgba(108,99,255,0.25)",
                    }}
                  >
                    {step.num}
                  </div>


                  <h3
                    style={{
                      fontFamily:
                        "'Space Grotesk',sans-serif",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#111827",
                      marginBottom: 10,
                    }}
                  >
                    {step.title}
                  </h3>


                  <p
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      lineHeight: 1.65,
                    }}
                  >
                    {step.desc}
                  </p>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* ═══════════════════════════════
          CATEGORIES
      ═══════════════════════════════ */}

      <section
        style={{
          background: "#F9FAFB",
          padding: "80px 48px",
        }}
      >

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 36,
            }}
          >

            <div>

              <p style={sectionEyebrowStyle}>
                EXPLORE
              </p>

              <h2 style={sectionTitleSmallStyle}>
                Browse by Category
              </h2>

            </div>


            <button
              onClick={() => navigate("explore")}
              style={{
                background: "none",
                border: "none",
                color: "#6C63FF",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              View all ›
            </button>

          </div>


          {skillError && (

            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#B91C1C",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 20,
                fontSize: 14,
              }}
            >
              {skillError}
            </div>

          )}


          {loadingSkills ? (

            <div
              style={{
                color: "#6B7280",
                fontSize: 14,
              }}
            >
              Loading available skills...
            </div>

          ) : categories.length === 0 ? (

            <div
              style={{
                background: "white",
                border: "1px solid #F3F4F6",
                borderRadius: 16,
                padding: 32,
                textAlign: "center",
                color: "#6B7280",
              }}
            >

              No skills are available yet.

              <br />

              <button
                onClick={() => navigate("explore")}
                style={{
                  marginTop: 16,
                  padding: "10px 20px",
                  background: "#6C63FF",
                  color: "white",
                  border: "none",
                  borderRadius: 99,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Explore Skills
              </button>

            </div>

          ) : (

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2,1fr)",
                gap: 20,
                maxWidth: 680,
              }}
            >

              {categories.map(
                (category) => (

                  <button
                    key={category.name}
                    onClick={() =>
                      navigate("explore")
                    }
                    style={{
                      background: "white",
                      border:
                        "1px solid #F3F4F6",
                      borderRadius: 16,
                      padding:
                        "28px 24px",
                      textAlign: "left",
                      cursor: "pointer",
                      boxShadow:
                        "0 2px 12px rgba(0,0,0,0.04)",
                      transition:
                        "all 0.2s",
                    }}
                    onMouseEnter={(e) => {

                      e.currentTarget.style.boxShadow =
                        "0 8px 28px rgba(108,99,255,0.14)";

                      e.currentTarget.style.transform =
                        "translateY(-3px)";

                    }}
                    onMouseLeave={(e) => {

                      e.currentTarget.style.boxShadow =
                        "0 2px 12px rgba(0,0,0,0.04)";

                      e.currentTarget.style.transform =
                        "translateY(0)";

                    }}
                  >

                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background:
                          "linear-gradient(135deg,#6C63FF,#8B5CF6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        fontSize: 26,
                        marginBottom: 16,
                      }}
                    >
                      {category.icon}
                    </div>


                    <p
                      style={{
                        fontFamily:
                          "'Space Grotesk',sans-serif",
                        fontWeight: 700,
                        fontSize: 17,
                        color: "#111827",
                        marginBottom: 4,
                      }}
                    >
                      {category.name}
                    </p>


                    <p
                      style={{
                        fontSize: 13,
                        color: "#9CA3AF",
                      }}
                    >
                      {category.count}{" "}
                      {category.count === 1
                        ? "skill"
                        : "skills"}
                    </p>

                  </button>

                )
              )}

            </div>

          )}

        </div>

      </section>


      {/* ═══════════════════════════════
          FIND PEOPLE SECTION
      ═══════════════════════════════ */}

      <section
        style={{
          background: "white",
          padding: "80px 48px",
        }}
      >

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 60,
              alignItems: "center",
            }}
          >

            <div>

              <p style={sectionEyebrowStyle}>
                SKILL EXCHANGE
              </p>

              <h2
                style={{
                  fontFamily:
                    "'Space Grotesk',sans-serif",
                  fontSize: 38,
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.15,
                  marginBottom: 18,
                }}
              >
                Learn from people.
                <br />
                Teach what you know.
              </h2>


              <p
                style={{
                  fontSize: 15,
                  color: "#6B7280",
                  lineHeight: 1.7,
                  maxWidth: 500,
                  marginBottom: 28,
                }}
              >
                SkillSync is built around peer-to-peer
                learning. Find people whose skills
                complement yours and exchange
                knowledge without paying for every
                session.
              </p>


              <button
                onClick={() =>
                  navigate("explore")
                }
                style={{
                  padding: "13px 26px",
                  background: "#6C63FF",
                  color: "white",
                  border: "none",
                  borderRadius: 99,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Find Skill Partners →
              </button>

            </div>


            {/* SIMPLE VISUAL */}

            <div
              style={{
                background:
                  "linear-gradient(135deg,#F5F3FF,#EFF6FF)",
                borderRadius: 24,
                padding: 40,
              }}
            >

              <div
                style={{
                  display: "grid",
                  gap: 16,
                }}
              >

                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: 22,
                    boxShadow:
                      "0 4px 20px rgba(0,0,0,0.05)",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >

                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        background:
                          "#EDE9FE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        fontSize: 22,
                      }}
                    >
                      💻
                    </div>

                    <div>

                      <p
                        style={{
                          fontWeight: 700,
                          color: "#111827",
                          marginBottom: 3,
                        }}
                      >
                        You teach
                      </p>

                      <p
                        style={{
                          fontSize: 13,
                          color: "#6B7280",
                        }}
                      >
                        A skill you already know
                      </p>

                    </div>

                  </div>

                </div>


                <div
                  style={{
                    textAlign: "center",
                    fontSize: 24,
                    color: "#6C63FF",
                  }}
                >
                  ↕
                </div>


                <div
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: 22,
                    boxShadow:
                      "0 4px 20px rgba(0,0,0,0.05)",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >

                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        background:
                          "#DBEAFE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        fontSize: 22,
                      }}
                    >
                      🎨
                    </div>

                    <div>

                      <p
                        style={{
                          fontWeight: 700,
                          color: "#111827",
                          marginBottom: 3,
                        }}
                      >
                        You learn
                      </p>

                      <p
                        style={{
                          fontSize: 13,
                          color: "#6B7280",
                        }}
                      >
                        A skill you want to develop
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ═══════════════════════════════
          MATCH CTA
      ═══════════════════════════════ */}

      <section
        style={{
          background: "#F9FAFB",
          padding: "60px 48px",
        }}
      >

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >

          <div
            style={{
              background:
                "linear-gradient(135deg,#6C63FF 0%,#4F46E5 55%,#3B82F6 100%)",
              borderRadius: 20,
              padding: "52px 56px",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              boxShadow:
                "0 16px 56px rgba(108,99,255,0.28)",
            }}
          >

            <div>

              <h2
                style={{
                  fontFamily:
                    "'Space Grotesk',sans-serif",
                  fontSize: 34,
                  fontWeight: 800,
                  color: "white",
                  marginBottom: 12,
                }}
              >
                Find Your Skill Partner
              </h2>


              <p
                style={{
                  fontSize: 15,
                  color:
                    "rgba(255,255,255,0.8)",
                  marginBottom: 0,
                  maxWidth: 500,
                  lineHeight: 1.65,
                }}
              >
                Explore available skills and
                discover people you can learn
                from or teach.
              </p>

            </div>


            <button
              onClick={() =>
                navigate("explore")
              }
              style={{
                padding: "14px 30px",
                background: "white",
                color: "#6C63FF",
                border: "none",
                borderRadius: 99,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Explore Skills →
            </button>

          </div>

        </div>

      </section>


      {/* ═══════════════════════════════
          FINAL CTA
      ═══════════════════════════════ */}

      <section
        style={{
          background: "white",
          padding: "88px 48px",
          textAlign: "center",
        }}
      >

        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
          }}
        >

          <h2
            style={{
              fontFamily:
                "'Space Grotesk',sans-serif",
              fontSize: 46,
              fontWeight: 800,
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Start Learning for Free
          </h2>


          <p
            style={{
              fontSize: 16,
              color: "#6B7280",
              marginBottom: 44,
              lineHeight: 1.6,
            }}
          >
            Join SkillSync and exchange knowledge
            with other learners and skill holders.
            No payment is required for skill exchange.
          </p>


          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >

            <button
              onClick={() =>
                navigate("register")
              }
              style={{
                padding: "15px 34px",
                background: "#6C63FF",
                color: "white",
                border: "none",
                borderRadius: 99,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Create Free Account →
            </button>


            <button
              onClick={() =>
                navigate("explore")
              }
              style={{
                padding: "15px 34px",
                background: "white",
                color: "#374151",
                border:
                  "1.5px solid #E5E7EB",
                borderRadius: 99,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Browse Skills
            </button>

          </div>

        </div>

      </section>


      {/* ═══════════════════════════════
          FOOTER
      ═══════════════════════════════ */}

      <footer
        style={{
          background: "#111827",
          padding: "56px 48px 36px",
        }}
      >

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "2fr 1fr 1fr 1fr",
              gap: 40,
              marginBottom: 48,
            }}
          >

            {/* BRAND */}

            <div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >

                <Logo size={32} />

                <span
                  style={{
                    fontFamily:
                      "'Space Grotesk',sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >

                  <span
                    style={{ color: "white" }}
                  >
                    Skill
                  </span>

                  <span
                    style={{ color: "#0EA5E9" }}
                  >
                    Sync
                  </span>

                </span>

              </div>


              <p
                style={{
                  fontSize: 13,
                  color: "#9CA3AF",
                  lineHeight: 1.65,
                  maxWidth: 260,
                }}
              >
                A peer-to-peer skill exchange
                platform for students and
                lifelong learners.
              </p>

            </div>


            {/* PLATFORM */}

            <FooterColumn
              title="Platform"
              links={[
                {
                  label: "Browse Skills",
                  action: () =>
                    navigate("explore"),
                },
                {
                  label: "Find Mentors",
                  action: () =>
                    navigate("explore"),
                },
                {
                  label: "Dashboard",
                  action: () =>
                    navigate("dashboard"),
                },
              ]}
            />


            {/* ACCOUNT */}

            <FooterColumn
              title="Account"
              links={[
                {
                  label: "Log in",
                  action: () =>
                    navigate("login"),
                },
                {
                  label: "Register",
                  action: () =>
                    navigate("register"),
                },
                {
                  label: "Profile",
                  action: () =>
                    navigate("dashboard"),
                },
              ]}
            />


            {/* SUPPORT */}

            <FooterColumn
              title="Support"
              links={[
                {
                  label: "Help Center",
                },
                {
                  label: "Privacy",
                },
                {
                  label: "Terms",
                },
              ]}
            />

          </div>


          {/* BOTTOM */}

          <div
            style={{
              borderTop:
                "1px solid #1F2937",
              paddingTop: 28,
              display: "flex",
              justifyContent:
                "space-between",
            }}
          >

            <p
              style={{
                fontSize: 13,
                color: "#6B7280",
              }}
            >
              © 2026 SkillSync. All rights reserved.
            </p>


            <p
              style={{
                fontSize: 13,
                color: "#6B7280",
              }}
            >
              Built for students, by students 🎓
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}


// ═══════════════════════════════════════
// FOOTER COMPONENT
// ═══════════════════════════════════════

function FooterColumn({
  title,
  links,
}) {

  return (
    <div>

      <p
        style={{
          fontWeight: 700,
          fontSize: 14,
          color: "white",
          marginBottom: 18,
        }}
      >
        {title}
      </p>


      {links.map((link) => (

        <p
          key={link.label}
          onClick={link.action}
          style={{
            fontSize: 13,
            color: "#9CA3AF",
            marginBottom: 12,
            cursor: link.action
              ? "pointer"
              : "default",
          }}
          onMouseEnter={(e) => {

            if (link.action) {
              e.target.style.color =
                "white";
            }

          }}
          onMouseLeave={(e) => {

            if (link.action) {
              e.target.style.color =
                "#9CA3AF";
            }

          }}
        >
          {link.label}
        </p>

      ))}

    </div>
  );
}


// ═══════════════════════════════════════
// STYLE OBJECTS
// ═══════════════════════════════════════

const navButtonStyle = {
  background: "none",
  border: "none",
  fontSize: 15,
  color: "#4B5563",
  cursor: "pointer",
  fontWeight: 500,
};


const primaryButtonStyle = {
  padding: "9px 22px",
  background: "#6C63FF",
  color: "white",
  border: "none",
  borderRadius: 99,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};


const secondaryButtonStyle = {
  padding: "9px 22px",
  background: "white",
  color: "#374151",
  border: "1.5px solid #E5E7EB",
  borderRadius: 99,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};


const statCardStyle = {
  background: "white",
  borderRadius: 16,
  padding: "28px 20px",
  border: "1px solid #F3F4F6",
  textAlign: "center",
  boxShadow:
    "0 2px 12px rgba(108,99,255,0.06)",
};


const statNumberStyle = {
  fontFamily:
    "'Space Grotesk',sans-serif",
  fontSize: 38,
  fontWeight: 800,
  color: "#111827",
  marginBottom: 4,
};


const statLabelStyle = {
  fontSize: 14,
  color: "#6B7280",
};


const sectionEyebrowStyle = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.1em",
  color: "#6C63FF",
  textTransform: "uppercase",
  marginBottom: 12,
};


const sectionTitleStyle = {
  fontFamily:
    "'Space Grotesk',sans-serif",
  fontSize: 40,
  fontWeight: 800,
  color: "#111827",
};


const sectionTitleSmallStyle = {
  fontFamily:
    "'Space Grotesk',sans-serif",
  fontSize: 36,
  fontWeight: 800,
  color: "#111827",
};