import { describe, it, expect } from 'vitest';
import { missionReply } from './mission-script';

describe('missionReply', () => {
  it('classifies a status / progress question', () => {
    expect(missionReply('où en est la mission ?').intent).toBe('status');
  });

  it('classifies a report request', () => {
    expect(missionReply('génère le rapport final').intent).toBe('report');
  });

  it('classifies a task-related request', () => {
    expect(missionReply('ajoute une tâche pour le polish du feed').intent).toBe('task');
  });

  it('defaults to a generic mission turn', () => {
    expect(missionReply('continue').intent).toBe('mission');
  });

  it('is deterministic and names the mission', () => {
    const a = missionReply('où en est-on ?', 'Polish feed');
    const b = missionReply('où en est-on ?', 'Polish feed');
    expect(a).toEqual(b);
    expect(a.text).toContain('Polish feed');
  });
});
