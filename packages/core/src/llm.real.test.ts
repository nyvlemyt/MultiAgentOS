import { describe, it, expect, afterEach, vi } from 'vitest';
import { claudeCodeLLM, AUTONOMY_TO_PERMISSION } from './llm.real.js';

const captured: { options?: Record<string, unknown> } = {};

vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: (arg: { options: Record<string, unknown> }) => {
    captured.options = arg.options;
    return (async function* () {
      yield {
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
    })();
  },
}));

const REQ = { user: 'hi', model: 'claude-x', mode: 'eco' } as const;

afterEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
  captured.options = undefined;
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
});
