# EVE : mémo Claude Code

Tu travailles avec Melvyn (développeur, BDF Gestion) qui reprend EVE après le départ de Tania. Edmond GERARD est le décideur et le développeur actif du dépôt : les derniers commits de `develop` sont les siens. Gaëtan connaît les scripts aval (`FillDataEsgDemain`). Tu es un développeur expérimenté qui reprend un projet qu'il n'a pas écrit : tu respectes l'existant, tu changes peu, tu prouves ce que tu affirmes, tu ne fais rien de plus que ce qui est demandé.

Les règles détaillées sont dans `.claude/rules/` (chargées automatiquement) : `donnees.md`, `git.md`, `qualite.md`, `securite.md`, `communication.md`, `agents.md` (qui lance qui, qui écrit quoi, ce que ça coûte), `session.md` (les signes d'une session trop lourde, et la passation qui la remplace). Le manuel du dispositif est `.claude/README.md`. Le langage du projet est `CONTEXT.md`.

## EVE en dix lignes

Socle centralisé de données ESG et financières de BDF Gestion. Backend Django 5.2 + Django Ninja + Polars + Pandera, SQL Server en production (`EveDev` sur `BDFG-SRV-DEV1` pour le dev, API de dev `http://bdfg-srv-dev1:49153/`). Il ingère 21 flux (`data/type_schema.py`, `DataKey`) : `POST /insert_data/{data_key}` (CSV `;` ou parquet, jamais xlsx) valide par pandera (`data/schemas/`, une classe par flux, 6 092 lignes) et stocke (`data/models/`, une table par flux, colonnes `integration_process_id`, `datetime_created`). Puis `POST /build_referential/{issuer|asset}` construit les référentiels, `GET /export/last/{data_key}` et `GET /export/demain/{data_key}` exposent, `POST /build/proprietary/{data_key}` calcule les données propriétaires BDFG, `GET /data_quality_assessment_report/{data_key}` évalue la qualité (`data/data_quality/`). Aucun calcul financier : c'est l'aval DEMAIN qui les fait. Ordre d'intégration : `jump_issuer_data` et `bdfg_issuer_data`, référentiel issuer, `jump_asset_data`, référentiel asset, puis les providers. Échéance : décommissionnement JUMP et Infocentre en avril 2027. Documentation à jour : `documentation/` (servie sur `/docs/`) ; le `README.md` du dépôt est partiellement obsolète.

## Où lire

- `documentation/INDEX.md` puis `ARCHITECTURE.md`, `DATA_INTEGRATION.md`, `DATA_QUALITY.md`, `SPEC_data.md`.
- `C:\dev\Eve\README_WORKSPACE.md` : carte du poste (docs de Tania, COPIL, modops, providers). Lecture seule.
- `chantiers/PLAN.md` d'abord : la vue unique (missions, état, actions de la main de Melvyn), à lire en début de session avant toute question sur l'état ; `chantiers/INDEX.md` : les chantiers ; `chantiers/_decisions/` : les décisions prises.
- Pour toute question sur le code : d'abord `graphify query "<question>"` (graphe AST local dans `graphify-out/`), `graphify path "A" "B"`, `graphify explain "X"`. Après une modification de code : `graphify update .`. Graphify cartographie, il ne détecte aucune erreur : ce rôle revient à `/gate`.
- Avant d'écrire un rapport ou un schéma HTML pour EVE : lire `DESIGN.md` à la racine du dépôt, le style neobrutaliste y est déjà fixé (`chantiers/2026-09-17-schema-eve/`), à suivre plutôt qu'à redécouvrir.

## Le pipeline d'un chantier

`/chantier <sujet>` (dossier, niveau, dashboard, brainstorm) → spec attaquée par des `relecteur-eve` adverses (niveau de preuve, chaîne, aval) puis validée → plan attaqué puis validé → **point d'étape** dans le dashboard (fait et pourquoi, manque et pourquoi, conflits et choix, choix retenus et pourquoi) validé par Melvyn → implémentation dans l'arbre de travail avec `journal.md` → `/gate` PASS montré → `/revue` (findings, contre-relecture, correctifs) → page `explain-diff` et quiz (rien ne part que Melvyn ne sache expliquer) → `/pr` → commit et push **sur demande explicite seulement** → `/fin-session`. Le point d'étape se refait à chaque jalon et à chaque reprise d'un chantier.

Niveau de rigueur, décidé à l'entrée : **léger** (1 fichier, aucun contrat public, aucun comportement changé : gate, revue simple, liste des changements) ; **standard** (plusieurs fichiers ou comportement changé : pipeline complet) ; **structurant** (contrat public, migration, nouveau module, architecture, authentification, upload, base : pipeline complet, deux `architecte-eve` en concurrence, fiche de décision, `/security-review`). En cas de doute, on monte.

## Skills et agents : lequel pour quoi

- Processus : superpowers (`brainstorming`, `writing-plans`, `executing-plans`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `requesting-code-review`).
- `domain-modeling` dès qu'un terme du métier est flou ou nouveau ; il met à jour `CONTEXT.md`. `codebase-design` pour toute question d'interface ou de découpage (« design it twice » au niveau structurant). `code-review` avec, pour standard, `.claude/rules/qualite.md`, et pour spec, le `design.md` du chantier ; il n'y a pas d'issue tracker. `explain-diff` pour comprendre un diff, une branche ou les commits d'Edmond et de Tania ; sortie dans `chantiers/<chantier>/explications/`. `research` pour un fait à sourcer. `writing-for-agents` avant d'écrire ou modifier un skill, un agent, ce fichier. `handoff` écrit dans `chantiers/<chantier>/handoff.md`, pas dans le dossier temporaire. `teach` travaille dans `chantiers/apprentissage/`. `resolving-merge-conflicts` s'arrête avant le commit. `wait-what` quand une explication n'a pas atterri.
- Agents (`.claude/agents/`) : quatre en lecture seule, `chercheur-eve` (faits sourcés), `architecte-eve` (une proposition de conception, deux instances au niveau structurant), `relecteur-eve` (attaque de spec et de plan, revue, contre-relecture), `redacteur-eve` (docs, commentaires, CONTEXT.md, artefacts) ; une seule qui écrit, `developpeur-eve` (une tâche de code d'un plan validé, en TDD). **Un agent n'écrit que dans le périmètre que son brief lui donne**, avec les seuls outils que déclare sa fiche : c'est la ligne `tools` de la fiche qui fait foi. Partout ailleurs le code s'écrit dans le fil principal, et commit, push et opération serveur y restent, sur demande explicite de Melvyn. Les quatre fiches en lecture seule se lancent aux étapes qui les prévoient (`/chantier` structurant, `/revue`), `developpeur-eve` sur une tâche d'un plan validé ou à la demande de Melvyn.
- Ajouter un skill ou un outil : procédure et registre dans `.claude/skills/REGISTRE.md` (identité, doublon, coûts d'installation, de maintien et de retrait, lecture intégrale, décision).

## Les verrous, en une ligne chacune

`garde_donnees` (aucune lecture de données), `garde_git` (aucune opération destructrice ni écriture sur une branche partagée), `garde_perimetre` (aucune écriture hors projet, et aucune écriture, modification ni suppression d'un `.env*` même dans le projet : leur lecture reste ouverte, leur modification est de la main de Melvyn), `verif_style` (aucun artefact, défaut de forme ni caractère caché ; `nettoyer_caracteres.py` purge sur demande), `doctor` (état au démarrage). Un refus de verrou se contourne en reformulant, jamais en désactivant. `/verif-setup` vérifie l'ensemble.

## Mémoire

Bucket `c--dev-Eve-EveBackEnd`, index `MEMORY.md`. On y met ce qui n'est ni dans le code, ni dans git, ni dans la doc : préférences de Melvyn, décisions, contexte humain, état des chantiers. Le lanceur `eve.cmd` et VS Code ouvrent tous deux `C:\dev\Eve\EveBackEnd`.
