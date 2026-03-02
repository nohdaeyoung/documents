"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useAuth } from "@/lib/firebase/auth";
import { useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/admin");
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/admin");
    } catch {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1
          className="text-center mb-8 font-normal"
          style={{
            fontFamily: "var(--font-serif), serif",
            fontSize: "1.8rem",
          }}
        >
          Admin Login
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border-[1.5px] border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--fg)] outline-none focus:border-[var(--fg)] text-[0.95rem]"
            style={{ fontFamily: "inherit" }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border-[1.5px] border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--fg)] outline-none focus:border-[var(--fg)] text-[0.95rem]"
            style={{ fontFamily: "inherit" }}
          />

          {error && (
            <p className="text-red-600 text-[0.85rem] text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--fg)] text-[var(--bg)] rounded-lg font-medium text-[0.95rem] cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ fontFamily: "inherit" }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="text-center mt-6 text-[0.8rem] text-[var(--muted)]">
          <a href="/" className="underline hover:text-[var(--fg)]">
            ← Archives로 돌아가기
          </a>
        </p>
      </div>
    </div>
  );
}
