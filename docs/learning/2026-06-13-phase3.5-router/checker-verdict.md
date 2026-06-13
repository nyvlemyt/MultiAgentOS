# Phase 3.5 · Multi-account Router — Checker Verdict

**Date**: 2026-06-13 · **Branch**: `phase/3.5-router` · **Reviewer**: Claude (mas-reviewer, adversarial/independent) · **Method**: canonical `pnpm -r test` + `pnpm lint` + `pnpm build` + smoke. `MAS_MOCK_LLM` and `ANTHROPIC_API_KEY` both empty in env (verified, no global artifact).

## Verdict: **PASS**

All 8 DoD criteria met with code-level evidence; 4/4 canonical green. No blocking findings. Router-core scope only (language mode + QC agent correctly deferred to 3.5b, per plan §1).

---

## DoD checks

### 1. All 9 domains resolve; code-execution pinned to Claude — **PASS**
Test matrix at [llm.router.test.ts:60-95](../../../packages/core/src/llm.router.test.ts#L60-L95) covers all 9 domains (`search, research, code-review, ux, writing, code-execution, planning, memory, security`) with paid OFF, plus unmapped-domain and no-domain → `claude`. `code-execution` hard-pinned at [llm.router.ts:78-79](../../../packages/core/src/llm.router.ts#L78-L79) (`if (domain === 'code-execution') return [CLAUDE_POOL]`), independent of config. Confirmed pinned even with `paid: true` at [llm.router.test.ts:104-110](../../../packages/core/src/llm.router.test.ts#L104-L110) — openai/perplexity `.call` asserted not called.

### 2. Failover taxonomy: 429/quota → blocked + provider_fallback; 529 → retry, no failover — **PASS**
`classify()` at [llm.router.ts:36-41](../../../packages/core/src/llm.router.ts#L36-L41): 429/`QUOTA_EXHAUSTED` → `quota`, 529/`OVERLOADED` → `overloaded`. Quota path marks `blockedAt` + emits `provider_fallback` + advances ([llm.router.ts:110-116](../../../packages/core/src/llm.router.ts#L110-L116)). Overloaded path = bounded retry on SAME client, never advances ([llm.router.ts:124-135](../../../packages/core/src/llm.router.ts#L124-L135)). Tests: 429 ⇒ failover + event + window stays blocked on next call ([test:114-133](../../../packages/core/src/llm.router.test.ts#L114-L133)); 529 ⇒ 2 calls same source, `claude.call` not called, `events == []`, window still fresh ([test:145-154](../../../packages/core/src/llm.router.test.ts#L145-L154)); 529-exhausted propagates with no failover ([test:156-161](../../../packages/core/src/llm.router.test.ts#L156-L161)).

### 3. §11.bis defaults: paid off, no network attempted, missing key = warn — **PASS**
`config/model-routing.json`: `paid_apis_enabled: false`, openai/perplexity `paid: true`. `resolveProviderStatus` disables paid providers when flag off and disables on missing key with `console.warn` (never throws) — [credentials.ts:38-50](../../../packages/core/src/providers/credentials.ts#L38-L50). **No-network proof**: factory.test "repo defaults (no keys, no accounts) ⇒ undefined, zero network" asserts `fetchSpy` not called and router `undefined` ([factory.test.ts:38-48](../../../packages/core/src/providers/factory.test.ts#L38-L48)). Gemini path only fires fetch when key present ([factory.test.ts:50-73](../../../packages/core/src/providers/factory.test.ts#L50-L73)).

### 4. Provider SDK imports confined; @anthropic-ai/sdk forbidden — **PASS**
Lint guard [scripts/lint-no-sdk-payg.sh:38-46](../../../scripts/lint-no-sdk-payg.sh#L38-L46) confines `openai` + `@google/generative-ai` to `packages/core/src/providers/`; @anthropic-ai/sdk ban (api-fallback only) unchanged. Independent grep: **zero** `openai`/`@google/generative-ai` imports outside `providers/`; **zero** runtime `@anthropic-ai/sdk` imports. Guard run directly = `PASS`. In-suite "passes the real repo tree" test green ([lint-guard.test.ts:80-82](../../../packages/core/src/providers/lint-guard.test.ts#L80-L82)). Note: providers are fetch-based (no SDK dependency) — guard still proves confinement.

### 5. Grounding parity test exists and green — **PASS**
[grounding-parity.test.ts:41-71](../../../packages/core/src/grounding-parity.test.ts#L41-L71): same task served by gemini then (after forced 429 failover) by claude — asserts byte-identical `system` and `user` across both providers. Green. Parity is by construction — router forwards `req` verbatim ([llm.router.ts:105](../../../packages/core/src/llm.router.ts#L105)).

### 6. MAS_MOCK_LLM seam intact — **PASS**
`selectLLM` keeps `if (process.env.MAS_MOCK_LLM === '1') return mockLLM()` as the FIRST branch ([dispatch.ts:87](../../../packages/agents/src/dispatch.ts#L87)); router resolved only after, behind `createRouterLLM` (returns undefined unless a non-default source is enabled). `dispatch.test.ts` 8/8 green via canonical command; pins router off with `MAS_ROUTING_CONFIG=/nonexistent` so local `.env.local` can't skew fixtures.

### 7. /tokens per-provider breakdown — **PASS**
`getTokenSnapshot().byProvider` groups today's spend by `provider` from the event payload, unattributed → `claude` ([tokens.ts:68-87](../../../apps/web/lib/tokens.ts#L68-L87)). Page renders "Spend by provider — today" table ([tokens/page.tsx:66-82](../../../apps/web/app/(cockpit)/tokens/page.tsx#L66-L82)). `tokens.test.ts` 2/2 green; smoke renders `/tokens`.

### 8. No scope creep — **PASS**
Diff vs `main` (40 files, +1843) touches only providers/router/dispatch/tokens/config/lint/docs + seed (+7, attaches provider to seeded events) + skills `domainFor` (+9). Grep for `qmd|graphify|receptacle|ideas|decision-log|prioriti` in changed files = NONE. No real API keys committed (only mock `pplx-test` / `'k'` in tests). `.env.local` not tracked; `.gitignore` has `.env` + `.env.*`. Only policy changes are ADR 0002 + §11.bis (CLAUDE.md).

### 9. 4/4 canonical green
```
pnpm -r test : core 52 ✓ · skills 11 ✓ · memory 41 ✓ · agents 21 ✓ · web 3 ✓ · worker 1 ✓  (all suites pass)
pnpm lint    : PASS (§11 + §11.bis guard) + tsc --noEmit all projects — EXIT 0
pnpm build   : Done (Next.js build, /tokens route present)
smoke        : 20 passed (23.6s)  [pnpm --filter @mas/web smoke, port 3000 cleared first]
```

---

## Findings

| Severity | Finding |
|----------|---------|
| info | Providers are fetch-based (`openai-compat.ts`, `gemini.ts`) — no `openai`/`@google/generative-ai` package dependency. Lint guard still asserts confinement, so the §11.bis contract holds even though there is currently nothing to confine. Confidence: high. Not a defect — surfaced for the human's awareness in case a future provider adds a real SDK. Where: [packages/core/src/providers/openai-compat.ts](../../../packages/core/src/providers/openai-compat.ts). |
| info | `blockedTtlMs` defaults to 5h with no persistence across worker restarts — window state is in-memory (`blockedAt` Map). Matches ADR 0002 "reset on first successful call" intent for a single process; cross-restart persistence (events table) noted in plan §2 step 3 but not implemented. Not in DoD; flagging for the 3.5b/Phase-5 backlog. Confidence: medium. Where: [llm.router.ts:45](../../../packages/core/src/llm.router.ts#L45),[64-74](../../../packages/core/src/llm.router.ts#L64-L74). |

No `warn` or `block` findings.

## ReviewerVerdict (JSON)

```json
{
  "taskId": "phase-3.5-router-checker",
  "verdict": "PASS",
  "findings": [
    {
      "severity": "info",
      "message": "Providers are fetch-based (openai-compat.ts, gemini.ts); no openai/@google SDK dependency present. Lint guard still confines. Where: packages/core/src/providers/openai-compat.ts. Why: future SDK additions stay covered by the existing guard. Confidence: high."
    },
    {
      "severity": "info",
      "message": "Quota-window block state is in-memory (blockedAt Map, 5h TTL), not persisted across worker restarts. Where: packages/core/src/llm.router.ts:45,64-74. Why: cross-restart persistence (plan §2 step 3, events table) deferred; not in DoD. Confidence: medium."
    }
  ]
}
```

**Recommendation**: merge-ready pending human approval. Phase 3.5b (language mode + Quality Controller agent) and Phase 4.5-receptacle remain unstarted, as planned.
