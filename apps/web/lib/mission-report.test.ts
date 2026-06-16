import { describe, it, expect } from 'vitest';
import { buildFinalReport } from './mission-report';
import type { MissionProgress } from './mission-progress';

const progress: MissionProgress = {
  done: 1,
  total: 2,
  steps: [
    { taskId: 'a', title: 'Découper le feed', agentId: 'frontend', status: 'done', reportId: 'rep_a' },
    { taskId: 'b', title: 'Tester', agentId: 'reality', status: 'running' },
  ],
};

describe('buildFinalReport', () => {
  it('titles the report after the mission', () => {
    const r = buildFinalReport('Polish feed', progress);
    expect(r.title).toContain('Polish feed');
  });

  it('embeds a what/why/how/tests structure in the human markdown', () => {
    const r = buildFinalReport('Polish feed', progress);
    for (const section of ['Quoi', 'Pourquoi', 'Comment', 'Tests']) {
      expect(r.humanMd).toContain(section);
    }
  });

  it('lists every step (title + agent + status) in the markdown index', () => {
    const r = buildFinalReport('Polish feed', progress);
    expect(r.humanMd).toContain('Découper le feed');
    expect(r.humanMd).toContain('frontend');
    expect(r.humanMd).toContain('Tester');
  });

  it('reports the done/total count', () => {
    const r = buildFinalReport('Polish feed', progress);
    expect(r.humanMd).toContain('1/2');
  });

  it('produces valid structured JSON (parseable, carries the steps)', () => {
    const r = buildFinalReport('Polish feed', progress);
    const ai = JSON.parse(r.ai) as { done: number; total: number; steps: unknown[] };
    expect(ai.done).toBe(1);
    expect(ai.total).toBe(2);
    expect(ai.steps).toHaveLength(2);
  });

  it('is deterministic', () => {
    expect(buildFinalReport('M', progress)).toEqual(buildFinalReport('M', progress));
  });
});
