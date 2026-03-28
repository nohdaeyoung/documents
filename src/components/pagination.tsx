"use client";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  function buildPages(): (number | "…")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "…")[] = [1];
    if (currentPage > 3) pages.push("…");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  const pages = buildPages();

  return (
    <nav className="pagination" aria-label="페이지 탐색">
      <button
        className="pg-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
      >
        ‹
      </button>
      <span className="pg-numbers">
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`dots-${i}`} className="pg-btn pg-dots">···</span>
          ) : (
            <button
              key={p}
              className={`pg-btn${currentPage === p ? " active" : ""}`}
              onClick={() => onPageChange(p as number)}
              aria-current={currentPage === p ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}
      </span>
      <span className="pg-mobile-label">{currentPage} / {totalPages}</span>
      <button
        className="pg-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
      >
        ›
      </button>
    </nav>
  );
}
