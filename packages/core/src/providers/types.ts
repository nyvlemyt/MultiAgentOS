// Phase 3.5 provider abstraction (ADR 0002, CLAUDE.md §11.bis).
// Non-Claude providers do cognition only; execution stays Claude-only.

export type ProviderKind = 'claude-account' | 'gemini' | 'openai' | 'perplexity';

export interface ClaudeAccount {
  id: string;
  /** Per-account CLAUDE_CONFIG_DIR — isolated Claude Code profile (ADR 0002 Q1). */
  configDir: string;
  plan?: string;
}

export interface ProviderDef {
  id: string;
  kind: ProviderKind;
  /** Env var name holding the API key (.env.local). Absent for claude-account. */
  apiKeyEnv?: string;
  model?: string;
  baseUrl?: string;
  /** Paid per-token API — gated behind paid_apis_enabled (§11.bis rule 2). */
  paid?: boolean;
}

export interface DomainRoute {
  primary: string;
  fallback: string[];
}

export interface RoutingConfig {
  claude_accounts: ClaudeAccount[];
  paid_apis_enabled: boolean;
  providers: Record<string, ProviderDef>;
  domains: Record<string, DomainRoute>;
}

export interface SourceStatus {
  id: string;
  enabled: boolean;
  reason?: 'missing_key' | 'paid_apis_disabled';
}
