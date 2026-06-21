# ECC Harvest — décisions lot RP2c (rules P2 « arsenal »)

Doer : lot RP2c — 5 lang packs P2 (`php`, `python`, `ruby`, `rust`, `swift`), 26 fichiers au total. Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Méthode : `intake-audit`, barre LARGE (P2 arsenal, cf. CLUSTERS.md §Rules — port vers `docs/rules/<lang>/`, doc de référence concise, PAS format skill §12).
Source ECC : `affaan-m/ecc` (MIT). Cible : `docs/rules/<lang>/<concern>.md`.

**Sanitize transverse** — les 26 fichiers sont propres : aucun secret réel, aucune PII, zéro import `@anthropic-ai/sdk`. Seules occurrences de noms de clés = **exemples illustratifs** (`API_KEY`, `PAYMENT_API_KEY`, et un `sk-abc123...` figurant dans un bloc *BAD* qui montre quoi NE PAS faire). Point de recadrage unique : `python/security.md` citait `OPENAI_API_KEY` comme exemple par défaut → neutralisé en variable générique + note §11 (clés provider dans `.env.local`, Anthropic-PAYG interdit). Aucun chiffre $/€ dans ces fichiers (rules de style/sécu, pas de coût) → pas de recadrage quota nécessaire au-delà des renvois §5/§11/§7.

---

## Pack `php` — verdict : KEEP (5/5)

Doc de référence solide, à jour (PSR-12, `readonly`, `declare(strict_types=1)`, Pint/PHPStan, Pest). Aucun doublon dans nos assets (on n'a pas de rules PHP). Recadré §5/§11/§7 + renvois TDD superpowers.

- `coding-style.md` — KEEP. PSR-12, immutabilité (DTO/value objects), Pint+PHPStan, error-handling par exceptions.
- `hooks.md` — KEEP. PostToolUse (Pint/PHPStan/PHPUnit) + warnings `dd`/`var_dump`/raw-SQL ; cadré « ne remplace pas la vérif 5-checks §7 ».
- `patterns.md` — KEEP. Thin controllers, DTO/value objects, DI par interfaces, adapters autour des SDK tiers.
- `security.md` — KEEP. Prepared statements, escape par défaut, secrets hors repo (renvoi §11), CSRF/session ; route `mas-sec-reviewer` pour auth/SQL/secrets.
- `testing.md` — KEEP. PHPUnit/Pest, coverage CI, séparation unit/integration ; renvoi `superpowers:test-driven-development`.

## Pack `python` — verdict : KEEP (6/6)

Pack le plus dense (6 fichiers, dont `fastapi.md`). Idiomes modernes (frozen dataclass, Protocol, ruff/black/mypy, pytest). Recadrage §11 sur `security.md` (voir ci-dessous). Pas de doublon dans nos assets.

- `coding-style.md` — KEEP. PEP 8, annotations partout, immutabilité (frozen dataclass / NamedTuple), black+isort+ruff.
- `fastapi.md` — KEEP. `create_app()`, routers fins, schemas séparés, async I/O, DI via `Depends`, jamais de secret dans les response models, JWT/CORS, rate-limit, redaction des logs. Excellent et autonome.
- `hooks.md` — KEEP. PostToolUse black/ruff/mypy + warning `print()` ; cadré « ne remplace pas la vérif §7 ».
- `patterns.md` — KEEP. Protocol (duck typing), dataclass DTOs, context managers/generators.
- `security.md` — KEEP **avec recadrage §11**. La source utilisait `OPENAI_API_KEY` comme exemple par défaut → remplacé par `APP_SECRET` (clé générique) + note explicite : clés provider dans `.env.local` gitignored, Anthropic-PAYG interdit (§11). bandit conservé.
- `testing.md` — KEEP. pytest, coverage `--cov`, marks unit/integration ; renvoi TDD superpowers.

## Pack `ruby` — verdict : KEEP (5/5)

Très à jour (Ruby 3.3+, Rails 8, Solid Queue/Cache/Cable, Hotwire, rubocop-rails-omakase, générateur d'auth Rails 8). Conseils nuancés (quand Sidekiq vs Solid Queue, Devise vs générateur). Pas de doublon.

- `coding-style.md` — KEEP. Ruby 3.3+/YJIT, `frozen_string_literal`, RuboCop omakase, error-handling spécifique.
- `hooks.md` — KEEP. RuboCop/Brakeman/bundle-audit + warnings `binding.pry`/CSRF/mass-assignment/migrations destructives (renvoi §5).
- `patterns.md` — KEEP. Rails-way-first, service/query/form objects nommés métier, Solid Queue/Sidekiq, Hotwire, auth.
- `security.md` — KEEP. CSRF, strong params, SQL paramétré, rotation de session, bundle-audit/Brakeman, `html_safe`/`raw` sensibles ; renvois §5/§11.
- `testing.md` — KEEP. Minitest/RSpec (ne pas mélanger), pyramide de tests, factory_bot, SimpleCov ; renvoi TDD superpowers.

## Pack `rust` — verdict : KEEP (5/5)

Pack le plus riche en exemples de code (thiserror/anyhow, Cow, newtype, sealed traits, mockall, llvm-cov). Idiomes modernes et corrects. Exemples portés en version condensée (les blocs longs réduits aux plus illustratifs). Le `sk-abc123...` du fichier source était dans un bloc *BAD* (anti-exemple) — non repris tel quel ; l'exemple GOOD utilise `PAYMENT_API_KEY` (placeholder). Pas de doublon.

- `coding-style.md` — KEEP. rustfmt/clippy `-D warnings`, immutabilité+`Cow`, naming, ownership/borrowing, thiserror/anyhow, visibility.
- `hooks.md` — KEEP. cargo fmt/clippy/check ; cadré « ne remplace pas la vérif §7 ».
- `patterns.md` — KEEP. Repository-trait, service layer, newtype, enum state machines (match exhaustif), builder, sealed traits, API response envelope.
- `security.md` — KEEP. Secrets hors source (renvoi §11), SQL paramétré (sqlx), parse-don't-validate, `unsafe`+`// SAFETY:`, cargo audit/deny, erreurs génériques côté client.
- `testing.md` — KEEP. `#[cfg(test)]`/rstest/proptest/mockall/tokio, organisation tests/benches, llvm-cov 80% ; renvoi TDD superpowers.

## Pack `swift` — verdict : KEEP (5/5)

À la pointe : Swift 6 (typed throws, strict concurrency, `Sendable`, actors), Swift Testing (`@Test`/`#expect`), Keychain. Conseils corrects sur value vs reference semantics. Pas de doublon.

- `coding-style.md` — KEEP. SwiftFormat/SwiftLint, `let` par défaut, struct value semantics, typed throws, concurrency structurée.
- `hooks.md` — KEEP. SwiftFormat/SwiftLint/swift build + warning `print()` ; cadré « ne remplace pas la vérif §7 ».
- `patterns.md` — KEEP. Protocol-oriented design, enums à valeurs associées (LoadState), actor Cache, DI par défaut de protocole.
- `security.md` — KEEP. Keychain (jamais `UserDefaults`), ATS, certificate pinning, validation input/deep-links ; renvois §5/§11.
- `testing.md` — KEEP. Swift Testing `@Test`/`#expect`, isolation init/deinit, tests paramétrés, coverage ; renvoi TDD superpowers.

---

## Bilan lot RP2c

| Pack | Kept / Total |
|------|:------------:|
| php | 5 / 5 |
| python | 6 / 6 |
| ruby | 5 / 5 |
| rust | 5 / 5 |
| swift | 5 / 5 |
| **Total** | **26 / 26** |

Zéro rejet : barre P2 « arsenal » LARGE, tous les fichiers sont des docs de référence de qualité, à jour, non-doublons (MAOS n'a aucune rule pour ces 5 langages). Sanitize : 26/26 propres, un seul recadrage §11 (`python/security.md`, `OPENAI_API_KEY` → `APP_SECRET`). Tous écrits sous `docs/rules/<lang>/<concern>.md` (frontmatter `origin`/`license`/`lang`/`concern` + commentaire de provenance, format référence concis, PAS skill §12). Re-audit : à la prochaine montée majeure de version de langage/framework (Rails 9, Swift 7, PHP 9, etc.) ou si un de ces langages devient stack produit MAOS (alors distiller les deltas dans CLAUDE.md §7).
