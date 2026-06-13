import type { LLMClient, LLMRequest, LLMResponse } from '../llm.js';
import type { ProviderDef } from './types.js';
import { httpError, type FetchLike } from './http.js';

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
}

/**
 * Gemini free tier via the Generative Language REST API. Plain fetch (no SDK
 * dependency); key travels in the x-goog-api-key header, never in the URL.
 * Cognition only — no cwd, grounding injected via req.system (§11.bis rule 4).
 */
export function geminiLLM(def: ProviderDef, apiKey: string, fetchImpl: FetchLike = fetch): LLMClient {
  const model = def.model ?? 'gemini-2.0-flash';
  const base = def.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta';
  return {
    async call(req: LLMRequest): Promise<LLMResponse> {
      const res = await fetchImpl(`${base}/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: req.system ? { parts: [{ text: req.system }] } : undefined,
          contents: [{ role: 'user', parts: [{ text: req.user }] }],
        }),
      });
      if (!res.ok) throw await httpError(def.id, res);
      const data = (await res.json()) as GeminiResponse;
      return {
        text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
        inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        quotaUnits: 0,
        model,
        provider: def.id,
      };
    },
  };
}
