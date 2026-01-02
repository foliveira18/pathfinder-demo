import Link from "next/link";

export function Nav() {
  return (
    <div className="nav">
      <Link href="/">Home</Link>
      <Link href="/today">Today</Link>
      <Link href="/decisions">Decisions</Link>
      <Link href="/weekly">Weekly</Link>
      <Link href="/habits">Habits</Link>
    </div>
  );
}
