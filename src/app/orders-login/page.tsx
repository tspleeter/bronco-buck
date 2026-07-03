"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/ActionButton";

export default function OrdersLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/orders-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/orders");
    } else {
      setError("Incorrect password.");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: 40,
          width: "100%",
          maxWidth: 380,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, marginBottom: 24 }}>
          Orders
        </h1>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-2)",
              color: "var(--color-text)",
              fontSize: 16,
              outline: "none",
              width: "100%",
            }}
          />
          {error && (
            <p style={{ color: "var(--color-error)", margin: 0, fontSize: 14 }}>
              {error}
            </p>
          )}
          <ActionButton variant="primary" type="submit">Enter</ActionButton>
        </form>
      </div>
    </main>
  );
}
