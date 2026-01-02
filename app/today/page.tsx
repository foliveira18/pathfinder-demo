"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { load, save } from "@/lib/storage";

// v2 schema: calm is "good" when higher
type Pulse = {
  date: string;
  energy: number;
  calm: number; // 1 = high stress, 5 = calm
  mood: number;
  focus: number;
};

// old schema: stress existed
type OldPulse = {
  date: string;
  energy: number;
  stress: number; // 1..5 where higher meant more stress
  mood: number;
  focus: number;
};

type CoachSuggestion = {
  title: string;
  bestMove: string;
  microSteps: [string, string];
  why: string;
  tags: string[];
};

const KEY_OLD = "pf_pulses";
const KEY_V2 = "pf_pulses_v2";

function clamp15(n: number) {
  return Math.max(1, Math.min(5, n));
}

function label5(n: number) {
  return ["Very low", "Low", "Medium", "High", "Very high"][clamp15(n) - 1];
}

function average(items: number[]) {
  if (!items.length) return 0;
  return items.reduce((a, b) => a + b, 0) / items.length;
}

function trendArrow(delta: number) {
  if (delta > 0.25) return "↑";
  if (delta < -0.25) return "↓";
  return "→";
}

function suggestFromPulse(p: Pulse, recent: Pulse[]): CoachSuggestion {
  // Look at last 7 (including today if present)
  const last7 = recent.slice(0, 7);
  const avgEnergy = average(last7.map(x => x.energy));
  const avgCalm = average(last7.map(x => x.calm));
  const avgMood = average(last7.map(x => x.mood));
  const avgFocus = average(last7.map(x => x.focus));

  // Compare today vs 7-day avg (tiny “coach” flavor)
  const dEnergy = p.energy - avgEnergy;
  const dCalm = p.calm - avgCalm;
  const dMood = p.mood - avgMood;
  const dFocus = p.focus - avgFocus;

  // Rule-based coach (fast, clear payoff)
  if (p.calm <= 2) {
    return {
      title: "Reset and lower load",
      bestMove: "Lower stress load: do one 10-minute reset.",
      microSteps: ["2 min breathing (box breathing)", "8 min walk or stretch"],
      why: `Calm is ${p.calm}/5 (low). Priority is recovery, not productivity.`,
      tags: ["recovery", "stress"],
    };
  }

  if (p.energy <= 2) {
    return {
      title: "Recover energy",
      bestMove: "Recover energy: protect your next 3 hours.",
      microSteps: ["Drink water + get daylight 3 min", "Pick one task only (15 min start)"],
      why: `Energy is ${p.energy}/5. Keep it gentle and reduce friction.`,
      tags: ["recovery", "energy"],
    };
  }

  if (p.focus >= 4 && p.energy >= 3 && p.calm >= 3) {
    return {
      title: "Deep work sprint",
      bestMove: "Use momentum: one focused 25-minute sprint.",
      microSteps: ["Write the next tiny step (30 sec)", "25 min deep work (timer)"],
      why: `Focus ${p.focus}/5 and calm ${p.calm}/5 look good — this is a “build” day.`,
      tags: ["focus", "execution"],
    };
  }

  if (p.mood <= 2) {
    return {
      title: "Lift mood gently",
      bestMove: "Lift mood: do a small positive connection.",
      microSteps: ["Send 1 message to someone", "5 min music + tidy one surface"],
      why: `Mood is ${p.mood}/5. Small wins + connection help most.`,
      tags: ["mood", "connection"],
    };
  }

  // Default: light structure + maintain momentum
  return {
    title: "Maintain momentum",
    bestMove: "Keep it simple: one small action that moves you forward.",
    microSteps: ["Pick 1 habit for today (2 min)", "Do 10 minutes of it now"],
    why: `Solid baseline. Energy ${p.energy}/5, calm ${p.calm}/5, focus ${p.focus}/5.`,
    tags: ["consistency"],
  };
}

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
  const [savedSuggestion, setSavedSuggestion] = useState<CoachSuggestion | null>(null);

  useEffect(() => {
    // 1) Load v2 if present
    const v2 = load<any>(KEY_V2, null);
    if (Array.isArray(v2) && v2.length && "calm" in v2[0]) {
      setAll(v2 as Pulse[]);
      // If there is an entry for today, prefill sliders + show suggestion
      const todayEntry = (v2 as Pulse[]).find(p => p.date === today);
      if (todayEntry) {
        setPulse(todayEntry);
        setSavedSuggestion(suggestFromPulse(todayEntry, v2 as Pulse[]));
      }
      return;
    }

    // 2) Otherwise migrate old stress->calm
    const old = load<any>(KEY_OLD, []);
    if (Array.isArray(old) && old.length && "stress" in old[0]) {
      const migrated: Pulse[] = (old as OldPulse[]).map((p) => ({
        date: p.date,
        energy: typeof p.energy === "number" ? p.energy : 3,
        calm: typeof p.stress === "number" ? (6 - p.stress) : 3, // invert
        mood: typeof p.mood === "number" ? p.mood : 3,
        focus: typeof p.focus === "number" ? p.focus : 3,
      }));
      setAll(migrated);
      save(KEY_V2, migrated);
      const todayEntry = migrated.find(p => p.date === today);
      if (todayEntry) {
        setPulse(todayEntry);
        setSavedSuggestion(suggestFromPulse(todayEntry, migrated));
      }
      return;
    }

    setAll([]);
  }, [today]);

  const setNum =
    (k: keyof Omit<Pulse, "date">) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setPulse((p) => ({ ...p, [k]: Number(e.target.value) }));

  const submit = () => {
    const next = [pulse, ...all.filter((p) => p.date !== pulse.date)].slice(0, 30);
    setAll(next);
    save(KEY_V2, next);

    const s = suggestFromPulse(pulse, next);
    setSavedSuggestion(s);
  };

  const last7 = useMemo(() => all.slice(0, 7), [all]);
  const weekStats = useMemo(() => {
    if (!last7.length) return null;
    const avgE = average(last7.map(p => p.energy));
    const avgC = average(last7.map(p => p.calm));
    const avgM = average(last7.map(p => p.mood));
    const avgF = average(last7.map(p => p.focus));
    return { avgE, avgC, avgM, avgF };
  }, [last7]);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h2 className="h2">Today</h2>
        <p className="p">
          30 seconds in. You get a suggested action immediately.
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
            Save & get suggestion
          </button>

          <Link className="btn btnPrimary" href="/habits?loop=1">
            Go to Habits →
          </Link>

          <Link className="btn" href="/weekly?loop=1">
            Weekly summary
          </Link>
        </div>
      </div>

      {/* Immediate payoff card */}
      {savedSuggestion && (
        <div className="card">
          <div className="badge">Today’s Best Move</div>
          <h3 className="h2" style={{ marginTop: 6 }}>{savedSuggestion.title}</h3>
          <p className="p" style={{ marginTop: 8 }}>
            <b>{savedSuggestion.bestMove}</b>
          </p>
          <div className="grid" style={{ gap: 8, marginTop: 10 }}>
            <div className="p"><b>1-minute plan:</b></div>
            <div className="p">1) {savedSuggestion.microSteps[0]}</div>
            <div className="p">2) {savedSuggestion.microSteps[1]}</div>
            <p className="small" style={{ marginTop: 10 }}>{savedSuggestion.why}</p>
          </div>
          <div className="row" style={{ marginTop: 12, gap: 10, flexWrap: "wrap" }}>
            <Link className="btn btnPrimary" href="/habits?loop=1">
              Turn this into a habit →
            </Link>
            <Link className="btn" href="/weekly?loop=1">
              See weekly summary
            </Link>
          </div>
        </div>
      )}

      {/* Small weekly hint (optional) */}
      {weekStats && (
        <div className="card">
          <h3 className="h2">Last 7 days (quick view)</h3>
          <p className="p" style={{ marginTop: 8 }}>
            Avg Energy: {weekStats.avgE.toFixed(1)} · Avg Calm: {weekStats.avgC.toFixed(1)} · Avg Mood: {weekStats.avgM.toFixed(1)} · Avg Focus: {weekStats.avgF.toFixed(1)}
          </p>
          <p className="small">
            This is what Weekly uses to propose your “best move.”
          </p>
        </div>
      )}
    </div>
  );
}
