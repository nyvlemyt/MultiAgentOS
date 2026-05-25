import Anthropic from '@anthropic-ai/sdk';
import type { LLMClient, LLMRequest, LLMResponse } from './llm.js';

// Prices in cents per million tokens — verify at console.anthropic.com/plans
const PRICE_PER_M: Record<string, { in: number; out: number; cacheRead: number; cacheWrite: number }> = {
  'claude-haiku-4-5-20251001': { in: 80, out: 400, cacheRead: 8, cacheWrite: 100 },
  'claude-haiku-4-5':          { in: 80, out: 400, cacheRead: 8, cacheWrite: 100 },
  'claude-sonnet-4-6':         { in: 300, out: 1500, cacheRead: 30, cacheWrite: 375 },
  'claude-opus-4-7':           { in: 1500, out: 7500, cacheRead: 150, cacheWrite: 1875 },
};

export function calcCostCents(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheRead: number,
  cacheCreation: number,
): number {
  const p = PRICE_PER_M[model] ?? PRICE_PER_M['claude-haiku-4-5']!;
  return Math.ceil(
    (inputTokens * p.in + outputTokens * p.out + cacheRead * p.cacheRead + cacheCreation * p.cacheWrite) /
      1_000_000,
  );
}

export function estimateMaxCallCostCents(model: string, maxTokens: number): number {
  const p = PRICE_PER_M[model] ?? PRICE_PER_M['claude-haiku-4-5']!;
  // Pessimistic: charge as if all tokens are output + 500-token input
  return Math.ceil(((500 * p.in) + (maxTokens * p.out)) / 1_000_000) + 1;
}

// Prompt-cache minimum block sizes (tokens → approximate chars at ~4 chars/token)
// Haiku 4.5 / Opus 4.7: 4096-token minimum block
// Sonnet 4.6:            1024-token minimum block
function cacheMinChars(model: string): number {
  if (model.includes('sonnet')) return 4_096;   // ~1024 tokens
  return 16_384;                                 // ~4096 tokens (haiku, opus)
}

type SysBlock = {
  type: 'text';
  text: string;
  cache_control?: { type: 'ephemeral' };
};

export function realLLM(apiKey: string): LLMClient {
  const client = new Anthropic({ apiKey });
  return {
    async call(req: LLMRequest): Promise<LLMResponse> {
      const sysBlock: SysBlock = { type: 'text', text: req.system };
      if (req.system.length >= cacheMinChars(req.model)) {
        sysBlock.cache_control = { type: 'ephemeral' };
      }

      const response = await client.messages.create({
        model: req.model,
        max_tokens: req.maxTokens ?? 4096,
        system: [sysBlock] as unknown as Anthropic.TextBlockParam[],
        messages: [{ role: 'user', content: req.user }],
      });

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('');

      const usage = response.usage as Anthropic.Usage & {
        cache_read_input_tokens?: number;
        cache_creation_input_tokens?: number;
      };

      const inputTokens = usage.input_tokens;
      const outputTokens = usage.output_tokens;
      const cacheRead = usage.cache_read_input_tokens ?? 0;
      const cacheCreation = usage.cache_creation_input_tokens ?? 0;

      return {
        text,
        inputTokens,
        outputTokens,
        cacheReadTokens: cacheRead,
        cacheCreationTokens: cacheCreation,
        costCents: calcCostCents(req.model, inputTokens, outputTokens, cacheRead, cacheCreation),
        model: req.model,
      };
    },
  };
}
