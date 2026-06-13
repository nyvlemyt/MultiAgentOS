import { describe, it, expect, vi } from 'vitest';
import type { LLMClient, LLMRequest } from './llm.js';
import { RouterLLMClient } from './llm.router.js';
import { loadRoutingConfig } from './providers/config.js';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../..');
const cfg = loadRoutingConfig(resolve(repoRoot, 'config/model-routing.json'));

// Grounding block the dispatcher injects: project memory + context-pack + skills.
// ADR 0002 §4 — non-Claude providers have no cwd, so this is their only grounding.
const GROUNDING = [
  'You are executing a task inside project at path /proj/otaku.',
  '<memory>BDR is the canonical decision-register name. Mem0 cloud rejected.</memory>',
  '<available_skills><skill id="frontend-design" domain="ux">…</skill></available_skills>',
].join('\n\n');

function recordingClient(id: string): { client: LLMClient; seen: LLMRequest[] } {
  const seen: LLMRequest[] = [];
  return {
    seen,
    client: {
      call: vi.fn(async (req: LLMRequest) => {
        seen.push(req);
        return {
          text: id,
          inputTokens: 1,
          outputTokens: 1,
          cacheReadTokens: 0,
          cacheCreationTokens: 0,
          quotaUnits: 0,
          model: req.model,
          provider: id,
        };
      }),
    },
  };
}

describe('grounding parity (ADR 0002 §4, DoD #4)', () => {
  it('two providers serving the same task receive an identical injected context block', async () => {
    const gemini = recordingClient('gemini-free');
    const claude = recordingClient('claude');
    const router = new RouterLLMClient({
      config: cfg,
      env: { GEMINI_API_KEY: 'k' },
      clients: new Map([
        ['gemini-free', gemini.client],
        ['claude', claude.client],
      ]),
      sleep: async () => {},
    });

    const task: LLMRequest = { system: GROUNDING, user: 'Task: build empty state', model: 'm', mode: 'eco', domain: 'memory' };

    // First call lands on gemini (memory → gemini-free).
    await router.call({ ...task });

    // Force a failover so the SAME task is served by claude instead.
    vi.mocked(gemini.client.call).mockRejectedValueOnce(
      Object.assign(new Error('quota'), { status: 429 }),
    );
    await router.call({ ...task });

    expect(gemini.seen[0]!.system).toBe(GROUNDING);
    expect(claude.seen[0]!.system).toBe(GROUNDING);
    // Byte-identical grounding across providers — no source-specific mutation.
    expect(claude.seen[0]!.system).toBe(gemini.seen[0]!.system);
    expect(claude.seen[0]!.user).toBe(gemini.seen[0]!.user);
  });
});
