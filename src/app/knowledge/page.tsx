import { Suspense } from "react";
import GraphClientWrapper from "@/components/knowledge/graph-client-wrapper";

export const metadata = {
  title: "Knowledge Graph — 324 Archives",
  description: "45개 문서에서 추출한 개념 연결 지도",
};

export default function KnowledgePage() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column" as const,
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "1rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-serif), serif",
              fontSize: "1.5rem",
              fontWeight: 400,
              margin: 0,
            }}
          >
            Knowledge Graph
          </h1>
          <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            45개 문서에서 추출한 개념 연결 지도
          </span>
          <a
            href="/"
            style={{
              marginLeft: "auto",
              color: "var(--muted)",
              fontSize: "0.8rem",
              textDecoration: "none",
            }}
          >
            목록으로
          </a>
        </div>
      </header>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Suspense>
          <GraphClientWrapper />
        </Suspense>
      </div>
    </main>
  );
}
