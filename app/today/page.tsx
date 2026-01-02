"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { load, save } from "@/lib/storage";

type Pulse = {
  date: string;
  energy: number;
  stress: number;
  mood: number;
  focus: number;
};

const KEY = "pf_pulses";

export default function Today() {
  const today = new Date().toISOString().slice(0, 10);

  const [all, setAll] = useState<Pulse[]>([]);
  const [pulse, setPulse] = useState<Pulse>({
    date: today,
    energy: 3,
    stress: 3,
    mood: 3,
    focus: 3,
  });

  useEffect(() => {
    setAll(load<Pulse[]>(KEY, []));
  }, []);

  const submit = () => {
    const next = [pulse, ...all.filter((p) => p.date !== pulse.date)].slice(0, 30);
    setAll(next);
    save(KEY, next);
    alert("Saved. Next: log a decision, then check the weekly plan.");
  };

  const setNum =
    (k: keyof Omit<Pulse, "date">) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setPulse((p) => ({ ...p, [k]: Number(e.target.value) }));

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h2 className="h2">Today</h2>
        <p className="p">
          Quick daily pulse. (Demo: stored in <code>localStorage</code>.)
        </p>

        <div className="grid" style={{ gap: 12, marginTop: 12 }}>
          <div>
            <div className="small">Energy (1–5)</div>
            <input type="range" min={1} max={5} value={pulse.energy} onChange={setNum("energy")} />
            <div className="small">Value: {pulse.energy}</div>
          </div>

          <div>
            <div className="small">Stress (1–5)</div>
            <input type="range" min={1} max={5} value={pulse.stress} onChange={setNum("stress")} />
            <div className="small">Value: {pulse.stress}</div>
          </div>

          <div>
            <div className="small">Mood (1–5)</div>
            <input type="range" min={1} max={5} value={pulse.mood} onChange={setNum("mood")} />
            <div className="small">Value: {pulse.mood}</div>
          </div>

          <div>
            <div className="small">Focus (1–5)</div>
            <input type="range" min={1} max={5} value={pulse.focus} onChange={setNum("focus")} />
            <div className="small">Value: {pulse.focus}</div>
          </div>
        </div>

        <div className="row" style={{ marginTop: 14, gap: 10, flexWrap: "wrap" }}>
          <button className="btn btnPrimary" onClick={submit}>
            Save today’s pulse
          </button>

          {/* Guided loop buttons */}
          <Link className="btn btnPrimary" href="/decisions?loop=1">
            Next: Decisions →
          </Link>
          <Link className="btn" href="/weekly?loop=1">
            Skip to Weekly
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 className="h2">Recent pulses</h3>
        {all.length === 0 ? (
          <p className="p">No entries yet.</p>
        ) : (
          <ul className="p" style={{ lineHeight: 1.8 }}>
            {all.slice(0, 7).map((p) => (
              <li key={p.date}>
                <b>{p.date}</b> — E:{p.energy} S:{p.stress} M:{p.mood} F:{p.focus}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
