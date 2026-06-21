# Continuous Learning + Memory-Persistence Lifecycle (ECC patterns)

*Source: `affaan-m/ecc` `hooks/memory-persistence/`, `scripts/hooks/*.js`, `docs/continuous-learning-v2-spec.md` (MIT). Distilled 2026-06-21 — PATTERN only; ECC's JS hook impls are not copied (MAOS ships its own hook surface). Feeds CLAUDE.md §13 (persistence bridge / enrichment spiral) + Phase 4 memory.*

## 1. Memory-persistence lifecycle contract

ECC wires memory to Claude Code lifecycle events. The contract (event → purpose):

| Event | Purpose | Blocking |
|---|---|---|
| `SessionStart` | Load **bounded** prior context + project metadata | no |
| `PreCompact` | Save state **before** context compaction | no |
| `PreToolUse` / `PostToolUse` | Capture tool intent + result as learning signals | no |
| `PostToolUse` | Record tool/file activity for metrics & observability | no |
| `SessionEnd` | Persist a session-end summary (when transcript metadata exists) | no |
| `Stop` | Batch quality gate (format/typecheck, console-log audit) | yes on failure |

**Operator guardrails worth copying verbatim:**
- Keep persistence **local by default**; never send transcripts/tool traces to hosted services unless explicitly enabled.
- **Bound** the context loaded at SessionStart (`ECC_SESSION_START_MAX_CHARS`) with an opt-out (`…_CONTEXT=off`).
- Profile-gate hooks (`ECC_HOOK_PROFILE`, `ECC_DISABLED_HOOKS`) so they're tunable per environment.

**MAOS application:** this is the concrete shape of the §13 persistence bridge. Our Memory Keeper already owns `data/memory/`; the missing piece is the *lifecycle wiring* — a SessionStart that injects a **bounded** project memory pack (we have `data/context-packs/<projectId>.md`, TOKEN_STRATEGY §6) and a PreCompact/SessionEnd that flushes a session summary into the Memory Center inbox as `MemoryProposal` candidates. The "bounded + local + opt-out" rules map onto our token discipline and §8 memory boundaries.

## 2. Continuous-learning v2 spiral

ECC's learning loop is four stages:

1. **Hook-based observation capture** — every tool use emits a learning signal (observe-runner).
2. **Background observer analysis loop** — a process digests observations off the hot path.
3. **Instinct scoring + persistence** — recurring patterns become scored "instincts."
4. **Evolution** — high-value instincts graduate into reusable **skills / commands**.

**MAOS application:** this is exactly the "enrichment spiral" named in CLAUDE.md §13.bis and `docs/backlog/second-brain-cross-project.md`. Mapping:
- stage 1–2 → agent-proposed `MemoryProposal` candidates (already a task type) fed by an observation hook, triaged by the Memory Keeper (off the mission hot path).
- stage 3 → signal-density scoring (we already gate injected memory by signal density, §12) applied to *promotion*, not just injection.
- stage 4 → a promoted instinct becomes a library skill (we already have `promoteSkill()` + the cold library; this closes the loop the other direction: runtime learning → cold library, not just build-time harvest → library).

The key insight ECC encodes: **observation must be cheap and continuous (hooks), analysis must be deferred (background), and promotion must be gated (scoring)** — never learn synchronously inside the task.

## 3. Concrete next steps for MAOS (backlog)
- SessionStart hook → inject bounded context-pack (cap chars, opt-out env).
- PreCompact + SessionEnd hooks → flush session summary as `MemoryProposal`s.
- Background observer → score recurring `MemoryProposal`s; promote high-signal ones to project/global memory, and the strongest to a cold library skill via `promoteSkill()`.
- All persistence local under `data/`; nothing leaves the machine without explicit opt-in (§8 + §11 posture).

Relates to CLAUDE.md §13 / §13.bis · [[memory-patterns]] · [[project-doctrine]] · `docs/backlog/second-brain-cross-project.md` · [[project_linked_memory]].
