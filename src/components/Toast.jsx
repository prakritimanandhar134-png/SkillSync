import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        minWidth: 300,
        maxWidth: 400,
        padding: "14px 18px",
        borderRadius: 12,
        background: "white",
        border: "1px solid #E5E7EB",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background:
            type === "success" ? "#ECFDF5" : "#FEF2F2",
          color:
            type === "success" ? "#059669" : "#DC2626",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {type === "success" ? "✓" : "!"}
      </div>

      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: "#111827",
          }}
        >
          {message}
        </p>
      </div>

      <button
        onClick={onClose}
        style={{
          border: "none",
          background: "none",
          color: "#9CA3AF",
          cursor: "pointer",
          fontSize: 18,
        }}
      >
        ×
      </button>
    </div>
  );
}