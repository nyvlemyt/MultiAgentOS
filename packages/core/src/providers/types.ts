// Phase 3.5 provider abstraction (ADR 0002, CLAUDE.md §11.bis).
// Non-Claude providers do cognition only; execution stays Claude-only.

export type ProviderKind = 'claude-account' | 'gemini' | 'openai' | 'perplexity';

export interface ClaudeAccount {
  id: string;
  /** Per-account CLAUDE_CONFIG_DIR — isolated Claude Code profile (ADR 0002 Q1). */
  configDir: string;
  plan?: string;
}

/**
 * What subscription/plan a source runs on. The app must always know this to
 * route and budget correctly (user requirement 2026-06-21). For Claude the
 * Agent-SDK quota is SEPARATE from interactive Claude.ai usage (CLAUDE.md §11
 * billing change 2026-06-15).
 */
export interface PlanInfo {
  /** Human tier: 'max' | 'pro' | 'free' | 'payg' | 'team' | … */
  tier: string;
  billing: 'subscription' | 'payg' | 'free';
  monthlyCostEur?: number;
  /** Monthly Agent-SDK token quota the plan grants, if known/declared. */
  monthlyTokenQuota?: number;
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
  /** Which subscription/plan this provider bills against. */
  plan?: PlanInfo;
}

export interface DomainRoute {
  primary: string;
  fallback: string[];
}

export interface RoutingConfig {
  claude_accounts: ClaudeAccount[];
  paid_apis_enabled: boolean;
  /** The pooled Claude subscription plan (e.g. Max, 100 €/month). */
  claude_plan?: PlanInfo;
  providers: Record<string, ProviderDef>;
  domains: Record<string, DomainRoute>;
}

export interface SourceStatus {
  id: string;
  enabled: boolean;
  reason?: 'missing_key' | 'paid_apis_disabled';
}
