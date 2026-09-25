---
status: proposed
date: 2026-09-11
decideur: Edmond
chantier: chantiers/2026-09-11-audit-csdr-vers-eve
---

# Rien dans le dépôt n'empêche `manage.py test` d'écrire sur la base partagée : faut-il verrouiller, et comment ?

Fiche pour décision Edmond, préparée par Melvyn. Rédigée le 11/09/2026, chantier `chantiers/2026-09-11-audit-csdr-vers-eve`.
Aucune option ne s'exécute dans ce chantier : cette fiche est le livrable.

## L'énoncé (une phrase métier)

Lancer la suite de tests d'EVE depuis le dépôt, dans sa configuration serveur, ferait créer par Django une base de test sur `BDFG-SRV-DEV1`, et aucun mécanisme versionné ne l'en empêche.

## L'état des lieux (et pourquoi il est comme ça)

La bascule de base est faite en une expression, sur la seule présence d'une variable :

```python
# eve_back/settings.py:81-89
DATABASES = {
    'default': json.loads(config('DB_CONFIG'))
} if config('DB_CONFIG', None) else {
    'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'},
}
```

Et `DB_CONFIG` est présente dans les deux fichiers d'environnement du poste :

```text
$ grep -oE '^[A-Z_]+' .env | sort        -> ALLOWED_HOSTS DB_CONFIG DEBUG EVE_LOG_DIR PYTHONPATH SECRET_KEY
$ grep -oE '^[A-Z_]+' .env.dev1 | sort   -> ALLOWED_HOSTS DB_CONFIG DEBUG EVE_LOG_DIR PYTHONPATH SECRET_KEY
```

Aucune valeur n'a été lue, uniquement les noms de clés. Django, en test, crée une base `test_<nom>` sur le moteur configuré : avec `.env.dev1` actif, cette création viserait le serveur.

Ce qui protège aujourd'hui, et la limite exacte de cette protection :

| Ce qui protège | Où | Ce que ça couvre | Ce que ça ne couvre pas |
| --- | --- | --- | --- |
| La commande `/gate` force `DB_CONFIG` sur sqlite en mémoire | `.claude/hooks/gate.py:37` et `:177` | les passages de Melvyn par `/gate` | tout `python manage.py test` lancé directement, par qui que ce soit |
| La règle écrite | `.claude/rules/donnees.md` | la conduite de l'assistant | un humain, une tâche planifiée, une intégration continue future |
| La mémoire du poste | `project-tests-local-sqlite.md` | Melvyn, s'il y pense | tout le reste |

Et surtout, `gate.py` n'est **pas versionné** :

```text
$ git ls-files --error-unmatch .claude/hooks/gate.py
error: pathspec '.claude/hooks/gate.py' did not match any file(s) known to git
```

`.claude/` est exclu par `.git/info/exclude:17`. La seule protection mécanique existante vit donc hors du dépôt et n'est disponible pour personne d'autre que Melvyn.

La documentation, elle, pousse dans le mauvais sens. `documentation/TESTING.md:196` prescrit `python manage.py test` sans dire contre quelle base (huit occurrences au total, lignes 196, 203, 206, 209, 222, 236, 239, 242). Et le dépannage conseille exactement ce qu'il ne faut pas faire :

```text
# documentation/TESTING.md:415-418
### Problème : Base de données non disponible
**Solutions** :
1. Vérifier la configuration dans `.env`
2. Lancer le serveur SQL Server
3. Utiliser le mocking pour éviter la BD
```

`TESTING.md` est versionné : c'est de la documentation du projet, pas du poste, et sa correction appartient à Edmond.

Nuance de fait, qui doit être dite parce qu'elle réduit l'urgence sans réduire le risque : `.env` pointe aujourd'hui sur un fichier sqlite local. Le danger prouvé porte donc sur `.env.dev1`, pas sur la configuration courante du poste de Melvyn.

## Le point dur, chiffré avant de trancher

Ce qui se passerait exactement n'est **pas mesuré**, et ne peut pas l'être sans le faire. Trois issues sont possibles selon les droits du compte Windows utilisé :

1. le compte n'a pas le droit `CREATE DATABASE` : Django échoue, aucun dégât ;
2. le compte a le droit : une base `test_<nom>` est créée sur `BDFG-SRV-DEV1`, remplie, puis détruite en fin de suite ;
3. la suite est interrompue avant la fin : la base de test reste sur le serveur.

Aucune des trois n'écrit dans `EveDev` lui même, parce que Django travaille sur une base distincte. **Le risque n'est donc pas la perte de données d'Edmond, c'est la création non annoncée d'objets sur un serveur partagé, et la consommation de son espace.** Il faut le dire honnêtement, ni plus ni moins.

La requête qui trancherait, à exécuter par Edmond ou par Melvyn en lecture seule sur `EveDev`, sans aucune valeur de donnée :

```sql
SELECT HAS_PERMS_BY_NAME(NULL, NULL, 'CREATE ANY DATABASE') AS peut_creer_base,
       IS_SRVROLEMEMBER('dbcreator')                        AS role_dbcreator;
```

Grille de lecture : si les deux rendent 0, l'issue 1 s'applique et le sujet devient de confort. Si l'une rend 1, les issues 2 et 3 sont réelles et le verrou se justifie seul.

## Options

### Option A : un module de settings de test versionné

Sur le motif de `c:\dev\csdr_codex\config\test_settings.py:12-29`, qui neutralise le chargement du `.env` puis réécrit `DATABASES` en sqlite en mémoire. Côté EVE : un fichier `eve_back/test_settings.py` qui importe `eve_back.settings` et réécrit `DATABASES`, et la commande devient `python manage.py test --settings=eve_back.test_settings`.

- Effet aval (DEMAIN, Edmond, exports) : aucun. Rien ne change à l'exécution de l'API.
- Effet sur le dépôt : 1 fichier nouveau versionné, plus les deux passages de `documentation/TESTING.md`.
- Effort : 2 fichiers touchés, 0 dépendance nouvelle.
- Réversibilité : totale, le fichier se supprime.
- Risque : faible. Le seul effet de bord est qu'un lancement sans le drapeau `--settings` reste possible, donc la protection est disponible mais pas imposée.

### Option B : la détection dans `settings.py` lui même

`settings.py` détecte `sys.argv` contenant `test` et force sqlite. Protection imposée, sans drapeau à retenir.

- Effet aval : aucun en théorie, mais le fichier de configuration central change de comportement.
- Effet sur le dépôt : 1 fichier versionné, et c'est `settings.py`.
- Effort : 1 fichier, 0 dépendance.
- Réversibilité : totale.
- Risque : plus élevé. `.claude/rules/securite.md` classe toute touche à `settings.py` en structurant d'office. Une détection par `sys.argv` est un motif fragile, qui rate les lancements par `pytest` ou par un appel programmatique, et qui surprend qui lit le fichier.

### Option C : ne rien changer au code, corriger seulement la documentation

On laisse le code en l'état et on corrige `documentation/TESTING.md` pour qu'il prescrive la surcharge de `DB_CONFIG` et qu'il retire le conseil « Lancer le serveur SQL Server ».

- Effet aval : aucun.
- Effet sur le dépôt : 1 fichier versionné.
- Effort : 1 fichier, 0 dépendance.
- Réversibilité : totale.
- Risque : la protection reste une consigne. Elle tient tant que celui qui lance les tests a lu la documentation.

## Recommandation

**Option A, et la correction documentaire de l'option C dans la même livraison.** C'est la seule recommandation de tout l'audit qui mérite sans discussion le budget de relecture d'Edmond : elle coûte deux fichiers, aucune dépendance, elle ne change rien au comportement de l'API, et elle répare une documentation qui conseille aujourd'hui l'inverse de ce qu'il faut faire. L'option B touche `settings.py` pour un gain marginal sur un motif fragile. L'option C seule laisse une règle sans mécanisme.

Ce qui ferait changer d'avis : si la requête de droits ci dessus rend 0 partout, l'option C seule suffirait, et le sujet se réduirait à une correction de documentation.

## Question fermée pour Edmond

> Rien dans le dépôt n'empêche `python manage.py test` de créer une base de test sur `BDFG-SRV-DEV1` quand la configuration serveur est active, et `documentation/TESTING.md:415-418` conseille même de démarrer SQL Server quand la connexion échoue. Acceptes tu :
> A. l'ajout d'un `eve_back/test_settings.py` versionné forçant sqlite en mémoire, plus la correction des deux passages de `documentation/TESTING.md` ? **(recommandé)**
> B. une détection dans `eve_back/settings.py` plutôt qu'un module séparé ?
> C. la seule correction documentaire, sans changement de code ?

Réponse / date : **la fiche reste en attente d'Edmond, qui décide.** Melvyn a arbitré le 11/09/2026 ce qui lui est proposé : « je suis ta recommandation, option A ».

**Une exigence s'ajoute à l'option A**, et elle porte sur la forme autant que sur le fond : « je veux pouvoir expliquer simplement ce qui a été fait, donc soigne la clarté autant que le résultat. » Conséquences concrètes pour la livraison :

- Le `eve_back/test_settings.py` doit se lire en une minute et porter en tête, en une phrase, **pourquoi** il existe : rien dans le dépôt n'empêchait un `manage.py test` de créer une base sur le serveur partagé.
- La correction de `documentation/TESTING.md` ne se limite pas à retirer la phrase fautive : elle dit quelle commande lancer et contre quelle base, pour que le lecteur suivant n'ait pas à deviner.
- La description de PR expose le problème avant la solution, avec la preuve (`eve_back/settings.py:81-89`, et `DB_CONFIG` présente dans les deux fichiers d'environnement), pour qu'Edmond comprenne l'enjeu sans lire le code.
- Un test prouve le comportement, plutôt qu'un commentaire qui l'affirme.

## Verrouillage une fois la décision prise

- Option A : créer `eve_back/test_settings.py`, corriger `documentation/TESTING.md:196` et `:415-418`, ajouter un test qui vérifie que le moteur est sqlite sous ces settings, et inscrire la commande exacte dans le critère d'acceptation du chantier socle (`design.md` section 12, critère 2). Retirer alors la mémoire `project-tests-local-sqlite.md`, devenue obsolète.
- Option B : même chose, dans `eve_back/settings.py`, et passage du chantier au niveau structurant avec `/security-review` conformément à `.claude/rules/securite.md`.
- Option C : corriger `documentation/TESTING.md` seul, et conserver la mémoire `project-tests-local-sqlite.md` comme unique protection, en le disant explicitement dans le document.
