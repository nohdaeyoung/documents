"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const NAV_HEIGHT = 44;

type NavItem = { slug: string; title: string };

export default function ArchiveViewer({
  contentHtml,
  title,
  prev,
  next,
}: {
  contentHtml: string;
  title: string;
  prev?: NavItem | null;
  next?: NavItem | null;
}) {
  const router = useRouter();

  const handleMessage = useCallback(
    (e: MessageEvent) => {
      if (e.data?.type === "navigate") {
        router.push(e.data.url || "/");
      }
    },
    [router]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  return (
    <>
      {/* Top navigation bar */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: NAV_HEIGHT,
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
          aria-label="목록으로 돌아가기"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#1a1a18",
            textDecoration: "none",
            fontSize: 13,
            fontFamily: "var(--font-sans), sans-serif",
            opacity: 0.7,
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          목록
        </Link>
        <div style={{
          width: 1,
          height: 16,
          background: "#e5e2db",
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 13,
          color: "#1a1a18",
          fontFamily: "var(--font-sans), sans-serif",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          opacity: 0.6,
          flex: 1,
        }}>
          {title}
        </span>

        {/* Prev / Next navigation */}
        {(prev || next) && (
          <>
            <div style={{ width: 1, height: 16, background: "#e5e2db", flexShrink: 0 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
              <Link
                href={prev ? `/archives/${prev.slug}` : "#"}
                aria-label={prev ? `이전 글: ${prev.title}` : undefined}
                aria-disabled={!prev}
                title={prev?.title}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 44, height: 44, borderRadius: 4,
                  color: prev ? "#1a1a18" : "#c8c4bc",
                  pointerEvents: prev ? "auto" : "none",
                  textDecoration: "none",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </Link>
              <Link
                href={next ? `/archives/${next.slug}` : "#"}
                aria-label={next ? `다음 글: ${next.title}` : undefined}
                aria-disabled={!next}
                title={next?.title}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 44, height: 44, borderRadius: 4,
                  color: next ? "#1a1a18" : "#c8c4bc",
                  pointerEvents: next ? "auto" : "none",
                  textDecoration: "none",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Content iframe below nav bar */}
      <iframe
        srcDoc={contentHtml}
        title={title}
        style={{
          position: "fixed",
          top: NAV_HEIGHT,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: `calc(100% - ${NAV_HEIGHT}px)`,
          border: "none",
        }}
        sandbox="allow-scripts allow-popups"
      />
    </>
  );
}
