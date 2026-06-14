import type { Risk } from './types';
import type { PermissionsConfig } from './permissions';

// Pure, deterministic risk classifier. Mirrors the CLAUDE.md §5 "always-gate"
// list as a rule table → blocking. No Date.now(), no I/O, no LLM here; the LLM
// refinement (Sec Reviewer) is a separate seam, signalled by needsLLMFallback.

export interface ClassifyInput {
  readonly title: string;
  readonly description: string;
  readonly action?: string;
}

export interface ClassifyOptions {
  readonly perms?: PermissionsConfig;
  readonly declaredRisk?: Risk;
}

export interface ClassifyResult {
  readonly risk: Risk;
  readonly rule: string;
  readonly needsLLMFallback: boolean;
}

interface RiskRule {
  readonly pattern: RegExp;
  readonly risk: Risk;
  readonly rule: string;
}

const RISK_ORDER: Record<Risk, number> = { low: 0, medium: 1, high: 2, blocking: 3 };

function stricter(a: Risk, b: Risk): Risk {
  return RISK_ORDER[a] >= RISK_ORDER[b] ? a : b;
}

// §5 always-gate rules → blocking. Hoisted to a single readonly source of truth
// (no duplicated string literals scattered across call sites).
const BLOCKING_RULES: readonly RiskRule[] = [
  { pattern: /\brm\b/i, risk: 'blocking', rule: 'rm' },
  { pattern: /git\s+reset\s+--hard/i, risk: 'blocking', rule: 'git reset --hard' },
  { pattern: /git\s+push\s+(?:--force|-f)\b/i, risk: 'blocking', rule: 'git push --force' },
  { pattern: /git\s+branch\s+-D\b/i, risk: 'blocking', rule: 'branch deletion' },
  { pattern: /git\s+push\b.*--delete\b/i, risk: 'blocking', rule: 'branch deletion' },
  { pattern: /\.env\b/i, risk: 'blocking', rule: 'env/secrets write' },
  { pattern: /\bsecrets?\b/i, risk: 'blocking', rule: 'env/secrets write' },
  { pattern: /\bkeystore\b/i, risk: 'blocking', rule: 'env/secrets write' },
  { pattern: /curl\b[^\n]*\|\s*sh\b/i, risk: 'blocking', rule: 'curl | sh' },
  { pattern: /\beval\b/i, risk: 'blocking', rule: 'eval' },
  { pattern: /\bsudo\b/i, risk: 'blocking', rule: 'sudo' },
];

// Shell-ish tokens that, with no concrete §5 match, signal the LLM/Sec-Reviewer
// refinement seam (ambiguous — could be safe or not).
const SHELL_HINT = /\bbash\b|\bsh\s+-c\b|>|\||\bchmod\b|\bssh\b/i;

export function classifyRisk(input: ClassifyInput, opts: ClassifyOptions = {}): ClassifyResult {
  const haystack = `${input.title}\n${input.description}\n${input.action ?? ''}`;

  for (const r of BLOCKING_RULES) {
    if (r.pattern.test(haystack)) {
      return { risk: 'blocking', rule: r.rule, needsLLMFallback: false };
    }
  }

  // Perms-declared high/blocking categories: an outbound/send/payment/message
  // category whose action text appears in the task raises the risk.
  for (const cat of opts.perms?.categories ?? []) {
    if (cat.risk !== 'high' && cat.risk !== 'blocking') continue;
    if (haystack.toLowerCase().includes(cat.action.toLowerCase())) {
      return { risk: cat.risk, rule: `perms:${cat.category}`, needsLLMFallback: false };
    }
  }

  const baseRisk = stricter('low', opts.declaredRisk ?? 'low');
  return {
    risk: baseRisk,
    rule: 'none',
    needsLLMFallback: SHELL_HINT.test(haystack),
  };
}
