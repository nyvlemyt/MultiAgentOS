import { describe, it, expect } from 'vitest';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { and, eq } from 'drizzle-orm';
import { getDb, tasks, events } from '@mas/db';
import { planMission } from './dispatch';
import { useTestDb, seedProject, seedMission, seedAgentsRoster } from './testing';
import { TIER_B_DELEGATION_MAP } from './library';
import { scoreColdAgentSuggestion } from './cold-agent-suggest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const MIGRATIONS_FOLDER = resolve(REPO_ROOT, 'packages/db/migrations');

useTestDb(MIGRATIONS_FOLDER);

interface SuggestPayload {
  taskId: string;
  suggestedAgentId: string;
  score: number;
  reason: string;
}

async function suggestionEvents(missionId: string): Promise<
  { taskId: string | null; payload: SuggestPayload }[]
> {
  const db = getDb();
  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.missionId, missionId), eq(events.type, 'cold_agent_suggested')));
  return rows.map((e) => ({ taskId: e.taskId, payload: JSON.parse(e.payloadJson) as SuggestPayload }));
}

describe('scoreColdAgentSuggestion (pure scorer, §5 data-only)', () => {
  const library = [
    { id: 'language-reviewer', name: 'Language Reviewer', role: 'Per-language code review verdict', domains: ['code-review'], path: 'x' },
    { id: 'marketing-agent', name: 'Marketing Agent', role: 'Plan marketing campaigns and copy', domains: ['marketing'], path: 'x' },
  ];

  it('surfaces the best-overlapping library agent when it beats the planner hint', () => {
    const top = scoreColdAgentSuggestion(
      { title: 'Final code review', description: 'Code review verdict for archive.' },
      'reviewer',
      library,
    );
    expect(top).toBeDefined();
    expect(top!.suggestedAgentId).toBe('language-reviewer');
    expect(top!.score).toBeGreaterThan(0);
    expect(typeof top!.reason).toBe('string');
  });

  it('returns undefined when no library agent meaningfully beats the hint', () => {
    const top = scoreColdAgentSuggestion(
      { title: 'Deploy the worker', description: 'Restart the orchestrator daemon.' },
      'reviewer',
      library,
    );
    expect(top).toBeUndefined();
  });
});

describe('planMission — cold-agent suggestion event (§5: data only, no routing mutation)', () => {
  const MID = 'mid_cold_suggest';

  it('emits exactly one cold_agent_suggested event with the right payload and mutates no routing state', async () => {
    await seedProject('cold-proj', 'Cold Project');
    await seedAgentsRoster();
    await seedMission(MID, 'cold-proj', {
      title: 'Code review pass',
      objective: 'Run a final code review verdict before archive.',
    });

    await planMission(MID);

    const db = getDb();
    const suggestions = await suggestionEvents(MID);
    expect(suggestions.length).toBeGreaterThan(0);

    // The t6 reviewer task should surface a code-review library agent.
    const t6 = suggestions.find((s) => s.taskId === `${MID}_t6`);
    expect(t6).toBeDefined();
    expect(t6!.payload.taskId).toBe(`${MID}_t6`);
    expect(t6!.payload.suggestedAgentId).toBeTruthy();
    expect(t6!.payload.suggestedAgentId).not.toBe('reviewer');
    expect(t6!.payload.score).toBeGreaterThan(0);
    expect(typeof t6!.payload.reason).toBe('string');

    // At most one suggestion per task (no duplicate emissions).
    const byTask = new Map<string | null, number>();
    for (const s of suggestions) byTask.set(s.taskId, (byTask.get(s.taskId) ?? 0) + 1);
    for (const count of byTask.values()) expect(count).toBe(1);

    // §5 NON-NEGOTIABLE: the suggestion is data only. The planner hint persisted
    // to tasks.agentId is UNCHANGED — never the suggested cold agent.
    const t6Row = (await db.select().from(tasks).where(eq(tasks.id, `${MID}_t6`)))[0]!;
    expect(t6Row.agentId).toBe('reviewer');
    expect(t6Row.agentId).not.toBe(t6!.payload.suggestedAgentId);

    // The suggested agent must NOT have been smuggled into the delegation map
    // (no execution path created by an arsenal query alone).
    expect(TIER_B_DELEGATION_MAP[t6!.payload.suggestedAgentId]).toBeUndefined();
  });

  it('emits no suggestion for a task whose planner hint already wins', async () => {
    const MID2 = 'mid_cold_hintwins';
    await seedProject('cold-proj2', 'Cold Project 2');
    await seedAgentsRoster();
    await seedMission(MID2, 'cold-proj2', { title: 'Trivial', objective: 'Nothing notable.' });

    await planMission(MID2);

    // t2 ("Pick skills + tier B agents" / skill-router) has no strong library
    // overlap that beats its hint — assert no suggestion was emitted for it.
    const suggestions = await suggestionEvents(MID2);
    const t2 = suggestions.find((s) => s.taskId === `${MID2}_t2`);
    expect(t2).toBeUndefined();
  });
});
