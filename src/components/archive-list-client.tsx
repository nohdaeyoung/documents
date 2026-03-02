"use client";

import { useState, useMemo } from "react";
import { ArchiveListItem, Category } from "@/lib/types";
import Link from "next/link";

function formatSize(bytes: number) {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

export default function ArchiveListClient({
  archives,
  categories,
}: {
  archives: ArchiveListItem[];
  categories: Category[];
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    archives.forEach((a) => {
      const cat = a.categoryId || "other";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [archives]);

  const filtered = useMemo(() => {
    let result = archives;
    if (activeFilter !== "all") {
      result = result.filter((a) => a.categoryId === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q)
      );
    }
    return result;
  }, [archives, activeFilter, searchQuery]);

  const catMap = useMemo(() => {
    const map: Record<string, Category> = {};
    categories.forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  return (
    <div className="archive-container">
      <header className="archive-header">
        <h1 className="archive-title">324 Lecture &amp; Study Archives</h1>
        <p className="archive-subtitle">
          324가 보고 듣고 경험한 타인의 언어와 연구 아카이브
        </p>
        {/* Filter tabs inside header, above the border */}
        <div className="filters">
          <button
            className={`filter-btn${activeFilter === "all" ? " active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            전체<span className="count">{archives.length}</span>
          </button>
          {categories.map((cat) =>
            catCounts[cat.id] ? (
              <button
                key={cat.id}
                className={`filter-btn${activeFilter === cat.id ? " active" : ""}`}
                onClick={() => setActiveFilter(cat.id)}
              >
                {cat.label}
                <span className="count">{catCounts[cat.id]}</span>
              </button>
            ) : null
          )}
        </div>
      </header>

      {/* Search bar */}
      <div className="search-bar">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="파일 이름으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* Archive list */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>검색 결과가 없습니다</p>
        </div>
      ) : (
        <ul className="archive-list">
          {filtered.map((archive, i) => {
            const cat = catMap[archive.categoryId];
            const tagBg = cat ? cat.color + "18" : "#f0ece4";
            const tagColor = cat ? cat.color : "#5c5a55";
            const tagLabel = cat ? cat.label : "file";

            return (
              <li key={archive.id}>
                <Link
                  href={`/archives/${archive.slug}`}
                  className="archive-item"
                  style={{
                    animation: `fadeUp 0.35s ease both`,
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  <span
                    className="tag"
                    style={{ background: tagBg, color: tagColor }}
                  >
                    {tagLabel}
                  </span>
                  <div className="item-content">
                    <div className="title">{archive.title}</div>
                    <div className="meta">
                      {archive.size ? formatSize(archive.size) : ""}
                      {archive.size && archive.date ? " · " : ""}
                      {archive.date || ""}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <footer className="archive-footer">
        324(dy) · claude Opus4.6 · Next.js · Firestore ·{" "}
        <a href="/colophon">Colophon</a>
      </footer>
    </div>
  );
}
