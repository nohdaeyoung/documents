"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "오류가 발생했습니다.");
        setStatus("error");
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch {
      setErrorMsg("네트워크 오류가 발생했습니다.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="subscribe-success">
        <span>✓</span> 구독이 완료되었습니다. 새 아카이브가 추가되면 알려드릴게요.
      </div>
    );
  }

  return (
    <form className="subscribe-form" onSubmit={handleSubmit}>
      <p className="subscribe-label">새 아카이브 알림 받기</p>
      <div className="subscribe-row">
        <input
          type="email"
          className="subscribe-input"
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="이메일 주소"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          className="subscribe-btn"
          disabled={status === "loading"}
        >
          {status === "loading" ? "..." : "구독"}
        </button>
      </div>
      {status === "error" && (
        <p className="subscribe-error">{errorMsg}</p>
      )}
    </form>
  );
}
