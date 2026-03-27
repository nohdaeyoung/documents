"use client";

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      fontFamily: "var(--font-sans), sans-serif",
      background: "#f8f6f1",
    }}>
      <p style={{ color: "#1a1a18", fontSize: 15 }}>페이지를 불러오지 못했습니다</p>
      <p style={{ color: "#8a8780", fontSize: 13 }}>{error.message}</p>
      <button
        onClick={reset}
        style={{
          marginTop: 8, padding: "6px 16px",
          background: "transparent", border: "1px solid #c4450a",
          color: "#c4450a", fontSize: 13, borderRadius: 4, cursor: "pointer",
        }}
      >
        다시 시도
      </button>
    </div>
  );
}
