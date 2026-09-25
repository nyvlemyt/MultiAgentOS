---
description: Revue adversariale du chantier courant (standards, spec, robustesse et tests, niveau de preuve, documentation, sécurité) avec vérification contradictoire de chaque finding et contre-relecture, puis revue.md et guide de lecture du diff.
argument-hint: "[base, develop par défaut]"
---

# /revue $ARGUMENTS

La revue arrive après un `/gate` PASS. Elle produit `chantiers/<chantier>/revue.md` : les findings, ce qui en a été fait, et un guide de lecture du diff pour Melvyn.

## 1. Le périmètre

1. Base : `$ARGUMENTS` sinon `develop`. Diff : `git diff <base>` (arbre de travail inclus, rien n'est encore commité). Liste des fichiers : `git diff --name-only <base>` plus `git ls-files --others --exclude-standard`.
2. Spec : `chantiers/<chantier>/design.md`. Standard : `.claude/rules/qualite.md`. Vocabulaire : `CONTEXT.md`.
3. Niveau du chantier (journal) : au niveau léger, un seul relecteur sur l'axe standards suffit ; sinon tout ce qui suit.

## 2. Les relecteurs, en parallèle

Lance les agents `relecteur-eve` en parallèle, un brief par axe, chacun avec la liste des fichiers, la commande de diff, la spec, le standard et la base de smells du skill `code-review` (colle la liste dans le brief : le relecteur n'y a pas accès autrement) :

- axe **standards** ;
- axe **spec** (manques, ajouts non demandés, implémentations douteuses) ;
- axe **robustesse et tests** ;
- axe **niveau de preuve** : la couche où chaque changement agit, l'interface publique la plus proche, et si le test principal s'y trouve et vérifie la valeur qui en sort.

Si le diff touche `documentation/`, `CONTEXT.md`, des docstrings ou des artefacts du chantier : un agent `redacteur-eve` en plus. Au niveau **structurant** : appelle aussi le Skill tool avec `security-review`.

## 3. La vérification contradictoire

Pour chaque finding rendu : cherche la preuve qu'il est faux (ouvre le code, le test, la spec). Si la preuve manque, lance un `relecteur-eve` en mode vérification contradictoire sur ce finding. Conclus CONFIRMÉ ou ÉCARTÉ, avec la preuve. Un finding non vérifié n'est pas rapporté comme un fait.

Puis la **contre-relecture** : un `relecteur-eve` reçoit tous les findings (confirmés et écartés, avec leurs preuves) et le diff, et cherche ce que les autres ont tous raté. Ses findings passent par la même vérification contradictoire.

## 4. Les correctifs

Pour les findings CONFIRMÉS de sévérité CRITIQUE ou HAUTE dans le périmètre du chantier : corrige dans le fil principal, en respectant le plus petit diff, puis relance `/gate`. Pour les MOYENNES et BASSES : propose, n'applique que sur le mot de Melvyn. Tout finding hors périmètre va dans « Constats hors périmètre » du journal.

## 5. `revue.md`

1. En-tête : base, head ou « arbre de travail », date, niveau, axes couverts, contre-relecture faite ou non.
2. Table des findings : `sévérité | axe | fichier:ligne | constat | vérification (CONFIRMÉ ou ÉCARTÉ, preuve) | suite (corrigé, proposé, hors périmètre)`.
3. **Guide de lecture du diff** : les fichiers dans l'ordre où Melvyn doit les lire dans VS Code, pour chacun trois lignes : ce qui change, pourquoi, où le vérifier (test, doc).
4. Ce qui n'a pas été relu, et pourquoi.

Termine ta réponse par la liste des fichiers modifiés pendant la revue et la prochaine étape : la page `explain-diff` et son quiz.
