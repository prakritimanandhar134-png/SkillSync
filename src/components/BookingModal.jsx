import { useState } from "react";
import { requestSession } from "../api";

export default function BookingModal({ tutor, onClose }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    date: "",
    durationValue: "",
    durationType: "weeks",
    topic: "",
  });

  const set = (field, val) => {
    setForm((f) => ({
      ...f,
      [field]: val,
    }));
  };

  // =========================================================
  // TUTOR'S FIXED SCHEDULE
  // =========================================================
  // In the future, this can come from the tutor profile/API.
  const tutorSchedule = tutor?.schedule || {
    startTime: "9:00 AM",
    endTime: "11:00 AM",
    hoursPerDay: 2,
    availableDays: ["Monday", "Wednesday", "Friday"],
  };

  // =========================================================
  // CHECK WHETHER SELECTED DATE IS AVAILABLE
  // =========================================================
  const isAvailableDay = (dateString) => {
    if (!dateString) return false;

    const date = new Date(`${dateString}T00:00:00`);

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const selectedDay = dayNames[date.getDay()];

    return tutorSchedule.availableDays.includes(selectedDay);
  };

  // =========================================================
  // REQUEST EXPIRY DATE
  // =========================================================
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 2);

  // =========================================================
  // STEP 1 VALIDATION
  // =========================================================
  const isStep1Valid =
    Boolean(form.date) &&
    Boolean(form.durationValue) &&
    Number(form.durationValue) > 0 &&
    isAvailableDay(form.date);

  // =========================================================
  // SUBMIT BOOKING REQUEST
  // =========================================================
  const handleSubmit = async () => {
    if (!tutor) return;

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        tutor_id: tutor.id,

        skill_id:
          tutor.skill_id ||
          tutor.teaches?.[0]?.id ||
          1,

        // Current tutor schedule starts at 9:00 AM.
        // We will make this dynamic later if needed.
        scheduled_at: `${form.date}T09:00:00`,

        topic:
          form.topic ||
          "No additional details provided",

        is_barter: Boolean(tutor.barter_ready),

        duration_weeks:
          form.durationType === "weeks"
            ? Number(form.durationValue)
            : null,

        duration_months:
          form.durationType === "months"
            ? Number(form.durationValue)
            : null,

        hours_per_day: tutorSchedule.hoursPerDay,
      };

      console.log("========== BOOKING REQUEST ==========");
      console.log("Tutor:", tutor);
      console.log("Payload:", payload);

      const res = await requestSession(payload);

      console.log("Booking response:", res);

      if (res?.message) {
        setStep(3);
      } else {
        setError(
          "Booking request failed. Please try again."
        );
      }
    } catch (err) {
      console.error(
        "Booking request error:",
        err
      );

      setError(
        err.message ||
          "Could not send booking request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // NO TUTOR
  // =========================================================
  if (!tutor) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(17,24,39,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          width: "100%",
          maxWidth: 500,
          boxShadow:
            "0 24px 80px rgba(108,99,255,0.2)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* =================================================
            HEADER
        ================================================== */}

        <div
          style={{
            background:
              "linear-gradient(135deg,#6C63FF,#4F46E5)",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily:
                  "'Space Grotesk',sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "white",
                marginBottom: 2,
              }}
            >
              {tutor.barter
                ? "🔄 Request Skill Exchange"
                : "📅 Request Session"}
            </h2>

            <p
              style={{
                fontSize: 12,
                color:
                  "rgba(255,255,255,0.75)",
              }}
            >
              with {tutor.name} · via Google Meet
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background:
                "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              cursor: "pointer",
              color: "white",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {/* =================================================
            PROGRESS
        ================================================== */}

        <div
          style={{
            display: "flex",
          }}
        >
          {[
            "Schedule",
            "Details",
            "Confirm",
          ].map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                padding: "10px",
                textAlign: "center",
                background:
                  step === i + 1
                    ? "#F5F3FF"
                    : step > i + 1
                    ? "#ECFDF5"
                    : "#F9FAFB",

                borderBottom: `2px solid ${
                  step === i + 1
                    ? "#6C63FF"
                    : step > i + 1
                    ? "#10B981"
                    : "#E5E7EB"
                }`,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color:
                    step === i + 1
                      ? "#6C63FF"
                      : step > i + 1
                      ? "#059669"
                      : "#9CA3AF",
                }}
              >
                {step > i + 1 ? "✓ " : ""}
                {s}
              </p>
            </div>
          ))}
        </div>

        {/* =================================================
            CONTENT
        ================================================== */}

        <div
          style={{
            padding: 24,
          }}
        >

          {/* =================================================
              STEP 1 — SCHEDULE
          ================================================== */}

          {step === 1 && (
            <div>

              {/* Tutor Fixed Schedule */}

              <div
                style={{
                  background: "#F5F3FF",
                  borderRadius: 14,
                  padding: 16,
                  border:
                    "1px solid #E9D5FF",
                  marginBottom: 20,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6C63FF",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.05em",
                    marginBottom: 12,
                  }}
                >
                  📋 {tutor.name}'s Class Schedule
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >

                  {/* Class Time */}

                  <div
                    style={{
                      background: "white",
                      borderRadius: 10,
                      padding:
                        "12px 14px",
                      border:
                        "1px solid #E9D5FF",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        marginBottom: 4,
                      }}
                    >
                      🕐 Class Time
                    </p>

                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {tutorSchedule.startTime}
                      {" – "}
                      {tutorSchedule.endTime}
                    </p>
                  </div>

                  {/* Hours Per Day */}

                  <div
                    style={{
                      background: "white",
                      borderRadius: 10,
                      padding:
                        "12px 14px",
                      border:
                        "1px solid #E9D5FF",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        marginBottom: 4,
                      }}
                    >
                      ⏱ Hours Per Day
                    </p>

                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {tutorSchedule.hoursPerDay}
                      {" hours/day"}
                    </p>
                  </div>
                </div>

                {/* Available Days */}

                <div
                  style={{
                    background: "white",
                    borderRadius: 10,
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #E9D5FF",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: "#9CA3AF",
                      marginBottom: 8,
                    }}
                  >
                    📅 Available Days
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    {tutorSchedule.availableDays.map(
                      (day) => (
                        <span
                          key={day}
                          style={{
                            padding:
                              "3px 10px",
                            background:
                              "#EEF2FF",
                            color:
                              "#4338CA",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {day}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 11,
                    color: "#7C3AED",
                    marginTop: 10,
                    fontStyle: "italic",
                  }}
                >
                  * Class timings are fixed by the
                  tutor and cannot be changed
                </p>
              </div>

              {/* =================================================
                  DATE
              ================================================== */}

              <div
                style={{
                  marginBottom: 16,
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  📅 When do you want to start?
                </label>

                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => {
                    const selectedDate =
                      e.target.value;

                    if (
                      selectedDate &&
                      !isAvailableDay(
                        selectedDate
                      )
                    ) {
                      setError(
                        `Tutor is not available on this day. Available days: ${tutorSchedule.availableDays.join(
                          ", "
                        )}`
                      );

                      set("date", "");

                      return;
                    }

                    setError("");

                    set(
                      "date",
                      selectedDate
                    );
                  }}
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  style={{
                    width: "100%",
                    padding:
                      "10px 14px",
                    border:
                      "1.5px solid #E5E7EB",
                    borderRadius: 10,
                    fontSize: 14,
                    outline: "none",
                    boxSizing:
                      "border-box",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor =
                      "#6C63FF")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor =
                      "#E5E7EB")
                  }
                />

                {/* STEP 1 DATE ERROR */}

                {step === 1 && error && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "#DC2626",
                      marginTop: 6,
                    }}
                  >
                    ⚠️ {error}
                  </p>
                )}
              </div>

              {/* =================================================
                  DURATION
              ================================================== */}

              <div
                style={{
                  marginBottom: 16,
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  📆 How long do you want to learn?
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <input
                    type="number"
                    min="1"
                    value={
                      form.durationValue
                    }
                    onChange={(e) =>
                      set(
                        "durationValue",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 2"
                    style={{
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid #E5E7EB",
                      borderRadius: 10,
                      fontSize: 14,
                      outline: "none",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor =
                        "#6C63FF")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor =
                        "#E5E7EB")
                    }
                  />

                  <select
                    value={
                      form.durationType
                    }
                    onChange={(e) =>
                      set(
                        "durationType",
                        e.target.value
                      )
                    }
                    style={{
                      padding:
                        "10px 12px",
                      border:
                        "1.5px solid #E5E7EB",
                      borderRadius: 10,
                      fontSize: 14,
                      outline: "none",
                      background:
                        "white",
                    }}
                  >
                    <option value="weeks">
                      Weeks
                    </option>

                    <option value="months">
                      Months
                    </option>
                  </select>
                </div>
              </div>

              {/* =================================================
                  AUTO REJECT NOTICE
              ================================================== */}

              <div
                style={{
                  padding:
                    "10px 14px",
                  background:
                    "#FFFBEB",
                  borderRadius: 10,
                  border:
                    "1px solid #FDE68A",
                  marginBottom: 18,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "#92400E",
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                >
                  ⏰ Auto-rejection policy
                </p>

                <p
                  style={{
                    fontSize: 11,
                    color: "#B45309",
                  }}
                >
                  If the tutor does not respond
                  within{" "}
                  <strong>2 days</strong>,
                  your request is automatically
                  cancelled and you will be notified
                  by email.
                </p>
              </div>

              {/* NEXT */}

              <button
                onClick={() => {
                  setError("");
                  setStep(2);
                }}
                disabled={!isStep1Valid}
                style={{
                  width: "100%",
                  padding: "12px",
                  background:
                    !isStep1Valid
                      ? "#E5E7EB"
                      : "linear-gradient(135deg,#6C63FF,#4F46E5)",
                  color:
                    !isStep1Valid
                      ? "#9CA3AF"
                      : "white",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor:
                    !isStep1Valid
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Next →
              </button>
            </div>
          )}

          {/* =================================================
              STEP 2 — DETAILS
          ================================================== */}

          {step === 2 && (
            <div>

              {/* Topic */}

              <div
                style={{
                  marginBottom: 16,
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  📝 What do you want to learn?
                </label>

                <textarea
                  value={form.topic}
                  onChange={(e) =>
                    set(
                      "topic",
                      e.target.value
                    )
                  }
                  placeholder="E.g. I want to learn React hooks, state management and build real projects..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding:
                      "10px 14px",
                    border:
                      "1.5px solid #E5E7EB",
                    borderRadius: 10,
                    fontSize: 13,
                    outline: "none",
                    resize: "none",
                    fontFamily:
                      "'Inter',sans-serif",
                    boxSizing:
                      "border-box",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor =
                      "#6C63FF")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor =
                      "#E5E7EB")
                  }
                />
              </div>

              {/* =================================================
                  SESSION SUMMARY
              ================================================== */}

              <div
                style={{
                  background: "#F9FAFB",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  border:
                    "1px solid #F3F4F6",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6B7280",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.05em",
                    marginBottom: 12,
                  }}
                >
                  Session Summary
                </p>

                {[
                  {
                    label: "Tutor",
                    value: tutor.name,
                  },
                  {
                    label: "Start Date",
                    value: form.date,
                  },
                  {
                    label: "Class Time",
                    value: `${tutorSchedule.startTime} – ${tutorSchedule.endTime}`,
                  },
                  {
                    label: "Hours Per Day",
                    value: `${tutorSchedule.hoursPerDay} hours`,
                  },
                  {
                    label: "Available Days",
                    value:
                      tutorSchedule.availableDays.join(
                        ", "
                      ),
                  },
                  {
                    label: "Duration",
                    value: `${form.durationValue} ${form.durationType}`,
                  },
                  {
                    label: "Platform",
                    value: "🎥 Google Meet",
                  },
                  {
                    label: "Session Type",
                    value: tutor.barter
                      ? "🔄 Free Skill Exchange"
                      : `💳 $${tutor.rate}/hr`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      marginBottom: 8,
                      flexWrap:
                        "wrap",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                      }}
                    >
                      {item.label}
                    </span>

                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* =================================================
                  STEP 2 ERROR
              ================================================== */}

              {step === 2 && error && (
                <div
                  style={{
                    marginBottom: 12,
                    padding:
                      "10px 12px",
                    background:
                      "#FEF2F2",
                    border:
                      "1px solid #FECACA",
                    borderRadius: 10,
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      color: "#DC2626",
                    }}
                  >
                    ⚠️ {error}
                  </p>
                </div>
              )}

              {/* =================================================
                  BACK + SUBMIT
              ================================================== */}

              <div
                style={{
                  display: "flex",
                  gap: 10,
                }}
              >
                <button
                  onClick={() => {
                    setError("");
                    setStep(1);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "white",
                    color: "#374151",
                    border:
                      "1.5px solid #E5E7EB",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: "12px",
                    background:
                      submitting
                        ? "#A5B4FC"
                        : "linear-gradient(135deg,#6C63FF,#4F46E5)",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor:
                      submitting
                        ? "wait"
                        : "pointer",
                  }}
                >
                  {submitting
                    ? "Sending..."
                    : tutor.barter
                    ? "🔄 Send Barter Request"
                    : "📩 Send Session Request"}
                </button>
              </div>
            </div>
          )}

          {/* =================================================
              STEP 3 — CONFIRMATION
          ================================================== */}

          {step === 3 && (
            <div
              style={{
                textAlign: "center",
                padding: "20px 0",
              }}
            >

              {/* Success Icon */}

              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg,#6C63FF,#4F46E5)",
                  margin:
                    "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  fontSize: 32,
                }}
              >
                📩
              </div>

              <h3
                style={{
                  fontFamily:
                    "'Space Grotesk',sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#111827",
                  marginBottom: 8,
                }}
              >
                Request Sent!
              </h3>

              <p
                style={{
                  color: "#6B7280",
                  fontSize: 14,
                  marginBottom: 20,
                  lineHeight: 1.6,
                }}
              >
                Your request has been sent to{" "}
                <strong>{tutor.name}</strong>.
                <br />
                They have{" "}
                <strong>2 days</strong> to accept
                or reject.
              </p>

              {/* =================================================
                  SCHEDULE REMINDER
              ================================================== */}

              <div
                style={{
                  background: "#F5F3FF",
                  borderRadius: 12,
                  padding:
                    "14px 16px",
                  marginBottom: 14,
                  border:
                    "1px solid #E9D5FF",
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6C63FF",
                    marginBottom: 8,
                  }}
                >
                  📋 Your confirmed schedule
                </p>

                <p
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    marginBottom: 4,
                  }}
                >
                  🕐{" "}
                  {tutorSchedule.startTime}
                  {" – "}
                  {tutorSchedule.endTime}
                  {" ("}
                  {tutorSchedule.hoursPerDay}
                  {" hrs/day)"}
                </p>

                <p
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    marginBottom: 4,
                  }}
                >
                  📅 Starting {form.date}
                </p>

                <p
                  style={{
                    fontSize: 13,
                    color: "#374151",
                  }}
                >
                  ⏳ For {form.durationValue}{" "}
                  {form.durationType}
                </p>
              </div>

              {/* =================================================
                  AUTO REJECT DEADLINE
              ================================================== */}

              <div
                style={{
                  background: "#FFFBEB",
                  borderRadius: 12,
                  padding:
                    "12px 16px",
                  marginBottom: 14,
                  border:
                    "1px solid #FDE68A",
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#92400E",
                    marginBottom: 4,
                  }}
                >
                  ⏰ Auto-rejection deadline
                </p>

                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#B45309",
                  }}
                >
                  {expiryDate.toDateString()}
                </p>

                <p
                  style={{
                    fontSize: 11,
                    color: "#B45309",
                    marginTop: 2,
                  }}
                >
                  Request auto-cancelled if no
                  response by then
                </p>
              </div>

              {/* =================================================
                  WHAT HAPPENS NEXT
              ================================================== */}

              <div
                style={{
                  background: "#F9FAFB",
                  borderRadius: 12,
                  padding:
                    "12px 16px",
                  marginBottom: 20,
                  border:
                    "1px solid #F3F4F6",
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  What happens next?
                </p>

                {[
                  "✅ Accepted → You get email with Google Meet link",
                  "❌ Rejected → You get email with tutor's reason",
                  "⏰ No response → Auto-cancelled after 2 days",
                ].map((item) => (
                  <p
                    key={item}
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      marginBottom: 4,
                    }}
                  >
                    {item}
                  </p>
                ))}
              </div>

              {/* DONE */}

              <button
                onClick={onClose}
                style={{
                  width: "100%",
                  padding: "12px",
                  background:
                    "linear-gradient(135deg,#6C63FF,#4F46E5)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}