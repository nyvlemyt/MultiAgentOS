# Phase 9·0b — filled Doer ① + Checker ② + orchestrator launch

## ① Doer (paste to the build subagent)

You are the **Doer** for **Phase 9 · Étape 0b — real doer/checker pipeline** of MultiAgentOS. Autonomous, **TDD** (red before green). You are ALREADY on branch `phase/9b-pipeline` — stay on it; do NOT push, do NOT open a PR (the orchestrator does that).

**Read BEFORE coding** (do not skip — §12/§13): `CLAUDE.md` (§5 risky, §7 5-checks+Sonar, §8 memory write-lock, §11 subscription-only/no `@anthropic-ai/sdk`, §12 knowledge), `docs/learning/2026-06-24-0b-preflight/plan.md` (**your full spec — follow section by section**), `docs/knowledge/sonar-recurring-rules.md`, `docs/knowledge/prompting-anthropic.md:100-110` (coverage prompt), and the **exact** existing files you will change: `packages/core/src/llm.ts`, `packages/agents/src/{dispatch.ts,review-gate.ts,delegate.ts}`, `packages/agents/fiches/{reviewer,sec-reviewer,quality-controller}.md`, and the tests `packages/agents/src/{review-gate.test.ts,dispatch.test.ts,dispatch-delegate.test.ts,quality-controller-wiring.test.ts,risk-classify-wiring.test.ts,intake-gate.test.ts}`.

**Build the steps of `plan.md §4` in order, each RED-before-GREEN (Vitest), committing each** (Conventional Commits ≤60 chars; end every message with `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`).

**The crux (plan §2.3 — get it exactly right):** keep CI live-model-free. Add `reviewKind?` to `LLMRequest`; make `mockLLM()` and the two vi.mock'd `claudeCodeLLM` clients (in `dispatch.test.ts` + `dispatch-delegate.test.ts`) emit a parseable `## Verdict` (synthesized from sentinels `[qc-block]`/`[sec-block]`/`[needs-work]`, else PASS) when `req.reviewKind` is set; embed the kind label (`code-review`/`reality-check`/`quality-control`/`sec-review`/`review`) in the finding message so substring asserts pass. The real `claudeCodeLLM` ignores `reviewKind` (the fiche `## Verdict` instruction drives it). `parseVerdict` fail-safe = `NEEDS_WORK` (never silent PASS). Reality Checker = **deterministic** (no LLM): `diffApplies && (testsCited || diffCoversRequest)`.

**HARD RULES**: no `@anthropic-ai/sdk` anywhere; don't touch `packages/core/src/providers/`; never export `MAS_MOCK_LLM` globally; no `data/memory/` writes; **bounded** review loop (`maxReviewIterations` default 2 + task budget — no unbounded loop); keep `intake-gate.ts` untouched (out of scope, documented); keep these tests green: `quality-controller-wiring`, `risk-classify-wiring`, `intake-gate`. Apply `sonar-recurring-rules.md` proactively (Set membership, `localeCompare`, no `void promise`, `tmpdir()` not `/tmp`, disjoint regex, hoist duplicated literals, specific Vitest matchers not `.toBeTruthy()`).

**Keep the §5/§8/§11 invariants**: the §5 risk gate fires before the LLM; the loop proposes diffs only (never applies, never bypasses a human gate); critics use the injected `LLMClient` only.

**WHEN DONE** run from repo root and paste exact tails: `pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke`; fix until all green. Write `docs/learning/2026-06-24-0b/build-report.md` (what shipped, files, the 4 check tails with numbers, deferrals incl. the §2.8 plan-time-sec decision + intake-gate-out-of-scope note) and commit it. Leave commits on the branch; do NOT push. **Return**: files created/changed, commit count, pass/fail + numbers of each of the 4 checks, and any deferral.

## ② Checker (paste to the read-only verifier subagent)

You are the **Checker** for **Phase 9·0b**. **READ-ONLY** — do NOT modify source. Branch `phase/9b-pipeline`.

Verify against `docs/learning/2026-06-24-0b-preflight/plan.md`, the `ROADMAP.md` Phase 9 · 0b section, and `CLAUDE.md` (§5/§7/§8/§11/§12). For each plan §2–§3 point + each §4 step, **confirm or fault it** (with severity). Specifically verify the **0b exit criterion**: (a) a task runs producer → **real** critic → on NEEDS_WORK a **bounded** correction loop (find the loop + its bound in `dispatch.ts`); (b) **no mock critic remains in the mission doer/checker review path** (`runReviewPhase` + `review-gate.ts` + `runDelegatedTask` call the real critics — grep that `mockReviewer/mockSecReviewer/mockQualityController/mockCodeReviewer/mockRealityChecker` no longer appear in those code paths, allowing the documented `intake-gate.ts` + fallback exceptions); (c) dependent tasks receive upstream `last_message` (find the injection + its test).

**RUN the 4 local checks yourself** and paste tails + numbers: `pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke`. **Grep the invariants**: no `@anthropic-ai/sdk` anywhere (`grep -rn "@anthropic-ai/sdk" packages apps --include=*.ts | grep -v api-fallback`); no `data/memory/` writes outside Memory Keeper; the §5 gate intact; the loop is bounded (no `while(true)`/unbounded). Assess `sonar-recurring-rules.md` adherence (flag likely smells). Judge whether the exit criterion is met and whether any deferral (plan §2.8 plan-time sec; intake-gate out-of-scope) is acceptable or a BLOCK.

**WRITE the full verdict** (markdown + a fenced ```json `ReviewerVerdict {verdict: PASS|NEEDS_WORK|BLOCK, findings:[{severity,message}]}`) to `docs/learning/2026-06-24-0b/checker-verdict.md` and commit ONLY that file (`docs(0b): checker verdict`, end with the `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>` line). Do NOT push. Prioritize coverage over filtering.

## ③ Orchestrator launch (what the main session does)

1. Commit this preflight pack + the ROADMAP 0a marker + the 0a handoff doc on `phase/9b-pipeline`.
2. Dispatch ① Doer (general-purpose subagent, TDD).
3. **Self-verify**: re-run `pnpm -r test` + `pnpm lint`; grep `@anthropic-ai/sdk`, `data/memory/` writes, loop bound. Fix/re-dispatch if off.
4. Dispatch ② Checker (read-only). Read its committed verdict file.
5. Improvement loop until Checker PASS + no open actionable finding.
6. Push, open **DRAFT** PR, poll Sonar → `scripts/sonar-pr-issues.sh <pr>` exit 0 + gate OK; fix every item.
7. Persist memory; **STOP at the 0b exit criterion and ask the user for explicit GO before 0c.**
