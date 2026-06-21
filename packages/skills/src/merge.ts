import type { SkillMeta } from './types.js';

/**
 * Merge orchestrator skills with the cold-library arsenal, deduped by `id`.
 * On collision the orchestrator entry wins (it's the curated, active version).
 * Order: orchestrator first, then library entries not already present.
 */
export function mergeSkillMetas(
  orchestrator: SkillMeta[],
  library: SkillMeta[],
): SkillMeta[] {
  const byId = new Map<string, SkillMeta>();
  for (const s of library) byId.set(s.id, s);
  for (const s of orchestrator) byId.set(s.id, s);
  return [...byId.values()];
}
