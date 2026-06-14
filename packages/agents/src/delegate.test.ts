import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LLMClient, LLMRequest } from '@mas/core';
import { delegate } from './delegate';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = resolve(__dirname, '../../../.claude/agents');

function stubLLM(text: string): { llm: LLMClient; calls: LLMRequest[] } {
  const calls: LLMRequest[] = [];
  const llm: LLMClient = {
    async call(req) {
      calls.push(req);
      return {
        text,
        inputTokens: 10,
        outputTokens: 5,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        quotaUnits: 0,
        model: req.model,
      };
    },
  };
  return { llm, calls };
}

const TASK = { title: 'Polish the navbar', description: 'Improve spacing and contrast.' };

describe('delegate', () => {
  it('builds a system prompt with the preface and the fiche body', async () => {
    const { llm, calls } = stubLLM('A plain markdown report.');
    await delegate({ agentId: 'engineering-frontend-developer', task: TASK, llm, fichesDir: AGENTS_DIR });
    expect(calls).toHaveLength(1);
    const system = calls[0].system;
    expect(system).toContain('Tier B delegated call');
    expect(system).toContain('Frontend Developer');
  });

  it('returns a patch artifact when the response contains a diff block', async () => {
    const diff = '```diff\n--- a/x\n+++ b/x\n@@ -1 +1 @@\n-a\n+b\n```';
    const { llm } = stubLLM(`Here is the change:\n${diff}`);
    const result = await delegate({ agentId: 'design-ui-designer', task: TASK, llm, fichesDir: AGENTS_DIR });
    expect(result.kind).toBe('done');
    if (result.kind === 'done') {
      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0].kind).toBe('patch');
      expect(result.outputs[0].path).toContain('design-ui-designer.patch');
    }
  });

  it('returns a markdown artifact for prose responses', async () => {
    const { llm } = stubLLM('TL;DR: looks fine.\n\nDetails here.');
    const result = await delegate({ agentId: 'design-ui-designer', task: TASK, llm, fichesDir: AGENTS_DIR });
    expect(result.kind).toBe('done');
    if (result.kind === 'done') {
      expect(result.outputs[0].kind).toBe('markdown');
    }
  });

  it('returns a blocked result on the [blocked] sentinel', async () => {
    const { llm } = stubLLM('[blocked] missing the design spec');
    const result = await delegate({ agentId: 'design-ui-designer', task: TASK, llm, fichesDir: AGENTS_DIR });
    expect(result.kind).toBe('blocked');
    if (result.kind === 'blocked') {
      expect(result.reason).toContain('missing the design spec');
    }
  });

  it('passes the language directive into the system prompt', async () => {
    const { llm, calls } = stubLLM('ok');
    await delegate({ agentId: 'design-ui-designer', task: TASK, llm, language: 'fr', fichesDir: AGENTS_DIR });
    expect(calls[0].system).toContain('Respond in French.');
  });

  it('throws on an unknown agent id', async () => {
    const { llm } = stubLLM('ok');
    await expect(
      delegate({ agentId: 'no-such-agent', task: TASK, llm, fichesDir: AGENTS_DIR }),
    ).rejects.toThrow();
  });
});
