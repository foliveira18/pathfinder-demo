"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { load, save } from "@/lib/storage";
import { useRouter } from "next/navigation";

// v2 schema: calm is "good" when higher
type Pulse = {
  date: string;
  energy: number;
  calm: number; // 1 = high stress, 5 = calm
  mood: number;
  focus: number;
};

// old schema (what you had before)
type OldPulse = {
  date: string;
  energy: number;
  stress: number; // 1..5 where higher meant "more stress"
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

/**
 * More varied suggestions (so habits won't always be a walk).
 * Still simple rule-based, but richer.
 */
function suggestFromPulse(p: Pulse, recent: Pulse[]): CoachSuggestion {
  const last7 = recent.slice(0, 7);

  const avgEnergy = average(last7.map((x) => x.energy));
  const avgCalm = average(last7.map((x) => x.calm));
  const avgMood = average(last7.map((x) => x.mood));
  const avgFocus = average(last7.map((x) => x.focus));

  // 1) Very low calm (high stress): recovery first
  if (p.calm <= 2) {
    return {
      title: "Reset and lower load",
      bestMove: "Lower stress load: do a 10-minute reset now.",
      microSteps: ["2 min breathing (box breathing)", "8 min stretch OR slow walk"],
      why: `Calm is ${p.calm}/5 (low). Your best ROI is calming the body first.`,
      tags: ["recovery", "stress"],
    };
  }

  // 2) Low energy: protect + gentle start
  if (p.energy <= 2) {
    return {
      title: "Recover energy",
      bestMove: "Recover energy: protect your next 3 hours (less, not more).",
      microSteps: ["Water + daylight (3 min)", "One tiny task start (10 min)"],
      why: `Energy is ${p.energy}/5. Keep the next step small and kind.`,
      tags: ["recovery", "energy"],
    };
  }

  // 3) High focus + good calm: deep work day
  if (p.focus >= 4 && p.energy >= 3 && p.calm >= 3) {
    return {
      title: "Deep work sprint",
      bestMove: "Use momentum: one focused sprint on the highest-value task.",
      microSteps: ["Write the next tiny step (30 sec)", "25 min deep work (timer)"],
      why: `Focus ${p.focus}/5 and calm ${p.calm}/5 are good — a sprint will compound.`,
      tags: ["focus", "execution"],
    };
  }

  // 4) Low mood: connection + small win
  if (p.mood <= 2) {
    return {
      title: "Lift mood gently",
      bestMove: "Lift mood: do one small connection + one small win.",
      microSteps: ["Send 1 message to someone", "Tidy one surface (5 min)"],
      why: `Mood is ${p.mood}/5. Connection and small wins tend to help fastest.`,
      tags: ["mood", "connection"],
    };
  }

  // 5) Medium everything: structure without overload
  if (p.energy === 3 && p.calm === 3 && p.mood === 3 && p.focus === 3) {
    return {
      title: "Light structure",
      bestMove: "Create light structure: choose ONE priority and make it easy.",
      microSteps: ["Pick 1 priority (30 sec)", "Do 10 minutes of it now"],
      why: "You’re in the middle. A tiny start beats planning.",
      tags: ["consistency"],
    };
  }

  // Default: maintain
  return {
    title: "Maintain momentum",
    bestMove: "Keep it simple: one small action that moves you forward.",
    microSteps: ["Pick 1 habit for today (2 min)", "Do 10 minutes of it now"],
    why: `Baseline looks OK. Energy ${p.energy}/5, calm ${p.calm}/5, focus ${p.focus}/5.`,
    tags: ["consistency"],
  };
}

function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function addDays(baseYYYYMMDD: string, days: number) {
  const d = new Date(baseYYYYMMDD + "T00:00:00");
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

export default function Today() {
  const router = useRouter();
  const today = isoDate();

  const [all, setAll] = useState<Pulse[]>([]);
  const [pulse, setPulse] = useState<Pulse>({
    date: today,
    energy: 3,
    calm: 3,
    mood: 3,
    focus: 3,
  });

  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const v2 = load<any>(KEY_V2, null);
    if (Array.isArray(v2) && v2.length && "calm" in v2[0]) {
      const arr = v2 as Pulse[];
      setAll(arr);
      const todayEntry = arr.find((p) => p.date === today);
      if (todayEntry) setPulse(todayEntry);
      return;
    }

    const old = load<any>(KEY_OLD, []);
    if (Array.isArray(old) && old.length && "stress" in old[0]) {
      const migrated: Pulse[] = (old as OldPulse[]).map((p) => ({
        date: p.date,
        energy: typeof p.energy === "number" ? p.energy : 3,
        calm: typeof p.stress === "number" ? 6 - p.stress : 3,
        mood: typeof p.mood === "number" ? p.mood : 3,
        focus: typeof p.focus === "number" ? p.focus : 3,
      }));
      setAll(migrated);
      save(KEY_V2, migrated);
      const todayEntry = migrated.find((p) => p.date === today);
      if (todayEntry) setPulse(todayEntry);
      return;
    }

    setAll([]);
  }, [today]);

  const setNum =
    (k: keyof Omit<Pulse, "date">) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setPulse((p) => ({ ...p, [k]: Number(e.target.value) }));

  // ✅ LIVE suggestion as sliders move
  const liveSuggestion = useMemo(() => {
    const next = [pulse, ...all.filter((p) => p.date !== pulse.date)].slice(0, 30);
    return suggestFromPulse(pulse, next);
  }, [pulse, all]);

  const submit = () => {
    const next = [pulse, ...all.filter((p) => p.date !== pulse.date)].slice(0, 30);
    setAll(next);
    save(KEY_V2, next);
    setSavedAt(Date.now());
  };

  /**
   * ✅ One-click: send ANY chosen suggestion text to Habits
   * with a due date and a unique sid so Habits doesn't treat it as a duplicate.
   */
  const pushHabit = (text: string, dueYYYYMMDD: string) => {
    const sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const url =
      `/habits?seed=${encodeURIComponent(text)}` +
      `&due=${encodeURIComponent(dueYYYYMMDD)}` +
      `&sid=${encodeURIComponent(sid)}`;
    router.push(url);
  };

  const dueTomorrow = addDays(today, 1);
  const dueIn3Days = addDays(today, 3);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h2 className="h2">Today</h2>
        <p className="p">Move the sliders. The suggestion updates live.</p>

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
          <button className="btn btnPrimary" onClick={submit}>Save</button>
          <Link className="btn" href="/weekly?loop=1">Weekly summary</Link>
          <Link className="btn" href="/habits?loop=1">View habits</Link>
        </div>

        {savedAt && (
          <p className="small" style={{ marginTop: 10 }}>Saved ✅</p>
        )}
      </div>

      {/* LIVE suggestion card */}
      <div className="card">
        <div className="badge">Today’s Best Move (live)</div>
        <h3 className="h2" style={{ marginTop: 6 }}>{liveSuggestion.title}</h3>
        <p className="p" style={{ marginTop: 8 }}>
          <b>{liveSuggestion.bestMove}</b>
        </p>

        <div className="grid" style={{ gap: 8, marginTop: 10 }}>
          <div className="p"><b>1-minute plan:</b></div>
          <div className="p">1) {liveSuggestion.microSteps[0]}</div>
          <div className="p">2) {liveSuggestion.microSteps[1]}</div>
          <p className="small" style={{ marginTop: 10 }}>{liveSuggestion.why}</p>
        </div>

        {/* ✅ Three different habit actions (so you can add different ones) */}
        <div className="row" style={{ marginTop: 12, gap: 10, flexWrap: "wrap" }}>
          <button
            className="btn btnPrimary"
            onClick={() => pushHabit(liveSuggestion.bestMove, dueTomorrow)}
          >
            Add “Best Move” as habit (due tomorrow)
          </button>

          <button
            className="btn"
            onClick={() => pushHabit(liveSuggestion.microSteps[0], dueTomorrow)}
          >
            Add micro-step #1 (due tomorrow)
          </button>

          <button
            className="btn"
            onClick={() => pushHabit(liveSuggestion.microSteps[1], dueIn3Days)}
          >
            Add micro-step #2 (due in 3 days)
          </button>
        </div>

        <p className="small" style={{ marginTop: 10 }}>
          Tip: micro-step #1 is usually the easiest to execute today.
        </p>
      </div>
    </div>
  );
}
