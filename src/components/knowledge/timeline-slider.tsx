"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TimelineSliderProps {
  dates: string[];
  value: string | null;
  onChange: (date: string | null) => void;
}

export default function TimelineSlider({ dates, value, onChange }: TimelineSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playDuration = 5000; // 5초

  /* 정렬된 날짜 배열 */
  const sortedDates = [...dates].sort();
  const minIdx = 0;
  const maxIdx = sortedDates.length - 1;

  /* 현재 슬라이더 인덱스 계산 */
  const currentIdx = value
    ? Math.max(0, sortedDates.lastIndexOf(value) !== -1
        ? sortedDates.lastIndexOf(value)
        : sortedDates.findIndex((d) => d >= value) - 1
      )
    : maxIdx;

  /* 자동 재생 — 5초에 걸쳐 처음부터 끝까지 */
  const startPlay = useCallback(() => {
    if (sortedDates.length === 0) return;

    let idx = 0;
    onChange(sortedDates[0]);

    const stepMs = playDuration / Math.max(1, maxIdx);
    intervalRef.current = setInterval(() => {
      idx += 1;
      if (idx >= sortedDates.length) {
        // 끝에 도달 — 정지
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsPlaying(false);
        onChange(null); // 전체 표시로 복귀
        return;
      }
      onChange(sortedDates[idx]);
    }, stepMs);
  }, [sortedDates, maxIdx, onChange]);

  const stopPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlay();
    } else {
      setIsPlaying(true);
      startPlay();
    }
  }, [isPlaying, startPlay, stopPlay]);

  /* 언마운트 시 정리 */
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /* 슬라이더 직접 조작 시 재생 중단 */
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPlaying) stopPlay();
    const idx = Number(e.target.value);
    if (idx === maxIdx) {
      onChange(null); // 끝 = 전체 표시
    } else {
      onChange(sortedDates[idx]);
    }
  };

  /* 날짜 포맷 — YYYY-MM-DD → YYYY.MM.DD */
  const formatDate = (d: string) => d.replace(/-/g, ".");

  /* 표시할 날짜 레이블 */
  const displayDate =
    value === null
      ? "전체"
      : formatDate(value);

  if (sortedDates.length === 0) return null;

  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        padding: "0.75rem 1.5rem",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flexShrink: 0,
      }}
    >
      {/* 재생/정지 버튼 */}
      <button
        onClick={togglePlay}
        title={isPlaying ? "정지" : "자동 재생"}
        style={{
          background: "none",
          border: "1px solid var(--border)",
          borderRadius: "3px",
          padding: "4px 8px",
          cursor: "pointer",
          color: "var(--muted)",
          fontSize: "0.75rem",
          lineHeight: 1,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "28px",
          height: "24px",
          transition: "color 0.15s, border-color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "var(--fg)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--muted)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
        }}
      >
        {isPlaying ? (
          /* 정지 아이콘 */
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <rect x="1" y="1" width="3" height="8" />
            <rect x="6" y="1" width="3" height="8" />
          </svg>
        ) : (
          /* 재생 아이콘 */
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <polygon points="1,1 9,5 1,9" />
          </svg>
        )}
      </button>

      {/* 시작 날짜 */}
      <span
        style={{
          fontSize: "0.6875rem",
          color: "var(--muted)",
          flexShrink: 0,
          fontFamily: "monospace",
        }}
      >
        {formatDate(sortedDates[0])}
      </span>

      {/* 슬라이더 */}
      <input
        type="range"
        min={0}
        max={maxIdx}
        value={currentIdx}
        onChange={handleSliderChange}
        style={{
          flex: 1,
          appearance: "none",
          WebkitAppearance: "none",
          height: "2px",
          background: `linear-gradient(to right, var(--muted) 0%, var(--muted) ${(currentIdx / Math.max(1, maxIdx)) * 100}%, var(--border) ${(currentIdx / Math.max(1, maxIdx)) * 100}%, var(--border) 100%)`,
          borderRadius: "1px",
          outline: "none",
          cursor: "pointer",
        }}
      />

      {/* 끝 날짜 */}
      <span
        style={{
          fontSize: "0.6875rem",
          color: "var(--muted)",
          flexShrink: 0,
          fontFamily: "monospace",
        }}
      >
        {formatDate(sortedDates[maxIdx])}
      </span>

      {/* 현재 날짜 표시 */}
      <span
        style={{
          fontSize: "0.6875rem",
          color: "var(--fg)",
          flexShrink: 0,
          fontFamily: "monospace",
          minWidth: "72px",
          textAlign: "right",
          fontWeight: value === null ? 400 : 500,
        }}
      >
        {displayDate}
      </span>

      {/* 초기화 버튼 (필터 적용 중일 때만) */}
      {value !== null && (
        <button
          onClick={() => { stopPlay(); onChange(null); }}
          title="필터 초기화"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted)",
            fontSize: "0.6875rem",
            padding: "0 2px",
            flexShrink: 0,
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--fg)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)";
          }}
        >
          ✕
        </button>
      )}

      {/* 슬라이더 thumb 스타일 */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--fg);
          cursor: pointer;
          border: none;
        }
        input[type=range]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--fg);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
