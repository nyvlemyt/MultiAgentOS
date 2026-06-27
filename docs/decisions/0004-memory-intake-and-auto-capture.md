# ADR 0004 — Memory & knowledge intake + auto-capture (Phase 4.5)

- **Status**: Accepted — **both halves shipped**. Producer half built 2026-06-12 (Checker PASS 2026-06-13 on `phase/4.5-memory-intake`); receptacle half (Ideas Inbox / Decision Log / prioritization) since shipped — `/ideas`, `/priorities`, the `decisions` table. See the 2026-06-27 amendment.
- **Date**: 2026-06-09
- **Deciders**: Melvyn + Claude (pre-flight Phase 4.5)
- **Sources**: `docs/backlog/intake-audit-skill.md`, `docs/backlog/second-brain-cross-project.md`, `docs/workflows/intake-audit-template.md`, `docs/knowledge/memory-patterns.md` (§agentmemory), `docs/knowledge/project-doctrine.md` (close-out ritual, 5 registers), `CLAUDE.md §5/§8/§11/§12`, ADR 0003 (storage/retrieval seam), Phase 4 capture BDR (`packages/memory/src/capture.ts` `CAPTURE_DECISION`).

## Context

Phase 4 built the memory **substrate**: 5 registers, the Memory Keeper write-lock, the `memory_candidates` → `promoteCandidate()` pipeline, the FTS5 retriever, the persistence bridge, and the `captureCandidates()` **seam**. But Phase 4 deliberately stopped at an **explicit** capture gesture (the close-out ritual) — auto-capture was deferred (capture BDR) so it would be wired cleanly in a dedicated phase rather than bolted on.

Phase 4.5 must now answer: **how does the world get *into* memory, safely and cheaply?** Two producers feed one substrate:
1. **Missions** — a completed mission should durably capture its decisions/learnings/blockers without a manual step.
2. **External knowledge** — a new resource (repo / note / course / skill / pattern) should be audited, classified, and (if kept) become memory.

Hard constraints (unchanged): subscription-only, no PAYG (§11); Memory Keeper is the **sole writer** (§8); risky actions are gated (§5); ≤5 global items injected per call (§12); reversibility is a first-class cost (intake-audit §3); local-first.

This phase is **re-sequenced before Phase 3.5** (the multi-account router): the router *consumes* grounded project memory, so the producer of that memory must exist first.

## Decision

**1. Auto-capture trigger = the `mission-complete` event, routed through the existing `captureCandidates()` seam.**
- A worker hook on mission completion runs the close-out ritual (zero-LLM, deterministic) and calls `captureCandidates(db, taskId, items[])` → `memory_candidates` rows (status=pending). **No new write path is introduced** — the Phase 4 seam is the only door.
- The **agentmemory** hooks (SessionStart/PostToolUse/Stop), deferred in the Phase 4 capture BDR, become an **optional** auto-capture backend behind that same `captureCandidates()` API — adopted only if it earns its keep via an intake-audit; FTS5/ritual already clear the bar.

**2. Intake is candidate-only; promotion stays Memory-Keeper-exclusive.**
- Every producer (mission auto-capture, external resource) emits **candidates**, never register entries. Promotion is `promoteCandidate()` behind the write-lock (Phase 4). Auto-capture cannot, by construction, write memory directly.

**3. Multi-source intake produces an *intake dossier* first.**
- Sources: repo / note / course / skill / pattern. Each is audited into `docs/intake/<date>-<slug>.md` (skeleton in `intake-audit-template.md`; `docs/intake/` already holds graphify + qmd dossiers). The dossier — not the raw source — is what flows to the Ideas Inbox / Decision Log and, on acceptance, to a memory candidate.

**4. `intake-audit` is a *skill*, not a rule and not an agent** (backlog decision, `intake-audit-skill.md`).
- Reusable, token-cheap, progressive disclosure. Authored per CLAUDE.md §12 (Principles → Process → Rationalizations → Red Flags → Verification Criteria). It produces the dossier and a keep/adapt/reject decision with a re-audit date.

**5. Classifier = deterministic rules first, light LLM only on abstain.**
- A rule table maps a candidate/dossier to a **register** (BDR / LRN / BLK / journal / EVAL) + **scope** (`project` | `global`) from cheap signals (source type, keywords, the emitting task's tags, explicit user tag). Only when the rules **abstain** does a single light LLM call (subscription, eco/medium effort) classify — and that call is logged to `/trace`. No embeddings, no PAYG (§11).

**6. Security audit is mandatory before ingesting a repo or executing any source code.**
- `mas-sec-reviewer` must PASS before reading an external repo's contents into intake or running any code from a source. `risk: blocking` → always human (§5). Repo ingestion writes nothing outside `data/`; the external tree is read-only (§8 / CLAUDE.md "all state in `data/`").

**7. Auto-file for trusted sources = config-driven auto-triage, still through the Keeper write-path.**
- A `config/intake.trust.json` allowlist lets high-confidence sources skip *manual* triage: their candidates are auto-promoted by the Keeper path (not a new writer, not a §5 bypass). Anything not on the list lands in the inbox.

## Rationale

- Reuses the Phase 4 seam → **no second write path to audit**; the §8 write-lock invariant is preserved automatically.
- Deterministic-first honors §11 + the token budget (most candidates classify with zero LLM); the LLM is a typed, logged fallback, not the default.
- The security gate is the price of "ingest any repo" — without it, intake becomes an arbitrary-code/read-anything hole. Routing it through the existing `mas-sec-reviewer` skill avoids inventing a parallel gate.
- Making intake-audit a **skill** matches the backlog's settled form and keeps it composable across the producer + receptacle.
- Re-sequencing before 3.5 means the router has real memory to consume on day one (no empty-store cold start).

## Alternatives considered

- **Bolt auto-capture onto Phase 4** — rejected: the capture BDR deliberately deferred it; doing it under the Phase 4 gate would expand a verified phase and skip a dedicated security/doctrine pre-flight.
- **agentmemory as the primary capture backend now** — rejected for the MVP: a 12-hook + 53-tool MCP stdio server from a single-maintainer young repo, for retrieval (RRF) the gate doesn't need. Kept as an optional backend behind the seam (decision 1).
- **LLM-first classification** — rejected: burns quota on cases cheap rules solve; violates the token discipline (§6/§12). LLM is the abstain fallback only.
- **Direct auto-write for trusted sources** (skip candidates) — rejected: breaks the §8 single-writer invariant. Trust = skip *manual triage*, not skip the Keeper.
- **A new `intake-keeper` agent** — rejected: ≤7-tool/agent discipline + the backlog's "skill, not agent" decision. The Memory Keeper still owns writes; intake-audit is a skill the orchestrator runs.

## Consequences

- New: `mission-complete` worker hook; an intake module (likely `packages/memory/src/intake.ts` + a `classifier.ts`); `config/intake.trust.json`; the `intake-audit` skill under `.claude/skills/`.
- `memory_candidates` likely gains intake-provenance columns (source kind, dossier path, classifier decision, `auto_filed` bool) → one migration.
- The `mas-sec-reviewer` skill becomes a hard pre-step in the intake path (wired in the dispatcher, not re-implemented).
- `/memory` (Memory Center) gains an intake-source filter; the receptacle (`/ideas`, Decision Log) receives dossiers.
- **Scope risk**: Phase 4.5 now spans producer + receptacle. If too large, split at the pre-flight gate — producer (this ADR) before 3.5, receptacle (Ideas/Decisions/prioritization UI) after 3.5. Documented in ROADMAP "Build order".
- Deferred to later: agentmemory backend adoption (own intake-audit), Graphify codebase indexing (future **ADR 0008-context-indexing** — number reserved; *not* 0006, which is risk-scoring), cross-project second-brain promotion (`second-brain-cross-project.md`, candidate ADR). *(QMD retriever — originally deferred here to ADR 0003 §4.x — has since shipped as the live primary retriever; see the 2026-06-27 amendment.)*

## Amendement (2026-06-27) — état réel

- **Receptacle livré.** La moitié receptacle (Ideas Inbox / Decision Log / prioritization), notée « follows Phase 3.5 » à l'origine, est en place : routes `/ideas` et `/priorities`, table `decisions` (`packages/db/src/schema.ts`).
- **QMD vivant.** Le retriever QMD, listé en « deferred » ci-dessus (ADR 0003, 4.x), a été promu **retriever primaire en production** en Phase 9a2 (2026-06-23), avec FTS5 en fallback. Le seam `MemoryRetriever` de cet ADR reste l'interface ; QMD en est l'implémentation par défaut.
- **Correction de renvoi.** L'indexation de code « Graphify » était renvoyée à un « future ADR 0006 ». Le numéro **0006** a en réalité été attribué au scoring de risque 4-axes ; l'ADR context-indexing reste **0008** (numéro réservé). Renvoi corrigé ci-dessus.
