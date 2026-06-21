# ECC Harvest — décisions cluster `skill:eng-lang` (lot H — Python/Django/FastAPI)

Doer: lot H (7 skills). Worktree `maos-ecc`. Méthode: intake-audit, barre LARGE (cluster eng-lang = arsenal par langage ; on garde tout ce qui est non-dup / non-stub / fort-en-domaine, même sans usage MAOS courant).
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B). Aucun de ces skills par-langage Python/Django/FastAPI n'existe chez nous (nos skills sont MAOS-meta + media + frontend ; aucun pack backend Python). Donc 0 dup réel sur les 7.
Recadrage transverse (§11): MAOS = abonnement, JAMAIS de coût per-token PAYG. Tout chiffre de coût = unités de quota, jamais $/€. `@anthropic-ai/sdk` n'est jamais importé.
Sanitize (regex secrets/PII/internal + import sdk): 7/7 sources clean. Les mentions Stripe/Sentry/CRM/JWT/SECRET_KEY sont des **exemples de patterns** que l'utilisateur implémenterait dans son propre projet (pas d'exécution ni d'egress câblé dans la skill, pas de vrai secret) ; gardées comme illustrations de doctrine, jamais comme exécution non-épinglée par MAOS. Aucun secret réel, aucune clé, aucun import `@anthropic-ai/sdk`.

---

## python-patterns
- **décision**: adapt
- **raison**: arsenal Python idiomatique complet et de qualité (EAFP, type hints modernes 3.9+/Protocol/TypeVar, hiérarchies d'exceptions + chaînage, context managers, comprehensions vs générateurs, dataclasses/NamedTuple, décorateurs fonction/paramétré/classe, concurrence I/O vs CPU vs async, layout package, `__slots__`/perf, tooling ruff/black/mypy/bandit, anti-patterns mutable-default/bare-except). Reformaté en §12 (Overview + Principles citant la source + Process + Rationalizations + Red Flags + Verification binaire) avec Prompt Defense Baseline ; les exemples de code restent en lentille de référence (le code généré par l'agent est exécuté par Claude, jamais par la skill).
- **dedup**: non — aucun skill Python dans `our-assets-index.md` (nos 24 skills = MAOS-meta + média + frontend). `claude-api` ≠ patterns Python généraux.
- **chemin library**: `packages/skills/library/python-patterns/SKILL.md`
- **état**: écrit, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata complet origin/license:MIT/cluster:skill:eng-lang/tier:T2/status:library, Prompt Defense Baseline verbatim, 7 sections §12). 0 secret, 0 import sdk. Re-audit: si Python target >3.13 change les idiomes type-hint (>12 mois).

## python-testing
- **décision**: adapt
- **raison**: arsenal pytest complet et solide (boucle TDD red-green-refactor, fixtures + scopes function/module/session, autouse, conftest, parametrize avec ids, mocking patch/Mock/autospec/mock_open + async assert_awaited, pytest.raises match/exc_info, tmp_path pour side-effects fichier, markers slow/integration/unit, cibles couverture 80%+/100% chemins critiques, listes DO/DON'T). Réancré sur `superpowers:test-driven-development` + `verification-before-completion` : ce skill = le « comment écrire le test », pas l'autorisation de sauter l'exécution. Reformaté §12, Prompt Defense Baseline ajouté.
- **dedup**: non — aucun skill de test Python chez nous (CLAUDE.md §7 parle Vitest ; ici pytest). Complète, ne duplique pas, `python-patterns` (idiomes ≠ tests).
- **chemin library**: `packages/skills/library/python-testing/SKILL.md`
- **état**: écrit, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline verbatim, 7 sections §12). 0 secret, 0 import sdk. Re-audit: si pytest majeur change l'API fixtures (>12 mois).

## django-patterns
- **décision**: adapt
- **raison**: arsenal d'architecture Django production-grade (split settings + flags sécurité prod, model design QuerySet/manager/index/CheckConstraint/slug-on-save, DRF serializers+ViewSets, service layer sous @transaction.atomic, tiers de cache, signals via AppConfig.ready, middleware, anti-N+1 select_related/prefetch_related + bulk). Recadré §5 : toute intégration sortante (paiement/email/API tierce) reste une action risk-gated, jamais auto-exécutée depuis un pattern généré. Reformaté §12, Prompt Defense Baseline ajouté.
- **dedup**: non — aucun skill Django chez nous. `claude-api`/`mcp-builder`/frontend ≠ backend Django.
- **chemin library**: `packages/skills/library/django-patterns/SKILL.md`
- **état**: écrit, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline verbatim, 7 sections §12). 0 secret réel (SECRET_KEY=ex. via env), 0 import sdk. Re-audit: si Django LTS majeure change l'API ORM/DRF (>12 mois).

## django-tdd
- **décision**: adapt
- **raison**: arsenal TDD Django via pytest-django (test settings rapide : sqlite mémoire + DisableMigrations + hasher MD5 + Celery eager ; fixtures conftest user/admin/clients authentifiés ; factory_boy Sequence/Faker/fuzzy/SubFactory/post_generation/create_batch ; tests models/views/serializers/API DRF avec constantes status ; bornes de permission 302/401/403 ; mocking services externes via patch + override_settings + mail.outbox ; intégration full-flow). Recadré §5 : les exemples paiement/email sont **mockés** (isolation), jamais d'envoi live. Reformaté §12, Prompt Defense Baseline ajouté.
- **dedup**: non — pas de skill de test Django chez nous ; complète `python-testing` (générique) en spécifique Django/DRF.
- **chemin library**: `packages/skills/library/django-tdd/SKILL.md`
- **état**: écrit, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline verbatim, 7 sections §12). 0 secret réel (testpass/token = fixtures de test), 0 import sdk. Re-audit: si pytest-django/factory_boy change l'API majeure (>12 mois).

## django-verification
- **décision**: adapt
- **raison**: boucle de vérification pré-PR/pré-deploy Django, phasée, finissant sur un verdict binaire go/no-go (env, qualité mypy/ruff/black/isort/check --deploy, sûreté migrations, tests+couverture, sécurité pip-audit/safety/bandit/secret-scan, commandes, perf/N+1, config SSL/HSTS, logging, schéma DRF, revue de diff). Mappe directement la doctrine §7 « vérification = 5 checks, evidence avant assertion » + `verification-before-completion`, spécialisée aux projets Django externes enregistrés par chemin. Recadré : tous les checks sont **locaux et déterministes**, aucun egress tiers n'est effectué par la skill. Reformaté §12, Prompt Defense Baseline ajouté.
- **dedup**: chevauchement conceptuel avec `mas-reviewer`/§7 mais distinct : ici pipeline d'outils Django concret (migrations/coverage/bandit), pas le gate générique MAOS. Garde la lentille, recadre sur §7.
- **chemin library**: `packages/skills/library/django-verification/SKILL.md`
- **état**: écrit, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline verbatim, 7 sections §12). 0 secret, 0 import sdk. Re-audit: si outillage (ruff/bandit/pip-audit) change d'interface (>12 mois).

## django-celery
- **décision**: adapt
- **raison**: arsenal tâches async Django+Celery production-grade (entrypoint+settings ACKS_LATE/PREFETCH=1/time-limits, design idempotent garde-par-statut, retry transient-only backoff/jitter, soft-limit cleanup, calling PK-not-object, beat code+DB single-node, canvas chain/group/chord, dead-letter table après max_retries via signal task_failure, monitoring inspect/flower, tests eager+unit mockés). Doctrine idempotency/retry forte. Recadré §5 : exemples paiement/email/CRM = patterns mockés, jamais d'envoi live. Reformaté §12, Prompt Defense Baseline ajouté.
- **dedup**: non — aucun skill async/queue chez nous.
- **chemin library**: `packages/skills/library/django-celery/SKILL.md`
- **état**: écrit, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline verbatim, 7 sections §12). 0 secret, 0 import sdk. Re-audit: si Celery 6 change l'API tasks/canvas (>12 mois).

## fastapi-patterns
- **décision**: adapt
- **raison**: arsenal FastAPI production (app factory + lifespan + CORS, config pydantic-settings, schémas Pydantic v2 Create/Update/Response + model_validator + from_attributes, DI via Annotated type-aliases, async SQLAlchemy session rollback-on-error, JWT défensif, autorisation séparée de l'authentification 401-vs-403, service layer transactionnel s'appuyant sur contraintes DB atomiques IntegrityError→DuplicateUserError plutôt que prechecks race-prone, pagination ordonnée déterministe, bcrypt, tests async httpx ASGITransport + dependency_overrides ; anti-patterns logique-dans-handler / sync-DB-en-async / response_model manquant). Recadré §11/§7 : secrets JWT/DB via env, jamais hardcodés ; handlers fins. Reformaté §12, Prompt Defense Baseline ajouté.
- **dedup**: non — aucun skill FastAPI/API async chez nous.
- **chemin library**: `packages/skills/library/fastapi-patterns/SKILL.md`
- **état**: écrit, conforme exemplar (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline verbatim, 7 sections §12). 0 secret réel (secret_key=ex. via env/.env gitignored), 0 import sdk. Re-audit: si Pydantic 3 / FastAPI majeure change l'API (>12 mois).

---

**Bilan lot H**: 7/7 keepers (décision `adapt` pour tous — arsenal eng-lang fort-en-domaine, 0 dup réel, 0 stub, 0 unsafe, 0 PAYG, 0 import sdk). Aucun reject. 7 SKILL.md écrits dans `packages/skills/library/<slug>/`.
