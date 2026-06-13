# Phase 3.5 · Multi-account Router — ready-to-paste build prompts

Two prompts: **Doer** then **Checker**. Pre-flight is DONE (ADR 0002 finalized, §11.bis added, plan in this folder). Branch `phase/3.5-router` already exists with the pre-flight commits.

> **Decide at kickoff:** router-core only (steps 1–6, recommended) or also 3.5b (language mode + Quality Controller). Default: **router-core only**; update ROADMAP if split.

---

## ① DOER — paste this to build Phase 3.5

```
Build Phase 3.5 (Multi-account/multi-model Router) of MultiAgentOS on the existing branch
phase/3.5-router.

Read first: CLAUDE.md (§11 + NEW §11.bis, §5, §6), ROADMAP.md "Phase 3.5",
docs/decisions/0002-multi-model-router.md (Accepted — open questions RESOLVED, follow them),
docs/learning/2026-06-13-phase3.5-preflight/plan.md (build steps + DoD),
docs/knowledge/anthropic-ecosystem.md §"Multi-account + signaux quota".
Pre-flight is already done — do NOT redo it. THEN build.

Rules:
- §11 unchanged: @anthropic-ai/sdk forbidden everywhere. §11.bis: provider SDKs ONLY under
  packages/core/src/providers/; paid APIs (openai, perplexity) opt-in, default OFF
  (paid_apis_enabled: false); default sources = pooled Claude accounts + Gemini free.
- ALL provider calls mocked in tests — zero network, zero token spent, zero PAYG.
- Failover taxonomy (ADR 0002 Q2): 429/quota → mark source blocked + fail over +
  provider_fallback event; 529/overloaded → bounded retry SAME source, never failover.
- code-execution domain hard-pinned to Claude accounts. Execution = Claude-only (§11.bis rule 4).
- Do not break the MAS_MOCK_LLM seam (mock short-circuit stays first in selectLLM).
  Canonical `pnpm -r test` — never export MAS_MOCK_LLM globally.
- TDD (superpowers:test-driven-development). Conventional Commits ≤60 chars. eco prose.
  Never push to main, never merge.
- Token budget this session: 40k. At 80%, pause and report.

Build, in this order, committing + verifying each step (plan.md §2 has the details):
1. packages/core/src/providers/ — types + credentials loader (missing key = disabled + warn,
   never crash) + claude-account.ts (CLAUDE_CONFIG_DIR per account) + gemini.ts;
   openai.ts/perplexity.ts behind the paid flag. TDD.
2. config/model-routing.json — claude_accounts [] (schema-only), paid_apis_enabled false,
   9-domain table seeded from ROADMAP but resolved against ENABLED sources only.
3. packages/core/src/llm.router.ts — RouterLLMClient: domain → first enabled fresh source;
   window state per source; failover per taxonomy; provider_fallback logged; unmapped domain →
   default Claude. TDD all 9 domains + both failure paths.
4. Dispatcher: LLMRequest.domain from the task's skill domain tags (Phase 3 taxonomy);
   selectLLM returns router only when config enables >0 non-default sources. TDD.
5. Lint guard: extend scripts/lint-no-sdk-payg.sh — openai/@google/generative-ai imports
   forbidden outside packages/core/src/providers/. Test with a fixture.
6. /tokens per-provider breakdown (provider field on LLM-call event payloads; group by source).
7. Grounding parity test: same task via two mocked providers gets an identical injected
   memory/context block.

Definition of Done = plan.md §5 (all 8 binary, including 4/4 canonical:
pnpm -r test · pnpm lint · pnpm build · lsof -ti:3000|xargs kill then
pnpm --filter @mas/web smoke).

Then write docs/learning/<date>-phase3.5-router/build-report.md (done / deferred+reason /
DoD status / commit list) and STOP for my review. Do NOT start the 4.5 receptacle or Phase 5.
```

---

## ② CHECKER — paste in a separate session to verify

```
Verify Phase 3.5 (Multi-account Router) of MultiAgentOS against its exit criteria. Read-only —
do NOT fix, report.

Read: docs/decisions/0002-multi-model-router.md, CLAUDE.md §11.bis,
docs/learning/2026-06-13-phase3.5-preflight/plan.md §5 (DoD), ROADMAP.md "Phase 3.5",
the build-report under docs/learning/.

Method: canonical `pnpm -r test` (never export MAS_MOCK_LLM globally — known env artifact).

Check, each PASS/FAIL with evidence:
1. All 9 domains resolve; code-execution pinned to Claude (find the test matrix).
2. Failover taxonomy: 429/quota → blocked + provider_fallback event; 529 → retry same source,
   no failover (find both tests).
3. §11.bis defaults: paid_apis_enabled false; openai/perplexity disabled by default and no
   network attempted (mock spies); missing key = warn not crash.
4. Provider SDK imports confined to packages/core/src/providers/ (lint guard + grep);
   @anthropic-ai/sdk still forbidden everywhere.
5. Grounding parity test exists and is green.
6. MAS_MOCK_LLM seam intact (dispatch.test.ts green via canonical command).
7. /tokens shows per-provider breakdown.
8. No scope creep: no QMD/Graphify/receptacle; no real API keys committed; .env.local gitignored.
9. 4/4 canonical green (paste output).

Output verdict PASS / NEEDS_WORK / BLOCK with findings. Then WRITE the full verdict (markdown +
ReviewerVerdict JSON) to docs/learning/<date>-phase3.5-router/checker-verdict.md and commit it
(docs-only commit) so the main session can read it without copy-paste. Do not modify any other file.
```
