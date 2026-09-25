---
description: Rédiger la description de PR Azure DevOps du chantier courant à partir de design.md, journal.md, revue.md et de la gate ; l'écrire dans chantiers/<chantier>/pr.md. Aucun commit, aucun push.
argument-hint: "[base, develop par défaut]"
---

# /pr $ARGUMENTS

Cette commande écrit un texte. Le commit et le push restent des décisions de Melvyn, données explicitement, après sa relecture dans VS Code.

## 1. Les sources

`chantiers/<chantier>/design.md`, `journal.md` (dont les sorties de `/gate`), `revue.md`, la page `explications/` si elle existe, et `git diff --stat <base>` (arbre de travail inclus) plus `git log --oneline <base>..HEAD` s'il y a déjà des commits.

## 2. La description

Écris `chantiers/<chantier>/pr.md` dans le style de Melvyn (`.claude/rules/communication.md` : ton direct, phrases courtes, pas de tirets de ponctuation ni de listes à tirets, pas de formules creuses, sources citées). Structure :

1. **Titre** : convention du dépôt, `scope: description.` en anglais (ce sera aussi le message de commit).
2. **Contexte** : le besoin, qui l'a demandé et quand (Edmond, 07/09/2026...), la décision prise et sa fiche dans `chantiers/_decisions/` si elle existe.
3. **Changements** : fichier par fichier, une phrase chacun, dans l'ordre du guide de lecture de `revue.md`. Les migrations à part, avec ce qu'elles font sur les données existantes.
4. **Vérifications** : les commandes lancées et leurs résultats tels quels (`GATE PASS`, nombre de tests, couverture des fichiers touchés, findings de revue confirmés et corrigés, résultat du quiz). Rien d'affirmé sans sa sortie.
5. **Risques et limites** : ce qui pourrait casser, ce qui n'a pas été testé (par exemple : non rejoué sur EveDev), les seuils dépassés préexistants.
6. **Hors périmètre** : les constats du journal, proposés pour un chantier suivant.
7. **Points à trancher** : les questions ouvertes pour Edmond, formulées en questions fermées.

## 3. Après

Montre le chemin du fichier et son titre. Rappelle la suite dans l'ordre : relecture par Melvyn, puis sur son mot explicite `git add` ciblé, `git commit -m "<titre>"`, `git push -u origin features/melvyn/<slug>`, puis la PR dans l'interface Azure DevOps avec ce texte. Vérifie et signale la branche courante et tout stash en attente.
