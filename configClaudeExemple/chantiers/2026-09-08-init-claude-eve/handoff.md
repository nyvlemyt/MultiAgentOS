# Handoff : dispositif Claude Code pour EVE

Écrit le 08/09/2026 à la fin de la session d'installation. La prochaine session commence par la validation du dispositif, puis le chantier 2 (compréhension du projet).

## Où on en est

Le dispositif est installé et vérifié (`journal.md`, section « vérification finale »). Rien n'est entré dans le dépôt : `git status` vide sur `develop`, tout est exclu par `.git/info/exclude`. Les verrous se sont activés à chaud pendant l'installation et ont été testés (33 tests, auto-tests de `doctor --complet`, gate FAIL puis PASS).

Ce qui reste à Melvyn, hors périmètre d'écriture de l'assistant :

1. `chantiers/2026-09-08-init-claude-eve/a_lancer_par_melvyn.ps1` sans argument (constat), puis `-Apply` : corrige le lanceur `eve.cmd` (pointe encore sur `C:\dev\EVE`) et réduit l'ancien bucket mémoire `c--dev-EVE` à une redirection.
2. Relancer Claude Code depuis `eve.cmd` ou VS Code (dossier `C:\dev\Eve\EveBackEnd`). Vérifier : la ligne `doctor EVE : ...` au démarrage ; une question de contrôle (« quel est l'ordre d'intégration des sources ? », réponse attendue : jump_issuer et bdfg_issuer, référentiel issuer, jump_asset, référentiel asset, puis les providers) ; un verrou à la main (demander de lire un fichier de `C:\dev\Eve\Providers` : refus attendu).
3. Relire dans son style `chantiers/_cadre/Cadre_assistant_IA_EVE.md` avant de le montrer à Edmond.

## Points ouverts (dashboard, section « À valider par toi »)

Exemptions de `verif_style` (fixtures des tests, dossier mémoire) ; limite de `garde_perimetre` sur les variables de shell ; hook `post-checkout` et merge driver de graphify (garder ou retirer) ; le cadre pour Edmond.

## État git

Branche `develop` = `origin/develop` (`d17cde8`). Arbre propre. Un stash : `esgRatingLastModif: iss_esg_rating_last_modification en DateField (WIP 08/09/2026, 158 tests OK, non relu par Melvyn)`, à réappliquer sur `features/melvyn/esgRatingLastModif` seulement (`journal.md` du chantier DateField).

## Prochaine session : chantier 2, compréhension du projet

Objectif de Melvyn : savoir où arrivent les fichiers, à quelle fréquence, quoi intégrer et dans quel ordre, quel serveur de test interroger, avant toute base locale. Sources : `documentation/` (à jour), `C:\dev\Eve\README_WORKSPACE.md`, `Documentation Projet Tania\Notes\passation_notes.md` et les notes hebdo, `Modop\`, `Providers\Modop_Fichiers_providers.docx` (lecture du docx autorisée, jamais des fichiers de données), les commits d'Edmond sur `develop`.

Skills à appeler (Skill tool) : `superpowers:brainstorming` via `/chantier comprehension-projet` ; `domain-modeling` pour compléter `CONTEXT.md` ; `explain-diff` sur les commits d'Edmond (`git log develop`) ; agents `chercheur-eve` pour reconstituer la procédure d'intégration. `graphify query` avant toute lecture de code.

## Fichiers de ce chantier

`design.md`, `plan.md`, `journal.md`, `dashboard.html`, `a_lancer_par_melvyn.ps1`, ce handoff.
