---
status: superseded
superseded_by: 0008-recentrage-edmond-14-09 (decision Edmond du 14/09/2026)
date: 2026-09-10
---

# L'alimentation d'EVE est un module d'intégration, construit par étapes vers le processus final

Melvyn a besoin d'une préproduction qu'il peut alimenter et reconstruire, pour faire lui même les tests qu'il demandait à Edmond et être solide dans ses messages. Deux agents `architecte-eve` ont proposé deux formes en concurrence le 10/09/2026 : une commande unique de 200 lignes sous contrainte d'interface minimale, et un port à deux adaptateurs sous contrainte de ports et adaptateurs. Melvyn a récusé les deux cadres avec un critère qui tranche autrement : « il faut partir sur une version parfaite pour pouvoir partir en prod et pas faire un truc à la va vite maintenant qu'on devra rechanger plus tard », et « il faut qu'on passe direct par les procédés finaux, comme le fait d'avoir la bd sur le serveur, pas de local sur la VM, ça sera pas réaliste ».

Le modèle existe déjà sur le poste : `C:\dev\CSDR\ingestion\` (2 439 lignes, en couches) et son client API `C:\dev\CSDR\api\` (2 440 lignes). Son procédé de déclenchement est établi : une tâche planifiée Windows appelle `python manage.py run_ingestion` (`C:\dev\CSDR\ingestion\readme2.md`).

Décision : EVE reçoit une **app Django séparée `integration/`**, calquée sur les couches de CSDR, dont le point d'entrée est une commande de gestion appelable par une tâche planifiée. Le transport vers EVE est **intra processus** (`django.test.Client`), parce que le dépôt a déjà pris et écrit cette décision (`data/tests/e2e/base.py:1-7` : les données sont amorcées par l'API et non par l'ORM, « it is the only way to get in the database exactly what a real integration writes there ») et parce que le processus final tournera avec sa base, sans saut HTTP à faire. Le **manifeste** (quel dossier source pour quelle clé, quelles extensions, comment choisir le fichier, quelle fréquence attendue) vit **dans le dépôt**, typé et vérifié contre `DataKey` ; seule la racine machine part dans `.env`. La cible est une base dédiée **`EveDevMel` sur `BDFG-SRV-DEV1`**, créée par Melvyn lui même.

La livraison est **par étapes, chacune finie**. Étape 1, ce chantier : l'architecture, la commande, le manifeste, l'ordre réel des 23 étapes, les tests, le mémo des accès et du circuit des fichiers. Sans ordonnanceur, sans mail, sans modèle donc sans migration. Étape 2, chantiers ultérieurs : l'ordonnanceur portant le calendrier réel, la trace des passages pour l'idempotence, la reprise du module mail de CSDR.

## Alternatives écartées

**Une base locale sur la VM (LocalDB ou sqlite).** Techniquement la plus simple, et faisable sans aucun droit : les binaires SQL Server 2025 LocalDB sont présents sur le poste et l'instance se crée sans être administrateur. Écartée par Melvyn le 10/09 : « pas de local sur la VM, ça sera pas réaliste. » Une base locale ne prouve rien du moteur, du réseau ni des droits réels.

**`EveDev` comme cible.** Aucune demande à faire, la base est déjà configurée dans `.env.dev1`. Écartée : c'est la base de dev d'Edmond, un détruire et refaire y effacerait son travail, et la règle interdit à l'assistant d'y écrire.

**La commande unique de 200 lignes (proposition « interface minimale »).** Le plus petit diff, aucune notion nouvelle, et elle apportait un garde utile : refus de tourner si la base n'est pas locale. Écartée sur le critère de Melvyn : elle mélange orchestration, résolution de fichiers, transport et compte rendu dans un fichier, ce qui est exactement ce qu'il faudrait rechanger à l'étape 2. Le garde est **conservé** et repris dans la décision, sous une autre forme : la commande refuse de tourner contre une base qui n'est pas la cible déclarée.

**Le port à deux adaptateurs dès maintenant (proposition « ports et adaptateurs »).** Écartée pour l'étape 1 parce que la seconde cible n'existe pas encore, et l'instance elle même recommandait de couper là si l'effort devait baisser. Le transport reste isolé dans une seule fonction, donc un adaptateur HTTP s'ajoute plus tard sans toucher au plan.

**Le manifeste hors dépôt.** C'était la réponse de Melvyn sous l'ancien cadre (base locale). Devenue incohérente dès que le processus vise le serveur : la connaissance doit vivre avec le processus, et un fichier de configuration non versionné dérive en silence, sans relecture en diff ni vérification des clés par pyright.

**Un sous paquet `data/integration/` plutôt qu'une app.** Empreinte plus faible, aucun changement d'`INSTALLED_APPS`. Écartée parce que l'étape 2 a besoin d'une table pour la trace des passages, et qu'elle atterrirait dans les migrations de `data`, mêlée aux 21 flux. CSDR sépare `ingestion/` de `api/` ; EVE sépare déjà `users/` de `data/`.

**Construire l'ordonnanceur dans ce chantier.** Écartée sur un fait, pas sur une préférence : le calendrier n'est pas connu. Le seul mode opératoire existant ne couvre qu'un flux sur 21, et Melvyn a établi que les dépôts de fichiers sont manuels. On ne peut pas encoder des règles qu'on ignore.

## Conséquences

Le chantier touche le dépôt : une branche `features/melvyn/socle-de-travail` est nécessaire, et Edmond verra arriver une app. Une ligne s'ajoute à `INSTALLED_APPS` (`eve_back/settings.py`), et **aucune migration à l'étape 1** puisque l'app n'a pas de modèle. À l'étape 2, la table de trace des passages produira une migration qui s'appliquera à tous les environnements au déploiement : à annoncer explicitement dans la description de PR.

Des noms de dossiers providers entrent dans le dépôt par le manifeste, ce qui n'avait jamais été fait. À signaler à Edmond, sans valeur de donnée ni chemin de partage complet (la racine reste dans `.env`).

Deux corrections documentaires roulent avec ce chantier, sur décision de Melvyn du 10/09 : `documentation/DATA_INTEGRATION.md:827` (« Construire les référentiels avant l'insertion de données » est faux, la ligne 793 du même fichier le contredit), et l'ordre d'intégration de `CLAUDE.md`, incomplet (il omet `iss_asset_data`, source secondaire de LEI du référentiel issuer, `data/models/referential.py:304-307`, et `bdfg_asset_data`, dont le référentiel asset a besoin, `data/models/referential.py:590-594`).

Le remplissage du manifeste est le travail long, et il n'appartient qu'à Melvyn : l'assistant ne regarde aucun fichier de données, donc l'appariement des 21 dossiers sources aux 20 clés alimentées par fichier se valide ligne par ligne dans un diff, par lui.

Deux faits opérationnels à porter dans le plan : `build_referential/issuer` fait un appel réseau réel à GLEIF (`data/functions.py:495-509`), non simulé hors des tests, donc le passage a besoin d'un accès sortant ; et `msci_controversy_esg_issuer_data` échouera à l'insertion (défaut connu, `data/tests/e2e/test_insert_data.py:168-197`), donc le passage doit rapporter l'étape en rouge et continuer, comme la pipeline de CSDR isole ses erreurs fichier par fichier.

Implémentation : chantier `2026-09-10-socle-de-travail`.
