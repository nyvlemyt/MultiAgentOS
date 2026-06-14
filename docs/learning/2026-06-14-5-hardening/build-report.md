# Build report — item 5 · Hardening (slice 5a + backlog triage)

Date 2026-06-14 · Branch `phase/5-hardening` · Base `main` (4dcf356, all of 5b/tech-debt/8a/4a merged).

This PR ships the autonomous-safe slice of item 5 and closes/triages the rest. The
remaining sub-parts that need human decisions or cross-layer design are split out (5b).

## Shipped — 5a · Sec-Reviewer BLOCK-path test coverage
Pure test additions (no production change), TDD-verified:
- `packages/core/src/sec-reviewer.test.ts` (new) — unit tests for `mockSecReviewer`'s
  BLOCK decision boundary: BLOCK on `blocking`, PASS on low/medium/high, findings shape.
  (There was NO unit test for the §5 sec-review mock before.)
- `packages/agents/src/dispatch.test.ts` — added the **reject→blocked** path: rejecting a
  pending §5 validation as the FIRST decision blocks the task + mission and logs a single
  `validation_rejected` event. The prior tests only covered approve + replay-after-approve;
  the primary human-gate BLOCK path was untested.

## Closed — sonar-cleanup-remaining
`main` is Sonar-clean (live API: **0 open issues, 0 TO_REVIEW hotspots**). The strict
5th-check gate on every phase PR cleared the Wave B/C backlog incrementally. Marked
`docs/backlog/sonar-cleanup-remaining.md` RESOLVED. Remaining items are non-code SonarCloud
**UI admin** actions (Mark-Safe seed/test hotspots, `**/.claude/**` exclusions, UTF-8
encoding, delete duplicate projects) — the user's to action; an agent cannot click them.

## Triaged / deferred (need a human decision or cross-layer design)
- **5b · router-window-state-persistence** → its own next PR. `RouterLLMClient` lives in
  `@mas/core` and must NOT import `@mas/db`; the clean design injects persistence hooks
  (`initialBlocked` to hydrate `blockedAt`, `onBlock` to emit a `window_blocked` event) from
  the db-aware caller (`createRouterLLM` in dispatch). Moderate, deserves its own TDD PR.
- **self-audit-lean-claude-md** — the doc itself states *"la décision finale est humaine
  (Melvyn)"*: trimming CLAUDE.md (200 lines, target <200/≤150 — an unresolved RES-012 vs
  RES-061 threshold contradiction) and the BDR/EDR/ADR registry-name harmonization are
  governance calls, not autonomous edits. Left for an attended governance pass; flagged here.
- **self-audit-memoire-reaudit-debt** §1 already RESOLVED (2026-06-07 stat-sweep); §2
  (point `gouvernance.md` RES-013 at the canonical RES-029 registry model, settle BDR naming)
  is a knowledge-file harmonization tied to the same human registry-naming decision — deferred
  with the lean-claude-md governance pass.

## Verification (5 checks — §7)
- `pnpm -r test` — to run (core +5, agents +1).
- `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` — to run.
- Sonar `scripts/sonar-pr-issues.sh <pr>` exit 0 + gate OK — after push.
