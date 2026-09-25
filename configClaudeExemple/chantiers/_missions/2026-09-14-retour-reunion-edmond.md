# Retour de la réunion Edmond du 14/09/2026 : ce qui change

Noté le 14/09/2026 à chaud, à la demande de Melvyn, juste après le point avec Edmond. Ce document est la source brute : ses mots d'abord, ma reformulation ensuite, et les questions ouvertes. Le plan qui en découle est dans `chantiers/PLAN.md`. **Rien de ce qui est écrit ici n'a été exécuté : c'est un plan.**

Ce document remplace `dossier-edmond-2026-09-14.md` et `2026-09-10-missions.md` comme file d'attente. Les deux restent pour les faits qu'ils contiennent (chemins des trois fichiers de données, état de connaissance sur les environnements).

---

## 1. Les mots de Melvyn, dans l'ordre

Transcription vocale, reprise fidèlement et découpée. Les mots entre crochets sont mes compléments là où la dictée a mangé un mot.

1. « Il y a beaucoup de changements dans ce qu'on va faire. »
2. « La priorité, c'est de régler le problème avec la branche, et de faire en sorte que tout soit bon sur le travail que j'ai fait. »
3. « La branche que j'ai faite, c'est pour l'insertion de données. Quand on insère une donnée, il faut la mettre sur une bonne valeur. J'ai vu que t'avais fait des tests, mais dans l'export de données. C'est très bien d'avoir fait des tests dans [le] e2e, mais il aurait fallu [les] faire dans insert data et pas export data. J'aimerais savoir pourquoi c'est dans export data, et pourquoi on n'en a pas dans insert data. »
4. « On récupère tout ce qui était fait sur develop sur notre branche. On corrige les deux, trois trucs, on rajoute les fonctions [de] test qu'il faut. »
5. « On fait une explication en mode humain de ce qui a été fait : ça a été fait parce qu'il y a ça, parce qu'il y a ça, de bout en bout. On a testé avec ça, ça, ça, on a testé avec la donnée. Un truc bien fait, bien carré, très pro, avec l'explication, mais pas en mode PR. Pas une PR, parce que lui doit valider après. »
6. « J'ai parlé avec lui du module de mail et d'intégration. EVE n'est pas du tout moteur de ça. Le but, c'est de modifier ces trucs [les scripts] d'intégration [existants] pour les faire intégrer dans EVE. Vraiment alimenter EVE. »
7. « Le but, c'est de retrouver le fichier qui a recensé tous les trucs d'intégration, de récupération de données providers. Il faut que je contacte Gaëtan. Il faut aussi qu'on aille regarder, pas dans EveBackEnd, mais plus haut dans `C:\dev\Eve` : il y a beaucoup de fichiers PowerPoint, Excel, où on peut avoir ces informations. Fouiller les docs pour voir où Tania a pu écrire tout ça. Normalement le boulot de tout recenser a été fait : tous les providers qu'on a, quels scripts, où ils sont rangés. »
8. « Le but n'est pas de faire une app d'intégration dans EVE, mais de changer toutes les apps d'intégration actuelles. Après, on pourra voir pour potentiellement arrêter tous les trucs qui récupèrent les fichiers maintenant et n'en faire plus qu'un seul. Mais il faut qu'on ait tout le contexte pour le décider. »
9. « Comprendre où sont les fichiers qui intègrent les données des providers, où on doit intégrer dans EVE maintenant, où sont les scripts qui font tourner l'API JUMP pour les données. Si on n'en a pas, il faudra les créer nous mêmes. Pour moi, on en a, et c'était documenté, un gros travail de Tania. Je vais pouvoir te donner des [pistes] pour que tu puisses le faire. »
10. « Tout ce que je te dis, ça reste un plan. Retour de réunion, il faut que ça reste en mode plan. »
11. « L'étape d'après, c'est d'alimenter DEMAIN et de relier EVE à DEMAIN. Nos intégrations de data sont faites, puis DEMAIN requête ces datas quelque part : soit elles sont intégrées dans DEMAIN, soit ailleurs, je ne sais pas. Il faut qu'on branche EVE à DEMAIN : quand DEMAIN a besoin de la donnée, ça appelle un endpoint de EVE, l'export data, tout simplement. »
12. « Tout est lié. Trouver où sont toutes les docs, les origines des providers, leur fréquence, comment ils s'alimentent, où ils sont rangés. Il nous faut la doc de tout ça. Trouver tous les scripts qui le font. Une fois qu'on a ça, on rebranche tout ça sur EVE. Tout doit être injecté dans EVE et pas ailleurs. Une fois que c'est fait, alimenter DEMAIN avec EVE. »
13. « Décomposer le travail. Faire attention à tout ce que je viens de dire, me poser des questions. Les mots que j'ai utilisés ne sont peut être pas les bons. Il y a des grandes étapes à respecter. Bien faire le boulot, professionnel, mais avancer, pas perdre trop de temps, ça fait longtemps qu'on est dessus. »
14. « On met de côté `bdfg-core`, où on voulait mettre toutes nos apps. On ne fait plus l'intégration, on ne fait plus le mail, on fait ce qu'on nous a demandé. »
15. « En récupérant toutes ces données et en sachant où elles sont, on va pouvoir en même temps nous créer notre base de test, pour nous. »
16. « Tu sais où le serveur de test tourne actuellement ? Le lien que tu m'as donné est sur le serveur dev1, donc ça doit être un test de EVE. Maintenant il faut tout relier. »

---

## 2. Ma reformulation, à valider par Melvyn

Ce que je comprends, en trois idées :

**EVE devient un socle passif.** Elle reçoit (`POST /insert_data`) et elle sert (`GET /export/demain`). Elle ne pilote rien : pas de commande d'intégration, pas de tâche planifiée, pas de mail. Ce sont les programmes qui existent déjà autour d'elle (scripts providers, appels JUMP, alimentation de DEMAIN) qu'on modifie pour qu'ils déposent dans EVE et lisent depuis EVE.

**Avant de toucher un script, on les recense tous.** Qui récupère quel flux, où il le range, à quelle fréquence, qui le lance, où il l'écrit aujourd'hui (Infocentre, DEMAIN, partage). La cartographie est le livrable, la consolidation en un seul programme est une décision d'après, prise avec Edmond, quand tout est connu.

**Le chemin vers DEMAIN passe par l'export.** DEMAIN lit aujourd'hui ses données quelque part (Tania parle du script IT `FillDataEsgDemain`, à voir avec Gaëtan) ; demain il appelle `GET /export/demain/{data_key}`. C'est le dernier maillon, il ne se fait qu'une fois EVE alimentée par les vrais flux.

Et avant tout cela, la branche `esgRatingLastModif` doit être propre : à jour de `develop`, testée là où le changement agit (l'insertion), expliquée de bout en bout dans un document qu'Edmond valide.

**Mis de côté par décision d'Edmond :** le dépôt `bdfg-core`, le module mail, l'app `integration/` dans EVE, et donc les chantiers `2026-09-10-socle-de-travail` et `2026-09-11-socle-modules-bdfg`. Fiche `_decisions/0008`.

---

## 3. Ce que je sais déjà, et qui donne un point de départ

Vérifié le 14/09/2026 par listage de noms et lecture de documents identifiés, sans ouvrir aucun fichier de données.

### La note de passation de Tania décrit déjà le paysage

`C:\dev\Eve\Documentation Projet Tania\Notes\passation_notes.md` (24/07/2026), section « PROD/DEV », lignes 50 à 60 :

- **`FillDataEsgDemain`** : « Script IT », « en place », « avec Gaëtan », un point « à faire » de Tania : « étudier les points de branchement », endpoint EVE visé `export/demain`. Ses sources sont dans le dépôt C# de l'IT (chemin ligne 53).
- **Version test de `DEMAIN_eve`** mentionnée, sans détail.
- **Deux micro services autour de DEMAIN à décommissionner** : `ConvertControversesToJson` et `CreateFileControverses`, sous le partage des applications, dossier `ESG_Demain\Scripts` (lignes 56 et 57).
- **Données financières** (portefeuille, position, prix) : « étude de l'existant, modélisation, création des schémas », pas commencé.
- **Réplication de données historiques financières JUMP** : posée, pas détaillée. Section « INFOCENTRE » : « on oublie Infocentre, décommissionnement avril 2027 », schéma de JUMP demandé à l'IT, « historisation des données : migration vers base EVE ».
- Section « Controverses », ligne 36 : un dossier du partage Front office alimente `build/proprietary`, « pipeline à valider ».
- Section « FICHIERS SOURCES », ligne 43 : le dossier `Providers` du partage est l'inventaire des données réelles, « à mettre à jour au fil des livraisons ».

### Pentaho est l'ETL actuel de l'Infocentre

`Documentation Projet Tania\Notes\Pentaho.md` (20/04/2026) : Pentaho est « une application à part » qui « transforme en csv », avec un « processus de validation interne, pas de contrôle », « pas autonome ». Il alimente l'Infocentre, qui porte « l'historique de JUMP ». Le décommissionnement de Pentaho est conditionné à un MVP EVE qui couvre les « fonctionnalités minimales ». C'est donc l'un des programmes d'intégration actuels à recenser.

### Les documents candidats, par ordre de promesse

| Document | Date | Pourquoi il compte |
| --- | --- | --- |
| `Releases\1.0.0\Runbook.docx` (124 Ko) | 27/04/2026 | un runbook décrit normalement qui lance quoi, quand, et où |
| `Releases\Dossier_Technique_MVP_ETL.docx` | 24/04/2026 | le mot ETL dans le titre : l'architecture d'intégration du MVP |
| `Providers\Modop_Fichiers_providers.docx` | 04/03/2026 | le mode opératoire des fichiers providers ; **sous `Providers\`, donc lecture à autoriser explicitement** |
| `Modélisation\ArchitectureCible.drawio` et `ArchitectureTargetV2.drawio` | 10/2025, 09/2025 | l'architecture cible dessinée : où EVE se place par rapport à JUMP, DEMAIN, Infocentre |
| `CR Projet\26.04.23 - ROADMAP MVP.pptx`, `26.03.24 - POINT GLOBAL.pptx`, `25.10.09 - Bilan 1A.pptx` | 2025 et 2026 | les comités : décisions, acteurs, calendrier |
| `MVP\Actions-Acteurs.xlsx`, `MVP\Cadrage MVP.docx` | 23/04/2026 | qui fait quoi dans le MVP |
| `CR Projet\Calendrier.xlsx` | 24/03/2026 | peut porter les fréquences d'arrivée |
| `data_catalog\data_catalog.xlsx`, `Suivi dev.xlsx` | vivants | catalogue des champs, suivi des flux |
| `Documentation Projet Tania\Notes\Week *.txt` (34 notes, 11/2025 à 07/2026) | | le fil des décisions hebdomadaires |

### Les outils pour lire ces documents

`pandoc` est absent du poste et `python-docx` absent du venv d'EVE. Un `.docx` ou un `.pptx` est une archive zip de XML : l'extraction du texte se fait sans aucune dépendance nouvelle (zipfile de la bibliothèque standard), dans le scratchpad, jamais dans le dépôt. À valider avant de le faire.

### Les 21 dossiers de `Providers\`

`BDFG_Asset_Data`, `BDFG_Equity_Controversy_Demain`, `BDFG_Proprietary_Data`, `BDFG_SupraEmetteurs`, `CDCB_quali`, `ISS_Bond`, `ISS_Controversy`, `ISS_ESG`, `ISS_Multi_security_File`, `Iceberg`, `Jump_Asset`, `Jump_Issuer`, `MSCI_Controversy`, `MSCI_PAB_Taxo`, `SNP_data`, `Sovereign_Debt`, `Sustainanalytics`, `Trucost_Coal`, `Trucost_Fossile`, `Trucost_Paris_Alignment`, `Trucost_Taxonomy`. Les dates des fichiers qu'ils contiennent (noms et dates seulement) suffisent à reconstituer une fréquence d'arrivée par flux sans ouvrir un fichier.

---

## 4. Réponses aux deux questions posées pendant le retour

### Pourquoi les tests sont dans l'export et pas dans l'insertion

Le fait, d'abord : les deux tests de `ExportDemainDateValueTests` **passent par l'insertion**. Le `seed()` du socle e2e insère par `POST /insert_data` (`data/tests/e2e/base.py:201`, « Insert through the API »). Mais ils **vérifient la sortie de l'export**, pas la valeur stockée.

Pourquoi ce choix : le risque identifié dans la fiche `0001` et pendant la revue était le **contrat avec DEMAIN** (la chaîne exportée devait rester `YYYY-MM-DD`). Le test a été mis là où vit ce contrat. La revue du 09/09 avait proposé un test d'insertion pour la valeur au format non reconnu ; il a été **reporté le 10/09** (`revue.md`, finding HAUTE robustesse ; `design.md:88`). Et `design.md:70` dit franchement que le test d'export « ne détecterait pas une régression du typage ».

Edmond a raison sur le fond : le changement est un changement **d'intégration**, la preuve principale doit porter sur **ce qui est stocké**. Ce qui manque, dans `data/tests/e2e/test_insert_data.py`, sur le motif de `test_csv_rows_land_in_the_database_under_the_model_column_names` (ligne 25) :

1. une date écrite dans un autre format (`31/12/2024`) est stockée comme une **date** (`datetime.date`), pas comme du texte ;
2. une date déjà en ISO est stockée comme une date ;
3. `Not Collected` et `Not Applicable` sont stockés **NULL** ;
4. une date dans un format qu'aucun des 16 formats ne couvre est stockée NULL, marqué `known_defect` (c'est le test reporté le 10/09).

Les deux tests d'export restent : ils épinglent le contrat aval, ce que les tests d'insertion ne font pas.

### Où tourne le serveur de test

Prouvé (mémoire `project-eve-environnement`, 09/09/2026) : `http://bdfg-srv-dev1:49153/` répond, c'est un site IIS sur le serveur de dev, Swagger à la racine, doc sur `/docs/`. **Non prouvé** : quelle branche il sert. `test1` est une branche git, décrite par Tania comme « version de test ». Le seul mode opératoire (`Modop\Settings 'TEST1'.txt`, 26/06/2026) parle du « serveur dev » et donne une procédure `git pull` puis `pip install`, sans URL. Donc oui, très probablement le site de `49153` est la branche `test1` déployée sur `dev1`, mais il faut qu'Edmond le confirme ou qu'on lise le dossier IIS sur le serveur. La question de la base distincte pour ce site reste ouverte aussi.

---

## 5. Questions ouvertes pour Melvyn

Voir la section « À valider par toi » de `chantiers/PLAN.md`.
