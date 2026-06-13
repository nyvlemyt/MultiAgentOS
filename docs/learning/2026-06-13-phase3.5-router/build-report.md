# Phase 3.5 · Multi-account/multi-model Router — Build Report

**Date**: 2026-06-13 · **Branch**: `phase/3.5-router` · **Architecture**: ADR 0002 (Accepted) · **Policy**: CLAUDE.md §11 unchanged + §11.bis · **Plan**: `docs/learning/2026-06-13-phase3.5-preflight/plan.md`

Built router-core only (steps 1–6 + parity), per plan §1 default recommendation. Language mode + Quality Controller agent deferred to a 3.5b slice (not started).

## Done

| Step | What shipped | Tests |
|---|---|---|
| 1 — Provider abstraction | `packages/core/src/providers/`: `types.ts`, `credentials.ts` (`.env.local` loader, missing key ⇒ disabled + warn, never crash), `claude-account.ts` (per-account `CLAUDE_CONFIG_DIR` via `extraEnv`), `gemini.ts`, `openai-compat.ts` + `openai.ts`/`perplexity.ts` (paid, fetch-based, no SDK dep), `http.ts` (status-carrying errors) | credentials.test (7), clients.test (5) — all provider calls mocked, zero network |
| 2 — Routing config | `config/model-routing.json` (9-domain table seeded from ROADMAP; `claude_accounts: []`; `paid_apis_enabled: false`), `config.ts` loader (zod-validated, missing/invalid ⇒ Claude-only) + `buildSourceStatuses` | config.test (5) |
| 3 — RouterLLMClient | `packages/core/src/llm.router.ts`: domain → first enabled fresh source; per-source window state (`fresh`/`blocked` + TTL reset); 429/quota ⇒ block + failover + `provider_fallback` event; 529 ⇒ bounded retry same source; `code-execution` hard-pinned to Claude; unmapped domain ⇒ default Claude; claude pool expands to declared accounts | llm.router.test (20) |
| 4 — Dispatcher wiring | `LLMRequest.domain` set from `SkillRouter.domainFor(skillIds)`; `selectLLM` returns the router only when ≥1 non-default source enabled (via `createRouterLLM` factory), else plain `claudeCodeLLM`; `MAS_MOCK_LLM` short-circuit stays first; `provider_fallback` + `provider` logged to events | dispatch-routing.test (4), factory.test (3), skills domainFor (2) |
| 5 — Lint guard | `scripts/lint-no-sdk-payg.sh` extended: `openai` + `@google/generative-ai` imports forbidden outside `packages/core/src/providers/`; `@anthropic-ai/sdk` ban unchanged; import-form regex (won't match plain string literals) | lint-guard.test (5), both directions |
| 6 — /tokens breakdown | `provider` rides the LLM-call event payload; `getTokenSnapshot().byProvider` groups today's spend by source (unattributed ⇒ `claude`); `/tokens` renders a per-source table; seed attaches providers | tokens.test (2) |
| 7 — Grounding parity | `grounding-parity.test.ts`: same task served by primary + failover target receives a byte-identical injected memory/context block (ADR 0002 §4, by construction — router forwards `req` verbatim) | grounding-parity.test (1) |

## Deferred (with reason)

- **Language mode (fr/en) + topbar toggle** — separable "feature additionnelle" (ROADMAP), not router-core. Plan §1 default = router-core only. → 3.5b.
- **Quality Controller agent** — separable pipeline gate (AGENTS.md §4), not required for routing. → 3.5b.
- **Live `rate_limit_event` utilization %** — ADR 0002 Q2: `utilization` is absent when `status: allowed` (claude-code#50518); router uses the error taxonomy (429/529) + window state instead, not a live %. Intentional.

## DoD status (plan §5 — all 8 binary)

1. ✅ Router resolves all 9 domains (test matrix); `code-execution` pinned to Claude.
2. ✅ 429/quota ⇒ next source + `provider_fallback` logged; 529 ⇒ retry same source, no failover (both paths tested).
3. ✅ Defaults honor §11.bis: paid providers disabled, **no network call attempted** — asserted via `fetchSpy` not called in factory.test when sources disabled.
4. ✅ Grounding parity test green.
5. ✅ Lint guard rejects provider imports outside `providers/`; `pnpm lint` EXIT=0.
6. ✅ `/tokens` shows per-provider breakdown with seeded events.
7. ✅ 4/4 canonical green: `pnpm -r test` (all suites), `pnpm lint` (0), `pnpm build` (0), `lsof -ti:3000|xargs kill` + `pnpm --filter @mas/web smoke` (20 passed).
8. ✅ No scope creep: no QMD/Graphify; 4.5 receptacle untouched; ADR 0002 + §11.bis are the only policy changes.

## Commits (off `f7afd3f`)

```
a58a0fb feat(providers): provider abstraction + credentials loader
c70b8d2 feat(router): model-routing config + source statuses
c8a5be5 feat(router): RouterLLMClient with failover taxonomy
756c239 feat(dispatch): route by skill domain via RouterLLMClient
44ffd65 feat(lint): confine provider SDK imports to providers/
efaae0e feat(tokens): per-provider spend breakdown
e8f33d7 test(router): grounding parity across providers (DoD #4)
278a253 test(web): run all vitest specs, not just playwright config
```

## Notes for review

- **Billing safety**: paid providers (`openai`, `perplexity`) ship `paid: true` + `paid_apis_enabled: false`; `resolveProviderStatus` disables them even with a key present. Gemini-free + Claude pool are the only default-enabled sources. `@anthropic-ai/sdk` PAYG ban untouched.
- **MAS_MOCK_LLM seam**: untouched — still the first branch in `selectLLM`. Router sits behind it. `dispatch.test.ts` pins the router off via `MAS_ROUTING_CONFIG=/nonexistent` so a developer's local `.env.local` can't skew the token fixtures.
- **No `.env.local` committed**; loader returns `{}` when absent.
- **`@mas/web` test script** widened from `vitest run playwright.config.test.ts` to `vitest run` so `pnpm -r test` covers `lib/*.test.ts`.

**STOP for review.** 4.5 receptacle and Phase 5 not started.
