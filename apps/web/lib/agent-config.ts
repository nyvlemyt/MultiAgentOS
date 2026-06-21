import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { getDb, agentOverrides } from '@mas/db';
import {
  fixtureDefaults,
  DEFAULT_AUTONOMY,
  DEFAULT_EFFORT,
  DEFAULT_BUDGET_CAP,
  type AgentConfig,
  type AgentConfigPatch,
  type Autonomy,
  type EffortMode,
} from './agent-config-rules';

// DB-backed Agent Control Panel config layer. getAgentConfig merges the agent's
// fixture defaults with the DB override row (override wins field-by-field). The
// fiche on disk is never read or written here (that is agent-fiche.ts). Pure rules
// (merge precedence is exercised here; confirm gating + skills) live in
// agent-config-rules.ts and are re-exported below for client + test use.
export * from './agent-config-rules';

type Db = ReturnType<typeof getDb>;

export async function getAgentConfig(db: Db, agentId: string, projectId: string): Promise<AgentConfig> {
  const base = fixtureDefaults(agentId);
  const [row] = await db
    .select()
    .from(agentOverrides)
    .where(and(eq(agentOverrides.agentId, agentId), eq(agentOverrides.projectId, projectId)));
  return {
    agentId,
    name: base.name,
    tier: base.tier,
    model: row?.model ?? base.model,
    autonomy: (row?.autonomy as Autonomy | null) ?? DEFAULT_AUTONOMY,
    budgetCap: row?.budgetCap ?? DEFAULT_BUDGET_CAP,
    effortMode: (row?.effortMode as EffortMode | null) ?? DEFAULT_EFFORT,
    enabledSkills: row?.enabledSkills ? (JSON.parse(row.enabledSkills) as string[]) : null,
  };
}

export async function saveAgentConfig(
  db: Db,
  agentId: string,
  projectId: string,
  patch: AgentConfigPatch,
): Promise<void> {
  const now = new Date();
  const fields: Record<string, unknown> = {};
  if ('model' in patch) fields.model = patch.model ?? null;
  if ('autonomy' in patch) fields.autonomy = patch.autonomy ?? null;
  if ('budgetCap' in patch) fields.budgetCap = patch.budgetCap ?? null;
  if ('effortMode' in patch) fields.effortMode = patch.effortMode ?? null;
  if ('enabledSkills' in patch) {
    fields.enabledSkills = patch.enabledSkills ? JSON.stringify(patch.enabledSkills) : null;
  }
  await db
    .insert(agentOverrides)
    .values({ id: `aov_${randomUUID()}`, agentId, projectId, updatedAt: now, ...fields })
    .onConflictDoUpdate({
      target: [agentOverrides.agentId, agentOverrides.projectId],
      set: { ...fields, updatedAt: now },
    });
}
