import { Suspense } from "react";
import HabitsClient from "./HabitsClient";

export default function HabitsPage() {
  return (
    <Suspense fallback={<div className="card"><p className="p">Loading habits…</p></div>}>
      <HabitsClient />
    </Suspense>
  );
}
