"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import TimelineSlider from "@/components/knowledge/timeline-slider";
import type { KnowledgeGraph, DocumentNode } from "@/lib/knowledge-types";

/* SSR 비활성화는 클라이언트 컴포넌트에서만 허용 */
const KnowledgeGraph = dynamic(
  () => import("@/components/knowledge/knowledge-graph"),
  { ssr: false }
);

export default function GraphClientWrapper() {
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [allDates, setAllDates] = useState<string[]>([]);

  /* 문서 날짜 목록 수집 (graph.json에서) */
  useEffect(() => {
    fetch("/graph.json")
      .then((res) => res.json())
      .then((data: KnowledgeGraph) => {
        const dates = data.nodes
          .filter((n): n is DocumentNode => n.type === "document" && !!(n as DocumentNode).date)
          .map((n) => (n as DocumentNode).date)
          .filter(Boolean);
        const unique = [...new Set(dates)].sort();
        setAllDates(unique);
      })
      .catch(() => {
        /* 날짜 로드 실패 시 슬라이더 미표시 */
      });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* 그래프 — 남은 공간 전부 차지 */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <KnowledgeGraph dateFilter={dateFilter} />
      </div>

      {/* 타임라인 슬라이더 — 날짜 데이터 있을 때만 표시 */}
      {allDates.length > 1 && (
        <TimelineSlider
          dates={allDates}
          value={dateFilter}
          onChange={setDateFilter}
        />
      )}
    </div>
  );
}
