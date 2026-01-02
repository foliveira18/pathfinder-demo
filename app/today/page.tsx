"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { load, save } from "@/lib/storage";

// NEW schema: calm is "good" when higher
type Pulse = {
  date: string;
  energy: number;
  calm: number;  // 1 = high stress, 5 = calm/low stress
  mood: number;
  focus: number;
};

// OLD schema (what you had before)
type OldPulse = {
  date: string;
  energy: number;
  stress: number; // 1..5 where higher likely meant "more stress"
  mood: number;
  focus: number;
};

const KEY_OLD = "pf_pulses";
const KEY_V2 = "pf_pulses_v2"; // use this going forward

export default function Today() {
  const today = new Date().toISOString().slice(0, 10);

  const [all, setAll] = useState<Pulse[]>([]);
  const [pulse, setPulse] = useState<Pulse>({
    date: today,
    energy: 3,
    calm: 3,
    mood: 3,
    focus: 3,
  });

  useEffect(() => {
    // 1) Try v2 first
    const v2 = load<any>(KEY_V2, null);
    if (Array.isArray(v2) && v2.length && "calm" in v2[0]) {
      setAll(v2 as Pulse[]);
      return;
    }

    // 2) Otherwise migrate old data (stress -> calm)
    const old = load<any>(KEY_OLD, []);
    if (Array.isArray(old) && old.length && "stress" in old[0]) {
      const migrated: Pulse[] = (old as OldPulse[]).map((p) => ({
        date: p.date,
        energy: typeof p.energy === "number" ? p.energy : 3,
        calm: typeof p.stress === "number" ? (6 - p.stress) : 3, // invert so 5 = better
        mood: typeof p.mood === "number" ? p.mood : 3,
        focus: typeof p.focus === "number" ? p.focus : 3,
      }));
      setAll(migrated);
      save(KEY_V2, migrated);
      return;
    }

    // 3) No data yet
    setAll([]);
  }, []);

  const submit = () => {
    const next = [pulse, ...all.filter((p) => p.date !== pulse.date)].slice(0, 30);
    setAll(next);
    save(KEY_V2, next);
    alert("Saved. Next: log a decision, then check the weekly plan.");
  };

  const setNum =
    (k: keyof Omit<Pulse, "date">) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setPulse((p) => ({ ...p, [k]: Number(e.target.value) }));

  const label5 = (n: number) => ["Very low", "Low", "Medium", "High", "Very high"][Math.max(1, Math.min(5, n)) - 1];

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h2 className="h2">Today</h2>
        <p className="p">
          Quick daily pulse. (Demo: stored in <code>localStorage</code>.)
        </p>

        <div className="grid" style={{ gap: 12, marginTop: 12 }}>
          <div>
            <div className="small">Energy (1–5) — higher is better</div>
            <input type="range" min={1} max={5} value={pulse.energy} onChange={setNum("energy")} />
            <div className="small">Value: {pulse.energy} — {label5(pulse.energy)}</div>
          </div>

          <div>
            <div className="small">Calm / Low Stress (1 = high stress, 5 = calm)</div>
            <input type="range" min={1} max={5} value={pulse.calm} onChange={setNum("calm")} />
            <div className="small">Value: {pulse.calm} — {label5(pulse.calm)}</div>
          </div>

          <div>
            <div className="small">Mood (1–5) — higher is better</div>
            <input type="range" min={1} max={5} value={pulse.mood} onChange={setNum("mood")} />
            <div className="small">Value: {pulse.mood} — {label5(pulse.mood)}</div>
          </div>

          <div>
            <div className="small">Focus (1–5) — higher is better</div>
            <input type="range" min={1} max={5} value={pulse.focus} onChange={setNum("focus")} />
            <div className="small">Value: {pulse.focus} — {label5(pulse.focus)}</div>
          </div>
        </div>

        <div className="row" style={{ marginTop: 14, gap: 10, flexWrap: "wrap" }}>
          <button className="btn btnPrimary" onClick={submit}>
            Save today’s pulse
          </button>

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
                <b>{p.date}</b> — E:{p.energy} Calm:{p.calm} M:{p.mood} F:{p.focus}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
