"use client";

import { useState, useMemo } from "react";
import { ArchiveListItem, Category } from "@/lib/types";
import Link from "next/link";

function formatSize(bytes: number) {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  if (dateStr.includes("T")) {
    const [datePart, timePart] = dateStr.split("T");
    return `${datePart} ${timePart}`;
  }
  return dateStr;
}

export default function ArchiveListClient({
  archives,
  categories,
  siteTitle = "324 Lecture & Study Archives",
  siteSubtitle = "324가 보고 듣고 경험한 타인의 언어와 연구 아카이브",
}: {
  archives: ArchiveListItem[];
  categories: Category[];
  siteTitle?: string;
  siteSubtitle?: string;
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
        <h1 className="archive-title">{siteTitle}</h1>
        <p className="archive-subtitle">{siteSubtitle}</p>
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
                title={`/category/${cat.id} 에서 전체 보기`}
              >
                {cat.label}
                <span className="count">{catCounts[cat.id]}</span>
              </button>
            ) : null
          )}
          {activeFilter !== "all" && (
            <a
              href={`/category/${activeFilter}`}
              className="filter-btn"
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
              title="이 분류 전용 페이지"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              분류 페이지
            </a>
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
                      {formatDate(archive.date)}
                    </div>
                  </div>
                </Link>
                <a
                  href={`/archives/${archive.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="new-tab-btn"
                  title="새 탭에서 열기"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      <footer className="archive-footer">
        324(dy) · claude Opus4.6 · Next.js · Firestore ·{" "}
        <a href="/colophon">Colophon</a> ·{" "}
        <a href="/notes">개발노트</a>
      </footer>
    </div>
  );
}
