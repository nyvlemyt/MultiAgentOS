import type { LLMClient } from '../llm.js';
import type { ProviderDef } from './types.js';
import { openaiCompatLLM } from './openai-compat.js';
import type { FetchLike } from './http.js';

export function perplexityLLM(def: ProviderDef, apiKey: string, fetchImpl?: FetchLike): LLMClient {
  return openaiCompatLLM(def, apiKey, def.baseUrl ?? 'https://api.perplexity.ai', 'sonar', fetchImpl);
}
