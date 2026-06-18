# ECC Harvest — décisions lot RP2a (P2 arsenal — rules)

Doer: lot RP2a, 5 packs langage (`angular`, `arkts`, `cpp`, `csharp`, `dart`), 5 fichiers/pack = 25 fichiers.
Worktree `maos-ecc`. Méthode: `intake-audit` barre LARGE (P2 arsenal — garder tout standard utile non-stub dans son domaine).
Source ECC: `affaan-m/ecc` (MIT), `rules/<lang>/<concern>.md`. Cible: `docs/rules/<lang>/<concern>.md` (doc de référence concise, PAS format skill §12).
Recadrage transverse §11: tout `$/€` → unités de quota; secrets jamais dans les fichiers suivis. Sanitize: secrets/PII/`@anthropic-ai/sdk` — voir par pack.

---

## Pack `angular` — kept 5/5

Standard moderne (v17+), signal-first, cohérent et de haute qualité sur les 5 concerns. Aucun stub. Sanitize: clean (les `apiKey = 'sk-live-…'` sont des **contre-exemples** pédagogiques dans security.md, pas de vrais secrets; aucun import `@anthropic-ai/sdk`).

- **coding-style.md** — kept. Version-awareness, naming CLI, standalone+OnPush, `inject()`, signals (`signal`/`computed`/`linkedSignal`/`resource`/`effect`), block-template `@for`/`@if`, forms, encapsulation, change-detection. Porté + resserré.
- **patterns.md** — kept. Smart/dumb split, service layer, `resource()`, signal-state, `takeUntilDestroyed`, routing (`canMatch`/lazy/resolve/guards fonctionnels/view-transitions), DI (scoped/`InjectionToken`/`viewProviders`), interceptors fonctionnels, RxJS, rendering (CSR/SSR/SSG), a11y CDK. Porté.
- **security.md** — kept. XSS/sanitizer, HttpClient-only, secret-mgmt (aligné §11), route guards `canMatch`, SSR-security, CSP. Note de liaison §5/§11 ajoutée.
- **testing.md** — kept. Runner projet, TestBed standalone, signal inputs, CDK harnesses, `RouterTestingHarness`, async (`fakeAsync`/`waitForAsync`), HTTP testing, quoi-tester, E2E, coverage ≥80%. Porté.
- **hooks.md** — kept. Hooks PostToolUse/Stop (prettier/ng lint/tsc/ng build). Petit mais utile et non-stub; note de garde cross-project §5 ajoutée.

## Pack `arkts` (HarmonyOS) — kept 5/5

Niche (HarmonyOS/ArkTS) mais TRÈS fort dans son domaine — exactement le cas "arsenal P2, garder car standard solide dans son domaine". Contenu dense, à jour (State Management V2, Navigation, MVVM, HUKS). Aucun stub. Sanitize: clean (les `API_KEY = 'sk-…'` sont des contre-exemples pédagogiques; aucun import `@anthropic-ai/sdk`).

- **coding-style.md** — kept. Contraintes ArkTS (sous-ensemble TS strict → erreurs de compilation), naming, formatting, organisation fichiers, error-handling `hilog`, immutabilité. Porté + condensé (liste de contraintes regroupée par thème).
- **patterns.md** — kept. State Management V2 (table décorateurs, V1 interdit), Navigation/`NavPathStack` (pas de `@ohos.router`), MVVM, animations (perf: jamais animer width/height), `LazyForEach`, `$r()` resources. Porté.
- **security.md** — kept. Permissions `module.json5` + runtime, secret-mgmt HUKS/Keystore (aligné §11), validation deep-link allowlist, réseau HTTPS, stockage chiffré, deps ohpm épinglées. Note §5/§11 ajoutée.
- **testing.md** — kept. `@ohos/hypium` unit, `@ohos.UiTest`, layout `ohosTest`, cycle TDD adapté (RED→GREEN→REFACTOR→BUILD→VERIFY), coverage ≥80%, best practices. Porté + resserré.
- **hooks.md** — kept. Commandes hvigor/ohpm + hooks PostToolUse/PreToolUse (guard décorateurs V1) + checklist validation. Note garde cross-project §5 ajoutée.

## Pack `cpp` — kept 5/5

Standards C++ modernes (C++17/20/23), concis mais corrects et utiles : RAII, rule-of-5/0, value semantics, mémoire/UB, sanitizers, GoogleTest. Plus minces que angular/arkts mais non-stub et solides dans leur domaine → barre P2 large = keep. Sanitize: clean (aucun secret, aucun import sdk). Les renvois ECC internes `See skill: cpp-*` ont été retirés (cross-refs non transférables).

- **coding-style.md** — kept. Modern C++ (`auto`/`constexpr`/structured bindings), RAII/smart pointers, naming, clang-format. Porté.
- **patterns.md** — kept. RAII handle (copy deleted), rule-of-5/0, value semantics (par valeur/`const&`/RVO/move), error-handling (`optional`/`expected`). Porté.
- **security.md** — kept. Memory safety (pas de `new`/`delete`/C-arrays/`malloc`), buffer overflows (`std::string`, `.at()`, pas de `strcpy`), UB, sanitizers ASan/UBSan, clang-tidy/cppcheck. Porté.
- **testing.md** — kept. GoogleTest+CTest, run/coverage(lcov)/sanitizers. Porté.
- **hooks.md** — kept. clang-format/clang-tidy/cmake/ctest pre-commit + pipeline CI. Note garde cross-project §5 ajoutée.

## Pack `csharp` — kept 5/5

Conventions .NET modernes, de qualité : records/nullable, async+CancellationToken, immutabilité (`with`), DI/options/repository, sécurité (secrets, SQLi paramétré, authz framework). Non-stub, solide. Sanitize: clean — l'exemple `Configuration["Service:ApiKey"]` est une **lecture de config** pédagogique (pas un import sdk; reframé `OpenAI:`→`Service:` pour rester générique), `sk-live-123` est un contre-exemple. Aucun import `@anthropic-ai/sdk`. Renvoi ECC `See skill: security-review` retiré.

- **coding-style.md** — kept. Conventions .NET, types (record/class/interface), immutabilité `init`/`with`, async/`CancellationToken`, error-handling structuré, `dotnet format`. Porté.
- **patterns.md** — kept. ApiResponse record, repository générique, options pattern typé, DI (lifetimes singleton/scoped/transient). Porté.
- **security.md** — kept. Secret-mgmt (aligné §11), SQLi paramétré, validation DTO, authz framework, error-handling sûr côté client. Reframe `OpenAI:`→`Service:`. Note §11.
- **testing.md** — kept. xUnit/FluentAssertions/Moq/Testcontainers, organisation, `WebApplicationFactory` intégration, coverage 80%+. Porté.
- **hooks.md** — kept. `dotnet format`/`build`/`test` PostToolUse + Stop (garde `appsettings*.json` secrets). Note garde cross-project §5.

## Pack `dart` (Flutter) — kept 5/5

Le pack le plus riche du lot — standards Flutter/Dart 3+ complets et à jour : null-safety, sealed types + pattern matching exhaustif, BLoC/Riverpod, clean architecture, sécurité mobile (secure storage, ATS, WebView, obfuscation), golden tests. Aucun stub, excellente densité. Sanitize: clean (les `apiKey = 'sk-…'` sont des contre-exemples; `String.fromEnvironment` = config compile-time, pas un import sdk; aucun `@anthropic-ai/sdk`). Renvois ECC `See skill: flutter-dart-code-review` / `compose-multiplatform-patterns` retirés.

- **coding-style.md** — kept. Formatting, immutabilité (`final`/`const`/`copyWith`), naming, null-safety (éviter `!`/`late`), sealed types + switch exhaustif, error-handling typé, async (`unawaited`/`context.mounted`), imports, code-gen. Porté.
- **patterns.md** — kept. Repository, BLoC/Cubit + Riverpod, DI (`get_it`), ViewModel `ChangeNotifier`, UseCase, freezed, clean-architecture layers, GoRouter (redirect/refreshListenable). Porté + condensé (exemples longs résumés en intentions + snippets clés).
- **security.md** — kept. Secrets (aligné §11), réseau HTTPS/ATS, validation input/deep-link allowlist + SQL paramétré, data-protection secure storage, Android/iOS spécifiques, WebView, obfuscation build. Note §11.
- **testing.md** — kept. flutter_test/bloc_test/mocktail/fake_async/integration_test, table types, state managers, widget tests, fakes>mocks, golden, organisation, coverage 80%+. Porté + resserré.
- **hooks.md** — kept. PostToolUse dart format/analyze/test + pre-commit + one-liners. Note garde cross-project §5.

---

## Bilan lot RP2a

| Pack | kept/total |
|------|:---:|
| angular | 5/5 |
| arkts | 5/5 |
| cpp | 5/5 |
| csharp | 5/5 |
| dart | 5/5 |
| **TOTAL** | **25/25** |

Tous les fichiers sources étaient des standards de qualité, non-stub, forts dans leur domaine → la barre P2 large (arsenal) garde tout. Aucune source ne contenait de secret réel ni d'import `@anthropic-ai/sdk` (les `sk-…` rencontrés sont des contre-exemples pédagogiques). Recadrages §11 et notes de garde §5 (cross-project) ajoutés là où pertinent; renvois `See skill:` internes ECC retirés (non transférables). Cibles écrites sous `docs/rules/<lang>/<concern>.md`. Aucune modif `ledger.tsv` / `CLAUDE.md`; aucun git add/commit.
