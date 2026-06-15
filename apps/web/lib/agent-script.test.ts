import { describe, it, expect } from 'vitest';
import { agentReply } from './agent-script';

describe('agentReply', () => {
  it('is deterministic per agent', () => {
    expect(agentReply('mission-planner', 'x')).toBe(agentReply('mission-planner', 'y'));
  });

  it('differs by role', () => {
    expect(agentReply('mission-planner', 'x')).not.toBe(agentReply('sec-reviewer', 'x'));
  });

  it('falls back to a generic line for an unknown role', () => {
    expect(agentReply('mystery-agent', 'x')).toContain('valider');
  });
});
