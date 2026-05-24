import type { Mode } from './types.js';

export interface LLMRequest {
  system: string;
  user: string;
  model: string;
  mode: Mode;
  maxTokens?: number;
}

export interface LLMResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  costCents: number;
  model: string;
}

export interface LLMClient {
  call(req: LLMRequest): Promise<LLMResponse>;
}

export function mockLLM(): LLMClient {
  return {
    async call(req) {
      const text = `[mock:${req.model}] ack ${req.user.slice(0, 60)}`;
      return {
        text,
        inputTokens: 200,
        outputTokens: 60,
        cacheReadTokens: 120,
        cacheCreationTokens: 80,
        costCents: 0,
        model: req.model,
      };
    },
  };
}
