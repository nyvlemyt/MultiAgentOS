# Handoff — `.md` Excellence fixes (autonomous, self-verifying loop)

> **For the executing session.** Goal: bring all 31 pilot `.md` files to "perfect" against the binary
> quality grid, **self-verifying and self-improving in a loop** until done, then open a DRAFT PR.
> You run this **without the user present** — they approved this handoff before sleeping. Phase-gate
> rule still holds (no merge; PR stays DRAFT for human merge).

## 0. TL;DR
Read §1 artifacts → branch off `main` → apply the 4 fix waves (§4), skipping the refuted findings (§5) →
run the self-audit loop (§7) until every changed doc passes the grid (§6) with **no regression** → pass the
5-check gate (§8) → open a **DRAFT** PR. Do not touch anything in §5.

## 1. Context & artifacts — READ FIRST
- **Triage (source of truth for the fixes):** `docs/learning/2026-06-27-md-excellence-audit.md` — full per-file verdicts, the 4 cross-cutting patterns, the refuted findings, and exact per-file fixes. **Read it fully before editing.**
- These artifacts live on branch **`claude/infallible-bell-2113b5`** (pushed, in DRAFT PR #50). If your fresh session is on `main`, fetch them: `git show claude/infallible-bell-2113b5:docs/learning/2026-06-27-md-excellence-audit.md` and this file.
- **Mandatory pre-reads (CLAUDE.md §12/§13)** before editing any skill/fiche: `docs/knowledge/prompting-anthropic.md`, `docs/knowledge/skills-reference.md`, `docs/knowledge/agent-patterns.md`, `docs/knowledge/project-doctrine.md`. Before editing skills, also `docs/knowledge/sonar-recurring-rules.md`.
- The audit was produced by a 31-agent workflow; the saved script is referenced in PR #50 history if you want to re-run it, but §6 below restates the rubric so you do not need it.

## 2. Definition of Done — binary "perfect"
A wave is **done** only when ALL hold:
1. Every `needs-work` pilot `.md` (PRODUCT_SPEC, AGENTS, ROADMAP, CLAUDE, SKILLS_REGISTRY, TOKEN_STRATEGY, PIVOT_BRIEF, ADR 0006) re-audits to **good or excellent** — every *real* criterion passes (refuted criteria in §5 excluded).
2. **No regression**: no previously `good`/`excellent` doc drops a criterion.
3. **§5 refuted findings are untouched** (do not "fix" them — that is a defect).
4. `CLAUDE.md` ≤ **200 lines**.
5. If `CLAUDE.md §11` billing detail is externalized, it goes to a **new `docs/decisions/0009-billing-isolation.md`** — **NOT 0008** (0008 is reserved for context-indexing per ROADMAP). Cross-link it from CLAUDE.md §11.
6. **5-check gate green** (§8), including **Sonar exit 0 + gate OK**.
7. A **DRAFT** PR is open off `main` with all changes. No merge.

## 3. Branch & PR strategy
- Branch **off `main`** (fresh): `git checkout main && git pull && git checkout -b claude/md-excellence-fixes`. Keep this PR **separate** from PR #50 (Karpathy) — different concern, clean review.
- Conventional Commits, subject ≤60 chars. End commits with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- One PR, DRAFT, base `main`. PR body = summary of the 4 waves + a "refuted/not-touched" note.

## 4. The verified fix plan — 4 waves (exact edits)
> Locate each edit by **content/anchor**, not blind line number (lines shift as you edit). Triage doc has the original line refs for orientation.

### Wave 1 — Factual drift (HIGH)
- **`PRODUCT_SPEC.md`** (~L293) + **`ROADMAP.md`** (~L68/82/110): **"6 Tier A" → "10 Tier A"**. Cross-ref `AGENTS.md §3`. In PRODUCT_SPEC, the list of 6 names is incomplete — reconcile against the 10 shipped fiches in `packages/agents/fiches/` (orchestrator, mission-planner, skill-router, reviewer, sec-reviewer, architect, quality-controller, agent-evaluator, context-manager, memory-keeper).
- **`AGENTS.md`** (~L183): remove/repair the phantom `packages/agents/prompts/tier-a-system.md` (VERIFIED: only `tier-b-system.md` exists). (~L86): remove quality-controller + architect from the "Phase 2 — not yet shipped" §4 table (they shipped); collapse the duplicated Quality-Controller prose block into a pointer `> Full spec: packages/agents/fiches/quality-controller.md`. Add to §10 authoring rule: each fiche declares **≤7 tools** (agent-patterns.md).
- **`SKILLS_REGISTRY.md`** (~L132-133): `registry.ts`/`cache.ts` → real files **`scanner.ts`, `select.ts`, `index.ts`** (VERIFIED via `packages/skills/src/`).
- **Close out shipped ADRs** (add dated amendment + fix status):
  - `0006-risk-scoring-4axes.md`: status `Proposed` → `Accepted (2026-06-14, Phase 6 PR #11 merged)` + amendment noting integration + real file path of the 4-axis tagger (locate it in `packages/`).
  - `0002-multi-model-router.md` (~L16): drop "to be finalized at Phase 3.5 pre-flight" → "Decision (finalized 2026-06-13, PR #9)".
  - `0004-memory-intake-and-auto-capture.md`: add amendment block — receptacle half built (PR #8) + QMD live primary retriever (Phase 9a2, 2026-06-23).
  - `PIVOT_BRIEF.md`: add `**Status:** Superseded — pivot executed (see ADR 0001)` + date/decider header + a one-line "completed" amendment.

### Wave 2 — CLAUDE.md hygiene (233 → ≤200)
- Condense **§11** to its 5 numbered enforcement rules + a pointer; move the billing-change notice + §11.bis provider sub-rules to **`docs/decisions/0009-billing-isolation.md`** (author per ADR shape: status/context/decision/alternatives/consequences/date/deciders). Trim §13 prose. Target ≤200 lines — verify with `wc -l CLAUDE.md`.
- §3 heading (~L31): remove "(planned)" (Phases 1-9 shipped).
- §13 (~L222): future-obligation → past tense ("Phase 4 memory seeded from docs/knowledge/ + vibeflow/INDEX.md at 2026-06-09").
- Broken anchors: (~L202) `§12.1` → `§12`; (~L113) `§ commit footer` → `§7`.

### Wave 3 — Uniform structure (batch, mechanical)
- Add a `## Trigger` (when-invoked) section to **5 fiches**: `orchestrator`, `mission-planner`, `architect`, `quality-controller`, `memory-keeper`. Model it on the 5 fiches that already have it (skill-router/reviewer/sec-reviewer/agent-evaluator/context-manager). State the exact dispatch condition (e.g. orchestrator: "invoked by the worker on each dispatch tick when a mission is `executing` and a task's deps are satisfied").
- Rewrite **S6 Verification Criteria** as **truly binary/observable** in 4 skills: `mas-reviewer`, `mas-sec-reviewer`, `mas-skill-router`, `mas-memory-keeper`. Replace process-phrasing ("was read") with checkable assertions (e.g. memory-keeper: `SELECT COUNT(*) ... WHERE status='pending' returns 0`). For mas-skill-router use the **correct slugs**: `claude-haiku-4-5` (low) / `claude-sonnet-4-6` (medium) / `claude-opus-4-8` (high/blocking); add a criterion that no L2 body was loaded during routing.

### Wave 4 — Single-source dedup (polish)
- `TOKEN_STRATEGY.md`: make §8 the canonical home for quota caps; replace the §3 + CLAUDE §6 restatements of the 30% margin with pointers.
- `SKILLS_REGISTRY.md` (~L123): caveman forbidden-scope rule → add `(canonical: CLAUDE.md §6)` back-ref.
- `PRODUCT_SPEC.md §8`: replace the inline Drizzle/TypeScript schema with a 5-8 line entity summary + pointer to `packages/db/src/schema.ts` (canonical). Add `last_updated: 2026-06-27` header (G5: PRODUCT_SPEC has **no dates at all**).

## 5. DO NOT TOUCH — refuted findings (the auditor was WRONG; "fixing" these is a defect)
- ❌ `TOKEN_STRATEGY.md` `claude-opus-4-7` — **Opus 4.7 is a real model**. Leave it. (Do NOT downgrade to 4-5/4-0.)
- ❌ `ROADMAP` ref `vibeflow/INDEX.md` — file **EXISTS** at `docs/knowledge/vibeflow/INDEX.md`. Not broken. (At most clarify the path; do not delete the ref.)
- ❌ `tier-b-system.md` — a **shared system preface, not a fiche**. The fiche grid (F1/F2/F3) does not apply. Only action allowed: add a one-line header "shared contract, not a fiche" so it is not re-audited as one. Do NOT bolt a fake agent identity onto it.
- ❌ ADR **0008** number is **reserved** (context-indexing). New billing ADR = **0009**.

## 6. Binary rubric — for self-re-audit (use to verify each changed doc)
Mark a criterion **pass only with concrete evidence (cite line)**; default to fail when unsure.
- **governance** (G1 specific/enforceable rules · G2 size discipline, CLAUDE ≤200 · G3 clear structure · G4 no stale/contradictory content · G5 absolute dates · G6 cross-refs resolve · G7 single-source respected)
- **adr** (A1 status present+current · A2 context · A3 decision · A4 alternatives w/ why-rejected · A5 consequences · A6 date+deciders · A7 no silent drift vs code/other ADRs)
- **fiche** (F1 tier+domain+single responsibility · F2 ≤7 tools listed · F3 trigger/when-to-use · F4 patterns/sources cited · F5 boundaries · F6 consistent w/ AGENTS.md roster)
- **skill** (S1 summary L1 ~≤200 tok · S2 Principles citing source · S3 numbered Process · S4 Rationalizations table · S5 Red Flags · S6 BINARY Verification Criteria · S7 description When-to-Use AND When-NOT)

## 7. Self-verify + self-improve loop (evaluator-optimizer, BOUNDED)
Repeat, max **3 rounds**:
1. **Apply** the next batch of fixes (a wave, or the remaining failures).
2. **Re-audit the changed docs** against §6 — be a strict, adversarial checker (re-read each edited file; verify every claimed fix actually landed and introduced no new defect). For factual claims (file paths, counts, model slugs), **verify on disk** — do not trust prose.
3. If any changed doc still fails a *real* criterion (not §5), or a regression appeared → **fix and loop**.
4. Stop when **two consecutive checks find nothing new** OR all DoD §2 items 1-5 hold. If a criterion genuinely cannot be satisfied, record it as a documented exception in the PR body with justification — do not loop forever.
> Optional (if you have the Workflow tool + budget): re-run a verification fan-out over the ~9 changed docs using the §6 rubric, one strict `Explore` agent per doc (model sonnet). Otherwise do it sequentially.

## 8. The 5-check verification gate (CLAUDE.md §7 — non-negotiable)
Run from repo root, all must be clean:
1. `pnpm -r test`
2. `pnpm lint`  (includes `scripts/lint-no-sdk-payg.sh` — note: your prose may mention `@anthropic-ai/sdk`; ensure the guard scopes to source dirs, not docs — if it false-positives on a doc, that is a real signal to fix the doc wording, not to disable the guard)
3. `pnpm build`
4. `pnpm --filter @mas/web smoke`
5. **Sonar**: after `git push`, poll until analysis of your HEAD sha lands, then `scripts/sonar-pr-issues.sh <pr>` must **exit 0** (zero open issues, zero to-review hotspots) AND the quality gate `qualitygates/project_status == OK`. Fix everything it lists (read `docs/knowledge/sonar-recurring-rules.md` first).
> These are doc-only changes — tests/build/smoke should stay green trivially; the real watch is **Sonar** (markdown/ADR prose can trip S7164-style flags) and lint.

## 9. Filled DOER prompt
```
You are the Doer for the `.md` Excellence fixes. Read docs/learning/2026-06-27-md-handoff-prompts.md
and docs/learning/2026-06-27-md-excellence-audit.md in full FIRST. Then, on a fresh branch
`claude/md-excellence-fixes` off main, apply Waves 1-4 (§4) exactly. Skip every refuted finding in §5 —
touching them is a defect. Before editing any skill/fiche, read the §1 mandatory pre-reads. Create
docs/decisions/0009-billing-isolation.md (NOT 0008) if you externalize CLAUDE §11; keep CLAUDE.md ≤200
lines (verify with wc -l). After each wave, self-re-audit the changed docs against the §6 rubric and
verify factual claims (paths/counts/slugs) on disk. Commit per wave (Conventional Commits, ≤60 char
subjects, Co-Authored-By footer). Do NOT run the 5-check gate yet — hand to the Checker. Do NOT merge.
Write a short progress note to docs/learning/2026-06-27-md-doer-notes.md as you go.
```

## 10. Filled CHECKER prompt
```
You are the Checker for the `.md` Excellence fixes. Do NOT modify files except to write your verdict.
Independently verify the Doer's branch claude/md-excellence-fixes against docs/learning/
2026-06-27-md-handoff-prompts.md §2 (Definition of Done): (a) re-audit every changed pilot .md against
the §6 rubric, strict/adversarial, citing line evidence; (b) confirm no regression on previously
good/excellent docs; (c) confirm §5 refuted findings were NOT touched; (d) confirm CLAUDE.md ≤200 lines
and ADR is 0009 not 0008; (e) run the full 5-check gate (§8) including Sonar exit 0 + gate OK, after the
branch is pushed and a DRAFT PR exists; verify the Sonar analysis sha matches HEAD. Verify factual claims
on disk, never from prose. Write your verdict (PASS / NEEDS_WORK / BLOCK + findings with file:line) to
docs/learning/2026-06-27-md-checker-verdict.md (committed). If NEEDS_WORK, list exact gaps for another
Doer round (§7 loop, max 3 rounds).
```

## 11. Orchestrator / launch prompt — WHAT TO PASTE into the new session
```
Reprends le chantier "audit d'excellence des .md" préparé hier soir. Checkout la branche
claude/infallible-bell-2113b5 et lis EN ENTIER docs/learning/2026-06-27-md-handoff-prompts.md puis
docs/learning/2026-06-27-md-excellence-audit.md. Ensuite exécute le handoff de façon autonome jusqu'à
ce que les .md soient parfaits : crée une branche claude/md-excellence-fixes off main, applique les 4
vagues de corrections (§4) en sautant les findings réfutés (§5), boucle Doer→Checker en te vérifiant et
te corrigeant (§7, max 3 rounds), passe la gate 5-checks + Sonar exit 0 (§8), puis ouvre une PR DRAFT
off main. Ne merge pas. Respecte CLAUDE.md (5 checks, ≤7 tools/fiche, Co-Authored-By, §12/§13 pre-reads).
Quand c'est fini, écris un rapport clair (style CLAUDE.md §14 : imagé, essentiel d'abord, plan + reco)
dans docs/learning/2026-06-27-md-final-report.md et résume-le moi.
```
```
