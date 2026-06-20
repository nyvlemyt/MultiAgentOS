# Risk Scoring + Session Orchestration (ecc2 patterns)

*Source: `affaan-m/ecc` `research/ecc2-codebase-analysis.md` — analysis of `ecc-tui` v0.1.0, a 4.4k-line Rust TUI control-plane that orchestrates agent sessions (MIT). Distilled 2026-06-21. Feeds CLAUDE.md §5 (risky actions) + Phase 6 (autonomy/risk classifier) + the worker.*

## 1. Four-axis risk scoring (adopt the model)

ecc2 scores every tool call on **four axes**, combined into a composite **0.0–1.0** with a graded action:

| Axis | What it measures |
|---|---|
| **Base tool risk** | The tool itself (read ≪ write ≪ shell ≪ network) |
| **File sensitivity** | Target path (`.env`, secrets, keystores score high) |
| **Blast radius** | How much it can affect (one file vs repo-wide vs system) |
| **Irreversibility** | Can it be undone (edit ≪ `rm -rf` / `git push --force`) |

→ composite → **Allow / Review / RequireConfirmation / Block**. Empirically catches `rm -rf`, `git push --force origin main`, and reads of `.env`/secrets.

**MAOS application:** our §5 list is currently a *binary* enum (`low/medium/high/blocking`) of hardcoded categories. The 4-axis model is a strictly better classifier for the Phase-6 risk tagger — especially the **irreversibility** and **blast-radius** axes, which §5 only encodes implicitly. Recommended: when the dispatcher tags a task, compute these four axes and map the composite onto the existing enum (high/blocking still always human-gated). The `config/project-stack-mappings.json` permission `allow`/`deny` lists are a ready per-stack input to the base-tool axis.

## 2. Session orchestration patterns (worker-relevant)

- **DbWriter thread** — a dedicated OS thread owns all SQLite writes, fed from async code via an `mpsc` channel with oneshot acks. Clean answer to "SQLite-from-async" contention. *MAOS parallel:* the worker's job-table writes; if write contention appears, serialize through one writer rather than sprinkling connections.
- **Session state machine** with enforced transitions (`Pending → {Running,Failed,Stopped}`, `Running → {Idle,Completed,Failed,Stopped}`). Explicit, testable lifecycle — mirrors our mission/task status; worth keeping transitions *enforced* (reject illegal jumps) rather than free-text status.
- **Ring buffer** for session output (`OUTPUT_BUFFER_LIMIT = 1000` lines, auto-evict). Bounded memory for long-running agent stdout — relevant to our SSE/stream layer.
- **SessionMetrics** per session (tokens, cost, duration, tool_calls, files_changed). *Gap noted in ecc2:* no aggregate view. MAOS should aggregate from the start (total quota across sessions, top tools, cost/mission) — ties to the `budgets` table + Agent-SDK quota tracking (CLAUDE.md §11).

## 3. Lessons (anti-patterns to avoid)

- **Comms "send without receive"** — ecc2 defined `TaskHandoff/Query/Response/Conflict` message types and a `messages` table but shipped only `send()`, no `receive()/poll()/inbox()`. Result: agents can't actually coordinate. **Lesson for MAOS inter-agent messaging:** build the read side and the consumer in the same slice as the write side, or the feature is inert.
- **Single-agent lock-in** — `agent_program()` hardcoded `"claude"` while the CLI advertised `--agent`. Don't advertise an extension point the code can't honor (cf. our §11.bis multi-provider router — keep the seam real).
- **Config file-only** — no env/flag overrides. MAOS already uses env (`CLAUDE_CONFIG_DIR`, budgets) — keep it.

## Verification posture observed (good signs to emulate)
Zero `unsafe`, 3 `unwrap()`s total, `anyhow::Result` propagation, no hardcoded secrets, `Stdio::piped()` (no shell-injection), risk scoring as a first-class feature. One open item: task strings passed to `claude --print` are not shell-interpreted today but should be audited if quoting ever changes — same care our headless `claude --print` fallback needs.

Relates to CLAUDE.md §5 · Phase 6 autonomy · [[production-patterns]] · `config/project-stack-mappings.json` (per-stack permission lists).
