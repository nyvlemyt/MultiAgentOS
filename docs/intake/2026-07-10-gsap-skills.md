# Intake — gsap-skills (2026-07-10)

- **Type** : repo (collection officielle de skills Agent Skills / Claude Code pour GSAP)
- **Source** : https://github.com/greensock/gsap-skills
- **Récence / obsolescence** : actif (effort officiel GreenSock post-acquisition Webflow ; GSAP 100 % gratuit, plugins premium inclus) / **low** — GSAP est une lib mature et stable, le vendor maintient le repo.
- **Résumé** :
  - 8 skills au format standard SKILL.md : gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-plugins, gsap-utils, gsap-react (useGSAP), gsap-performance, gsap-frameworks (Vue/Svelte).
  - Officiel (org `greensock`), 11,2k étoiles, 666 forks, MIT.
  - Pure documentation pour agents — zéro dépendance, zéro exécution de code, zéro clé API.
  - Install proposée via `npx skills add …` (non pinné → on ne l'utilisera pas), marketplace Claude Code, ou copie manuelle.

## Guardrails (étape 0)

- **Subscription-only (§11)** ✓ — aucun service payant, aucune clé. *(pas de kill)*
- **Local-first** ✓ — fichiers Markdown statiques.
- **Pas de framework sans ADR** ✓ — les skills sont de la *doc d'arsenal*, pas une dépendance runtime. (Adopter GSAP comme lib dans `apps/web` serait une décision séparée, hors de ce dossier.)
- **Exécution de code (§5)** ⚠ — le repo lui-même n'exécute rien, mais l'ingestion physique (clone + distillation dans `packages/skills/library/`) exige un `mas-sec-reviewer` PASS + scan Sanitize **avant** que le moindre fichier entre. L'installeur `npx skills add` (exécution externe non pinnée) est proscrit par le maintainer-safe rewrite.

## Fit

- **Doublon ?** Non — grep sur `gsap|animation|motion` : aucune couverture GSAP dans l'arsenal ni dans `docs/knowledge/`. `frontend-design` mentionne la lib Motion pour React et le CSS-first, mais rien de scroll-trigger/timeline/GSAP. Net-new dans son domaine.
- **Surface** : `packages/skills/library/` (arsenal froid, ADR 0005) + regen de `index.json`. Ne touche pas la colonne vertébrale (orchestration/mémoire/sécurité) → **T2 arsenal**.
- **Valeur concrète** :
  1. Missions sur projets externes utilisant GSAP (MAOS pilote des projets tiers par chemin absolu) — l'agent frontend dispose de la doc vendor au format progressive-disclosure.
  2. Candidat pour le cockpit lui-même : `PRODUCT_SPEC.md` §Orbit view demande des "edge animations" entre agents — si GSAP est un jour retenu pour ça, l'arsenal est prêt (mais ce choix de dépendance reste hors dossier).
- **Wide-bar rule** : pas dup-no-better, pas stub (8 skills opérationnels), pas unsafe → **keep**.

## Coûts

- **Install** : faible — clone en scratchpad, scan, copie des 8 SKILL.md dans `library/`, génération des L1 summaries (≤200 tok chacun), header Prompt Defense Baseline, regen index. Budget ~1 mission courte.
- **Maintenance** : GreenSock maintient la source ; notre copie est froide (chargée à la demande). Dérive possible si GSAP release une v majeure → re-sync ponctuel.
- **Retrait** : trivial — 8 dossiers isolés dans `library/`, suppression + regen index. Rien ne s'enracine.

## Sanitize (étape 4.bis)

**À exécuter à l'ingestion, pas encore fait** — ce dossier décide depuis les pages publiques GitHub uniquement ; aucun contenu n'est encore copié dans MAOS. Le scan regex complet (secrets/PII/refs internes) + le `mas-sec-reviewer` PASS sont des pré-conditions bloquantes de la mission d'intégration (DoD ci-dessous). Signal a priori favorable : vendor officiel, pure doc, MIT.

## Score

project_fit 3 / token_efficiency 4 / safety 4 / implementation_effort 4 / evidence_maturity 5 / user_value 3 / phase_compatibility 4

(safety 4 et pas 5 : le chemin d'install `npx skills add` non pinné existe dans le README — neutralisé par la copie manuelle ; evidence 5 : vendor officiel + 11,2k étoiles.)

## KILL check

- PAYG / clé API → non. Framework lourd → non (doc pure). Hors phase → non (l'arsenal froid ADR 0005 est un mécanisme livré ; l'élargir est routinier). Preuve faible → non (officiel).
- **Aucun veto.** Seule condition bloquante : sec-review + sanitize avant ingestion physique (§5).

## Décision

**`adapt_now`** (T2 arsenal) — Net-new dans l'arsenal (zéro couverture GSAP), source vendor officielle MIT à maturité maximale, pure doc sans dépendance, réversible trivialement. Adaptation obligatoire plutôt qu'import brut : copie manuelle pinnée (jamais `npx skills add`), scan Sanitize + `mas-sec-reviewer` PASS avant ingestion, L1 summaries ≤200 tok, header Prompt Defense Baseline sur chaque skill (défauts du step 8).

## Appropriation

- **Version MAOS** : 8 entrées dans `packages/skills/library/` au format arsenal (L1 summary → L2 body), taguées domaine `frontend/animation`, routées par `mas-skill-router` sur les tâches UI/animation uniquement.
- **Moins cher** : le router ne lit que les L1 (§6) ; les bodies GSAP (longs, très code) ne se chargent qu'à l'exécution d'une tâche animation. Envisager de fusionner `gsap-utils` + `gsap-performance` si leurs bodies sont courts (moins d'entrées d'index).
- **Adapter l'item, pas le projet** : aucun changement de doctrine ; c'est un ajout d'arsenal standard.

## Plan

- **Phase** : intégrable dès maintenant via le mission lifecycle (mécanisme ADR 0005 existant) ; priorité T2 (après tout T1 en file).
- **Fichiers** : `packages/skills/library/gsap-*/` (8), regen `index.json` (`pnpm --filter @mas/skills build-library-index`).
- **Agents/skills** : mission planner → dispatcher ; `mas-sec-reviewer` PASS **avant** copie ; `mas-reviewer` en sortie.
- **Tokens** : ~1 mission courte (clone scratchpad + scan + 8 résumés L1).
- **DoD binaire** : (1) sec_review_verdict PASS enregistré ; (2) scan Sanitize 0 CRITICAL ; (3) 8 skills en library avec L1 ≤200 tok + header Defense Baseline ; (4) index regénéré ; (5) 5 checks de vérif verts.
- **Validation humaine** : non (risk low, pure doc) — hors le PASS sec-review déjà exigé.
- **Ne PAS faire** : ne pas utiliser `npx skills add` ni le plugin marketplace (exécution/config non auditée) ; ne pas ajouter `gsap` comme dépendance npm de `apps/web` (décision séparée, ADR-light si un jour l'Orbit view le justifie) ; ne pas charger les bodies dans le router.

## Ré-audit

Re-sync si GSAP publie une version majeure, ou si le repo source dépasse 12 mois sans commit (vérifier à l'ingestion la date du dernier commit — non visible depuis la page au moment de l'audit).
