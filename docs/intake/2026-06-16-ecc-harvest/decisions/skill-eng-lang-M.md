# ECC Harvest — décisions cluster `skill:eng-lang` (lot M — Swift/Apple + Dart/Flutter)

Doer: lot eng-lang M (7 skills, P2). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T2 deep-boost, library).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md`: aucun skill/agent/fiche MAOS ne couvre Swift, l'écosystème Apple (actors, SwiftUI, Observation, Swift Testing, FoundationModels on-device), Dart ni Flutter (BLoC/Riverpod/Provider, GoRouter, Dio, Freezed). `Mobile App Builder` (agent) touche le mobile mais reste généraliste cross-platform sans contenu de langage idiomatique — pas de chevauchement de domaine. `claude-api` (skill) pilote l'API Anthropic; `foundation-models-on-device` pilote le LLM **on-device d'Apple** (FoundationModels, iOS 26), modèle distinct, exécuté localement, sans réseau ni clé — zéro collision. 7 nouveaux domaines, zéro collision.
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG. Aucun de ces 7 skills ne parle de coût LLM cash; `foundation-models-on-device` mentionne un quota de tokens *du modèle on-device d'Apple* (fenêtre 4 096 tokens, contrainte device) — c'est une limite matérielle locale, jamais une facturation per-token: recadrage en `quota_units`/contrainte-device explicité dans le corps, aucune dépense $/€. Strip exec/egress externe: rien à retirer (Gradle/SPM/CI = documentaire, non exécuté par MAOS; Dio/Ktor = patterns réseau de l'app cible, pas des appels MAOS). Durcissement sécurité appliqué: secrets/clés API jamais en clair → secure storage (Keychain/EncryptedSharedPreferences) + `--dart-define`/`${ENV}` documentaires (§5/§11); validation/sanitization des deep-links et des entrées (§5).
Sanitize (regex secrets/PII/internal): 7/7 sources clean (emails = `alice@example.com`/`user@test.com` factices; aucun secret en clair, uniquement des placeholders et des règles d'interdiction). `@anthropic-ai/sdk`: absent des 7 sources.
Barre BROAD (CLUSTERS.md): garder tout skill non-dup, non-stub, performant, à valeur dans son domaine — la spécificité domaine n'est PAS un motif de rejet. Les 7 sont des packs idiomatiques denses, runnable, à jour (Swift 6.2 Approachable Concurrency, Observation `@Observable`, Swift Testing, FoundationModels iOS 26, Dart 3 patterns/records, Flutter 3.7+ `context.mounted`, Riverpod codegen, GoRouter). → 7 keepers.

---

## swift-actor-persistence
- **décision**: adapt
- **raison**: pattern de référence pour une couche de persistance Swift thread-safe via le modèle d'acteur (`actor LocalRepository<T: Codable & Identifiable>`, cache mémoire O(1) sur fichier, écriture `.atomic`, load synchrone en `init`, `Sendable` à la frontière, API minimale, view model `@Observable`). Élimine les data races à la compilation sans lock ni DispatchQueue. Arsenal d'ingénierie iOS/macOS dense et runnable.
- **dedup**: non — aucun skill/agent MAOS ne couvre Swift ni les acteurs; `Mobile App Builder` reste généraliste sans contenu langage. État MAOS = `data/` (Drizzle/SQLite), domaine distinct.
- **chemin library**: `packages/skills/library/swift-actor-persistence/SKILL.md`
- **état**: déjà-boosté §12 (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline verbatim, Overview + Principles cité-source + Process + Rationalizations table + Red Flags + Verification binaire). 0 `@anthropic-ai/sdk`, 0 secret. Recadrage: cadrage explicite "état MAOS dans `data/` sous le host stack, projet externe read-only-by-default" (§8); strip exec/egress: rien à retirer; renvois croisés vers `swift-concurrency-6-2` et `swift-protocol-di-testing`. Pas de coût LLM.


## swift-concurrency-6-2
- **décision**: adapt
- **raison**: doctrine Swift 6.2 Approachable Concurrency (single-threaded par défaut, async reste sur l'acteur appelant, MainActor-default inference, isolated conformances `extension T: @MainActor P`, protection des globals/statics, `@concurrent` comme opt-in explicite après profilage, migration incrémentale). Référence pour résoudre les erreurs de data-race safety sous Xcode 26. Dense, à jour, runnable.
- **dedup**: non — aucune surface concurrence Swift côté MAOS; chevauchement conceptuel mineur avec `swift-actor-persistence` (acteurs) traité par renvois explicites.
- **chemin library**: `packages/skills/library/swift-concurrency-6-2/SKILL.md`
- **état**: déjà-boosté §12 conforme (8 sections, Prompt Defense verbatim, Verification binaire). 0 sdk, 0 secret. Recadrage: §11 explicité (ce domaine ne suit aucun coût LLM, abonnement); strip exec/egress: rien (build settings = documentaire). Pas de coût LLM.

## swift-protocol-di-testing
- **décision**: adapt
- **raison**: recette d'architecture testable Swift via DI par protocoles (protocoles `Sendable` mono-concern par frontière FS/réseau/iCloud, impls `Default*` en prod, doubles `Mock*` avec erreurs configurables pour couvrir les chemins d'échec, injection par paramètres par défaut, tests Swift Testing `@Test`/`#expect(throws:)`). Aligné avec la doctrine MAOS "mock the expensive boundary" et `superpowers:test-driven-development`.
- **dedup**: non — aucun pack DI/testing Swift côté MAOS (notre TDD = Vitest générique). Se compose avec `swift-actor-persistence` (injecter le protocole dans l'acteur).
- **chemin library**: `packages/skills/library/swift-protocol-di-testing/SKILL.md`
- **état**: déjà-boosté §12 conforme (8 sections, Prompt Defense verbatim, Verification binaire). 0 sdk, 0 secret (emails factices). Recadrage: aligné §6/§7 (mock LLM/I-O, déterminisme, eco-by-default), renvois croisés vers `swift-actor-persistence`. Pas de coût LLM.

## swiftui-patterns
- **décision**: adapt
- **raison**: patterns SwiftUI modernes (table de décision des property wrappers, framework Observation `@Observable` pour re-render minimal, composition pour scoper l'invalidation, `ViewModifier` réutilisable, navigation type-safe `NavigationStack`+`NavigationPath`+enum `Destination` derrière un `Router` `@Observable`, perf: lazy containers/IDs stables/`.task {}`/`Equatable`, `#Preview` + mocks). Évite `ObservableObject`/`AnyView`/travail dans `body`. Pack UI Apple dense et à jour.
- **dedup**: non — cockpit MAOS = Next.js/React/shadcn, stack distincte; aucun pack SwiftUI. Renvois croisés vers les 3 autres skills Swift.
- **chemin library**: `packages/skills/library/swiftui-patterns/SKILL.md`
- **état**: déjà-boosté §12 conforme (8 sections, Prompt Defense verbatim, Verification binaire). 0 sdk, 0 secret. Recadrage: découplage explicite "cockpit MAOS = React, pas SwiftUI"; strip exec/egress: rien. Pas de coût LLM.

## foundation-models-on-device
- **décision**: adapt
- **raison**: intégration du LLM **on-device d'Apple** (FoundationModels, iOS 26): gate `availability` avant session, génération texte single/multi-turn avec `instructions` prioritaires, sortie structurée `@Generable`/`@Guide`, tool calling custom (`Tool`/`ToolOutput`/`ToolCallError`), snapshot streaming `PartiallyGenerated` vers SwiftUI. Exécution 100% locale (privacy, offline), aucune clé, aucun réseau. Strong-in-domain, à jour.
- **dedup**: non — modèle et surface de facturation DISTINCTS de `claude-api` (API Anthropic) et du quota d'abonnement MAOS (§11). Découplage explicité dans le corps; renvois vers les skills Swift dédiés.
- **chemin library**: `packages/skills/library/foundation-models-on-device/SKILL.md`
- **état**: déjà-boosté §12 conforme (8 sections, Prompt Defense verbatim, Verification binaire). 0 `@anthropic-ai/sdk` (modèle Apple, pas Anthropic), 0 secret, 0 réseau/egress. Recadrage clé: la fenêtre 4 096 tokens = contrainte device en `quota_units`, JAMAIS un coût per-token (§11); cadrage "MAOS ne route jamais ses appels via ce modèle, llm.ts sur l'abonnement". Garde §12 keep (Apple on-device, non-dup, strong-in-domain) confirmée.

## dart-flutter-patterns
- **décision**: adapt
- **raison**: arsenal Dart/Flutter idiomatique dense et runnable (null-safety sans `!`, états sealed immuables + Freezed, async structuré + garde `context.mounted` après await, widgets en classes + `const` + rebuilds scopés, state management BLoC/Cubit + Riverpod + Provider, GoRouter `refreshListenable`, Dio interceptors avec garde de retry unique sur 401, capture d'erreurs globale, tests blocTest/`ProviderScope`/fakes). À jour (Dart 3, Flutter 3.7+).
- **dedup**: non — cockpit MAOS = Next.js/React, aucun pack Flutter; `Mobile App Builder` reste généraliste. Renvoi vers `flutter-dart-code-review` (checklist).
- **chemin library**: `packages/skills/library/dart-flutter-patterns/SKILL.md`
- **état**: déjà-boosté §12 conforme (8 sections, Prompt Defense verbatim, Verification binaire). 0 sdk, 0 secret (emails factices, secrets = `--dart-define`/secure storage documentaires). Recadrage sécu: clés jamais en clair → secure storage/`--dart-define` (§5/§11), validation deep-links/entrées (§5), garde anti-boucle sur refresh 401; strip exec/egress: rien (Dio = réseau de l'app cible, pas de MAOS). Pas de coût LLM.

## flutter-dart-code-review
- **décision**: adapt
- **raison**: checklist de revue Flutter/Dart library-agnostic complète (15 domaines: santé projet, pièges Dart, widgets, state management mappé BLoC/Riverpod/Provider/GetX/MobX/Signals, perf, tests, accessibilité, sécurité, deps, navigation, erreurs, i18n, DI, static analysis) + table de correspondance par solution. Contrepartie *revue* de `dart-flutter-patterns` (build).
- **dedup**: non — reviewer de domaine Flutter, distinct du reviewer host-stack (`mas-reviewer`/Code Reviewer, TS/React). Aligné doctrine `mas-reviewer` (coverage over filtering).
- **chemin library**: `packages/skills/library/flutter-dart-code-review/SKILL.md`
- **état**: déjà-boosté §12 conforme (8 sections, Prompt Defense verbatim, Verification binaire). 0 sdk, 0 secret. Recadrage sécu §5 (secure storage, pas de clés en clair, validation deep-links/entrées, HTTPS, pas de log sensible) + alignement `mas-reviewer` (ne jamais filtrer un finding mineur); renvoi croisé vers `dart-flutter-patterns`. Pas de coût LLM.

---

## Bilan lot M
7 audits, **7 keepers** (7 adapt, 0 reject). Cluster `skill:eng-lang`, tier T2, status library, origin `affaan-m/ecc` (MIT).
Sanitize: 7/7 clean (0 `@anthropic-ai/sdk`, 0 secret réel, 0 PII réelle). Recadrages clés: §11 (abonnement, aucune surface coût LLM cash; fenêtre 4 096 tokens de FoundationModels = contrainte device en quota_units), §8 (état MAOS dans `data/`, projet externe read-only), §5 (secure storage/validation pour Flutter), découplages stack (cockpit MAOS = React, pas SwiftUI/Flutter) et modèle (`foundation-models-on-device` ≠ `claude-api`). Tous écrits en forme exemplaire §12 (Prompt Defense Baseline verbatim + Overview + Principles cité-source + Process + Rationalizations table + Red Flags + Verification binaire).
