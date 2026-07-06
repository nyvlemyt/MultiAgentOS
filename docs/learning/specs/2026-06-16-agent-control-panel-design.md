# Agent Control Panel — Design

Date: 2026-06-16
Branch: `phase/ui-multi-conversations`
Status: approved (brainstorming) → ready for plan

## Problem

The agent page is chat + a static side card. The user wants to *manage* the agent
from the cockpit: its skills, its parameters, and its underlying agent file. Today the
UI runs on mocked fixtures (`apps/web/lib/fixtures.ts`) and never reads or writes the
real fiches on disk.

Bonus bug (already fixed in this branch): switching conversation threads showed stale
messages because `ConversationPanel` seeds `useState` once at mount. Fixed with
`key={conv.id}` on both the home and agent pages to force a remount per conversation.

## Goal

Turn the side card into a tabbed **Agent Control Panel** with two write paths:

1. **Project instance** (`/projects/[slug]/agents/[agentId]`) — edits are **DB overrides**
   scoped to `(agentId, projectId)`. The fiche on disk is never touched. Same agent on
   another project keeps its defaults. This is the safe, cheap, common case.
2. **Base agent** (`/agents/[agentId]`) — edits write the **real fiche `.md`** on disk,
   with a DB-backed revision history for one-click rollback, behind a confirm (§5).

Non-goals (YAGNI this round): a Tools toggle tab (tools are visible in the fiche),
the rich composer (feature B, deferred), any live-LLM wiring.

## Architecture

### Data layer (`packages/db` + `apps/web/lib`)

**New table `agent_overrides`** (project-scoped editable layer):

```
agent_overrides {
  id            text pk
  agentId       text not null
  projectId     text not null          -- project instances only; base agent edits the file
  model         text nullable
  autonomy      text nullable          -- manual | assisted | autonomous | autopilot
  budgetCap     integer nullable
  effortMode    text nullable          -- eco | standard | expert
  enabledSkills text nullable          -- JSON string[] : per-agent skill allowlist
  updatedAt     integer not null
  unique(agentId, projectId)
}
```

**New table `fiche_revisions`** (base-agent rollback trail):

```
fiche_revisions {
  id         text pk
  agentId    text not null
  content    text not null             -- full PRIOR fiche content, snapshotted before a save
  summary    text not null             -- short human label, e.g. "frontmatter: autonomy assisté→autonome"
  savedAt    integer not null
}
```

Snapshots stay **full content** (files are a few KB; restore = trivial rewrite, no patch
chain to replay). `summary` is computed at save time so the history list reads at a glance
without diffing. Diff-only storage was rejected: negligible space win, fragile restore.

**Retention** (applied on every `writeFiche`, no daemon): keep the **last 10** revisions
per agent **and** drop any older than **30 days**, whichever prunes more. A dismissible
**"nettoyer l'historique ?"** card surfaces on the Fiche tab when an agent exceeds 10
revisions or holds stale ones — a derived check at render, one click to purge. No push
notification infrastructure this round.

**`apps/web/lib/agent-config.ts`**
- `getAgentConfig(db, agentId, projectId)` → merge `fixtureDefaults(agentId)` with the
  override row (override wins field-by-field). Pure, unit-testable.
- `saveAgentConfig(db, agentId, projectId, patch)` → upsert override row.
- `agentSkills(agentId, enabled)` → derive the skill list from the skills fixture +
  the `enabledSkills` allowlist.

**`apps/web/lib/agent-fiche.ts`** (server-only)
- `readFiche(agentId)` → read `.claude/agents/<id>.md` (Tier B) or
  `packages/agents/fiches/<id>.*` (Tier A). Read-only for the project page.
- `writeFiche(db, agentId, content, summary)` → snapshot current content into
  `fiche_revisions`, write the file, then `pruneFicheRevisions`. Base page only.
- `listFicheRevisions(db, agentId)` / `restoreFiche(db, agentId, revisionId)`.
- `pruneFicheRevisions(db, agentId, now)` → keep last 10, drop > 30 days. Pure-ish,
  unit-testable. `revisionsNeedCleanup(rows, now)` → boolean driving the reminder card.

### Server actions (`apps/web/app/(cockpit)/agent-config-actions.ts`)
- `updateAgentConfig(agentId, projectId, patch)` — DB upsert. No file, no gate.
- `toggleAgentSkill(agentId, projectId, skillId, on)` — DB upsert of `enabledSkills`.
- `saveFiche(agentId, content)` — base only; snapshots + writes file. Confirmed in UI.
- `restoreFicheRevision(agentId, revisionId)` — base only; rewrites file from snapshot.

### Component (`apps/web/components/agent/AgentControlPanel.tsx`)

Client, tabbed; replaces the static `<aside>` card. Data fetched server-side in the
page and passed as props (config, skills, fiche text, revisions, activity).

| Tab | Content | Editable |
|-----|---------|----------|
| Tab | Project instance page | Base agent page |
|-----|-----------------------|-----------------|
| **Profil** | ✅ editable → DB override | read-only (mirrors fiche frontmatter) |
| **Skills** | ✅ editable → DB override | read-only (mirrors fiche frontmatter) |
| **Fiche** | read-only `.md` view | ✅ editable `.md` + revision history |
| **Activité** | existing trace (kept) | existing trace (kept) |

The two pages are mirror images: the **project page** edits a DB override layer and never
touches disk; the **base page** edits the real `.md` (the single editable surface for the
agent's defaults, frontmatter included) and Profil/Skills there only reflect it read-only.
This keeps one write path per page and avoids parsing/writing YAML frontmatter from controls.

Sub-components: `ProfilTab`, `SkillsTab`, `FicheTab`, `ActivityTab`. Each owns one
purpose, takes props, calls one action. `AgentControlPanel` only does tab routing.

### Interaction rules
- Profil/Skills changes → optimistic UI → server action upsert. Instant, no file.
- **Autonomy raise** (to `autonomous`/`autopilot`) or **budget raise** → confirm dialog
  before the action fires. Lowers, and `manual`/`assisted`, save directly. (§5 habit.)
- **Fiche save** (base page) → confirm dialog → snapshot prior content → write file.
- **Restore** → confirm → rewrite file from the chosen revision.

## What is mock vs real
- Mock (as today): agent identity defaults (fixtures), skills catalogue.
- Real DB: overrides, fiche revisions.
- Real disk: fiche read (both pages); fiche write (base page only).

## Error handling
- `readFiche` miss → render "fiche introuvable sur disque" placeholder, panel still works.
- `saveFiche` write error → toast + keep editor content; no revision row committed on failure.
- Override upsert is idempotent on `(agentId, projectId)`; concurrent edits last-write-wins.

## Testing (Vitest)
- `agent-config.ts`: merge precedence (override > default), partial patch, missing row.
- `agent-fiche.ts`: write snapshots prior content into revisions; restore round-trips;
  `pruneFicheRevisions` keeps ≤10 and drops >30d; `revisionsNeedCleanup` boundary cases.
- Component smoke via `@mas/web smoke` for tab render + control presence.

## Verification (CLAUDE.md §7 — 5 checks)
`pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` · Sonar exit 0.

## Out of scope / next
- Rich composer (feature B) — separate spec.
- Tools toggle tab — add later if per-tool control is wanted.
- Live-LLM consumption of overrides — the SDK seam reads these in its phase.
