export interface ConceptNode {
  id: string;
  type: "concept";
  label: string;
  description: string;
  documents: string[];
  weight: number;
  cluster?: string;
}

export interface DocumentNode {
  id: string;
  type: "document";
  label: string;
  date: string;
  category: string;
  summary: string;
  concepts: string[];
  slug: string;
}

export interface InsightNode {
  id: string;
  type: "insight";
  title: string;
  sources: string[];
  concepts: string[];
  content: string;
  verification: null;
}

export type GraphNode = ConceptNode | DocumentNode | InsightNode;

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  reason: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  insights: InsightNode[];
  meta: {
    generatedAt: string;
    documentCount: number;
    conceptCount: number;
    edgeCount: number;
    insightCount: number;
  };
}
