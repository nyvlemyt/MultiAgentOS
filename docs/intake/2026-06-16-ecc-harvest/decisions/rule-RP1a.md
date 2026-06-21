# ECC Harvest — décisions lot RP1a (rules P1 — notre stack)

Doer: lot RP1a (packs langage **typescript**, **web**, **react**). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Méthode: `intake-audit` barre LARGE, **un audit par pack de langage** (3 audits), pas par fichier.
Source ECC: `affaan-m/ecc` (MIT). Cible: `docs/rules/<lang>/<concern>.md` (doc de référence concise, PAS format §12 skill — ce sont des standards de code).
Recadrage transverse: MAOS = abonnement Claude Code (§11), jamais de chiffres $/€ → toute métrique de coût = unités de quota.
Sanitize (secrets/PII/`@anthropic-ai/sdk`): 17/17 sources clean (aucun secret réel, aucun import SDK; les `sk-proj-xxxxx` sont des placeholders pédagogiques d'un fichier *security* montrant quoi NE PAS faire — conservés tels quels comme contre-exemples).

---

## Pack `typescript` — verdict: **adapt** (2 gardés / 5)

Le pack porte directement sur notre stack (§2). `coding-style` et `patterns` sont des standards substantiels, non-stub, non-dup (CLAUDE.md §7 ne couvre pas types/immutabilité/validation Zod/envelope). Les trois autres fichiers sont des stubs qui pointent vers des agents ECC qu'on n'a pas (`security-reviewer`, `e2e-runner`) → rejetés comme fichiers, mais leur signal non-trivial est remonté en delta §7.

| Fichier | Décision | Raison |
|---|---|---|
| `coding-style.md` | **gardé** → `docs/rules/typescript/coding-style.md` | Standard riche: types sur API publiques / infer en local, `interface` vs `type`, ban `any`→`unknown`, immutabilité, error-handling narrow, validation Zod `safeParse`, no `console.log`. Reframe: unions de littéraux préférées (round-trip SQLite/SSE), `unknown` pour sortie LLM/SSE, logger projet. |
| `patterns.md` | **gardé** → `docs/rules/typescript/patterns.md` | Envelope `ApiResponse<T>` (+ durcie en union discriminée `Result<T>`), custom-hook pattern, Repository pattern recadré sur Drizzle/`packages/db` testable via mock. Non-dup, réutilisable. |
| `hooks.md` | rejeté | Stub: 12 lignes de config de hooks Claude Code (`~/.claude/settings.json`) prettier/tsc/console.log. Le pack `web/hooks.md` couvre la même chose en mieux (incremental+timeout, garde-fous). Le seul délta utile (audit `console.log` au Stop) est déjà acté dans coding-style + delta §7. |
| `security.md` | rejeté | Stub: secret en env var (déjà §11/§5 chez nous, en plus strict) + pointeur vers agent `security-reviewer` inexistant. Dup-no-better de `mas-sec-reviewer` + §11. |
| `testing.md` | rejeté | Stub 7 lignes: "use Playwright" + pointeur agent `e2e-runner` inexistant. Couvert mieux par `web/testing.md` + `react/testing.md` (gardés). Vitest est déjà notre standard (§7). |

KILL appliqués: stubs (3 rejets) ; aucune violation §11 (pas de PAYG, pas d'import SDK) ; pas de paid-API.

---

## Pack `web` — verdict: **adapt** (7 gardés / 7)

Pack entièrement substantiel et on-stack (Next.js 15 / Tailwind, §2). Tout gardé, chaque fichier durci + recadré MAOS.

| Fichier | Décision | Raison / reframe |
|---|---|---|
| `coding-style.md` | **gardé** → `docs/rules/web/coding-style.md` | File-org par feature, design tokens CSS/Tailwind, propriétés compositor-friendly, HTML sémantique d'abord, naming. Reframe: Tailwind = couche primaire, tokens dans theme config + `:root`. |
| `design-quality.md` | **gardé** → `docs/rules/web/design-quality.md` | Anti-template policy (banned patterns + 10 required qualities + checklist). TRÈS pertinent: le reskin shell a été rejeté "colors≠design 3/10". Reframe: le dark-only du cockpit = choix intentionnel assumé, pas le "default to dark" que la règle blâme. |
| `hooks.md` | **gardé** → `docs/rules/web/hooks.md` | Hooks éditeur Claude Code (format/lint/tsc incremental+timeout, garde 800-lignes, build au Stop). Durci §5: **interdiction explicite** `npx` distant / `curl\|sh`, `pnpm` repo-owned only. Meilleur que `typescript/hooks.md` (rejeté) → ce fichier le supplante. |
| `patterns.md` | **gardé** → `docs/rules/web/patterns.md` | Compound components, table state-management (server/client/url/form), URL-as-state, data-fetching (SWR/optimistic/parallel). Reframe: filtre projet/mission + tab actifs → URL dans le cockpit. |
| `performance.md` | **gardé** → `docs/rules/web/performance.md` | Cibles CWV + budgets bundle + loading/image/font/anim. Standard chiffré clair, aucun reframe nécessaire (chiffres = perf, pas coût $). |
| `security.md` | **gardé** → `docs/rules/web/security.md` | CSP nonce, XSS, headers HTTPS, forms CSRF/rate-limit. Reframe: `connect-src` ↔ `config/permissions.json#allowed_hosts` (§5) cohérents. |
| `testing.md` | **gardé** → `docs/rules/web/testing.md` | Priorité visual-regression / a11y / perf / cross-browser / responsive + shape E2E Playwright. Reframe: étendre le check `@mas/web smoke`, pas le contourner ; Vitest+RTL = standard unit (§7). |

KILL appliqués: aucun stub ici ; aucune violation §11/§5 ; `sk-proj-xxxxx`/secret = contre-exemples pédagogiques conservés. 0 rejet.

---

## Pack `react` — verdict: **adapt** (5 gardés / 5)

Pack le plus riche et le plus directement on-stack: React 19 + Next.js 15 App Router / RSC = exactement notre §2. Tout gardé, durci, recadré.

| Fichier | Décision | Raison / reframe |
|---|---|---|
| `coding-style.md` | **gardé** → `docs/rules/react/coding-style.md` | Extensions de fichiers, naming (handlers/booleans/context), shape composant (`type Props`, destructure), JSX, frontière Server/Client RSC, imports, state, class-components interdits. Reframe: repo TS-only → ne pas ajouter `.jsx`. |
| `hooks.md` | **gardé** → `docs/rules/react/hooks.md` | Rules of hooks, `useEffect` when-NOT (gold), dep arrays, cleanup, memo-discipline (default: ne pas mémoïser), custom-hooks when/when-not, `useSyncExternalStore`, ajouts React 19, stale-closure, config lint. Aucun reframe nécessaire — directement applicable. |
| `patterns.md` | **gardé** → `docs/rules/react/patterns.md` | Container/présentational, arbre de décision state-location, frontière RSC + `import 'server-only'` (renforce §11), Suspense+ErrorBoundary, forms (uncontrolled/controlled/lib), data-fetching, keys, composition, compound, portals, refs React 19. Reframe: ErrorBoundary → réutiliser le `ErrorState`/`error.tsx` déjà standardisé dans le cockpit. |
| `security.md` | **gardé** → `docs/rules/react/security.md` | `dangerouslySetInnerHTML`, schémas URL unsafe, `target=_blank rel`, validation Server Action (Zod safeParse + authz), fuite secret via env, auth/localStorage, CSP, prototype-pollution, SSR injection, 3rd-party, source maps. Reframe MAOS: `ANTHROPIC_API_KEY`/clés provider jamais `NEXT_PUBLIC_*` ni côté client (§11). |
| `testing.md` | **gardé** → `docs/rules/react/testing.md` | RTL+Vitest (= notre §7), priorité requêtes par rôle, `userEvent`, async findBy/waitFor, MSW, anti-snapshot, renderHook+act, axe a11y, cibles de couverture, anti-patterns. Reframe: Vitest = le runner du repo. |

KILL appliqués: aucun stub ; aucune violation §11/§5 ; 0 rejet.

---

## Récapitulatif des verdicts

| Pack | Verdict | Gardés / total |
|---|---|---|
| typescript | adapt | 2 / 5 |
| web | adapt | 7 / 7 |
| react | adapt | 5 / 5 |
| **TOTAL** | — | **14 / 17** |

3 rejets, tous dans `typescript` (stubs `hooks`/`security`/`testing`), tous supplantés par des fichiers gardés des packs `web`/`react` ou déjà couverts par §7/§11/§5.

---

## CLAUDE.md §7 candidate deltas

Règles **non-évidentes** issues de ces packs qui méritent d'être distillées dans CLAUDE.md §7 (Conventions). La session principale appliquera — **je n'édite pas CLAUDE.md** pour éviter les conflits d'écriture. §7 actuel couvre déjà: Conventional Commits ≤60, Vitest+TDD, pas de commentaires sauf WHY non-évident, pas de fichiers top-level, pas d'op destructive silencieuse, vérification 5 checks. Ne PAS dupliquer ces points.

1. **`unknown` (jamais `any`) pour toute entrée non fiable** — sortie LLM, trames SSE, corps de requête : narrower avant usage. (`typescript/coding-style`)
2. **Valider aux frontières de confiance avec Zod `safeParse`** (request handlers, Server Actions, JSON LLM) ; le type se dérive du schéma via `z.infer` (source unique). (`typescript/coding-style`, `react/security`)
3. **Unions de littéraux préférées aux `enum`** — round-trip propre en colonnes SQLite/Drizzle et payloads SSE. (`typescript/coding-style`)
4. **Pas de `console.log` dans le code commité** — passer par le logger projet (web/worker), pas `console` nu ; audit possible au hook Stop. (`typescript/coding-style`)
5. **Server Component par défaut ; `"use client"` en ligne 1** seulement si state/effects/refs/browser/handlers ; ne jamais re-exporter du server-only via un module client (le bundler l'inclut silencieusement) ; marquer les modules sensibles `import 'server-only'`. (`react/coding-style`, `react/patterns`)
6. **`ANTHROPIC_API_KEY` et clés provider jamais `NEXT_PUBLIC_*` ni côté client** — renforce §11 au niveau composant/bundle ; auditer chaque PR touchant des env vars. (`react/security`)
7. **`useEffect` = synchronisation externe uniquement** — pas pour état dérivé / transformation / reset-on-prop / notifier le parent : calculer pendant le render. Défaut : **ne pas mémoïser** (`useMemo`/`useCallback` seulement si profilé ou identité requise par un enfant `React.memo`). (`react/hooks`)
8. **`key` de liste stable, jamais l'index** dès qu'une liste peut être réordonnée/insérée/supprimée. (`react/patterns`)
9. **Hooks éditeur Claude Code : `pnpm` repo-owned only — interdiction `npx` distant / `curl|sh`** (§5) ; `tsc` en `--incremental` + `timeout` pour éviter l'accumulation de process orphelins. (`web/hooks`)
10. **Anti-template comme critère de done UI** : une surface frontend livrée doit démontrer ≥4 qualités intentionnelles (hiérarchie, rythme, profondeur, états hover/focus designés…) — pas un défaut Tailwind/shadcn brut. Évite la récidive du reskin "colors≠design 3/10". (`web/design-quality`)
11. **CSP `connect-src` ↔ `config/permissions.json#allowed_hosts` cohérents** ; pas de `unsafe-inline`/`unsafe-eval` en `script-src`, nonces par requête pour le SSR. (`web/security`, `react/security`)

Total deltas §7 candidats : **11**.

