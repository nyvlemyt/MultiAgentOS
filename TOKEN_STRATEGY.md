# Token Strategy — MultiAgentOS

## 1. Premise

Claude Code subscription = fixed monthly cost (Pro/Max). The budget envelope is **not** a cash pool — it is a 5-hour rolling message window and a weekly cap per subscription. Tokens are **quota signals**, not cash. Default to the most efficient path; escalate only when the task genuinely needs it. Every LLM call goes through `packages/core/llm.ts`, the single enforcement point for every rule below.

## 2. Three operating modes

| Mode       | Tier A model              | Tier B model                        | Caveman              | Context loading                 | Use case                          |
|------------|---------------------------|-------------------------------------|----------------------|---------------------------------|-----------------------------------|
| `eco`      | claude-haiku-4-5          | claude-haiku-4-5                    | ON (internal prose)  | Summaries only                  | Background work, autopilot batches |
| `standard` | claude-haiku-4-5 → sonnet-4-6 on retry | claude-sonnet-4-6        | OFF                  | Summaries + on-demand hydration | Default                            |
| `expert`   | claude-sonnet-4-6         | claude-sonnet-4-6, claude-opus-4-7 on review | OFF       | Full hydration allowed          | Hard architecture, security, debugging |

The cockpit shows the current mode in the topbar. Mode switches are logged as events.

## 3. Budget hierarchy

Lower wins.

1. **Project window share** — default: no single project may consume > 40 % of the current 5-hour window without user confirmation. The window is shared across all projects under the subscription (key: `subscriptionUserId + windowStart`).
2. **Mission budget** — estimated by Skill Router on `planned`; enforced as a hard cap.
3. **Task budget** — per Tier A fiche default (see `AGENTS.md §3`).

Behaviour:

- At 80 % spent of any budget → warning banner + the active agent receives a `tightenContext` signal in its next system prompt.
- At 100 % → dispatcher pauses, asks user. Autopilot cannot bypass.

## 4. Caching layers

1. **Context packs** — `data/context-packs/<projectId>.md` (LLM-summarized project state, ≤ 4 k tokens). Built by the Context Manager from the external `projects.path`. **The source tree itself is never duplicated inside this repo** — only the summary lives in `data/`. Rebuilt when the file-mtime manifest detects > N % change (default 10 %) or older than 24 h.
2. **Skill summaries** — `data/skill-cache/<id>/summary.md` (≤ 200 tokens). Built once, regenerated only when the source `SKILL.md` mtime changes.
3. **Mission summaries** — `data/mission-summaries/<missionId>.md` (≤ 500 tokens). Built at `archived`. Feeds future missions on the same project.
4. **Anthropic prompt cache** — system blocks above 1 k tokens use `cache_control: ephemeral`. Pinned skills + Tier A fiche + active context pack are cached together as one block (the 5-minute TTL is friendly to bursty missions).

## 5. Loading rules (enforced in the LLM wrapper)

- Never load a skill body unless the Skill Router explicitly hydrated it for the current task.
- Never load a project's source tree if a fresh context pack exists.
- Never load > 3 mission summaries for cross-mission memory; load the global project summary instead.
- Hard ceiling per LLM call: 32 k input tokens. Worker rejects calls above that unless `bypassCeiling: true` is set by the Sec Reviewer.

## 6. Caveman gate

Caveman activates **only** for agent-to-agent prose under `eco`. Specifically:

- Mission Planner → Skill Router messages
- Skill Router → Tier B agent kick-off
- Reviewer → Sec Reviewer handshakes
- Trace event descriptions stored in `events.payload_json`

Caveman NEVER touches: generated code, commit messages, PR bodies, user-facing UI copy, ADRs, README, runbooks, error messages, validation modal text. Enforce via a hardcoded route table in `packages/core/llm.ts` — the gate fails closed (default: Caveman OFF).

## 7. Anthropic prompt cache strategy

Per call:

- `system[0]`: pinned skill 1-liners + current Tier A fiche → `cache_control: ephemeral`.
- `system[1]`: active context pack (if any) → `cache_control: ephemeral`.
- `messages`: mission state + current task → **not** cached (always volatile).

Target ≥ 60 % cache hit rate across all calls in a 5-min window. Track `cache_creation_input_tokens` vs `cache_read_input_tokens` in `events` and surface the ratio in `/tokens`.

## 8. Subscription quota cap (hard)

`/tokens` page shows **messages used in current 5-hour window / week** live. No € figures — the subscription cost is fixed.

- Default window margin: **leave ≥ 30 % of the 5-hour window free at all times**. When margin is breached, ALL execution pauses and a modal surfaces.
- Weekly soft cap: **≤ 70 % of estimated weekly quota** consumed by automated missions (reserve 30 % for interactive use).

Crossing either cap pauses ALL execution and surfaces a modal. **Autopilot cannot bypass.** The user can raise caps from `/tokens` (logged as an event).

The quota counter in `budgets` is keyed on `(subscriptionUserId, windowStart)` — the 5-hour window is shared across all projects. Per-project breakdown on `/tokens` is a **read-only view**, not a separate quota bucket.

## 9. Telemetry

Every LLM call logs to `events`:

```ts
{
  type: 'llm_call',
  model,
  input_tokens,
  output_tokens,
  cache_read_input_tokens,
  cache_creation_input_tokens,
  quota_units,       // renamed from cost_cents — subscription quota consumed (not cash)
  mission_id,
  task_id,
  agent_id
}
```

Aggregations:

- Per project / per mission / per agent / per skill cost (rolled up nightly).
- Cache hit ratio.
- Mode-mix histogram (eco vs standard vs expert call counts).
- Median tokens-per-mission trend.

## 10. Anti-patterns (code-reviewed out)

- Re-injecting the full project README in every prompt.
- Looping the same prompt with minor edits instead of using a single multi-step plan.
- Loading `superpowers/skills/*` bodies — load the 1-line summary, hydrate on demand.
- Running expert-mode missions that never reach a Reviewer step (high spend, no validation).
- Tier A agents emitting > 1 k tokens of prose per turn (cap them in the system prompt — Caveman is the easiest way).
- Letting the worker pull rows without a `LIMIT` (cost shows up in DB hot-paths too).

## 11. Phase-gated knobs

The strictness of these rules can ramp up across phases:

| Phase | Hard ceiling per call | Window margin | Cache hit target |
|-------|-----------------------|---------------|------------------|
| 1     | 16 k tokens           | n/a (mocked)  | n/a (mocked)     |
| 2     | 24 k tokens           | ≥ 40 %        | ≥ 30 %           |
| 3+    | 32 k tokens           | ≥ 30 %        | ≥ 60 %           |

Defaults above are MVP baselines; the user can override per-project from `/tokens`.
