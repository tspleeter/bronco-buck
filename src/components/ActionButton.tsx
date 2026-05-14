"use client";

import type { ReactNode } from "react";

interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  size?: "sm" | "base" | "lg";
  fullWidth?: boolean;
}

export function ActionButton({
  children,
  onClick,
  variant = "secondary",
  disabled = false,
  type = "button",
  size = "base",
  fullWidth = false,
}: ActionButtonProps) {
  const variantClass = {
    primary:   "btn-primary",
    secondary: "btn-secondary",
    outline:   "btn-outline",
    ghost:     "btn-ghost",
  }[variant];

  const sizeClass = {
    sm:   "btn-sm",
    base: "",
    lg:   "btn-lg",
  }[size];

  const classes = [
    "btn",
    variantClass,
    sizeClass,
    fullWidth ? "btn-full" : "",
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}