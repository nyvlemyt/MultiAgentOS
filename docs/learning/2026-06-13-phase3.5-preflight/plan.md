# Phase 3.5 · Multi-account/multi-model Router — Pre-flight Plan

**Date**: 2026-06-13 · **Prereq**: Phase 4 + 4.5-producer merged (PR #5, #6) · **Architecture**: ADR 0002 (Accepted, questions resolved) · **§11.bis** added to CLAUDE.md.

> Status: pre-flight done — build green-lit ("go Phase 3.5", 2026-06-13). Branch `phase/3.5-router` (off main).

## 0. Pre-flight findings (already distilled)

See ADR 0002 §Open questions — RESOLVED + `docs/knowledge/anthropic-ecosystem.md §Multi-account`:
- Multi-account = per-account `CLAUDE_CONFIG_DIR` (isolated profiles).
- Failover signal = SDK `rate_limit_event` + 429/quota; 529 = retry, never failover.
- Paid APIs (OpenAI/Perplexity) opt-in, default OFF; default chain = Claude accounts pooled → Gemini free.
- Grounding parity by construction (Phase 4 memory + context packs injected explicitly), tested at DoD.

## 1. Scope decision at kickoff

**Default recommendation: router-core only (steps 1–6).** The two ROADMAP "features additionnelles" — language mode (fr/en) and the Quality Controller agent — are separable; defer to a 3.5b slice unless budget allows. Update ROADMAP if split.

## 2. Build steps (TDD, commit + verify each)

1. **Provider abstraction** — `packages/core/src/providers/`: `types.ts` (`ProviderClient`, `ProviderSource = {id, kind, configDir?|apiKeyEnv?}`), `credentials.ts` (loads `.env.local`; missing key ⇒ provider disabled + startup warning, never crash), `claude-account.ts` (wraps existing `claudeCodeLLM`, passes the account's `CLAUDE_CONFIG_DIR`), `gemini.ts`. `openai.ts` + `perplexity.ts` behind `paid_apis_enabled`. **All provider calls mocked in tests — zero network, zero PAYG.**
2. **Routing config** — `config/model-routing.json`: `claude_accounts: []` (schema-only, empty default), `paid_apis_enabled: false`, `domains: {<9 domains> → {primary, fallback[]}}` seeded from the ROADMAP table but **resolved against enabled sources only** (disabled primary ⇒ walk the chain).
3. **RouterLLMClient** — `packages/core/src/llm.router.ts`: resolves `LLMRequest.domain` → first enabled source with a fresh window; tracks window state per source (`fresh|blocked` + blockedAt) from call outcomes; 429/quota ⇒ mark blocked + fail over + `provider_fallback {from, to, reason}` event; 529 ⇒ bounded retry same source; `code-execution` hard-pinned to Claude accounts (§11.bis rule 4). Falls back to default Claude account when a domain is unmapped.
4. **Dispatcher wiring** — `LLMRequest.domain` (optional) set from the task's skill domain tags (Phase 3 taxonomy, `skills` table); `selectLLM` returns the router when `config/model-routing.json` has >0 enabled non-default sources, else current behavior (MAS_MOCK_LLM seam untouched).
5. **Lint guard** — extend `scripts/lint-no-sdk-payg.sh`: `openai` / `@google/generative-ai` imports forbidden outside `packages/core/src/providers/`; `@anthropic-ai/sdk` ban unchanged.
6. **/tokens breakdown** — per-source spend rows (events already carry tokens; add `provider` to the LLM-call event payload; page groups by provider/account).

*(3.5b if split: language mode `config/project.json language: fr|en` + topbar toggle; Quality Controller agent per AGENTS.md §4.)*

## 3. Tests

- `providers/credentials.test.ts` — missing key ⇒ disabled + warn, no crash.
- `llm.router.test.ts` — all 9 domains resolve; paid-off default: search/research → gemini-free (not Perplexity); paid-on (mock): research → perplexity; code-execution always claude; 429 ⇒ failover + `provider_fallback` event; 529 ⇒ retry same source; unmapped domain ⇒ default Claude.
- Grounding parity — same task through two mocked providers receives identical injected memory/context block.
- Dispatcher — task with `search`-tagged skill sets `domain: 'search'` on the request.
- Lint guard — fixture import of `openai` outside providers/ fails the script.

## 4. Risks

| Risk | Mitigation |
|---|---|
| Paid API silently billed | `paid_apis_enabled: false` default + lint confinement + credentials warn |
| 529 misread as quota ⇒ account ping-pong | error taxonomy in router (ADR 0002 Q2); test both paths |
| CLAUDE_CONFIG_DIR profile drift (plugins/settings divergence) | accounts declared explicitly; doc note: keep profiles minimal, login-only |
| Router breaks MAS_MOCK_LLM test seam | router sits behind `selectLLM`; mock short-circuit stays first |
| Scope blowout (language mode + QC agent) | split decision §1, default router-core only |

## 5. DoD (gate)

1. Router resolves all 9 domains correctly (test matrix), `code-execution` pinned to Claude.
2. Failover: 429/quota ⇒ next source + `provider_fallback` logged; 529 ⇒ retry, no failover (tests).
3. Defaults honor §11.bis: paid providers disabled, no network call attempted (asserted via mock spies).
4. Grounding parity test green.
5. Lint guard rejects provider imports outside `providers/`; `pnpm lint` green.
6. `/tokens` shows per-provider breakdown with seeded events.
7. 4/4 canonical green: `pnpm -r test` · `pnpm lint` · `pnpm build` · `lsof -ti:3000|xargs kill` + `pnpm --filter @mas/web smoke`.
8. No scope creep: no QMD/Graphify; receptacle untouched; ADR 0002 + §11.bis are the only policy changes.
