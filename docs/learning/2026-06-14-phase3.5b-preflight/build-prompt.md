# Phase 3.5b · Language mode + Quality Controller — ready-to-paste prompts

Pre-flight done (plan in this folder). Branch `phase/3.5b-language-qc` exists (off main).
**Deterministic — no real LLM (mock seam stays first).**

> Note the **5th verification check**: Sonar must be clean (`scripts/sonar-pr-issues.sh <pr>` exits 0),
> not just a green gate (CLAUDE.md §7). Read `docs/knowledge/sonar-recurring-rules.md` before writing
> UI/test code to dodge the recurring smells (S5443 tmpdir, S7776 Set, S6772 span-wrap, S6848 aria,
> S7735 ternary, S3735 void).

---

## ① DOER — paste this to build Phase 3.5b

```
Build Phase 3.5b (Language mode + Quality Controller) of MultiAgentOS on the existing branch
phase/3.5b-language-qc.

Read first: CLAUDE.md (§7 — verification is 5 checks incl. Sonar; §6, §8, §11), ROADMAP.md "Phase 3.5
· Features additionnelles", AGENTS.md §4 (Quality Controller detail),
docs/learning/2026-06-14-phase3.5b-preflight/plan.md (build steps + DoD),
docs/knowledge/sonar-recurring-rules.md (avoid the recurring smells upfront).
Pre-flight is done — do NOT redo it. THEN build.

Rules:
- Deterministic. No real LLM; the MAS_MOCK_LLM short-circuit stays first in selectLLM. Canonical
  `pnpm -r test` — never export MAS_MOCK_LLM globally.
- §8 intact (no new memory writer). §11 intact (no provider/SDK change).
- Language = a projects.language column ('fr'|'en', default 'fr'), NOT config/project.json (mirror
  defaultMode). UI i18n is MINIMAL (cockpit-shell dict only); deep per-page i18n is DEFERRED — note it.
- Quality Controller = a mock verdict (like mockReviewer/mockSecReviewer) wired into runReviewPhase
  BEFORE the reviewer; QC BLOCK blocks the mission. Add the Tier A fiche per AGENTS.md §4 (≤7 tools).
- TDD (superpowers:test-driven-development). Conventional Commits ≤60 chars. New branch only — never
  push to main, never merge.
- Token budget this session: 45k. At 80%, pause and report.

Build in this order, committing + verifying each (plan.md §1):
1. Migration 0006 + schema: projects.language ('fr'|'en', default 'fr'). Legacy rows default fr. TDD.
2. languageDirective(lang) pure fn → one-line system directive; wire into BOTH system assemblies in
   dispatch.ts (executeTaskWithLLM + resumeAfterValidation). TDD: fr→FR directive, en→EN, no LLM added.
3. LanguagePill in the topbar (fr/en) → PATCH /api/projects/[id]/language; reads current. TDD route + smoke.
4. apps/web/lib/i18n.ts minimal t(key,lang) dict for the cockpit shell (nav + topbar + key headings),
   fr default + fallback. Topbar/nav use it. Deep per-page i18n deferred. TDD dict.
5. mockQualityController in @mas/core (ReviewerVerdict shape) + .claude/agents/quality-controller.md
   fiche; wire into runReviewPhase before the reviewer; QC BLOCK blocks + logs quality_control_verdict.
   TDD: QC before reviewer, BLOCK blocks, PASS proceeds.
6. /trace shows quality_control_verdict; topbar shows language. Smoke covers both.

Definition of Done = plan.md §4 (incl. the 5th check: after push, poll Sonar then run
scripts/sonar-pr-issues.sh <pr> and fix everything until it exits 0 — green gate is NOT enough).
The 4 local checks: pnpm -r test · pnpm lint · pnpm build · lsof -ti:3000|xargs kill then
pnpm --filter @mas/web smoke.

Then write docs/learning/<date>-phase3.5b/build-report.md (done / deferred+reason / DoD status /
commit list) and STOP for my review. Do NOT start Phase 5.
```

---

## ② CHECKER — paste in a separate session to verify

```
Verify Phase 3.5b (Language mode + Quality Controller) of MultiAgentOS against its exit criteria.
Read-only — do NOT fix, report.

Read: ROADMAP.md "Phase 3.5 · Features additionnelles", AGENTS.md §4,
docs/learning/2026-06-14-phase3.5b-preflight/plan.md §4 (DoD), CLAUDE.md §7, the build-report.

Method: canonical `pnpm -r test` (never export MAS_MOCK_LLM globally — known env artifact).

Check, each PASS/FAIL with evidence:
1. Migration 0006 applies clean; legacy rows default language='fr' (find the round-trip test).
2. languageDirective wired into BOTH system assemblies; fr→FR / en→EN directive present; no LLM call
   added (mock seam first). Find the test.
3. LanguagePill toggles + persists via PATCH /api/projects/[id]/language (test + smoke).
4. Minimal i18n t() dict renders cockpit-shell labels in project language with fr fallback (test).
   Deep per-page i18n correctly deferred (not silently missing).
5. Quality Controller runs in runReviewPhase BEFORE the reviewer; QC BLOCK blocks, PASS proceeds;
   quality_control_verdict in /trace (tests). Fiche exists per AGENTS.md §4 (≤7 tools).
6. No scope creep: no provider/router change, no Tier B execution, producer/receptacle untouched.
7. 5 checks: pnpm -r test · pnpm lint · pnpm build · pnpm --filter @mas/web smoke ALL green, AND
   scripts/sonar-pr-issues.sh <pr> exits 0 (paste it — zero open issues/hotspots, not just green gate).

Output verdict PASS / NEEDS_WORK / BLOCK with findings. Then WRITE the full verdict (markdown +
ReviewerVerdict JSON) to docs/learning/<date>-phase3.5b/checker-verdict.md and commit it (docs-only)
so the main session reads it without copy-paste. Do not modify any other file.
```
