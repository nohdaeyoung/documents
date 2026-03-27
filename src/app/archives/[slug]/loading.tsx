export default function ArchiveLoading() {
  return (
    <>
      {/* Nav bar skeleton */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: 44,
        zIndex: 100,
        background: "#f8f6f1",
        borderBottom: "1px solid #e5e2db",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 12,
      }}>
        <div style={{ width: 52, height: 16, background: "#e5e2db", borderRadius: 4, opacity: 0.6 }} />
        <div style={{ width: 1, height: 16, background: "#e5e2db" }} />
        <div style={{ width: 180, height: 13, background: "#e5e2db", borderRadius: 4, opacity: 0.4 }} />
      </div>
      {/* Content area skeleton */}
      <div style={{
        position: "fixed",
        top: 44, left: 0, right: 0, bottom: 0,
        background: "#f8f6f1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ color: "#8a8780", fontSize: 13, fontFamily: "var(--font-sans), sans-serif" }}>
          불러오는 중…
        </div>
      </div>
    </>
  );
}
