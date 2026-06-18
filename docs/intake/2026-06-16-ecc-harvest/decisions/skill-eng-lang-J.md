# ECC Harvest — décisions cluster `skill:eng-lang` (lot J — JS backend + runtime + motion/UI)

Doer: lot J (8 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T2, library, deep-boost).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B) + le sous-cluster motion lui-même (trio foundations/patterns/advanced vs `motion-ui` standalone).
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG. Toute discipline de coût = unités de quota, jamais $/€. Le projet externe à `projects.path` est read-only par défaut (§8) — ces skills produisent des diffs/du code *contre* ce projet, jamais d'exec/egress depuis MAOS. Tout déploiement externe (Vercel, App Store) reste hors périmètre MAOS.
Sanitize (regex secrets/PII/internal/`@anthropic-ai/sdk`): 8/8 sources clean. Aucune clé, aucun import SDK PAYG.

Barre (CLUSTERS.md): garder si (1) pas dup-and-not-better, (2) pas stub/inutile, (3) performant, (4) valeur dans son domaine. Domain-specificity n'est PAS un motif de rejet.

8 items: nestjs-patterns · bun-runtime · nanoclaw-repl · motion-advanced · motion-foundations · motion-patterns · motion-ui · liquid-glass-design.
Keepers: 6 · Rejets: 2 (`nanoclaw-repl` outil-spécifique non portable · `motion-ui` dup-not-better du trio motion).

---

## nestjs-patterns
- **décision**: adapt
- **raison**: doctrine NestJS production solide et bien structurée (modules par feature, controllers fins, un seul `ValidationPipe` global whitelist, auth 2-couches guard/service, enveloppe d'erreur unique, config validée au boot, transactions hors controllers, tests en couches). Valeur claire dans le domaine backend TS pour les projets enregistrés à `projects.path`.
- **dedup**: non — aucun de nos 24 skills / 56 agents / 7 fiches ne porte NestJS; `Backend Architect` (agent) est généraliste, ce skill est la référence opératoire framework-spécifique.
- **chemin library**: `packages/skills/library/nestjs-patterns/SKILL.md`
- **recadrage**: déploiement (l'original ne parlait pas Vercel mais "Production Defaults") laissé hors MAOS; projet externe read-only (§8); coût en quota (§11); ajout explicite "no exec/egress/deploy from MAOS" en red-flag + verification.
- **état**: boosté §12 (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline verbatim, 7 sections §12 dont Overview/Principles cité/Process/Rationalizations table/Red Flags/Verification binaire). 0 `@anthropic-ai/sdk`, 0 secret.
- **re-audit**: si une version majeure NestJS change l'API DI/pipes (>v12) ou si un agent Tier B NestJS dédié est créé (alors fusionner).

## bun-runtime
- **décision**: adapt
- **raison**: connaissance runtime utile et performante (décision Bun vs Node, migration Node→Bun, lockfile/test/bundler/API natives). Valeur dans le domaine toolchain JS/TS pour les projets enregistrés.
- **dedup**: non — aucun skill/agent ne couvre Bun ni le choix de runtime JS.
- **chemin library**: `packages/skills/library/bun-runtime/SKILL.md`
- **recadrage**: l'original mentionnait le déploiement Vercel et `bun install` exécuté — recadré: MAOS ne déploie pas, n'installe pas Bun sur l'hôte, n'exécute pas de scripts (§5/§8); produit des diffs; coût en quota (§11). Bits Vercel transformés en mention "deployment out of scope".
- **état**: boosté §12 (ligne 1 `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim, 7 sections §12 dont Process/Rationalizations table/Red Flags/Verification binaire). 0 sdk, 0 secret.
- **re-audit**: si Bun atteint la stabilité LTS large ou si le lockfile par défaut change à nouveau de format.

## nanoclaw-repl
- **décision**: reject
- **raison**: manuel d'opération d'un outil ECC-spécifique (`scripts/claw.js`, "NanoClaw v2") — un REPL maison bâti sur `claude -p` avec ses commandes `/model` `/load` `/branch` `/search` `/compact` `/export` `/metrics`. Le skill n'a de sens *que* si on possède et maintient ce binaire; MAOS ne l'a pas, ne l'adopte pas, et son moteur LLM passe par `@anthropic-ai/claude-agent-sdk` (ADR 0001), pas par un wrapper `claude -p` tiers. Le contenu réel est ~30 lignes de guidance d'usage non portable.
- **dedup**: oui sur les *concepts* — session persistante, branch, compact, export, métriques sont déjà couverts par notre modèle de sessions (worker + table jobs + SSE) et la doctrine de compaction (`agentic-engineering`). Rien d'unique ne survit hors de l'outil lui-même.
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: skill-pour-un-outil-qu'on-n'a-pas + dup-no-better des concepts de session que nous possédons déjà + couplé à `claude -p` au lieu de l'Agent SDK. Re-audit: non (le pré-requis est un binaire externe que MAOS ne reprendra pas).

## motion-foundations
- **décision**: adapt
- **raison**: couche de base d'un système motion en 3 skills (tokens partagés, presets de springs, gate `shouldAnimate()`, `prefers-reduced-motion`, états SSR-safe sans hydration warning). Très solide, performant, accessible, et aligné sur notre stack (Next.js 15 + Tailwind = consommateur canonique = le cockpit MAOS). 8 règles non-négociables.
- **dedup**: non — `frontend-design`/`UI Designer`/`UX Architect` couvrent l'esthétique/CSS, pas la doctrine d'animation `motion/react` ni les garde-fous SSR/reduced-motion/perf.
- **chemin library**: `packages/skills/library/motion-foundations/SKILL.md`
- **recadrage**: framing coût en quota (§11); reste stack-natif (aucun egress/exec). Note de dépendance trio conservée.
- **état**: boosté §12 (ligne 1 `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim, 7 sections §12 dont Principles cité/Process/Rationalizations table/Red Flags/Verification binaire). 0 sdk, 0 secret.
- **re-audit**: si `motion` (ex-framer-motion) change d'API majeure ou si React/Next change le contrat d'hydratation.

## motion-patterns
- **décision**: adapt
- **raison**: couche "UI standard" du système motion — patterns prêts à coller (button/card/modal/toast/stagger, transitions de page App Router, AnimatePresence enter/exit, scroll-reveal/progress, layout/layoutId). Bâti sur les tokens de `motion-foundations`, contrat de présence rigoureux, modale accessible par contrat.
- **dedup**: non — complète `frontend-design` (esthétique) avec la mécanique d'animation; aucun skill n'expose ces patterns motion/react.
- **chemin library**: `packages/skills/library/motion-patterns/SKILL.md`
- **recadrage**: coût en quota (§11); stack-natif, pas d'egress. Dépendance explicite à `motion-foundations` conservée.
- **état**: boosté §12 (ligne 1 `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim, 7 sections §12 dont Process/Rationalizations table/Red Flags/Verification binaire). 0 sdk, 0 secret.
- **re-audit**: lié à `motion-foundations` (même condition: API motion/Next hydratation).

## motion-advanced
- **décision**: adapt
- **raison**: couche avancée du système motion (drag/drag-to-dismiss/Reorder, gestes swipe/long-press, animations texte word/char/counter, SVG draw/morph/progress ring, hooks custom, `useAnimate` interrupt-safe, loaders). Riche, rigoureux (8 règles: touch-test, pause visibility, offset+velocity, mount-before-animate, motion-values stables, cleanup, equal-command morph).
- **dedup**: non — étage le plus avancé, aucun équivalent dans nos assets.
- **chemin library**: `packages/skills/library/motion-advanced/SKILL.md`
- **recadrage**: coût en quota (§11); stack-natif, pas d'egress. Dépendance à `motion-foundations` conservée.
- **état**: boosté §12 (ligne 1 `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim, 7 sections §12 dont Process/Rationalizations table/Red Flags/Verification binaire). 0 sdk, 0 secret.
- **re-audit**: lié au trio motion (API motion/react majeure).

## motion-ui
- **décision**: reject
- **raison**: "Motion System v4.2" standalone — un système motion monolithique React/Next.js (tokens, perf, accessibilité, device adaptation, patterns, modale complète, debugging/QA). Bon en soi, MAIS c'est un sous-ensemble plus faible et non-couché du trio `motion-foundations`/`motion-patterns`/`motion-advanced`: tokens plus pauvres (3 durées vs 5, pas de scale/spring map nommé), pas de gate `shouldAnimate()`/`useSafeMotion`, pas de séparation des responsabilités, et des `transition={{ duration: 0.2 }}` inline qui violent la règle "no inline numbers" du trio.
- **dedup**: oui — dup-and-not-better du trio que nous adoptons dans ce même lot. Garder les deux créerait deux sources concurrentes de tokens motion et des conseils contradictoires (la pire forme de dette de skill).
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: dup-not-better (le trio le supersède intégralement: tokens plus riches, layering, gates a11y/perf, zéro inline). Re-audit: non — adopter le trio rend ce skill redondant par construction. (Les rares bonus — heuristique `deviceMemory`, exemple focus-trap complet — peuvent être repris ponctuellement dans `motion-foundations`/`motion-patterns` sans garder ce skill.)

## liquid-glass-design
- **décision**: adapt
- **raison**: système de design iOS 26 Liquid Glass (SwiftUI/UIKit/WidgetKit) — couverture API concrète, container/morphing/union, modes de rendu widget, best practices et anti-patterns nets. Hors stack web MAOS, MAIS la barre LARGE garde un skill fort dans son domaine, et l'utilisateur a des projets mobiles. Domain-specificity n'est pas un motif de rejet.
- **dedup**: non — `Mobile App Builder`/`UI Designer` sont généralistes; aucun skill ne porte l'API Liquid Glass.
- **chemin library**: `packages/skills/library/liquid-glass-design/SKILL.md`
- **recadrage**: référence library mobile; MAOS produit des diffs contre le projet read-only (§8), ne build pas / ne soumet pas à l'App Store; coût en quota (§11). Red-flag + verification "no build/sign/submit from MAOS" ajoutés.
- **état**: boosté §12 (ligne 1 `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim, 7 sections §12 dont Process/Rationalizations table/Red Flags/Verification binaire). 0 sdk, 0 secret.
- **re-audit**: à la sortie d'iOS 27 ou si l'API Liquid Glass évolue (matériau encore récent).
