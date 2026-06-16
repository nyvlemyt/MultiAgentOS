import { allAgents, skillRows } from './fixtures';

// Pure (client-safe) Agent Control Panel rules: no DB import. The DB-backed
// getAgentConfig/saveAgentConfig live in agent-config.ts and re-export this file.

export type Autonomy = 'manual' | 'assisted' | 'autonomous' | 'autopilot';
export type EffortMode = 'eco' | 'standard' | 'expert';

export interface AgentConfig {
  agentId: string;
  name: string;
  tier: 'A' | 'B';
  model: string;
  autonomy: Autonomy;
  budgetCap: number;
  effortMode: EffortMode;
  enabledSkills: string[] | null; // null = no allowlist set → fall back to catalogue defaults
}

export interface AgentConfigPatch {
  model?: string | null;
  autonomy?: Autonomy | null;
  budgetCap?: number | null;
  effortMode?: EffortMode | null;
  enabledSkills?: string[] | null;
}

export const DEFAULT_AUTONOMY: Autonomy = 'manual';
export const DEFAULT_EFFORT: EffortMode = 'eco';
export const DEFAULT_BUDGET_CAP = 20000;
export const DEFAULT_MODEL = 'claude-haiku-4-5';

interface AgentDefaults {
  name: string;
  tier: 'A' | 'B';
  model: string;
}

export function fixtureDefaults(agentId: string): AgentDefaults {
  const found = allAgents.find((a) => a.id === agentId);
  return {
    name: found?.name ?? agentId,
    tier: found?.tier ?? 'B',
    model: found?.model ?? DEFAULT_MODEL,
  };
}

// §5 habit: raising autonomy to autonomous/autopilot, or raising the budget cap,
// requires a human confirm in the UI before the action fires. Lowers and moves
// into manual/assisted save directly.
const AUTONOMY_RANK: Record<Autonomy, number> = { manual: 0, assisted: 1, autonomous: 2, autopilot: 3 };

export function autonomyRaiseNeedsConfirm(prev: Autonomy, next: Autonomy): boolean {
  const gated = next === 'autonomous' || next === 'autopilot';
  return gated && AUTONOMY_RANK[next] > AUTONOMY_RANK[prev];
}

export function budgetRaiseNeedsConfirm(prev: number, next: number): boolean {
  return next > prev;
}

export interface SkillToggle {
  id: string;
  tags: string[];
  enabled: boolean;
}

interface SkillCatalogueRow {
  id: string;
  tags: string[];
  usedBy: string[];
}

export function agentSkills(
  agentId: string,
  enabledSkills: string[] | null,
  catalogue: SkillCatalogueRow[] = skillRows,
): SkillToggle[] {
  const allow = enabledSkills ? new Set(enabledSkills) : null;
  return catalogue.map((s) => ({
    id: s.id,
    tags: s.tags,
    enabled: allow ? allow.has(s.id) : s.usedBy.includes(agentId),
  }));
}
