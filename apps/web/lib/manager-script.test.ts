import { describe, it, expect } from 'vitest';
import { managerReply } from './manager-script';

describe('managerReply', () => {
  it('classifies a new-project request', () => {
    expect(managerReply('je veux créer un projet pour mon blog').intent).toBe('new-project');
  });

  it('classifies an idea', () => {
    expect(managerReply('et si on ajoutait un dark mode ?').intent).toBe('idea');
  });

  it('classifies a status question', () => {
    expect(managerReply('donne-moi l\'état du projet').intent).toBe('status');
  });

  it('defaults to a mission for an open-ended request', () => {
    expect(managerReply('corrige le bug de pagination du feed').intent).toBe('mission');
  });

  it('is deterministic and mentions the active project', () => {
    const a = managerReply('refais la home', 'OtakuGO_UP');
    const b = managerReply('refais la home', 'OtakuGO_UP');
    expect(a).toEqual(b);
    expect(a.text).toContain('OtakuGO_UP');
  });
});
