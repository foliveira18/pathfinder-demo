export default function Footer() {
  return (
    <footer style={{
      marginTop: 24,
      padding: "14px 0",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10,
      color: "rgba(233,238,252,0.75)"
    }}>
      <span style={{ fontSize: 13 }}>
        Built by <b>Fernando Oliveira</b> ·{" "}
        <a href="mailto:foliveira18@gmail.com" style={{ color: "#7aa2ff", textDecoration: "none" }}>
          foliveira18@gmail.com
        </a>
      </span>
      <span style={{ fontSize: 12, color: "rgba(147,164,199,0.9)" }}>
        Prototype demo (no backend)
      </span>
    </footer>
  );
}
