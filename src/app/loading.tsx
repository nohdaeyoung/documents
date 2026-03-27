export default function RootLoading() {
  return (
    <div className="archive-container" style={{ paddingTop: 80 }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: 64, borderBottom: "2px solid #1a1a18", paddingBottom: 24 }}>
        <div style={{ width: 320, height: 48, background: "#e5e2db", borderRadius: 4, marginBottom: 12 }} />
        <div style={{ width: 240, height: 14, background: "#e5e2db", borderRadius: 4, opacity: 0.6 }} />
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          {[60, 80, 70, 90].map((w, i) => (
            <div key={i} style={{ width: w, height: 28, background: "#e5e2db", borderRadius: 20, opacity: 0.5 }} />
          ))}
        </div>
      </div>
      {/* List skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 0",
            borderBottom: "1px solid #e5e2db",
            opacity: 1 - i * 0.08,
          }}>
            <div style={{ width: 56, height: 22, background: "#e5e2db", borderRadius: 4, flexShrink: 0 }} />
            <div style={{ flex: 1, height: 16, background: "#e5e2db", borderRadius: 4, maxWidth: 320 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
