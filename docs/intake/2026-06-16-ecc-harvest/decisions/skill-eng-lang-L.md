# ECC Harvest — décisions cluster `skill:eng-lang` (lot L — Kotlin/Android)

Doer: lot eng-lang L (7 skills Kotlin/Android, P2). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T2 deep-boost, library).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md`: aucun skill/agent/fiche MAOS ne couvre Kotlin, Android, KMP, Compose, Ktor, Exposed ni le testing Kotest/MockK. `Mobile App Builder` (agent) touche le mobile mais reste généraliste cross-platform sans contenu Kotlin idiomatique — pas de chevauchement de domaine. Zéro collision: 7 nouveaux domaines.
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG. Aucun de ces skills ne parle de coût LLM — recadrage quota inutile sauf mention explicite (aucune). Recadrage appliqué: strip de tout exec/egress externe (aucun présent au-delà du Gradle/CI standard, qui est documentaire et non exécuté par MAOS), durcissement sécurité (escape LIKE déjà présent côté Exposed; secrets JWT/DB en `${ENV}` documentaires, jamais en clair).
Sanitize (regex secrets/PII/internal): 7/7 sources clean (emails = `alice@example.com` factices; secrets = placeholders `${JWT_SECRET}`/`${DATABASE_URL}`). `@anthropic-ai/sdk`: absent des 7 sources.
Barre BROAD (CLUSTERS.md): garder tout skill non-dup, non-stub, performant, à valeur dans son domaine — la spécificité domaine n'est PAS un motif de rejet. Les 7 sont des packs idiomatiques denses, runnable, à jour (Kotlin 2.x, Ktor 3.x, Exposed 1.0, Compose Nav 2.8+). → 7 keepers.

---

## kotlin-patterns
- **décision**: adapt
- **raison**: pack idiomatique Kotlin dense et runnable (null-safety, immutabilité `val`/`copy()`, `sealed`+`when` exhaustif, `value class` à invariant, scope functions, extensions, concurrence structurée, DSL `@DslMarker`, `Sequence`, `require`/`check`, Gradle KDSL). Arsenal d'ingénierie de référence pour tout agent touchant du Kotlin.
- **dedup**: non — aucun skill/agent MAOS ne couvre Kotlin idiomatique; `Mobile App Builder` reste généraliste sans contenu langage.
- **chemin library**: `packages/skills/library/kotlin-patterns/SKILL.md`
- **état**: déjà-boosté §12 (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline verbatim, Overview+Principles cité-source+Process+Rationalizations table+Red Flags+Verification binaire). 0 `@anthropic-ai/sdk`, 0 secret (emails factices). Pas de surface coût LLM → recadrage quota non requis; strip exec/egress: rien à retirer (Gradle = documentaire).

## kotlin-testing
- **décision**: adapt
- **raison**: pack testing Kotest/MockK complet et idiomatique (4 styles de spec, mocking coroutines `coEvery`/`coVerify`, argument capture, `runTest`+horloge virtuelle, test de Flow/Turbine, property-based `Arb`, data-driven `withData`, couverture Kover, intégration Ktor `testApplication`) sous boucle TDD RED-GREEN-REFACTOR. Aligné avec `superpowers:test-driven-development`.
- **dedup**: non — notre doctrine TDD est générique (Vitest côté MAOS); aucun pack Kotlin/Kotest existant.
- **chemin library**: `packages/skills/library/kotlin-testing/SKILL.md`
- **état**: déjà-boosté §12 conforme (8 sections, Prompt Defense verbatim, Verification binaire). 0 sdk, 0 secret. Recadrage: TDD aligné doctrine MAOS, behaviour-over-implementation; pas de coût LLM.

## kotlin-coroutines-flows
- **décision**: adapt
- **raison**: doctrine concurrence structurée + Flow (scopes, `async`/`supervisorScope`, `StateFlow`/`SharedFlow`, `combine`/`debounce`/`flatMapLatest`/`retryWhen`, dispatchers KMP-safe, annulation coopérative, test `runTest`/Turbine). Référence async pour Android/KMP/Kotlin pur.
- **dedup**: non — domaine async Kotlin absent de nos assets. Chevauchement conceptuel mineur avec `kotlin-patterns` (concurrence) traité par renvois explicites entre skills.
- **chemin library**: `packages/skills/library/kotlin-coroutines-flows/SKILL.md`
- **état**: déjà-boosté §12 conforme. 0 sdk, 0 secret. Renvois croisés vers compose/clean-architecture conservés. Pas de coût LLM.

## kotlin-exposed-patterns
- **décision**: adapt
- **raison**: patterns Exposed production-grade (DSL vs DAO, `newSuspendedTransaction` atomique, HikariCP, migrations Flyway, repository pattern, JSONB+kotlinx.serialization, pagination/batch/upsert, isolation explicite, test H2). Échappement LIKE déjà présent côté source → durci dans la doctrine sécurité (§5).
- **dedup**: non — MAOS utilise Drizzle/SQLite, aucun pack Exposed; lentille DB-Kotlin distincte.
- **chemin library**: `packages/skills/library/kotlin-exposed-patterns/SKILL.md`
- **état**: déjà-boosté §12 conforme. 0 sdk, 0 secret (credentials = placeholders `${...}`). Recadrage sécu: secrets en config/env jamais en clair (§11/§5), wildcard-injection LIKE en red-flag + verification. Pas de coût LLM.

## kotlin-ktor-patterns
- **décision**: adapt
- **raison**: patterns serveur Ktor complets (module/installs ordonnés, routing DSL public/protégé, kotlinx.serialization + enveloppe `ApiResponse`, StatusPages centralisé, JWT issuer/audience, Koin DI, validation requête, WebSockets, test `testApplication` happy/401/404/auth). Thin-routes-fat-services.
- **dedup**: non — MAOS = Next.js/Node, aucun pack serveur Kotlin/Ktor.
- **chemin library**: `packages/skills/library/kotlin-ktor-patterns/SKILL.md`
- **état**: déjà-boosté §12 conforme. 0 sdk, 0 secret (JWT/DB = `${ENV}`). Recadrage sécu: secrets en config/env (§5/§11), pas de stack-trace au client, validation au edge, chemin 401 testé. Pas de coût LLM.

## compose-multiplatform-patterns
- **décision**: adapt
- **raison**: patterns UI Compose/CMP (état immuable unique en `StateFlow`+`collectAsStateWithLifecycle`, content stateless, event-sink sealed, navigation type-safe `@Serializable`, slots, perf recomposition `@Immutable`/keys/`derivedStateOf`/`remember`, `expect`/`actual`, Material 3). Référence UI Kotlin multiplateforme.
- **dedup**: non — UI MAOS = React/shadcn; aucun pack Compose.
- **chemin library**: `packages/skills/library/compose-multiplatform-patterns/SKILL.md`
- **état**: déjà-boosté §12 conforme. 0 sdk, 0 secret. Renvois croisés coroutines/clean-architecture conservés. Pas de coût LLM.

## android-clean-architecture
- **décision**: adapt
- **raison**: doctrine Clean Architecture Android/KMP (modules+règle de dépendance vers l'intérieur, `domain` pur Kotlin, UseCase `operator invoke`, interfaces repo en domain/impl en data, mappers DTO↔entity↔domain, DI Koin/Hilt, erreurs `Result`/sealed, convention plugins Gradle). Invariant clé: domain sans framework.
- **dedup**: non — aucune doctrine d'architecture mobile/KMP côté MAOS; lentille layering transférable mais le contenu Android/KMP est neuf.
- **chemin library**: `packages/skills/library/android-clean-architecture/SKILL.md`
- **état**: déjà-boosté §12 conforme. 0 sdk, 0 secret. Renvois croisés compose/coroutines conservés. Pas de coût LLM.

