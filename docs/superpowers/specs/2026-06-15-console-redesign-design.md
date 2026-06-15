# Design — Console redesign (IA + flagship home)

Date: 2026-06-15 · Branch: `phase/ui-console-redesign` · Status: approved direction (split console + condensed nav)

## Problem

The cockpit is a flat dump of ~12 metric cards (triple-counted budget, vanity metrics like
cache-hit-ratio, missions shown 3×), no primary action, no way to talk to the Manager, projects
buried. User verdict: "3/10", not task-oriented, cluttered, hard to understand. Earlier passes only
recolored — the **information architecture** is the real problem.

## Aesthetic direction (committed)

**Mission control / observatory.** Deep near-black canvas, generous negative space, technical
precision. Cyan (#38e8ff) used as a *signal* (live/active/primary), not decoration. One signature
element: the **Manager presence** (a calm, always-there orchestrator you talk to) flanked by a live
view of your work. Distinctive type pairing (NOT Inter): **Space Grotesk**-class is overused —
use **IBM Plex Sans** (characterful, ops/technical) for UI + **IBM Plex Mono** for data/labels.

## New information architecture

**Jobs-to-be-done on the home:** (1) talk to the Manager, (2) see my projects at a glance,
(3) see what needs me now. Everything else is secondary/system.

**Condensed nav** (was 11 flat items):
- **Console** (home) · **Projets** · **Agents** · **Mémoire**
- collapsible **Système** group: Jetons · Trace
- Missions / Priorités / Idées are **no longer global pages** — they become **tabs inside a
  project workspace** (where they have meaning). (Routes kept alive this phase to avoid breakage;
  de-emphasized in nav. Full move = next phase.)

## Flagship home — split console

Two-column workspace under the shell:

- **Left (primary, ~62%): Manager conversation.** Header = Manager presence (avatar + name +
  scoped project). A scrollable conversation area. A prominent composer at the bottom
  ("Décris une mission, une idée, ou pose une question…") with quick-chips (+ projet · idée ·
  état). **Scripted/mock** this phase: submitting a message appends the user bubble + a canned
  Manager reply that *names what it would do* (e.g. "Je routerais ça vers le projet OtakuGO →
  Mission Planner décompose → 3 tâches"). Zero LLM tokens. The seam is a single `respond()` fn so
  the real LLM drops in later.
- **Right rail (~38%): your work.**
  - **Projets** — rich cards: name, path, status dot, # agents active, # missions, next deadline,
    a tiny live-agent avatar cluster. Click → project workspace. "+ nouveau projet" affordance.
  - **À traiter** — ONE consolidated list merging pending validations + blocked + imminent
    deadlines (replaces 3 separate cards). Empty → calm "rien ne t'attend".

**Cut from the home:** Token budget card, Today's spend card (budget already in topbar), Cache hit
ratio, Rapport quotidien, Recent decisions, standalone Live trace (moves to Trace page / project).
Net: from ~12 cards to 2 focused columns.

## Components

- `components/Sidebar.tsx` — rewrite: condensed groups + collapsible Système.
- `components/manager/ManagerConsole.tsx` (client) — conversation + composer + scripted `respond()`.
- `lib/manager-script.ts` (pure) — deterministic canned routing replies; TDD.
- `components/home/ProjectRail.tsx` + `NeedsAttention.tsx` — right rail.
- `app/(cockpit)/page.tsx` — recompose as the split console; drop the card grid.
- Type tweaks: load fonts (IBM Plex) in `app/layout.tsx`, `@theme` in `globals.css`.

## Data
Reuse existing fixtures + DB queries (projects, missions, validations, deadlines). No backend
change. Manager replies are scripted (pure fn). No new data sources.

## Testing
- TDD `lib/manager-script.ts` (deterministic reply for a given intent).
- Existing smoke/tests stay green; update home-specific assertions (the home markup changes).
  Keep `/missions /priorities /ideas` routes working (smoke hits them).
- Verification = CLAUDE.md §7 five checks + Sonar exit 0 + gate OK. Draft PR until Sonar green.

## Scope / phasing
This phase = **condensed nav + flagship split-console home** only. Next phases: project workspace
(tabs: plan/missions/agents/ideas), agent detail, real Manager LLM, cross-project memory. Other
pages inherit the new nav + tokens but keep current layouts until their turn.

## Risks
- Big home rewrite → verify smoke selectors (top-priorities/deadline/daily-report testids may be
  asserted; relocate or update those tests rather than fake them).
- New fonts → ensure load + fallback; don't regress CLS.
