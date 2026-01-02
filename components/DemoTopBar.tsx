import Link from "next/link";

export default function DemoTopBar() {
  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        <span style={styles.badge}>DEMO MODE</span>
        <span style={styles.title}>Pathfinder</span>
      </div>

      <Link href="/today" style={styles.link}>
        Show me the loop →
      </Link>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.15)",
    position: "sticky",
    top: 0,
    zIndex: 20,
    backdropFilter: "blur(8px)",
  },
  left: { display: "flex", alignItems: "center", gap: 10 },
  badge: {
    fontSize: 12,
    letterSpacing: 0.6,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(122,162,255,0.35)",
    background: "rgba(122,162,255,0.12)",
    color: "#e9eefc",
    fontWeight: 600,
  },
  title: { fontSize: 14, color: "rgba(233,238,252,0.85)" },
  link: {
    textDecoration: "none",
    color: "#7aa2ff",
    fontSize: 13,
    fontWeight: 700,
  },
};
