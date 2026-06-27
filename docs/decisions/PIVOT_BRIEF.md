# Pivot Brief — From Voie 1 (API SDK) to Voie 3 (Claude Code engine), inspired by Voie 2

- **Status:** Superseded — **pivot executed**. The Voie 3 pivot was carried out: `packages/core/src/llm.real.ts` drives the Claude Agent SDK (no `@anthropic-ai/sdk` at runtime), `CLAUDE.md §11` was restructured to "one subscription mode + a forbidden PAYG mode", `§9.bis Inspiration Voie 2` was added, and the CI guard `scripts/lint-no-sdk-payg.sh` enforces the import ban. The authoritative record is now **ADR 0001** (`0001-claude-code-engine-over-api-sdk.md`). This brief is kept as the historical relay handoff.
- **Date:** 2026-06-01 (superseded note added 2026-06-27)
- **Deciders:** Melvyn + Claude

> Read this **before any further work on `phase/2-real-claude`** and before opening any new phase. Reading order is: this brief → `docs/decisions/0001-claude-code-engine-over-api-sdk.md` → the file paths cited in the checklist.

## Why this brief exists

The roadmap that was in flight is wrong on one specific axis: **the LLM transport.** Every existing rule in `CLAUDE.md §11` ("Billing isolation") is correct in spirit but **not enforced in code**. The branch `phase/2-real-claude` wired `@anthropic-ai/sdk` and an API key into the worker. That is the **Voie 1** path: every mission burns PAYG cents against the Anthropic Console credit pool — instead of consuming the user's Claude Code subscription that he already pays for.

This brief is the relay handoff: it gives the active Claude Code session enough context to pivot without losing the thread, and it loudly flags **Inspiration Voie 2** as a permanent design principle.

## The three voies (one slide)

| Voie | Wrapper calls | Auth | Billing |
|------|---------------|------|---------|
| 1 | `@anthropic-ai/sdk` directly | API key | PAYG — **facture salée** |
| 2 | Open-source webui that pilots Claude Code (`siteboon/claudecodeui` ~4 k★, `sugyan/claude-code-webui`, `winfunc/opcode`) | `claude login` | Subscription (covered by Pro/Max) |
| 3 | **Your own UI** doing what Voie 2 does | `claude login` | Subscription (covered by Pro/Max) |

MultiAgentOS is **Voie 3**. The implementation must be **Voie 3** too. The wiring blueprint is **Voie 2**.

## ⭐ Point 6 — Inspiration Voie 2 (permanent design principle)

**Whenever the Claude Agent SDK docs are vague — session resume, file-context injection, tool gating, streaming back-pressure, image attachments, stop reasons, error recovery, rate-limit signalling — the first reflex is *"how do the open-source webuis do it?"***

Concretely:

- **Reference repos to keep open in a tab while implementing the bridge:**
  - [siteboon/claudecodeui](https://github.com/siteboon/claudecodeui) — primary reference, the closest to MultiAgentOS's product shape (project picker, session list, file tree, terminal, mobile).
  - [sugyan/claude-code-webui](https://github.com/sugyan/claude-code-webui) — minimalist; great for reading the streaming-chat layer alone.
  - [winfunc/opcode](https://github.com/winfunc/opcode) — Tauri desktop; useful for the *later* Tauri packaging phase.
  - [KyleAMathews/claude-code-ui](https://github.com/KyleAMathews/claude-code-ui) — session tracker; useful for the `/trace` page.
- **Workflow:** before writing a new piece of bridge code, `git clone` the relevant reference, grep for the equivalent feature, and **port the pattern, not the code**. Cite the source file you cribbed from in a leading code comment (`// pattern from siteboon/claudecodeui src/lib/claude.ts:142`).
- **Reason this matters:** Anthropic's Agent SDK is young; the open-source webuis already absorbed the rough edges (Windows quoting, session-id format, partial JSON streams). Reinventing those costs subscription quota and time.

Add this to `CLAUDE.md` as a **§9.bis "Inspiration Voie 2"** doctrine block so it survives the conversation.

---

## What changes — checklist for the active Claude Code session

### A. Stop the bleed (immediate, before any new feature)

- [ ] `git checkout phase/2-real-claude` and **do not push** anything that imports `@anthropic-ai/sdk` from the runtime.
- [ ] Verify `echo $ANTHROPIC_API_KEY` is empty in a fresh terminal. If it is set anywhere in `~/.zshrc`, `~/.bashrc`, `~/.zshenv`, `~/.profile`, remove it. The variable must never leak into a `claude` subprocess — see §11 of `CLAUDE.md`.
- [ ] Confirm `claude login` is the active auth method (`claude /status` should say "Subscription" or similar).

### B. Decide the branch strategy

Two options, pick one explicitly with the user:

- **Option B1 — Rebase in place.** Rebase `phase/2-real-claude` and rewrite or drop the commits that introduced the API-SDK path: `2660dd6`, `e3fa424`, `08c5468`, and any other commit that touches `packages/core/src/llm.real.ts` to call `new Anthropic({apiKey})`.
- **Option B2 — Restart clean.** Abandon `phase/2-real-claude`, cut a new branch `phase/2-claude-code-bridge` from `main`, port over the still-relevant pieces (LLM registry singleton from `5d1e2e9`, budget check from `2c22261`, context-manager from `481a7b4`).

Default recommendation: **B2** — cleaner history, no merge-pain, the new architecture deserves its own branch name.

### C. Rewrite `packages/core/src/llm.real.ts`

- [ ] Remove `import Anthropic from '@anthropic-ai/sdk'`.
- [ ] Remove the `apiKey` parameter from `realLLM(...)`. The signature becomes `claudeCodeLLM(options?: { sessionId?: string; cwd?: string }): LLMClient`.
- [ ] Pick a transport — recommend the Agent SDK first:
  - `pnpm add @anthropic-ai/claude-agent-sdk -F @mas/core`
  - Wrap `query({ prompt, options })` and adapt its stream into the existing `LLMResponse` shape.
- [ ] Fallback transport (for shell-heavy missions): `spawn('claude', ['--print', '--output-format=stream-json', ...])`. Implement only when the SDK falls short.
- [ ] If `process.env.ANTHROPIC_API_KEY` is set at init time → `console.warn` + refuse to start. The presence of the key is now a smell, not a feature.
- [ ] Keep the `LLMClient` interface from `llm.ts` unchanged — the rest of the worker should not need to learn about the transport switch.

### D. Cost meter → quota meter

- [ ] Rename `costCents` to `subscriptionTokens` (or `quotaUnits`) in `LLMResponse`. Keep the field; the migration is a rename, not a delete — too many UI components consume it.
- [ ] Mark the `PRICE_PER_M` table as **estimation-only** in a leading comment. It is no longer a real bill; it is a heuristic for "how aggressively did this mission lean on the abonnement".
- [ ] `/tokens` page copy: rewrite "€ spent today / week / month" → "messages used in current 5-hour window / week". The Agent SDK and rate-limit headers expose enough to compute this; mirror what `claudecodeui` does (see Point 6).

### E. Doctrine patches (apply, do not redesign)

- [ ] **`CLAUDE.md §2 Stack`** — strike `@anthropic-ai/sdk`. Replace with `@anthropic-ai/claude-agent-sdk` (primary) and `claude` CLI headless (fallback).
- [ ] **`CLAUDE.md §11 Billing isolation`** — restructure around the new reality:
  - Replace the "two billing modes" table with "**one** billing mode (subscription), and a *forbidden* mode (PAYG via API key)".
  - Add: "Any commit that introduces `import … from '@anthropic-ai/sdk'` in `apps/` or `packages/*/src/` is blocked at CI. The only legal location is an opt-in `packages/core/src/api-fallback/`, behind a config flag."
- [ ] **`CLAUDE.md`** — add new section **§9.bis "Inspiration Voie 2"** (see Point 6 above). One paragraph + the four reference repos.
- [ ] **`TOKEN_STRATEGY.md §1`** — strike "Anthropic credit pool ≈ 20 €". Replace with "Claude subscription = fixed monthly cost. The budget envelope is the 5-hour rolling message window + the weekly cap. Tokens are *quota signals*, not cash."
- [ ] **`TOKEN_STRATEGY.md §3 Budget hierarchy`** — change "Project monthly budget" from euros to "share of weekly subscription window".
- [ ] **`TOKEN_STRATEGY.md §8`** — replace euro caps with message-window caps. Daily cap → "leave at least 30 % of the 5-hour window free at all times".
- [ ] **`TOKEN_STRATEGY.md §11`** — drop the "Daily money cap" column; add a "Window margin" column.
- [ ] **`ROADMAP.md` Phase 2** — rewrite the whole section. New title: *"Phase 2 · Claude Code bridge (Agent SDK)"*. New exit criteria as in `ADR 0001` § Consequences.

### F. CI guard

- [ ] Add an `eslint-no-restricted-imports` (or a tiny grep in `pnpm lint`) that fails on `from '@anthropic-ai/sdk'` outside an explicit `packages/core/src/api-fallback/` directory.
- [ ] Add a smoke step to the existing test runner: spawn the worker with `ANTHROPIC_API_KEY=fake-this-should-fail` and assert it refuses to boot.

### G. Verification before claiming Phase 2 done

- [ ] Run the seed mission end-to-end. Open the Anthropic Console usage page **during the run**. The graph for the run window must show **zero** API spend. If anything appears, the bridge is leaking — stop and trace.
- [ ] Open the `claude` subscription dashboard. The run should have *consumed* messages there.
- [ ] Add the screenshot (or a saved network HAR) to `docs/decisions/` as the proof artefact.

---

## My (the analyst's) extra ideas — for the user to validate

1. **Skill loading via Claude Code's native loader.** The engine already reads `.claude/skills/`. Right now MultiAgentOS plans to build its own skill summariser (Phase 3). Cheaper plan: let Claude Code load skills natively in its session, and use MultiAgentOS-side prompt assembly only for the *routing decision* (which skills to mention), not for the *body loading*. Saves a full agent role and a chunk of quota.
2. **Use `claude --print --resume <sessionId>` for cross-mission continuity.** The subscription's prompt-cache is killer when sessions are resumed. One Claude Code session per *project* (long-lived), one *prompt* per task. Cache hit ratio drops out for free.
3. **Headless mode for risk-high tasks.** `claude --print --permission-mode=plan` (or whatever the current flag is) keeps the engine in propose-only mode — perfectly aligns with the `manual` autonomy level in `CLAUDE.md §4`. The risk-gate doesn't need to be reimplemented; it can be expressed as a `--permission-mode` flip.
4. **Mirror Voie 2's mobile UX.** `claudecodeui` already supports mobile remote-control. If the long-term vision is a Tauri desktop *and* a phone-friendly view, adopting their websocket protocol now is cheaper than retrofitting later.
5. **Treat the Agent SDK version as a pinned dependency.** It is moving fast. Pin to a `^minor` range and add a quarterly upgrade ADR. Avoid `^major` ranges — the surface changes break sessions.
6. **Telemetry: log `stop_reason` and `subscription_tier`.** The SDK surfaces them; logging them lets the cockpit show "you hit the 5-hour cap" instead of just "request failed". The kind of UX signal `claudecodeui` already shows.
7. **Optional but cheap: add a `mode: 'api-fallback'`.** A fourth mode in `TOKEN_STRATEGY.md §2`, *off by default*, which routes one specific call to the API SDK when the subscription window is exhausted **and** the user has explicitly opted in for that mission. Keeps the door open without ever defaulting to it.

---

## Relay prompt — copy-paste into the active Claude Code session

> ⚠️ **Architecture pivot — read in full before touching code.**
>
> We were on track to do Phase 2 by wiring `@anthropic-ai/sdk` into the worker. That is wrong. It puts MultiAgentOS on the **Voie 1** (PAYG, facture salée) path. We are pivoting to **Voie 3**: drive Claude Code (subscription) through the Claude Agent SDK or headless `claude` CLI. The architectural reference is **Voie 2**: the open-source webuis that already do this in production (`siteboon/claudecodeui` ≈ 4 k stars, `sugyan/claude-code-webui`, `winfunc/opcode`).
>
> Authoritative docs for this pivot, in order:
> 1. `docs/decisions/0001-claude-code-engine-over-api-sdk.md` — the ADR.
> 2. `docs/decisions/PIVOT_BRIEF.md` — this brief and its checklist (sections A → G).
>
> **Your job, in this session:**
> 1. Read both files top to bottom. Do not skim.
> 2. Confirm the branch strategy with the user (B1 rebase vs. B2 new branch — recommend B2).
> 3. Apply the doctrine patches in section E of the brief (CLAUDE.md §2, §9.bis, §11; TOKEN_STRATEGY.md §1, §3, §8, §11; ROADMAP.md Phase 2). One commit per file, conventional commits, ≤ 60-char subjects.
> 4. Rewrite `packages/core/src/llm.real.ts` per section C. Keep the `LLMClient` interface stable.
> 5. Add the CI guard from section F.
> 6. Run the verification ritual from section G **before** declaring Phase 2 done — confirm zero Anthropic Console spend on the seed-mission run.
>
> **Permanent principle — Inspiration Voie 2.** Whenever the Agent SDK is vague, read the reference webuis (`siteboon/claudecodeui` first). Port the pattern, cite the source file in a code comment, never just copy code. This is now §9.bis of `CLAUDE.md` — treat it as policy.
>
> **Do not start any new feature, and do not merge `phase/2-real-claude` as-is.** The work-in-flight on that branch is built on the wrong premise; either rebase it (B1) or scrap it (B2).
>
> When you are done with the doctrine patches and the `llm.real.ts` rewrite, stop and ask for explicit user green light before touching the rest of Phase 2's exit criteria. The new exit criteria live in `ADR 0001 § Consequences`.
