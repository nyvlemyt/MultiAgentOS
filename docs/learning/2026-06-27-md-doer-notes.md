# Doer notes — `.md` Excellence fixes (2026-06-27)

Branch: `claude/md-excellence-fixes` (off `main` @ 4e068d4). Executing the handoff
`docs/learning/2026-06-27-md-handoff-prompts.md` §4 (4 waves), skipping §5 refuted findings.

Progress log + every place on-disk verification (§7) **corrected** the handoff.

## Wave 1 — factual drift (DONE)

- **PRODUCT_SPEC.md** — added a `Last updated: 2026-06-27` header (G5 fix: doc had zero dates); §9 stale "6 Tier A" → "10 ship (canonical `AGENTS.md §3`); MVP slice was the first six …"; §8 inline Drizzle schema (drifted) → entity summary + pointer to `packages/db/src/schema.ts`.
- **ROADMAP.md** — three stale roster refs (L68/82/110). Fixed by pointing to the canonical `AGENTS.md §3` roster instead of hard-coding a count (see "seed gap" below — a hard-coded "10" would have contradicted the seed). L156/164 "6 orchestrator **skills**" left untouched (different concept, correct).
- **AGENTS.md** — §4 header de-stale'd ("Phase 2 backlog (not yet shipped)"); removed the shipped `quality-controller` row; collapsed the duplicated "Quality Controller — détail" prose into a one-line pointer to the fiche; §7 file tree dropped the phantom `prompts/tier-a-system.md` (verified: only `tier-b-system.md` exists, zero code refs); §10 gained the ≤7-tools authoring rule (`docs/knowledge/agent-patterns.md`).
- **SKILLS_REGISTRY.md** — §8 code-map phantom files `registry.ts`/`cache.ts` → real `src/scanner.ts`/`router.ts`/`select.ts`/`index.ts` (verified on disk); §7 caveman rule gained `(canonical: CLAUDE.md §6)` back-ref.
- **ADR 0002** — §Decision header "to be finalized" → "finalized at the 2026-06-13 pre-flight" (resolves the A7 internal drift vs the already-Accepted top status). Did **not** attribute it to "PR #9" as the handoff suggested — memory shows PR #9 was the 3.5b language+QC follow-on, not the router core; the pre-flight date is the well-attested fact.
- **ADR 0004** — status "receptacle follows Phase 3.5" → "both halves shipped" (verified: `/ideas`, `/priorities`, `decisions` table on disk); added a dated amendment; fixed the L67 cross-ref drift "future ADR **0006**" for graphify → **0008-context-indexing** (0006 is risk-scoring; 0008 is the reserved number); noted QMD shipped (no longer "deferred").
- **PIVOT_BRIEF.md** — added the missing Status/Date/Deciders header + "Superseded — pivot executed" note (verified the pivot landed: Agent SDK in `llm.real.ts`, §11 restructured, `scripts/lint-no-sdk-payg.sh` guard live). Date 2026-06-01 (from first git commit).
- **tier-b-system.md** — §5-permitted one-line header only ("shared contract, not a fiche"); did NOT bolt a fake fiche identity on it.

### ⚠️ Handoff correction — ADR 0006 (the big one)

The handoff said: mark 0006 `Proposed → Accepted (2026-06-14, PR #11) + amendment noting integration + real path of the 4-axis tagger`.

**On-disk verification refuted this.** `packages/core/src/risk-classifier.ts` implements the
**§5 enum rule-table** classifier (blocking-rules + perms categories + `needsLLMFallback` seam) —
**there is no 4-axes composite tagger anywhere in the code.** And the dates don't allow it: ADR
0006 is dated **2026-06-21**, a week *after* Phase 6 / PR #11 merged (**2026-06-14**). So the 4-axes
model is a **post-Phase-6 refinement that was never built**, not an integrated, accepted decision.

→ I kept the status **Proposed** (honest), rewrote the stale "à valider au gate de pré-vol Phase 6"
trigger (impossible — Phase 6 already passed), and added a dated amendment reconciling the ADR with
the real code. Marking it "Accepted + integrated" would have been a fabricated claim (A7 drift) — the
exact failure §7 told me to guard against.

### 🐛 Out-of-scope code bug found (flagged, not fixed here)

`packages/db/src/seed.ts` `TIER_A` array seeds **9** agents — `architect` is missing, although its
fiche (`packages/agents/fiches/architect.md`) and avatar (`avatars/architect.svg`) both exist and
§3 lists it in the roster of 10. The cockpit seed therefore under-shows the roster. This is a code
fix, out of the doc-only scope of this PR → flagged as a background task. (This is also *why* I
referenced §3 in ROADMAP instead of hard-coding "10 seeded".)

## Wave 2 — CLAUDE.md hygiene (≤200 lines) + new ADR 0009 — DONE

- **ADR 0009** authored (commit `1ff716b`): status/context/decision/alternatives/consequences/date/deciders; holds the mode table, the §11.bis provider sub-rules, the 2026-06-15 Agent-SDK credit split, the runaway-quota guard. Number is **0009** (0008 reserved for context-indexing per §5).
- **CLAUDE.md 234 → 196 lines** (`wc -l`, ≤200 ✓). §11 condensed to the 5 enforcement rules + the `llm.ts` single-injection-point line + a one-line §11.bis stub (anchor preserved so AGENTS.md §4 / ADR 0002 / §7 cross-refs still resolve) + a pointer to ADR 0009; the mode table, the full §11.bis provider detail, the runaway-quota guard and the billing-change notice now live only in the ADR. §12 + §13 condensed to bullet form (no rule dropped — ≤7-tools, signal-density, 5-item cap, KILL-criteria, self-audit, persistence bridge all retained).
- **Stale/anchors:** §3 heading dropped "(planned)"; §13 persistence bridge future→past ("was seeded … 2026-06-09"); broken anchors fixed — §12's "see §12.1" → inline "see the rules above"; "(§ commit footer)" → "(§7 Commits)".

## Wave 3 — fiche Triggers + skill binary criteria — DONE

### ⚠️ Handoff correction — the "model on the 5 fiches that already have `## Trigger`" premise is FALSE on disk

`grep -rn "## Trigger\|## When" packages/agents/fiches/` returns **nothing** — *no* fiche (target or "excellent") has a `## Trigger`/when-to-use heading. The F3-passing fiches express when-invoked only via `role:`/intro prose. So I did not copy a template; I **added a new `## Trigger` section grounded in the real dispatcher code** to each of the 5 needs-work fiches (after the intro, before `## Principles`). Each dispatch condition was verified on disk:

- **orchestrator** — `runDispatchTick` → `executeNextTask` (`dispatch-tick.ts`), per mission selected within the concurrency budget; never authors a DAG.
- **mission-planner** — `planMission` (`dispatch.ts:233`, `if (m.status !== 'draft') return m`) — once per mission, `draft → planned`.
- **architect** — task tagged `agentHint: architect`, routed via `t.agentHint` (`dispatch.ts`); upstream of Tier B; may `delegate()` to cold `engineering-software-architect`.
- **quality-controller** — `runReviewPhase` → `runCriticGates` → `realQualityController` BEFORE the Reviewer (`review-phase.ts:19`); a QC BLOCK short-circuits.
- **memory-keeper** — drains the `memory_candidates` inbox (close-out ritual ADR 0004 + `MemoryProposal` tasks); sole writer of `data/memory/` (§8).

Fiche-quality guard (`fiche-quality.test.ts`) checks the 4 REQUIRED_SECTIONS as substrings + Principles/RedFlags/VC content — the `## Trigger` addition sits before `## Principles` and disturbs none of them.

### Skill S6 — process-phrasing → observable binary assertions (4 skills)

- **mas-reviewer** — verdict ∈ enum; 6 checklist results recorded; findings carry where/consequence/confidence; `BLOCK ⇔ ≥1 severity:block`; `git diff --name-only` empty.
- **mas-sec-reviewer** — verdict for all 6 perms categories; `risk:blocking ⇒ BLOCK`; BLOCK findings carry category+matchedText; verdict ∈ {PASS,BLOCK}; no file modified.
- **mas-skill-router** — explicit slug map `low→haiku-4-5 / medium→sonnet-4-6 / high·blocking→opus-4-8`; skills/agents count caps; rationale quotes verbatim task token; escalation→`requires_validation`; **new criterion: only L1 summaries read, no L2 body loaded**; valid JSON.
- **mas-memory-keeper** — `COUNT(*) WHERE status='pending' == 0` post-run; touched rows ∈ {promoted,rejected} w/ reason; register-template match; dedup ran; ≤5 global promotions.

## Wave 4 — single-source dedup — PARTIAL (PRODUCT_SPEC §8 + SKILLS_REGISTRY §7 done in Wave 1; TOKEN_STRATEGY pending)
