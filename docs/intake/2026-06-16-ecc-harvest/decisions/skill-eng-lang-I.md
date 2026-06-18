# ECC Harvest — décisions cluster `skill:eng-lang` (lot I — JS/TS frontend)

Doer: lot eng-lang-I (8 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T2, library).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B), CLUSTERS.md (barre large), CLAUDE.md §2/§7/§11/§12.
Notre stack EST Next.js 15 / React / Tailwind (§2). Donc react-* / nextjs / vite = haute-affinité; vue / nuxt / angular = arsenal hors-stack (la spécificité-domaine n'est PAS un motif de rejet — barre large). Aucun de ces 8 n'est un dup d'un skill `.claude/skills/` existant (`frontend-design` = génération UI générique, pas patterns de framework).
Recadrage transverse: MAOS = abonnement (§11). Tout chiffre de coût = unités de quota, jamais $/€. Exécutions externes (`npx @angular/cli …`, `ng new`) et egress = strippées des corps (guidance, pas exécution).
Sanitize (regex secrets/PII/internal + `@anthropic-ai/sdk`): 8/8 sources clean — aucun secret, aucun import SDK Anthropic.

---

## react-patterns
- **décision**: adapt
- **raison**: doctrine de composants React 18/19 (render = fonction pure, effets hors-render, arbre de décision d'emplacement d'état, frontière RSC server/client, Suspense+ErrorBoundary scoped, form actions React 19, matrice data-fetch, compose-over-inherit, a11y-first). Haute-affinité: c'est exactement notre stack `apps/web` (§2).
- **dedup**: non — aucun skill `.claude/skills/` ne couvre les patterns React; `frontend-design` = génération UI générique, pas discipline de composants. Delta non-obvious = arbre d'état + frontière RSC + boundaries scoped.
- **chemin library**: `packages/skills/library/react-patterns/SKILL.md`
- **état**: boosté §12, conforme (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline verbatim, 7 sections §12). 0 secret, 0 import SDK. Re-audit: si React publie une version majeure changeant le modèle RSC/forms.

## react-performance
- **décision**: adapt
- **raison**: catalogue perf React/Next ordonné par impact (~70 règles, 8 catégories), adapté de Vercel Labs `react-best-practices` (MIT). Sert directement §2 (stack) + §6/§7 (discipline perf). La valeur = l'ORDRE (waterfalls + bundle d'abord, micro-perf en dernier), pas la liste brute.
- **dedup**: non — aucun skill perf React chez nous. Cross-link conceptuel avec `react-patterns` (forme) mais lentille distincte (optimisation d'un arbre fonctionnel).
- **chemin library**: `packages/skills/library/react-performance/SKILL.md`
- **état**: boosté §12, conforme (ligne 1 `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim, 7 sections §12). Attribution Vercel MIT préservée dans Principles. 0 secret, 0 import SDK. Re-audit: à l'arrivée stable du React Compiler (les règles `rerender-*` passent en review-only).

## react-testing
- **décision**: adapt
- **raison**: doctrine de test React behaviour-first (RTL queries par accessibilité, userEvent, async matchers, MSW network-layer, jest-axe, renderHook). S'aligne directement sur §7 (Vitest + TDD): c'est le "comment" opératoire de notre mandat de test.
- **dedup**: non — `webapp-testing` chez nous = Playwright/local app (E2E), pas tests unitaires de composants RTL. Frontière RTL-vs-Playwright explicitée dans le corps. Complémentaire, pas dup.
- **chemin library**: `packages/skills/library/react-testing/SKILL.md`
- **état**: boosté §12, conforme (ligne 1 `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim, 7 sections §12). 0 secret, 0 import SDK. Re-audit: si RTL/MSW changent d'API majeure.

## vue-patterns
- **décision**: adapt
- **raison**: doctrine Vue 3 Composition-API riche et à jour (script setup, composables-vs-mixins, table de décision d'état, Pinia setup-store, Vue Router, APIs Vue 3.5+, table d'anti-patterns dont XSS v-html). Hors-stack React (§2) mais fort dans son domaine → gardé sous la barre large (arsenal pour missions Vue/Nuxt).
- **dedup**: non — aucun skill Vue chez nous. Découpage net avec `nuxt4-patterns` (SSR) et `vite-patterns` (build).
- **chemin library**: `packages/skills/library/vue-patterns/SKILL.md`
- **état**: boosté §12, conforme (ligne 1 `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim, 7 sections §12). 0 secret, 0 import SDK. Re-audit: à la prochaine majeure Vue.

## nuxt4-patterns
- **décision**: adapt
- **raison**: doctrine SSR Nuxt 4 solide (sécurité d'hydratation, routeRules par groupe prerender/swr/isr/ssr:false, useFetch/useAsyncData SSR-safe, lazy hydration). Hors-stack React (§2) mais fort dans son domaine → arsenal. Colonne vertébrale = SSR == hydraté.
- **dedup**: non — superpose le spécifique Nuxt sur `vue-patterns` (fondamentaux) et complète `vite-patterns` (build). Aucun dup.
- **chemin library**: `packages/skills/library/nuxt4-patterns/SKILL.md`
- **état**: boosté §12, conforme (ligne 1 `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim, 7 sections §12). 0 secret, 0 import SDK. Re-audit: à la prochaine majeure Nuxt.

## nextjs-turbopack
- **décision**: adapt (lean)
- **raison**: source la plus mince du lot et version-volatile (Next 16, beaucoup de "check the docs"), MAIS non-stub et non-dup: contient un delta factuel réel — Turbopack par défaut en dev + FS cache + la règle `proxy.ts` (ne PAS renommer en `middleware.ts`, sinon le middleware casse). MAOS est sur Next 15 → forward-looking pour `apps/web`, immédiatement utile sur projets Next 16+. Discipline injectée = version-check-first.
- **dedup**: non — aucun skill bundler Next chez nous. Forme allégée vs les autres (surface réduite), pas gonflée artificiellement.
- **chemin library**: `packages/skills/library/nextjs-turbopack/SKILL.md`
- **état**: boosté §12, conforme (ligne 1 `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim, 7 sections §12 — Principles à 6 items, justifié par la surface). 0 secret, 0 import SDK. Re-audit: à chaque majeure Next (surface volatile).

## vite-patterns
- **décision**: adapt
- **raison**: doctrine build/dev-server Vite 8+ très riche. Plus haute valeur = surface sécurité (frontière VITE_ non-secure, piège loadEnv('') exposant les secrets) + gap silencieux de type-check de `vite build` — alignés sur §11 (zéro fuite secret) et §7 (type-check en CI). Hors-stack Next mais arsenal (build derrière la plupart des missions Vue/SPA/lib).
- **dedup**: non — aucun skill Vite chez nous; renvoie à `nextjs-turbopack` (bundler Next) pour découper les lentilles.
- **chemin library**: `packages/skills/library/vite-patterns/SKILL.md`
- **état**: boosté §12, conforme (ligne 1 `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim, 7 sections §12). 0 secret réel (les `VITE_`/`.env` mentionnés = règles de doctrine, pas des valeurs), 0 import SDK Anthropic. Re-audit: à la prochaine majeure Vite.

## angular-developer
- **décision**: adapt (reframe lourd)
- **raison**: source = skill "reference-router" (corps surtout `Read [references/X.md]` vers des fichiers ABSENTS de /tmp + commandes d'exécution `npx @angular/cli`/`ng new`/`ng build`). Le delta autonome réel = modèle de réactivité signal-first (signal/computed/linkedSignal/resource, ne pas abuser de effect), décision forms (signal forms), DI inject(), table d'anti-patterns. Hors-stack mais fort en domaine → arsenal sous barre large.
- **dedup**: non — aucun skill Angular chez nous.
- **sanitize/strip**: pointeurs `references/*.md` cassés SUPPRIMÉS (non distribués); instructions d'exécution shell externe (`npx`, `ng new/build`) STRIPPÉES → recadrées en "action gated §4/§5" (MAOS conseille le code, n'exécute pas le shell hors gate). Aucun egress, aucun import SDK.
- **chemin library**: `packages/skills/library/angular-developer/SKILL.md`
- **état**: boosté §12, conforme (ligne 1 `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim, 7 sections §12). 0 secret, 0 import SDK, 0 commande d'exécution externe résiduelle. Re-audit: à la prochaine majeure Angular.

---

## Bilan lot eng-lang-I
- **8 items audités → 8 keepers (adapt), 0 reject.** Tous écrits en `packages/skills/library/<slug>/SKILL.md`, forme exemplaire (ligne 1 `---`, commentaire source `affaan-m/ecc`, summary L1 ≤200 tok, metadata {origin/license:MIT/cluster:skill:eng-lang/tier:T2/status:library}, Prompt Defense Baseline verbatim, 7 sections §12 dont Overview+Principles cités+Process+Rationalizations table+Red Flags+Verification Criteria binaires).
- **Dedup**: aucun des 8 n'est un dup d'un skill `.claude/skills/` existant. react-*/nextjs/vite = haute-affinité §2; vue/nuxt/angular = arsenal hors-stack gardé sous barre large.
- **Recadrage MAOS appliqué partout**: zéro $/€ (abonnement §11), zéro import `@anthropic-ai/sdk`, exécutions externes Angular strippées → gated §4/§5, surface sécurité Vite (VITE_/loadEnv) alignée §11, type-check CI aligné §7.
- **Sanitize**: 8/8 sources clean. angular-developer = seul strip notable (pointeurs references cassés + commandes `npx/ng` exec).
