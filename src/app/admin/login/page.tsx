"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signInWithGoogle, useAuth } from "@/lib/firebase/auth";
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

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/admin");
    } catch {
      setError("Google 로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

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

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-[0.8rem] text-[var(--muted)]">또는</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-4 w-full py-3 flex items-center justify-center gap-3 border-[1.5px] border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--fg)] text-[0.95rem] cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ fontFamily: "inherit" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google로 로그인
        </button>

        <p className="text-center mt-6 text-[0.8rem] text-[var(--muted)]">
          <a href="/" className="underline hover:text-[var(--fg)]">
            ← Archives로 돌아가기
          </a>
        </p>
      </div>
    </div>
  );
}
