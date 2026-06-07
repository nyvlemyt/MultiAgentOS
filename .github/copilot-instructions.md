# Copilot review instructions — MultiAgentOS

MultiAgentOS is a **local-first, single-user multi-agent mission control** (not a chat UI). Review against the project doctrine in `CLAUDE.md`. Flag any violation of the rules below — they are non-negotiable.

## Hard rules (always flag a violation)

1. **Billing isolation (§11).** No runtime code may import `@anthropic-ai/sdk` outside `packages/core/src/api-fallback/`. The single LLM injection point is `packages/core/src/llm.ts` (real impl `llm.real.ts`, mock `mockLLM`). No other file may instantiate an LLM client. `ANTHROPIC_API_KEY` is a smell, never a feature — the worker must refuse to start if it is set. PAYG is forbidden; subscription only.
2. **Risky actions are gated (§5).** `rm`, `git reset --hard`, force push, branch deletion, writes to `.env*`/secrets, writes outside the active project's path, network to non-allowlisted hosts, and `curl | sh`/`eval`/`sudo` must require human validation. Flag any code that performs these without going through the validation gate.
3. **Local-first.** External projects are referenced by absolute path — never copied, moved, or cloned into this repo. All app state lives in `data/` (gitignored).
4. **Agent architecture.** Tier A orchestrates, Tier B executes, the dispatcher is the only pass-through. Tier B never calls Tier A. Max **7 tools per agent**. Only the Memory Keeper writes to `data/memory/`.
5. **Skills.** Progressive disclosure: L1 `summary` (≤200 tokens) for prompt injection, L2 body on demand, L3 references. Never inject full bodies at prompt-assembly time. Skill metadata interpolated into prompts must be escaped (no tag smuggling).
6. **Token discipline.** Prefer the mocked LLM in tests (`MAS_MOCK_LLM`), summaries over bodies, cached context. Quota is tracked on `llm_call` events (TOKEN_STRATEGY §8) — counters must filter `events.type = 'llm_call'`, not all events.

## Quality bar

- **Correctness over style.** Report every real bug (logic, security, data-loss, race) with severity + confidence; don't filter for importance.
- **No silent destructive ops**; no silent error swallowing that masks real failures (log at the right level).
- **Server components read the DB directly** — don't HTTP self-fetch an internal API route (origin/port-fragile).
- **Tests:** Vitest, TDD for new domain logic. New behavior needs a failing test first. e2e via Playwright (`apps/web/tests`).
- **Commits:** Conventional Commits, subject ≤60 chars. No new top-level files without updating `CLAUDE.md §3`.
- **Drizzle/SQLite:** combined predicates use `and(...)`; migrations live in `packages/db/migrations`.

## What NOT to flag

- The opt-in `packages/core/src/api-fallback/` directory importing the SDK (it is the one legal place, behind a config flag).
- `data/`, `docs/ressources/*.pdf`, and `docs/ressources/md/` being gitignored (intentional).
- Mock/deterministic values in seed and test fixtures.

Keep comments specific and actionable: file, line, problem, suggested fix.
