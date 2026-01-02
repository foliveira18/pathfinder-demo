type DecisionInput = {
  title: string;
  domain: string;
  reversibility: string;
  confidence: number;
  assumption: string;
};

export function demoGuidance(d: DecisionInput) {
  const reversible = d.reversibility.toLowerCase().includes("easy") || d.reversibility.toLowerCase().includes("medium");
  const headline = reversible
    ? "Bias toward action: run a small test."
    : "Slow down: add a safeguard before committing.";

  const nextStep = d.assumption
    ? `Test your key assumption this week: "${d.assumption}". Define a 15–30 minute action that produces evidence.`
    : "Pick one assumption to test this week, and define a 15–30 minute action that produces evidence.";

  const guardrail = reversible
    ? "Set a time-box and a stop rule (what evidence would make you pause?)."
    : "Define a reversible pilot, add an exit plan, and pre-commit to criteria.";

  const note = `Domain: ${d.domain}. Confidence: ${d.confidence}/100.`;

  return { headline, nextStep, guardrail, note };
}
