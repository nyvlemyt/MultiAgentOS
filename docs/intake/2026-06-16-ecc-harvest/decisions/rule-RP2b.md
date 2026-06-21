# ECC Harvest — décisions lot RP2b (rules P2 — arsenal)

Doer: lot RP2b (5 packs langage × 5 concerns = 25 fichiers). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Méthode: `intake-audit`, barre LARGE P2 (arsenal). Source ECC: `affaan-m/ecc` (MIT). Cible: `docs/rules/<lang>/<concern>.md` — doc de référence concise, PAS le format §12.

**Cadrage transverse.** Ces fichiers sont des règles de qualité de code (style/patterns/sécurité/tests/hooks), purement techniques. Aucun framing $/€ à recadrer (§11 sans objet ici — pas de cognition LLM, pas de coût per-token). Hooks = guidance Claude Code générique (`~/.claude/settings.json`), pertinente pour MAOS qui utilise déjà des hooks.

**Sanitize (secrets/PII/`@anthropic-ai/sdk`).** 25/25 sources clean. Aucun import `@anthropic-ai/sdk`. Les seules "clés" présentes (`sk-live-...`, `sk-abc...`) sont des exemples FICTIFS, et ce sont précisément les blocs `// BAD` des règles de gestion de secrets — conservés (les retirer viderait la leçon) mais neutralisés/abrégés à l'écriture.

**Verdict barre large.** Aucun de ces langages n'est dans la stack MAOS courante (qui est P1: ts/web/react/vue/nuxt), donc zéro doublon avec un asset existant. Tous les fichiers sont des références actionnables de bonne qualité, propres à leur domaine → **arsenal gardé** pour usage futur. Aucun stub, aucun unsafe.

---

## Pack fsharp — KEEP 5/5
- **décision**: implement_now (arsenal, doc de référence).
- **coding-style**: KEEP — DU/records/immutabilité, pipelines `|>`, ordre des `open`. Solide.
- **patterns**: KEEP — railway `Result`, `Option`, CE `result {}`, record-of-functions DI. Solide.
- **security**: KEEP — secrets fail-closed, SQL paramétré, validated single-case DU, no-leak errors. Solide.
- **testing**: KEEP — xUnit/Unquote/FsCheck, property-based, WebApplicationFactory, 80% coverage. Solide.
- **hooks**: KEEP — fantomas/dotnet build/test PostToolUse + Stop secret-guard. Utile, générique CC.
- **rejected**: aucun.

## Pack golang — KEEP 5/5
- **décision**: implement_now (arsenal, doc de référence).
- **coding-style**: KEEP — gofmt/goimports, accept-interfaces/return-structs, wrap errors `%w`. Concis mais actionnable.
- **patterns**: KEEP — functional options, small consumer-side interfaces, constructor DI. Solide.
- **security**: KEEP — secrets env fail-closed, gosec, `context` timeouts. Solide.
- **testing**: KEEP — table-driven, `-race`, `-cover`. Solide.
- **hooks**: KEEP — gofmt/vet/staticcheck PostToolUse.
- **note**: le pack go est plus mince (plusieurs renvois "See skill: golang-*") mais chaque fichier garde un cœur actionnable autonome → KEEP.
- **rejected**: aucun.

## Pack java — KEEP 5/5
- **décision**: implement_now (arsenal, doc de référence). Pack le plus riche du lot.
- **coding-style**: KEEP — records/sealed/pattern-matching/switch-expr modernes, Optional discipline, streams courts. Excellent.
- **patterns**: KEEP — repository/service/constructor-injection/builder/sealed result/API envelope. Excellent.
- **security**: KEEP — secrets, PreparedStatement, bcrypt/Argon2, dep-CVE scan, no-leak errors. Solide.
- **testing**: KEEP — JUnit5/AssertJ/Mockito/Testcontainers, parametrés, IT, JaCoCo. Solide.
- **hooks**: KEEP — google-java-format/checkstyle/compile PostToolUse.
- **rejected**: aucun.

## Pack kotlin — KEEP 5/5
- **décision**: implement_now (arsenal, doc de référence). Riche, orienté Android/KMP.
- **coding-style**: KEEP — `val`-first, null-safety sans `!!`, sealed+`when` exhaustif, scope functions. Excellent.
- **patterns**: KEEP — Koin/Hilt DI, ViewModel/UseCase/Repository, `expect/actual` KMP, coroutines, builder DSL. Excellent.
- **security**: KEEP — secrets BuildConfig/Keychain, cert-pinning, Room paramétré, ProGuard/WebView. Solide, Android-spécifique.
- **testing**: KEEP — Turbine/`runTest`, fakes-over-mocks, Ktor MockEngine, in-memory DB. Solide.
- **hooks**: KEEP — ktfmt/detekt/gradle PostToolUse.
- **rejected**: aucun.

## Pack perl — KEEP 5/5
- **décision**: implement_now (arsenal, doc de référence). Perl moderne (v5.36, Moo).
- **coding-style**: KEEP — `use v5.36`, signatures, Moo `ro` + Types::Standard, perltidy/perlcritic. Solide.
- **patterns**: KEEP — repo DBI/DBIx, DTO Moo, three-arg open + Path::Tiny, `@EXPORT_OK`, carton. Solide.
- **security**: KEEP — taint `-T`, allowlist untaint, realpath anti-traversal, list-form system, DBI placeholders. Excellent (Perl-spécifique fort).
- **testing**: KEEP — Test2::V0, prove `-l`, Devel::Cover, MockModule/MockObject. Solide.
- **hooks**: KEEP — perltidy/perlcritic PostToolUse + warn `print` en `.pm`.
- **rejected**: aucun.

---

## Total lot RP2b
**25/25 fichiers gardés** sur 5 packs (fsharp 5/5, golang 5/5, java 5/5, kotlin 5/5, perl 5/5). Zéro rejet (barre P2 large, aucun dup avec stack MAOS, aucun stub, aucun unsafe). Sanitize 25/25 clean, 0 `@anthropic-ai/sdk`, 0 secret réel.
Re-audit: re-vérifier si la stack MAOS adopte un de ces langages (passage P2→P1) ou si `affaan-m/ecc` publie une révision majeure des règles.
