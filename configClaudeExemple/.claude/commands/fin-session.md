---
description: Clore la session : handoff dans le chantier, mémoire à jour, dashboard et journal actualisés, liste des fichiers touchés, rappel des stashs.
argument-hint: "[sur quoi portera la prochaine session]"
---

# /fin-session $ARGUMENTS

Une session qui s'arrête sans passation fait repartir la suivante de zéro. Cinq minutes, dans cet ordre.

1. **Journal** : complète `chantiers/<chantier>/journal.md` avec ce qui a été fait depuis la dernière entrée, les commandes lancées et leurs résultats, ce qui n'a pas été fait et pourquoi, les constats hors périmètre nouveaux.
2. **Handoff** : appelle le Skill tool avec `handoff` en lui passant `$ARGUMENTS` ; le document s'écrit dans `chantiers/<chantier>/handoff.md` (pas dans le dossier temporaire). Il référence les artefacts par chemin au lieu de les répéter, nomme les skills à appeler ensuite, et ne contient ni secret ni valeur de données. Il **se termine par le prompt de relance**, bloc de code copiable dont `rules/session.md` donne le contenu : une session neuve qui n'a que ce bloc et les fichiers qu'il nomme doit pouvoir reprendre sans rien demander.
3. **Dashboard et vue unique** : mets à jour `dashboard.html` (statuts, décisions, prochaine étape, pied de page avec les fichiers du jour), même page, jamais une nouvelle ; puis `chantiers/PLAN.md` (état des missions, actions de la main de Melvyn faites ou en attente, prochaine action).
4. **Mémoire** : pour chaque fait durable qui n'est ni dans le code, ni dans git, ni dans la doc (préférence exprimée, décision, contexte humain, état d'un chantier), une fiche dans la mémoire du bucket `c--dev-Eve-EveBackEnd` avec son frontmatter, une ligne dans `MEMORY.md`. Mets à jour ce qui est devenu faux, supprime ce qui est périmé.
5. **État git** : `git status --porcelain`, `git branch --show-current`, `git stash list`. Signale tout travail non commité et tout stash en attente, avec la branche où il se réapplique.

Termine par la liste exacte des fichiers touchés pendant la session, un mot sur chacun, et la première action de la prochaine session.
