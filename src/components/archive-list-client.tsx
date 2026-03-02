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
    <>
      {/* Filter Tabs */}
      <div className="flex gap-2 mt-5 flex-wrap mb-0 max-[480px]:gap-1.5">
        <button
          className={`px-4 py-1.5 border-[1.5px] rounded-full text-[0.82rem] font-medium cursor-pointer transition-all tracking-wide ${
            activeFilter === "all"
              ? "bg-[var(--fg)] border-[var(--fg)] text-[var(--bg)]"
              : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--fg)] hover:text-[var(--fg)]"
          }`}
          style={{ fontFamily: "inherit" }}
          onClick={() => setActiveFilter("all")}
        >
          전체
          <span className="ml-1.5 text-[0.72rem] opacity-60">
            {archives.length}
          </span>
        </button>
        {categories.map((cat) =>
          catCounts[cat.id] ? (
            <button
              key={cat.id}
              className={`px-4 py-1.5 border-[1.5px] rounded-full text-[0.82rem] font-medium cursor-pointer transition-all tracking-wide max-[480px]:px-3 max-[480px]:py-1 max-[480px]:text-[0.78rem] ${
                activeFilter === cat.id
                  ? "bg-[var(--fg)] border-[var(--fg)] text-[var(--bg)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--fg)] hover:text-[var(--fg)]"
              }`}
              style={{ fontFamily: "inherit" }}
              onClick={() => setActiveFilter(cat.id)}
            >
              {cat.label}
              <span className="ml-1.5 text-[0.72rem] opacity-60">
                {catCounts[cat.id]}
              </span>
            </button>
          ) : null
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mt-5 mb-10">
        <svg
          className="absolute left-[18px] top-1/2 -translate-y-1/2 text-[var(--muted)]"
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
          className="w-full py-3.5 pl-12 pr-5 border-[1.5px] border-[var(--border)] rounded-xl bg-[var(--card-bg)] text-[0.95rem] text-[var(--fg)] outline-none transition-colors focus:border-[var(--fg)]"
          style={{ fontFamily: "inherit" }}
          autoComplete="off"
        />
      </div>

      {/* Archive List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[var(--muted)]">
          <div className="text-[2.4rem] mb-4 opacity-40">&#x1F50D;</div>
          <p className="text-[0.95rem]">검색 결과가 없습니다</p>
        </div>
      ) : (
        <ul className="list-none flex flex-col gap-px bg-[var(--border)] rounded-xl overflow-hidden">
          {filtered.map((archive, i) => {
            const cat = catMap[archive.categoryId];
            const tagBg = cat ? cat.color + "18" : "#f0ece4";
            const tagColor = cat ? cat.color : "#5c5a55";
            const tagLabel = cat ? cat.label : "file";

            return (
              <li key={archive.id}>
                <Link
                  href={`/archives/${archive.slug}`}
                  className="bg-[var(--card-bg)] flex items-center gap-4 px-6 py-5 no-underline text-inherit transition-all hover:bg-[#faf9f6] hover:pl-8 max-[480px]:px-4 max-[480px]:py-4 max-[480px]:gap-3"
                  style={{
                    animation: `fadeUp 0.35s ease both`,
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  <span
                    className="shrink-0 text-[0.7rem] font-semibold tracking-wider px-2.5 py-1 rounded-md"
                    style={{ background: tagBg, color: tagColor }}
                  >
                    {tagLabel}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-base whitespace-nowrap overflow-hidden text-ellipsis">
                      {archive.title}
                    </div>
                    <div className="text-[0.8rem] text-[var(--muted)] mt-0.5">
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
    </>
  );
}
