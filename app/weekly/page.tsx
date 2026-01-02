"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { load, save } from "@/lib/storage";

type Pulse = {
  date: string;
  energy: number;
  calm: number;
  mood: number;
  focus: number;
};

type WeeklyAutoPlan = {
  weekStart: string;
  createdAt: string;
  summary: {
    avgEnergy: number;
    avgCalm: number;
    avgMood: number;
    avgFocus: number;
    countDays: number;
  };
  suggestedBestMove: string;
  suggestedHabits: string[];
  confirmed: boolean;
};

const PULSES_KEY = "pf_pulses_v2";
const WEEKLY_KEY = "pf_weekly_v2";

function mondayOfThisWeek(): string {
  const d = new Date();
  const day = d.getDay(); // 0 Sun ... 1 Mon
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function suggestWeeklyBestMove(stats: { avgEnergy: number; avgCalm: number; avgMood: number; avgFocus: number }) {
  const { avgEnergy, avgCalm, avgMood, avgFocus } = stats;

  if (avgCalm <= 2.6) return "Reduce load: one daily 10-minute reset + protect sleep.";
  if (avgEnergy <= 2.6) return "Recover energy: simplify commitments + daily daylight + earlier bedtime.";
  if (avgFocus >= 3.7 && avgCalm >= 3.0) return "Build week: schedule 3 focused sprints (25 min) on your highest-value task.";
  if (avgMood <= 2.6) return "Mood lift: add 2 connection moments + one fun micro-activity midweek.";
  return "Consistency week: keep habits small and show up daily.";
}

function proposeHabits(stats: { avgEnergy: number; avgCalm: number; avgMood: number; avgFocus: number }) {
  const { avgEnergy, avgCalm, avgMood, avgFocus } = stats;

  const habits: string[] = [];

  // Calm/stress oriented
  if (avgCalm <= 3.0) habits.push("10-minute reset daily (breathing + stretch/walk)");
  else habits.push("5-minute decompression after work (no phone)");

  // Energy oriented
  if (avgEnergy <= 3.0) habits.push("Daylight + water within 30 minutes of waking");
  else habits.push("15-minute movement (walk) after lunch");

  // Focus or mood
  if (avgFocus >= 3.4) habits.push("One 25-minute deep work sprint (timer)");
  else if (avgMood <= 3.0) habits.push("1 small connection message daily");
  else habits.push("2-minute plan for tomorrow (evening)");

  return habits.slice(0, 3);
}

export default function WeeklyPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [habits, setHabits] = useState<string[]>([]);
  const [savedPlan, setSavedPlan] = useState<WeeklyAutoPlan | null>(null);

  const pulses = useMemo(() => load<Pulse[]>(PULSES_KEY, []).slice(0, 7), []);
  const stats = useMemo(() => {
    const s = {
      avgEnergy: avg(pulses.map(p => p.energy)),
      avgCalm: avg(pulses.map(p => p.calm)),
      avgMood: avg(pulses.map(p => p.mood)),
      avgFocus: avg(pulses.map(p => p.focus)),
      countDays: pulses.length,
    };
    return s;
  }, [pulses]);

  const bestMove = useMemo(() => suggestWeeklyBestMove(stats), [stats]);
  const defaultHabits = useMemo(() => proposeHabits(stats), [stats]);

  useEffect(() => {
    setHabits(defaultHabits);

    const existing = load<WeeklyAutoPlan | null>(WEEKLY_KEY, null);
    if (existing && existing.weekStart === mondayOfThisWeek()) {
      setSavedPlan(existing);
      setConfirmed(existing.confirmed);
      setHabits(existing.suggestedHabits || defaultHabits);
    }
  }, [defaultHabits]);

  const confirm = () => {
    const plan: WeeklyAutoPlan = {
      weekStart: mondayOfThisWeek(),
      createdAt: new Date().toISOString(),
      summary: stats,
      suggestedBestMove: bestMove,
      suggestedHabits: habits,
      confirmed: true,
    };
    save(WEEKLY_KEY, plan);
    setSavedPlan(plan);
    setConfirmed(true);
    alert("Weekly plan saved. Next: run it through Habits.");
  };

  const updateHabit = (idx: number, value: string) => {
    setHabits(prev => prev.map((h, i) => (i === idx ? value : h)));
  };

  const addHabit = () => setHabits(prev => [...prev, ""]);
  const removeHabit = (idx: number) => setHabits(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h2 className="h2">Weekly (automatic)</h2>
        <p className="p">
          No long form. This is generated from your last 7 “Today” pulses.
        </p>

        <div className="grid" style={{ gap: 8, marginTop: 12 }}>
          <div className="p">
            <b>Last 7 days summary:</b> {stats.countDays} day(s)
          </div>
          <div className="p">
            Avg Energy: <b>{stats.avgEnergy.toFixed(1)}</b> · Avg Calm: <b>{stats.avgCalm.toFixed(1)}</b> · Avg Mood: <b>{stats.avgMood.toFixed(1)}</b> · Avg Focus: <b>{stats.avgFocus.toFixed(1)}</b>
          </div>
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <div className="badge">Suggested weekly best move</div>
          <p className="p" style={{ marginTop: 8 }}>
            <b>{bestMove}</b>
          </p>

          <div style={{ marginTop: 10 }}>
            <div className="p"><b>Proposed habits (editable):</b></div>

            <div className="grid" style={{ gap: 10, marginTop: 8 }}>
              {habits.map((h, idx) => (
                <div key={idx} className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                  <input
                    value={h}
                    onChange={(e) => updateHabit(idx, e.target.value)}
                    placeholder={`Habit ${idx + 1}`}
                    style={{ minWidth: 280 }}
                  />
                  <button className="btn" type="button" onClick={() => removeHabit(idx)}>
                    Remove
                  </button>
                </div>
              ))}
              <button className="btn" type="button" onClick={addHabit}>
                + Add habit
              </button>
            </div>
          </div>

          <div className="row" style={{ marginTop: 14, gap: 10, flexWrap: "wrap" }}>
            <button className="btn btnPrimary" onClick={confirm}>
              Confirm weekly plan (1 click)
            </button>

            <Link className="btn btnPrimary" href="/habits?loop=1">
              Go to Habits →
            </Link>

            <Link className="btn" href="/today?loop=1">
              Back to Today
            </Link>
          </div>

          {confirmed && savedPlan && (
            <p className="small" style={{ marginTop: 12 }}>
              Saved for week starting <b>{savedPlan.weekStart}</b>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
