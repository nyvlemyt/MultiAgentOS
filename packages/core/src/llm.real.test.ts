import { describe, it, expect, afterEach } from 'vitest';
import { claudeCodeLLM, AUTONOMY_TO_PERMISSION } from './llm.real.js';

afterEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
});

describe('claudeCodeLLM', () => {
  it('throws if ANTHROPIC_API_KEY is set at init', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-fake';
    expect(() => claudeCodeLLM()).toThrow(/ANTHROPIC_API_KEY/);
  });

  it('maps each autonomy level to the correct permission mode', () => {
    expect(AUTONOMY_TO_PERMISSION.manual).toBe('plan');
    expect(AUTONOMY_TO_PERMISSION.assisted).toBe('default');
    expect(AUTONOMY_TO_PERMISSION.autonomous).toBe('acceptEdits');
    expect(AUTONOMY_TO_PERMISSION.autopilot).toBe('acceptEdits'); // not bypassPermissions
  });

  it('does not throw when ANTHROPIC_API_KEY is absent', () => {
    delete process.env.ANTHROPIC_API_KEY;
    expect(() => claudeCodeLLM({ cwd: '/tmp', autonomyLevel: 'assisted' })).not.toThrow();
  });
});
