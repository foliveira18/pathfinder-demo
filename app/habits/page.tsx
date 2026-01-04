"use client";

import { useEffect, useMemo, useState } from "react";
import { load, save } from "@/lib/storage";
import { useSearchParams } from "next/navigation";

type Habit = {
  id: string;
  text: string;
  due: string;
  createdAt: string;
  doneDates: string[];
  sourceId?: string;
};

const KEY = "pf_habits_v2";

function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
function addDays(date: string, days: number) {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + days);
  return isoDate(d);
}
function daysLeft(due: string) {
  const now = new Date(isoDate() + "T00:00:00").getTime();
  const dd = new Date(due + "T00:00:00").getTime();
  return Math.round((dd - now) / (1000 * 60 * 60 * 24));
}

export default function HabitsPage() {
  const params = useSearchParams();
  const seed = params.get("seed");
  const seedDue = params.get("due");
  const sid = params.get("sid");

  const [habits, setHabits] = useState<Habit[]>([]);
  const [text, setText] = useState("");
  const [due, setDue] = useState(addDays(isoDate(), 3));

  useEffect(() => {
    setHabits(load<Habit[]>(KEY, []));
  }, []);

  // ✅ Add habit whenever seed/due/sid changes (NOT only first mount)
  useEffect(() => {
    if (!seed || !seed.trim()) return;

    const dueValue =
      seedDue && seedDue.length === 10 ? seedDue : addDays(isoDate(), 1);

    setHabits((prev) => {
      const existing = prev.length ? prev : load<Habit[]>(KEY, []);

      if (sid && existing.some((h) => h.sourceId === sid)) return existing;
      if (!sid && existing.some((h) => h.text === seed.trim() && h.due === dueValue)) return existing;

      const newHabit: Habit = {
        id: crypto.randomUUID(),
        text: seed.trim(),
        due: dueValue,
        createdAt: new Date().toISOString(),
        doneDates: [],
        sourceId: sid || undefined,
      };

      const next = [newHabit, ...existing];
      save(KEY, next);
      return next;
    });
  }, [seed, seedDue, sid]);

  function persist(next: Habit[]) {
    setHabits(next);
    save(KEY, next);
  }

  const upcoming = useMemo(() => {
    return [...habits].sort((a, b) => a.due.localeCompare(b.due));
  }, [habits]);

  function addHabit() {
    const t = text.trim();
    if (!t) return;

    const h: Habit = {
      id: crypto.randomUUID(),
      text: t,
      due,
      createdAt: new Date().toISOString(),
      doneDates: [],
    };

    persist([h, ...habits]);
    setText("");
    setDue(addDays(isoDate(), 3));
  }

  function toggleDone(id: string) {
    const today = isoDate();
    const next = habits.map((h) => {
      if (h.id !== id) return h;
      const done = h.doneDates.includes(today);
      return { ...h, doneDates: done ? h.doneDates.filter((d) => d !== today) : [today, ...h.doneDates] };
    });
    persist(next);
  }

  function removeHabit(id: string) {
    persist(habits.filter((h) => h.id !== id));
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h2 className="h2">Habits (execution engine)</h2>
        <p className="p">Turn suggestions into small commitments with deadlines.</p>

        <div className="row" style={{ marginTop: 12, gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="New habit (e.g., 10-minute reset)"
            style={{ minWidth: 320 }}
          />
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          <button className="btn btnPrimary" onClick={addHabit}>Add</button>
        </div>
      </div>

      <div className="card">
        <h3 className="h2">Your habits</h3>

        {upcoming.length === 0 ? (
          <p className="p">No habits yet.</p>
        ) : (
          <div className="grid" style={{ gap: 10 }}>
            {upcoming.map((h) => {
              const left = daysLeft(h.due);
              const doneToday = h.doneDates.includes(isoDate());
              return (
                <div key={h.id} className="card" style={{ padding: 14 }}>
                  <div className="row" style={{ justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{h.text}</div>
                      <div className="small">
                        Due: <b>{h.due}</b>{" "}
                        <span style={{ opacity: 0.8 }}>
                          ({left >= 0 ? `${left} day(s) left` : `${Math.abs(left)} day(s) overdue`})
                        </span>
                      </div>
                    </div>

                    <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                      <button className="btn btnPrimary" onClick={() => toggleDone(h.id)}>
                        {doneToday ? "Undo today" : "Done today"}
                      </button>
                      <button className="btn" onClick={() => removeHabit(h.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
