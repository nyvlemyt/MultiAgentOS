// Phase 4.5-receptacle scoring & capacity arithmetic.
// DETERMINISTIC ONLY — no LLM, no @mas/core, no router. Pure functions.

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));

export interface ScoreInputs {
  impact: number;
  urgency: number;
  effortEst: number;
  riskScore: number;
}

/**
 * ROADMAP formula: impact*.35 + urgency*.30 + (100-effort)*.20 + (100-risk)*.15.
 * Inputs are 0–100 sliders; out-of-range values are clamped first. Result 0–100.
 */
export function priorityScore({ impact, urgency, effortEst, riskScore }: ScoreInputs): number {
  const i = clamp(impact);
  const u = clamp(urgency);
  const e = clamp(effortEst);
  const r = clamp(riskScore);
  const raw = i * 0.35 + u * 0.3 + (100 - e) * 0.2 + (100 - r) * 0.15;
  return clamp(Math.round(raw));
}

export interface CapacityInputs {
  monthlyCapCents: number;
  spentCents: number;
  /** Rolling 30-day average cost per mission, in cents. */
  avgMissionCostCents: number;
}

export interface CapacityResult {
  missionsRemaining: number;
  label: string;
}

/** (cap - spent) / avgMissionCost → ~N missions. "< 1 mission" floor, "—" when no history. */
export function remainingCapacity({ monthlyCapCents, spentCents, avgMissionCostCents }: CapacityInputs): CapacityResult {
  if (avgMissionCostCents <= 0) return { missionsRemaining: 0, label: '—' };
  const remaining = Math.max(0, monthlyCapCents - spentCents);
  const raw = remaining / avgMissionCostCents;
  if (raw >= 1) {
    const n = Math.floor(raw);
    return { missionsRemaining: n, label: `~${n} mission${n === 1 ? '' : 's'}` };
  }
  if (raw > 0) return { missionsRemaining: 0, label: '< 1 mission' };
  return { missionsRemaining: 0, label: '0 missions' };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** True when a non-null deadline falls within `days` (default 7) of `now`. */
export function isDeadlineSoon(deadline: Date | null, now: Date = new Date(), days = 7): boolean {
  if (!deadline) return false;
  return deadline.getTime() < now.getTime() + days * DAY_MS;
}

export interface UnrealisticInputs {
  deadline: Date | null;
  createdAt: Date;
  spentTokens: number;
  /** Tokens consumed per 30-day month (burn rate). */
  monthlyTokenRate: number;
}

/**
 * Arithmetic-only realism check (ROADMAP §Deadlines): projected finish =
 * createdAt + (spentTokens / monthlyRate) * 30d. If the deadline lands before
 * that projection, the plan is flagged unrealistic. No LLM.
 */
export function isDeadlineUnrealistic({ deadline, createdAt, spentTokens, monthlyTokenRate }: UnrealisticInputs): boolean {
  if (!deadline || monthlyTokenRate <= 0) return false;
  const projectedMs = createdAt.getTime() + (spentTokens / monthlyTokenRate) * 30 * DAY_MS;
  return deadline.getTime() < projectedMs;
}

/** Mean cost per mission in cents from a list of per-mission cents. 0 when empty. */
export function avgMissionCostCents(costs: number[]): number {
  if (costs.length === 0) return 0;
  return costs.reduce((a, b) => a + b, 0) / costs.length;
}
