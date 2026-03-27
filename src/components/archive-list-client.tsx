"use client";

import { useState, useMemo } from "react";
import { ArchiveListItem, Category } from "@/lib/types";
import Link from "next/link";
import SubscribeForm from "@/components/subscribe-form";

const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function toChosung(str: string): string {
  return str.split('').map(ch => {
    const code = ch.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      return CHOSUNG[Math.floor((code - 0xAC00) / (21 * 28))];
    }
    return ch;
  }).join('');
}

function matchesQuery(q: string, title: string, catLabel: string, date: string, slug: string): boolean {
  const isChosung = /^[ㄱ-ㅎ]+$/.test(q);
  const lower = q.toLowerCase();
  if (isChosung) {
    return toChosung(title).includes(q) || toChosung(catLabel).includes(q);
  }
  return (
    title.toLowerCase().includes(lower) ||
    catLabel.toLowerCase().includes(lower) ||
    date.includes(q) ||
    slug.toLowerCase().includes(lower)
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
}

function formatMonth(yyyyMM: string): string {
  const [year, month] = yyyyMM.split("-");
  return `${year}년 ${parseInt(month)}월`;
}

interface Props {
  archives: ArchiveListItem[];
  categories: Category[];
  siteTitle: string;
  siteSubtitle: string;
}

export default function ArchiveListClient({ archives, categories, siteTitle, siteSubtitle }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const catMap = useMemo(() => {
    const map: Record<string, Category> = {};
    categories.forEach(c => { map[c.id] = c; });
    return map;
  }, [categories]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    archives.forEach(a => { counts[a.categoryId] = (counts[a.categoryId] || 0) + 1; });
    return counts;
  }, [archives]);

  const filtered = useMemo(() => {
    let result = archives;
    if (activeFilter !== "all") result = result.filter(a => a.categoryId === activeFilter);
    const q = searchQuery.trim();
    if (q) {
      result = result.filter(a => {
        const catLabel = catMap[a.categoryId]?.label ?? "";
        return matchesQuery(q, a.title, catLabel, a.date, a.slug);
      });
    }
    return result;
  }, [archives, activeFilter, searchQuery, catMap]);

  // Animation index map: only first 8 items get staggered animation
  const animIdx = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((a, i) => { map[a.id] = i; });
    return map;
  }, [filtered]);

  const grouped = useMemo(() => {
    const map: Record<string, ArchiveListItem[]> = {};
    for (const a of filtered) {
      const key = a.date?.slice(0, 7) || "날짜 미상";
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <>
      <div className="archive-wrap">
        {/* Page header — title + subtitle */}
        <header className="archive-header">
          <h1 className="archive-title">{siteTitle}</h1>
          <p className="archive-subtitle">{siteSubtitle}</p>
        </header>

        {/* Sticky control bar */}
        <div className="archive-controls">
          <div className="archive-controls-inner">
            {/* Filters + view toggle row */}
            <div className="controls-top">
              <div className="filters">
                <button
                  className={`filter-btn${activeFilter === "all" ? " active" : ""}`}
                  onClick={() => setActiveFilter("all")}
                  aria-pressed={activeFilter === "all"}
                >
                  전체<span className="count">{archives.length}</span>
                </button>
                {categories.map(cat =>
                  catCounts[cat.id] ? (
                    <button
                      key={cat.id}
                      className={`filter-btn${activeFilter === cat.id ? " active" : ""}`}
                      onClick={() => setActiveFilter(cat.id)}
                      aria-pressed={activeFilter === cat.id}
                    >
                      {cat.label}<span className="count">{catCounts[cat.id]}</span>
                    </button>
                  ) : null
                )}
              </div>
              <div className="view-toggle">
                <button
                  className={`view-btn${viewMode === "list" ? " active" : ""}`}
                  onClick={() => setViewMode("list")}
                  aria-label="리스트 보기"
                  title="리스트 보기"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
                <button
                  className={`view-btn${viewMode === "grid" ? " active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  aria-label="그리드 보기"
                  title="그리드 보기"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </button>
              </div>
            </div>

            {/* Search + result count row */}
            <div className="controls-bottom">
              <div className="search-bar">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  id="archive-search"
                  type="text"
                  placeholder="제목, 분류, 날짜 검색 (초성 가능)..."
                  aria-label="아카이브 검색"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <span className="result-count">
                {filtered.length !== archives.length
                  ? `${archives.length}개 중 ${filtered.length}개`
                  : `${archives.length}개`}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="archive-content empty-state">
            <div className="empty-icon">🔍</div>
            <p>검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="archive-content">
            {grouped.map(([monthKey, items]) => (
              <section key={monthKey} className="month-section">
                <div className="month-header">
                  <span className="month-label">
                    {monthKey === "날짜 미상" ? monthKey : formatMonth(monthKey)}
                  </span>
                  <span className="month-divider" />
                  <span className="month-count">{items.length}</span>
                </div>

                {viewMode === "grid" ? (
                  <div className="archive-grid">
                    {items.map(archive => {
                      const cat = catMap[archive.categoryId];
                      const tagBg = cat ? cat.color + "18" : "#f0ece4";
                      const tagColor = cat ? cat.color : "#5c5a55";
                      const tagLabel = cat ? cat.label : "file";
                      const idx = animIdx[archive.id] ?? 99;
                      const animStyle = idx < 8 ? {
                        animation: `fadeUp 0.35s ease both`,
                        animationDelay: `${idx * 0.06}s`,
                      } : { animation: `fadeUp 0.2s ease both` };

                      return (
                        <div key={archive.id} className="archive-card" style={animStyle}>
                          <div className="card-color-bar" style={{ background: cat?.color ?? "var(--border)" }} />
                          <Link href={`/archives/${archive.slug}`} className="card-body">
                            <span className="tag" style={{ background: tagBg, color: tagColor }}>
                              {tagLabel}
                            </span>
                            <div className="card-title">{archive.title}</div>
                            <div className="card-date">{formatDate(archive.date)}</div>
                          </Link>
                          <a
                            href={`/archives/${archive.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card-new-tab"
                            onClick={e => e.stopPropagation()}
                            aria-label="새 탭에서 열기"
                            title="새 탭에서 열기"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                              <polyline points="15 3 21 3 21 9"/>
                              <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <ul className="archive-list">
                    {items.map(archive => {
                      const cat = catMap[archive.categoryId];
                      const tagBg = cat ? cat.color + "18" : "#f0ece4";
                      const tagColor = cat ? cat.color : "#5c5a55";
                      const tagLabel = cat ? cat.label : "file";
                      const idx = animIdx[archive.id] ?? 99;
                      const animStyle = idx < 8 ? {
                        animation: `fadeUp 0.35s ease both`,
                        animationDelay: `${idx * 0.06}s`,
                      } : { animation: `fadeUp 0.2s ease both` };

                      return (
                        <li key={archive.id} style={animStyle}>
                          <Link href={`/archives/${archive.slug}`} className="archive-item">
                            <span className="tag" style={{ background: tagBg, color: tagColor }}>
                              {tagLabel}
                            </span>
                            <div className="item-content">
                              <div className="title">{archive.title}</div>
                              <div className="meta">{formatDate(archive.date)}</div>
                            </div>
                          </Link>
                          <a
                            href={`/archives/${archive.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="new-tab-btn"
                            onClick={e => e.stopPropagation()}
                            aria-label="새 탭에서 열기"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
              </section>
            ))}
          </div>
        )}

        <footer className="archive-footer">
          324(dy) · claude Opus4.6 · Next.js · Firestore ·{" "}
          <a href="/colophon">Colophon</a> ·{" "}
          <a href="/notes">개발노트</a>
        </footer>
      </div>
      <SubscribeForm />
    </>
  );
}
