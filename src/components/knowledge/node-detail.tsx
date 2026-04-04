"use client";

import { useEffect, useRef } from "react";
import type {
  GraphNode,
  KnowledgeGraph,
  ConceptNode,
  DocumentNode,
  InsightNode,
} from "@/lib/knowledge-types";

interface NodeDetailProps {
  node: GraphNode;
  graphData: KnowledgeGraph;
  onClose: () => void;
  onSelectNode: (node: GraphNode) => void;
}

/* 카테고리 뱃지 */
function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "2px",
        fontSize: "0.6875rem",
        color: "var(--muted)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {category}
    </span>
  );
}

/* 개념 노드 상세 */
function ConceptDetail({
  node,
  graphData,
  onSelectNode,
}: {
  node: ConceptNode;
  graphData: KnowledgeGraph;
  onSelectNode: (node: GraphNode) => void;
}) {
  /* 연결된 문서 목록 */
  const relatedDocs = graphData.nodes.filter(
    (n): n is DocumentNode =>
      n.type === "document" && node.documents.includes(n.id)
  );

  /* 연결된 개념 목록 (엣지 기반) */
  const connectedConcepts = graphData.nodes.filter(
    (n): n is ConceptNode =>
      n.type === "concept" &&
      n.id !== node.id &&
      graphData.edges.some(
        (e) =>
          (e.source === node.id && e.target === n.id) ||
          (e.target === node.id && e.source === n.id)
      )
  );

  return (
    <div>
      <div
        style={{
          fontSize: "0.6875rem",
          color: "var(--accent)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        개념 · 가중치 {node.weight}
      </div>
      <h2
        style={{
          fontFamily: "var(--font-serif), Georgia, serif",
          fontSize: "1.25rem",
          fontWeight: 500,
          color: "var(--fg)",
          margin: "0 0 8px",
          lineHeight: 1.3,
        }}
      >
        {node.label}
      </h2>
      {node.description && (
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--muted)",
            margin: "0 0 20px",
            lineHeight: 1.6,
          }}
        >
          {node.description}
        </p>
      )}

      {relatedDocs.length > 0 && (
        <section style={{ marginBottom: "20px" }}>
          <h3 style={sectionTitleStyle}>관련 문서 ({relatedDocs.length})</h3>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {relatedDocs.map((doc) => (
              <li key={doc.id} style={{ marginBottom: "6px" }}>
                <button
                  onClick={() => onSelectNode(doc)}
                  style={linkButtonStyle}
                >
                  {doc.label}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {connectedConcepts.length > 0 && (
        <section>
          <h3 style={sectionTitleStyle}>연결된 개념</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {connectedConcepts.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectNode(c)}
                style={tagButtonStyle}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* 문서 노드 상세 */
function DocumentDetail({
  node,
  graphData,
  onSelectNode,
}: {
  node: DocumentNode;
  graphData: KnowledgeGraph;
  onSelectNode: (node: GraphNode) => void;
}) {
  /* 연결된 개념 목록 */
  const concepts = graphData.nodes.filter(
    (n): n is ConceptNode =>
      n.type === "concept" && node.concepts.includes(n.id)
  );

  /* 날짜 포맷 */
  const formattedDate = node.date
    ? new Date(node.date).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        <CategoryBadge category={node.category} />
        {formattedDate && (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--muted)",
            }}
          >
            {formattedDate}
          </span>
        )}
      </div>
      <h2
        style={{
          fontFamily: "var(--font-serif), Georgia, serif",
          fontSize: "1.125rem",
          fontWeight: 500,
          color: "var(--fg)",
          margin: "0 0 10px",
          lineHeight: 1.4,
        }}
      >
        {node.label}
      </h2>
      {node.summary && (
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--muted)",
            margin: "0 0 20px",
            lineHeight: 1.7,
          }}
        >
          {node.summary}
        </p>
      )}

      {concepts.length > 0 && (
        <section style={{ marginBottom: "20px" }}>
          <h3 style={sectionTitleStyle}>개념 태그</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {concepts.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectNode(c)}
                style={tagButtonStyle}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {node.slug && (
        <a
          href={`https://d.324.ing/archives/${node.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.8125rem",
            color: "var(--accent)",
            textDecoration: "none",
            borderBottom: "1px solid currentColor",
            paddingBottom: "1px",
          }}
        >
          d.324.ing에서 보기
        </a>
      )}
    </div>
  );
}

/* 인사이트 노드 상세 */
function InsightDetail({
  node,
  graphData,
  onSelectNode,
}: {
  node: InsightNode;
  graphData: KnowledgeGraph;
  onSelectNode: (node: GraphNode) => void;
}) {
  /* 소스 문서 목록 */
  const sourceDocs = graphData.nodes.filter(
    (n): n is DocumentNode =>
      n.type === "document" && node.sources.includes(n.id)
  );

  /* 관련 개념 목록 */
  const concepts = graphData.nodes.filter(
    (n): n is ConceptNode =>
      n.type === "concept" && node.concepts.includes(n.id)
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontSize: "0.6875rem",
            color: "var(--accent)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          인사이트
        </span>
        <span
          style={{
            fontSize: "0.6875rem",
            padding: "2px 7px",
            background: node.verification ? "#e8f5e9" : "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "2px",
            color: node.verification ? "#2e7d32" : "var(--muted)",
            letterSpacing: "0.04em",
          }}
        >
          검증: {node.verification ?? "미검증"}
        </span>
      </div>
      <h2
        style={{
          fontFamily: "var(--font-serif), Georgia, serif",
          fontSize: "1.125rem",
          fontWeight: 500,
          color: "var(--fg)",
          margin: "0 0 14px",
          lineHeight: 1.4,
        }}
      >
        {node.title}
      </h2>

      {node.content && (
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--fg)",
            lineHeight: 1.8,
            margin: "0 0 20px",
            padding: "14px",
            background: "var(--bg)",
            borderRadius: "4px",
            borderLeft: "2px solid var(--accent)",
          }}
        >
          {node.content}
        </p>
      )}

      {sourceDocs.length > 0 && (
        <section style={{ marginBottom: "16px" }}>
          <h3 style={sectionTitleStyle}>소스 문서 ({sourceDocs.length})</h3>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {sourceDocs.map((doc) => (
              <li key={doc.id} style={{ marginBottom: "6px" }}>
                <button
                  onClick={() => onSelectNode(doc)}
                  style={linkButtonStyle}
                >
                  {doc.label}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {concepts.length > 0 && (
        <section>
          <h3 style={sectionTitleStyle}>관련 개념</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {concepts.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectNode(c)}
                style={tagButtonStyle}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* 공통 스타일 상수 */
const sectionTitleStyle: React.CSSProperties = {
  fontSize: "0.6875rem",
  color: "var(--muted)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  margin: "0 0 8px",
  fontWeight: 500,
};

const linkButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontSize: "0.875rem",
  color: "var(--fg)",
  textAlign: "left",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
  textDecorationColor: "var(--border)",
  transition: "color 0.15s",
};

const tagButtonStyle: React.CSSProperties = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "2px",
  padding: "4px 10px",
  cursor: "pointer",
  fontSize: "0.8125rem",
  color: "var(--fg)",
  transition: "border-color 0.15s",
};

/* 메인 패널 컴포넌트 */
export default function NodeDetail({
  node,
  graphData,
  onClose,
  onSelectNode,
}: NodeDetailProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  /* ESC 키로 닫기 */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  /* 모바일 판별 (뷰포트 768px 미만) */
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  const panelStyle: React.CSSProperties = isMobile
    ? {
        /* 모바일: 하단 시트 */
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: "60vh",
        background: "var(--card-bg)",
        borderTop: "1px solid var(--border)",
        borderRadius: "12px 12px 0 0",
        padding: "20px 20px 32px",
        overflowY: "auto",
        zIndex: 100,
        boxShadow: "0 -4px 24px rgba(0,0,0,0.08)",
        animation: "slideUp 0.22s ease-out",
      }
    : {
        /* 데스크톱: 우측 패널 */
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: "380px",
        background: "var(--card-bg)",
        borderLeft: "1px solid var(--border)",
        padding: "24px 24px 40px",
        overflowY: "auto",
        zIndex: 100,
        animation: "slideIn 0.22s ease-out",
      };

  return (
    <>
      {/* 슬라이드 애니메이션 키프레임 */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        button.link-btn:hover { color: var(--accent); }
        button.tag-btn:hover { border-color: var(--fg); }
      `}</style>

      <div ref={panelRef} style={panelStyle}>
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          aria-label="닫기"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "2px",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--muted)",
            fontSize: "14px",
            lineHeight: 1,
            transition: "color 0.15s, border-color 0.15s",
          }}
        >
          ×
        </button>

        {/* 노드 타입별 상세 내용 */}
        {node.type === "concept" && (
          <ConceptDetail
            node={node as ConceptNode}
            graphData={graphData}
            onSelectNode={onSelectNode}
          />
        )}
        {node.type === "document" && (
          <DocumentDetail
            node={node as DocumentNode}
            graphData={graphData}
            onSelectNode={onSelectNode}
          />
        )}
        {node.type === "insight" && (
          <InsightDetail
            node={node as InsightNode}
            graphData={graphData}
            onSelectNode={onSelectNode}
          />
        )}
      </div>
    </>
  );
}
