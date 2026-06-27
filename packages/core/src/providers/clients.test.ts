import { describe, it, expect, vi } from 'vitest';
import type { LLMClient, LLMRequest, LLMResponse } from '../llm.js';
import { claudeAccountLLM } from './claude-account.js';
import { geminiLLM } from './gemini.js';
import { openaiLLM } from './openai.js';
import { openaiCompatLLM } from './openai-compat.js';
import { perplexityLLM } from './perplexity.js';
import type { ProviderDef } from './types.js';

const req: LLMRequest = {
  system: 'sys',
  user: 'hello',
  model: 'whatever',
  mode: 'eco',
};

function fakeResponse(text: string): LLMResponse {
  return {
    text,
    inputTokens: 10,
    outputTokens: 5,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    quotaUnits: 0,
    model: 'm',
  };
}

describe('claudeAccountLLM', () => {
  it('passes the account configDir as CLAUDE_CONFIG_DIR to the underlying factory', async () => {
    const inner: LLMClient = { call: vi.fn(async () => fakeResponse('ok')) };
    const factory = vi.fn(() => inner);
    const llm = claudeAccountLLM(
      { id: 'claude:pro20', configDir: '/profiles/pro20' },
      { cwd: '/proj' },
      factory,
    );
    const resp = await llm.call(req);
    expect(factory).toHaveBeenCalledWith(
      expect.objectContaining({
        cwd: '/proj',
        extraEnv: { CLAUDE_CONFIG_DIR: '/profiles/pro20' },
      }),
    );
    expect(resp.provider).toBe('claude:pro20');
  });
});

describe('geminiLLM', () => {
  it('calls the Gemini generateContent endpoint and maps usage — no real network', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'gemini says hi' }] } }],
          usageMetadata: { promptTokenCount: 12, candidatesTokenCount: 7 },
        }),
        { status: 200 },
      ),
    );
    const llm = geminiLLM(
      { id: 'gemini-free', kind: 'gemini', apiKeyEnv: 'GEMINI_API_KEY', model: 'gemini-2.0-flash' },
      'test-key',
      fetchImpl,
    );
    const resp = await llm.call(req);
    const url = String(fetchImpl.mock.calls[0]![0]);
    expect(url).toContain('gemini-2.0-flash');
    expect(url).not.toContain('test-key');
    const init = fetchImpl.mock.calls[0]![1] as RequestInit;
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('test-key');
    expect(resp.text).toBe('gemini says hi');
    expect(resp.inputTokens).toBe(12);
    expect(resp.outputTokens).toBe(7);
    expect(resp.provider).toBe('gemini-free');
  });

  it('throws a coded error on 429 so the router can classify it', async () => {
    const fetchImpl = vi.fn(async () => new Response('quota', { status: 429 }));
    const llm = geminiLLM(
      { id: 'gemini-free', kind: 'gemini', model: 'gemini-2.0-flash' },
      'k',
      fetchImpl,
    );
    await expect(llm.call(req)).rejects.toMatchObject({ status: 429 });
  });
});

describe('openaiLLM / perplexityLLM', () => {
  const chatResponse = new Response(
    JSON.stringify({
      choices: [{ message: { content: 'compat says hi' } }],
      usage: { prompt_tokens: 20, completion_tokens: 9 },
    }),
    { status: 200 },
  );

  it('openaiLLM posts to chat/completions with bearer auth', async () => {
    const fetchImpl = vi.fn(async () => chatResponse.clone());
    const llm = openaiLLM(
      { id: 'openai', kind: 'openai', model: 'gpt-4o', paid: true },
      'sk-test',
      fetchImpl,
    );
    const resp = await llm.call(req);
    expect(String(fetchImpl.mock.calls[0]![0])).toBe('https://api.openai.com/v1/chat/completions');
    const init = fetchImpl.mock.calls[0]![1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer sk-test');
    expect(resp.text).toBe('compat says hi');
    expect(resp.inputTokens).toBe(20);
    expect(resp.outputTokens).toBe(9);
    expect(resp.provider).toBe('openai');
  });

  it('perplexityLLM targets the perplexity base URL', async () => {
    const fetchImpl = vi.fn(async () => chatResponse.clone());
    const llm = perplexityLLM(
      { id: 'perplexity', kind: 'perplexity', model: 'sonar', paid: true },
      'pplx-test',
      fetchImpl,
    );
    const resp = await llm.call(req);
    expect(String(fetchImpl.mock.calls[0]![0])).toBe(
      'https://api.perplexity.ai/chat/completions',
    );
    expect(resp.provider).toBe('perplexity');
  });
});

describe('openaiCompatLLM fallback branches', () => {
  it('falls back to defaultModel, omits the system message, and zero-fills a sparse response', async () => {
    const def: ProviderDef = { id: 'openai', kind: 'openai', paid: true }; // no model set
    let sentBody: { model?: string; messages?: { role: string; content: string }[] } = {};
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      sentBody = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({}), { status: 200 }); // no choices, no usage
    });
    const llm = openaiCompatLLM(def, 'sk', 'https://x/v1', 'fallback-model', fetchImpl);
    // system: '' is falsy → the no-system branch; model:'ignored' is overridden by def/default.
    const resp = await llm.call({ system: '', user: 'hi', model: 'ignored', mode: 'eco' });

    expect(sentBody.model).toBe('fallback-model'); // def.model ?? defaultModel
    expect(sentBody.messages).toEqual([{ role: 'user', content: 'hi' }]); // no system message
    expect(resp.text).toBe(''); // content ?? ''
    expect(resp.inputTokens).toBe(0); // prompt_tokens ?? 0
    expect(resp.outputTokens).toBe(0); // completion_tokens ?? 0
    expect(resp.model).toBe('fallback-model');
    expect(resp.provider).toBe('openai');
  });

  it('throws a coded error when the API responds non-2xx', async () => {
    const def: ProviderDef = { id: 'openai', kind: 'openai', model: 'gpt-4o', paid: true };
    const fetchImpl = vi.fn(async () => new Response('nope', { status: 500 }));
    const llm = openaiCompatLLM(def, 'sk', 'https://x/v1', 'fallback-model', fetchImpl);
    await expect(
      llm.call({ system: '', user: 'hi', model: 'm', mode: 'eco' }),
    ).rejects.toMatchObject({ status: 500 });
  });
});
