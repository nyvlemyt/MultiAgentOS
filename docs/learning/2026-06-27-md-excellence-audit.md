# `.md` Excellence Audit — pilot docs (2026-06-27)

Binary-grid quality audit of the **31 pilot `.md` files** (6 governance · 8 ADR · 11 agent fiches · 6 `mas-*` skills). Method: 1 strict auditor (sonnet/medium, `Explore` agent) per file via the `md-excellence-audit` workflow; verdicts then **independently verified** by the main thread (file-existence + model-slug claims re-checked on disk — 3 findings refuted).

## Tally — floor is solid, drift is the enemy

| Verdict | Count | |
|---|---|---|
| excellent | **10** | 0003/0005/0007 ADRs · skill-router/reviewer/sec-reviewer/agent-evaluator/context-manager fiches · mas-context-manager/mas-mission-planner skills |
| good | **12** | minor single-criterion gaps |
| needs-work | **9** | PRODUCT_SPEC, AGENTS, ROADMAP, CLAUDE, SKILLS_REGISTRY, TOKEN_STRATEGY, PIVOT_BRIEF, ADR 0006, tier-b-system* |
| poor | **0** | no structural failures |

**Signal:** the docs are well-built; almost every defect is **staleness/drift** (counts, statuses, phantom file paths) or **single-source duplication**, not bad writing. Two uniform structural gaps (fiche Trigger sections, skill binary-criteria) are batch-fixable.

## The 4 cross-cutting patterns (root causes, not symptoms)

1. **Stale "6 Tier A agents" everywhere** — reality is **10** (Bloc C promotion). VERIFIED stale: `PRODUCT_SPEC.md:293`, `ROADMAP.md:68/82/110`. Agents reading these scaffold the wrong roster.
2. **ADRs shipped but never closed out** — read as "Proposed/future" though merged: `0006` status still *Proposed* (Phase 6 shipped PR #11), `0002:16` *"to be finalized"* (3.5 merged PR #9), `0004` no amendment for receptacle+QMD, `PIVOT_BRIEF` no Superseded status.
3. **Phantom file paths in code-maps** — VERIFIED missing: `AGENTS.md:183` → `packages/agents/prompts/tier-a-system.md` (only `tier-b-system.md` exists); `SKILLS_REGISTRY.md:132-133` → `registry.ts`/`cache.ts` (real: `scanner.ts`, `select.ts`, `index.ts`).
4. **Single-source-of-truth duplication** — policy restated instead of pointered: `TOKEN_STRATEGY` 30%-margin in 3 places; `SKILLS_REGISTRY:123` caveman rule dup of `CLAUDE §6`; `PRODUCT_SPEC §8` inlines the Drizzle schema (already drifted).

## Refuted findings (auditor was WRONG — do NOT "fix")

- ❌ **`TOKEN_STRATEGY.md:13` `claude-opus-4-7` is "non-standard/wrong"** → **Opus 4.7 is a real model**. Leave it. (Auditor's training cutoff missed it.)
- ❌ **`ROADMAP` ref `vibeflow/INDEX.md` is "broken"** → file **EXISTS** at `docs/knowledge/vibeflow/INDEX.md`. Not broken (at most a path-shorthand to clarify).
- ❌ **`tier-b-system.md` fails F1/F2/F3 as a fiche** → it is a **shared system preface, not a fiche**; the fiche grid doesn't apply. Scoping mistype on my side. Action = add a one-line "shared contract, not a fiche" header, not force fiche structure.
- ⚠️ **`ADR 0008` "broken ref"** → it's a forward-ref to an *unwritten* planned ADR (context-indexing). Number **0008 is reserved** — any new billing ADR must be **0009+**, not 0008.

## Fix plan — 4 waves, worst-first

### Wave 1 — Factual drift (HIGH value: stops agents scaffolding wrong)
- `PRODUCT_SPEC.md:293` + `ROADMAP.md:68/82/110`: **6 → 10 Tier A**, cross-ref `AGENTS.md §3`.
- `AGENTS.md:183`: drop/repair `tier-a-system.md` phantom; `AGENTS.md:86` remove quality-controller/architect from the "not-yet-shipped" §4 table + collapse the dup prose into a pointer.
- `SKILLS_REGISTRY.md:132-133`: `registry.ts`/`cache.ts` → `scanner.ts`/`select.ts`/`index.ts`.
- Close out ADRs: `0006` Proposed→Accepted + amendment; `0002:16` finalized; `0004` add 2 amendments (receptacle PR #8, QMD Phase 9a2); `PIVOT_BRIEF` add `Status: Superseded` + execution note.

### Wave 2 — CLAUDE.md hygiene (most-read doc, 233 → ≤200)
- Condense §11 billing to 5 enforcement rules + a pointer (move detail to a **new ADR 0009-billing-isolation**, NOT 0008). Trim §13 prose. Target ≤200 lines.
- `:31` remove "(planned)" from §3 heading. `:222` future→past tense (Phase 4 seeded 2026-06-09).
- Broken anchors: `:202` `§12.1`→`§12`; `:113` `§ commit footer`→`§7`.

### Wave 3 — Uniform structure (batch, mechanical)
- Add a `## Trigger` (when-invoked) section to **5 fiches**: orchestrator, mission-planner, architect, quality-controller, memory-keeper. (5 others already have it → excellent.)
- Rewrite **S6 Verification Criteria** as truly binary in **4 skills**: mas-reviewer, mas-sec-reviewer, mas-skill-router, mas-memory-keeper (process-phrased → observable pass/fail; the skill-router model-tier fix uses the correct slugs haiku-4-5/sonnet-4-6/opus-4-8).

### Wave 4 — Single-source dedup (polish)
- `TOKEN_STRATEGY`: designate §8 canonical for quota caps; replace §3/CLAUDE §6 restatements with pointers.
- `SKILLS_REGISTRY:123`: caveman rule → `(canonical: CLAUDE.md §6)` back-ref.
- `PRODUCT_SPEC §8`: inline Drizzle schema → entity summary + pointer to `packages/db/src/schema.ts`; add `last_updated:` dates (G5 hard fail — no dates anywhere).

## Per-file scoreboard

| Verdict | Score | Type | File | Fails |
|---|---|---|---|---|
| needs-work | 2/7 | governance | PRODUCT_SPEC.md | G1,G2,G4,G5,G7 |
| needs-work | 2/6 | (mistype) | tier-b-system.md\* | F1,F2,F3,F4 |
| needs-work | 3/7 | governance | AGENTS.md | G2,G4,G6,G7 |
| needs-work | 3/7 | governance | ROADMAP.md | G2,G3,G4,G6 |
| needs-work | 3/7 | adr | PIVOT_BRIEF.md | A1,A4,A6,A7 |
| needs-work | 4/7 | governance | CLAUDE.md | G2,G4,G6 |
| needs-work | 4/7 | governance | SKILLS_REGISTRY.md | G4,G6,G7 |
| needs-work | 4/7 | governance | TOKEN_STRATEGY.md | G4,G6,G7 (G4 partly refuted) |
| needs-work | 5/7 | adr | 0006-risk-scoring-4axes.md | A1,A7 |
| good | 5/7 | adr | 0001-claude-code-engine | A4,A6 |
| good | 5/6 | fiche | orchestrator · mission-planner · architect · quality-controller · memory-keeper | F3 |
| good | 6/7 | adr | 0002-multi-model-router · 0004-memory-intake | A7 |
| good | 6/7 | skill | mas-reviewer · mas-sec-reviewer · mas-skill-router · mas-memory-keeper | S6 |
| excellent | 7/7 / 6/6 | — | 0003 · 0005 · 0007 · skill-router · reviewer · sec-reviewer · agent-evaluator · context-manager · mas-context-manager · mas-mission-planner | — |

\* tier-b-system.md = scoping mistype (shared preface, not a fiche); verdict not actionable as a fiche.

## Recommendation

Do **Wave 1 + Wave 2 now** (factual correctness + the most-read doc) as one PR — highest value, prevents wrong-roster scaffolding. **Wave 3 + 4** are batchable polish for a follow-up PR. Skip all refuted findings above.
