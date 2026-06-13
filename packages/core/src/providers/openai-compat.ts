import type { LLMClient, LLMRequest, LLMResponse } from '../llm.js';
import type { ProviderDef } from './types.js';
import { httpError, type FetchLike } from './http.js';

interface ChatCompletionsResponse {
  choices?: { message?: { content?: string } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

/**
 * Shared OpenAI-compatible chat-completions client (OpenAI + Perplexity).
 * Paid per-token APIs — instantiated only when paid_apis_enabled (§11.bis rule 2).
 */
export function openaiCompatLLM(
  def: ProviderDef,
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
  fetchImpl: FetchLike = fetch,
): LLMClient {
  const model = def.model ?? defaultModel;
  return {
    async call(req: LLMRequest): Promise<LLMResponse> {
      const res = await fetchImpl(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            ...(req.system ? [{ role: 'system', content: req.system }] : []),
            { role: 'user', content: req.user },
          ],
        }),
      });
      if (!res.ok) throw await httpError(def.id, res);
      const data = (await res.json()) as ChatCompletionsResponse;
      return {
        text: data.choices?.[0]?.message?.content ?? '',
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        quotaUnits: 0,
        model,
        provider: def.id,
      };
    },
  };
}
