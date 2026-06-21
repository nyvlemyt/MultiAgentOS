# ECC Harvest — décisions cluster `agent:resolver` (lot agents, audit PATTERN)

Doer: les 12 agents `*-build-resolver` d'ECC. Worktree `maos-ecc`. Méthode: **un seul** `intake-audit` au niveau du PATTERN (pas 12 fiches). Barre LARGE (cf. CLUSTERS.md §acceptance).
Source ECC: `affaan-m/ecc` (MIT). Sources lues (4 représentatives): `build-error-resolver`, `rust-build-resolver`, `react-build-resolver`, `java-build-resolver` (+ `harmonyos-app-resolver` pour le cas niche).
Cible: **UN** template paramétré `packages/agents/library/build-resolver.md` (Tier B, `domains:[code-execution]`), `stack` ∈ {cpp, dart, django, go, java, kotlin, pytorch, react, rust, swift, harmonyos, generic}.
Dedup contre `packages/agents/fiches/` (7 Tier A: mission-planner, skill-router, context-manager, memory-keeper, reviewer, quality-controller, sec-reviewer): **net-new** — aucun build-resolver existant. Chevauchement partiel seulement: `reviewer`/`quality-controller` lisent un diff *après* build vert; ce cluster *produit* le build vert. Pas de dup.
Sanitize (regex secrets/PII/internal): 12/12 clean. `@anthropic-ai/sdk`: absent des sources. Aucun appel réseau autonome, aucune clé.

---

## Audit du pattern (décision unique)

- **décision**: **adopt-pattern** → un seul template `build-resolver.md`.
- **raison**: les 12 sources sont la **même** machine — `lire l'erreur de build → localiser file:line → diff minimal root-cause → re-run → re-diagnostiquer`, discipline « surgical, no refactor, never mask », mêmes stop-conditions (3 essais, plus d'erreurs créées que résolues, besoin architectural). Seuls **deux** axes varient: (a) la commande toolchain, (b) les classes de panne typiques. C'est exactement un patron paramétrable: 1 fiche + 1 `Stack Matrix` (12 lignes) couvre tout. Écrire 12 fiches = duplication pure et dette de maintenance ×12.
- **§5 (exec gated)**: une fiche qui **lance des commandes de build/test/lint** = capacité shell `scoped` + `fs_write: scoped` (sandbox projet uniquement), et toute récupération destructive (`rm -rf node_modules`, `cargo clean`, wipe cache) ou install réseau de dépendance = **human-gated**. Encodé dans `permissions`, `limits`, `escalate_when`, Principe 5, Red Flags et Verification Criteria. `model: claude-sonnet-4-6`. Outils = 6 (Read, Write, Edit, Bash, Grep, Glob) ≤ 7. ✔
- **§11**: aucun import SDK PAYG, zéro chiffre cash; exécution = Claude-only (cohérent §11.bis clause 4: les tâches I/O fichier/bash/git sont Claude-only). ✔
- **§12**: corps réécrit au format fiche + L1 summary + Principles (source citée) + Process + Rationalizations + Red Flags + Verification Criteria binaires. ✔
- **dedup**: net-new vs fiches Tier A; pas de dup-no-better. `reviewer`/`quality-controller` interviennent *après* build vert (frontière nette dans «When NOT to Use» + «Related»).
- **chemin library**: `packages/agents/library/build-resolver.md`.
- **état**: template écrit, conforme (ligne 1 = `---`, frontmatter Tier B, commentaire source `// pattern from affaan-m/ecc agents/*-build-resolver.md`, Prompt Defense Baseline présent, 12-row Stack Matrix, 0 sdk, 0 secret).

---

## Décisions par agent (les 12)

- **build-error-resolver** — adopt-pattern → `build-resolver.md` (`stack: generic`). C'est l'**umbrella** TS/build; sert de cas de base que les per-stack paramétrisent.
- **cpp-build-resolver** — adopt-pattern → `build-resolver.md` (`stack: cpp`): cmake/make, `undefined reference`, templates, include paths.
- **dart-build-resolver** — adopt-pattern → `build-resolver.md` (`stack: dart`): pub/analyze, null-safety, Flutter widget, `build_runner`.
- **django-build-resolver** — adopt-pattern → `build-resolver.md` (`stack: django`): `manage.py check`, migrations manquantes, settings/INSTALLED_APPS.
- **go-build-resolver** — adopt-pattern → `build-resolver.md` (`stack: go`): `go build/vet`, imports inutilisés, `go.mod`, interface non satisfaite.
- **java-build-resolver** — adopt-pattern → `build-resolver.md` (`stack: java`): Maven/Gradle + détection Spring/Quarkus, BOM, annotation processors, bean wiring.
- **kotlin-build-resolver** — adopt-pattern → `build-resolver.md` (`stack: kotlin`): null-safety, coroutines, KSP/kapt, version catalog Gradle.
- **pytorch-build-resolver** — adopt-pattern → `build-resolver.md` (`stack: pytorch`): import/CUDA, dtype/device/shape, drift torch/torchvision.
- **react-build-resolver** — adopt-pattern → `build-resolver.md` (`stack: react`): détection Next/Vite/webpack/CRA, hydration, frontière RSC, React dupliqué.
- **rust-build-resolver** — adopt-pattern → `build-resolver.md` (`stack: rust`): borrow checker, traits, `Cargo.toml` features/dups, edition/MSRV.
- **swift-build-resolver** — adopt-pattern → `build-resolver.md` (`stack: swift`): optionals, conformance protocole, SPM, `@available`.
- **harmonyos-app-resolver** — **adopt-pattern** → `build-resolver.md` (`stack: harmonyos`). *Mon jugement*: niche (HarmonyOS/ArkTS) mais PAS rejeté. Justification: (1) la barre d'acceptation CLUSTERS.md est BROAD — domain-specificity n'est pas un motif de reject; (2) c'est un hybride review+implement **mais** son cœur opératoire est identique au pattern — ses « erreurs de build » sont des violations de contraintes ArkTS (sous-ensemble strict de TS) surfacées par `hvigorw assembleHap`, donc lire-erreur→fix-minimal→re-build s'applique tel quel; (3) coût marginal = **une ligne** dans la Stack Matrix (classes de panne: contraintes syntaxe ArkTS, migration V1→V2 state, `@ohos.router`→Navigation, perms `module.json5`). Le rendre une ligne plutôt qu'une fiche évite à la fois le reject-niche gaspilleur et la fiche-orpheline. Le biais « refactor proactif V1→V2 » de la source est volontairement **non** repris dans le template (contredit Principe 2 « surgical, no refactor ») — conservé seulement comme classe de panne à diagnostiquer, pas comme mandat de refonte.

---

## Intégration & re-audit

- **Phase cible**: ce template Tier B `code-execution` est appelé via le dispatcher (`delegate({ agent: "build-resolver", task: { stack, ... } })`) une fois le câblage delegate-into-dispatch en place. Aucun câblage ici (hors scope Doer).
- **DoD binaire**: fichier existe, ligne 1 = `---`, frontmatter Tier B complet, Prompt Defense Baseline présent, Stack Matrix couvre les 12, 0 import `@anthropic-ai/sdk`, 0 secret, build/exec marqués scoped+gated (§5).
- **re-audit**: si ECC ajoute un `*-build-resolver` pour un stack absent de la matrice → ajouter une ligne (pas une fiche). Re-vérifier le mapping toolchain si une source amont change de commande canonique. Sinon stable.
