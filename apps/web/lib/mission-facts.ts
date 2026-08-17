import { and, eq, inArray, sql } from 'drizzle-orm';
import { getDb, missions, tasks, validations, events } from '@mas/db';
import {
  reconcileMissionStatus,
  STALE_AFTER_MS,
  type MissionFacts,
  type Reconciliation,
} from './mission-truth';

// C1 — côté I/O du statut vérité. Lit les faits déjà en base, ne les écrit jamais.
// 3 requêtes groupées pour N missions (le board en affiche des dizaines : pas de N+1).

type Db = ReturnType<typeof getDb>;

/** Seuil de péremption effectif : surchargeable par MAS_MISSION_STALE_MS (ms). */
export function staleAfterMs(): number {
  const raw = process.env.MAS_MISSION_STALE_MS;
  if (raw === undefined) return STALE_AFTER_MS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : STALE_AFTER_MS;
}

export async function collectMissionFacts(db: Db, ids: readonly string[]): Promise<Map<string, MissionFacts>> {
  const out = new Map<string, MissionFacts>();
  if (ids.length === 0) return out;
  const missionIds = [...ids];

  const missionRows = await db
    .select({
      id: missions.id,
      status: missions.status,
      budgetTokens: missions.budgetTokens,
      spentTokens: missions.spentTokens,
    })
    .from(missions)
    .where(inArray(missions.id, missionIds));

  // max(created_at) : colonne `epoch()` = integer timestamp en SECONDES.
  const lastEvents = await db
    .select({ missionId: events.missionId, lastEpoch: sql<number | null>`max(${events.createdAt})` })
    .from(events)
    .where(inArray(events.missionId, missionIds))
    .groupBy(events.missionId);

  const taskRows = await db
    .select({ id: tasks.id, missionId: tasks.missionId, status: tasks.status })
    .from(tasks)
    .where(inArray(tasks.missionId, missionIds));

  // Patron identique à lib/health.ts:49-53 (join + and(...)).
  const pendingRows = await db
    .select({ missionId: tasks.missionId })
    .from(validations)
    .innerJoin(tasks, eq(validations.taskId, tasks.id))
    .where(and(inArray(tasks.missionId, missionIds), eq(validations.status, 'pending')));

  const lastEventAt = new Map<string, Date>();
  for (const r of lastEvents) {
    if (r.missionId !== null && r.lastEpoch !== null) lastEventAt.set(r.missionId, new Date(r.lastEpoch * 1000));
  }

  const taskCount = new Map<string, number>();
  const blockedCount = new Map<string, number>();
  for (const t of taskRows) {
    taskCount.set(t.missionId, (taskCount.get(t.missionId) ?? 0) + 1);
    if (t.status === 'blocked') blockedCount.set(t.missionId, (blockedCount.get(t.missionId) ?? 0) + 1);
  }

  const pendingCount = new Map<string, number>();
  for (const p of pendingRows) pendingCount.set(p.missionId, (pendingCount.get(p.missionId) ?? 0) + 1);

  for (const m of missionRows) {
    out.set(m.id, {
      missionId: m.id,
      declared: m.status,
      lastEventAt: lastEventAt.get(m.id) ?? null,
      taskCount: taskCount.get(m.id) ?? 0,
      blockedTaskCount: blockedCount.get(m.id) ?? 0,
      pendingValidationCount: pendingCount.get(m.id) ?? 0,
      // Aucun plafond déclaré ⇒ fait ABSENT, pas « budget OK » (C12, null ≠ zéro).
      budgetExceeded: m.budgetTokens > 0 ? m.spentTokens >= m.budgetTokens : null,
      // COUTURE C3 (docs/backlog/contrat-rapport-mission.md) : la colonne
      // reports.verdict n'existe pas encore. Le fait est ABSENT, jamais inventé.
      // C3 remplacera ce null par la lecture du dernier reports (kind='mission').
      reportVerdict: null,
    });
  }
  return out;
}

/** Faits + réconciliation en une passe — ce que les pages consomment. */
export async function missionReconciliations(
  db: Db,
  ids: readonly string[],
  now: Date = new Date(),
): Promise<Map<string, Reconciliation>> {
  const facts = await collectMissionFacts(db, ids);
  const threshold = staleAfterMs();
  const out = new Map<string, Reconciliation>();
  for (const [id, f] of facts) out.set(id, reconcileMissionStatus(f, now, threshold));
  return out;
}
