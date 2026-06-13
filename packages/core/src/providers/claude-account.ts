import type { LLMClient } from '../llm.js';
import { claudeCodeLLM, type ClaudeCodeLLMOptions } from '../llm.real.js';
import type { ClaudeAccount } from './types.js';

/**
 * One LLMClient per Claude account: same Agent SDK runner, isolated profile via
 * per-account CLAUDE_CONFIG_DIR (ADR 0002 Q1 — claude-code#44687 workaround).
 * Factory injectable for tests (zero network, zero quota).
 */
export function claudeAccountLLM(
  account: ClaudeAccount,
  opts: ClaudeCodeLLMOptions = {},
  factory: (opts: ClaudeCodeLLMOptions) => LLMClient = claudeCodeLLM,
): LLMClient {
  const inner = factory({
    ...opts,
    extraEnv: { ...opts.extraEnv, CLAUDE_CONFIG_DIR: account.configDir },
  });
  return {
    async call(req) {
      const resp = await inner.call(req);
      return { ...resp, provider: account.id };
    },
  };
}
