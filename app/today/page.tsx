"use client";
import { useEffect, useState } from "react";
import { load, save } from "@/lib/storage";

type Pulse = { date: string; energy: number; stress: number; mood: number; focus: number; note: string; };
const KEY = "pf_pulses";

export default function Today() {
  const today = new Date().toISOString().slice(0,10);
  const [all, setAll] = useState<Pulse[]>([]);
  const [pulse, setPulse] = useState<Pulse>({ date: today, energy: 3, stress: 3, mood: 3, focus: 3, note: "" });

  useEffect(() => { setAll(load<Pulse[]>(KEY, [])); }, []);

  const submit = () => {
    const next = [pulse, ...all.filter(p => p.date !== pulse.date)].slice(0, 30);
    setAll(next);
    save(KEY, next);
    alert("Saved. Weekly plan will reflect this trend later.");
  };

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="badge">Daily pulse</div>
        <h1 className="h1">Today</h1>
        <p className="p">30 seconds. Capture state. No judgement.</p>
      </div>

      <div className="card grid" style={{ gap: 10 }}>
        {(["energy","stress","mood","focus"] as const).map((k) => (
          <div key={k}>
            <div className="label">{k.toUpperCase()} (1–5)</div>
            <input className="input" type="number" min={1} max={5}
              value={pulse[k]}
              onChange={(e) => setPulse({ ...pulse, [k]: Number(e.target.value) })}
            />
          </div>
        ))}
        <div>
          <div className="label">Note (optional)</div>
          <textarea className="textarea" value={pulse.note} onChange={(e) => setPulse({ ...pulse, note: e.target.value })} />
        </div>
        <button className="btn btnPrimary" onClick={submit}>Save pulse</button>
      </div>

      <div className="card">
        <h2 className="h2">Last entries</h2>
        <div className="grid" style={{ gap: 8 }}>
          {all.slice(0,5).map((p) => (
            <div key={p.date} className="p">
              <b>{p.date}</b> — E{p.energy} S{p.stress} M{p.mood} F{p.focus} {p.note ? `· ${p.note}` : ""}
            </div>
          ))}
          {all.length === 0 && <p className="p">No entries yet.</p>}
        </div>
      </div>
    </div>
  );
}
