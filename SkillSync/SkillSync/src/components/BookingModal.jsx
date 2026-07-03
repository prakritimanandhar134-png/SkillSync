import { useState } from "react";

export default function BookingModal({ tutor, onClose, onConfirm }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [topic, setTopic] = useState("");

  const times = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "6:00 PM", "7:00 PM"];

  if (!tutor) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(26, 20, 51, 0.6)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24
    }} onClick={onClose}>
      <div style={{
        background: "white", borderRadius: 20,
        padding: 32, width: "100%", maxWidth: 480,
        boxShadow: "0 24px 80px rgba(108, 99, 255, 0.2)",
        animation: "fadeIn 0.25s ease"
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}>
              Book a Session
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              with {tutor.name} · via Google Meet
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "1.5px solid var(--border)", background: "white",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}>✕</button>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: s <= step ? "var(--primary)" : "var(--border)"
            }}/>
          ))}
        </div>

        {step === 1 && (
          <div>
            <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Choose a date</p>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="input"
              style={{ marginBottom: 20 }}
              min={new Date().toISOString().split("T")[0]}
            />
            <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Choose a time</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {times.map(t => (
                <button key={t} onClick={() => setSelectedTime(t)} style={{
                  padding: "8px 4px", borderRadius: "var(--radius-md)",
                  border: "1.5px solid", fontSize: 13,
                  borderColor: selectedTime === t ? "var(--primary)" : "var(--border)",
                  background: selectedTime === t ? "var(--primary-bg)" : "white",
                  color: selectedTime === t ? "var(--primary)" : "var(--text-secondary)",
                  fontWeight: selectedTime === t ? 600 : 400,
                  cursor: "pointer"
                }}>{t}</button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>What do you want to learn?</p>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="E.g., I need help understanding React hooks and state management..."
              className="input"
              rows={4}
              style={{ resize: "none" }}
            />
            <div style={{
              marginTop: 16, padding: "14px 16px",
              background: "var(--surface-alt)", borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)"
            }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Session Summary</p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                <span style={{ color: "var(--text-secondary)" }}>Tutor</span>
                <span style={{ fontWeight: 600 }}>{tutor.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                <span style={{ color: "var(--text-secondary)" }}>Date & Time</span>
                <span style={{ fontWeight: 600 }}>{selectedDate} · {selectedTime}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--text-secondary)" }}>Platform</span>
                <span style={{ fontWeight: 600, color: "#059669" }}>🎥 Google Meet</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "#ECFDF5", margin: "0 auto 16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32
            }}>✓</div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Session Booked!
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
              A Google Meet link has been sent to your email.<br/>
              Your session with {tutor.name} is confirmed.
            </p>
            <div style={{
              padding: "12px 20px", background: "#F0EFFE",
              borderRadius: "var(--radius-md)", display: "inline-block"
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>
                📅 {selectedDate} at {selectedTime}
              </p>
            </div>
          </div>
        )}

        {/* Footer button */}
        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          {step > 1 && step < 3 && (
            <button onClick={() => setStep(s => s - 1)} className="btn btn-ghost" style={{ flex: 1 }}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && (!selectedDate || !selectedTime)}
              className="btn btn-primary"
              style={{
                flex: 1, opacity: (step === 1 && (!selectedDate || !selectedTime)) ? 0.5 : 1
              }}
            >
              {step === 2 ? "Confirm Booking" : "Next"}
            </button>
          ) : (
            <button onClick={onClose} className="btn btn-primary" style={{ flex: 1 }}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
