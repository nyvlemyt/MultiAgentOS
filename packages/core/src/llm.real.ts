// SDK surface verified: @anthropic-ai/claude-agent-sdk@0.3.150 (sdk.d.ts:1931)
//   PermissionMode = 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan' | 'dontAsk' | 'auto'
//   query() Options.permissionMode?: PermissionMode  (sdk.d.ts:1591)
//   query() Options.cwd?: string                     (sdk.d.ts:1283)
//   query() Options.resume?: string                  (sdk.d.ts:1654)
//   query() Options.systemPrompt?: string | string[] | { type:'preset'; preset:'claude_code'; append?:string }
//                                                    (sdk.d.ts:1865)
//   SDKResultSuccess.usage: NonNullableUsage          (sdk.d.ts:3434)
//     token fields: input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens
//     (cache_creation is a distinct BetaCacheCreation object — not a count)
//   SDKResultSuccess.total_cost_usd: number           (sdk.d.ts:3433)
//   SDKResultSuccess.session_id: string               (sdk.d.ts:3443)
//   SDKAssistantMessageError includes 'rate_limit'    (sdk.d.ts:2574)
//   Options.env replaces process.env entirely when set (sdk.d.ts:1342)
//     → must strip ANTHROPIC_API_KEY before passing env to subprocess
//
// Decision (ADR 0001 amendments §Q1): SDK exposes all four autonomy-level modes.
// No ShellMissionRunner needed — permissionMode is a flag on the single claudeCodeLLM runner.
//   manual     → 'plan'         (propose-only, no writes)
//   assisted   → 'default'      (prompts for dangerous ops)
//   autonomous → 'acceptEdits'  (auto-accept file edits)
//   autopilot  → 'acceptEdits'  (bypassPermissions withheld — requires explicit user opt-in)

import { query } from '@anthropic-ai/claude-agent-sdk';
import type { EffortLevel, PermissionMode, SDKResultSuccess } from '@anthropic-ai/claude-agent-sdk';
import type { LLMClient, LLMRequest, LLMResponse } from './llm.js';
import type { Mode } from './types.js';

const MODE_TO_EFFORT: Record<Mode, EffortLevel> = {
  eco: 'medium',      // cost-sensitive, short tasks
  standard: 'high',   // default — balances quota/intelligence
  expert: 'xhigh',    // coding and agentic use cases
};

export type AutonomyLevel = 'manual' | 'assisted' | 'autonomous' | 'autopilot';

export const AUTONOMY_TO_PERMISSION: Record<AutonomyLevel, PermissionMode> = {
  manual: 'plan',
  assisted: 'default',
  autonomous: 'acceptEdits',
  autopilot: 'acceptEdits',
};

export interface ClaudeCodeLLMOptions {
  sessionId?: string;
  cwd?: string;
  autonomyLevel?: AutonomyLevel;
  /** Merged into the subprocess env — used for per-account CLAUDE_CONFIG_DIR (ADR 0002 Q1). */
  extraEnv?: Record<string, string>;
  /**
   * Opt-in (default OFF): expose the local QMD `query` MCP tool to the dispatched
   * agent, scoped least-privilege to `mcp__qmd__query` only — never get/multi_get/
   * status (CLAUDE.md §5, ADR 0007 §Décision-5). When false/undefined the options
   * object passed to the SDK `query()` is byte-identical to the no-MCP default path.
   * QMD stays queried out-of-worker via CLI; this only makes it reachable to agents.
   *
   * Wiring-only by decision: the dispatch path (`selectLLM`/`buildMissionLLM`)
   * intentionally does NOT plumb this flag yet — runtime activation is deferred to
   * Étape 1 (ADR 0007 amendment 2026-06-25 / finding F1). Tracked in
   * docs/backlog/arsenal-mcp-runtime-activation.md.
   */
  mcp?: boolean;
}

/** Least-privilege QMD MCP wiring for in-loop agents (ADR 0007 §Décision-5). */
function qmdMcpServers(): Record<string, { command: string; args: string[] }> {
  return { qmd: { command: 'qmd', args: ['mcp'] } };
}
function qmdAllowedTools(): string[] {
  return ['mcp__qmd__query'];
}

export function claudeCodeLLM(opts: ClaudeCodeLLMOptions = {}): LLMClient {
  if (process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      '[llm.real] ANTHROPIC_API_KEY is set — would route billing to PAYG.' +
        ' Unset it and authenticate via `claude login`. See CLAUDE.md §11.',
    );
  }

  return {
    // §7 length exception (F-FN-4, docs/backlog/function-length-debt.md): call() runs ~74 lines
    // but is intentionally NOT split. It is the single §11 billing-isolation injection point —
    // ANTHROPIC_API_KEY strip, query() option assembly, the result for-await loop, and quota/usage
    // mapping are kept co-located so the whole subscription-billing path stays auditable in one
    // place. Long-but-linear (nesting ≤ 4); no hot-path or correctness concern.
    async call(req: LLMRequest): Promise<LLMResponse> {
      const permissionMode: PermissionMode =
        AUTONOMY_TO_PERMISSION[opts.autonomyLevel ?? 'assisted'];

      // Strip ANTHROPIC_API_KEY from subprocess env.
      // Options.env replaces process.env entirely when set (sdk.d.ts:1342).
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ANTHROPIC_API_KEY: _drop, ...safeEnv } = process.env as Record<
        string,
        string | undefined
      >;

      const q = query({
        prompt: req.user,
        options: {
          cwd: opts.cwd,
          resume: opts.sessionId,
          model: req.model,
          permissionMode,
          effort: MODE_TO_EFFORT[req.mode],
          // Append orchestrator context to Claude Code's default system prompt.
          // preset keeps native skill loading, tool definitions, and memory injection intact.
          systemPrompt: req.system
            ? { type: 'preset', preset: 'claude_code', append: req.system }
            : { type: 'preset', preset: 'claude_code' },
          // maxTokens not mapped: Agent SDK uses maxTurns, not per-call token limits.
          // Budget enforcement happens at the worker level via the budgets table check.
          env: { ...(safeEnv as Record<string, string>), ...opts.extraEnv },
          // Opt-in only: when opts.mcp is off, these keys are absent and the options
          // object is byte-identical to the historical default path.
          ...(opts.mcp ? { mcpServers: qmdMcpServers(), allowedTools: qmdAllowedTools() } : {}),
        },
      });

      let success: SDKResultSuccess | undefined;
      let failReason: string | undefined;

      for await (const event of q) {
        if (event.type !== 'result') continue;
        if (event.subtype === 'success') {
          success = event;
        } else {
          failReason = event.stop_reason ?? event.subtype;
        }
      }

      if (!success) {
        if (failReason === 'rate_limit') {
          throw Object.assign(
            new Error(
              '[llm.real] Subscription window exhausted (rate_limit). See TOKEN_STRATEGY.md §8.',
            ),
            { code: 'QUOTA_EXHAUSTED' },
          );
        }
        throw new Error(`[llm.real] query failed: ${failReason ?? 'no result message'}`);
      }

      const u = success.usage;
      // total_cost_usd is an estimation heuristic under subscription billing, not a real bill.
      // Stored as quotaUnits (integer cents-equivalent) for the quota meter. See ADR 0001 §Decision clause 5.
      const quotaUnits = Math.round(success.total_cost_usd * 100);

      return {
        text: success.result,
        inputTokens: u.input_tokens,
        outputTokens: u.output_tokens,
        cacheReadTokens: u.cache_read_input_tokens,
        cacheCreationTokens: u.cache_creation_input_tokens,
        quotaUnits,
        model: req.model,
        sessionId: success.session_id,
      };
    },
  };
}
