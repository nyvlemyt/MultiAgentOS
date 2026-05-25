import { vi, describe, it, expect, beforeEach } from 'vitest';
import { selectModel, applyCaveman } from './llm.js';

// ---- realLLM unit tests (Anthropic SDK mocked) --------------------------------

const mockCreate = vi.fn();
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({ messages: { create: mockCreate } })),
}));

import { realLLM } from './llm.real.js';

const MOCK_USAGE = {
  input_tokens: 100,
  output_tokens: 50,
  cache_read_input_tokens: 80,
  cache_creation_input_tokens: 20,
};

beforeEach(() => {
  mockCreate.mockResolvedValue({
    content: [{ type: 'text', text: '{"ok":true}' }],
    usage: MOCK_USAGE,
  });
  mockCreate.mockClear();
});

// ---- selectModel ---------------------------------------------------------------

describe('selectModel', () => {
  it('eco → haiku regardless of retry', () => {
    expect(selectModel('eco')).toBe('claude-haiku-4-5-20251001');
    expect(selectModel('eco', true)).toBe('claude-haiku-4-5-20251001');
  });
  it('standard → haiku on first attempt', () => {
    expect(selectModel('standard')).toBe('claude-haiku-4-5-20251001');
  });
  it('standard → sonnet on retry', () => {
    expect(selectModel('standard', true)).toBe('claude-sonnet-4-6');
  });
  it('expert → sonnet', () => {
    expect(selectModel('expert')).toBe('claude-sonnet-4-6');
  });
});

// ---- applyCaveman -------------------------------------------------------------

describe('applyCaveman', () => {
  it('appends suffix for eco + internal route', () => {
    const result = applyCaveman('You are an agent.', 'eco', 'planner_to_router');
    expect(result).toContain('[CAVEMAN MODE');
  });
  it('no-op for standard mode', () => {
    expect(applyCaveman('sys', 'standard', 'planner_to_router')).toBe('sys');
  });
  it('no-op for expert mode', () => {
    expect(applyCaveman('sys', 'expert', 'planner_to_router')).toBe('sys');
  });
  it('no-op for null route (user-facing output)', () => {
    expect(applyCaveman('sys', 'eco', null)).toBe('sys');
  });
  it('no-op for reviewer_to_sec route (not in CAVEMAN_ROUTES set)', () => {
    expect(applyCaveman('sys', 'eco', 'reviewer_to_sec')).toBe('sys');
  });
});

// ---- realLLM ------------------------------------------------------------------

describe('realLLM', () => {
  it('maps API usage to LLMResponse fields', async () => {
    const llm = realLLM('test-key');
    const res = await llm.call({ system: 'sys', user: 'usr', model: 'claude-haiku-4-5-20251001', mode: 'eco' });
    expect(res.inputTokens).toBe(100);
    expect(res.outputTokens).toBe(50);
    expect(res.cacheReadTokens).toBe(80);
    expect(res.cacheCreationTokens).toBe(20);
    expect(res.text).toBe('{"ok":true}');
    expect(res.model).toBe('claude-haiku-4-5-20251001');
  });

  it('computes haiku-4-5 cost: 100in+50out+80cacheRead+20cacheWrite → ≥1¢', async () => {
    const llm = realLLM('test-key');
    const res = await llm.call({ system: 'sys', user: 'usr', model: 'claude-haiku-4-5-20251001', mode: 'eco' });
    // 100*80 + 50*400 + 80*8 + 20*100 = 8000+20000+640+2000 = 30640 → 30640/1_000_000 = 0.0306¢ → ceil → 1¢
    expect(res.costCents).toBeGreaterThanOrEqual(1);
  });

  it('passes cache_control: ephemeral on haiku when system >= 16384 chars', async () => {
    const llm = realLLM('test-key');
    await llm.call({ system: 'x'.repeat(16_384), user: 'usr', model: 'claude-haiku-4-5-20251001', mode: 'eco' });
    const callArg = mockCreate.mock.calls[0]![0] as { system: Array<{ cache_control?: unknown }> };
    expect(callArg.system[0]!.cache_control).toEqual({ type: 'ephemeral' });
  });

  it('does NOT apply cache_control on haiku when system < 16384 chars', async () => {
    const llm = realLLM('test-key');
    await llm.call({ system: 'x'.repeat(100), user: 'usr', model: 'claude-haiku-4-5-20251001', mode: 'eco' });
    const callArg = mockCreate.mock.calls[0]![0] as { system: Array<{ cache_control?: unknown }> };
    expect(callArg.system[0]!.cache_control).toBeUndefined();
  });

  it('passes cache_control on sonnet when system >= 4096 chars', async () => {
    const llm = realLLM('test-key');
    await llm.call({ system: 'x'.repeat(4_096), user: 'usr', model: 'claude-sonnet-4-6', mode: 'standard' });
    const callArg = mockCreate.mock.calls[0]![0] as { system: Array<{ cache_control?: unknown }> };
    expect(callArg.system[0]!.cache_control).toEqual({ type: 'ephemeral' });
  });

  it('does NOT apply cache_control on sonnet when system < 4096 chars', async () => {
    const llm = realLLM('test-key');
    await llm.call({ system: 'x'.repeat(500), user: 'usr', model: 'claude-sonnet-4-6', mode: 'standard' });
    const callArg = mockCreate.mock.calls[0]![0] as { system: Array<{ cache_control?: unknown }> };
    expect(callArg.system[0]!.cache_control).toBeUndefined();
  });
});
