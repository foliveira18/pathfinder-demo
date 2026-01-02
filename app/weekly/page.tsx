"use client";
import { useEffect, useMemo, useState } from "react";
import { load, save } from "@/lib/storage";

type Weekly = {
  weekISO: string;
  focusDomain: string;
  bestMove: string;
  microHabits: string[];
  affirmations: string[];
};

const KEY = "pf_weekly";

function currentWeekISO() {
  const d = new Date();
  const onejan = new Date(d.getFullYear(),0,1);
  const week = Math.ceil((((d.getTime()-onejan.getTime())/86400000)+onejan.getDay()+1)/7);
  return `${d.getFullYear()}-W${String(week).padStart(2,"0")}`;
}

export default function Weekly() {
  const weekISO = currentWeekISO();
  const [saved, setSaved] = useState<Weekly[]>([]);
  const [focusDomain, setFocusDomain] = useState("Career/Meaning");
  const [bestMove, setBestMove] = useState("Send one message that moves my most important goal forward.");
  const [habits, setHabits] = useState("15 minutes focused work\n10 minute walk\nOne reconnection message");
  const [affirm, setAffirm] = useState("I take small actions daily.\nI choose progress over perfection.");

  useEffect(() => setSaved(load<Weekly[]>(KEY, [])), []);

  const savePlan = () => {
    const item: Weekly = {
      weekISO,
      focusDomain,
      bestMove,
      microHabits: habits.split("\n").map(s=>s.trim()).filter(Boolean),
      affirmations: affirm.split("\n").map(s=>s.trim()).filter(Boolean),
    };
    const next = [item, ...saved.filter(x=>x.weekISO !== weekISO)].slice(0, 12);
    setSaved(next);
    save(KEY, next);
    alert("Weekly plan saved.");
  };

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="badge">Weekly ritual</div>
        <h1 className="h1">Weekly opportunity plan</h1>
        <p className="p">Pick a domain. Define one best move. Add micro-habits and affirmations.</p>
      </div>

      <div className="card grid" style={{ gap: 10 }}>
        <div>
          <div className="label">Week</div>
          <div><b>{weekISO}</b></div>
        </div>
        <div>
          <div className="label">Focus domain</div>
          <select className="select" value={focusDomain} onChange={(e)=>setFocusDomain(e.target.value)}>
            <option>Health/Energy</option>
            <option>Money/Security</option>
            <option>Relationships/Connection</option>
            <option>Career/Meaning</option>
          </select>
        </div>
        <div>
          <div className="label">One best move (this week)</div>
          <input className="input" value={bestMove} onChange={(e)=>setBestMove(e.target.value)} />
        </div>
        <div className="row">
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="label">Micro-habits (one per line)</div>
            <textarea className="textarea" value={habits} onChange={(e)=>setHabits(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="label">Affirmations (one per line)</div>
            <textarea className="textarea" value={affirm} onChange={(e)=>setAffirm(e.target.value)} />
          </div>
        </div>
        <button className="btn btnPrimary" onClick={savePlan}>Save weekly plan</button>
      </div>

      <div className="card">
        <h2 className="h2">Recent plans</h2>
        <div className="grid" style={{ gap: 10 }}>
          {saved.slice(0,3).map((x) => (
            <div key={x.weekISO} className="card" style={{ padding: 12, borderColor: "var(--line)" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <b>{x.weekISO}</b><span className="badge">{x.focusDomain}</span>
              </div>
              <p className="p" style={{ marginTop: 6 }}><b>Best move:</b> {x.bestMove}</p>
              <p className="small"><b>Habits:</b> {x.microHabits.join(" · ")}</p>
              <p className="small"><b>Affirmations:</b> {x.affirmations.join(" · ")}</p>
            </div>
          ))}
          {saved.length === 0 && <p className="p">No plans saved yet.</p>}
        </div>
      </div>
    </div>
  );
}
