# C1 + C12 — Statut vérité & contrat d'alertes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Le statut stocké d'une mission redevient un simple *déclaré* ; la vérité est recalculée au moment de la lecture depuis les faits en base, et tout écart s'affiche comme une alerte contractuelle (badge « désynchronisé » + sa raison).

**Architecture :** deux modules purs + un collecteur. `mission-truth.ts` (aucune I/O) applique un ordre de règles fixe sur des `MissionFacts` et compare le résultat au déclaré via une **matrice de compatibilité explicite** — c'est elle qui empêche les faux désyncs. `mission-facts.ts` lit les faits en base en **3 requêtes groupées** (pas de N+1 sur le board) et applique le seuil de péremption. `alerts.ts` porte le type `Alert` validé Zod + une fonction constructeur par famille d'alerte, chacune renvoyant `null` quand le fait est **absent** (`null ≠ zéro`). Un seul composant, `AlertSurface.tsx`, a le droit de rendre une alerte ; un portique shell le vérifie dans `pnpm lint`. Aucune table, aucune colonne, aucun LLM — mêmes règles que `computeProjectHealth` (`apps/web/lib/health.ts:23`).

**Tech Stack :** Next.js 15 (App Router, Server Components) · TypeScript · Drizzle/SQLite · Zod 3 · Vitest · Playwright · Tailwind (variables CSS du thème).

**Sources :** carte `docs/backlog/statut-verite-reconciliation.md` (corrigée le 2026-08-14) · dossier d'intake `docs/intake/2026-08-14-cartes-a2-otakugo.md` §3 (C1, C12) · audit `docs/audits/otakugo/A2-patterns-cockpit.md` (P1, P15).

---

## 0. Ce que la correction de carte change pour toi (à lire avant de coder)

Deux faits promis par la carte n'existaient pas. Corrigés dans la carte, tenus par ce plan :

| Fait promis | État réel | Ce que fait ce plan |
|---|---|---|
| « verdict du dernier `reports` » | `reports` n'a **pas** de colonne `verdict` — c'est le livrable n°2 de **C3**, séquencée *après* C1+C12 | Le champ `reportVerdict` existe dans `MissionFacts` avec `null = fait absent` ; **les règles pures sont écrites et testées maintenant** (Task 7), seul le collecteur renvoie `null` en dur (Task 8). C3 branchera 4 lignes. |
| « badge en ≤ 60 s après avoir tué le worker » | Les events sortent aux transitions de tâche (`dispatch.ts:384,690`), pas à chaque tick : un LLM long laisse la mission muette plusieurs minutes → un seuil 60 s produirait un **faux** désync | Seuil `STALE_AFTER_MS = 10 min` (env `MAS_MISSION_STALE_MS`). Le « ≤ 60 s » devient une promesse de **propagation** (rendu suivant), testée avec `now` injecté (Task 7) + un e2e sur mission semée périmée (Task 10). La détection 60 s wall-clock revient avec le heartbeat v2. |

**Convention de nommage** : le contrat P15 parle de `{quoi, pourquoi, action}`. Le code utilise les identifiants anglais `what / why / action / route / severity` (convention du dépôt : `ProjectHealth`, `BudgetPause`, `PendingValidation`) ; **la copie affichée reste en français**. La correspondance est écrite en tête de `alerts.ts`.

## 1. Structure de fichiers

| Fichier | Responsabilité | Pur ? |
|---|---|---|
| `apps/web/lib/alerts.ts` *(créer)* | Type `Alert` + schéma Zod + `makeAlert` + un constructeur par famille (budget pause · validations · budget projet · désync) | pur (imports `type` only) |
| `apps/web/lib/alerts.test.ts` *(créer)* | Validateur (champ vide refusé) + `null ≠ zéro` par famille | — |
| `apps/web/components/AlertSurface.tsx` *(créer)* | `AlertBanner` + `AlertBadge` — **les seuls** rendus d'alerte du cockpit | présentation |
| `apps/web/alert-surface.test.ts` *(créer)* | Rendu SSR (`renderToStaticMarkup`), `null` ⇒ rien | — |
| `apps/web/lib/mission-truth.ts` *(créer)* | `MissionFacts`, `MissionTruth`, `reconcileMissionStatus(facts, now, staleAfterMs)`, matrice de compatibilité | **pur, zéro I/O** |
| `apps/web/lib/mission-truth.test.ts` *(créer)* | Machine à états, I/O stubée, `now` injecté | — |
| `apps/web/lib/mission-facts.ts` *(créer)* | `collectMissionFacts` / `missionReconciliations` — 3 requêtes groupées + seuil env | I/O |
| `apps/web/lib/mission-facts.test.ts` *(créer)* | Collecteur sur DB temporaire (patron `health.test.ts`) | — |
| `apps/web/lib/health.ts` *(modifier)* | `budgetUsedPct: number \| null` — correction `null ≠ zéro` déjà latente | I/O |
| `apps/web/components/ProjectHealthBar.tsx` *(modifier)* | Affiche `—` quand aucun plafond n'est déclaré | présentation |
| `apps/web/components/BudgetPauseBanner.tsx` *(supprimer)* | Remplacé par `AlertBanner` | — |
| `apps/web/app/(cockpit)/page.tsx` *(modifier)* | Bannière budget + bannière validations via le contrat | — |
| `apps/web/app/(cockpit)/tokens/page.tsx` *(modifier)* | Bannière budget via le contrat | — |
| `apps/web/app/(cockpit)/projects/[slug]/page.tsx` *(modifier)* | Bannière budget projet (famille 3) | — |
| `apps/web/app/(cockpit)/missions/page.tsx` + `components/MissionsBoardClient.tsx` *(modifier)* | Badge désync sur les cartes du board | — |
| `apps/web/app/(cockpit)/missions/[id]/page.tsx` *(modifier)* | Badge désync + raison dans l'en-tête mission | — |
| `scripts/lint-alert-render.sh` *(créer)* + `package.json` *(modifier)* | Portique binaire : aucun rendu d'alerte hors `AlertSurface.tsx` | — |
| `packages/db/src/seed.ts` *(modifier)* | Mission `mission_seed_stale` (`executing`, dernier event à −2 h) pour l'e2e | — |
| `apps/web/tests/desync.spec.ts` *(créer)* | e2e : badge + raison sur `/missions` et `/missions/<id>` | — |
| `apps/web/package.json` *(modifier)* | dépendance `zod` | — |

---

## Task 1 : socle du contrat `Alert` (type + validateur Zod)

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/lib/alerts.ts`
- Test: `apps/web/lib/alerts.test.ts`

- [ ] **Step 1 : ajouter la dépendance `zod`**

`zod` est déjà dans le dépôt (`packages/core`, `packages/memory` en `^3.23.8`) — on aligne la version, pas d'ADR (§2 stack : Zod fait partie de l'outillage existant).

```bash
pnpm --filter @mas/web add zod@^3.23.8
```

Attendu : `apps/web/package.json` gagne `"zod": "^3.23.8"` dans `dependencies`.

- [ ] **Step 2 : écrire le test qui échoue**

Créer `apps/web/lib/alerts.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { makeAlert } from './alerts';

describe('makeAlert — contrat C12 (P15)', () => {
  it('accepte une alerte dont les trois phrases + la route sont remplies', () => {
    const a = makeAlert({
      what: 'Quota journalier atteint — le dispatch est en pause.',
      why: "Aucune tâche ne partira tant que le plafond n'est pas relevé.",
      action: 'Relève le plafond dans Jetons.',
      route: '/tokens',
      severity: 'danger',
    });
    expect(a.route).toBe('/tokens');
    expect(a.severity).toBe('danger');
  });

  it.each(['what', 'why', 'action'])('refuse une alerte dont %s est vide', (field) => {
    const base: Record<string, unknown> = {
      what: 'x', why: 'y', action: 'z', route: '/tokens', severity: 'info',
    };
    expect(() => makeAlert({ ...base, [field]: '   ' })).toThrow(/contrat C12/);
  });

  it('refuse une route qui ne commence pas par /', () => {
    expect(() => makeAlert({
      what: 'x', why: 'y', action: 'z', route: 'tokens', severity: 'info',
    })).toThrow(/contrat C12/);
  });

  it('refuse une sévérité hors contrat', () => {
    expect(() => makeAlert({
      what: 'x', why: 'y', action: 'z', route: '/tokens', severity: 'catastrophe',
    })).toThrow(/contrat C12/);
  });
});
```

- [ ] **Step 3 : lancer le test, vérifier qu'il échoue**

```bash
pnpm --filter @mas/web test -- alerts
```

Attendu : FAIL — `Failed to resolve import "./alerts"`.

- [ ] **Step 4 : écrire l'implémentation minimale**

Créer `apps/web/lib/alerts.ts` :

```ts
import { z } from 'zod';

// C12 — contrat d'alertes du cockpit (docs/backlog/statut-verite-reconciliation.md,
// pattern P15 de docs/audits/otakugo/A2-patterns-cockpit.md).
//
// Contrat P15 : {quoi, pourquoi, action} + route + sévérité, les trois phrases
// obligatoires. Identifiants anglais (convention du dépôt), copie affichée en
// français : quoi = what · pourquoi = why · action = action.
//
// RÈGLE DURE : aucun fait ⇒ aucune alerte. Un constructeur de famille renvoie
// `null` quand la donnée est ABSENTE, jamais une alerte d'absence — null ≠ zéro.

export const AlertSchema = z.object({
  what: z.string().trim().min(1),
  why: z.string().trim().min(1),
  action: z.string().trim().min(1),
  route: z.string().trim().startsWith('/'),
  severity: z.enum(['info', 'warning', 'danger']),
});

export type Alert = z.infer<typeof AlertSchema>;
export type AlertSeverity = Alert['severity'];

/** Seul constructeur légal d'une alerte. Jette si le contrat n'est pas tenu. */
export function makeAlert(input: unknown): Alert {
  const parsed = AlertSchema.safeParse(input);
  if (parsed.success) return parsed.data;
  const detail = parsed.error.issues.map((i) => `${i.path.join('.') || '(racine)'}: ${i.message}`).join(' · ');
  throw new Error(`alerte invalide (contrat C12) — ${detail}`);
}
```

- [ ] **Step 5 : lancer le test, vérifier qu'il passe**

```bash
pnpm --filter @mas/web test -- alerts
```

Attendu : PASS, 6 tests.

- [ ] **Step 6 : commit**

```bash
git add apps/web/package.json apps/web/lib/alerts.ts apps/web/lib/alerts.test.ts pnpm-lock.yaml
git commit -m "feat(alerts): contrat Alert + validateur Zod" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2 : les trois familles d'alertes existantes (`null ≠ zéro`)

**Files:**
- Modify: `apps/web/lib/alerts.ts`
- Test: `apps/web/lib/alerts.test.ts`

- [ ] **Step 1 : écrire les tests qui échouent**

Ajouter à `apps/web/lib/alerts.test.ts` (imports en tête à compléter : `import { budgetPauseAlert, pendingValidationsAlert, projectBudgetAlert, makeAlert } from './alerts';`) :

```ts
describe('familles d’alertes — null ≠ zéro', () => {
  it('budget pause : aucun fait (null) ⇒ aucune alerte', () => {
    expect(budgetPauseAlert(null)).toBeNull();
  });

  it('budget pause : fait présent ⇒ alerte danger routée vers /tokens', () => {
    const a = budgetPauseAlert({ window: 'day', at: new Date('2026-08-14T10:00:00Z') });
    expect(a?.severity).toBe('danger');
    expect(a?.route).toBe('/tokens');
    expect(a?.what).toContain('journalier');
  });

  it('validations : liste vide = zéro RÉEL ⇒ aucune alerte', () => {
    expect(pendingValidationsAlert([])).toBeNull();
  });

  it('validations : 2 en attente ⇒ une alerte qui dit quoi faire', () => {
    const a = pendingValidationsAlert([{ risk: 'high' }, { risk: 'low' }]);
    expect(a?.what).toContain('2');
    expect(a?.action).not.toBe('');
    expect(a?.route).toBe('/');
  });

  it('budget projet : aucun plafond déclaré (null) ⇒ aucune alerte, PAS une alerte à 0 %', () => {
    expect(projectBudgetAlert(null, '/projects/otakugo')).toBeNull();
  });

  it('budget projet : 40 % consommés ⇒ sous le seuil, aucune alerte', () => {
    expect(projectBudgetAlert(40, '/projects/otakugo')).toBeNull();
  });

  it('budget projet : 92 % consommés ⇒ alerte warning', () => {
    const a = projectBudgetAlert(92, '/projects/otakugo');
    expect(a?.severity).toBe('warning');
    expect(a?.what).toContain('92');
  });
});
```

- [ ] **Step 2 : lancer les tests, vérifier qu'ils échouent**

```bash
pnpm --filter @mas/web test -- alerts
```

Attendu : FAIL — `budgetPauseAlert is not a function` (ou erreur d'import).

- [ ] **Step 3 : implémenter les trois constructeurs**

Ajouter à `apps/web/lib/alerts.ts` (les imports sont `type`-only : aucun runtime `@mas/db` ne rentre dans ce module pur) :

```ts
import type { BudgetPause } from './autopilot';

const WINDOW_LABEL: Record<BudgetPause['window'], string> = {
  day: 'journalier',
  week: 'hebdomadaire',
  month: 'mensuel',
};

/** Seuil d'alerte du budget projet, en pourcentage consommé. */
export const PROJECT_BUDGET_WARN_PCT = 90;

/** Famille 1 — dispatch en pause quota (remplace BudgetPauseBanner). */
export function budgetPauseAlert(pause: BudgetPause | null): Alert | null {
  if (pause === null) return null; // aucun fait ⇒ aucune alerte
  return makeAlert({
    what: `Quota ${WINDOW_LABEL[pause.window]} atteint — le dispatch est en pause.`,
    why: "Aucune tâche ne partira tant que le plafond n'est pas relevé.",
    action: 'Relève le plafond dans Jetons, puis relance la mission.',
    route: '/tokens',
    severity: 'danger',
  });
}

/** Famille 2 — validations humaines en attente (§5 : le gate ne se contourne pas). */
export function pendingValidationsAlert(pending: readonly { risk: string }[]): Alert | null {
  if (pending.length === 0) return null; // zéro réel : la requête a tourné, rien n'attend
  const blocking = pending.filter((p) => p.risk === 'high' || p.risk === 'blocking').length;
  return makeAlert({
    what: `${pending.length} validation(s) en attente, dont ${blocking} à risque élevé.`,
    why: 'Les tâches concernées sont arrêtées tant que tu ne tranches pas.',
    action: 'Ouvre « À traiter » sur le Centre de commande et approuve ou rejette.',
    route: '/',
    severity: blocking > 0 ? 'danger' : 'warning',
  });
}

/**
 * Famille 3 — budget projet. `usedPct === null` = AUCUN plafond déclaré :
 * fait absent, donc aucune alerte (et surtout pas « 0 % consommé »).
 */
export function projectBudgetAlert(usedPct: number | null, route: string): Alert | null {
  if (usedPct === null) return null;
  if (usedPct < PROJECT_BUDGET_WARN_PCT) return null;
  return makeAlert({
    what: `Budget du projet consommé à ${usedPct} %.`,
    why: 'Les prochaines missions seront mises en pause au dépassement (CLAUDE.md §6).',
    action: 'Relève le plafond du projet ou archive les missions terminées.',
    route,
    severity: 'warning',
  });
}
```

- [ ] **Step 4 : lancer les tests, vérifier qu'ils passent**

```bash
pnpm --filter @mas/web test -- alerts
```

Attendu : PASS, 13 tests.

- [ ] **Step 5 : commit**

```bash
git add apps/web/lib/alerts.ts apps/web/lib/alerts.test.ts
git commit -m "feat(alerts): 3 familles existantes, regle null != zero" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3 : corriger le `null ≠ zéro` déjà présent dans `computeProjectHealth`

`ProjectHealthBar` affiche aujourd'hui **« budget used 0 % »** pour un projet **sans aucun plafond déclaré** (`health.ts:62` : `budgetSum > 0 ? … : 0`). C'est exactement le mensonge que C12 interdit, et il est déjà en production dans le cockpit. On le corrige avant de brancher la famille 3.

**Files:**
- Modify: `apps/web/lib/health.ts:9-18`, `apps/web/lib/health.ts:57-66`
- Modify: `apps/web/components/ProjectHealthBar.tsx:22`
- Test: `apps/web/lib/health.test.ts`

- [ ] **Step 1 : écrire le test qui échoue**

Ajouter dans `apps/web/lib/health.test.ts`, à l'intérieur du `describe` existant :

```ts
  it('budgetUsedPct est null quand aucun plafond n’est déclaré (null ≠ zéro)', async () => {
    const db = getDb();
    await db.insert(missions).values({
      id: 'm9', projectId: 'p1', title: 'sans plafond', objective: 'o', status: 'draft',
      budgetTokens: 0, spentTokens: 0, createdAt: new Date(), updatedAt: new Date(),
    });
    const h = await computeProjectHealth(db, 'p1');
    expect(h.budgetUsedPct).toBeNull();
  });
```

Corriger aussi l'assertion du test « empty project » qui attend `budgetUsedPct: 0` :

```ts
    expect(h).toMatchObject({ missionsTotal: 0, missionsDone: 0, missionsBlocked: 0, openIdeas: 0, pendingValidations: 0 });
    expect(h.budgetUsedPct).toBeNull();
```

- [ ] **Step 2 : lancer le test, vérifier qu'il échoue**

```bash
pnpm --filter @mas/web test -- health
```

Attendu : FAIL — `expected 0 to be null`.

- [ ] **Step 3 : implémenter**

Dans `apps/web/lib/health.ts`, l'interface :

```ts
export interface ProjectHealth {
  missionsTotal: number;
  missionsDone: number;
  missionsBlocked: number;
  lastActivity: Date | null;
  /** null = aucun plafond déclaré (fait ABSENT). Jamais 0 par défaut — C12, null ≠ zéro. */
  budgetUsedPct: number | null;
  nextDeadline: Date | null;
  openIdeas: number;
  pendingValidations: number;
}
```

et le retour :

```ts
    budgetUsedPct: budgetSum > 0 ? Math.round((spentSum / budgetSum) * 100) : null,
```

Dans `apps/web/components/ProjectHealthBar.tsx`, remplacer la ligne 22 :

```tsx
      <Stat label="budget used" value={health.budgetUsedPct === null ? '—' : `${health.budgetUsedPct}%`} />
```

- [ ] **Step 4 : lancer les tests + le typecheck**

```bash
pnpm --filter @mas/web test -- health && pnpm --filter @mas/web lint
```

Attendu : tests PASS ; `tsc --noEmit` sans erreur (aucun autre appelant de `budgetUsedPct` — vérifié : seuls `ProjectHealthBar` et les tests le lisent).

- [ ] **Step 5 : commit**

```bash
git add apps/web/lib/health.ts apps/web/lib/health.test.ts apps/web/components/ProjectHealthBar.tsx
git commit -m "fix(health): budgetUsedPct null quand aucun plafond" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4 : le composant contractuel unique (`AlertSurface.tsx`)

**Files:**
- Create: `apps/web/components/AlertSurface.tsx`
- Test: `apps/web/alert-surface.test.ts` *(à la racine de `apps/web` : `vitest.config.ts` n'inclut que `*.test.ts` racine + `lib/**/*.test.ts`)*

- [ ] **Step 1 : écrire le test qui échoue**

Créer `apps/web/alert-surface.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AlertBanner, AlertBadge } from './components/AlertSurface';
import type { Alert } from './lib/alerts';

const ALERT: Alert = {
  what: 'Quota journalier atteint — le dispatch est en pause.',
  why: "Aucune tâche ne partira tant que le plafond n'est pas relevé.",
  action: 'Relève le plafond dans Jetons.',
  route: '/tokens',
  severity: 'danger',
};

describe('AlertSurface — seul rendu d’alerte autorisé', () => {
  it('bannière : rend les trois phrases et la route', () => {
    const html = renderToStaticMarkup(createElement(AlertBanner, { alert: ALERT }));
    expect(html).toContain('Quota journalier atteint');
    expect(html).toContain('plafond');
    expect(html).toContain('href="/tokens"');
  });

  it('bannière : alerte absente ⇒ aucun rendu', () => {
    expect(renderToStaticMarkup(createElement(AlertBanner, { alert: null }))).toBe('');
  });

  it('badge : rend le « quoi » et porte pourquoi + action en title', () => {
    const html = renderToStaticMarkup(createElement(AlertBadge, { alert: ALERT, testId: 'x-badge' }));
    expect(html).toContain('data-testid="x-badge"');
    expect(html).toContain('Quota journalier atteint');
    expect(html).toContain('title=');
  });

  it('badge : alerte absente ⇒ aucun rendu', () => {
    expect(renderToStaticMarkup(createElement(AlertBadge, { alert: null }))).toBe('');
  });
});
```

- [ ] **Step 2 : lancer le test, vérifier qu'il échoue**

```bash
pnpm --filter @mas/web test -- alert-surface
```

Attendu : FAIL — `Failed to resolve import "./components/AlertSurface"`.

- [ ] **Step 3 : implémenter le composant**

Créer `apps/web/components/AlertSurface.tsx` :

```tsx
import Link from 'next/link';
import { Info, OctagonAlert, TriangleAlert } from 'lucide-react';
import type { Alert, AlertSeverity } from '@/lib/alerts';

// C12 — LE composant d'alerte du cockpit. Aucun autre fichier n'a le droit de
// rendre une alerte : le portique scripts/lint-alert-render.sh le vérifie dans
// `pnpm lint`. Une alerte `null` ne rend RIEN (aucun fait ⇒ aucune alerte).

const TONE: Record<AlertSeverity, { color: string; Icon: typeof Info }> = {
  info: { color: 'var(--accent)', Icon: Info },
  warning: { color: 'var(--warning)', Icon: TriangleAlert },
  danger: { color: 'var(--danger)', Icon: OctagonAlert },
};

export function AlertBanner({ alert, testId }: Readonly<{ alert: Alert | null; testId?: string }>) {
  if (alert === null) return null;
  const { color, Icon } = TONE[alert.severity];
  return (
    <output
      data-testid={testId ?? 'alert-banner'}
      data-severity={alert.severity}
      className="surface flex items-start gap-3 p-3.5"
      style={{ borderColor: color, background: 'var(--bg-hover)' }}
    >
      <Icon size={18} className="mt-0.5 shrink-0" style={{ color }} />
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{alert.what}</p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{alert.why}</p>
        <Link href={alert.route} className="text-xs font-medium underline-offset-2 hover:underline" style={{ color }}>
          {alert.action}
        </Link>
      </div>
    </output>
  );
}

export function AlertBadge({ alert, testId }: Readonly<{ alert: Alert | null; testId?: string }>) {
  if (alert === null) return null;
  const { color } = TONE[alert.severity];
  return (
    <span
      data-testid={testId ?? 'alert-badge'}
      data-severity={alert.severity}
      title={`${alert.why} ${alert.action}`}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: 'var(--bg-hover)', color }}
    >
      <span aria-hidden="true">●</span>
      <span>{alert.what}</span>
    </span>
  );
}
```

> Pièges Sonar évités ici (`docs/knowledge/sonar-recurring-rules.md`) : `<output>` pour le rôle `status` (S6819, patron `EmptyState`), tout texte JSX encapsulé dans un `<span>` (S6772), aucun handler sur un élément non natif (S6848).

- [ ] **Step 4 : lancer le test, vérifier qu'il passe**

```bash
pnpm --filter @mas/web test -- alert-surface
```

Attendu : PASS, 4 tests.

- [ ] **Step 5 : commit**

```bash
git add apps/web/components/AlertSurface.tsx apps/web/alert-surface.test.ts
git commit -m "feat(alerts): AlertBanner + AlertBadge contractuels" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 5 : migrer les trois surfaces existantes sur le contrat

**Files:**
- Modify: `apps/web/app/(cockpit)/page.tsx:8-9,38`
- Modify: `apps/web/app/(cockpit)/tokens/page.tsx:6-7,23,27`
- Modify: `apps/web/app/(cockpit)/projects/[slug]/page.tsx:35,58-60`
- Delete: `apps/web/components/BudgetPauseBanner.tsx`

- [ ] **Step 1 : Centre de commande — bannières budget + validations**

Dans `apps/web/app/(cockpit)/page.tsx`, remplacer les imports lignes 8-9 :

```tsx
import { listPendingValidations, latestDailyReport, getBudgetPause } from '@/lib/autopilot';
import { AlertBanner } from '@/components/AlertSurface';
import { budgetPauseAlert, pendingValidationsAlert } from '@/lib/alerts';
```

et remplacer la ligne 38 (`<BudgetPauseBanner pause={budgetPause} />`) par :

```tsx
      <AlertBanner alert={budgetPauseAlert(budgetPause)} testId="budget-pause-banner" />
      <AlertBanner alert={pendingValidationsAlert(pendingValidations)} testId="pending-validations-banner" />
```

> Le `data-testid="budget-pause-banner"` est **conservé** : il existait sur l'ancien composant, on ne casse pas les sélecteurs. La *liste* « À traiter » (ligne 133) reste une liste de travail — ce n'est pas une alerte, elle ne passe pas par le contrat ; c'est sa **bannière de résumé** qui y passe.

- [ ] **Step 2 : page Jetons**

Dans `apps/web/app/(cockpit)/tokens/page.tsx`, remplacer l'import ligne 7 par `import { AlertBanner } from '@/components/AlertSurface';` + `import { budgetPauseAlert } from '@/lib/alerts';`, puis la ligne 27 par :

```tsx
      <AlertBanner alert={budgetPauseAlert(budgetPause)} testId="budget-pause-banner" />
```

- [ ] **Step 3 : détail projet — famille budget projet**

Dans `apps/web/app/(cockpit)/projects/[slug]/page.tsx`, ajouter aux imports :

```tsx
import { AlertBanner } from '@/components/AlertSurface';
import { projectBudgetAlert } from '@/lib/alerts';
```

et, juste avant le bloc `{health && (` (ligne 58) :

```tsx
        <AlertBanner alert={projectBudgetAlert(health.budgetUsedPct, `/projects/${project.slug}`)} testId="project-budget-banner" />
```

- [ ] **Step 4 : supprimer l'ancien composant**

```bash
git rm apps/web/components/BudgetPauseBanner.tsx
```

- [ ] **Step 5 : vérifier qu'aucune référence ne reste**

```bash
grep -rn "BudgetPauseBanner" apps packages scripts || echo "OK: plus aucune reference"
```

Attendu : `OK: plus aucune reference`.

- [ ] **Step 6 : typecheck + tests + smoke**

```bash
pnpm --filter @mas/web lint && pnpm --filter @mas/web test && pnpm --filter @mas/web smoke
```

Attendu : `tsc` sans erreur, tests verts, 15 routes smoke vertes (le smoke vérifie aussi l'absence d'erreur console sur chaque route).

- [ ] **Step 7 : commit**

```bash
git add -A apps/web
git commit -m "refactor(cockpit): 3 surfaces d'etat sur le contrat Alert" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 6 : portique binaire « aucun rendu d'alerte hors du composant contractuel »

Le critère de sortie dit « grep ». On en fait un **script à sortie 0/1 câblé dans `pnpm lint`** (doctrine P19, patron `scripts/lint-no-sdk-payg.sh`) : une vérification qui n'est pas exécutée n'existe pas.

**Files:**
- Create: `scripts/lint-alert-render.sh`
- Modify: `package.json:13`

- [ ] **Step 1 : écrire le portique**

Créer `scripts/lint-alert-render.sh` :

```bash
#!/usr/bin/env bash
# Portique C12 (docs/backlog/statut-verite-reconciliation.md) :
# le seul rendu d'alerte autorisé est apps/web/components/AlertSurface.tsx.
# Toute autre définition de composant *Alert*/*Banner* dans apps/web est un
# rendu hors contrat (trois phrases non garanties, null != zero non garanti).
set -euo pipefail

ROOT="${1:-apps/web}"
ALLOWED="components/AlertSurface.tsx"

HITS=$(grep -rlnE "^export function [A-Za-z]*(Alert|Banner)\(" "$ROOT" \
  --include="*.tsx" 2>/dev/null \
  | grep -v "node_modules" \
  | grep -v "$ALLOWED" \
  || true)

if [[ -n "$HITS" ]]; then
  echo "ERROR: rendu d'alerte hors du composant contractuel (C12)" >&2
  echo "       Le seul rendu autorise est apps/web/$ALLOWED." >&2
  echo "$HITS" >&2
  exit 1
fi

echo "PASS: tous les rendus d'alerte passent par AlertSurface.tsx (C12)"
```

- [ ] **Step 2 : lancer le portique**

```bash
bash scripts/lint-alert-render.sh
```

Attendu : `PASS: tous les rendus d'alerte passent par AlertSurface.tsx (C12)`, code de sortie 0.

- [ ] **Step 3 : vérifier qu'il attrape une violation (test négatif, obligatoire)**

```bash
printf 'export function FakeAlert() { return null; }\n' > apps/web/components/__portique_tmp.tsx
bash scripts/lint-alert-render.sh; echo "exit=$?"
rm apps/web/components/__portique_tmp.tsx
```

Attendu : message `ERROR: rendu d'alerte hors du composant contractuel (C12)` puis `exit=1`.

- [ ] **Step 4 : câbler dans `pnpm lint`**

Dans `package.json`, remplacer la ligne du script `lint` par :

```json
    "lint": "bash scripts/lint-no-sdk-payg.sh && bash scripts/lint-frontmatter.sh && bash scripts/lint-alert-render.sh && pnpm -r lint",
```

- [ ] **Step 5 : vérifier la chaîne complète**

```bash
pnpm lint
```

Attendu : les trois `PASS:` puis les `tsc --noEmit` de chaque paquet, sortie 0.

- [ ] **Step 6 : commit**

```bash
git add scripts/lint-alert-render.sh package.json
git commit -m "chore(lint): portique rendu d'alerte unique (C12)" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 7 : `reconcileMissionStatus` — la machine à états pure (cœur de C1)

**Files:**
- Create: `apps/web/lib/mission-truth.ts`
- Test: `apps/web/lib/mission-truth.test.ts`

- [ ] **Step 1 : écrire les tests qui échouent**

Créer `apps/web/lib/mission-truth.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { reconcileMissionStatus, STALE_AFTER_MS, type MissionFacts } from './mission-truth';

const NOW = new Date('2026-08-14T12:00:00Z');
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000);

function facts(over: Partial<MissionFacts> = {}): MissionFacts {
  return {
    missionId: 'm1',
    declared: 'executing',
    lastEventAt: minutesAgo(1),
    taskCount: 3,
    blockedTaskCount: 0,
    pendingValidationCount: 0,
    budgetExceeded: false,
    reportVerdict: null,
    ...over,
  };
}

describe('reconcileMissionStatus — aucun fait ⇒ aucune alerte', () => {
  it('mission sans aucun event et sans tâche ⇒ unknown, jamais désynchronisée', () => {
    const r = reconcileMissionStatus(
      facts({ declared: 'executing', lastEventAt: null, taskCount: 0, budgetExceeded: null }),
      NOW,
    );
    expect(r.computed).toBe('unknown');
    expect(r.desynced).toBe(false);
    expect(r.reason).toBeNull();
  });

  it('budget non déclaré (null) ne fabrique pas un dépassement', () => {
    const r = reconcileMissionStatus(facts({ budgetExceeded: null }), NOW);
    expect(r.computed).toBe('active');
    expect(r.desynced).toBe(false);
  });
});

describe('reconcileMissionStatus — worker mort en plein executing', () => {
  it('déclaré executing + dernier event vieux de 11 min ⇒ stalled + désynchronisé + raison', () => {
    const r = reconcileMissionStatus(facts({ lastEventAt: minutesAgo(11) }), NOW);
    expect(r.computed).toBe('stalled');
    expect(r.desynced).toBe(true);
    expect(r.reason).toContain('11 min');
    expect(r.reason).toContain('executing');
  });

  it('déclaré executing + event il y a 9 min ⇒ active, PAS de faux désync', () => {
    const r = reconcileMissionStatus(facts({ lastEventAt: minutesAgo(9) }), NOW);
    expect(r.computed).toBe('active');
    expect(r.desynced).toBe(false);
  });

  it('le seuil est injectable (le défaut est 10 min)', () => {
    expect(STALE_AFTER_MS).toBe(10 * 60_000);
    const r = reconcileMissionStatus(facts({ lastEventAt: minutesAgo(2) }), NOW, 60_000);
    expect(r.computed).toBe('stalled');
  });

  it('une mission déclarée draft qui dort n’est pas désynchronisée', () => {
    const r = reconcileMissionStatus(facts({ declared: 'draft', lastEventAt: minutesAgo(600) }), NOW);
    expect(r.computed).toBe('stalled');
    expect(r.desynced).toBe(false);
  });
});

describe('reconcileMissionStatus — ordre strict des règles (P1)', () => {
  it('budget dépassé passe avant tout le reste', () => {
    const r = reconcileMissionStatus(
      facts({ budgetExceeded: true, blockedTaskCount: 2, pendingValidationCount: 1 }),
      NOW,
    );
    expect(r.computed).toBe('halted_budget');
    expect(r.desynced).toBe(true);
  });

  it('tâche bloquée ⇒ blocked, désynchronisé quand la mission se dit executing', () => {
    const r = reconcileMissionStatus(facts({ blockedTaskCount: 1 }), NOW);
    expect(r.computed).toBe('blocked');
    expect(r.desynced).toBe(true);
    expect(r.reason).toContain('1');
  });

  it('validation en attente ⇒ awaiting_human, désync en executing…', () => {
    const r = reconcileMissionStatus(facts({ pendingValidationCount: 2 }), NOW);
    expect(r.computed).toBe('awaiting_human');
    expect(r.desynced).toBe(true);
  });

  it('…mais PAS en review, où l’attente humaine est normale', () => {
    const r = reconcileMissionStatus(facts({ declared: 'review', pendingValidationCount: 2 }), NOW);
    expect(r.computed).toBe('awaiting_human');
    expect(r.desynced).toBe(false);
  });

  it('mission déclarée blocked mais qui produit des events ⇒ désynchronisée', () => {
    const r = reconcileMissionStatus(facts({ declared: 'blocked', lastEventAt: minutesAgo(1) }), NOW);
    expect(r.computed).toBe('active');
    expect(r.desynced).toBe(true);
  });

  it('mission archivée avec une validation encore ouverte ⇒ désynchronisée', () => {
    const r = reconcileMissionStatus(facts({ declared: 'archived', pendingValidationCount: 1 }), NOW);
    expect(r.desynced).toBe(true);
  });
});

// Couture C3 (docs/backlog/contrat-rapport-mission.md) : la colonne reports.verdict
// n'existe pas encore, le collecteur renvoie null. La RÈGLE, elle, est écrite et
// testée dès maintenant — C3 n'aura qu'à alimenter le fait.
describe('reconcileMissionStatus — verdict de rapport (couture C3)', () => {
  it('verdict absent (null) ne produit aucun effet', () => {
    const r = reconcileMissionStatus(facts({ declared: 'validated', lastEventAt: minutesAgo(90), reportVerdict: null }), NOW);
    expect(r.desynced).toBe(false);
  });

  it('verdict BLOCK sur une mission déclarée validated ⇒ désynchronisée', () => {
    const r = reconcileMissionStatus(facts({ declared: 'validated', reportVerdict: 'BLOCK' }), NOW);
    expect(r.computed).toBe('blocked');
    expect(r.desynced).toBe(true);
    expect(r.reason).toContain('BLOCK');
  });

  it('verdict NEEDS_WORK ⇒ needs_attention', () => {
    const r = reconcileMissionStatus(facts({ declared: 'archived', reportVerdict: 'NEEDS_WORK' }), NOW);
    expect(r.computed).toBe('needs_attention');
    expect(r.desynced).toBe(true);
  });

  it('verdict PASS ne crée pas d’alerte', () => {
    const r = reconcileMissionStatus(facts({ declared: 'validated', reportVerdict: 'PASS' }), NOW);
    expect(r.desynced).toBe(false);
  });
});
```

- [ ] **Step 2 : lancer les tests, vérifier qu'ils échouent**

```bash
pnpm --filter @mas/web test -- mission-truth
```

Attendu : FAIL — `Failed to resolve import "./mission-truth"`.

- [ ] **Step 3 : implémenter la fonction pure**

Créer `apps/web/lib/mission-truth.ts` :

```ts
import type { Mission } from '@mas/db';

// C1 — statut vérité. Même doctrine que computeProjectHealth (lib/health.ts) :
// calculé AU MOMENT DE LA LECTURE, aucune table, aucun LLM, `now` injecté.
// Stocker ce calcul recréerait exactement le mensonge qu'il corrige.
//
// Le statut en base est un DÉCLARÉ. La vérité se déduit des faits observables.
// Un fait ABSENT (null) ne produit jamais de vérité : il produit 'unknown', qui
// n'est jamais un désync (contrat C12, null ≠ zéro).

export type MissionStatus = Mission['status'];

export type MissionTruth =
  | 'unknown'
  | 'active'
  | 'stalled'
  | 'awaiting_human'
  | 'blocked'
  | 'needs_attention'
  | 'halted_budget';

export interface MissionFacts {
  missionId: string;
  declared: MissionStatus;
  /** null = aucun event pour cette mission → fait ABSENT (pas « inactive »). */
  lastEventAt: Date | null;
  taskCount: number;
  blockedTaskCount: number;
  pendingValidationCount: number;
  /** null = aucun plafond déclaré → fait ABSENT (pas « budget OK »). */
  budgetExceeded: boolean | null;
  /**
   * null = fait ABSENT. La colonne `reports.verdict` arrive avec C3
   * (docs/backlog/contrat-rapport-mission.md) ; jusque-là le collecteur renvoie
   * null en dur. La règle ci-dessous est déjà écrite et testée.
   */
  reportVerdict: 'PASS' | 'NEEDS_WORK' | 'BLOCK' | null;
}

export interface Reconciliation {
  declared: MissionStatus;
  computed: MissionTruth;
  desynced: boolean;
  /** Phrase française expliquant l'écart. null quand il n'y a pas d'écart. */
  reason: string | null;
}

/**
 * Au-delà de ce silence, une mission déclarée en vol est considérée à l'arrêt.
 * 10 min et pas 60 s : les events sortent aux transitions de tâche
 * (packages/agents/src/dispatch.ts:384,690), pas à chaque tick worker — un appel
 * LLM long laisse légitimement la mission muette plusieurs minutes. Un seuil
 * court fabriquerait de faux désyncs sur un worker vivant. La détection rapide
 * reviendra avec le heartbeat dédié (v2).
 */
export const STALE_AFTER_MS = 10 * 60_000;

/** Vérités compatibles avec chaque statut déclaré. Hors de cet ensemble = désync. */
const COMPATIBLE: Record<MissionStatus, ReadonlySet<MissionTruth>> = {
  draft: new Set(['unknown', 'active', 'stalled']),
  clarified: new Set(['unknown', 'active', 'stalled']),
  planned: new Set(['unknown', 'active', 'stalled']),
  dispatched: new Set(['unknown', 'active']),
  executing: new Set(['unknown', 'active']),
  review: new Set(['unknown', 'active', 'awaiting_human']),
  validated: new Set(['unknown', 'active', 'stalled']),
  archived: new Set(['unknown', 'active', 'stalled']),
  blocked: new Set(['unknown', 'stalled', 'blocked', 'awaiting_human', 'halted_budget', 'needs_attention']),
};

function computeTruth(f: MissionFacts, now: Date, staleAfterMs: number): MissionTruth {
  if (f.budgetExceeded === true) return 'halted_budget';
  if (f.reportVerdict === 'BLOCK') return 'blocked';
  if (f.blockedTaskCount > 0) return 'blocked';
  if (f.pendingValidationCount > 0) return 'awaiting_human';
  if (f.reportVerdict === 'NEEDS_WORK') return 'needs_attention';
  if (f.lastEventAt === null) return 'unknown';
  const ageMs = now.getTime() - f.lastEventAt.getTime();
  return ageMs > staleAfterMs ? 'stalled' : 'active';
}

function reasonFor(truth: MissionTruth, f: MissionFacts, now: Date): string {
  switch (truth) {
    case 'halted_budget':
      return `budget de la mission dépassé alors qu'elle est déclarée « ${f.declared} »`;
    case 'blocked':
      return f.reportVerdict === 'BLOCK'
        ? `le dernier rapport de mission porte le verdict BLOCK (déclaré « ${f.declared} »)`
        : `${f.blockedTaskCount} tâche(s) bloquée(s) alors que la mission est déclarée « ${f.declared} »`;
    case 'awaiting_human':
      return `${f.pendingValidationCount} validation(s) en attente alors que la mission est déclarée « ${f.declared} »`;
    case 'needs_attention':
      return `le dernier rapport de mission porte le verdict NEEDS_WORK (déclaré « ${f.declared} »)`;
    case 'stalled': {
      const minutes = f.lastEventAt === null ? 0 : Math.floor((now.getTime() - f.lastEventAt.getTime()) / 60_000);
      return `aucune activité depuis ${minutes} min alors que la mission est déclarée « ${f.declared} »`;
    }
    case 'active':
      return `activité en cours alors que la mission est déclarée « ${f.declared} »`;
    default:
      return '';
  }
}

/**
 * Confronte le statut déclaré aux faits. Fonction PURE : aucune I/O, `now` et le
 * seuil sont injectés — donc entièrement testable sans base.
 */
export function reconcileMissionStatus(
  facts: MissionFacts,
  now: Date,
  staleAfterMs: number = STALE_AFTER_MS,
): Reconciliation {
  const computed = computeTruth(facts, now, staleAfterMs);
  const desynced = !COMPATIBLE[facts.declared].has(computed);
  return {
    declared: facts.declared,
    computed,
    desynced,
    reason: desynced ? reasonFor(computed, facts, now) : null,
  };
}
```

- [ ] **Step 4 : lancer les tests, vérifier qu'ils passent**

```bash
pnpm --filter @mas/web test -- mission-truth
```

Attendu : PASS, 17 tests.

- [ ] **Step 5 : commit**

```bash
git add apps/web/lib/mission-truth.ts apps/web/lib/mission-truth.test.ts
git commit -m "feat(missions): reconcileMissionStatus, machine a etats pure" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 8 : le collecteur de faits (3 requêtes groupées, zéro N+1)

**Files:**
- Create: `apps/web/lib/mission-facts.ts`
- Modify: `apps/web/lib/alerts.ts` *(famille 4 : désync)*
- Test: `apps/web/lib/mission-facts.test.ts`
- Test: `apps/web/lib/alerts.test.ts`

- [ ] **Step 1 : écrire le test du collecteur (il échoue)**

Créer `apps/web/lib/mission-facts.test.ts` :

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb, projects, missions, tasks, validations, events } from '@mas/db';
import { missionReconciliations } from './mission-facts';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');
const NOW = new Date('2026-08-14T12:00:00Z');
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000);

let dbPath: string;
beforeEach(async () => {
  dbPath = join(tmpdir(), `mas-mf-${randomUUID()}.db`);
  process.env.MAS_DB_PATH = dbPath;
  migrate(getDb(), { migrationsFolder: MIGRATIONS });
  await getDb().insert(projects).values({
    id: 'p1', name: 'P1', slug: 'p1', path: join(tmpdir(), 'p1'), type: 'other', createdAt: NOW, lastActiveAt: NOW,
  });
});
afterEach(() => {
  closeDb();
  try { unlinkSync(dbPath); } catch { /* ignore */ }
  delete process.env.MAS_DB_PATH;
});

describe('missionReconciliations — faits lus en base', () => {
  it('mission executing dont le dernier event a 2 h ⇒ désynchronisée avec sa raison', async () => {
    const db = getDb();
    await db.insert(missions).values({
      id: 'm1', projectId: 'p1', title: 'a', objective: 'o', status: 'executing',
      budgetTokens: 20000, spentTokens: 500, createdAt: minutesAgo(300), updatedAt: minutesAgo(120),
    });
    await db.insert(tasks).values({
      id: 't1', missionId: 'm1', title: 't', status: 'running', createdAt: minutesAgo(300), updatedAt: minutesAgo(120),
    });
    await db.insert(events).values({
      id: 'e1', missionId: 'm1', taskId: 't1', type: 'task_start', createdAt: minutesAgo(120),
    });

    const map = await missionReconciliations(db, ['m1'], NOW);
    const r = map.get('m1');
    expect(r?.computed).toBe('stalled');
    expect(r?.desynced).toBe(true);
    expect(r?.reason).toContain('120 min');
  });

  it('mission sans event ni tâche ⇒ unknown, aucune alerte', async () => {
    const db = getDb();
    await db.insert(missions).values({
      id: 'm2', projectId: 'p1', title: 'b', objective: 'o', status: 'executing',
      budgetTokens: 0, spentTokens: 0, createdAt: NOW, updatedAt: NOW,
    });
    const r = (await missionReconciliations(db, ['m2'], NOW)).get('m2');
    expect(r?.computed).toBe('unknown');
    expect(r?.desynced).toBe(false);
  });

  it('compte les tâches bloquées et les validations pending de la BONNE mission', async () => {
    const db = getDb();
    await db.insert(missions).values([
      { id: 'm3', projectId: 'p1', title: 'c', objective: 'o', status: 'executing', budgetTokens: 100, spentTokens: 10, createdAt: NOW, updatedAt: NOW },
      { id: 'm4', projectId: 'p1', title: 'd', objective: 'o', status: 'executing', budgetTokens: 100, spentTokens: 10, createdAt: NOW, updatedAt: NOW },
    ]);
    await db.insert(tasks).values([
      { id: 't3', missionId: 'm3', title: 'x', status: 'blocked', createdAt: NOW, updatedAt: NOW },
      { id: 't4', missionId: 'm4', title: 'y', status: 'needs_validation', createdAt: NOW, updatedAt: NOW },
    ]);
    await db.insert(validations).values({ id: 'v4', taskId: 't4', requestedByAgent: 'sec', actionSummary: 'x', status: 'pending' });
    await db.insert(events).values([
      { id: 'e3', missionId: 'm3', type: 'task_start', createdAt: minutesAgo(1) },
      { id: 'e4', missionId: 'm4', type: 'task_start', createdAt: minutesAgo(1) },
    ]);

    const map = await missionReconciliations(db, ['m3', 'm4'], NOW);
    expect(map.get('m3')?.computed).toBe('blocked');
    expect(map.get('m4')?.computed).toBe('awaiting_human');
  });

  it('budget mission dépassé ⇒ halted_budget ; plafond à 0 ⇒ fait absent', async () => {
    const db = getDb();
    await db.insert(missions).values([
      { id: 'm5', projectId: 'p1', title: 'e', objective: 'o', status: 'executing', budgetTokens: 1000, spentTokens: 1000, createdAt: NOW, updatedAt: NOW },
      { id: 'm6', projectId: 'p1', title: 'f', objective: 'o', status: 'executing', budgetTokens: 0, spentTokens: 5000, createdAt: NOW, updatedAt: NOW },
    ]);
    await db.insert(events).values([
      { id: 'e5', missionId: 'm5', type: 'task_start', createdAt: minutesAgo(1) },
      { id: 'e6', missionId: 'm6', type: 'task_start', createdAt: minutesAgo(1) },
    ]);
    const map = await missionReconciliations(db, ['m5', 'm6'], NOW);
    expect(map.get('m5')?.computed).toBe('halted_budget');
    expect(map.get('m6')?.computed).toBe('active'); // pas de plafond ⇒ pas de dépassement inventé
  });

  it('liste d’ids vide ⇒ map vide, aucune requête inutile', async () => {
    const map = await missionReconciliations(getDb(), [], NOW);
    expect(map.size).toBe(0);
  });
});
```

- [ ] **Step 2 : lancer le test, vérifier qu'il échoue**

```bash
pnpm --filter @mas/web test -- mission-facts
```

Attendu : FAIL — `Failed to resolve import "./mission-facts"`.

- [ ] **Step 3 : implémenter le collecteur**

Créer `apps/web/lib/mission-facts.ts` :

```ts
import { and, eq, inArray, sql } from 'drizzle-orm';
import { getDb, missions, tasks, validations, events } from '@mas/db';
import {
  reconcileMissionStatus,
  STALE_AFTER_MS,
  type MissionFacts,
  type MissionStatus,
  type Reconciliation,
} from './mission-truth';

// C1 — côté I/O du statut vérité. Lit les faits déjà en base, ne les écrit jamais.
// 3 requêtes groupées pour N missions (le board en affiche des dizaines : pas de N+1).

type Db = ReturnType<typeof getDb>;

/** Seuil de péremption effectif : surchargeable par MAS_MISSION_STALE_MS (ms). */
export function staleAfterMs(): number {
  const raw = process.env.MAS_MISSION_STALE_MS;
  if (raw === undefined) return STALE_AFTER_MS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : STALE_AFTER_MS;
}

export async function collectMissionFacts(db: Db, ids: readonly string[]): Promise<Map<string, MissionFacts>> {
  const out = new Map<string, MissionFacts>();
  if (ids.length === 0) return out;
  const missionIds = [...ids];

  const missionRows = await db
    .select({
      id: missions.id,
      status: missions.status,
      budgetTokens: missions.budgetTokens,
      spentTokens: missions.spentTokens,
    })
    .from(missions)
    .where(inArray(missions.id, missionIds));

  // max(created_at) : colonne `epoch()` = integer timestamp en SECONDES.
  const lastEvents = await db
    .select({ missionId: events.missionId, lastEpoch: sql<number | null>`max(${events.createdAt})` })
    .from(events)
    .where(inArray(events.missionId, missionIds))
    .groupBy(events.missionId);

  const taskRows = await db
    .select({ id: tasks.id, missionId: tasks.missionId, status: tasks.status })
    .from(tasks)
    .where(inArray(tasks.missionId, missionIds));

  // Patron identique à lib/health.ts:49-53 (join + and(...)).
  const pendingRows = await db
    .select({ missionId: tasks.missionId })
    .from(validations)
    .innerJoin(tasks, eq(validations.taskId, tasks.id))
    .where(and(inArray(tasks.missionId, missionIds), eq(validations.status, 'pending')));

  const lastEventAt = new Map<string, Date>();
  for (const r of lastEvents) {
    if (r.missionId !== null && r.lastEpoch !== null) lastEventAt.set(r.missionId, new Date(r.lastEpoch * 1000));
  }

  const taskCount = new Map<string, number>();
  const blockedCount = new Map<string, number>();
  for (const t of taskRows) {
    taskCount.set(t.missionId, (taskCount.get(t.missionId) ?? 0) + 1);
    if (t.status === 'blocked') blockedCount.set(t.missionId, (blockedCount.get(t.missionId) ?? 0) + 1);
  }

  const pendingCount = new Map<string, number>();
  for (const p of pendingRows) pendingCount.set(p.missionId, (pendingCount.get(p.missionId) ?? 0) + 1);

  for (const m of missionRows) {
    out.set(m.id, {
      missionId: m.id,
      declared: m.status as MissionStatus,
      lastEventAt: lastEventAt.get(m.id) ?? null,
      taskCount: taskCount.get(m.id) ?? 0,
      blockedTaskCount: blockedCount.get(m.id) ?? 0,
      pendingValidationCount: pendingCount.get(m.id) ?? 0,
      // Aucun plafond déclaré ⇒ fait ABSENT, pas « budget OK » (C12, null ≠ zéro).
      budgetExceeded: m.budgetTokens > 0 ? m.spentTokens >= m.budgetTokens : null,
      // COUTURE C3 (docs/backlog/contrat-rapport-mission.md) : la colonne
      // reports.verdict n'existe pas encore. Le fait est ABSENT, jamais inventé.
      // C3 remplacera ce null par la lecture du dernier reports (kind='mission').
      reportVerdict: null,
    });
  }
  return out;
}

/** Faits + réconciliation en une passe — ce que les pages consomment. */
export async function missionReconciliations(
  db: Db,
  ids: readonly string[],
  now: Date = new Date(),
): Promise<Map<string, Reconciliation>> {
  const facts = await collectMissionFacts(db, ids);
  const threshold = staleAfterMs();
  const out = new Map<string, Reconciliation>();
  for (const [id, f] of facts) out.set(id, reconcileMissionStatus(f, now, threshold));
  return out;
}
```

> **Si un test échoue d'un facteur 1000 sur `reason`** (« 7200000 min »), c'est la conversion epoch : `epoch()` est `integer({ mode: 'timestamp' })`, donc **secondes**, d'où le `* 1000`. C'est exactement ce que le premier test attrape.

- [ ] **Step 4 : lancer les tests, vérifier qu'ils passent**

```bash
pnpm --filter @mas/web test -- mission-facts
```

Attendu : PASS, 5 tests.

- [ ] **Step 5 : ajouter la famille d'alerte « désync » (test d'abord)**

Ajouter à `apps/web/lib/alerts.test.ts` — **`missionDesyncAlert` s'ajoute à l'import `./alerts` existant** ; un second `import … from './alerts'` déclencherait Sonar S3863 (même module importé deux fois) :

```ts
// import existant, complété : { makeAlert, budgetPauseAlert, pendingValidationsAlert, projectBudgetAlert, missionDesyncAlert }
import type { Reconciliation } from './mission-truth';

describe('famille désync (C1 × C12)', () => {
  it('mission synchronisée ⇒ aucune alerte', () => {
    const r: Reconciliation = { declared: 'executing', computed: 'active', desynced: false, reason: null };
    expect(missionDesyncAlert('m1', r)).toBeNull();
  });

  it('mission périmée ⇒ alerte qui porte la raison, la route et le geste', () => {
    const r: Reconciliation = {
      declared: 'executing',
      computed: 'stalled',
      desynced: true,
      reason: 'aucune activité depuis 120 min alors que la mission est déclarée « executing »',
    };
    const a = missionDesyncAlert('m1', r);
    expect(a?.what).toContain('Désynchronisé');
    expect(a?.what).toContain('120 min');
    expect(a?.route).toBe('/missions/m1');
    expect(a?.severity).toBe('warning');
    expect(a?.action).not.toBe('');
  });

  it('désync bloquante ⇒ sévérité danger', () => {
    const r: Reconciliation = { declared: 'executing', computed: 'blocked', desynced: true, reason: '1 tâche(s) bloquée(s)' };
    expect(missionDesyncAlert('m1', r)?.severity).toBe('danger');
  });
});
```

- [ ] **Step 6 : implémenter la famille désync**

Ajouter à `apps/web/lib/alerts.ts` :

```ts
import type { MissionTruth, Reconciliation } from './mission-truth';

const DESYNC_COPY: Record<Exclude<MissionTruth, 'unknown'>, { why: string; action: string; severity: AlertSeverity }> = {
  active: {
    why: 'La mission tourne alors que le cockpit la dit à l’arrêt.',
    action: 'Ouvre la mission et remets son statut au vrai.',
    severity: 'warning',
  },
  stalled: {
    why: 'Le cockpit affiche un avancement qui n’existe plus (worker arrêté ou tâche perdue).',
    action: 'Relance le worker, ou repasse la mission en « planned » pour la redispatcher.',
    severity: 'warning',
  },
  awaiting_human: {
    why: 'Une décision t’attend sans que le statut le dise — personne n’avance.',
    action: 'Traite la validation en attente sur le Centre de commande.',
    severity: 'danger',
  },
  blocked: {
    why: 'Du travail est bloqué alors que la mission se dit en bonne voie.',
    action: 'Ouvre la mission, débloque la tâche ou passe la mission en « blocked ».',
    severity: 'danger',
  },
  needs_attention: {
    why: 'Le dernier rapport demande une reprise ; le statut ne le reflète pas.',
    action: 'Relis le rapport de mission et relance la boucle de revue.',
    severity: 'warning',
  },
  halted_budget: {
    why: 'La mission a mangé son budget : rien ne repartira tout seul (CLAUDE.md §6).',
    action: 'Relève le budget de la mission ou clôture-la.',
    severity: 'danger',
  },
};

/** Famille 4 — écart entre statut déclaré et faits observés (C1). */
export function missionDesyncAlert(missionId: string, r: Reconciliation): Alert | null {
  if (!r.desynced || r.computed === 'unknown' || r.reason === null) return null;
  const copy = DESYNC_COPY[r.computed];
  return makeAlert({
    what: `Désynchronisé — ${r.reason}.`,
    why: copy.why,
    action: copy.action,
    route: `/missions/${missionId}`,
    severity: copy.severity,
  });
}
```

- [ ] **Step 7 : lancer toute la suite web**

```bash
pnpm --filter @mas/web test
```

Attendu : PASS sur l'ensemble (alerts, alert-surface, mission-truth, mission-facts, health inclus).

- [ ] **Step 8 : commit**

```bash
git add apps/web/lib/mission-facts.ts apps/web/lib/mission-facts.test.ts apps/web/lib/alerts.ts apps/web/lib/alerts.test.ts
git commit -m "feat(missions): collecteur de faits + alerte desync" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 9 : le badge « désynchronisé » dans l'UI (premier client neuf du contrat)

**Files:**
- Modify: `apps/web/app/(cockpit)/missions/[id]/page.tsx`
- Modify: `apps/web/app/(cockpit)/missions/page.tsx`
- Modify: `apps/web/components/MissionsBoardClient.tsx`

- [ ] **Step 1 : détail mission — badge + raison sous l'en-tête**

Dans `apps/web/app/(cockpit)/missions/[id]/page.tsx`, ajouter aux imports :

```tsx
import { AlertBadge } from '@/components/AlertSurface';
import { missionDesyncAlert } from '@/lib/alerts';
import { missionReconciliations } from '@/lib/mission-facts';
```

après `const missionReports = await listMissionReports(db, id);` :

```tsx
  const rec = (await missionReconciliations(db, [m.id])).get(m.id);
  const desync = rec ? missionDesyncAlert(m.id, rec) : null;
```

et dans l'en-tête, juste après `<MissionActions id={m.id} status={m.status} />` :

```tsx
        <AlertBadge alert={desync} testId="mission-desync-badge" />
```

- [ ] **Step 2 : board missions — collecte groupée puis badge par carte**

Dans `apps/web/app/(cockpit)/missions/page.tsx`, ajouter **deux** imports — `@/lib/alerts` ne doit apparaître qu'une fois (Sonar S3863) :

```tsx
import { missionReconciliations } from '@/lib/mission-facts';
import { missionDesyncAlert } from '@/lib/alerts';
```

puis remplacer la construction de `data` :

```tsx
  const rows = await db.select().from(missionsTable).orderBy(desc(missionsTable.updatedAt));
  const recs = await missionReconciliations(db, rows.map((r) => r.id));
  const data: BoardMission[] = rows.map((r) => {
    const rec = recs.get(r.id);
    return {
      id: r.id,
      title: r.title,
      status: r.status as BoardStatus,
      risk: r.risk,
      budgetSpent: r.spentTokens,
      budgetCap: r.budgetTokens,
      desync: rec ? missionDesyncAlert(r.id, rec) : null,
    };
  });
```

Dans `apps/web/components/MissionsBoardClient.tsx`, étendre le type et rendre le badge :

```tsx
import { AlertBadge } from './AlertSurface';
import type { Alert } from '@/lib/alerts';

export interface BoardMission {
  id: string;
  title: string;
  status: BoardStatus;
  risk: 'low' | 'medium' | 'high' | 'blocking';
  budgetSpent: number;
  budgetCap: number;
  desync: Alert | null;
}
```

et, dans la carte, juste après le bloc `<div className="flex items-start justify-between gap-2">…</div>` :

```tsx
                  <AlertBadge alert={m.desync} testId="mission-desync-badge" />
```

> `BoardMission` traverse la frontière serveur → client : `Alert` est un objet JSON plat (5 chaînes), donc sérialisable. Aucun `Date`, aucune fonction — c'est pour ça que le contrat n'expose que des chaînes.

- [ ] **Step 3 : typecheck + tests + smoke**

```bash
pnpm --filter @mas/web lint && pnpm --filter @mas/web test && pnpm --filter @mas/web smoke
```

Attendu : `tsc` sans erreur, tests verts, smoke vert (aucune erreur console sur `/missions` et `/missions/mission_seed_001`).

- [ ] **Step 4 : commit**

```bash
git add "apps/web/app/(cockpit)/missions" apps/web/components/MissionsBoardClient.tsx
git commit -m "feat(cockpit): badge desynchronise sur board + detail" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 10 : preuve de bout en bout (mission semée périmée + e2e)

**Files:**
- Modify: `packages/db/src/seed.ts`
- Create: `apps/web/tests/desync.spec.ts`

- [ ] **Step 1 : semer une mission `executing` dont le dernier event a 2 h**

Dans `packages/db/src/seed.ts`, à côté de `const MISSION_ID = 'mission_seed_001';` (ligne 57) :

```ts
const STALE_MISSION_ID = 'mission_seed_stale';
```

puis, à la fin de `seedMissionRow` (après le premier `.onConflictDoNothing();`, ligne 181) :

```ts
  // C1 — fixture du statut vérité : déclarée `executing`, dernier signe de vie il
  // y a 2 h ⇒ le cockpit doit la badger « désynchronisé » sans édition manuelle.
  await db
    .insert(missions)
    .values({
      id: STALE_MISSION_ID,
      projectId: PROJECT_ID,
      title: 'Mission zombie (fixture statut vérité)',
      objective: 'Fixture C1 : worker mort en plein executing, statut jamais réconcilié.',
      status: 'executing',
      risk: 'low',
      budgetTokens: 20000,
      spentTokens: 4200,
      priorityScore: 10,
      createdAt: minutesAgo(300),
      updatedAt: minutesAgo(120),
    })
    .onConflictDoNothing();

  await db
    .insert(events)
    .values({
      id: 'evt_seed_stale_1',
      missionId: STALE_MISSION_ID,
      type: 'task_start',
      payloadJson: '{}',
      createdAt: minutesAgo(120),
    })
    .onConflictDoNothing();
```

> `minutesAgo` et `events` sont déjà importés/définis dans ce fichier (`seed.ts` les utilise pour la trace de `mission_seed_001`). Vérifier l'import de `events` en tête ; l'ajouter s'il manque.

- [ ] **Step 2 : réamorcer la base de smoke et vérifier à l'œil**

```bash
pnpm --filter @mas/web smoke:reset
```

Attendu : le seed se termine sans erreur.

- [ ] **Step 3 : écrire l'e2e**

Créer `apps/web/tests/desync.spec.ts` :

```ts
import { test, expect } from '@playwright/test';

const STALE_MISSION_ID = 'mission_seed_stale';

test.describe('C1 — statut vérité', () => {
  test('le board badge la mission zombie avec sa raison', async ({ page }) => {
    await page.goto('/missions');
    const card = page.locator(`[data-testid="mission-card"][data-mission-id="${STALE_MISSION_ID}"]`);
    await expect(card).toBeVisible({ timeout: 10_000 });

    const badge = card.getByTestId('mission-desync-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(/désynchronisé/i);
    await expect(badge).toContainText(/aucune activité depuis/i);
  });

  test('le détail mission affiche le badge et sa raison', async ({ page }) => {
    await page.goto(`/missions/${STALE_MISSION_ID}`);
    const badge = page.getByTestId('mission-desync-badge');
    await expect(badge).toBeVisible({ timeout: 10_000 });
    await expect(badge).toContainText(/déclarée « executing »/i);
  });

  test('une mission saine ne porte aucun badge', async ({ page }) => {
    await page.goto('/missions/mission_seed_001');
    await expect(page.getByTestId('mission-desync-badge')).toHaveCount(0);
  });
});
```

- [ ] **Step 4 : lancer le smoke complet**

```bash
pnpm --filter @mas/web smoke
```

Attendu : toutes les specs vertes, dont les 3 nouvelles.

- [ ] **Step 5 : vérifier que le seed n'a rien cassé ailleurs**

```bash
pnpm -r test
```

Attendu : suites `@mas/db`, `@mas/web`, `@mas/agents`, `@mas/core`, `@mas/memory` vertes.

- [ ] **Step 6 : commit**

```bash
git add packages/db/src/seed.ts apps/web/tests/desync.spec.ts
git commit -m "test(e2e): mission zombie badgee desynchronisee" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 11 : portique final — 5 checks + cartes à jour

**Files:**
- Modify: `docs/backlog/statut-verite-reconciliation.md`
- Modify: `docs/intake/2026-08-14-cartes-a2-otakugo.md` §4 *(marquer C1 et C12 livrées dans la séquence du lot 1 ; `ROADMAP.md` ne nomme pas les cartes — vérifié : `grep -n "C12\|lot 1" ROADMAP.md` ⇒ 0 ligne)*

- [ ] **Step 1 : les 4 premiers checks en local**

```bash
pnpm -r test && pnpm lint && pnpm build && pnpm --filter @mas/web smoke
```

Attendu : quatre sorties 0. Toute erreur se corrige **ici**, pas après le push.

- [ ] **Step 2 : ouvrir la PR**

```bash
git push -u origin HEAD
```

puis créer la PR (base `main`) avec, en corps : la carte source, les deux corrections de dépendance (verdict C3, seuil 60 s), et la liste des critères de sortie cochés.

- [ ] **Step 3 : Sonar — le 5ᵉ check**

Attendre que l'analyse du sha de HEAD soit publiée, puis :

```bash
bash scripts/sonar-pr-issues.sh <numero-de-pr>
```

Attendu : sortie 0 — **zéro issue ouverte et zéro hotspot à revoir**. Un gate vert avec des smells ouverts n'est pas « fait » (CLAUDE.md §7). Pièges déjà évités dans ce plan : S6772, S6819, S6848, S7735, S7776, S5443, S5906 (`docs/knowledge/sonar-recurring-rules.md`).

- [ ] **Step 4 : cocher les critères de sortie de la carte**

Dans `docs/backlog/statut-verite-reconciliation.md`, passer le statut de `À FAIRE` à `LIVRÉ (<date>, PR #<n>)` et cocher les six cases du §Critère de sortie.

- [ ] **Step 5 : commit final**

```bash
git add docs/backlog/statut-verite-reconciliation.md docs/intake/2026-08-14-cartes-a2-otakugo.md
git commit -m "docs(backlog): C1+C12 livrees, criteres coches" -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git push
```

---

## Ce qui n'est PAS dans ce plan (et où ça part)

| Sujet | Pourquoi hors périmètre | Où |
|---|---|---|
| Heartbeat worker dédié | Rendrait la détection 60 s wall-clock honnête, mais touche `apps/worker` et une table | C1 v2 — carte à créer à la livraison |
| `reports.verdict` + branchement du fait | Colonne livrée par C3 | `docs/backlog/contrat-rapport-mission.md` travail n°6 (ajouté le 2026-08-14) |
| Statut vérité depuis le git du projet externe | Faux désyncs garantis sur un dépôt qui ne nous appartient pas (KILL évalué en A2/P1) | Hors lot 1 |
| Centre de notifications | Sur-UI hors phase (KILL évalué en A2/P15) | Non planifié |
| Colonne de statut calculé en base | Recréerait le mensonge que C1 corrige | Interdit par la carte |
