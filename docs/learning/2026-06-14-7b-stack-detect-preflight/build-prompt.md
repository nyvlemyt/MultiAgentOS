# 7b-stack-detect build prompts — Doer ① and Checker ②

## Doer ①

You are the Doer for **item 4 / 7b slice — stack auto-detection from `projects.path`** of
MultiAgentOS. Autonomous, TDD. You are ALREADY on branch `phase/7b-stack-detect` — stay on
it. Do NOT push.

Read BEFORE coding (repo root /Users/melvyn/Documents/02_PROJETS/multiAgentOS):
- `CLAUDE.md` (§5, §7 5-check verification, §11 billing, §12 knowledge)
- `docs/learning/2026-06-14-7b-stack-detect-preflight/plan.md` — YOUR SPEC, follow exactly
- `docs/knowledge/sonar-recurring-rules.md`

Inspect first (mirror style): `apps/web/lib/projects.ts` (`createProject`, the `stack`
fallback line), `apps/web/lib/templates.ts` (`ProjectType` enum, readonly + hoisted-literal
style), `apps/web/lib/projects.create.test.ts` (web vitest temp-DB pattern),
`packages/db/src/schema.ts` (`projects.type` enum, `stackJson`).

Build Step 1 then Step 2 from the plan, each RED-before-GREEN (Vitest), committing each
(Conventional Commits ≤60 chars, end EVERY message with
`Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`):

STEP 1 — `apps/web/lib/stack-detect.ts`:
- `export interface DetectedStack { readonly type: ProjectType; readonly stack: readonly string[]; }` (import `ProjectType` from `./templates`).
- `export function detectStack(rootPath: string): DetectedStack` — defensive (missing/unreadable path or no markers → `{ type: 'other', stack: [] }`, NEVER throws). Read `package.json` (try/catch JSON.parse), merge `dependencies`+`devDependencies` keys; map dep→tag via ONE hoisted ordered table (S1192): next→'Next.js', react→'React', vue→'Vue', svelte→'Svelte', @angular/core→'Angular', tailwindcss→'Tailwind', express→'Express', fastify→'Fastify', discord.js→'Discord.js', telegraf→'Telegraf', grammy→'grammY', node-telegram-bot-api→'Telegram'. Add 'TypeScript' if `typescript` dep OR `tsconfig.json` exists. Marker files: requirements.txt|pyproject.toml→'Python', Cargo.toml→'Rust', go.mod→'Go'. Output deduped, in the table's fixed canonical order (iterate the table — do NOT `.sort()` raw input). `type`: 'bot' if any bot lib (discord.js/telegraf/grammy/node-telegram-bot-api) present, else 'other'. Use `node:fs` (existsSync/readFileSync), `node:path` (join).
- RED first `apps/web/lib/stack-detect.test.ts` with `mkdtempSync` temp dirs: Next+TS+Tailwind → tags + type 'other'; Telegraf bot → 'Telegraf' + type 'bot'; pyproject-only → 'Python'; empty/nonexistent → `{type:'other',stack:[]}`; determinism (same input → identical array).

STEP 2 — wire `createProject` (`apps/web/lib/projects.ts`):
- Change the stack fallback to: `const stack = input.stack ?? (tpl ? [...tpl.stack] : [...detectStack(input.path).stack]);`. Leave `type` resolution UNCHANGED.
- RED first: extend `apps/web/lib/projects.create.test.ts` — create a project (no template, no `stack`) with `path` = a temp dir holding a Next `package.json`; assert the persisted `stackJson` contains the detected tags.

HARD RULES: no `@anthropic-ai/sdk`; no `data/memory/` writes; detector is READ-ONLY over the
path; apply sonar-recurring-rules (hoist the dep→tag table, `readonly`, `node:` prefixes, no
nested ternaries — prefer the table + early returns, no `.sort()` on input, no `use*` helper
names). Do NOT build the onboarding tour / empty-error states / i18n — those are deferred 4b/4c.

WHEN DONE run from repo root and paste exact tails: `pnpm -r test` · `pnpm lint` ·
`pnpm build` · `pnpm --filter @mas/web smoke`; fix until all green. Write
`docs/learning/2026-06-14-7b-stack-detect/build-report.md` (shipped, files, the 4 check tails,
4b/4c deferral) and commit it. Leave commits on the branch; do NOT push.
Return: files created/changed, commit count, pass/fail + numbers of each check.

## Checker ②

You are the Checker for **item 4 / 7b slice — stack auto-detection**. READ-ONLY — do NOT
modify source. Branch `phase/7b-stack-detect`. Diff is `git diff phase/8a-multimission HEAD`.

Verify against `docs/learning/2026-06-14-7b-stack-detect-preflight/plan.md` and `CLAUDE.md`
(§5/§7/§11/§12). For each plan point (Step 1, Step 2) confirm or fault with a severity.

RUN the 4 local checks yourself and paste tails + numbers: `pnpm -r test` · `pnpm lint` ·
`pnpm build` · `pnpm --filter @mas/web smoke`.

Grep invariants: no `@anthropic-ai/sdk`; the detector NEVER writes (read-only fs) and never
throws on a bad/missing path; no `data/memory/` writes. Verify: detection is deterministic
(fixed table order, no `.sort()` on input), `type` inference is conservative ('bot' only on a
bot lib, else 'other'), and `createProject`'s `type` resolution is unchanged (no surprise
override). Assess `docs/knowledge/sonar-recurring-rules.md` adherence (hoisted table, readonly,
node: prefixes, nested ternaries, duplicated literals). Judge whether the 4b/4c deferral is
acceptable.

WRITE the full verdict (markdown + a fenced ```json `ReviewerVerdict {verdict:
PASS|NEEDS_WORK|BLOCK, findings:[{severity,message}]}`) to
`docs/learning/2026-06-14-7b-stack-detect/checker-verdict.md` and commit ONLY that file
(`docs(7b): checker verdict`, end with the Co-Authored-By line). Do not push.
