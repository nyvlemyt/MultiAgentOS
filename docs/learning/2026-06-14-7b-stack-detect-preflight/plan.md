# Pre-flight — 4 · 7b slice: stack auto-detection from projects.path

Date 2026-06-14 · Branch `phase/7b-stack-detect` (chained off `phase/8a-multimission`,
base `main`; retarget to main after the #13→#14→#15 chain merges).

## Scope decision (autonomous)
Pipeline item 4 (7b onboarding & UX polish) bundles: onboarding tour, remaining
empty/error/no-permission states, **stack auto-detection from `projects.path`**, deeper
i18n. The tour + states + i18n are frontend/visual (smoke-flake-prone, broad). This PR
ships only the **pure, fully unit-testable slice — stack auto-detection** — and leaves
the rest as **4b/4c** in the pipeline. Rationale: a pure detector is verifiable
unattended without UI flakiness; the visual pieces are better batched/attended.

## Intake-audit (§13)
No new external resource — internal detection logic over a registered project's own
files. Decision: **n/a (no candidate addition)**. ADRs unchanged.

## Existing code (read first, mirror)
- `apps/web/lib/projects.ts` — `createProject` (consumes `stack?: string[]`;
  `const stack = input.stack ?? (tpl ? [...tpl.stack] : [])`). The wire point.
- `apps/web/lib/templates.ts` — `ProjectType = Project['type']` enum
  (`'manga-app' | 'bot' | 'business-website' | 'automation' | 'other'`), readonly
  style + hoisted literals (S1192) to mirror.
- `packages/db/src/schema.ts` — `projects.stackJson` default `'[]'`, `type` enum.
- `apps/web/lib/projects.create.test.ts` — web vitest patterns (temp DB, seeding).

## Build steps (TDD — red before green, commit each)

### Step 1 — `apps/web/lib/stack-detect.ts` (pure detector)
- `export interface DetectedStack { readonly type: ProjectType; readonly stack: readonly string[]; }`
- `export function detectStack(rootPath: string): DetectedStack`:
  - Defensive: a missing/unreadable path, or no recognizable markers → `{ type: 'other', stack: [] }` (never throws).
  - Read `package.json` (try/catch JSON.parse); merge `dependencies` + `devDependencies` keys.
  - Map dep → stack tag via ONE hoisted ordered table (S1192), e.g.:
    `next→'Next.js'`, `react→'React'`, `vue→'Vue'`, `svelte→'Svelte'`, `@angular/core→'Angular'`,
    `tailwindcss→'Tailwind'`, `express→'Express'`, `fastify→'Fastify'`,
    `discord.js→'Discord.js'`, `telegraf→'Telegraf'`, `grammy→'grammY'`, `prisma|drizzle-orm→'Drizzle/Prisma'` (pick distinct tags).
  - TypeScript tag if `typescript` dep present OR `tsconfig.json` exists in rootPath.
  - Other ecosystems by marker file: `requirements.txt`|`pyproject.toml`→'Python', `Cargo.toml`→'Rust', `go.mod`→'Go'.
  - Stack output: dedup, in the table's fixed canonical order (deterministic — no `.sort()` on raw input; iterate the table).
  - `type`: conservative — `'bot'` if any bot lib (discord.js/telegraf/grammy/node-telegram-bot-api) is present; otherwise `'other'`. (Never claim `manga-app`/`business-website`/`automation` — undetectable from files.)
- RED first `apps/web/lib/stack-detect.test.ts` (temp dirs via `mkdtempSync`): Next+TS+Tailwind app → tags + type 'other'; a Telegraf bot → 'Telegraf' + type 'bot'; a `pyproject.toml`-only dir → 'Python'; an empty/nonexistent dir → `{ type:'other', stack:[] }`; determinism (same input → same order).

### Step 2 — wire into `createProject` (`apps/web/lib/projects.ts`)
- When no explicit `input.stack` AND no template, fall back to the detector:
  `const stack = input.stack ?? (tpl ? [...tpl.stack] : detectStack(input.path).stack);`
  (Cast the readonly array to `string[]` via spread for `JSON.stringify`.) Leave `type`
  resolution unchanged (don't override an explicit user/template choice — conservative).
- RED first: extend `projects.create.test.ts` — creating a project (no template, no stack)
  pointed at a temp dir with a Next package.json persists the detected `stackJson`.

## Risks
- **fs over an arbitrary path** — read-only, try/catch wrapped; never writes; a path
  outside any project is fine (we only READ the registered project's own path).
- **Sonar** — `docs/knowledge/sonar-recurring-rules.md`: hoist the dep→tag table (S1192),
  `readonly` fields, `node:` prefixes, no nested ternaries (use the table + early returns),
  no `.sort()` on input (iterate the ordered table), no `use*` helpers.

## Definition of Done (5 checks — §7)
1. `pnpm -r test` green (new stack-detect suite + createProject test + all existing).
2. `pnpm lint` green. 3. `pnpm build` green. 4. `pnpm --filter @mas/web smoke` green.
5. `scripts/sonar-pr-issues.sh <pr>` exits 0 AND gate OK on HEAD.
Plus Checker PASS; 4b/4c (tour, empty/error states, i18n) deferral recorded.
