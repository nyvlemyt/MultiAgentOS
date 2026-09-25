# Retour de Melvyn du 21/09/2026 : sa vision d'EVE, et la réunion du 22/09 avec Edmond, Alice et Gaëtan

Mots de Melvyn, à l'oral, le 21/09/2026 vers 17 h, mis en forme par le fil sans rien retirer. Ce document remplace le cap du 14/09 (`2026-09-14-retour-reunion-edmond.md`, `_decisions/0008`) comme source du plan. **Statut : récapitulatif validé par Melvyn le 21/09 vers 18 h, avec les corrections et compléments de la section 7.** Ce que le fil a vérifié de sa main est marqué « vérifié », avec la commande. Schéma joint : `2026-09-21-scenario-3-facade-infocentre-pms.png` (copie de l'image donnée par Melvyn, « Scénario 3 : façade infocentre + PMS »).

## 1. Ce que Melvyn a dit, thème par thème

### 1.1 L'entreprise et le PMS

- BDF Gestion change de PMS (l'outil de gestion de portefeuilles). Le nouveau PMS est **Tracker** ; il n'est pas développé en interne. Ce qui est développé en interne, c'est **l'API entre les bases de Tracker et BDFG** (correction de Melvyn du 21/09 au second message ; le premier récapitulatif disait « PMS interne », c'était faux).
- Tout est transitoire : l'API du PMS se développe, l'API d'EVE devient l'infocentre, et « tout se développe par nous ».

### 1.2 EVE devient l'infocentre de BDFG

- Avec le changement de PMS, la décision est : EVE porte les données **extra-financières** (déjà là) **et financières** (à construire).
- Bientôt, la partie données financières se développe dans EVE, avec un **ajout quotidien** de données depuis le PMS, par l'API du PMS. « EVE deviendra notre infocentre. » Il faut relier l'API du PMS à l'API d'EVE.
- Les providers alimentent l'extra-financier, le PMS alimente le financier. « Il faut être intelligent sur comment on intègre les données dans EVE. »
- EVE ne peut pas faire de temps réel seule : pour les données récentes il faut l'API du PMS. Donc les deux se complètent, « à bon escient ».

### 1.3 L'architecture cible : la façade, et le schéma « Scénario 3 »

- Les applications internes (exemple cité : CSDR) qui veulent des données passent par **une interface d'API unique**, une sorte de catalogue d'endpoints, qui regroupe l'API d'EVE (financier et extra-financier) et l'API du PMS.
- **Données froides** (il y a un mois, trois jours, deux jours) : par l'API d'EVE. **Données chaudes** (15 minutes, 10 minutes, début de matinée) : par l'API du PMS. « Tout ça dans notre interface. Comme ça, on a une interface pour toutes les applications. »
- Le schéma donné (Scénario 3) dit la même chose avec les mots du document source : « L'API de l'infocentre agit en façade : froid depuis l'infocentre, chaud récupéré directement dans le PMS. En pratique via une API custom interrogeant la base (voire d'autres sources plus tard). L'application ne voit toujours qu'une seule interface. » Boîtes : Applications internes, API infocentre façade (custom), Base infocentre (froid + historique), Base du PMS (temps réel). Le document source a donc au moins deux autres scénarios, non vus.
- Question qu'il laisse ouverte, avec sa préférence : cette façade est elle EVE elle même, ou une couche à part ? « Le mieux, c'est d'intégrer dans EVE, parce que le but d'EVE c'est que tout le monde passe par EVE, financier et extra-financier, pour faire des requêtes API » ; dans l'interface EVE on aurait les requêtes API EVE reliées au back-end, et les requêtes API du PMS.
- « À voir si on l'intègre dans EVE ou pas » vaut aussi pour le lien avec « la vraie interface BDF Gestion » (l'interface commune de l'entreprise) : l'interface EVE doit pouvoir s'y relier facilement.

### 1.4 L'interface utilisateur d'EVE : tout ce qu'il a cité

Une **vraie interface web**, en Django, pas seulement une API. Pourquoi : aujourd'hui il existe une interface entre les utilisateurs et DEMAIN (l'application de Gaëtan) dans laquelle on envoie les fichiers ; EVE doit reprendre ce rôle et l'élargir. « Vu qu'EVE va être énorme, on peut montrer plein de stats. » Ce qu'il a nommé :

1. L'envoi des fichiers providers (ce que fait l'application de Gaëtan aujourd'hui).
2. Des statistiques : les dernières données intégrées, les derniers fichiers, quel provider a été ajouté et quand.
3. Le contrôle qualité (« quality check ») : aujourd'hui un XLSX produit par EVE, à afficher directement dans l'interface.
4. La consultation des données extra-financières et financières.
5. Côté financier : des exemples de requêtes déjà faites, « comment se passe la table », les données.
6. Une interface pour voir « comment ça se passe directement sur la base ».
7. L'interface d'API : les URL, comment utiliser EVE, les endpoints d'EVE et ceux du PMS, « ce qui se passe à l'intérieur d'EVE ».
8. Les process métier existants (ceux de l'application de Gaëtan) intégrés dans EVE ou dans l'interface, selon la décision de la réunion.
9. Reliable à la vraie interface BDF Gestion.

Exigences : « bien solide, beau, bien utilisable par tout le monde », « bien réfléchir à tout ce qui est possible ». « C'est ce que tout le monde va voir. »

### 1.5 Le partage des rôles

- **Edmond** : la partie data d'EVE (Melvyn ne s'en occupera pas réellement).
- **Melvyn** : toute la partie interface, et la satisfaction des utilisateurs (« tous les utilisateurs très très contents, hyper important »).
- **Gaëtan** : l'application actuelle vers DEMAIN.
- **Alice** : **gérante**, elle porte la partie métier (précision du 21/09).

### 1.6 L'existant : l'application de Gaëtan

- En production, avec DEMAIN. Les utilisateurs y déposent un ou plusieurs fichiers de différents providers ; elle fait des **traitements métier**, produit des fichiers **JSON**, et les envoie par **curl** à DEMAIN.
- Melvyn a l'emplacement de tous les fichiers de code : l'envoi curl et les traitements. « J'ai deux chemins, je peux donner les chemins et les explications des chemins. » Non donnés encore.
- EVE avait pour principe de ne pas faire de calcul financier ni métier : « cela va évoluer ». Les traitements de cette application ont vocation à entrer dans EVE « directement », ou dans l'interface, selon ce qui est gardé.

### 1.7 La réunion du 22/09

- Le 22/09 à **15 h, en visio**. Participants : Edmond, Alice, Gaëtan, Melvyn.
- Objectif : comprendre **tous les traitements de données** faits aujourd'hui dans l'application entre les providers et DEMAIN : ce qui est fait dans le métier, avec quels providers, et comment les données sont injectées dans DEMAIN.
- Ce qui se décide : « qu'est ce qu'on garde, qu'est ce qu'on ne garde pas », et où ça va (EVE ou interface). « Pour ça, il faut qu'on ait une vraie vision de tout ce qui se passe. »
- Ce que Melvyn veut présenter : l'existant décortiqué, provider par provider, « vraiment bien affiché » ; et sa vision, « pourquoi faire une interface », avec le schéma.
- Ce qu'il attend de lui même : être « très solide dans toutes les réunions », « prendre de l'avance », « faire fureur ».
- Une fois décidé : mettre en place une vraie interface entre les utilisateurs et EVE, et relier EVE et DEMAIN.

### 1.8 Les bases de données

- « Il faut absolument créer une nouvelle base. »
- Étape 1 : vérifier si, sur sa VM, il peut utiliser SQL Server Management Studio avec **une base en local**. Si oui, base locale. Sinon, **une base à lui sur le serveur** de dev.
- Étape 2 : **recréer une nouvelle base pour le serveur test1**. Résultat visé : sa base de test (dev) et celle de la recette (test1).
- Il a « à peu près tous les droits ». Il faut les migrations. « Il n'y a pas de trucs vraiment compliqués. »
- Données de test : il a dans `C:\dev\Eve` un dossier par provider avec un exemple de fichier. S'il montre un format et que le fil sait comment l'intégrer, il peut réintégrer les fichiers facilement. Pas besoin de tout réintégrer : « il m'en faut juste des tests pour voir que tout passe bien dans la base ».
- Il veut « toutes les commandes, tous les trucs à faire ».

### 1.9 La branche ESG et les migrations d'Edmond

- Finir le chantier `esgRatingLastModif` : « important, aurait dû être poussé depuis bien longtemps ».
- « Faire aussi les migrations qui sont demandées par Edmond depuis bien longtemps. » Lesquelles exactement : non dit (question ouverte 3).
- Priorité, « parce que c'est un truc qui a été demandé il y a longtemps ».
- Précision du 21/09 (second message) : « les migrations » désignent la question du **`migrate` sur test1**. Deux options qu'il pose : le faire maintenant (test1 n'est utilisé par personne et ce n'est pas si urgent), ou attendre qu'Edmond fasse la PR et le merge pour tirer la bonne version finale sur le serveur test1, et entre temps recréer de bonnes bases EVE et y passer toutes les migrations. Fait qu'il rapporte : **aucune migration n'a été appliquée sur la base du serveur test1**, alors que tout avait été appliqué sur `EveDev` sur dev1, parce que Tania travaillait sur cette base en recette et en test.
- Ce qu'il attend du fil sur la branche : reprendre tout ce qu'il y a à reprendre de `develop`, vérifier que les migrations faites sont bonnes, que tous les bons tests sont là et que tout est bien fait, sans conflit avec l'état actuel ; puis valider et dire à Edmond de la merger sur `develop`.

### 1.10 La méthode qu'il demande

- Découper le travail en **plusieurs sessions**, pour ne pas se perdre : une partie sur ce qu'il devait pousser et sur les bases, une partie sur la préparation de la réunion.
- Dire si **les dernières sessions peuvent toutes être fermées** sans y revenir, « qu'on est bon sur tout », et que cette session soit « l'endroit où on avance le mieux ».
- Un **plan global de toutes les missions** : la mini entreprise (« est ce bien poussé dans un repo ? »), ce qu'il devait faire pour Edmond (« si tout est bon, sans trop mélanger »), ce qu'il doit préparer, et sa vision, à pouvoir expliquer demain.
- Il a « un arbitrage à faire » : la mini entreprise n'est pas finie, mais il ne veut pas s'y perdre.
- Ne rien oublier de ce qu'il a dit ; lui reposer des questions (plus de contexte, moins de contexte) ; lui afficher le récapitulatif pour vérifier que la compréhension correspond ; signaler s'il manque une étape ou si le plan d'exécution n'est pas clair ; utiliser agents et skills.

### 1.11 Ce qu'il peut fournir

Les deux chemins des scripts et leurs explications, du contenu, des schémas (un donné, Scénario 3 ; le document source en a d'autres), « plein de trucs que tu peux me demander ».

### 1.12 Le flux cible, dit le 21/09 au second message

- Les utilisateurs déposent le fichier, ou bien c'est automatique : un répertoire surveillé, ou des récupérations automatiques ; « ça, faudra voir ». Dans tous les cas, quand un fichier est donné, **il est envoyé sur EVE**.
- Une fois qu'EVE a validé tout le traitement et que les données sont bien injectées, **on peut les envoyer à DEMAIN, par l'URL d'EVE**. « Utilisateur vers EVE, EVE vers DEMAIN. »
- Pour cela, comprendre « le comment » de l'application actuelle : les calculs métier, les différents providers, les URL utilisées, afin de savoir comment on fera avec EVE.

### 1.13 Ce qu'il a demandé au fil le 21/09 au second message

- Copier le code de `F:\APPLICATIONS\Logiciels\ESG_Demain\Scripts\` : les fichiers utiles seulement, pas le `.venv`, pas les obsolètes ; les tests, soit on ne les prend pas, soit on les prend pour en écrire des pareils en Python côté EVE plus tard ; destination sous `C:\dev`, dans EveBackEnd puisque tout le dispositif y est. **Le verrou `garde_donnees` refuse tout accès du fil à `F:`, même un listage** : la copie est de la main de Melvyn, la commande est dans la section 7.
- Préparer le prompt de la session S1, à lancer dans `C:\dev\Eve\EveBackEnd` (fichier `2026-09-21-prompt-session-S1-existant-providers-demain.md`).
- Mener en parallèle, dans la session principale, la mise à jour de la branche ESG.

## 2. Ce qui change par rapport au cap du 14/09

| Cap du 14/09 (Edmond) | Au 21/09 |
| --- | --- |
| 1. La branche ESG d'abord, testée à l'insertion, expliquée à Edmond qui merge lui même | **Tient**, renforcé : à finir et pousser, « demandé depuis longtemps » |
| 2. EVE n'est pas le moteur de son alimentation ; on recense les programmes existants et on les rebranche sur EVE | **Change de forme** : l'application de Gaëtan n'est plus « rebranchée », elle est **reprise** par l'interface EVE (dépôt de fichiers, traitements) ; ses traitements métier entrent dans EVE ou dans l'interface après la réunion du 22/09. La cartographie devient l'analyse du code de cette application, échéance le 22/09 |
| 3. Puis DEMAIN lit EVE | **Tient** (« il faut relier EVE et DEMAIN ») |
| EVE ne fait aucun calcul financier ni métier | **Évolue** : EVE portera des traitements métier, et bientôt des données financières |
| Une base à Melvyn sur dev1, remplie depuis des sources connues | **Élargi** : base locale si possible (vérifié possible, voir 3), sinon sur dev1 ; et une nouvelle base de recette pour test1 |
| Mission T (mini entreprise d'agents) en session dédiée | **En pause**, sauf la sauvegarde du dispositif (`_decisions/0012` point 2) |
| Nouveau | EVE infocentre financier et extra-financier ; façade d'API froid (EVE) et chaud (PMS) ; interface web d'EVE portée par Melvyn ; PMS Tracker et API interne entre ses bases et BDFG ; Alice (gérante) ; réunion du 22/09 à 15 h en visio |
| `bdfg-core`, module mail, app `integration/` | Toujours de côté |

## 3. Vérifié de ma main le 21/09

| Fait | Preuve |
| --- | --- |
| Branche `features/melvyn/esgRatingLastModif`, `HEAD a5edddf`, merge de `develop` **en cours** (`MERGE_HEAD 6cf61db`), aucun stash | `git status`, `cat .git/MERGE_HEAD`, `git stash list` |
| L'index porte le résultat du merge : 11 fichiers, dont `0025`, `0026` (d'Edmond) et notre migration renommée `0027` ; l'arbre porte nos tests : `test_insert_data.py` (+84) et `test_export_last.py` (+19) | `git diff --cached --stat`, `git diff --stat` |
| **`develop` a bougé depuis le merge** : trois commits d'Edmond, `73ba518` et `f49e6ce` (11/09), `b058a29` (16/09, « Boolean values: bug on conversions from strings. »), sur `data/choices.py` et `data/functions.py` (186 lignes). Un second merge sera nécessaire après les deux commits | `git fetch origin`, `git log 6cf61db..origin/develop`, `git diff --stat 6cf61db..origin/develop` |
| Deux fichiers non suivis à la racine : `bdfg_equity_controversy_issuer_data_last.xlsx` (6,7 Mo, 17/09, **un export de données : ne jamais le commiter, jamais lu**) et `schema-eve-draft.html` (18/09 17 h 31, plus récent que la copie de `_brouillons/`) | `ls -la`, `cmp` |
| Le dispositif (`.claude/`, `chantiers/`, `CLAUDE.md`, `CONTEXT.md`, `graphify-out/`) est **hors dépôt** (`.git/info/exclude` lignes 15 à 19) : aucune sauvegarde connue | `git check-ignore -v` |
| Un second arbre de travail `C:\dev\Eve\EveBackEnd-review` existe, détaché sur `39e6765` (Tania, 24/07) : reste d'une revue, périmé | `git worktree list` |
| `.env` pointe sur une sqlite locale (`C:/tmp/local_test.sqlite3`) : les tests ne touchent pas EveDev | `grep DB_CONFIG .env` |
| **Sur la VM : pas de SQL Server complet, Melvyn n'est pas administrateur local**, mais **LocalDB SQL Server 2025 (17.0.1000.7) est installé**, instance automatique `MSSQLLocalDB` pas encore créée ; **SSMS 18 présent** ; pilotes ODBC 17 et 18 présents ; `mssql-django 1.6` et `pyodbc 5.2.0` dans le venv ; `settings.py:81` lit `DB_CONFIG` en JSON | `Get-Service`, registre, `SqlLocalDB.exe versions`, `SqlLocalDB.exe info MSSQLLocalDB`, `Test-Path`, `Get-OdbcDriver`, `pip show` |
| Chantiers : `esg-rating-last-modification` **ouvert** (travail dans l'arbre) ; `mini-entreprise-agents` **en pause avec handoff** du 18/09 ; `init-claude-eve` de fait clos (`doctor` 13 OK à chaque démarrage) ; les trois autres clos | `chantiers/INDEX.md`, `ls chantiers/*/handoff.md`, hook de démarrage |

## 4. Glossaire provisoire (pour `CONTEXT.md`, après validation)

- **PMS** : Portfolio Management System, l'outil de gestion de portefeuilles. L'ancien est JUMP (décommissionnement avril 2027) ; le nouveau est **Tracker**. L'**API entre les bases de Tracker et BDFG** est développée en interne : c'est elle qui sert le chaud dans la façade.
- **Infocentre** : la base centrale d'historique où les applications viennent lire. L'actuel (alimenté par Pentaho) est décommissionné en avril 2027 ; EVE le remplace.
- **Données froides / chaudes** : froid = historique et J-2 ou plus, servi par EVE ; chaud = intra-journée (10 à 15 minutes, début de matinée), servi par le PMS.
- **Façade d'API** : le point d'entrée unique des applications internes, qui route le froid vers EVE et le chaud vers le PMS. Scénario 3 du document de Melvyn.
- **DEMAIN** : l'application aval qui fait les calculs financiers et ESG ; alimentée aujourd'hui par l'application de Gaëtan.
- **L'application de Gaëtan** : en production depuis trois ans (mémoire), interface utilisateurs vers DEMAIN : fichiers providers, traitements métier, JSON, curl. C'est elle que l'interface EVE reprend.
- **Interface EVE** : l'interface web Django d'EVE (dépôt de fichiers, suivi des intégrations, statistiques, qualité, consultation, API).
- **Données propriétaires** : les calculs BDFG déjà présents dans EVE (`POST /build/proprietary/{data_key}`).

## 5. Questions du premier récapitulatif, et les réponses de Melvyn du 21/09

1. Les chemins du code de l'application de Gaëtan : **un seul donné**, `F:\APPLICATIONS\Logiciels\ESG_Demain\Scripts\` ; copie de la main de Melvyn (section 7). **Le second chemin reste à donner** : la session S1 le demande.
2. La réunion : **visio, 15 h**. Forme du support et décision attendue : non dites, la session S1 les demande en une question groupée.
3. « Les migrations demandées par Edmond » : c'est la question du **`migrate` sur test1**, voir 1.9 et la recommandation en section 7.
4. Alice est **gérante** (le métier) ; le PMS est **Tracker**, l'API interne est entre ses bases et BDFG ; l'emplacement du document du schéma : non dit.
5. L'ordre : **validé** (ESG dans la session principale, réunion dans une session dédiée, en parallèle).
6. La base locale en LocalDB : pas de réponse explicite ; reste la recommandation du fil, à trancher à l'ouverture du chantier S2.

## 6. Plan global, validé par Melvyn le 21/09

`PLAN.md` est réécrit sur cette base le 21/09 au soir. Résumé : S0 cette session (cap validé, `PLAN.md`, mémoire, fermeture des anciennes sessions, mission 0 ESG : relecture, deux commits, second merge de `develop`, gate) ; S1 préparer la réunion du 22/09 (analyse du code de l'application de Gaëtan, support, page de vision, glossaire) ; S2 les bases par environnement (structurant : LocalDB, dev1, test1 recette, migrations, jeu de fichiers de test, remplissage, comptages) ; S3 la fin de la mission 0 avant push (explain-diff et quiz, document pour Edmond, `/pr`, `/security-review`) ; S4 cadrage de l'interface EVE (structurant, après la réunion) ; S5 intégrer les traitements métier retenus ; S6 relier EVE et DEMAIN ; S7 la partie financière et l'API du PMS (horizon) ; ST la mini entreprise en pause, sauf la sauvegarde du dispositif dans un dépôt à part.

## 7. Corrections et compléments du 21/09 (second message de Melvyn)

1. Tracker est le PMS ; il n'est pas interne. L'API entre les bases de Tracker et BDFG est développée en interne (corrigé en 1.1, 2 et 4).
2. Alice est gérante, la partie métier (1.5).
3. Réunion le 22/09 à 15 h en visio (1.7).
4. Flux cible : utilisateur vers EVE, EVE vers DEMAIN (1.12).
5. Les « migrations demandées par Edmond » sont la question du `migrate` sur test1 (1.9). **Recommandation du fil** : ne pas migrer la base actuelle de test1 (personne ne l'utilise, et elle n'est pas une référence) ; recréer une base de recette propre au chantier S2, y passer toutes les migrations depuis zéro, et y déployer `develop` une fois qu'Edmond aura mergé la branche. Le `migrate` de la branche seule n'apporterait rien à personne d'ici là.
6. Le récapitulatif est validé ; `PLAN.md` est réécrit sur cette base.
7. La copie du code de Gaëtan est de la main de Melvyn, le verrou refusant `F:`. Destination : `chantiers/_externe/esg-demain-scripts/` (dossier créé le 21/09, exclu du dépôt avec `chantiers/`, décrit dans `_externe/LISEZMOI.md`). Une seule ligne PowerShell, qui ne prend que des fichiers de code (aucune extension de données, aucun `.env`, ni `.venv`, `venv`, `__pycache__`, `.git`, ni journaux) :

```powershell
robocopy "F:\APPLICATIONS\Logiciels\ESG_Demain\Scripts" "C:\dev\Eve\EveBackEnd\chantiers\_externe\esg-demain-scripts" *.py *.ps1 *.bat *.cmd *.sh *.sql *.md *.rst *.cfg *.ini *.toml *.yaml *.yml requirements*.txt README* /S /XD .venv venv __pycache__ .git .idea .vscode /XF .env* *.log /NP /NJH /LOG:"C:\dev\Eve\EveBackEnd\chantiers\_externe\esg-demain-scripts\_robocopy.log"
```

Puis l'inventaire du dossier source (noms, tailles et dates seulement, aucun contenu), pour que le fil voie ce qui n'a pas été copié (un JSON de configuration, par exemple) et le demande nommément :

```powershell
Get-ChildItem "F:\APPLICATIONS\Logiciels\ESG_Demain\Scripts" -Recurse -File | Where-Object { $_.FullName -notmatch '\\(\.venv|venv|__pycache__|\.git)\\' } | Select-Object @{n='chemin';e={$_.FullName.Substring(44)}}, Length, LastWriteTime | Sort-Object chemin | Format-Table -AutoSize | Out-File -Encoding utf8 -Width 300 "C:\dev\Eve\EveBackEnd\chantiers\_externe\esg-demain-scripts\_inventaire-source.txt"
```

Enfin, les tests de l'application, s'il y en a dans la copie, ne se lancent pas : ils se lisent, pour en écrire plus tard des équivalents côté EVE (S5).
