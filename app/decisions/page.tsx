"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { load, save } from "@/lib/storage";

type Decision = {
  id: string;
  date: string;
  decision: string;
  options: string;
  assumptions: string;
  nextAction: string;
};

const KEY = "pf_decisions";

export default function DecisionsPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [all, setAll] = useState<Decision[]>([]);
  const [d, setD] = useState<Decision>({
    id: crypto.randomUUID(),
    date: today,
    decision: "",
    options: "",
    assumptions: "",
    nextAction: "",
  });

  useEffect(() => {
    setAll(load<Decision[]>(KEY, []));
  }, []);

  const submit = () => {
    const item = { ...d, id: d.id || crypto.randomUUID() };
    const next = [item, ...all].slice(0, 50);
    setAll(next);
    save(KEY, next);
    alert("Saved. Next: go to Weekly plan.");
    // reset
    setD({
      id: crypto.randomUUID(),
      date: today,
      decision: "",
      options: "",
      assumptions: "",
      nextAction: "",
    });
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h2 className="h2">Decision Journal</h2>
        <p className="p">Log a decision in a structured way (demo: localStorage).</p>

        <div className="grid" style={{ gap: 10, marginTop: 12 }}>
          <input
            value={d.decision}
            onChange={(e) => setD((x) => ({ ...x, decision: e.target.value }))}
            placeholder="Decision (e.g., accept role / stay / renegotiate)"
          />
          <input
            value={d.options}
            onChange={(e) => setD((x) => ({ ...x, options: e.target.value }))}
            placeholder="Options (comma-separated)"
          />
          <input
            value={d.assumptions}
            onChange={(e) => setD((x) => ({ ...x, assumptions: e.target.value }))}
            placeholder="Key assumptions / what would change your mind"
          />
          <input
            value={d.nextAction}
            onChange={(e) => setD((x) => ({ ...x, nextAction: e.target.value }))}
            placeholder="Next action (one concrete step)"
          />
        </div>

        <div className="row" style={{ marginTop: 14, gap: 10, flexWrap: "wrap" }}>
          <button className="btn btnPrimary" onClick={submit} disabled={!d.decision.trim()}>
            Save decision
          </button>

          {/* Guided loop buttons */}
          <Link className="btn btnPrimary" href="/weekly?loop=1">
            Next: Weekly →
          </Link>
          <Link className="btn" href="/today?loop=1">
            Back to Today
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 className="h2">Recent decisions</h3>
        {all.length === 0 ? (
          <p className="p">No decisions yet.</p>
        ) : (
          <ul className="p" style={{ lineHeight: 1.7 }}>
            {all.slice(0, 6).map((x) => (
              <li key={x.id}>
                <b>{x.date}</b> — {x.decision}
                {x.nextAction ? <div className="small">Next: {x.nextAction}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
