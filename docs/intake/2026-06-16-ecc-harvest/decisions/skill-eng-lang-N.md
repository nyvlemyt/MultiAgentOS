# ECC Harvest — décisions cluster `skill:eng-lang` (lot N — Go/Rust/Perl/C++)

Doer: lot eng-lang N (8 skills). Worktree `maos-ecc`. Méthode: intake-audit, barre LARGE (P2, arsenal per-langage, library).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B) : aucun pack par-langage existant côté MAOS — les skills `mas-*` gouvernent l'orchestration, pas les idiomes Go/Rust/Perl/C++. Donc 0 collision sur le domaine; ces packs sont une *doctrine de référence* pour le code que Claude produit (exécution = Claude-only, §11.bis), jamais un exécuteur.
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG. Toute mention de coût = unités de quota, jamais $/€. Les exemples de code restent du code de référence (jamais exécutés par le skill lui-même).
Sanitize (regex secrets/PII/internal): 8/8 sources clean — aucune clé, aucun secret, aucun chemin interne, aucun import `@anthropic-ai/sdk`. Aucune egress externe codée (les `curl`/`reqwest`/HTTP sont des *exemples* d'idiomes du langage, pas des appels exécutés). CI lint guard non concerné.

Barre P2 (CLUSTERS.md) — garder si: (1) pas un dup qu'on a en mieux, (2) pas un stub, (3) performant, (4) ajoute de la valeur *dans son domaine*. Spécificité-domaine ≠ raison de rejet. Les 8 packs passent les 4 critères : idiomatiques, complets, à jour (Go 1.18+ fuzzing, Rust 2024 unsafe, Perl 5.36/5.38/5.40, C++17/20/23 + Core Guidelines).

---

## golang-patterns
- **décision**: adopt
- **raison**: arsenal Go idiomatique dense et à jour — zero-value utile, accept-interfaces/return-structs, wrapping d'erreurs `%w` + `errors.Is/As`, sentinelles, patterns de concurrence (worker pool, `context`, errgroup, anti-fuite goroutine), functional options, design d'interfaces minimales, organisation de packages, perf (préallocation, `sync.Pool`, `strings.Builder`). Aucun équivalent MAOS.
- **dedup**: non — aucun pack langage côté MAOS; `mas-*` = orchestration, pas idiomes Go.
- **sanitize**: clean. Exemples HTTP (`http.DefaultClient.Do`) = idiomes de référence, pas d'egress exécutée. 0 secret, 0 sdk.
- **chemin library**: `packages/skills/library/golang-patterns/SKILL.md`
- **état**: boosté §12 (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata complet `cluster:skill:eng-lang tier:T2 status:library`, Prompt Defense Baseline verbatim, 7 sections §12 = Overview/Principles[cite source]/Process/Rationalizations[table]/Red Flags/Verification Criteria[binaire] + When to Use). Recadré quota (§11). 0 `@anthropic-ai/sdk`. Re-audit: si Go publie une release majeure changeant les idiomes (>12 mois).

## golang-testing
- **décision**: adopt
- **raison**: doctrine de test Go complète et à jour — TDD red-green-refactor, table-driven + sous-tests `t.Run`, `t.Helper`/`t.Cleanup`/`t.TempDir`, golden files, mocking par interface (function-field), benchmarks + sub-benchmarks `-benchmem`, fuzzing 1.18+ (corpus + invariants), `httptest`, cibles de couverture, `-race`. Complète `golang-patterns`.
- **dedup**: non — aucune doctrine de test Go côté MAOS; aligne sur §7 (TDD) sans la dupliquer (Vitest ≠ `go test`).
- **sanitize**: clean. 0 secret, 0 sdk, aucune egress (CI YAML = exemple de référence).
- **chemin library**: `packages/skills/library/golang-testing/SKILL.md`
- **état**: boosté §12 (8 sections, Prompt Defense Baseline verbatim, summary L1, metadata complet, binaire). Recadré quota (§11). Re-audit: si le harness `testing` change majeurement (>12 mois).

## rust-patterns
- **décision**: adopt
- **raison**: arsenal Rust idiomatique riche et à jour (2024+) — ownership/borrow + `Cow`, `Result`/`?` jamais `unwrap()` en prod, `thiserror` (lib) vs `anyhow` (app), enums + matching exhaustif pour rendre les états illégaux inreprésentables, accept-generics/return-concrete, newtype anti-swap, builder, chaînes d'itérateurs, concurrence sûre (`Arc<Mutex>`, channels bornés, Tokio sans bloquer l'exécuteur), `unsafe` borné + `// SAFETY`, surface `pub` minimale. Aucun équivalent MAOS.
- **dedup**: non — aucun pack langage côté MAOS.
- **sanitize**: clean. Exemples `reqwest::get` = idiomes async de référence, pas d'egress exécutée. 0 secret, 0 sdk.
- **chemin library**: `packages/skills/library/rust-patterns/SKILL.md`
- **état**: boosté §12 (8 sections, Prompt Defense Baseline verbatim, summary L1, metadata complet, binaire). Recadré quota (§11). Re-audit: nouvelle édition Rust changeant les idiomes (>12 mois).

## rust-testing
- **décision**: adopt
- **raison**: doctrine de test Rust complète — TDD, `#[cfg(test)]` unit + intégration `tests/`, `assert_eq!`/`matches!`, tests `Result` avec `?`, `#[should_panic(expected)]`, `#[tokio::test]`, `rstest` (cases+fixtures), `proptest` (propriétés/roundtrip), `mockall #[automock]`, doc tests, Criterion, couverture `cargo-llvm-cov`. Complète `rust-patterns`.
- **dedup**: non — aucune doctrine de test Rust côté MAOS; aligne §7 sans dupliquer Vitest.
- **sanitize**: clean. 0 secret, 0 sdk, aucune egress (CI YAML = exemple).
- **chemin library**: `packages/skills/library/rust-testing/SKILL.md`
- **état**: boosté §12 (8 sections, Prompt Defense Baseline verbatim, summary L1, metadata complet, binaire). Recadré quota (§11). Re-audit: changement majeur de l'écosystème de test (>12 mois).

## perl-patterns
- **décision**: adopt
- **raison**: arsenal Perl moderne 5.36+ dense et à jour — `use v5.36` (strict/warnings/signatures), signatures+defaults, contexte scalaire/liste, déréférencement postfixe, opérateur `isa`, gestion d'erreurs (`Try::Tiny`/`try-catch` natif 5.40+), OO léger Moo+Types (Moose au besoin; `class`/Corinna 5.38+), captures nommées+`/x`, open 3-args UTF-8 (jamais 2-args = risque injection), Path::Tiny, Module::Runtime, perltidy/perlcritic/carton. Aucun équivalent MAOS.
- **dedup**: non — aucun pack langage côté MAOS.
- **sanitize**: clean. La source pointe `perl-security` (skill voisin non-adopté ici) : j'ai *internalisé* les idiomes de sûreté (interdiction open 2-args, interdiction string-eval) dans le corps du skill, sans cross-ref vers un skill non livré. 0 secret, 0 sdk, aucune egress.
- **chemin library**: `packages/skills/library/perl-patterns/SKILL.md`
- **état**: boosté §12 (8 sections, Prompt Defense Baseline verbatim, summary L1, metadata complet, binaire). Recadré quota (§11). Re-audit: nouvelle version Perl stabilisant `class`/`try-catch` (>12 mois).

## perl-testing
- **décision**: adopt
- **raison**: doctrine de test Perl complète — TDD, Test2::V0 > Test::More, builders deep `hash{}`/`array{}`/`bag{}`, subtests isolés, `dies{}`/`lives{}`, `SKIP`/`TODO`, `Test::MockModule` (auto-restore), SQLite in-memory + HTTP mocké, `prove -lr -j`, `done_testing`+`-l`, couverture `Devel::Cover`. Complète `perl-patterns`.
- **dedup**: non — aucune doctrine de test Perl côté MAOS; aligne §7 sans dupliquer Vitest.
- **sanitize**: clean. 0 secret, 0 sdk, aucune egress (exemples DBI/HTTP = idiomes mockés).
- **chemin library**: `packages/skills/library/perl-testing/SKILL.md`
- **état**: boosté §12 (8 sections, Prompt Defense Baseline verbatim, summary L1, metadata complet, binaire). Recadré quota (§11). Re-audit: changement majeur de Test2/prove (>12 mois).

## cpp-coding-standards
- **décision**: adopt
- **raison**: standards C++17/20/23 dérivés des C++ Core Guidelines (isocpp.org) — RAII partout, immutabilité par défaut, sûreté de type statique, sémantique de valeur, Rule of Zero/Five, smart pointers (jamais `new`/`delete` nu), exceptions custom by-value/catch-by-ref, `enum class`, locks RAII nommés + `scoped_lock`, templates contraints par concepts, headers self-contained, naming `underscore_style`, `std::vector/string/string_view`, `'\n'` vs `endl`, mesurer-avant-optimiser. Checklist binaire incluse. Excellente densité de valeur.
- **dedup**: non — aucun pack langage côté MAOS.
- **sanitize**: clean. URL = `isocpp.github.io` (source canonique des guidelines, citée), pas d'egress exécutée. 0 secret, 0 sdk.
- **chemin library**: `packages/skills/library/cpp-coding-standards/SKILL.md`
- **état**: boosté §12 (8 sections, Prompt Defense Baseline verbatim, summary L1, metadata complet, binaire). Recadré quota (§11). Re-audit: nouvelle norme C++ (C++26) modifiant les guidelines.

## cpp-testing
- **décision**: adopt
- **raison**: doctrine de test C++17/20 — GoogleTest/GoogleMock + CMake/CTest, TDD, `TEST`/`TEST_F` fixtures, `MOCK_METHOD`, DI vs globals, `gtest_discover_tests()`, `ASSERT_*` vs `EXPECT_*`, couverture target-level (gcov/lcov, llvm-cov), sanitizers ASan/UBSan/TSan en CI, garde-fous anti-flaky (pas de sleep, temp dirs uniques, seeds déterministes), libFuzzer/RapidCheck optionnels. Complète `cpp-coding-standards`.
- **dedup**: non — aucune doctrine de test C++ côté MAOS; aligne §7 sans dupliquer Vitest.
- **sanitize**: clean. URL FetchContent = `github.com/google/googletest` (dépôt officiel, exemple CMake de référence, pas d'exécution). 0 secret, 0 sdk.
- **chemin library**: `packages/skills/library/cpp-testing/SKILL.md`
- **état**: boosté §12 (8 sections, Prompt Defense Baseline verbatim, summary L1, metadata complet, binaire). Recadré quota (§11). Re-audit: changement majeur GoogleTest/CTest (>12 mois).

---

## Bilan lot eng-lang N
- **Keepers**: 8/8 (adopt). Aucun reject — les 8 packs passent la barre P2 LARGE (idiomatiques, complets, à jour, valeur de domaine, 0 dup MAOS).
- **Library écrite**: `golang-patterns`, `golang-testing`, `rust-patterns`, `rust-testing`, `perl-patterns`, `perl-testing`, `cpp-coding-standards`, `cpp-testing` → chacun en `packages/skills/library/<slug>/SKILL.md`, format §12 exact (8 sections), Prompt Defense Baseline verbatim, recadrage quota §11, 0 import `@anthropic-ai/sdk`, 0 secret/PII.
- **Cadrage clé**: ces skills sont une *doctrine de référence* pour le code que Claude produit (exécution = Claude-only §11.bis); ils ne sont jamais des exécuteurs. Les `curl`/`reqwest`/HTTP/URLs des sources = exemples d'idiomes, pas d'egress codée.
