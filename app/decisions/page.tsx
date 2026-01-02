"use client";
import { useEffect, useState } from "react";
import { load, save, uid } from "@/lib/storage";
import { demoGuidance } from "@/lib/demo_ai";

type Decision = {
  id: string;
  createdAt: string;
  title: string;
  domain: string;
  reversibility: string;
  confidence: number;
  assumption: string;
  options: string;
  guidance?: { headline: string; nextStep: string; guardrail: string; note: string; };
};

const KEY = "pf_decisions";

export default function Decisions() {
  const [items, setItems] = useState<Decision[]>([]);
  const [d, setD] = useState<Omit<Decision,"id"|"createdAt">>({
    title: "",
    domain: "Career/Meaning",
    reversibility: "Easy",
    confidence: 60,
    assumption: "",
    options: "Option A\nOption B\nOption C",
  });

  useEffect(() => setItems(load<Decision[]>(KEY, [])), []);

  const add = () => {
    if (!d.title.trim()) return alert("Add a decision title.");
    const guidance = demoGuidance({
      title: d.title,
      domain: d.domain,
      reversibility: d.reversibility,
      confidence: d.confidence,
      assumption: d.assumption,
    });
    const item: Decision = { id: uid("dec"), createdAt: new Date().toISOString(), ...d, guidance };
    const next = [item, ...items];
    setItems(next);
    save(KEY, next);
  };

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="badge">Decision journal</div>
        <h1 className="h1">Decisions</h1>
        <p className="p">2 minutes. Turn confusion into a next step.</p>
      </div>

      <div className="card grid" style={{ gap: 10 }}>
        <div>
          <div className="label">Decision title</div>
          <input className="input" value={d.title} onChange={(e)=>setD({...d,title:e.target.value})} />
        </div>
        <div className="row">
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="label">Domain</div>
            <select className="select" value={d.domain} onChange={(e)=>setD({...d,domain:e.target.value})}>
              <option>Health/Energy</option>
              <option>Money/Security</option>
              <option>Relationships/Connection</option>
              <option>Career/Meaning</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="label">Reversibility</div>
            <select className="select" value={d.reversibility} onChange={(e)=>setD({...d,reversibility:e.target.value})}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="label">Confidence (0–100)</div>
            <input className="input" type="number" min={0} max={100} value={d.confidence} onChange={(e)=>setD({...d,confidence:Number(e.target.value)})} />
          </div>
          <div style={{ flex: 2, minWidth: 260 }}>
            <div className="label">Key assumption to test this week</div>
            <input className="input" value={d.assumption} onChange={(e)=>setD({...d,assumption:e.target.value})} />
          </div>
        </div>
        <div>
          <div className="label">Options (one per line)</div>
          <textarea className="textarea" value={d.options} onChange={(e)=>setD({...d,options:e.target.value})} />
        </div>
        <button className="btn btnPrimary" onClick={add}>Generate guidance (demo)</button>
      </div>

      <div className="card">
        <h2 className="h2">Recent decisions</h2>
        <div className="grid" style={{ gap: 10 }}>
          {items.slice(0,5).map((x) => (
            <div key={x.id} className="card" style={{ padding: 12, borderColor: "var(--line)" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <b>{x.title}</b><span className="badge">{x.domain}</span>
              </div>
              {x.guidance && (
                <>
                  <p className="p" style={{ marginTop: 6 }}><b>{x.guidance.headline}</b></p>
                  <p className="p">{x.guidance.nextStep}</p>
                  <p className="p">{x.guidance.guardrail}</p>
                  <p className="small">{x.guidance.note}</p>
                </>
              )}
            </div>
          ))}
          {items.length === 0 && <p className="p">No decisions yet.</p>}
        </div>
      </div>
    </div>
  );
}
