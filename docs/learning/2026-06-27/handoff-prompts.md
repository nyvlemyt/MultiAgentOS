# Round 1 — Handoff Prompts (Living Knowledge OS, doc-only)

Plan: `docs/superpowers/plans/2026-06-27-knowledge-os-round1.md`
Design spec: `docs/superpowers/specs/2026-06-27-base-knowledge-os-design.md` (§13 = revision charter)
Mode: **subagent-driven** (orchestrator dispatches a fresh Doer per task, Checker between/after). Round 1 is doc-only — no code, no `git mv`, no migration.

---

## Orchestrator launch prompt (paste to start the run)

> Execute the Round-1 plan at `docs/superpowers/plans/2026-06-27-knowledge-os-round1.md` using superpowers:subagent-driven-development. Dispatch one fresh Doer per task (1→6, in order; Task 1 may fan out 9 read-only pillar agents). Each task is doc-only: follow its steps, meet its binary acceptance criteria, commit with the given message. After each task, run the task's acceptance criteria as a quick gate before the next. After Task 5, run the Task-6 adversarial Checker and write the verdict to `docs/learning/2026-06-27/checker-verdict.md`. Honor every locked decision (Q1–Q6) and the scope boundary (no code/machine, no rename). STOP at the Task-6 gate and report to the user (CLAUDE.md §14: essentiel-first + plan + reco). Do not start Round 2.

---

## Doer prompts (one per task)

**Doer T1 — Base audit.** Execute Task 1 of the plan. Do the pre-flight reads, write `docs/audits/2026-06-27-base-audit.md` with the 9-pillar frame, fill each pillar with findings *grounded in real files/docs* (constat/gravité/remédiation routing to charte|ADR|Round-2 card), then meet the Step-4 acceptance criteria and commit. Read-only audit — propose nothing into code.

**Doer T2 — ADR 0008.** Execute Task 2. Mandatory §12 pre-flight reads first. Write `docs/decisions/0008-living-knowledge-os.md` (verify 0008 free across branches) with the 13 decision clauses + the relations table verbatim-precise. Ensure Q1–Q6 are each traceable to a clause and nothing contradicts design spec §13. Commit.

**Doer T3 — STRUCTURE.md + foundations.** Execute Task 3. Write `docs/STRUCTURE.md` (8 sections incl. the 4 Diátaxis skeletons, the ID/slug algorithm, the rename decision, relations summary, schema_version) and create `docs/knowledge/consolidation-log.md` with header+format. Meet Step-8 criteria (all 6 foundations concrete, no naming self-violation). Commit.

**Doer T4 — Fiche-contract spec.** Execute Task 4. Pre-flight read `schema.ts:224` + `arsenal.ts`. Write `docs/superpowers/specs/2026-06-27-fiche-contract.md`: the full `FicheSchema` Zod block (closed backbone + `.passthrough()` + all 8 reserved sockets), `LEGAL_TRANSITIONS` data-map (9 states, capture_failed re-entry, no-delete invariant), the one-migration scope, and the field-group/parsing/gardian prose. `quality_score = ReviewerVerdict`. Meet Step-6 criteria. Commit.

**Doer T5 — Capture-contract spec.** Execute Task 5. Pre-flight read `capture.ts` + the fiche spec. Write `docs/superpowers/specs/2026-06-27-capture-contract.md`: the one-seam contract (5 gates → captureCandidates), the 3 guarantees INSIDE the callee (SAS + dead-letter + classify-first), the keyed supersede write-path (v1, only LLM auto-judge deferred), and the row shape matching T4's migration. Meet Step-6 criteria. Commit.

---

## Checker prompt (Task 6, verdict to file)

> Read the 5 Round-1 docs (audit, ADR 0008, STRUCTURE.md, fiche-contract, capture-contract) + design spec §13 + the plan's per-task acceptance criteria. For each task's acceptance criteria, return SATISFIED/FAILED with evidence line numbers. Flag: any cross-document name mismatch (lifecycle states, `superseded_by`, `capture_failed`, `ReviewerVerdict`, `source_key`, `schema_version`), any unresolvable cross-reference, any Round-2 scope leak (code/machine/migration/`git mv` that slipped into Round 1), and any contradiction with locked decisions Q1–Q6 or design §13 (cut-line 6 briques; judge = Claude pool; no live "~20 €"). Verdict = PASS / NEEDS_WORK / BLOCK with findings, written to `docs/learning/2026-06-27/checker-verdict.md`. Be adversarial — if substance is absent, FAIL it.

---

## Locked decisions (carry into every prompt)
Q1 judge = Sonnet@distill / Opus@promote (pool, never PAYG) · Q2 budget-pause threshold = Round-2 config (posture only now) · Q3 quality_score = `ReviewerVerdict` enum · Q4 rename = `git mv`+sweep refs, ONE Round-2 step-0 commit · Q5 schema_version='1', register refuses newer-than-host · Q6 recall@k trigger set post-baseline.
