# Rich Composer — Design

Date: 2026-06-16
Branch: `phase/ui-multi-conversations` (feature B; sibling of the Agent Control Panel spec)
Status: approved (brainstorming) → ready for plan

## Problem

The conversation composer is a single text input + send button
(`apps/web/components/manager/ConversationPanel.tsx`). On Claude / Codex the message box
does much more: reference files, run slash commands, attach images, pick the model/effort,
preview cost. Because MultiAgentOS drives the Claude Agent SDK, those affordances can be
**gated per model** (e.g. only offer image attach when the routed model accepts images).

## Goal

Upgrade the composer into a cockpit-grade input whose affordances are **capability-gated**,
without any live-LLM wiring (Phase 0 is mocked). This round = the UI surface + the data
seams a real SDK turn will later read.

Included this round:
- **`/` slash commands** — `/skill <id>`, `/mode <level>`, `/plan`, `/clear` from a mock
  command registry; type `/` → menu, Enter to apply.
- **`@` file references** — `@` opens a picker over the project's real file tree
  (`projects.path`, read-only); selected files become context chips.
- **Inline model + effort picker** — surfaces the routed model and eco/standard/expert,
  editable per turn (mirrors the topbar control).
- **Token estimate** — heuristic estimate of the turn cost shown before send.
- **Context chips** — show what is attached (files, skill, mode) above the input; removable.

Capability-gated, affordance visible but **upload plumbing deferred** (nothing consumes it
without an LLM):
- **Image / attachment** — the button renders only when `modelCapabilities[model].images`
  is true; clicking shows a "branché à l'exécution" stub. No file storage this round.

Non-goals: live SDK turn, real file upload/storage, streaming, the Agent Control Panel
(feature A — separate spec).

## Architecture

### Capability map (`apps/web/lib/model-capabilities.ts`)
```
modelCapabilities: Record<modelId, { images: boolean; slashCommands: boolean; maxContextFiles: number }>
```
Mock table keyed by the model ids already in fixtures (`claude-sonnet-4-6`,
`claude-haiku-4-5`, …). Pure data; the single source the composer reads to show/hide
affordances. This is the "features adapt to the LLM" seam the user asked for.

### Slash command registry (`apps/web/lib/composer-commands.ts`)
```
type SlashCommand = { id: string; trigger: string; label: string; hint: string };
parseSlash(draft): { command?: SlashCommand; arg?: string }
applyCommand(cmd, arg): ComposerIntent   // pure → { kind: 'skill'|'mode'|'plan'|'clear', ... }
```
Pure functions, fully unit-testable. No execution — they produce an *intent* object the
panel renders as a chip / acts on locally (e.g. `/clear` empties the thread view).

### File reference picker (`apps/web/lib/project-tree.ts`, server-only)
```
listProjectTree(projectPath, query?): FileRef[]   // read-only walk of projects.path, gitignore-aware, capped
```
Server action `searchProjectFiles(projectId, query)` returns matches for the `@` menu.
Read-only; never writes. Respects §5 (no path outside the active project's `path`).

### Token estimate (`apps/web/lib/token-estimate.ts`)
```
estimateTurnTokens(draft, contextChips): number   // heuristic: chars/4 + per-chip file size budget
```
Pure, testable. Mock heuristic now; the real meter (`packages/tokens`) replaces it later.

### Composer component (`apps/web/components/manager/Composer.tsx`)
Extracted from `ConversationPanel` so the panel stays focused on the message list. The
composer owns: the input, the `/` and `@` menus, the chip row, the inline model/effort
picker, the token estimate, and the gated attach button. It emits a single
`onSubmit({ text, chips, model, effort, intents })` to the panel, which keeps its current
`send()` seam (scripted reply now, SDK later). Sub-pieces: `SlashMenu`, `FileRefMenu`,
`ContextChips`, `ModelEffortPicker`. Each one purpose, props-in, callback-out.

### Integration
`ConversationPanel.send()` is unchanged in spirit — it now receives the richer payload and
still calls the existing `sendManagerMessage` / `sendAgentMessage` server actions. Extra
fields (chips, model, effort, intents) are persisted alongside the message later; this
round they ride in memory + are echoed into the scripted reply context.

## Interaction rules
- `/` at input start → SlashMenu; arrow keys + Enter apply; Esc closes.
- `@` anywhere → FileRefMenu filtered by the typed query; Enter adds a context chip.
- Attach button hidden unless `modelCapabilities[model].images`; click → deferred stub.
- Token estimate recomputes on draft/chips/model change; shown muted near the send button.
- `/mode <level>` raising autonomy → same confirm habit as feature A (autonomous/autopilot).

## What is mock vs real
- Mock: capability map, slash registry behaviour, token heuristic, scripted reply.
- Real: `@` file picker reads the project's real tree from disk (read-only).

## Error handling
- `listProjectTree` on a missing/inaccessible path → empty menu + "dossier illisible" note.
- Unknown slash command → inline "commande inconnue", no intent emitted.
- Estimate failure → hide the number rather than block send.

## Testing (Vitest)
- `composer-commands.ts`: `parseSlash` + `applyCommand` for each command, unknown, no-arg.
- `model-capabilities.ts`: gating booleans per model.
- `token-estimate.ts`: monotonic with length + chips, zero on empty.
- `project-tree.ts`: gitignore-aware, capped, refuses paths outside `projectPath` (§5).
- Component smoke (`@mas/web smoke`): `/` and `@` menus open, chip add/remove, attach
  hidden for a no-image model.

## Verification (CLAUDE.md §7 — 5 checks)
`pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` · Sonar exit 0
(`scripts/sonar-pr-issues.sh <pr>` == 0 **and** gate status OK).

## Out of scope / next
- Real attachment upload + storage + SDK image blocks.
- Persisting composer payload (chips/model/effort) on the message row.
- Live SDK turn consuming intents/capabilities.
