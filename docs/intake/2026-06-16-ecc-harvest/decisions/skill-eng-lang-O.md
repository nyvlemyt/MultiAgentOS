# ECC Harvest — décisions cluster `skill:eng-lang` (lot O — C#/.NET/F# + PHP/Laravel)

Doer: lot O (7 skills). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: `intake-audit` cycle complet, barre LARGE (P2 ENG, library), deep-boost systématique.
Source ECC: `affaan-m/ecc` (MIT), `/tmp/ecc-inspect/skills/<slug>/SKILL.md`. Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B) : aucun pack langage C#/F#/Laravel existant → aucun doublon direct. Les agents proches (`Senior Developer` Laravel/Livewire, `Filament Optimization Specialist`, `Backend Architect`, `Database Optimizer`) sont des **rôles**, pas des packs de pattern langage → pas de dup.
Recadrage transverse: MAOS = abonnement (§11), JAMAIS de coût per-token PAYG; tout chiffre = unités de quota. Exécution (I/O fichier, bash, git) = Claude-only (§11.bis-4); ces skills = cognition/doctrine, pas d'egress externe.
Sanitize (regex secrets/PII/internal + `@anthropic-ai/sdk`): 7/7 sources clean — aucun secret, aucune PII, aucun import `@anthropic-ai/sdk`. Les chaînes `password`/`Stripe`/`.env` des sources sont des **exemples de test/config génériques**, pas des secrets réels → conservées en tant qu'illustration, jamais comme valeur vive.

Note overlap Laravel: `laravel-tdd` (authoring de tests) vs `laravel-verification` (pipeline lint→static→test→sécu→migration→deploy) = lentilles distinctes, conservées séparément avec renvoi croisé. `laravel-plugin-discovery` recadré: la **discipline d'évaluation de paquet** est gardée; l'egress vers le MCP externe `laraplugins.io` reste **gaté §5** (host hors `config/permissions.json#allowed_hosts` → validation humaine + déclaration de catégorie avant tout appel).

---

## csharp-testing
- **décision**: adapt
- **raison**: pack de doctrine de test .NET (AAA, xUnit + FluentAssertions, mocking NSubstitute/Moq de frontières, intégration via `WebApplicationFactory` + `Testcontainers`, builders de données, nommage `Method_ExpectedResult_WhenCondition`, `CancellationToken` systématique, comportement ≠ implémentation). Premier pack langage C# de la bibliothèque → valeur claire en propre domaine, barre LARGE.
- **dedup**: non — aucun pack langage C#/test dans `our-assets-index.md`; les agents `Backend Architect`/`API Tester` sont des rôles, pas une doctrine de test C# réutilisable.
- **chemin library**: `packages/skills/library/csharp-testing/SKILL.md`
- **état**: déjà-boosté, conforme (ligne 1 = `---`, commentaire source, summary L1, metadata complet {origin/license/cluster/tier/status}, 8 sections = Prompt Defense Baseline + 7 §12, 0 `@anthropic-ai/sdk`, 0 secret). Coût recadré quota (§11). Exécution `dotnet test` = Claude-only (§11.bis-4).
- **3 coûts**: install ~triviale (1 fichier md, 0 dép); maintenance faible (xUnit/FluentAssertions stables); removal trivial (suppr. dossier). **Re-audit**: si l'écosystème de test .NET pivote (ex. abandon FluentAssertions), sinon 12 mois.

## dotnet-patterns
- **décision**: adapt
- **raison**: pack de design C#/.NET idiomatique (immutabilité records/init-only/required, explicite null/accès, DI sur abstractions, async honnête CancellationToken/anti-`.Result`/anti-`async void`, patterns Options/Result/Repository EF Core, guard clauses, Minimal API groups). Complément non-test de `csharp-testing`; arsenal de qualité réutilisable, barre LARGE.
- **dedup**: non — pas de pack design .NET chez nous; `Backend Architect`/`Software Architect` sont génériques, ce skill est spécifiquement la doctrine idiomatique C#.
- **chemin library**: `packages/skills/library/dotnet-patterns/SKILL.md`
- **état**: déjà-boosté, conforme (ligne 1 = `---`, commentaire source, summary L1, metadata complet, 8 sections, 0 `@anthropic-ai/sdk`, 0 secret). Coût recadré quota (§11). Build = Claude-only (§11.bis-4).
- **3 coûts**: install triviale; maintenance faible (idiomes C# moderne stables, dérive lente); removal trivial. **Re-audit**: à une rupture majeure du langage (ex. nouvelle version C# changeant les idiomes async/records), sinon 12 mois.

## fsharp-testing
- **décision**: adapt
- **raison**: pack de test F# (xUnit + FsUnit/Unquote, property-based FsCheck pour invariants, mocking par stubs de fonctions dans un record de deps — idiomatique F# —, intégration WebApplicationFactory partagée avec `csharp-testing`). Lentille distincte de `csharp-testing`: assertions et mocking idiomatiquement différents; le property-based est le delta majeur. Barre LARGE, propre domaine.
- **dedup**: non — aucun pack F# chez nous; partage l'infra WebApplicationFactory/Testcontainers avec `csharp-testing` (renvoi croisé dans les deux corps), mais idiomes propres → non-dup.
- **chemin library**: `packages/skills/library/fsharp-testing/SKILL.md`
- **état**: déjà-boosté, conforme (ligne 1 = `---`, commentaire source, summary L1, metadata complet, 8 sections, 0 `@anthropic-ai/sdk`, 0 secret). Coût recadré quota (§11). `dotnet test` = Claude-only (§11.bis-4).
- **3 coûts**: install triviale; maintenance faible (FsCheck/Unquote stables); removal trivial. **Re-audit**: 12 mois, ou si F#/FsCheck change d'API property.

## laravel-patterns
- **décision**: adapt
- **raison**: architecture Laravel production (controllers fins → services → Actions, DI via ServiceProvider, Eloquent typé casts/enums/scopes/value-objects, anti-N+1 eager-load, route-model binding scopé + authorize() form-request, DB::transaction, migrations réversibles, API resources, queues/events/cache). Arsenal riche en propre domaine; recadré §5 (migrations destructives gatées, secrets `.env` jamais échoés). Note: l'agent `Senior Developer` mentionne Laravel/Livewire mais c'est un rôle, pas la doctrine de pattern.
- **dedup**: non — pas de pack Laravel chez nous.
- **chemin library**: `packages/skills/library/laravel-patterns/SKILL.md`
- **état**: déjà-boosté, conforme (ligne 1 = `---`, commentaire source, summary L1, metadata complet, 8 sections, 0 `@anthropic-ai/sdk`, 0 secret réel — `.env`/Stripe = exemples). Coût recadré quota (§11); ops destructives migration recadrées §5; build = Claude-only (§11.bis-4).
- **3 coûts**: install triviale; maintenance modérée (Laravel évolue vite — versions LTS à suivre); removal trivial. **Re-audit**: à chaque majeure Laravel (idiomes routing/Eloquent), sinon 9 mois.

## laravel-tdd
- **décision**: adapt
- **raison**: doctrine TDD Laravel (Red-Green-Refactor, factories + states/sequences, feature/HTTP tests `actingAs`/`*Json`/`assertDatabaseHas`, auth Sanctum + tests de frontière d'autorisation, fakes Http/Mail/Queue/Notification/Event/Storage, cibles de couverture). Authoring de tests = lentille distincte de `laravel-verification` (pipeline). Delta net vs `laravel-verification` → conservé. Frontières d'autorisation négatives = valeur sécurité.
- **dedup/overlap**: chevauchement partiel avec `laravel-verification` sur la phase « tests » UNIQUEMENT; ce skill = **comment écrire** les tests, l'autre = **quand/quoi exécuter** dans le pipeline pré-deploy. Delta suffisant → garder les deux, renvoi croisé dans les corps. Pas de dup avec nos `mas-reviewer`/`superpowers:test-driven-development` (génériques, pas Laravel-spécifiques).
- **chemin library**: `packages/skills/library/laravel-tdd/SKILL.md`
- **état**: déjà-boosté, conforme (ligne 1 = `---`, commentaire source, summary L1, metadata complet, 8 sections, 0 `@anthropic-ai/sdk`, 0 secret réel — credentials de test = fixtures jetables). Coût recadré quota (§11); appels réseau réels interdits → `Http::fake` (cadrage §5 egress). Tests = Claude-only (§11.bis-4).
- **3 coûts**: install triviale; maintenance modérée (PHPUnit/Pest/Sanctum suivent Laravel); removal trivial. **Re-audit**: à chaque majeure Laravel, sinon 9 mois.

## laravel-verification
- **décision**: adapt
- **raison**: pipeline de vérification Laravel séquentiel gaté (env → composer → pint/phpstan → tests+coverage → composer audit → migrations --pretend → build/cache → queue/scheduler), chaque couche bloque la suivante. Lentille **orchestration pré-deploy**, distincte de `laravel-tdd` (authoring). Delta net (sécurité, migrations, readiness, queue health) → conservé séparément. Recadré §5: `migrate`/cache/destructif = actions gatées humaines, jamais auto-run; healthcheck actif = staging-only.
- **dedup/overlap**: chevauchement avec `laravel-tdd` sur la seule phase 3 (tests). Le reste (6 phases) est unique. Delta largement suffisant → garder les deux. Conceptuellement proche de notre 5e check de vérif (CLAUDE.md §7) mais spécifique stack Laravel → non-dup.
- **chemin library**: `packages/skills/library/laravel-verification/SKILL.md`
- **état**: déjà-boosté, conforme (ligne 1 = `---`, commentaire source, summary L1, metadata complet, 8 sections, 0 `@anthropic-ai/sdk`, 0 secret). Recadrage §5 lourd (migrations destructives gatées, healthcheck staging-only); coût quota (§11); exécution Claude-only (§11.bis-4).
- **3 coûts**: install triviale; maintenance modérée (outils Pint/PHPStan/Horizon suivent Laravel); removal trivial. **Re-audit**: à chaque majeure Laravel/outillage, sinon 9 mois.

## laravel-plugin-discovery
- **décision**: adapt (recadrage egress lourd)
- **raison**: la source d'origine = « configurer + appeler le MCP externe LaraPlugins.io » (egress réseau vers `laraplugins.io`, host hors `config/permissions.json#allowed_hosts`). On STRIP l'instruction d'ajout inconditionnel à `~/.claude.json` et on GARDE la lentille transférable = **discipline d'évaluation de paquet** (match version Laravel/PHP, bande de santé, réputation vendor, historique) routée par `intake-audit`. Le MCP devient une source OPTIONNELLE off-by-default; tout appel = action §5 gatée (allowlist host + enregistrement MCP via intake-audit + `mas-sec-reviewer` PASS d'abord). L'install du paquet = changement de dépendance gaté séparé.
- **dedup**: non — pas de discipline d'évaluation de paquet Laravel chez nous; complète `intake-audit` (générique) en l'appliquant au domaine Composer/Laravel.
- **chemin library**: `packages/skills/library/laravel-plugin-discovery/SKILL.md`
- **état**: déjà-boosté, conforme (ligne 1 = `---`, commentaire source, summary L1, metadata complet, 8 sections, 0 `@anthropic-ai/sdk`, 0 secret). Egress MCP recadré §5 (gate explicite dans principes + red flags + verification); décision routée intake-audit (§13); coût quota (§11).
- **KILL/garde-fous**: appel MCP sans host allowlisté + sec PASS = interdit; `composer require` sans dossier intake = red flag. Pas de §11 (le MCP est gratuit, sans clé) — le souci est l'egress §5, traité par gate, pas par reject.
- **3 coûts**: install triviale; maintenance faible (la doctrine survit même si le MCP change/disparaît — il n'est qu'une source); removal trivial. **Re-audit**: si LaraPlugins.io est formellement proposé à l'allowlist (alors dossier MCP dédié), sinon 12 mois.

---

## Bilan lot O
- **7/7 keepers** (adapt). 0 reject, 0 backlog, 0 watch.
- Aucun doublon strict dans `our-assets-index.md`; overlaps Laravel `tdd`/`verification` conservés avec delta net + renvois croisés; `plugin-discovery` recadré egress §5 (non rejeté car la lentille d'évaluation est sûre et l'egress est gatable).
- Sanitize 7/7 clean: 0 secret réel, 0 PII, 0 import `@anthropic-ai/sdk`. Tous coûts en unités de quota (§11). Exécution Claude-only (§11.bis-4); migrations/install/egress = actions gatées §5.
- Shard: `docs/intake/2026-06-16-ecc-harvest/decisions/skill-eng-lang-O.md`.

