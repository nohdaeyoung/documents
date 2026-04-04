"use client";

import type { InsightNode } from "@/lib/knowledge-types";

interface InsightCardProps {
  insight: InsightNode;
  /** 카드 클릭 시 콜백 (선택 사항) */
  onClick?: () => void;
}

/* 인사이트 미리보기 카드 — 툴팁·패널에서 재사용 가능 */
export default function InsightCard({ insight, onClick }: InsightCardProps) {
  const preview = insight.content
    ? insight.content.slice(0, 100) + (insight.content.length > 100 ? "..." : "")
    : null;

  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        padding: "12px 14px",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
      }}
    >
      {/* 헤더: 제목 + 소스 뱃지 */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "8px",
          marginBottom: "6px",
        }}
      >
        <h4
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontSize: "0.9375rem",
            fontWeight: 500,
            color: "var(--fg)",
            margin: 0,
            lineHeight: 1.4,
            flex: 1,
          }}
        >
          {insight.title}
        </h4>

        {/* 소스 수 뱃지 */}
        {insight.sources.length > 0 && (
          <span
            style={{
              flexShrink: 0,
              padding: "2px 7px",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "2px",
              fontSize: "0.6875rem",
              color: "var(--muted)",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            출처 {insight.sources.length}
          </span>
        )}
      </div>

      {/* 본문 미리보기 */}
      {preview && (
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--muted)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {preview}
        </p>
      )}
    </div>
  );
}
