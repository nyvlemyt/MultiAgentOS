---
name: strategic-compact
description: "Use to decide WHEN to compact a long agent session — manual /compact at logical task boundaries (after research before execution, after a milestone, after a failed approach) instead of arbitrary auto-compaction that fires mid-task and loses state. Do NOT use mid-implementation (you lose live variable/path/partial state), and do NOT use it to define what to inject into a prompt (that is context-pack / skill-router territory)."
summary: "Context-window hygiene for long sessions: auto-compaction triggers at arbitrary points and often mid-task, dropping context you still need. This skill compacts at LOGICAL boundaries instead — research→plan, plan→implement, after a milestone, after a dead-end approach — and NEVER mid-implementation. Two pressure signals: real context size (sum input + cache_read + cache_creation tokens from the turn's usage record, window-scaled threshold) as the primary, tool-call count as a weak secondary. Knows what survives a compact (CLAUDE.md, TodoWrite, memory files, git, disk) vs what is lost (intermediate reasoning, prior file reads, tool history) so you write-before-compact. MAS variant: the threshold maps onto TOKEN_STRATEGY §8 window margins and the §6 eco/standard/expert modes; in MAS the boundaries align to the mission lifecycle (plan→dispatch→review), and the actual context-pack/skill rehydration is owned by mas-context-manager + mas-skill-router, not by this skill."
metadata: {origin: affaan-m/ecc, license: MIT, cluster: skill:core-token, tier: T1, status: library}
---

<!-- pattern from affaan-m/ecc skills/strategic-compact/SKILL.md -->

# Strategic Compact

## Overview

Auto-compaction is a blunt instrument: it fires when the window fills, which is frequently in the middle of an edit, and it discards whatever it judges least relevant — often the variable names, file paths, and partial state you were mid-way through using. This skill replaces "compact when forced" with "compact at the seam." The seams are the natural phase transitions of a task — finishing research before implementing, finishing a plan before coding, abandoning a dead-end approach — where the bulky context (exploration, debug traces) has already been distilled into a plan or a file and can be safely dropped. Compacting there preserves the distilled output and frees the window; compacting mid-implementation destroys live working state and is the one place you must not do it.

In MultiAgentOS the phase seams are the mission lifecycle stages (plan → dispatch → review), and the size threshold aligns to the window-margin caps in TOKEN_STRATEGY §8 and the eco/standard/expert modes in §6. The actual decision of *what context to reload* after a compact belongs to `mas-context-manager` (context packs) and `mas-skill-router` (skill hydration) — this skill only decides *when to compact*.

## When to Use / When NOT

Use when:
- A session approaches the window limit (≈160k on a 200k window, ≈250k on a 1M window)
- Working a multi-phase task (research → plan → implement → test)
- Switching to an unrelated task within the same session
- Just completed a milestone, or just abandoned a failed approach

Do NOT use:
- **Mid-implementation** — you lose variable names, paths, partial edits; the cost outweighs the savings
- To decide *what* to inject on the next turn — that is context-pack and skill-router work, not compaction timing

## Principles

*Source: ECC `skills/strategic-compact` + CLAUDE.md §6 / TOKEN_STRATEGY §5–§8 (window margins, loading rules, caching layers).*

1. **Compact at seams, not at limits.** A logical phase boundary is the only safe compaction point; the window filling is a symptom, the seam is the decision.
2. **Context size is the real signal.** Sum `input_tokens + cache_read_input_tokens + cache_creation_input_tokens` from the latest usage record — that is the true turn context. Tool-call count is a weak proxy (a few large reads fill the window in 3 calls; 50 tiny calls may not).
3. **Write before you compact.** Anything not on disk, in TodoWrite, in CLAUDE.md, or in a memory file is lost. Persist the distilled output first.
4. **Never compact mid-implementation.** Losing live state mid-edit costs more than the window it frees.
5. **The signal advises; the human decides.** A suggestion at the seam is a prompt to choose, not an automatic action.

## Process

1. **Detect pressure.** Read the turn's context size (the three-part token sum). Window-scale the threshold: suggest near 160k on a 200k window, near 250k on a 1M window (`[1m]` marker), and re-remind every additional ~60k of growth.
2. **Locate the nearest seam.** Map the current moment onto the phase table below. If you are mid-implementation, defer.
3. **Persist first.** Save plan to TodoWrite/file, decisions to memory, code to disk. Confirm nothing live-only remains.
4. **Compact with intent.** Use `/compact <summary>` (e.g. `/compact focus on implementing auth middleware next`) so the post-compact session keeps a pointer to the goal.
5. **Rehydrate deliberately.** After compacting, reload only what the next phase needs — in MAS this is the context pack + the hydrated skills the router selected, not a re-read of everything.

### Compaction decision table

| Phase transition | Compact? | Why |
|---|---|---|
| Research → Planning | Yes | Research is bulky; the plan is the distilled output |
| Planning → Implementation | Yes | Plan is in TodoWrite/file; free the window for code |
| Implementation → Testing | Maybe | Keep if tests reference recent code; compact if focus shifts |
| Debugging → Next feature | Yes | Debug traces pollute unrelated work |
| After a failed approach | Yes | Clear the dead-end reasoning before retrying |
| Mid-implementation | No | Losing variables/paths/partial state is costly |

### What survives vs is lost

| Persists | Lost |
|---|---|
| CLAUDE.md instructions | Intermediate reasoning/analysis |
| TodoWrite task list | Previously read file contents |
| Memory files | Multi-step conversation context |
| Git state, files on disk | Tool-call history and counts |

## Rationalizations

| Excuse | Reality |
|---|---|
| "I'll let auto-compact handle it" | Auto-compact fires mid-task and drops state you still need. Compact at the seam yourself. |
| "Tool count hit 50, time to compact" | Tool count is a weak proxy. Read the real context size before deciding. |
| "I'm in the middle but the window's full" | Never compact mid-implementation — finish the edit or persist it first. |
| "I'll remember the plan after compacting" | You won't; conversation context is lost. Write it to TodoWrite/file first. |
| "Compacting always saves time" | Mid-edit it costs time (re-deriving lost state). Seam-only. |

## Red Flags

- A `/compact` issued in the middle of an unfinished edit or refactor
- Deciding to compact purely from tool-call count, never reading context size
- Compacting without first persisting the plan/decisions/code
- No `/compact <summary>` pointer left for the post-compact session
- Re-reading the entire project after a compact instead of rehydrating the context pack + selected skills

## Verification Criteria

- [ ] The compaction decision is anchored to a logical phase seam, never mid-implementation
- [ ] Context size (three-token sum), not tool-call count alone, drives the threshold
- [ ] All distilled output is persisted (TodoWrite / file / memory) before compacting
- [ ] `/compact` carries a forward-looking summary of the next phase
- [ ] Post-compact rehydration reloads only the next phase's needs (context pack + selected skills), not everything
