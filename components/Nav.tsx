import Link from "next/link";

export function Nav() {
  return (
    <nav style={{ marginTop: 18 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link className="btn" href="/">Home</Link>
        <Link className="btn" href="/today">Today</Link>
        <Link className="btn" href="/weekly">Weekly</Link>
        <Link className="btn" href="/habits">Habits</Link>

        {/* Optional: keep Decisions but make it clearly optional
            If you truly want it gone, delete this line. */}
        <Link className="btn" href="/decisions" style={{ opacity: 0.55 }}>
          Decisions (optional)
        </Link>
      </div>
    </nav>
  );
}
