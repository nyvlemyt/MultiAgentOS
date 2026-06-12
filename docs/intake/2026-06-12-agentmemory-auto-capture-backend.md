# Intake — agentmemory as auto-capture backend (2026-06-12)

*Produced by the `intake-audit` skill (sample run, Phase 4.5 step 6).*

- **Type** : repo (capture-hooks subset)
- **Source** : https://github.com/rohitg00/agentmemory
- **Récence / obsolescence** : active 2026 / low
- **Résumé** :
  - 4-level memory (working/episodic/semantic/procedural), capture via 12 Claude Code hooks
  - Retrieval BM25 + vector + knowledge graph via RRF (95.2% R@5 LongMemEval-S)
  - Ships an MCP stdio server exposing 53 tools
  - Claimed −92% tokens vs naive context injection

## Fit
Only the **SessionStart/PostToolUse/Stop capture hooks** matter: they could feed `captureCandidates()` automatically during a session, complementing the mission-end ritual. Retrieval/RRF duplicates FTS5 (ADR 0003) — duplicate surface. Touches: worker, `packages/memory` (behind the seam only).

## Coûts
- **Install** : MCP stdio process per session + hook config (~2 sessions effort)
- **Maintenance** : single-maintainer young repo — drift risk medium-high
- **Retrait** : LOW **only if** confined behind `captureCandidates()`; HIGH if its MCP tools leak into agent prompts

## Scores (0–5)
project_fit 3 · token_efficiency 4 · safety 3 · implementation_effort 2 · evidence_maturity 3 · user_value 3 · phase_compatibility 1

## KILL criteria
- Adds an MCP process for retrieval the gate doesn't need → **hit** (ADR 0004 alt. rejected)
- Out of current phase (4.5 producer scope is ritual + intake) → **hit** → backlog
- No PAYG dependency (local) → pass

## Décision
**`backlog_next`** (target: 4.x, after Phase 3.5). The Phase 4 capture BDR and ADR 0004 §1 already
confine it behind the seam; the ritual + intake path must prove insufficient before a 12-hook
dependency earns its keep. Adopting now would duplicate retrieval and break phase discipline.

## Appropriation (si retenu en 4.x)
MultiAgentOS version = hooks ONLY, emitting `CaptureCandidate[]` into the existing seam; ignore the
53-tool MCP surface entirely; RRF stays out (FTS5 → QMD path per ADR 0003).

## Ré-audit
Re-audit when: (a) Phase 4.x opens, or (b) pending-candidate volume shows the ritual misses >30% of
useful session learnings, or (c) the repo goes >6 months without commits (then `reject`).
