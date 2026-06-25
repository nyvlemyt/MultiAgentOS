import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LLMClient } from '@mas/core';
import { delegateWithDiff, extractDiff } from './delegate';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = resolve(__dirname, '../../../.claude/agents');

function stubLLM(text: string): LLMClient {
  return {
    async call(req) {
      return {
        text,
        inputTokens: 11,
        outputTokens: 7,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        quotaUnits: 0,
        model: req.model,
      };
    },
  };
}

const TASK = { title: 'Polish the navbar', description: 'Improve spacing and contrast.' };
const DIFF_BODY = '--- a/x\n+++ b/x\n@@ -1 +1 @@\n-a\n+b';

describe('extractDiff', () => {
  it('returns the trimmed body of the first diff fence', () => {
    expect(extractDiff(`Here:\n\`\`\`diff\n${DIFF_BODY}\n\`\`\`\nDone.`)).toBe(DIFF_BODY);
  });

  it('returns null when there is no diff fence', () => {
    expect(extractDiff('TL;DR: looks fine.')).toBeNull();
  });
});

describe('delegateWithDiff', () => {
  it('surfaces the diff body and a patch result for a diff response', async () => {
    const llm = stubLLM(`Change:\n\`\`\`diff\n${DIFF_BODY}\n\`\`\``);
    const outcome = await delegateWithDiff({
      agentId: 'design-ui-designer',
      task: TASK,
      llm,
      fichesDir: AGENTS_DIR,
    });
    expect(outcome.diff).toBe(DIFF_BODY);
    expect(outcome.result.kind).toBe('done');
    if (outcome.result.kind === 'done') {
      expect(outcome.result.outputs).toHaveLength(1);
      // safe: toHaveLength(1) above guarantees outputs[0] exists
      expect(outcome.result.outputs[0]!.kind).toBe('patch');
    }
    expect(outcome.response.inputTokens).toBe(11);
  });

  it('returns null diff + markdown result for prose responses', async () => {
    const llm = stubLLM('TL;DR: looks fine.\n\nDetails.');
    const outcome = await delegateWithDiff({
      agentId: 'design-ui-designer',
      task: TASK,
      llm,
      fichesDir: AGENTS_DIR,
    });
    expect(outcome.diff).toBeNull();
    expect(outcome.result.kind).toBe('done');
    if (outcome.result.kind === 'done') {
      expect(outcome.result.outputs).toHaveLength(1);
      // safe: toHaveLength(1) above guarantees outputs[0] exists
      expect(outcome.result.outputs[0]!.kind).toBe('markdown');
    }
  });

  it('returns a blocked result + null diff on the [blocked] sentinel', async () => {
    const llm = stubLLM('[blocked] missing the design spec');
    const outcome = await delegateWithDiff({
      agentId: 'design-ui-designer',
      task: TASK,
      llm,
      fichesDir: AGENTS_DIR,
    });
    expect(outcome.diff).toBeNull();
    expect(outcome.result.kind).toBe('blocked');
  });
});
