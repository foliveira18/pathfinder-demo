"use client";
import { useEffect, useState } from "react";
import { load, save, uid } from "@/lib/storage";

type Habit = { id: string; title: string; due: string; status: "Planned" | "In progress" | "Done"; };
const KEY = "pf_habits";

export default function Habits() {
  const [items, setItems] = useState<Habit[]>([]);
  const [title, setTitle] = useState("10 minute walk");
  const [due, setDue] = useState(new Date(Date.now()+7*86400000).toISOString().slice(0,10));

  useEffect(()=> setItems(load<Habit[]>(KEY, [])), []);

  const add = () => {
    if (!title.trim()) return;
    const h: Habit = { id: uid("hab"), title, due, status: "Planned" };
    const next = [h, ...items];
    setItems(next);
    save(KEY, next);
  };

  const update = (id: string, status: Habit["status"]) => {
    const next = items.map(x => x.id === id ? { ...x, status } : x);
    setItems(next);
    save(KEY, next);
  };

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="badge">Habits</div>
        <h1 className="h1">Goals & habits</h1>
        <p className="p">Simple list with deadlines. (Later: probability shifts and personalized nudges.)</p>
      </div>

      <div className="card grid" style={{ gap: 10 }}>
        <div className="row">
          <div style={{ flex: 2, minWidth: 240 }}>
            <div className="label">Habit / goal</div>
            <input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="label">Target date</div>
            <input className="input" type="date" value={due} onChange={(e)=>setDue(e.target.value)} />
          </div>
          <div style={{ alignSelf: "end" }}>
            <button className="btn btnPrimary" onClick={add}>Add</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="h2">Your list</h2>
        <div className="grid" style={{ gap: 10 }}>
          {items.map((x) => (
            <div key={x.id} className="card" style={{ padding: 12, borderColor: "var(--line)" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <b>{x.title}</b>
                <span className="badge">{x.status}</span>
              </div>
              <p className="small">Due: {x.due}</p>
              <div className="row">
                {(["Planned","In progress","Done"] as const).map(s => (
                  <button key={s} className="btn" onClick={()=>update(x.id, s)}>{s}</button>
                ))}
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="p">No habits yet.</p>}
        </div>
      </div>
    </div>
  );
}
