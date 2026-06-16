import { describe, it, expect } from 'vitest';
import { missionProgress, type ProgressTask, type ProgressReport } from './mission-progress';

const task = (over: Partial<ProgressTask>): ProgressTask => ({
  id: 't1',
  title: 'Tâche',
  agentId: 'frontend',
  status: 'todo',
  ...over,
});

const report = (over: Partial<ProgressReport>): ProgressReport => ({
  id: 'rep1',
  taskId: 't1',
  kind: 'task',
  ...over,
});

describe('missionProgress', () => {
  it('counts done vs total', () => {
    const p = missionProgress(
      [task({ id: 'a', status: 'done' }), task({ id: 'b', status: 'running' }), task({ id: 'c', status: 'done' })],
      [],
    );
    expect(p.total).toBe(3);
    expect(p.done).toBe(2);
  });

  it('maps a task report id onto its step', () => {
    const p = missionProgress(
      [task({ id: 'a', status: 'done' })],
      [report({ id: 'rep_a', taskId: 'a', kind: 'task' })],
    );
    expect(p.steps[0]!.reportId).toBe('rep_a');
  });

  it('leaves reportId undefined for a task with no report', () => {
    const p = missionProgress([task({ id: 'a' })], []);
    expect(p.steps[0]!.reportId).toBeUndefined();
  });

  it('ignores non-task reports (mission/project) when mapping steps', () => {
    const p = missionProgress(
      [task({ id: 'a' })],
      [report({ id: 'rep_m', taskId: null, kind: 'mission' })],
    );
    expect(p.steps[0]!.reportId).toBeUndefined();
  });

  it('preserves task order and carries title/agent/status into steps', () => {
    const p = missionProgress(
      [task({ id: 'a', title: 'Un', agentId: 'ux', status: 'running' }), task({ id: 'b', title: 'Deux', agentId: 'backend', status: 'done' })],
      [],
    );
    expect(p.steps.map((s) => s.taskId)).toEqual(['a', 'b']);
    expect(p.steps[0]).toMatchObject({ title: 'Un', agentId: 'ux', status: 'running' });
  });

  it('handles an empty mission (0/0, no steps)', () => {
    const p = missionProgress([], []);
    expect(p).toEqual({ done: 0, total: 0, steps: [] });
  });

  it('uses the most recent task report when several exist for one task', () => {
    const p = missionProgress(
      [task({ id: 'a' })],
      [
        report({ id: 'rep_old', taskId: 'a', kind: 'task' }),
        report({ id: 'rep_new', taskId: 'a', kind: 'task' }),
      ],
    );
    // first match wins (callers pass reports newest-first, like listMissionReports)
    expect(p.steps[0]!.reportId).toBe('rep_old');
  });
});
