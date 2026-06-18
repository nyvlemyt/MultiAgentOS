# ECC Harvest — décisions lot rules `RP1b` (P1 : notre stack + common)

Doer : lot RP1b. Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : `intake-audit`, barre **LARGE** (P1, port en référentiel `docs/rules/<lang>/`).
Source ECC : `affaan-m/ecc` (MIT), `rules/{vue,nuxt,common}/`. Cible : `docs/rules/<lang>/<concern>.md` (doc de référence concise, PAS format skill §12).
Format calé sur l'exemplaire `docs/rules/typescript/coding-style.md` (frontmatter court + commentaire source + note overlap §7).
Recadrage transverse : MAOS = abonnement (§11), zéro chiffre €/$, quota uniquement. Cockpit MAOS = Next.js (§2) → `vue`/`nuxt` sont de l'**arsenal** pour projets externes enregistrés, pas pour `apps/web`.
Sanitize (secrets/PII/`@anthropic-ai/sdk`) : 20/20 fichiers sources clean (aucun secret, aucun import SDK ; les `VITE_*`/`runtimeConfig` ne sont que des *exemples pédagogiques* d'anti-pattern, pas des secrets réels).

---

## Pack `vue` — verdict : KEEP 5/5

Pack haute qualité, non-stub, performant, à forte valeur de domaine. Aucun duplicate côté MAOS (cockpit = Next.js/React). Barre large → tout gardé comme arsenal Vue.

- `coding-style` → **keep**. SFC `<script setup lang="ts">`, discipline réactivité (`.value`, pas de destructure de `reactive`/store sans `toRefs`), `computed` pur, `vue-tsc`. Porté → `docs/rules/vue/coding-style.md`.
- `hooks` → **keep**. Hooks harnais PostToolUse (`vue-tsc --noEmit`, eslint-plugin-vue, ordre lint→format→typecheck). Ajout MAOS : `timeout` sur le typecheck (cohérence avec doctrine hooks commune). Porté → `docs/rules/vue/hooks.md`.
- `patterns` → **keep**. Composables (`MaybeRefOrGetter`/`toValue`), provide/inject typé, Pinia setup-stores, vue-router lazy + guard, vue-query (ref dans la queryKey, jamais `.value`). Porté → `docs/rules/vue/patterns.md`.
- `security` → **keep**. XSS Vue (`v-html`/DOMPurify, `:is` non-contrôlé, `javascript:` URLs, `:style` exfil, secrets `VITE_*`). Recadré : complète le gating §5, ne le remplace pas. Porté → `docs/rules/vue/security.md`.
- `testing` → **keep**. Vitest + `@vue/test-utils`, interface publique only, Pinia `createTestingPinia`. Vitest = runner MAOS (§7) → conventions transférables. Porté → `docs/rules/vue/testing.md`.

§7 candidate deltas (vue) : aucun spécifique — la valeur Vue est par nature framework-locale.

---

## Pack `nuxt` — verdict : KEEP 5/5

Pack dense, à forte valeur de domaine (SSR/Nitro = sujets piégeux). Aucun duplicate côté MAOS. Barre large → tout gardé comme arsenal Nuxt.

- `coding-style` → **keep**. Layout `app/`, discipline auto-imports, séparation `nuxt.config`/`runtimeConfig`/`app.config` (secrets root-only), macros compile-time. Porté → `docs/rules/nuxt/coding-style.md`.
- `hooks` → **keep**. `nuxi typecheck` (timeout), `@nuxt/eslint` module, chaîne lint→typecheck. Porté → `docs/rules/nuxt/hooks.md`.
- `patterns` → **keep**. Choix `useFetch`/`useAsyncData`/`$fetch` par timing de rendu, `useState` SSR-safe (anti-leak module-scope `ref`), routes Nitro, middleware, hydratation `devalue`. Porté → `docs/rules/nuxt/patterns.md`.
- `security` → **keep**. `runtimeConfig` public vs privé, validation h3 (`readValidatedBody`…), fuite payload SSR, passthrough cookie, **SSRF sur `$fetch` serveur** (allowlist host). Recadré : complète §5. Porté → `docs/rules/nuxt/security.md`.
- `testing` → **keep**. `@nuxt/test-utils` (`mountSuspended`, `mockNuxtImport`, `registerEndpoint`), E2E Playwright. Porté → `docs/rules/nuxt/testing.md`.

§7 candidate deltas (nuxt) : 1 candidat transverse (non framework-spécifique) — voir section §7 ci-dessous, item **SSRF/egress allowlist** (résonne avec `allowed_hosts` §5 / `config/permissions.json`).

---

## Pack `common` — verdict : KEEP 9/10, REJECT 1

Doctrine stack-agnostique. Dédup serré contre §7 (qui couvre déjà : Conventional Commits ≤60, Vitest/TDD, pas de commentaires sauf WHY, pas de fichier top-level sans MAJ §3, pas d'op destructive silencieuse, vérif 5-checks). Gardé uniquement le delta non-évident.

- `agents.md` → **reject** (dup-no-better). Roster d'agents ECC générique (`~/.claude/agents/` : planner/architect/tdd-guide/reviewers…). MAOS a son propre roster dans `AGENTS.md` (56 agents + 7 fiches Tier B) + dispatcher + mission lifecycle. La lentille « exécution parallèle d'agents indépendants » est déjà chez nous (`superpowers:dispatching-parallel-agents` + dispatcher multi-projet). Zéro delta portable. Pas de fichier écrit.
- `code-review` → **keep**. Delta = matrice de sévérité CRITICAL/HIGH/MEDIUM/LOW (→ mappe PASS/NEEDS_WORK/BLOCK de `mas-reviewer`) + seuils binaires (fn<50, fichier<800, nesting>4, coverage 80%) + triggers de revue sécurité (mappent §5). §7 n'a aucun seuil. Porté → `docs/rules/common/code-review.md`. **§7 candidate.**
- `coding-style` → **keep**. Delta = KISS/DRY/YAGNI, immutabilité-par-défaut, naming, seuils taille fichier/fn. §7 ne couvre pas le style au niveau langage. Porté → `docs/rules/common/coding-style.md`. **§7 candidate (immutabilité + seuils).**
- `development-workflow` → **keep**. Delta fort = étape 0 « Research & Reuse FIRST » (chercher repos/registries avant d'écrire) — généralise §9.bis Voie 2 à TOUT le code. Porté → `docs/rules/common/development-workflow.md`. **§7 candidate.**
- `git-workflow` → **keep (reframe + flag conflit)**. §7 couvre déjà Conventional Commits. Source ECC dit « Attribution disabled » → **CONTREDIT** la doctrine MAOS (Co-Authored-By obligatoire + ligne PR générée). Gardé uniquement le delta PR (`git diff base...HEAD`, historique complet, `-u`) + note explicite « ne pas porter la désactivation d'attribution ». Porté → `docs/rules/common/git-workflow.md`.
- `hooks` → **keep**. Delta = taxonomie Pre/Post/Stool + « jamais `dangerously-skip-permissions`, préférer allowlist » (résonne §5). Porté → `docs/rules/common/hooks.md`.
- `patterns` → **keep**. Delta = Repository pattern + enveloppe API + skeleton-first (résonne §9.bis). Arsenal générique réutilisable. Porté → `docs/rules/common/patterns.md`.
- `performance` → **keep (reframe lourd)**. Source framée en « 3x cost savings » $ → recadré quota/§11. Garde la sélection d'effort (mappe le routage 3-tiers `risk_*→model`) + discipline context-window + extended-thinking budget. Porté → `docs/rules/common/performance.md`.
- `security` → **keep**. Delta = checklist pré-commit (secrets, validation, SQLi, XSS, CSRF, rate-limit, fuite d'erreurs). §5/§7 n'énumèrent pas ces vecteurs app-level. Recadré : complète §5/`mas-sec-reviewer`. Porté → `docs/rules/common/security.md`. **§7 candidate.**
- `testing` → **keep (delta only)**. §7 couvre déjà Vitest/TDD. Gardé : plancher coverage 80%, triptyque unit/integration/e2e, structure AAA, naming descriptif. Porté → `docs/rules/common/testing.md`.

---

## CLAUDE.md §7 candidate deltas (à distiller — NON édité par ce Doer)

Règles non-évidentes (surtout `common/`) qui mériteraient de durcir CLAUDE.md §7. **Proposition seulement** ; décision/édition = main session.

1. **Seuils de revue binaires** (de `code-review` + `coding-style`) : fonctions <50 lignes, fichiers <800, nesting ≤4, coverage ≥80%. §7 mandate la vérification mais sans seuils chiffrés ; les ajouter rendrait `mas-reviewer` déterministe. *Fit : §7 (Conventions/Tests).*
2. **Immutabilité par défaut** (de `coding-style`) : « créer un nouvel objet, ne pas muter » comme règle de style transverse. L'orchestrateur passe de l'état entre agents → l'immutabilité réduit les effets de bord cachés. §7 ne le dit pas explicitement. *Fit : §7 ou §6.*
3. **Research-&-Reuse FIRST** (de `development-workflow`) : ériger §9.bis (Voie 2, webuis) en règle générale « chercher un repo/lib existant avant d'écrire du net-new » pour tout le code MAOS, pas seulement le bridge SDK. *Fit : généralise §9.bis vers §7.*
4. **Checklist sécurité pré-commit app-level** (de `security`) : secrets/validation/SQLi/XSS/CSRF/rate-limit en complément du gating §5 (qui couvre les *actions* risquées, pas les *vulnérabilités de code*). *Fit : §5/§7.*
5. **Egress allowlist comme doctrine de code** (de `nuxt/security` SSRF) : « jamais d'input utilisateur dans une URL/host de fetch serveur ; allowlist » — résonne directement avec `allowed_hosts` / `config/permissions.json` (§5). Candidat à mentionner dans §5 plutôt que §7. *Fit : §5.*

**Anti-delta (à NE PAS porter)** : `git-workflow` « Attribution disabled » contredit la règle MAOS Co-Authored-By — signalé, exclu.

---

## Sanitize & conformité

- Secrets/PII : 20/20 fichiers sources clean. Les occurrences `VITE_*` / `runtimeConfig.public` / `import.meta.env` sont des **exemples d'anti-pattern** (quoi NE PAS exposer), pas des valeurs réelles → conservées telles quelles dans les docs sécurité.
- `@anthropic-ai/sdk` : absent des 20 sources. Aucun import introduit. `performance` mentionne le routage modèle mais sans aucun import SDK (prose only).
- Recadrage §11 : `common/performance` (seul fichier à framing $) recadré en quota units.
- Format : frontmatter court + commentaire source + note overlap §7, calé sur l'exemplaire `docs/rules/typescript/coding-style.md`. Doc de référence, PAS skill §12.

## Bilan écritures

19 fichiers règle écrits sous `docs/rules/` (vue 5, nuxt 5, common 9) + ce shard. 1 rejet (`common/agents`). Aucune édition de `ledger.tsv`, `CLAUDE.md`. Aucun `git add/commit`.
