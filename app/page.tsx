import Link from "next/link";

export default function Home() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="badge">Working demo</div>
        <h1 className="h1">Pathfinder</h1>
        <p className="p">
          Opportunity navigation: daily pulse + decision journal + weekly plan (health, money, relationships, career).
        </p>
        <div className="row" style={{ marginTop: 12 }}>
          <Link className="btn btnPrimary" href="/today">Start: Today</Link>
          <Link className="btn" href="/decisions">Decision Journal</Link>
          <Link className="btn" href="/weekly">Weekly Plan</Link>
          <Link className="btn" href="/habits">Habits</Link>
        </div>
      </div>

      <div className="card">
        <h2 className="h2">What this demo proves</h2>
        <ul className="p" style={{ marginTop: 8, lineHeight: 1.6 }}>
          <li>Clear UX loop (capture → structure → plan → check-in)</li>
          <li>Structured outputs (JSON-ready) for AI integration later</li>
          <li>Fast to iterate with early users</li>
        </ul>
      </div>
    </div>
  );
}
