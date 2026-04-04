"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import type { KnowledgeGraph, GraphNode, GraphEdge, DocumentNode, InsightNode } from "@/lib/knowledge-types";
import NodeDetail from "@/components/knowledge/node-detail";

/* D3 시뮬레이션용 확장 타입 */
interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  type: "concept" | "document" | "insight";
  label?: string;
  title?: string;
  weight?: number;
}

interface SimEdge extends d3.SimulationLinkDatum<SimNode> {
  weight: number;
}

/* 노드 타입별 반지름 계산 */
function getRadius(node: SimNode): number {
  if (node.type === "concept") {
    const w = node.weight ?? 1;
    return Math.max(8, Math.min(30, 8 + w * 4));
  }
  if (node.type === "insight") return 10;
  return 6;
}

/* 노드 타입별 색상 */
function getColor(type: string): string {
  if (type === "concept") return "var(--fg)";
  if (type === "document") return "var(--muted)";
  return "var(--accent)";
}

/* 노드 표시 레이블 */
function getLabel(node: SimNode): string {
  return node.label ?? node.title ?? node.id;
}

interface KnowledgeGraphProps {
  dateFilter: string | null;
}

export default function KnowledgeGraphComponent({ dateFilter }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimEdge> | null>(null);

  const [graphData, setGraphData] = useState<KnowledgeGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    node: SimNode;
    connectionCount: number;
  } | null>(null);

  /* graph.json 클라이언트 사이드 fetch */
  useEffect(() => {
    fetch("/graph.json")
      .then((res) => {
        if (!res.ok) throw new Error("fetch 실패");
        return res.json();
      })
      .then((data: KnowledgeGraph) => setGraphData(data))
      .catch(() => setError("그래프를 불러올 수 없습니다"));
  }, []);

  /* 선택된 노드를 GraphNode로 변환 */
  const findGraphNode = useCallback(
    (id: string): GraphNode | null => {
      if (!graphData) return null;
      return graphData.nodes.find((n) => n.id === id) ?? null;
    },
    [graphData]
  );

  /* dateFilter 기반 가시 노드 계산 */
  const getVisibleNodeIds = useCallback(
    (data: KnowledgeGraph, filter: string | null): Set<string> => {
      if (filter === null) {
        // 전체 표시
        return new Set(data.nodes.map((n) => n.id));
      }

      const visibleDocs = new Set<string>();
      // 날짜가 filter 이하인 문서
      for (const n of data.nodes) {
        if (n.type === "document") {
          const doc = n as DocumentNode;
          if (doc.date && doc.date <= filter) {
            visibleDocs.add(doc.id);
          }
        }
      }

      const visibleIds = new Set<string>(visibleDocs);

      // 개념: 소속 문서 중 하나라도 visible하면 표시
      for (const n of data.nodes) {
        if (n.type === "concept") {
          const hasVisibleDoc = n.documents.some((docId) => visibleDocs.has(docId));
          if (hasVisibleDoc) visibleIds.add(n.id);
        }
      }

      // 인사이트: 소스 문서 전부 visible해야 표시
      for (const n of data.nodes) {
        if (n.type === "insight") {
          const insight = n as InsightNode;
          const allSourcesVisible =
            insight.sources.length > 0 &&
            insight.sources.every((src) => visibleDocs.has(src));
          if (allSourcesVisible) visibleIds.add(n.id);
        }
      }

      return visibleIds;
    },
    []
  );

  /* D3 그래프 초기화 및 렌더링 */
  useEffect(() => {
    if (!graphData || !svgRef.current || !containerRef.current) return;

    const allNodes = graphData.nodes;
    const allEdges = graphData.edges;

    /* 기존 시뮬레이션 정리 */
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    /* SVG 초기화 */
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    /* 인사이트 노드용 드롭쉐도우 필터 */
    const defs = svg.append("defs");
    const filter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-30%")
      .attr("y", "-30%")
      .attr("width", "160%")
      .attr("height", "160%");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "2")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    /* 줌/패닝 레이어 */
    const g = svg.append("g").attr("class", "graph-root");

    /* 줌 동작 설정 */
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    /* 시뮬레이션 노드/엣지 데이터 준비 (전체) */
    const simNodes: SimNode[] = allNodes.map((n) => ({
      id: n.id,
      type: n.type,
      label: (n as { label?: string }).label,
      title: (n as { title?: string }).title,
      weight: (n as { weight?: number }).weight,
    }));

    const nodeById = new Map(simNodes.map((n) => [n.id, n]));

    /* 연결 수 계산 (툴팁용) */
    const connectionCount = new Map<string, number>();
    allEdges.forEach((e) => {
      connectionCount.set(e.source, (connectionCount.get(e.source) ?? 0) + 1);
      connectionCount.set(e.target, (connectionCount.get(e.target) ?? 0) + 1);
    });

    const simEdges: SimEdge[] = allEdges
      .map((e: GraphEdge) => ({
        source: nodeById.get(e.source) ?? e.source,
        target: nodeById.get(e.target) ?? e.target,
        weight: e.weight,
      }))
      .filter(
        (e) => typeof e.source === "object" && typeof e.target === "object"
      );

    /* 포스 시뮬레이션 */
    const simulation = d3
      .forceSimulation<SimNode, SimEdge>(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimEdge>(simEdges)
          .id((d) => d.id)
          .distance(80)
      )
      .force("charge", d3.forceManyBody().strength(-150))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide<SimNode>().radius((d) => getRadius(d) + 4)
      );

    simulationRef.current = simulation;

    /* 엣지 렌더링 */
    const links = g
      .append("g")
      .attr("class", "edges")
      .selectAll("line")
      .data(simEdges)
      .join("line")
      .attr("stroke", "var(--border)")
      .attr("stroke-width", (d) => Math.max(0.5, d.weight))
      .attr("stroke-opacity", (d) => Math.max(0.3, Math.min(0.8, d.weight * 0.4)));

    /* 노드 그룹 */
    const nodeGroups = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(simNodes)
      .join("g")
      .attr("class", "node-group")
      .style("cursor", "pointer");

    /* 노드 도형 렌더링 */
    nodeGroups.each(function (d) {
      const group = d3.select(this);
      const r = getRadius(d);
      const color = getColor(d.type);

      if (d.type === "insight") {
        /* 인사이트: 다이아몬드 */
        const size = r * 1.4;
        group
          .append("polygon")
          .attr(
            "points",
            `0,${-size} ${size},0 0,${size} ${-size},0`
          )
          .attr("fill", color)
          .attr("fill-opacity", 0.9)
          .attr("filter", "url(#glow)");
      } else {
        /* 개념/문서: 원 */
        group
          .append("circle")
          .attr("r", r)
          .attr("fill", color)
          .attr("fill-opacity", d.type === "concept" ? 0.85 : 0.55)
          .attr("stroke", color)
          .attr("stroke-width", 1)
          .attr("stroke-opacity", 0.4);
      }
    });

    /* 레이블 — 개념 노드 weight >= 2는 항상 표시 */
    const labels = g
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(simNodes.filter((d) => d.type === "concept" && (d.weight ?? 0) >= 2))
      .join("text")
      .text((d) => getLabel(d))
      .attr("text-anchor", "middle")
      .attr("dy", (d) => getRadius(d) + 12)
      .attr("font-size", "11px")
      .attr("fill", "var(--fg)")
      .attr("fill-opacity", 0.75)
      .attr("font-family", "var(--font-serif), Georgia, serif")
      .attr("pointer-events", "none");

    /* 드래그 동작 */
    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    /* drag 타입 호환을 위해 any 캐스팅 사용 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodeGroups.call(drag as any);

    /* 호버 이벤트 */
    nodeGroups
      .on("mouseenter", function (event: MouseEvent, d: SimNode) {
        setHoveredId(d.id);
        const svgRect = svgRef.current!.getBoundingClientRect();
        setTooltip({
          x: event.clientX - svgRect.left,
          y: event.clientY - svgRect.top,
          node: d,
          connectionCount: connectionCount.get(d.id) ?? 0,
        });

        /* 호버 시 레이블 표시 (weight < 2 노드 포함) */
        d3.select(this)
          .select("circle, polygon")
          .attr("fill-opacity", 1);
      })
      .on("mousemove", function (event: MouseEvent) {
        const svgRect = svgRef.current!.getBoundingClientRect();
        setTooltip((prev) =>
          prev
            ? { ...prev, x: event.clientX - svgRect.left, y: event.clientY - svgRect.top }
            : prev
        );
      })
      .on("mouseleave", function (_event: MouseEvent, d: SimNode) {
        setHoveredId(null);
        setTooltip(null);
        d3.select(this)
          .select("circle, polygon")
          .attr(
            "fill-opacity",
            d.type === "concept" ? 0.85 : d.type === "insight" ? 0.9 : 0.55
          );
      })
      .on("click", (_event: MouseEvent, d: SimNode) => {
        const node = findGraphNode(d.id);
        setSelectedNode(node);
        setTooltip(null);
      });

    /* 시뮬레이션 tick — 위치 업데이트 */
    simulation.on("tick", () => {
      links
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);

      nodeGroups.attr(
        "transform",
        (d) => `translate(${d.x ?? 0},${d.y ?? 0})`
      );

      labels.attr(
        "transform",
        (d) => `translate(${d.x ?? 0},${d.y ?? 0})`
      );
    });

    /* 윈도우 리사이즈 대응 */
    function handleResize() {
      if (!container || !svgRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      svg.attr("width", w).attr("height", h);
      simulation.force("center", d3.forceCenter(w / 2, h / 2));
      simulation.alpha(0.3).restart();
    }

    window.addEventListener("resize", handleResize);

    return () => {
      simulation.stop();
      window.removeEventListener("resize", handleResize);
    };
  }, [graphData, findGraphNode]);

  /* dateFilter 변경 시 노드/엣지 페이드 인/아웃 */
  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    const visibleIds = getVisibleNodeIds(graphData, dateFilter);
    const svg = d3.select(svgRef.current);

    /* 노드 그룹 트랜지션 */
    svg
      .selectAll<SVGGElement, SimNode>(".node-group")
      .transition()
      .duration(350)
      .style("opacity", (d) => (visibleIds.has(d.id) ? 1 : 0))
      .style("pointer-events", (d) => (visibleIds.has(d.id) ? "auto" : "none"));

    /* 레이블 트랜지션 */
    svg
      .selectAll<SVGTextElement, SimNode>(".labels text")
      .transition()
      .duration(350)
      .style("opacity", (d) => (visibleIds.has(d.id) ? 1 : 0));

    /* 엣지 트랜지션 — 양쪽 노드 모두 visible일 때만 표시 */
    svg
      .selectAll<SVGLineElement, SimEdge>(".edges line")
      .transition()
      .duration(350)
      .style("opacity", (d) => {
        const src = (d.source as SimNode).id;
        const tgt = (d.target as SimNode).id;
        return visibleIds.has(src) && visibleIds.has(tgt) ? 1 : 0;
      });

    /* 필터 적용 시 시뮬레이션 살짝 재가동 */
    if (simulationRef.current) {
      simulationRef.current.alpha(0.15).restart();
    }
  }, [graphData, dateFilter, getVisibleNodeIds]);

  /* 에러 상태 */
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--muted)",
          fontSize: "0.875rem",
        }}
      >
        {error}
      </div>
    );
  }

  /* 빈 그래프 상태 */
  if (graphData && graphData.nodes.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--muted)",
          fontSize: "0.875rem",
        }}
      >
        표시할 데이터가 없습니다
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* D3 SVG 캔버스 */}
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      {/* 툴팁 */}
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 12,
            top: tooltip.y - 8,
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "8px 12px",
            fontSize: "0.8125rem",
            color: "var(--fg)",
            pointerEvents: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            maxWidth: "200px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontWeight: 500,
              marginBottom: "2px",
            }}
          >
            {getLabel(tooltip.node)}
          </div>
          <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
            {tooltip.node.type === "concept" && "개념"}
            {tooltip.node.type === "document" && "문서"}
            {tooltip.node.type === "insight" && "인사이트"}
            {tooltip.connectionCount > 0 && ` · 연결 ${tooltip.connectionCount}개`}
          </div>
        </div>
      )}

      {/* 범례 */}
      <div
        style={{
          position: "absolute",
          bottom: "1rem",
          left: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "10px 12px",
          fontSize: "0.75rem",
          color: "var(--muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="5" fill="var(--fg)" fillOpacity={0.85} />
          </svg>
          개념
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="4" fill="var(--muted)" fillOpacity={0.55} />
          </svg>
          문서
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <polygon points="6,1 11,6 6,11 1,6" fill="var(--accent)" fillOpacity={0.9} />
          </svg>
          인사이트
        </div>
      </div>

      {/* 선택된 노드 상세 패널 */}
      {selectedNode && (
        <NodeDetail
          node={selectedNode}
          graphData={graphData!}
          onClose={() => setSelectedNode(null)}
          onSelectNode={(node) => setSelectedNode(node)}
        />
      )}

      {/* 호버 상태 표시 (숨김 처리용) */}
      <div style={{ display: "none" }}>{hoveredId}</div>
    </div>
  );
}
