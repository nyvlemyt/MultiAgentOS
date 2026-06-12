# Phase 4.5 · Memory & Knowledge Intake — ready-to-paste build prompts

Two prompts: **Doer** then **Checker**. Paste the Doer in a fresh session **only after you say "go Phase 4.5"** (phase gate, CLAUDE.md §10). Pre-flight architecture is decided in **ADR 0004**; plan in `docs/learning/2026-06-09-phase4.5-preflight/plan.md`.

> **Decide at kickoff (ADR 0004 scope risk):** build the *full* phase, or only the *producer* half (steps 1–7) before Phase 3.5 and defer the *receptacle* (Ideas/Decisions/prioritization UI) to after 3.5. Default recommendation: **producer-only before 3.5.**

---

## ① DOER — paste this to build Phase 4.5

```
Build Phase 4.5 (Memory & Knowledge Intake) of MultiAgentOS.

Read first: CLAUDE.md (esp. §5 risky actions, §8 memory write-lock, §11 billing, §12 knowledge,
§13 learning bootstrap), ROADMAP.md "Phase 4.5" + "Build order", docs/decisions/0004-memory-intake-and-auto-capture.md,
docs/learning/2026-06-09-phase4.5-preflight/plan.md, docs/backlog/intake-audit-skill.md,
docs/workflows/intake-audit-template.md, docs/knowledge/memory-patterns.md (§agentmemory),
docs/knowledge/project-doctrine.md (close-out ritual), AGENTS.md (memory-keeper, sec-reviewer).

PRE-FLIGHT FIRST (CLAUDE.md §13): targeted intake-audit of agentmemory + the close-out ritual + the
intake-audit skill + classifier signals (method: intake-audit-template.md). Distill the kept items into
docs/knowledge/. Scope to this phase. THEN build.

Rules:
- Subscription-only, NO PAYG (§11). LLM only via packages/core/src/llm.ts. Use the canonical `pnpm -r test`
  for tests — do NOT export MAS_MOCK_LLM globally (it breaks dispatch.test.ts's vi.mock seam; each suite
  self-configures). Memory Keeper is the SOLE writer to data/memory/ (§8) — intake produces CANDIDATES only.
- Deterministic rules FIRST in the classifier; a single light LLM call (eco) only when rules abstain, and
  log it to /trace. No embeddings.
- MANDATORY mas-sec-reviewer PASS before ingesting any repo or running any source code (§5). risk:blocking
  → always human. Never write outside data/.
- ≤5 global items injected per call (§12). Auto-capture adds ZERO startup injection.
- TDD (superpowers:test-driven-development) for new domain logic. Conventional Commits ≤60 chars. eco mode
  for internal prose. New branch `phase/4.5-memory-intake` — never push to main, never merge.
- STOP at the Phase 4.5 exit criteria. Do NOT start Phase 3.5 / the router. Do NOT adopt agentmemory's MCP,
  QMD, or Graphify (deferred — keep auto-capture behind the existing captureCandidates() seam).
- Token budget this session: 70k. At 80% used, pause and report.

Build, in this order, committing + verifying each step (PRODUCER half — build before 3.5):
1. mission-complete worker hook → fires the close-out ritual → captureCandidates() → memory_candidates
   (pending). No new write path. TDD: completed mission yields pending rows, asserts NO register write.
2. packages/memory/src/intake.ts : multi-source (note/skill/pattern first; repo/course behind the security
   gate) → an intake dossier (docs/intake/<date>-<slug>.md) + a candidate. TDD.
3. packages/memory/src/classifier.ts : deterministic {register, scope} rules; LLM fallback only on abstain,
   logged. TDD: rule hits make 0 LLM calls (spy/count); abstain path logged.
4. Security gate: dispatch.ts requires a mas-sec-reviewer PASS before repo ingest / code exec. TDD: reject
   without PASS; risk:blocking pauses for human.
5. config/intake.trust.json (empty allowlist, schema-only, mirror permissions.json) + auto-file: trusted
   source → Keeper auto-promotion (write-locked path); untrusted → inbox. TDD both routes.
6. .claude/skills/intake-audit/SKILL.md : author per CLAUDE.md §12 (read docs/knowledge/skills-reference.md
   + prompting-anthropic.md first). L1 summary ≤200 tokens + L2 body (Principles→Process→Rationalizations→
   Red Flags→Verification Criteria).
7. DB migration: memory_candidates intake-provenance columns (source_kind, dossier_path, classifier_decision,
   auto_filed). Applies clean. /memory page: add intake-source filter.

RECEPTACLE half (build only if NOT splitting — else defer to after 3.5):
8. /ideas kanban + Decision Log + deadlines/milestones + prioritization + Project Health + budget projection
   per ROADMAP "Phase 4.5 · B. Receptacle". Deterministic scoring, no LLM. Intake dossiers land here.

Naming: project decisions = BDR-XXX. Build-time architecture = ADR-000X.

Definition of Done (all must pass — this is the gate; see plan.md §6):
- Completed mission auto-fires capture → pending candidates, no manual step, no direct write (test).
- Intake dossier produced + classified correctly; rule hits use 0 LLM (test asserts count); abstain logged.
- Security gate rejects repo ingest / code exec without mas-sec-reviewer PASS (test); risk:blocking → human.
- intake-audit skill exists with §12 structure; produces a dossier for a sample item.
- ≤5 injection cap intact; auto-capture adds zero startup injection.
- Auto-file only for allowlisted sources; else inbox.
- 4/4 green via canonical commands: `pnpm -r test` + `pnpm lint` + `pnpm build` + `lsof -ti:3000|xargs kill`
  then `pnpm --filter @mas/web smoke`. Never leave red — if a fix breaks verification, revert + backlog it.

Then write docs/learning/<date>-phase4.5-intake/build-report.md (done / deferred+reason / DoD status /
commit list) and STOP for my review. Do not start Phase 3.5.
```

---

## ② CHECKER — paste this in a separate session to verify

```
Verify Phase 4.5 (Memory & Knowledge Intake) of MultiAgentOS against its exit criteria. Read-only review —
do NOT fix, report.

Read: docs/decisions/0004-memory-intake-and-auto-capture.md, docs/learning/2026-06-09-phase4.5-preflight/plan.md
(§6 validation criteria), ROADMAP.md "Phase 4.5", the build-report under docs/learning/.

IMPORTANT — deterministic method: run the CANONICAL `pnpm -r test` (do NOT export MAS_MOCK_LLM globally; it
flips dispatch.ts:80 to the real mockLLM and breaks dispatch.test.ts's vi.mock budget assertions — a known
env artifact, not a defect).

Check and give each PASS/FAIL with evidence:
1. Auto-capture: a completed mission creates memory_candidates (pending) with no manual step; prove NO direct
   register write happened (find the test + the write-lock path).
2. Candidate-only: intake never writes a register directly — promotion stays promoteCandidate() behind the
   Keeper write-lock (§8).
3. Classifier: deterministic rule hits make 0 LLM calls (find the spy/count assertion); abstain → single
   logged light-LLM call; no embeddings, no PAYG (§11).
4. Security gate: ingesting a repo / executing source code without a mas-sec-reviewer PASS is rejected (find
   the test); risk:blocking always pauses for human (§5).
5. Auto-file: only config/intake.trust.json sources auto-promote (via Keeper path); others land in inbox.
6. intake-audit skill: exists with the §12 structure (Principles/Process/Rationalizations/Red Flags/
   Verification Criteria) + L1 summary ≤200 tokens; produces a dossier.
7. Injection cap ≤5 global items intact; auto-capture adds zero startup injection.
8. NO scope creep: no QMD / Graphify / multi-account router / non-Anthropic provider code (deferred).
9. Verification: `pnpm -r test`, `pnpm lint` (PAYG guard + per-package tsc), `pnpm build`, and
   `pnpm --filter @mas/web smoke` all green (paste output).

Output a verdict: PASS / NEEDS_WORK / BLOCK with a findings list. Do not modify files.
```

---

### Notes for the next session
- If the phase is split: producer (Doer steps 1–7) ships before Phase 3.5; receptacle (step 8) after. Update ROADMAP "Build order" if you split.
- Keep `docs/knowledge/` + ADRs in sync with anything learned (knowledge-bootstrap §5.bis enrichment spiral).
- The auto-capture seam is `captureCandidates()` (Phase 4) — reuse it; do not invent a second write path.
