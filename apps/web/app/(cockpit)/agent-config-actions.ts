'use server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@mas/db';
import { getAgentConfig, saveAgentConfig, agentSkills, type AgentConfigPatch } from '@/lib/agent-config';
import { readFiche, writeFiche, restoreFiche, pruneFicheRevisions, ficheSaveSummary } from '@/lib/agent-fiche';

// Agent Control Panel server actions. Project-instance edits (config, skills) are
// pure DB upserts on the override layer — no file, no gate (CLAUDE.md §5: the gate
// lives in the UI confirm for autonomy/budget raises). Base-agent fiche writes go
// to disk via agent-fiche, confined to .claude/agents / packages/agents only.

export async function updateAgentConfig(
  agentId: string,
  projectId: string,
  patch: AgentConfigPatch,
): Promise<void> {
  await saveAgentConfig(getDb(), agentId, projectId, patch);
}

export async function toggleAgentSkill(
  agentId: string,
  projectId: string,
  skillId: string,
  on: boolean,
): Promise<void> {
  const db = getDb();
  const cfg = await getAgentConfig(db, agentId, projectId);
  const current =
    cfg.enabledSkills ?? agentSkills(agentId, null).filter((s) => s.enabled).map((s) => s.id);
  const next = new Set(current);
  if (on) next.add(skillId);
  else next.delete(skillId);
  await saveAgentConfig(db, agentId, projectId, { enabledSkills: [...next] });
}

export async function saveFiche(agentId: string, content: string): Promise<void> {
  const db = getDb();
  const { content: prev } = await readFiche(agentId);
  await writeFiche(db, agentId, content, ficheSaveSummary(prev, content));
  revalidatePath(`/agents/${agentId}`);
}

export async function restoreFicheRevision(agentId: string, revisionId: string): Promise<void> {
  await restoreFiche(getDb(), agentId, revisionId);
  revalidatePath(`/agents/${agentId}`);
}

export async function cleanupFicheRevisions(agentId: string): Promise<void> {
  await pruneFicheRevisions(getDb(), agentId, new Date());
  revalidatePath(`/agents/${agentId}`);
}
