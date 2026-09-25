# Spec : socle de travail, étape 1 du module d'intégration d'EVE

Chantier `2026-09-10-socle-de-travail`, niveau structurant. Décision d'architecture : `chantiers/_decisions/0002-module-integration-eve.md`. Journal du cadrage : `journal.md`.

## 1. Le besoin, et à qui il sert

Melvyn reprend EVE et dépend d'Edmond pour toute vérification. Il veut être autonome : faire lui même les tests qu'il demandait, et parler avec des preuves. Ses mots le 10/09/2026 : « c'est la base sur laquelle je prépare tout et sur laquelle je peux tout faire. Quand des choses sont validées dessus, on branche sur la vraie base. » Et son critère de qualité : « partir sur une version parfaite pour pouvoir partir en prod, pas un truc à la va vite qu'on devra rechanger plus tard. »

Ce n'est donc pas un outil de dépannage. C'est la première étape du processus d'alimentation final d'EVE, celui qui remplacera à terme les appels manuels un par un dans Swagger.

## 2. Le périmètre de l'étape 1

Dans le périmètre :

1. Une app Django `integration/` qui porte l'ordre réel d'intégration, la résolution des fichiers sources, le déroulé d'un passage et son compte rendu.
2. Une commande de gestion, point d'entrée unique, appelable à la main aujourd'hui et par une tâche planifiée demain.
3. Un manifeste déclaratif : quel dossier source sert quelle clé, quelles extensions, comment choisir le fichier, quelle fréquence attendue.
4. Une base de préproduction `EveDevMel` sur `BDFG-SRV-DEV1`, créée par Melvyn, avec sa procédure écrite et rejouable.
5. Un passage complet réel, joué par Melvyn, dont le compte rendu est montré.
6. Un mémo sourcé : les environnements et les bases (bloc 1), le circuit d'arrivée des fichiers et leurs fréquences (bloc 2).
7. Deux corrections documentaires découvertes en chemin (voir section 10).

Hors périmètre, reporté aux étapes suivantes, avec les points d'accroche prévus dès maintenant :

- L'ordonnanceur portant le calendrier réel des arrivées. **Impossible aujourd'hui pour une raison factuelle** : le seul mode opératoire existant ne couvre qu'un flux sur 21, et les dépôts de fichiers sont manuels. Le champ `frequency` du manifeste recueille la connaissance au fur et à mesure ; l'ordonnanceur la lira.
- La trace des passages en base pour l'idempotence fine. L'app n'a donc **aucun modèle et aucune migration** à l'étape 1.
- La notification par mail. Le module de `csdr_codex` (`mail/`, 3 294 lignes) est repris à l'étape 2 ; `RunReport` est déjà la structure qu'il consommera. **Correction du 11/09** : ce module est passé de EWS à Microsoft Graph (`docs/MAIL_GRAPH_MIGRATION.md`) ; la référence au client EWS écrite le 10/09 venait de la copie figée et était périmée.
- L'alimentation par le client API JUMP (`c:\dev\csdr_codex\api\`, 2 837 lignes). C'est le chantier JUMP, qui viendra brancher un flux supplémentaire dans ce plan.
- La table de trace des passages, donc l'idempotence, donc la bascule automatique de mode (voir « Les modes d'exécution » en section 3).
- La conversion des fichiers `xlsx` en un format accepté. Le besoin est prouvé (un `.xlsx` de 50 Mo coexiste avec son homologue `.parquet` dans le dossier `ISS_ESG`), mais le manifeste le contourne à l'étape 1 en préférant `parquet` puis `csv` et en refusant `xlsx`.

## 3. L'architecture

Calquée sur les couches de `c:\dev\csdr_codex\ingestion\`, réduite à ce que l'étape 1 exige.

> **Avertissement de source, 11/09/2026.** Le cadrage du 10/09 s'appuyait sur `C:\dev\CSDR`, qui est une **copie figée au 20/08/2026**. Le projet vivant est `c:\dev\csdr_codex` (PR mergées jusqu'en septembre, `docs/`, `deploy/`, `scripts/`, pre-commit, pyproject sous `uv`). Toutes les références de cette spec sont réancrées sur `csdr_codex`. Un audit dédié précède l'implémentation : chantier `2026-09-11-audit-csdr-vers-eve`. Ses conclusions peuvent réviser cette spec, et c'est prévu.

### Les modes d'exécution

Point soulevé par Melvyn le 11/09 : « comme pour csdr, faut pas mélanger le premier import et ensuite les imports qu'on peut faire régulièrement ». Il a raison, et CSDR apporte une réponse meilleure que deux chemins séparés.

**Chez CSDR, le mode n'est pas un second programme : il tombe d'un état en base.** Une table `ProcessedFile` retient ce qui a déjà été ingéré. Le mode `--first` retraite tout **parce que cette table est vide** (`docs/DECISION_RETRAITEMENT_HISTORIQUE_2026-08-31.md` : « la table `ProcessedFile` de la base de recette est vide, rien n'est déjà traité »). Un seul code, un seul ordre, une seule pipeline ; l'idempotence porte la distinction.

EVE transpose, avec trois différences de nature à ne pas gommer :

| | CSDR | EVE |
| --- | --- | --- |
| D'où vient le fichier | une boîte mail, pièce jointe | un dépôt manuel sur un partage, 21 dossiers |
| Ce qui déclenche | l'arrivée d'un mail, plus une règle de calendrier | rien aujourd'hui : personne ne surveille le partage |
| Ce qui suit l'insertion | une réconciliation | **un graphe de dépendances** : les référentiels et le propriétaire doivent être reconstruits, mais seulement ceux qui dépendent du flux inséré |

Trois modes en découlent, et le troisième est celui que le découpage du 10/09 avait manqué :

1. **Bootstrap** : base vide, on joue les 23 étapes dans l'ordre complet. C'est l'étape 1 de ce chantier.
2. **Incrémental** : un ou quelques flux ont un fichier neuf. On insère, puis **on ne rejoue que l'aval nécessaire**. Exemple établi par le code : insérer `trucost_coal_issuer_data` ne demande aucune reconstruction de référentiel, parce que ni `Issuer` ni `Asset` ne le lisent ; insérer `jump_issuer_data` impose de rejouer le référentiel issuer, puis le référentiel asset qui en dépend, puis le propriétaire.
3. **Rejeu** : un fichier était faux, on réingère ce flux et son aval, sans toucher au reste.

**Conséquence de conception, et elle est structurante** : `INTEGRATION_PLAN` ne doit pas être une liste plate de 23 étapes, mais un **graphe de dépendances** dont l'ordre complet du bootstrap n'est qu'un parcours parmi d'autres. Le mode incrémental est alors le même parcours restreint à la fermeture transitive des étapes touchées. Une liste plate obligerait à réécrire l'orchestration à l'étape 2 : c'est exactement le « truc à la va vite qu'on devra rechanger » que Melvyn refuse.

Ce que l'étape 1 livre malgré tout : le graphe et le mode bootstrap, plus `--only` qui est déjà un parcours restreint manuel. Ce qu'elle ne livre pas : la table de trace (donc pas d'idempotence automatique, donc pas de bascule automatique de mode), et le déclencheur. Ils viennent à l'étape 2, et le graphe les attend.

```text
integration/
  __init__.py
  apps.py                          IntegrationConfig
  manifest.py                      la connaissance : dossier, extensions, choix, fréquence
  plan.py                          le graphe de dépendances, ses parcours, et le déroulé d'un passage
  eve_api.py                       comment on parle à EVE, et le garde de base cible
  report.py                        StepResult et RunReport
  management/
    commands/
      run_integration.py           le point d'entrée
  tests/
    test_plan_order.py             l'ordre, sans base ni fichier
    test_manifest_consistency.py   le manifeste contre DataKey, sans base
    test_file_resolution.py        le choix du fichier, sur des fichiers vides fabriqués
    test_run_integration.py        la boucle complète, sur sqlite en mémoire
```

Une ligne s'ajoute à `INSTALLED_APPS` (`eve_back/settings.py:33-42`) : `"integration.apps.IntegrationConfig"`, sur le motif explicite de `'data.apps.DataConfig'` plutôt que sur le `"users"` nu, les deux formes coexistant dans le fichier. Aucun autre fichier existant n'est modifié, hors les deux corrections documentaires.

## 4. L'interface publique

### La commande

```text
python manage.py run_integration [--sources PATH] [--only KEY ...] [--dry-run]
                                 [--integration-process-id ID]
```

| Argument | Rôle | Défaut |
| --- | --- | --- |
| `--sources PATH` | racine des fichiers sources | `EVE_SOURCE_ROOT` du `.env` |
| `--only KEY ...` | ne joue que ces étapes, toujours dans l'ordre du plan | tout le plan |
| `--dry-run` | résout les fichiers, affiche le plan, n'écrit rien | désactivé |
| `--integration-process-id ID` | identifiant du passage | horodatage `AAAAMMJJHHMMSS` du lancement |

Invariants :

- Un passage est **un seul** `integration_process_id`, croissant par construction, donc jamais rejeté par le contrôle de `data/schemas/base.py:43-47`.
- **Chaque clé n'apparaît que dans une seule étape du plan** : les 20 clés alimentées par fichier dans leur `insert_data`, la clé calculée dans son `build_proprietary`. C'est ce qui rend `--only` non ambigu, et `test_manifest_consistency.py` le vérifie.
- Une étape en échec **n'arrête pas** le passage : elle est rapportée en rouge et la suivante démarre. Motif repris de la pipeline CSDR, qui isole ses erreurs fichier par fichier. Le code de retour de la commande est non nul s'il reste au moins un échec.
- La commande **refuse de tourner** si le nom de la base configurée n'est pas dans la liste blanche `EVE_INTEGRATION_ALLOWED_DATABASES` du `.env` : `CommandError` avant toute connexion. C'est le garde qui rend mécaniquement impossible un passage accidentel sur `EveDev`, `test1` ou la production. Il est repris de la proposition « interface minimale » et généralisé.

### Le manifeste

```python
# integration/manifest.py

@dataclass(frozen=True)
class SourceDeclaration:
    """Where one data_key finds its source file, and how often it is delivered."""

    data_key: DataKey
    folder: str                                          # relative to the sources root
    extensions: tuple[str, ...] = ("parquet", "csv")     # preference order, xlsx refused
    pick: Literal["newest_by_name", "exact"] = "newest_by_name"
    filename: str | None = None                          # required when pick == "exact"
    frequency: str | None = None                         # what the memo established, plain words
    known_defect: str | None = None                      # reported red, never stops the run


SOURCES: tuple[SourceDeclaration, ...] = (...)           # one entry per file-fed data_key
```

Le choix `newest_by_name` s'appuie sur un fait établi au cadrage : **les dates système ne sont pas les dates de livraison** (dans `ISS_ESG`, un fichier nommé `ISS_export_30032026` porte une date système du 12/06/2026, et le même nom de livraison existe en deux copies datées du 02/01 et du 15/04/2026). La date qui compte est celle du nom.

Le remplissage de `SOURCES` est le travail long du chantier, et **il n'appartient qu'à Melvyn** : l'assistant ne regarde aucun fichier de données. L'appariement des 21 dossiers sources aux 20 clés alimentées par fichier se valide ligne par ligne dans un diff.

### Le plan et le compte rendu

```python
# integration/plan.py

@dataclass(frozen=True)
class Step:
    """One call in the integration graph, and what it must run after."""

    kind: Literal["insert_data", "build_referential", "build_proprietary"]
    key: DataKey | ReferentialKey
    depends_on: tuple[DataKey | ReferentialKey, ...] = ()   # read by this step, proven in code


INTEGRATION_GRAPH: tuple[Step, ...]     # the 23 steps of section 5, with their edges


def bootstrap_order() -> tuple[Step, ...]: ...
    """Full topological walk: the 23 steps, for an empty database."""


def downstream_of(keys: Iterable[DataKey]) -> tuple[Step, ...]: ...
    """Transitive closure: what an incremental or replay run must redo, and nothing more."""


def run_plan(
    *,
    api: EveApi,
    sources: Path,
    integration_process_id: str,
    dry_run: bool = False,
) -> RunReport: ...


# integration/report.py

@dataclass(frozen=True)
class StepResult:
    """The outcome of one step. `detail` never carries a data value."""

    step: Step
    status: Literal["ok", "skipped", "failed"]
    http_status: int | None
    detail: str                          # file name or error message, never a data value
    seconds: float
```

`status="skipped"` quand aucun fichier ne correspond à la déclaration : un flux non encore livré ne casse pas le passage.

### Le transport

Une seule classe, `EveApi`, injectée dans `run_plan`. Elle appelle l'API d'EVE **en intra processus** par `django.test.Client`, qui traverse routage, `AuthBearer`, validation django-ninja, multipart, endpoint et pandera, contre la base configurée. Motif : le dépôt a déjà pris et écrit cette décision (`data/tests/e2e/base.py:1-7`, « Data is seeded through the API itself rather than through the ORM: it is the only way to get in the database exactly what a real integration writes there, preprocessing and column renaming included »), et le processus final tournera avec sa base, sans saut HTTP à faire.

Ce que ce choix ne prouve pas, dit franchement : les limites de taille de requête d'IIS, les délais d'attente et le transport réel de l'en-tête `Authorization` ne sont pas éprouvés. Un envoi manuel dans Swagger avant chaque bascule les couvre. Le transport est isolé dans cette seule classe : un adaptateur HTTP s'ajoute plus tard sans toucher à `plan.py`.

Aucune classe de base abstraite, aucun `Protocol` : le dépôt n'en contient pas un seul. Les tests injectent un enregistreur par simple typage canard.

## 5. La vérité de référence : l'ordre des 23 étapes

Établi depuis le code, vérifié ligne par ligne, et **il corrige `CLAUDE.md`**.

| Ordre | Étape | Pourquoi à cette place |
| --- | --- | --- |
| 1 | `insert_data jump_issuer_data` | source primaire du référentiel issuer |
| 2 | `insert_data bdfg_issuer_data` | fournit `code_issuer_capital_parent` au référentiel issuer |
| 3 | `insert_data iss_asset_data` | **source secondaire de LEI** du référentiel issuer, omise par `CLAUDE.md` |
| 4 | `build_referential issuer` | lit les trois précédents |
| 5 | `insert_data jump_asset_data` | source primaire du référentiel asset |
| 6 | `insert_data bdfg_asset_data` | source du référentiel asset, **omise par `CLAUDE.md`** |
| 7 | `build_referential asset` | lit les deux précédents et le référentiel issuer |
| 8 à 22 | `insert_data` des 15 flux providers restants | aucune dépendance croisée entre eux. `INTEGRATION_PLAN` fixe malgré tout un ordre stable, pour que deux passages soient comparables et qu'un compte rendu se relise toujours pareil |
| 23 | `build_proprietary bdfg_equity_controversy_issuer_data` | consomme les controverses MSCI, ISS et Sustainalytics, plus le référentiel issuer |

Preuves :

- Référentiel issuer, sources : `data/models/referential.py:305-315`, `df_jump = JumpIssuerData.get_latest_dataset_df()`, `df_iss = ISSAssetData.get_latest_dataset_df().filter(pl.col("lei").is_not_null())`, `df_bdfg_issuer_data = BDFGIssuerData.get_latest_dataset_df()`.
- Référentiel asset, sources : `data/models/referential.py:588-595`, `df_jump = JumpAssetData.get_latest_dataset_df()`, `df_bdfg_asset_data = BDFGAssetData.get_latest_dataset_df()`, `df_referential_issuer = Issuer.get_latest_dataset_df()`.
- Une seule clé calculée : `grep -rn "def build_proprietary_data" data/` donne trois occurrences, dont l'endpoint (`data/api.py:339`), la base qui lève `NotImplementedError` (`data/schemas/base.py:143`) et **une seule surcharge** (`data/schemas/issuer_data.py:5813`, `BDFGEquityControversyIssuerDataSchema`). Donc 20 clés alimentées par fichier sur les 21 de `data/type_schema.py:50-72`, et 20 + 2 + 1 = 23 étapes.
- L'insertion ne dépend de rien : `documentation/DATA_INTEGRATION.md:799`, colonne `insert_data`, « Dépendance : Aucune ».

## 6. La base cible

`EveDevMel` sur `BDFG-SRV-DEV1`, créée par Melvyn, authentification Windows comme `EveDev` (`trusted_connection`, aucun mot de passe).

Prérequis à établir avant de créer la base, par une requête en **lecture seule sur `EveDev`**, de la main de Melvyn (l'assistant n'interroge pas `EveDev`) :

```sql
SELECT SERVERPROPERTY('ProductVersion')      AS version_moteur,
       SERVERPROPERTY('Collation')           AS collation_instance,
       DATABASEPROPERTYEX('EveDev', 'Collation') AS collation_evedev,
       d.compatibility_level
FROM sys.databases AS d
WHERE d.name = 'EveDev';
```

Motif : `EveDevMel` doit avoir **la même collation et le même niveau de compatibilité** que `EveDev`, sinon la préproduction ne prouve rien sur les comparaisons de chaînes, les tris et les conversions implicites. C'est précisément le genre de question (`TRY_CONVERT` du chantier DateField) que cette base doit permettre de trancher. Aucune valeur de donnée dans cette requête : uniquement des métadonnées.

Le basculement se fait par `DB_CONFIG` dans `.env`, sans toucher au code : `eve_back/settings.py` lit `DB_CONFIG` via python-decouple, qui regarde `os.environ` avant le `.env`. La liste blanche `EVE_INTEGRATION_ALLOWED_DATABASES` ne contient que `EveDevMel`.

## 7. Le mémo

`chantiers/2026-09-10-socle-de-travail/memo-socle.md`, deux blocs, chaque ligne avec sa source ou marquée non vérifiée.

**Bloc 1, les environnements.** Ce qui est déjà établi : l'API de dev répond sur `http://bdfg-srv-dev1:49153/`, Swagger à la racine, DNS 10.21.7.122 ; la base est `EveDev` sur `BDFG-SRV-DEV1` en authentification Windows ; `test1` est une branche git (`origin/test1`), et **le lien entre cette branche et un site déployé n'est prouvé nulle part** ; `bdfg-srv-app1` figure dans les `ALLOWED_HOSTS` sans que rien ne documente ce qui tourne dessus. Ce qui manque ne peut venir que d'Edmond : voir section 11.

**Bloc 2, le circuit des fichiers.** Ce qui est établi : le partage réel est `\\BDFG-SRV-FILER1\Echange\PROJETS\Data Management\Eve\Providers`, dont `C:\dev\Eve\Providers\` est le miroir ; **les dépôts sont manuels**, un humain se connecte chez le provider, cherche, télécharge et dépose (procédure connue pour `Trucost_Paris_Alignment` : plateforme EDX de S&P, recherche sur le mois passé, fichier `BDFG_ParisAlignment_LYr_YYYYMMJJ`, dépôt en `.csv`) ; le mode opératoire existant **ne couvre que ce flux sur 21**.

Ce qui reste à établir, et comment : l'inventaire des 21 dossiers par noms, tailles, dates et sous dossiers de période, ce qui donne la fréquence réelle sans ouvrir aucun fichier. Chaque fréquence trouvée alimente le champ `frequency` du manifeste.

## 8. La stratégie de test

En test d'abord, comme l'exige `.claude/rules/qualite.md`. La suite tourne sur sqlite en mémoire et **ne touche jamais une vraie base**.

| Test | Ce qu'il prouve | Comment |
| --- | --- | --- |
| `test_plan_order.py` | le parcours bootstrap donne les 23 étapes dans l'ordre, le référentiel issuer vient après ses trois sources, **et la fermeture transitive est juste** : `downstream_of(["trucost_coal_issuer_data"])` ne rejoue aucun référentiel, `downstream_of(["jump_issuer_data"])` rejoue issuer puis asset puis le propriétaire | un enregistreur injecté à la place d'`EveApi` empile les appels. Aucune base, aucun fichier, aucun serveur. `SimpleTestCase` |
| `test_manifest_consistency.py` | chaque clé alimentée par fichier est déclarée exactement une fois, et aucune clé calculée ne l'est | lecture de `typing.get_args(DataKey)` et détection de la surcharge de `build_proprietary_data`. Le test lit la source de vérité du code : rien à maintenir. Motif de `data/tests/test_docs_consistency.py` |
| `test_file_resolution.py` | la préférence `parquet` sur `csv`, le refus de `xlsx`, le choix du plus récent par le nom | fichiers **vides** fabriqués par le test dans `tmp_path`, aux noms réalistes. Aucune donnée lue, même par le test |
| `test_run_integration.py` | la boucle complète peuple bien le référentiel issuer, une étape en échec n'arrête pas le passage, et le garde de base cible refuse une base non autorisée | harnais e2e existant (`data/tests/e2e/base.py`), CSV fabriqués par `build_csv`, GLEIF neutralisé par `gleif_accepting_every_lei` |

Le garde de base cible se teste en pointant `DATABASES` sur un nom hors liste blanche et en vérifiant que `CommandError` est levée **avant** toute connexion.

## 9. Les risques connus, et leur traitement

| Risque | Preuve | Traitement |
| --- | --- | --- |
| `msci_controversy_esg_issuer_data` échoue à l'insertion | `data/tests/e2e/test_insert_data.py:168-197`, `controversy_case_score` est `Int64` au schéma et `CharField` au modèle | déclaré `known_defect` au manifeste, rapporté en rouge, le passage continue. L'étape 23 en dépend : son résultat sera partiel et le compte rendu doit le dire |
| Le premier passage sur base **vide** | construire un référentiel lit sa propre version précédente (`df_old_referential = cls.get_latest_dataset_df()`), qui n'existe pas sur une base neuve. Chemin corrigé tout récemment par Edmond, commit `d17cde8` « get_penultimate_dataset: bug when no data » | c'est le cas le plus exposé du chantier. À jouer explicitement, et à couvrir par `test_run_integration.py` sur base vierge |
| `build_referential issuer` fait un appel réseau réel à GLEIF | `data/functions.py:495-509`, non simulé hors des tests | le passage a besoin d'un accès sortant. À vérifier depuis le poste avant le premier passage, et à rapporter comme échec explicite si l'appel n'aboutit pas |
| `snp_issuer_data` tronque les décimales | `data/tests/e2e/test_insert_data.py:50-70` | hors périmètre, consigné au journal. Le manifeste le note en `known_defect` pour mémoire |
| Le volume : un `.xlsx` de 50 Mo existe côté source | inventaire du dossier `ISS_ESG` | l'étape 1 refuse `xlsx` et préfère `parquet`. Le sujet de la conversion part au chantier providers |

## 10. Les deux corrections documentaires

Sur décision de Melvyn du 10/09, elles roulent avec ce chantier.

1. `documentation/DATA_INTEGRATION.md:827` : « Construire les référentiels **avant** l'insertion de données » est faux et contredit la ligne 793 du même fichier (« Brutes, déjà intégrées ») ainsi que les appels de `data/models/referential.py`. La phrase n'est vraie que pour l'export, qui a besoin des référentiels pour l'appariement (`data/api.py:233-238`). Corrigée dans le style et la langue du fichier.
2. `CLAUDE.md`, ordre d'intégration : incomplet, il omet `iss_asset_data` et `bdfg_asset_data`. Corrigé avec l'ordre de la section 5. `CLAUDE.md` est hors dépôt, la correction est sans risque. Melvyn a par ailleurs ouvert la porte plus largement : « le `CLAUDE.md` était un qu'on a créé sans avoir toutes les connaissances sur le projet, n'hésite pas à proposer des réajustements ». Les autres réajustements sont **proposés**, pas appliqués sans son mot.

## 11. Questions ouvertes, à poser à Edmond

Aucune ne bloque l'étape 1. Toutes conditionnent le mémo et les chantiers suivants.

1. Le site `http://bdfg-srv-dev1:49153/` est il alimenté par la branche `test1` ? Existe-t-il un autre environnement déployé ?
2. Que fait `bdfg-srv-app1`, présent dans les `ALLOWED_HOSTS` et documenté nulle part ?
3. Y a-t-il une base distincte pour `test1` ?
4. Qui dépose les fichiers providers sur le partage, et selon quel calendrier, pour les 20 flux que le mode opératoire ne couvre pas ? Gaëtan est peut-être la bonne personne.
5. Sur quel serveur tournera la tâche planifiée du processus final ?
6. Accord de principe sur l'arrivée d'une app `integration/` dans le dépôt, et sur le fait que des noms de dossiers providers y figurent.

Et une question pour Melvyn, pas pour Edmond : le client API de `C:\dev\CSDR\api\` est il bien le client JUMP ? Aucune occurrence du mot « jump » dans tout CSDR ; les notions manipulées (portefeuilles, ordres, brokers, FX) le suggèrent fortement, mais ce n'est pas vérifié.

## 12. Critères d'acceptation

L'étape 1 est finie quand tout ce qui suit est vrai, chaque point avec sa preuve montrée :

1. `python manage.py run_integration --dry-run` affiche les 23 étapes dans l'ordre de la section 5, avec pour chacune le fichier résolu ou la mention « aucun fichier ».
1bis. Le graphe de dépendances est en place et sa fermeture transitive est prouvée par test : l'étape 2 pourra brancher l'incrémental et le rejeu **sans réécrire l'orchestration**.
2. La suite complète passe, les quatre familles de tests de la section 8 comprises, sur sqlite en mémoire.
3. `/gate` rend PASS, sortie montrée, aucun finding nouveau.
4. La base `EveDevMel` existe sur `BDFG-SRV-DEV1`, avec la même collation et le même niveau de compatibilité que `EveDev`, et sa procédure de création est écrite et rejouable.
5. Un passage réel complet a été joué par Melvyn contre `EveDevMel`, et son compte rendu est au journal : une ligne par étape, les échecs attendus identifiés comme tels.
6. La commande refuse de tourner contre une base hors liste blanche, démonstration faite.
7. Le mémo est écrit, chaque ligne sourcée ou marquée non vérifiée, et les questions à Edmond sont prêtes à être envoyées.
8. Les deux corrections documentaires sont faites.
9. Aucune valeur de donnée provider n'apparaît dans un fichier du chantier, un test, un compte rendu ou une description de PR.
