"use client";

import Link from "next/link";

export default function ArchiveError({ error }: { error: Error }) {
  return (
    <>
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: 44,
        zIndex: 100,
        background: "#f8f6f1",
        borderBottom: "1px solid #e5e2db",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
      }}>
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 6, color: "#1a1a18", textDecoration: "none", fontSize: 13, opacity: 0.7 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          목록
        </Link>
      </div>
      <div style={{
        position: "fixed",
        top: 44, left: 0, right: 0, bottom: 0,
        background: "#f8f6f1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontFamily: "var(--font-sans), sans-serif",
      }}>
        <p style={{ color: "#1a1a18", fontSize: 15 }}>문서를 불러오지 못했습니다</p>
        <p style={{ color: "#8a8780", fontSize: 13 }}>{error.message}</p>
        <Link href="/" style={{ marginTop: 8, color: "#c4450a", fontSize: 13, textDecoration: "underline" }}>
          목록으로 돌아가기
        </Link>
      </div>
    </>
  );
}
