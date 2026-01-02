"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { load, save } from "@/lib/storage";

type WeeklyPlan = {
  weekStart: string;
  bestMove: string;
  microHabits: string;
  reviewQuestion: string;
};

const KEY = "pf_weekly";

function mondayOfThisWeek(): string {
  const d = new Date();
  const day = d.getDay(); // 0 Sun ... 1 Mon
  const diff = (day === 0 ? -6 : 1 - day); // move to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default function WeeklyPage() {
  const [plan, setPlan] = useState<WeeklyPlan>({
    weekStart: mondayOfThisWeek(),
    bestMove: "",
    microHabits: "",
    reviewQuestion: "What did I learn this week that changes next week’s best move?",
  });

  useEffect(() => {
    const existing = load<WeeklyPlan | null>(KEY, null);
    if (existing) setPlan(existing);
  }, []);

  const submit = () => {
    save(KEY, plan);
    alert("Saved. Loop complete — restart with Today.");
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h2 className="h2">Weekly Plan</h2>
        <p className="p">One best move + micro-habits. (Demo: localStorage.)</p>

        <div className="grid" style={{ gap: 10, marginTop: 12 }}>
          <input
            value={plan.weekStart}
            onChange={(e) => setPlan((p) => ({ ...p, weekStart: e.target.value }))}
            placeholder="Week start (YYYY-MM-DD)"
          />
          <input
            value={plan.bestMove}
            onChange={(e) => setPlan((p) => ({ ...p, bestMove: e.target.value }))}
            placeholder="Best move (one thing that matters most this week)"
          />
          <input
            value={plan.microHabits}
            onChange={(e) => setPlan((p) => ({ ...p, microHabits: e.target.value }))}
            placeholder="Micro-habits (e.g., 10m daily build, 5m journal, 20m walk)"
          />
          <input
            value={plan.reviewQuestion}
            onChange={(e) => setPlan((p) => ({ ...p, reviewQuestion: e.target.value }))}
            placeholder="Friday review question"
          />
        </div>

        <div className="row" style={{ marginTop: 14, gap: 10, flexWrap: "wrap" }}>
          <button className="btn btnPrimary" onClick={submit} disabled={!plan.bestMove.trim()}>
            Save weekly plan
          </button>

          {/* Guided loop buttons */}
          <Link className="btn btnPrimary" href="/today?loop=1">
            Restart loop ↺
          </Link>
          <Link className="btn" href="/">
            Back to home
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 className="h2">Tip</h3>
        <p className="p">
          In the full version, Weekly Plan would summarize trends from Today pulses and surface a “best move” suggestion.
        </p>
      </div>
    </div>
  );
}
