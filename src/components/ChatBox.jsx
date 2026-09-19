import { useState, useRef, useEffect } from "react";
import {
  getAllUsers,
  getMessages,
  sendMessage as sendMessageApi,
  markMessagesAsRead,
  getUnreadMessageCounts,
} from "../api";

const gradients = [
  "linear-gradient(135deg,#6C63FF,#A89BFF)",
  "linear-gradient(135deg,#FF6584,#FFB347)",
  "linear-gradient(135deg,#43D9AD,#4ADE80)",
  "linear-gradient(135deg,#EC4899,#F97316)",
  "linear-gradient(135deg,#0EA5E9,#6366F1)",
];

const getInitials = (name = "User") => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
};

const formatTime = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function ChatBox({ onClose }) {
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [showContacts, setShowContacts] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

const loadUnreadCounts = async () => {
  try {
    const data = await getUnreadMessageCounts();

     console.log("Unread API response:", data);

    const counts = {};

    data.forEach((item) => {
      counts[Number(item.sender_id)] = Number(item.unread_count);
    });

  console.log("Unread counts object:", counts);

    setUnreadCounts(counts);
  } catch (error) {
    console.error("Failed to load unread counts:", error);
  }
};

  // ─────────────────────────────────────────────
// Load all registered users and unread counts
// ─────────────────────────────────────────────
useEffect(() => {
  const loadContacts = async () => {
    try {
      setLoadingContacts(true);
      setError("");

      const currentUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const currentUserId = Number(currentUser.id);

      const users = await getAllUsers();

      const formattedUsers = users
        .filter((user) => Number(user.id) !== currentUserId)
        .map((user, index) => ({
          ...user,
          id: Number(user.id),
          name: user.full_name || "Unnamed user",
          avatar: getInitials(user.full_name),
          grad: gradients[index % gradients.length],
          online: Boolean(user.is_online),
          unread: 0,
          skill: "Skill Exchange",
        }));

      setContacts(formattedUsers);

      
    } catch (err) {
      console.error("Load contacts error:", err);
      setError(err.message || "Failed to load users.");
    } finally {
      setLoadingContacts(false);
    }
  };

  loadContacts();
  loadUnreadCounts();
}, []);
 // ─────────────────────────────────────────────
// Load and automatically refresh messages
// whenever selected contact changes
// ─────────────────────────────────────────────
useEffect(() => {
  if (!activeContact?.id) {
    setMessages([]);
    return;
  }

  const loadConversation = async () => {
  try {
    setLoadingMessages(true);
    setError("");

    const data = await getMessages(activeContact.id);

    console.log("Messages loaded:", data);
    console.log("Active contact ID:", activeContact.id);

    setMessages(data);

    console.log(
      "Marking messages as read for contact:",
      activeContact.id
    );

    const readResult = await markMessagesAsRead(activeContact.id);

    console.log("Mark messages as read result:", readResult);

    await loadUnreadCounts();

    console.log("Unread counts refreshed after marking as read");
  } catch (err) {
    console.error("Load conversation error:", err);
    setError(err.message || "Failed to load messages.");
  } finally {
    setLoadingMessages(false);
  }
};
  // Load messages immediately when contact changes
  loadConversation();

  // Refresh messages every 3 seconds
  const interval = setInterval(() => {
    getMessages(activeContact.id)
      .then((data) => {
        setMessages(data);
      })
      .catch((err) => {
        console.error("Auto-refresh messages error:", err);
      });
  }, 3000);

  // Stop refreshing when contact changes or ChatBox closes
  return () => clearInterval(interval);
}, [activeContact]);

// ─────────────────────────────────────────────
// Refresh unread message counts every 3 seconds
// ─────────────────────────────────────────────
useEffect(() => {
  const interval = setInterval(() => {
    loadUnreadCounts();
  }, 3000);

  return () => clearInterval(interval);
}, []);

  // ─────────────────────────────────────────────
  // Scroll to the latest message
  // ─────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ─────────────────────────────────────────────
  // Send a real message
  // ─────────────────────────────────────────────
  const handleSendMessage = async () => {
    const cleanMessage = input.trim();

    if (!cleanMessage || !activeContact?.id || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const newMessage = await sendMessageApi({
        receiver_id: activeContact.id,
        message: cleanMessage,
      });

      setMessages((previousMessages) => [
        ...previousMessages,
        newMessage,
      ]);

      setInput("");
      await loadUnreadCounts();
    } catch (err) {
      console.error("Send message error:", err);
      setError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const currentUserId = Number(currentUser.id);
  const totalUnread = Object.values(unreadCounts).reduce(
  (total, count) => total + Number(count || 0),
  0
);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 999,
        width: 380,
        height: 520,
        maxWidth: "calc(100vw - 32px)",
        background: "white",
        borderRadius: 20,
        boxShadow: "0 20px 60px rgba(108,99,255,0.2)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "fadeIn 0.25s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #6C63FF, #4B44CC)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={() => setShowContacts(!showContacts)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <div
            className="avatar"
            style={{
              width: 38,
              height: 38,
              fontSize: 13,
              background:
                activeContact?.grad ||
                "linear-gradient(135deg,#6C63FF,#A89BFF)",
              border: "2px solid rgba(255,255,255,0.4)",
            }}
          >
            {activeContact?.avatar || "💬"}
          </div>
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "white",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {activeContact?.name || "Messages"}
          </p>

          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.7)",
              margin: "3px 0 0",
            }}
          >
            {activeContact
              ? activeContact.online
                ? "🟢 Online"
                : "⚫ Offline"
              : "Select a user"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
         <button
  style={{
    position: "relative",
    background: "rgba(255,255,255,0.15)",
    border: "none",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
    color: "white",
    fontSize: 13,
  }}
  title="View all chats"
  onClick={() => setShowContacts(!showContacts)}
>
  💬

  {totalUnread > 0 && (
    <span
      style={{
        position: "absolute",
        top: -6,
        right: -6,
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        borderRadius: "50%",
        background: "#EF4444",
        color: "white",
        fontSize: 10,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #4B44CC",
      }}
    >
      {totalUnread > 99 ? "99+" : totalUnread}
    </span>
  )}
</button>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              color: "white",
              fontSize: 13,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Contacts drawer */}
      {showContacts && (
        <div
          style={{
            position: "absolute",
            top: 66,
            left: 0,
            right: 0,
            background: "white",
            zIndex: 10,
            borderBottom: "1px solid var(--border)",
            maxHeight: 300,
            overflowY: "auto",
          }}
        >
          {loadingContacts ? (
            <p
              style={{
                padding: 20,
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              Loading users...
            </p>
          ) : contacts.length === 0 ? (
            <p
              style={{
                padding: 20,
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              No other registered users found.
            </p>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => {
                  setActiveContact(contact);
                  setShowContacts(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  cursor: "pointer",
                  background:
                    activeContact?.id === contact.id
                      ? "var(--primary-bg)"
                      : "white",
                  borderBottom: "1px solid #F8F7FF",
                }}
              >
                <div style={{ position: "relative" }}>
                  {contact.avatar_url ? (
                    <img
                      src={contact.avatar_url}
                      alt={contact.name}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="avatar"
                      style={{
                        width: 36,
                        height: 36,
                        fontSize: 12,
                        background: contact.grad,
                      }}
                    >
                      {contact.avatar}
                    </div>
                  )}

                  {contact.online && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#10B981",
                        border: "2px solid white",
                      }}
                    />
                  )}
                </div>

               <div
  style={{
    flex: 1,
    minWidth: 0,
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    <p
      style={{
        fontSize: 13,
        fontWeight: 600,
        margin: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {contact.name}
    </p>

    {unreadCounts[Number(contact.id)] > 0 && (
      <span
        style={{
          marginLeft: "auto",
          minWidth: 20,
          height: 20,
          padding: "0 6px",
          borderRadius: 999,
          background: "#EF4444",
          color: "white",
          fontSize: 11,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {unreadCounts[Number(contact.id)]}
      </span>
    )}
  </div>

  <p
    style={{
      fontSize: 11,
      color: "var(--text-muted)",
      margin: "4px 0 0",
    }}
  >
    🔄 Skill Exchange
  </p>
</div>

                 
              </div>
            ))
          )}
        </div>
      )}

      {/* Chat information */}
      <div
        style={{
          padding: "6px 16px",
          background: "#F0EFFE",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ fontSize: 12 }}>🔄</span>

        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--primary-dark)",
          }}
        >
          Skill Exchange Chat
        </span>

        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            color: "var(--text-muted)",
            fontWeight: 500,
          }}
        >
          Real messages
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: "7px 12px",
            background: "#FEF2F2",
            color: "#B91C1C",
            fontSize: 11,
            borderBottom: "1px solid #FECACA",
          }}
        >
          {error}
        </div>
      )}

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          background: "#FAFAFE",
        }}
      >
        {!activeContact ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 13,
              marginTop: 40,
            }}
          >
            Select a user to start chatting.
          </p>
        ) : loadingMessages ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 13,
              marginTop: 40,
            }}
          >
            Loading messages...
          </p>
        ) : messages.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 13,
              marginTop: 40,
            }}
          >
            No messages yet. Say hello! 👋
          </p>
        ) : (
          messages.map((msg) => {
            const isMine =
              Number(msg.sender_id) === currentUserId;

            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: isMine
                    ? "flex-end"
                    : "flex-start",
                }}
              >
                {!isMine && (
                  <div
                    className="avatar"
                    style={{
                      width: 26,
                      height: 26,
                      fontSize: 9,
                      background:
                        activeContact.grad,
                      marginRight: 6,
                      alignSelf: "flex-end",
                    }}
                  >
                    {activeContact.avatar}
                  </div>
                )}

                <div>
                  <div
                    style={{
                      maxWidth: 220,
                      padding: "9px 13px",
                      background: isMine
                        ? "#6C63FF"
                        : "white",
                      color: isMine
                        ? "white"
                        : "#1A1433",
                      borderRadius: isMine
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                      fontSize: 13,
                      lineHeight: 1.45,
                      boxShadow:
                        "0 1px 4px rgba(0,0,0,0.06)",
                      border: !isMine
                        ? "1px solid var(--border)"
                        : "none",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.message}
                  </div>

                  <p
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      marginTop: 3,
                      textAlign: isMine
                        ? "right"
                        : "left",
                    }}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div
        style={{
          padding: "6px 12px",
          display: "flex",
          gap: 6,
          overflowX: "auto",
          borderTop: "1px solid var(--border)",
          background: "white",
        }}
      >
        {[
          "🔄 Propose barter",
          "📅 Schedule session",
          "🎥 Send Meet link",
        ].map((action) => (
          <button
            key={action}
            onClick={() =>
              setInput(
                action
                  .split(" ")
                  .slice(1)
                  .join(" ")
              )
            }
            style={{
              padding: "4px 10px",
              background: "var(--primary-bg)",
              color: "var(--primary-dark)",
              border: "1px solid var(--border)",
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        style={{
          padding: "10px 12px",
          display: "flex",
          gap: 8,
          alignItems: "center",
          background: "white",
          borderTop: "1px solid var(--border)",
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSendMessage();
            }
          }}
          placeholder={
            activeContact
              ? "Message..."
              : "Select a user first"
          }
          disabled={!activeContact || sending}
          style={{
            flex: 1,
            padding: "9px 14px",
            border: "1.5px solid var(--border)",
            borderRadius: 99,
            fontSize: 13,
            outline: "none",
            fontFamily: "'Inter', sans-serif",
            background: "#FAFAFE",
            color: "var(--text-primary)",
          }}
        />

        <button
          onClick={handleSendMessage}
          disabled={
            !input.trim() ||
            !activeContact ||
            sending
          }
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background:
              input.trim() && activeContact && !sending
                ? "#6C63FF"
                : "var(--border)",
            border: "none",
            cursor:
              input.trim() && activeContact && !sending
                ? "pointer"
                : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
        >
          {sending ? (
            <span style={{ color: "white", fontSize: 12 }}>
              ...
            </span>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}