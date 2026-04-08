"use client";

interface ToastProps {
  message: string;
  type?: "success" | "info" | "error";
}

export function Toast({ message, type = "success" }: ToastProps) {
  if (!message) return null;

  const styles = {
    success: {
      background: "#ecfdf3",
      border: "1px solid #86efac",
      color: "#166534",
    },
    info: {
      background: "#eff6ff",
      border: "1px solid #93c5fd",
      color: "#1d4ed8",
    },
    error: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#991b1b",
    },
  }[type];

  return (
    <div
      style={{
        borderRadius: 12,
        padding: "12px 16px",
        fontWeight: 600,
        wordBreak: "break-word",
        ...styles,
      }}
    >
      {message}
    </div>
  );
}