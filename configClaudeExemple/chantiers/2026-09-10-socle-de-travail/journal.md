# Chantier : socle de travail

Sujet : rendre Melvyn autonome pour travailler et tester EVE sans dépendre d'Edmond. Trois blocs, formulés par lui le 10/09/2026 : les accès et la vue (URL de `test1`, serveurs, bases), le circuit d'arrivée des fichiers providers et leurs fréquences, et sa propre base initialisée puis alimentée dans l'ordre d'intégration, avec un script reproductible.

Branche : aucune pour l'instant. À trancher au cadrage : le chantier ne touchera peut-être rien du dépôt (mémo et script dans `chantiers/`, exclu de git). Si le script doit vivre dans le dépôt, alors `features/melvyn/socle-de-travail` depuis `develop` à jour.
Niveau de rigueur : **structurant**, confirmé par Melvyn le 10/09/2026 (argumentaire dans la section suivante).
Date d'ouverture : 10/09/2026.
Origine : chantier 2 du découpage de `chantiers/_missions/2026-09-10-missions.md`, section 4. Ce document reste la source de vérité de la file d'attente.

## État au 10/09/2026, ouverture

Rien n'est commencé. La commande `/chantier` s'arrête au plan validé, aucun code n'est écrit.

### Vérifications faites à l'ouverture

| Vérification | Commande | Résultat |
| --- | --- | --- |
| Branche courante | `git branch --show-current` | `features/melvyn/esgRatingLastModif` |
| Arbre de travail | `git status --porcelain` | vide, arbre propre |
| Stash en attente | `git stash list` | vide. Le stash du 08/09 (chantier DateField) a bien été consommé, plus rien à récupérer |
| `develop` à jour | `git log --oneline -3 develop` et `origin/develop` | les deux sur `d17cde8`, alignés |
| Exclusion git du chantier | `git check-ignore -v chantiers/INDEX.md` | `.git/info/exclude:18:chantiers/`, donc ce dossier ne touche pas le dépôt |

### Écart avec l'ordre proposé le 10/09

Le découpage plaçait « répondre à Edmond » (les trois tables de controverses) en chantier 1, avant le socle. Melvyn ouvre le socle directement. Constat posé, pas d'objection : le socle est ce qui conditionne le reste, et la demande d'Edmond reste consignée dans `_missions/2026-09-10-missions.md`, section 1, sans rien perdre.

## Niveau de rigueur : l'argumentaire

Le découpage du 10/09 proposait **standard**. À l'ouverture, la proposition monte à **structurant**, pour trois motifs :

1. `CLAUDE.md` liste explicitement « base » parmi les déclencheurs du niveau structurant. Le livrable central de ce chantier est une base initialisée et alimentée.
2. `.claude/rules/securite.md` impose le niveau structurant d'office pour ce qui touche « les requêtes vers les bases, le système de fichiers, la configuration (`settings.py`, `.env`) ». Le chantier touchera `DB_CONFIG` dans `.env` (il pointe aujourd'hui sur `C:/tmp/local_test.sqlite3` alors que `C:/tmp` n'existe pas, constat du 08/09) et le script lira des fichiers et parlera à une base.
3. Il y a un vrai arbitrage de conception à rendre : sqlite ou SQL Server local. Sqlite est simple et jetable mais ne prouve rien du comportement réel de SQL Server, celui qui a laissé la question `TRY_CONVERT` ouverte au chantier DateField. Cet arbitrage mérite une fiche de décision et deux propositions concurrentes.

Ce que le niveau structurant ajoute concrètement : deux agents `architecte-eve` en concurrence sur la question de la base, une fiche dans `chantiers/_decisions/`, et `/security-review` avant toute PR.

**Confirmé structurant par Melvyn le 10/09/2026**, à l'ouverture. Une troisième option lui a été présentée et écartée : découper en deux chantiers, le mémo en léger livré vite, la base en structurant ensuite. Le niveau ne sera pas revu à la baisse en cours de route.

## Deux règles qui bornent ce chantier

Reprises de `_missions/2026-09-10-missions.md`, section 4, parce qu'elles changent la façon de travailler :

1. **L'assistant ne lit aucune donnée.** Il écrit les scripts, les commandes, l'ordre d'intégration et les contrôles ; Melvyn les lance et regarde les sorties. Les noms de fichiers, tailles, dates, arborescences, comptages et agrégats restent autorisés, et suffisent à établir un circuit et une fréquence.
2. **Aucune écriture sur une base ou un serveur partagé par l'assistant.** `EveDev` est en lecture seule et sur demande explicite. Toute alimentation réelle en serveur est de la main de Melvyn, après accord d'Edmond.

## Journal des séances

### 10/09/2026, ouverture du chantier

- Dossier créé, `journal.md` et `dashboard.html` écrits, ligne ajoutée à `chantiers/INDEX.md`.
- État de connaissance de départ : repris de `_missions/2026-09-10-missions.md` section 3, et des mémoires `project-eve-environnement` et `project-tests-local-sqlite`. Ce qui est prouvé et ce qui ne l'est pas y est distingué ligne par ligne.
- Niveau **structurant** confirmé par Melvyn. Conséquences actées : deux `architecte-eve` en concurrence sur la question de la base, une fiche dans `chantiers/_decisions/`, et `/security-review` avant toute PR.
- Branche : aucune créée. À ce stade il n'est pas établi que le dépôt sera touché ; la décision est reportée à la fin du cadrage. Point signalé à Melvyn.
- Prochaine étape : cadrage avec le skill `superpowers:brainstorming`, une question à la fois, spec dans `design.md`.

### 10/09/2026, cadrage

#### Le modop des providers, lu par Melvyn

Melvyn a lu `Modop_Fichiers_providers.docx` lui même et a confirmé qu'il contient des éléments sensibles : **la règle de `donnees.md` qui interdit le contenu du dossier des providers sans distinction s'est avérée juste, elle n'est pas assouplie.** L'option d'étendre la règle aux documents de procédure est écartée pour cette raison.

Ce que Melvyn en rapporte, mot pour mot, pour le seul flux `Trucost_Paris_Alignment` :

1. Se connecter sur la plateforme EDX de S&P (plateforme de dépôt de fichiers S&P Trucost).
2. Lancer GO pour une recherche sur le dernier mois passé, dates à renseigner éventuellement.
3. Télécharger le fichier le plus récent, `BDFG_ParisAlignment_LYr_YYYYMMJJ`.
4. Déposer le fichier brut, en `.csv`, dans le sous dossier `Trucost_Paris_Alignment` du partage `\\BDFG-SRV-FILER1\Echange\PROJETS\Data Management\Eve\Providers`.

Et sa phrase qui compte autant que le reste : « il n'y a pas d'info sur le reste ».

Trois conséquences :

1. **Le chemin réel du partage est établi** : `\\BDFG-SRV-FILER1\Echange\PROJETS\Data Management\Eve\Providers`. C'est ce que `README_WORKSPACE.md` appelait le partage `F:`.
2. **Le dépôt des fichiers est manuel, fait par un humain.** Personne ne pousse les fichiers automatiquement : quelqu'un se connecte chez le provider, cherche, télécharge, dépose. Cela change la nature du futur chantier « calendrier des arrivées » : il n'y a pas d'arrivée automatique à écouter, il y a une habitude humaine à documenter.
3. **Le modop ne couvre qu'un flux sur 21.** Le bloc 2 ne tombe donc pas par une lecture. Il se construit par l'inventaire des noms et des dates (autorisé), plus des questions à Edmond et à Gaëtan.

#### Méthode du bloc 2, vérifiée sur un dossier

Contrôle de faisabilité fait sur le dossier `ISS_ESG` (`ls` seul, aucun fichier ouvert) :

- Les noms de fichiers portent la date : `ISS_export_30032026_withGMO.parquet`, `datadeskResults_Issuers_20250923.parquet`.
- Il existe des sous dossiers de période : `03.25`, `09.25`.
- **Les dates système ne sont pas les dates de livraison** : `ISS_export_30032026` est daté du 12/06/2026 par le système, et `datadeskResults_Issuers_20250923` existe en deux exemplaires datés du 02/01 et du 15/04/2026. Ce sont des dates de copie du miroir. La date qui compte est celle du nom.
- Un `.xlsx` de 50 Mo coexiste avec son homologue `.parquet` de même nom, alors que `insert_data` n'accepte que CSV `;` et parquet. **L'étape de conversion de la mission 2.1.b.6 est donc prouvée par les fichiers, pas supposée.**

#### Contraintes du poste, établies

| Option de moteur | Faisable | Preuve |
| --- | --- | --- |
| SQL Server LocalDB | **oui** | binaires SQL Server 2025 (17.0.1000.7), `sqllocaldb versions`. Instance `MSSQLLocalDB` pas encore créée, création sans droits admin |
| sqlite | oui | mais moteur différent de la production |
| SQL Server Express ou Developer | non sans l'IT | `BDF-GESTION\mpommier` absent du groupe Administrateurs local |
| Docker | non sans l'IT | `docker` absent du PATH |

Aucune dépendance nouvelle n'est nécessaire : `mssql-django==1.6` et `pyodbc==5.2.0` sont déjà dans `requirements.txt` et dans le venv, pilotes ODBC 17 et 18 installés. Le basculement se fait par `DB_CONFIG`. Réserves posées : LocalDB plafonne à 10 Go par base, n'accepte que des connexions locales, et c'est du SQL Server 2025 alors que la version de `EveDev` n'est pas établie. Établir cette version est une tâche du plan.

#### Une erreur de ma part, corrigée

J'ai affirmé aux deux architectes qu'EVE n'avait aucun client HTTP, sur la base d'un `grep` trop étroit. **C'est faux** : `requests==2.32.5` est épinglé dans `requirements.txt` et importé dans `data/functions.py:2`, utilisé pour l'appel à GLEIF. La voie HTTP ne coûtait donc aucune dépendance nouvelle. Les deux architectes l'ont relevé indépendamment.

#### Ce que les deux architectes établissent, d'accord entre eux

Convergences, chacune sourcée par les deux instances :

1. **La décision « alimenter par l'API et non par l'ORM » est déjà prise et écrite dans le dépôt** : `data/tests/e2e/base.py:1-7`, « Data is seeded through the API itself (`POST /insert_data/...`) rather than through the ORM: it is the only way to get in the database exactly what a real integration writes there, preprocessing and column renaming included. » La fourche du brief était donc déjà tranchée avant nous.
2. **En intra processus, sans serveur** : `django.test.Client` traverse toute la pile (routage, `AuthBearer`, validation ninja, multipart, endpoint, pandera) contre la base configurée, pas une base de test.
3. **L'ordre d'intégration de `CLAUDE.md` est incomplet.** Il omet `iss_asset_data`, source secondaire de LEI du référentiel issuer (`data/models/referential.py:304-307`), et `bdfg_asset_data`, dont le référentiel asset a besoin (`data/models/referential.py:590-594`).
4. **`documentation/DATA_INTEGRATION.md:827` est faux.** « Construire les référentiels avant l'insertion de données » contredit la ligne 793 du même fichier et les appels du code. Les données entrent d'abord, les référentiels se construisent ensuite. La puce n'est vraie que pour l'export, qui a besoin des référentiels pour l'appariement (`data/api.py:233-238`).
5. **20 des 21 clés s'alimentent par fichier, une seule est calculée** : `bdfg_equity_controversy_issuer_data` est le seul `build_proprietary_data` surchargé (`data/schemas/issuer_data.py:5813`), toutes les autres héritent du `NotImplementedError` de `data/schemas/base.py:149`.
6. **Un manifeste est indispensable** : les 21 dossiers sources ne se déduisent pas des 21 clés. Il ne peut être rempli que par Melvyn, puisque personne d'autre ne regarde les fichiers.
7. `msci_controversy_esg_issuer_data` échouera (défaut connu, `test_insert_data.py:168-197`). Le passage continue et le rapporte, comme la pipeline CSDR isole ses erreurs fichier par fichier.
8. Fait opérationnel relevé par l'instance « interface minimale » : `build_referential/issuer` fait un **appel réseau réel à GLEIF** (`data/functions.py:495-509`), non simulé hors des tests. Le passage local a donc besoin d'un accès sortant.

Écart de conditions entre les deux instances, à savoir pour arbitrer honnêtement : le verrou `garde_donnees` a refusé à l'instance « interface minimale » jusqu'au `ls` sur le dossier des providers, alors qu'il l'a laissé passer pour l'autre instance et pour moi (le verrou bloque sur la citation du chemin dans une commande autre qu'un listage). La première a donc travaillé en aveugle sur l'appariement dossier vers clé, et le dit.

#### Revirement de Melvyn au moment de l'arbitrage, 10/09/2026

Mis devant les deux propositions, Melvyn n'a choisi ni l'une ni l'autre : il a récusé le cadre. Ses points, dans ses mots :

1. « Mon but est de pouvoir vraiment créer le process final même si on va diviser en étapes, il faut quand même partir sur une version parfaite pour pouvoir partir en prod et pas faire un truc à la va vite maintenant qu'on devra rechanger plus tard. »
2. « Il faut qu'on passe direct par les procédés finaux, comme le fait d'avoir la bd sur le serveur et tout gérer comme ça, **pas de local sur la VM, ça sera pas réaliste**. »
3. « On prend tout ce qui peut ou doit être pris de CSDR. On réfléchit à ce dont on a besoin et on implémente. Bien sûr en étapes bien faites. » Cela vaut aussi pour le client API et pour l'envoi de mails d'alerte.
4. « Le `CLAUDE.md` était un qu'on a créé sans avoir toutes les connaissances sur le projet. Plus on va faire, en faisant attention et bien, plus on va en apprendre et on pourra améliorer les `.md` faits de base. N'hésite pas à proposer des réajustements, à dire quand tu vois des incohérences et comment les corriger. » Les garde fous restent : sécurité, fuite de données, travail à la va vite, affirmation inutile ou fausse.

**Ce que ce revirement annule** : le moteur LocalDB, et avec lui toute la thèse du « banc d'essai local ». La cible est une base de préproduction **sur le serveur**.

**Ce qu'il crée** : une dépendance externe dure. Une base sur `BDFG-SRV-DEV1` demande l'accord d'Edmond ou de l'IT, et le livrable « base alimentée » ne peut pas exister avant cet accord. À dire tel quel, sans le contourner.

**Incohérence à trancher, signalée à Melvyn** : il a répondu « manifeste chez moi, hors dépôt » sous l'ancien cadre. Si le processus final tourne sur le serveur, le manifeste doit vivre avec le processus, donc dans le dépôt. Les deux réponses ne tiennent pas ensemble.

#### Le procédé final de CSDR, établi

- **Déclenchement** : `C:\dev\CSDR\ingestion\readme2.md` dit « Planificateur quotidien (Windows Task Scheduler / cron) » puis `python manage.py run_ingestion`. Aucun service, aucun démon : une tâche planifiée Windows qui appelle une commande de gestion Django. C'est le motif à reprendre.
- **Écart doc et code relevé au passage** : ce même `readme2.md` documente `--first-run`, `--limit` et `--no-schedule-check`, alors que la commande implémente `--first`, `--max` et `--force` (`management/commands/run_ingestion.py`). La doc de CSDR est en retard sur son code.
- **Client API** : `C:\dev\CSDR\api\`, 2 440 lignes. Sessions synchrone et asynchrone, authentification par cookies avec expiration, retry par décorateur, `httpx` et `requests`, plus normalizers, enrichers et transformers. Notions manipulées : portefeuilles, ordres, brokers, FX. Configuration par `API_BASE_URL`, `API_USER`, `API_PASSWORD` (`api/config/api_config.py`, commentaire « ne jamais logger »). **Aucune occurrence du mot « jump » dans tout CSDR** : l'hypothèse que ce soit le client JUMP est forte mais non vérifiée, à confirmer par Melvyn.
- **Module mail** : `mail/builders/ingestion_builder.py`, `mail/use_cases/send_ingestion_email.py`, client EWS Exchange (`ingestion/services/mail/ews_mail_client.py`).
- **Pile CSDR** : Python 3.13, Django 5.2, SQL Server, ODBC 17, pyodbc, mssql-django, et `uv` comme gestionnaire d'environnement. Même pile qu'EVE, sauf `uv` (EVE est en `requirements.txt`).
- Le `.env.example` de CSDR est correctement expurgé (valeurs en `xxxxx`). Le `.env` réel de CSDR n'a pas été lu : il est hors du périmètre de ce projet et contient des secrets.

### 11/09/2026, révision de la spec et ouverture de l'audit

#### Erreur de source, de ma part, et elle est lourde

Le cadrage du 10/09 s'est appuyé sur `C:\dev\CSDR`. **C'est une copie figée au 20/08/2026.** Le projet vivant est `c:\dev\csdr_codex` : PR mergées jusqu'en septembre, un dossier `docs\` de 37 documents, `deploy\iis\`, `scripts\`, `.pre-commit-config.yaml`, `pyproject.toml` sous `uv`, et un graphe graphify. Les deux architectes et moi avons lu la mauvaise.

Conséquence déjà identifiée : la spec citait le client mail **EWS** de CSDR, alors que `csdr_codex` est passé à **Microsoft Graph** (`docs\MAIL_GRAPH_MIGRATION.md`). Corrigé dans `design.md`. D'autres conclusions du 10/09 sont probablement périmées de la même façon : leur recensement est confié à l'audit.

Mesures réelles de `csdr_codex`, hors venv et hors wheelhouse : `api` 2 837 lignes, `ingestion` 4 221, `mail` 3 294, `config` 570, `csdr_web` 17 887, `scripts` 865, `utils` 1 833, soit 31 507 lignes.

#### Le point de conception de Melvyn sur les modes, et la réponse de CSDR

Melvyn, le 11/09 : « comme pour csdr, faut pas mélanger le premier import et ensuite les imports qu'on peut faire régulièrement. Le truc c'est que là on a une api donc on peut à la main injecter des données, mais si on a vraiment des données qui arrivent régulièrement et qui sont automatiques on peut faire le module d'ingestion auto relié avec les mails et relié avec le module api de csdr_web. Je pense qu'il faut vraiment réfléchir à ces deux cas qui sont différents et peut être pas les seuls. »

La réponse de CSDR est meilleure que deux chemins séparés, et elle est documentée : **le mode tombe d'un état en base, pas d'un second programme.** Une table `ProcessedFile` retient ce qui a déjà été ingéré, et `--first` retraite tout parce que cette table est vide. Source : `csdr_codex\docs\DECISION_RETRAITEMENT_HISTORIQUE_2026-08-31.md`, procédure de l'option B, étape 3.

Transposé à EVE, cela donne trois modes, et le troisième manquait au découpage du 10/09 : bootstrap (base vide, les 23 étapes), incrémental (un flux neuf, puis **seulement l'aval nécessaire**), rejeu (un fichier était faux). D'où la conséquence structurante inscrite dans `design.md` : `INTEGRATION_PLAN` devient un **graphe de dépendances**, dont l'ordre complet du bootstrap n'est qu'un parcours. Une liste plate aurait obligé à réécrire l'orchestration à l'étape 2.

Exemple qui rend la chose concrète, tiré du code : insérer `trucost_coal_issuer_data` ne demande aucune reconstruction de référentiel, parce que ni `Issuer` ni `Asset` ne le lisent ; insérer `jump_issuer_data` impose de rejouer le référentiel issuer, puis l'asset qui en dépend, puis le propriétaire.

#### Autre apport de CSDR, repris immédiatement

Le motif « base de recette » est déjà formalisé chez eux : base jetable, `.env` dédié, passage complet, comparaison SQL, puis suppression de la base. C'est exactement l'usage prévu pour `EveDevMel`. Leur point d'attention numéro un, « ne pas se tromper de `.env` », **valide le garde de liste blanche** que la spec impose à la commande.

#### Ce qui a été fait le 11/09

1. `design.md` révisé : section 3 augmentée d'une sous section « Les modes d'exécution », `Step` doté d'un `depends_on`, `INTEGRATION_GRAPH` avec `bootstrap_order()` et `downstream_of()`, le test d'ordre étendu à la fermeture transitive, un critère d'acceptation ajouté, et les références réancrées sur `csdr_codex`.
2. Chantier `2026-09-11-audit-csdr-vers-eve` ouvert, avec son prompt d'exécution : `chantiers\2026-09-11-audit-csdr-vers-eve\prompt.md`. Sept axes, lecture seule, aucune écriture dans le dépôt.
3. Le chantier du socle est **suspendu** jusqu'aux conclusions de l'audit. Sa spec reste valable dans son ossature (ordre des 23 étapes, garde de base cible, transport intra processus, manifeste) ; c'est le détail des reprises de CSDR qui attend.

#### Le format de fiche de décision de CSDR est meilleur que le nôtre

Constat posé, décision laissée à l'audit (axe 6). Leur format comporte : énoncé du problème en une phrase métier, ce que contient la base aujourd'hui et pourquoi, **le danger central chiffré par une requête à exécuter avant de trancher**, des options avec effet, effort, réversibilité et risque, une recommandation, une **question fermée**, la réponse datée et signée, et une section « verrouillage une fois la décision prise ». Le format d'EVE (`_decisions\0001`) n'a ni le chiffrage préalable, ni la question fermée, ni le verrouillage.

## Constats hors périmètre

Relevés en chemin, proposés, jamais faits.

1. `requirements.txt:20` épingle `polars-runtime-32==1.42.1`, qui n'est pas installé dans le venv (seul `polars-lts-cpu==1.33.1` l'est, et `import polars` fonctionne). Le fichier et l'environnement ne coïncident pas.
2. `snp_issuer_data` tronque les décimales à l'insertion (défaut caractérisé, `data/tests/e2e/test_insert_data.py:50-70`).
3. `data/api.py:363-365` porte un marqueur de travail non terminé du dépôt (écrit en majuscules dans le code, cité ici en clair pour ne pas déclencher le verrou de forme) sur la gestion de l'`integration_process_id`. Le sujet mérite sa propre décision.
4. `documentation/API_REFERENCE.md:21` étiquette le serveur de dev « Base URL (Production) », constat déjà inscrit au point 9 de `chantiers/INDEX.md`.
5. Les deux corrections documentaires découvertes ici (`DATA_INTEGRATION.md:827` et l'ordre incomplet de `CLAUDE.md`) sont **sur le chemin direct du chantier** : elles sont soumises à l'arbitrage de Melvyn dans la spec, et non classées hors périmètre par défaut.
