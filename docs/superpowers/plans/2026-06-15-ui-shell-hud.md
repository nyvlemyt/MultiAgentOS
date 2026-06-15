# UI Shell HUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the cockpit shell (tokens, agent avatars, sidebar, topbar, shared primitives) into a Jarvis/HUD look — electric-cyan + gold on OLED black — without changing any data or per-page layout.

**Architecture:** Pure presentational change. New CSS custom properties + utilities in `globals.css`; a new pure helper `lib/agent-visual.ts` (deterministic name→hue + role→glyph) consumed by a rebuilt `AgentAvatar`; restyled `Sidebar`/`Topbar`. All 14 pages inherit the tokens automatically. Light mode kept working; dark is the hero.

**Tech Stack:** Next.js 15 App Router, Tailwind v4 (`@theme` + CSS vars), lucide-react, Vitest, Playwright smoke.

**Spec:** `docs/superpowers/specs/2026-06-15-ui-shell-hud-design.md`

---

### Task 1: HUD design tokens

**Files:**
- Modify: `apps/web/app/globals.css:8-113`

- [ ] **Step 1: Replace the dark token block** (`:root, [data-theme='dark']`, lines 8-29) with the OLED + cyan palette:

```css
:root,
[data-theme='dark'] {
  --bg-base: #07090e;
  --bg-surface: #0d1018;
  --bg-elevated: #131722;
  --bg-hover: #1a2030;
  --border-subtle: #181d29;
  --border-default: #232a3a;
  --text-primary: #e8ecf4;
  --text-secondary: #a5adbf;
  --text-muted: #6b7388;
  --accent: #38e8ff;
  --accent-dim: #0e7d92;
  --accent-soft: #0c2a33;
  --gold: #f5c451;
  --success: #3ddc84;
  --warning: #f9a23a;
  --danger: #ff4d6a;
  --status-idle: #6b7388;
  --status-running: #38e8ff;
  --status-blocked: #ff4d6a;
  --status-waiting: #f9a23a;
  --status-done: #3ddc84;
  --glow-accent: 0 0 12px rgba(56, 232, 255, 0.45);
}
```

- [ ] **Step 2: Update the light token block** (`[data-theme='light']`, lines 31-51) to add the new vars and adapt the accent toward a darker cyan for contrast:

```css
[data-theme='light'] {
  --bg-base: #fafbfd;
  --bg-surface: #ffffff;
  --bg-elevated: #ffffff;
  --bg-hover: #f1f3f8;
  --border-subtle: #e5e8f0;
  --border-default: #d3d8e4;
  --text-primary: #0e1320;
  --text-secondary: #4a5168;
  --text-muted: #7a8094;
  --accent: #0e7d92;
  --accent-dim: #0a5e6e;
  --accent-soft: #d6f3f9;
  --gold: #b8860b;
  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;
  --status-idle: #94a3b8;
  --status-running: #0e7d92;
  --status-blocked: #dc2626;
  --status-waiting: #d97706;
  --status-done: #16a34a;
  --glow-accent: 0 0 10px rgba(14, 125, 146, 0.25);
}
```

- [ ] **Step 3: Append a glow utility and an avatar pulse keyframe** at the end of `globals.css` (after the `.orbit-edge` block, line 113):

```css
.glow-accent {
  box-shadow: var(--glow-accent);
}

@keyframes status-pulse {
  0%, 100% { box-shadow: 0 0 0 2px var(--bg-surface), 0 0 0 4px var(--ring-color); }
  50% { box-shadow: 0 0 0 2px var(--bg-surface), 0 0 0 4px var(--ring-color), 0 0 10px 4px var(--ring-color); }
}

.status-ring[data-status='running'] {
  animation: status-pulse 1.8s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .status-ring[data-status='running'],
  .orbit-edge {
    animation: none;
  }
}

:where(a, button, [role='button'], input, select, textarea):focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}
```

- [ ] **Step 4: Verify build + dev render**

Run: `pnpm --filter @mas/web build`
Expected: build succeeds (CSS is valid).

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/globals.css
git commit -m "feat(web): HUD design tokens (cyan/gold OLED + glow)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: `agentVisual` pure helper (TDD)

**Files:**
- Create: `apps/web/lib/agent-visual.ts`
- Test: `apps/web/lib/agent-visual.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { agentVisual, type GlyphKey } from './agent-visual';

describe('agentVisual', () => {
  it('is deterministic for the same name', () => {
    expect(agentVisual('Mission Planner')).toEqual(agentVisual('Mission Planner'));
  });

  it('gives different hues to different names', () => {
    expect(agentVisual('Mission Planner').hue).not.toBe(agentVisual('Security Reviewer').hue);
  });

  it('keeps hue within the cyan→gold ramp (180–48 via wrap)', () => {
    const { hue } = agentVisual('anything at all');
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
  });

  it('maps known roles to glyphs by id keyword', () => {
    const cases: Array<[string, GlyphKey]> = [
      ['mission-planner', 'map'],
      ['skill-router', 'compass'],
      ['context-manager', 'brain'],
      ['memory-keeper', 'brain'],
      ['sec-reviewer', 'shield'],
      ['reviewer', 'search'],
      ['engineering-frontend-developer', 'pen'],
      ['design-ux-architect', 'sparkles'],
      ['engineering-backend-architect', 'wrench'],
      ['testing-reality-checker', 'flask'],
    ];
    for (const [id, glyph] of cases) {
      expect(agentVisual('x', id).glyph).toBe(glyph);
    }
  });

  it('falls back to the cpu glyph for unknown roles', () => {
    expect(agentVisual('Mystery', 'totally-unknown').glyph).toBe('cpu');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mas/web exec vitest run lib/agent-visual.test.ts`
Expected: FAIL — cannot find module `./agent-visual`.

- [ ] **Step 3: Write the minimal implementation**

```ts
export type GlyphKey =
  | 'map' | 'compass' | 'brain' | 'shield' | 'search'
  | 'pen' | 'sparkles' | 'wrench' | 'flask' | 'cpu';

export type AgentVisual = { hue: number; glyph: GlyphKey };

// id/role keyword → glyph. First matching keyword wins (order matters).
const GLYPH_RULES: Array<[RegExp, GlyphKey]> = [
  [/planner|plan/, 'map'],
  [/router|route/, 'compass'],
  [/memory|context/, 'brain'],
  [/sec|security/, 'shield'],
  [/review/, 'search'],
  [/frontend|front/, 'pen'],
  [/ux|design/, 'sparkles'],
  [/backend|architect/, 'wrench'],
  [/reality|test|check/, 'flask'],
];

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Cyan (190) → gold (45): map hash onto a 145°-wide arc starting at 45.
function hueFor(name: string): number {
  return 45 + (hashString(name) % 146);
}

function glyphFor(role: string): GlyphKey {
  for (const [re, glyph] of GLYPH_RULES) {
    if (re.test(role)) return glyph;
  }
  return 'cpu';
}

export function agentVisual(name: string, role?: string): AgentVisual {
  return { hue: hueFor(name), glyph: glyphFor((role ?? name).toLowerCase()) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @mas/web exec vitest run lib/agent-visual.test.ts`
Expected: PASS (all 6 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/agent-visual.ts apps/web/lib/agent-visual.test.ts
git commit -m "feat(web): agentVisual pure helper (name→hue, role→glyph)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Rebuild `AgentAvatar` with neon glyph + status ring

**Files:**
- Modify: `apps/web/components/AgentAvatar.tsx` (full rewrite)

- [ ] **Step 1: Rewrite the component**

```tsx
import { Map, Compass, Brain, Shield, Search, PenTool, Sparkles, Wrench, FlaskConical, Cpu } from 'lucide-react';
import { cn } from '@/lib/cn';
import { agentVisual, type GlyphKey } from '@/lib/agent-visual';

type Status = 'idle' | 'running' | 'blocked' | 'waiting' | 'done';

const GLYPHS: Record<GlyphKey, typeof Cpu> = {
  map: Map, compass: Compass, brain: Brain, shield: Shield, search: Search,
  pen: PenTool, sparkles: Sparkles, wrench: Wrench, flask: FlaskConical, cpu: Cpu,
};

export function AgentAvatar({
  src,
  alt,
  role,
  status = 'idle',
  size = 36,
  className,
}: Readonly<{
  src?: string | null;
  alt: string;
  role?: string;
  status?: Status;
  size?: number;
  className?: string;
}>) {
  const { hue, glyph } = agentVisual(alt, role);
  const Glyph = GLYPHS[glyph];
  return (
    <span
      className={cn('relative inline-flex items-center justify-center rounded-full status-ring', className)}
      data-status={status}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, hsl(${hue} 90% 22%), hsl(${hue} 80% 8%))`,
      }}
      aria-label={alt}
      title={alt}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={size * 0.6} height={size * 0.6} />
      ) : (
        <Glyph size={size * 0.5} strokeWidth={1.75} style={{ color: `hsl(${hue} 95% 72%)` }} aria-hidden />
      )}
    </span>
  );
}
```

- [ ] **Step 2: Find and update existing call sites that relied on initials**

Run: `grep -rn "AgentAvatar" apps/web/app apps/web/components | grep -v "AgentAvatar.tsx"`
Expected: a list (home `page.tsx`, `AgentCard.tsx`, agent detail, studio). For each, pass `role={agent.id}` (or the agent's id field) when available so the glyph matches the role; existing `src`/`alt`/`status`/`size` props still work unchanged.

- [ ] **Step 3: Verify build**

Run: `pnpm --filter @mas/web build`
Expected: build succeeds, no TS errors about missing props.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/AgentAvatar.tsx apps/web/components/AgentCard.tsx apps/web/app
git commit -m "feat(web): neon glyph agent avatars with status rings" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Grouped, glowing Sidebar

**Files:**
- Modify: `apps/web/components/Sidebar.tsx` (full rewrite)
- Modify: `apps/web/lib/i18n.ts` (add 3 group-label keys in both `fr` and `en`)

- [ ] **Step 1: Add i18n group keys** — in `apps/web/lib/i18n.ts`, add to the `fr` map (near the `nav.*` keys, line ~9) and the `en` map (line ~48):

```ts
// fr
'navgroup.pilot': 'Pilotage',
'navgroup.agents': 'Agents',
'navgroup.system': 'Système',
// en
'navgroup.pilot': 'Control',
'navgroup.agents': 'Agents',
'navgroup.system': 'System',
```

- [ ] **Step 2: Rewrite `Sidebar.tsx`** to render three groups with a cyan active indicator:

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, ListTodo, Lightbulb, ArrowUpNarrowWide, Users, Workflow, Sparkles, Coins, Activity, Brain } from 'lucide-react';
import { cn } from '@/lib/cn';
import { t, type Language } from '@/lib/i18n';

const groups = [
  { label: 'navgroup.pilot', items: [
    { href: '/', key: 'nav.command', icon: LayoutDashboard },
    { href: '/projects', key: 'nav.projects', icon: FolderKanban },
    { href: '/missions', key: 'nav.missions', icon: ListTodo },
    { href: '/priorities', key: 'nav.priorities', icon: ArrowUpNarrowWide },
    { href: '/ideas', key: 'nav.ideas', icon: Lightbulb },
  ]},
  { label: 'navgroup.agents', items: [
    { href: '/agents', key: 'nav.agents', icon: Users },
    { href: '/studio', key: 'nav.studio', icon: Workflow },
    { href: '/skills', key: 'nav.skills', icon: Sparkles },
  ]},
  { label: 'navgroup.system', items: [
    { href: '/tokens', key: 'nav.tokens', icon: Coins },
    { href: '/trace', key: 'nav.trace', icon: Activity },
    { href: '/memory', key: 'nav.memory', icon: Brain },
  ]},
];

export function Sidebar({ lang = 'fr' }: Readonly<{ lang?: Language }>) {
  const path = usePathname() || '/';
  return (
    <aside
      className="flex h-full w-56 flex-col gap-4 border-r px-3 py-4"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center gap-2 px-2">
        <div className="h-7 w-7 rounded-md glow-accent" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dim))' }} />
        <div className="leading-tight">
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>MultiAgentOS</div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>local agent studio</div>
        </div>
      </div>

      {groups.map((group) => (
        <nav key={group.label} className="flex flex-col gap-0.5">
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {t(group.label, lang)}
          </div>
          {group.items.map((item) => {
            const active = item.href === '/' ? path === '/' : path.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex cursor-pointer items-center gap-2 rounded-md py-1.5 pl-3 pr-2 text-sm transition-colors',
                  active
                    ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
                    : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-primary)]',
                )}
              >
                {active && <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full glow-accent" style={{ background: 'var(--accent)' }} />}
                <Icon size={14} />
                {t(item.key, lang)}
              </Link>
            );
          })}
        </nav>
      ))}

      <div className="mt-auto rounded-md border px-2 py-2 text-[10px]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--warning)' }} />
          <span className="font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Phase 0</span>
        </div>
        <div className="mt-1">Foundation — mocked data. No live LLM yet.</div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Verify build + that nav labels still resolve**

Run: `pnpm --filter @mas/web build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/Sidebar.tsx apps/web/lib/i18n.ts
git commit -m "feat(web): grouped HUD sidebar with active glow indicator" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: De-cramp the Topbar

**Files:**
- Modify: `apps/web/components/Topbar.tsx`

- [ ] **Step 1: Rewrite the right cluster spacing + add a subtle divider and glow on the project chip**

```tsx
import { ScopeBreadcrumb } from './ScopeBreadcrumb';
import { ModePill, AutonomyPill } from './ModePill';
import { LanguagePill } from './LanguagePill';
import { ThemeToggle } from './ThemeToggle';
import { BudgetBar } from './BudgetBar';
import { type Language } from '@/lib/i18n';

export function Topbar({
  projectId,
  projectName = 'OtakuGO_UP',
  language = 'fr',
}: Readonly<{ projectId?: string; projectName?: string; language?: Language }>) {
  return (
    <header
      className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b px-5"
      style={{ background: 'var(--bg-base)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <ScopeBreadcrumb />
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span>
        <span
          className="truncate rounded-md border px-2 py-0.5 text-[11px] font-medium"
          style={{ background: 'var(--bg-hover)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
        >
          {projectName}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <AutonomyPill value="manual" />
        <ModePill defaultMode="eco" />
        <span className="mx-1 h-5 w-px" style={{ background: 'var(--border-default)' }} />
        <LanguagePill projectId={projectId} value={language} />
        <BudgetBar spent={35} cap={300} label="today · €0.35/3" />
        <ThemeToggle />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm --filter @mas/web build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/Topbar.tsx
git commit -m "feat(web): de-cramp topbar spacing + divider" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Dead-link / cursor audit of shared primitives

**Files:**
- Modify (as found): clickable elements missing `cursor-pointer`; `<Link>`s pointing at routes that 404.

- [ ] **Step 1: Find clickable elements without cursor-pointer**

Run: `grep -rn "onClick\|<button\|role=\"button\"" apps/web/components apps/web/app | grep -v "cursor-pointer" | head -40`
For each real interactive element missing it, add `cursor-pointer` to its className. (Buttons get it by default via the browser, but custom `div`/`span` handlers need it.)

- [ ] **Step 2: Verify every nav + card `<Link>` resolves to a real route**

Run: `grep -rohn "href=\"/[a-z/]*\"" apps/web/components apps/web/app | sort -u`
Cross-check each against the route list: `/ /projects /projects/[slug] /projects/new /ideas /missions /missions/[id] /priorities /agents /agents/[id] /studio /skills /tokens /trace /memory`. Any `<Link>` to a path with no `page.tsx` is a dead link — either point it at the correct existing route or remove the link. Document each change in the commit body.

- [ ] **Step 3: Verify build**

Run: `pnpm --filter @mas/web build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/web
git commit -m "fix(web): cursor-pointer + dead-link audit in shell" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Full verification pass (CLAUDE.md §7 — 5 checks)

**Files:** none (fix whatever breaks).

- [ ] **Step 1: Tests** — `pnpm -r test`. Fix any smoke/component assertions broken by the restyle (e.g. tests asserting old accent hex, old nav structure, or AgentAvatar initials text). NEVER export `MAS_MOCK_LLM` globally.

- [ ] **Step 2: Lint** — `pnpm lint` (includes `scripts/lint-no-sdk-payg.sh`). Expected: clean.

- [ ] **Step 3: Build** — `pnpm build`. Expected: clean.

- [ ] **Step 4: Smoke** — `pnpm --filter @mas/web smoke`. Fix Playwright selectors keyed on changed text/markup.

- [ ] **Step 5: Push + Sonar** — push the branch, poll SonarCloud for the HEAD sha, run `scripts/sonar-pr-issues.sh <pr>` until it exits 0 AND gate is OK. Apply `docs/knowledge/sonar-recurring-rules.md` proactively (hoist duplicated literals, `<output>` over role=status, async patterns, no `use*` helper names, no nested ternaries).

- [ ] **Step 6: Open PR** (off `main`) with the 5-check evidence + before/after screenshots. Leave OPEN for the user to merge. Never merge or push to `main`.

---

## Notes for the implementer
- This is presentational. Do NOT touch backend, DB, dispatch, providers, or `data/memory/`.
- No `@anthropic-ai/sdk` imports (lint guard enforces).
- Light mode must still pass its tests; verify both themes.
- After the work, run the app (`pnpm --filter @mas/web dev`) and capture screenshots of every route for the user to judge — the user evaluates visually ("on verra bien").
