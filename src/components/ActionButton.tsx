"use client";

import type { ReactNode } from "react";

interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  type?: "button" | "submit";
}

export function ActionButton({
  children,
  onClick,
  variant = "secondary",
  disabled = false,
  type = "button",
}: ActionButtonProps) {
  const styles =
    variant === "primary"
      ? {
          background: "#111",
          color: "#fff",
          border: "1px solid #111",
        }
      : variant === "outline"
        ? {
            background: "#fff",
            color: "#111",
            border: "1px solid #111",
          }
        : {
            background: "#fff",
            color: "#111",
            border: "1px solid #d4d4d4",
          };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "14px 20px",
        borderRadius: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 700,
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        ...styles,
      }}
    >
      {children}
    </button>
  );
}