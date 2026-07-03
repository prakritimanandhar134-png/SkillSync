import { useState, useRef, useEffect } from "react";

const CONTACTS = [
  { id: 1, name: "Tanvir Khan", avatar: "TK", grad: "linear-gradient(135deg,#6C63FF,#A89BFF)", skill: "React ↔ Python", online: true, unread: 2, lastMsg: "Sure! Let's swap — I'll teach React, you teach me Python 🔄" },
  { id: 2, name: "Aisha Patel", avatar: "AP", grad: "linear-gradient(135deg,#FF6584,#FFB347)", skill: "ML ↔ DSA", online: true, unread: 0, lastMsg: "Session confirmed for tomorrow 2PM 👍" },
  { id: 3, name: "Dev Mehta", avatar: "DM", grad: "linear-gradient(135deg,#43D9AD,#4ADE80)", skill: "Figma ↔ Node.js", online: false, unread: 1, lastMsg: "Can you share your Figma file first?" },
  { id: 4, name: "Priya Nair", avatar: "PN", grad: "linear-gradient(135deg,#EC4899,#F97316)", skill: "UI/UX ↔ Python", online: false, unread: 0, lastMsg: "Great session today! Same time next week?" },
];

const INITIAL_MESSAGES = {
  1: [
    { id: 1, from: "them", text: "Hey! I saw your profile — you know Python, right?", time: "2:10 PM" },
    { id: 2, from: "me", text: "Yeah! Intermediate level. Looking to learn React in exchange 🙌", time: "2:11 PM" },
    { id: 3, from: "them", text: "Perfect! I'm a React dev, struggling with Python. Barter? 🔄", time: "2:12 PM" },
    { id: 4, from: "me", text: "100%! Let's set up sessions. When are you free?", time: "2:13 PM" },
    { id: 5, from: "them", text: "Sure! Let's swap — I'll teach React, you teach me Python 🔄", time: "2:14 PM" },
  ],
  2: [
    { id: 1, from: "them", text: "Hi! Your ML skills look great for a barter with my DSA expertise.", time: "Yesterday" },
    { id: 2, from: "me", text: "That sounds like a great deal! I need DSA for interviews.", time: "Yesterday" },
    { id: 3, from: "them", text: "Session confirmed for tomorrow 2PM 👍", time: "Yesterday" },
  ],
  3: [
    { id: 1, from: "them", text: "I want to learn Node.js and I can teach you Figma!", time: "Monday" },
    { id: 2, from: "me", text: "Love that! I'm very interested in Figma for my projects.", time: "Monday" },
    { id: 3, from: "them", text: "Can you share your Figma file first?", time: "Monday" },
  ],
  4: [
    { id: 1, from: "them", text: "Great session today! Same time next week?", time: "Last week" },
  ],
};

export default function ChatBox({ onClose }) {
  const [activeContact, setActiveContact] = useState(CONTACTS[0]);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeContact]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), from: "me", text: input.trim(), time: "Just now" };
    setMessages(prev => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg]
    }));
    setInput("");
    // Simulate reply after 1.2s
    setTimeout(() => {
      const replies = [
        "Sounds great! 🙌",
        "Let's confirm the barter session then!",
        "Perfect, I'll send the Google Meet link.",
        "That works for me! See you then 👋",
        "Great! Looking forward to learning from you 🎯",
      ];
      const reply = { id: Date.now() + 1, from: "them", text: replies[Math.floor(Math.random() * replies.length)], time: "Just now" };
      setMessages(prev => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), reply]
      }));
    }, 1200);
  };

  const currentMsgs = messages[activeContact.id] || [];

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 999,
      width: 380, height: 520,
      background: "white", borderRadius: 20,
      boxShadow: "0 20px 60px rgba(108,99,255,0.2)",
      border: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      animation: "fadeIn 0.25s ease"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #6C63FF, #4B44CC)",
        padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 12
      }}>
        <button onClick={() => setShowContacts(!showContacts)} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0
        }}>
          <div className="avatar" style={{
            width: 38, height: 38, fontSize: 13,
            background: activeContact.grad,
            border: "2px solid rgba(255,255,255,0.4)"
          }}>{activeContact.avatar}</div>
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{activeContact.name}</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
            {activeContact.online ? "🟢 Online" : "⚫ Offline"} · Barter: {activeContact.skill}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{
            background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8,
            padding: "6px 10px", cursor: "pointer", color: "white", fontSize: 13
          }} title="View all chats" onClick={() => setShowContacts(!showContacts)}>
            💬
          </button>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8,
            padding: "6px 10px", cursor: "pointer", color: "white", fontSize: 13
          }}>✕</button>
        </div>
      </div>

      {/* Contacts drawer */}
      {showContacts && (
        <div style={{
          position: "absolute", top: 66, left: 0, right: 0,
          background: "white", zIndex: 10,
          borderBottom: "1px solid var(--border)",
          maxHeight: 240, overflowY: "auto"
        }}>
          {CONTACTS.map(c => (
            <div key={c.id} onClick={() => { setActiveContact(c); setShowContacts(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 16px", cursor: "pointer",
                background: activeContact.id === c.id ? "var(--primary-bg)" : "white",
                borderBottom: "1px solid #F8F7FF"
              }}>
              <div style={{ position: "relative" }}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 12, background: c.grad }}>
                  {c.avatar}
                </div>
                {c.online && (
                  <span style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 10, height: 10, borderRadius: "50%",
                    background: "#10B981", border: "2px solid white"
                  }}/>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</p>
                  {c.unread > 0 && (
                    <span style={{
                      background: "#6C63FF", color: "white",
                      borderRadius: 99, fontSize: 10, fontWeight: 700,
                      padding: "1px 7px", minWidth: 18, textAlign: "center"
                    }}>{c.unread}</span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  🔄 {c.skill}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Barter badge */}
      <div style={{
        padding: "6px 16px",
        background: "#F0EFFE",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 6
      }}>
        <span style={{ fontSize: 12 }}>🔄</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary-dark)" }}>
          Active Barter: {activeContact.skill}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>
          Skill Exchange
        </span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "14px 16px",
        display: "flex", flexDirection: "column", gap: 8,
        background: "#FAFAFE"
      }}>
        {currentMsgs.map(msg => (
          <div key={msg.id} style={{
            display: "flex",
            justifyContent: msg.from === "me" ? "flex-end" : "flex-start"
          }}>
            {msg.from === "them" && (
              <div className="avatar" style={{
                width: 26, height: 26, fontSize: 9,
                background: activeContact.grad, marginRight: 6, alignSelf: "flex-end"
              }}>{activeContact.avatar}</div>
            )}
            <div>
              <div style={{
                maxWidth: 220, padding: "9px 13px",
                background: msg.from === "me" ? "#6C63FF" : "white",
                color: msg.from === "me" ? "white" : "#1A1433",
                borderRadius: msg.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                fontSize: 13, lineHeight: 1.45,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                border: msg.from === "them" ? "1px solid var(--border)" : "none"
              }}>{msg.text}</div>
              <p style={{
                fontSize: 10, color: "var(--text-muted)", marginTop: 3,
                textAlign: msg.from === "me" ? "right" : "left"
              }}>{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}/>
      </div>

      {/* Quick actions */}
      <div style={{
        padding: "6px 12px",
        display: "flex", gap: 6, overflowX: "auto",
        borderTop: "1px solid var(--border)", background: "white"
      }}>
        {["🔄 Propose barter", "📅 Schedule session", "🎥 Send Meet link"].map(a => (
          <button key={a} onClick={() => setInput(a.split(" ").slice(1).join(" "))}
            style={{
              padding: "4px 10px", background: "var(--primary-bg)",
              color: "var(--primary-dark)", border: "1px solid var(--border)",
              borderRadius: 99, fontSize: 11, fontWeight: 500,
              cursor: "pointer", whiteSpace: "nowrap"
            }}>{a}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: "10px 12px",
        display: "flex", gap: 8, alignItems: "center",
        background: "white", borderTop: "1px solid var(--border)"
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Message..."
          style={{
            flex: 1, padding: "9px 14px",
            border: "1.5px solid var(--border)", borderRadius: 99,
            fontSize: 13, outline: "none",
            fontFamily: "'Inter', sans-serif",
            background: "#FAFAFE",
            color: "var(--text-primary)"
          }}
          onFocus={e => e.target.style.borderColor = "#6C63FF"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        <button onClick={sendMessage} style={{
          width: 36, height: 36, borderRadius: "50%",
          background: input.trim() ? "#6C63FF" : "var(--border)",
          border: "none", cursor: input.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s", flexShrink: 0
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
