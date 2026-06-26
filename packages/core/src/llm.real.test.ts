import { describe, it, expect, afterEach, vi } from 'vitest';
import { claudeCodeLLM, AUTONOMY_TO_PERMISSION } from './llm.real.js';

const SUCCESS_EVENT = {
  type: 'result',
  subtype: 'success',
  result: 'ok',
  usage: {
    input_tokens: 1,
    output_tokens: 1,
    cache_read_input_tokens: 0,
    cache_creation_input_tokens: 0,
  },
  total_cost_usd: 0,
  session_id: 's1',
};

// `events` lets each test script the result stream the mocked SDK yields, so we
// can drive the success path as well as the no-success failure branches (rate_limit
// → QUOTA_EXHAUSTED, generic) without a live model call (CLAUDE.md §6).
const captured: { options?: Record<string, unknown>; events?: unknown[] } = {};

vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: (arg: { options: Record<string, unknown> }) => {
    captured.options = arg.options;
    const events = captured.events ?? [SUCCESS_EVENT];
    return (async function* () {
      for (const e of events) yield e;
    })();
  },
}));

const REQ = { user: 'hi', model: 'claude-x', mode: 'eco' } as const;

afterEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
  captured.options = undefined;
  captured.events = undefined;
});

describe('claudeCodeLLM', () => {
  it('throws if ANTHROPIC_API_KEY is set at init', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-fake';
    expect(() => claudeCodeLLM()).toThrow(/ANTHROPIC_API_KEY/);
  });

  it('maps each autonomy level to the correct permission mode', () => {
    expect(AUTONOMY_TO_PERMISSION.manual).toBe('plan');
    expect(AUTONOMY_TO_PERMISSION.assisted).toBe('default');
    expect(AUTONOMY_TO_PERMISSION.autonomous).toBe('acceptEdits');
    expect(AUTONOMY_TO_PERMISSION.autopilot).toBe('acceptEdits'); // not bypassPermissions
  });

  it('does not throw when ANTHROPIC_API_KEY is absent', () => {
    delete process.env.ANTHROPIC_API_KEY;
    expect(() => claudeCodeLLM({ cwd: '/tmp', autonomyLevel: 'assisted' })).not.toThrow();
  });

  it('wires least-privilege QMD MCP into options when opted in (mcp: true)', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    await claudeCodeLLM({ mcp: true }).call(REQ);
    const opts = captured.options ?? {};
    expect(opts.mcpServers).toEqual({ qmd: { command: 'qmd', args: ['mcp'] } });
    expect(opts.allowedTools).toContain('mcp__qmd__query');
    // least privilege — do NOT open get/multi_get/status
    expect(opts.allowedTools).not.toContain('mcp__qmd__get');
    expect(opts.allowedTools).not.toContain('mcp__qmd__status');
  });

  it('default path (mcp off) carries no MCP keys — byte-identical to today', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    await claudeCodeLLM().call(REQ);
    const opts = captured.options ?? {};
    expect('mcpServers' in opts).toBe(false);
    expect('allowedTools' in opts).toBe(false);
  });

  it('maps a successful result to usage + quotaUnits and skips non-result events', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    captured.events = [
      { type: 'assistant' }, // non-result → continue branch
      {
        type: 'result',
        subtype: 'success',
        result: 'done',
        usage: {
          input_tokens: 12,
          output_tokens: 8,
          cache_read_input_tokens: 3,
          cache_creation_input_tokens: 2,
        },
        total_cost_usd: 0.05,
        session_id: 'sess-9',
      },
    ];
    // system present → append branch of the systemPrompt ternary.
    const resp = await claudeCodeLLM().call({ ...REQ, system: 'be helpful' });
    expect(resp.text).toBe('done');
    expect(resp.inputTokens).toBe(12);
    expect(resp.outputTokens).toBe(8);
    expect(resp.cacheReadTokens).toBe(3);
    expect(resp.cacheCreationTokens).toBe(2);
    expect(resp.quotaUnits).toBe(5); // round(0.05 * 100)
    expect(resp.sessionId).toBe('sess-9');
    expect(captured.options?.systemPrompt).toMatchObject({ append: 'be helpful' });
  });

  it('throws a coded QUOTA_EXHAUSTED error when the result stop_reason is rate_limit', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    captured.events = [{ type: 'result', subtype: 'error_max_turns', stop_reason: 'rate_limit' }];
    await expect(claudeCodeLLM().call(REQ)).rejects.toMatchObject({ code: 'QUOTA_EXHAUSTED' });
  });

  it('throws a generic error when the query yields no success result', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    captured.events = [{ type: 'result', subtype: 'error_during_execution' }];
    await expect(claudeCodeLLM().call(REQ)).rejects.toThrow(/query failed/);
  });
});
