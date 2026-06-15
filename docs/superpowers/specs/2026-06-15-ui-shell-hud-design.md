# Design — UI Shell HUD (sub-project 1 of the cockpit redesign)

Date: 2026-06-15 · Branch: `phase/ui-shell-hud` · Status: approved (user: "fais et on verra bien")

## Context

The cockpit currently looks flat, gray-on-gray, no hierarchy, agents shown as bare
initials in squares, weak accent usage, several dead/non-clickable nav targets. The user
wants a Jarvis/Iron-Man HUD feel: deep OLED background, electric-cyan accent + gold
highlights, generative neon agent avatars with status rings, a clean sidebar + topbar.

This is **sub-project 1** of a larger redesign decomposed during brainstorming. The full
backlog (later sub-projects, in order): 2) conversational home (Manager intake bar, hero
chat + projects below), 3) project view (agents + activity, agent detail, project-manager
chat, multi-mission, plan tracking, ideas→plan), 4) real Manager LLM (scripted/mock first),
5) efficient cross-project memory retrieval.

Locked decisions from brainstorming:
- Sequencing: **visual language + shell first** (everything else inherits it).
- Manager: **scripted/mock first** (zero LLM tokens), real LLM later in its own sub-project.
- Home layout (later): **chat hero + projects below**.
- Avatars: **generative neon glyphs**.
- Aesthetic: **Cyan HUD + gold on OLED**.

Design intelligence source: `ui-ux-pro-max` → Style "Dark Mode (OLED)", Pattern
"Real-Time/Operations", data-dense but scannable, minimal glow, status colors green/amber/red,
mono+sans typography (already satisfied by Inter Tight + JetBrains Mono).

## Scope

**In scope** (this sub-project):
- Design tokens in `apps/web/app/globals.css` (color, glow utility, spacing rhythm, radius).
- `components/AgentAvatar.tsx` — replace initials with generative neon glyph + status ring.
- New pure helper `lib/agent-visual.ts` — `agentVisual(name, role)` → `{ hue, glyph }`.
- `components/Sidebar.tsx` — grouped nav, active indicator, cursor-pointer, phase banner restyle.
- `components/Topbar.tsx` — de-cramp layout, project switcher, pills, budget meter, theme toggle.
- Shared primitives tint: `Card`/`.surface`, `RiskBadge`, `Sparkline`, `BudgetBar`,
  `ModePill`, `LanguagePill` — adopt new tokens.
- Audit + fix dead links / missing `cursor-pointer` in the shell.

**Out of scope** (later sub-projects): home chat hero, project view, agent detail page
redesign, Manager backend, memory retrieval. The 14 pages inherit the new tokens
automatically (so they stop looking broken) but their per-page layouts are redesigned later.

## Components & decisions

### 1. Tokens
Deepen the dark palette to OLED, swap accent indigo → electric cyan, add gold highlight and
a glow utility. Keep light mode working (ThemeToggle + tests exist) but optimize dark as the
hero experience.

```
--bg-base    #07090e   --bg-surface #0d1018   --bg-elevated #131722   --bg-hover #1a2030
--border-subtle #181d29  --border-default #232a3a
--accent #38e8ff   --accent-dim #0e7d92   --accent-soft #0c2a33
--gold #f5c451
--success #3ddc84  --warning #f9a23a  --danger #ff4d6a
--glow-accent: 0 0 12px rgba(56,232,255,.45)
```
Glow is applied to active rings / selected states only, **never** to body text (perf +
legibility). Numbers use `tabular-nums`. Light-mode variants adapt cyan/gold for ≥4.5:1.

### 2. Generative agent avatars
- `agentVisual(name, role)` is a **pure function**: deterministic hash of `name` → hue on a
  cyan→gold ramp; `role` → a Lucide glyph key (planner=map, router=compass, memory=brain,
  security=shield, reviewer=search, frontend/ux=sparkles/pen, backend=wrench, default=cpu).
  Pure → unit-testable (TDD: same input → same output, distinct names → distinct hues).
- `AgentAvatar` renders: dark radial disc tinted by hue + role glyph + **status ring**:
  idle=gray, running=cyan **pulsing**, waiting=amber, blocked=red, done=green. Pulse animation
  gated by `prefers-reduced-motion`. Sizes tokenized: sm 28 / md 36 / lg 56. Keeps
  `aria-label`. Optional `src` image still supported as an override.

### 3. Sidebar
- Items keep icon **and** label; active item = left cyan glow bar + elevated background;
  `cursor-pointer` on all. Groups: **Pilotage** (Centre, Projets, Missions, Priorités, Idées)
  · **Agents** (Agents, Studio, Compétences) · **Système** (Jetons, Trace, Mémoire). Phase
  banner restyled as a discreet system-status chip.

### 4. Topbar
- Left breadcrumb; right cluster: project switcher, autonomy pill + mode pill, fr/en language,
  mini budget meter (glow when near cap), theme toggle. 8px spacing rhythm, no overlap.

### 5. Motion & accessibility
- Transitions 150–300ms, ease-out on enter. `prefers-reduced-motion` respected (no pulse).
- Focus rings cyan 2px visible. Text contrast ≥4.5:1 verified in dark **and** light.
- No emoji as structural icons (Lucide SVG only). `cursor-pointer` on clickables.

## Data flow
Pure presentational layer; no new data sources. `agentVisual` is deterministic and stateless.
Existing fixtures/DB queries unchanged.

## Testing
- TDD on `lib/agent-visual.ts` (Vitest): determinism, hue spread, role→glyph mapping, fallback.
- Existing component/smoke tests must stay green; update any snapshot/string assertions the
  restyle breaks (e.g. ThemeToggle, nav labels).
- Verification = CLAUDE.md §7 five checks: `pnpm -r test` · `pnpm lint` · `pnpm build` ·
  `pnpm --filter @mas/web smoke` · `scripts/sonar-pr-issues.sh <pr>` exits 0 + gate OK.

## Risks
- Token color changes ripple to every page → visually verify each route doesn't regress.
- Smoke/Playwright selectors keyed on old text/classes may break → fix as part of the work.
- Pulse animation perf → transform/opacity only, reduced-motion gate.

## Out-of-scope deferrals (tracked for next sub-projects)
Home chat hero · project view · agent detail · Manager LLM · cross-project memory retrieval.
