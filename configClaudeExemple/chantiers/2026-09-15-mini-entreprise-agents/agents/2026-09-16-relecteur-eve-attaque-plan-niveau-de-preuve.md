# Rapport brut : attaque du plan révision 1, axe niveau de preuve

Agent : `relecteur-eve`, mode attaque. Lancé le 16/09/2026 sur `plan.md` révision 1. Déposé tel quel le 16/09 au soir depuis la transcription de session. Vérification contradictoire dans `attaques/attaque-plan.md`.

---

## Attaque du plan lot 1a, axe niveau de preuve

10 findings. Tout est vérifié de ma main (commandes lancées, aucun fichier modifié).

**P1 HAUTE, étapes 1.1 et 1.7.** `$SCRATCHPAD` n'existe pas. Lancé : `echo "SCRATCHPAD=[$SCRATCHPAD]"` rend `SCRATCHPAD=[]`. Scénario : 1.1 exécute `cp .claude/settings.json "/settings.json.copie"`, soit une écriture hors périmètre que `garde_perimetre` ne voit pas (chaîne non expansée résolue sous la racine), soit `Permission denied`. En 1.7, le `cp` de restauration rend `No such file or directory`, `settings.json` garde la déclaration de la sonde, et `rm .claude/hooks/sonde_releve.py` s'exécute quand même (cinq commandes, aucun `&&`) : toutes les sessions perdent `Glob` sur une erreur de hook. `doctor --complet` ne le voit pas (liste HOOKS en dur). Correctif : chemin absolu, refus si vide, 1.7 chaîné par `&&` avec comparaison programmatique du sha256, suppression du script seulement après empreinte identique.

**P2 HAUTE, étapes 1.2, 1.5, 1.6.** Le hook est lancé par le harnais, pas par le shell : les variables d'un appel `Bash` ne persistent pas et ne sont pas héritées. `os.environ["CLAUDE_SONDE_SORTIE"]` lève `KeyError`, code 1, aucun fichier écrit. 1.4 a déjà écrit le mauvais diagnostic. Correctif : chemin en dur ou passé en argv depuis `settings.json`, et le redémarrage inscrit comme étape, pas comme repli.

**P3 HAUTE, étapes 1.5 à 1.8, preuve circulaire.** `cible.write_text(...)` écrase, un seul fichier, et le seul marqueur d'origine prévu est `agent_id`, c'est à dire le champ mesuré. Scénario : le relevé de 1.6 ne porte pas `agent_id` ; impossible de distinguer « le harnais ne l'envoie pas » de « ce fichier a été écrit par un `Glob` du fil postérieur ». Correctif : un fichier par appel ou une ligne ajoutée par appel, un discriminant hors test, aucun `Glob` du fil entre le lancement de l'agent et la lecture.

**P4 HAUTE, étapes 2.2 et 2.3, la porte d'arrêt.** Aucune fiche du poste n'a `Edit` ni `MultiEdit` : `.claude/agents/*.md:4` déclarent toutes `tools: Read, Grep, Glob, Bash`, et `developpeur-eve` naît en tâche 4, après. Scénario : le sous agent répond « je n'ai pas l'outil Edit », ni refus de verrou ni passage, et la porte d'arrêt se joue sur un résultat non conclusif. Deuxième non discrimination : `Edit` refuse un fichier non lu dans la session. Troisième : la disponibilité de `MultiEdit` est adossée à un matcher, qui prouve l'intention et non l'existence de l'outil. Correctif : nommer le `subagent_type` et ses outils, faire lire la cible avant de l'éditer, classer d'avance trois issues, ajouter `MultiEdit` au test en place.

**P5 HAUTE, étapes 3.1, 3.2, 3.4.** Le rouge annoncé, `TypeError: unexpected keyword argument 'agent'`, est une erreur de signature : identique que le comportement soit absent ou que le test soit mal tapé. Surtout, aucune étape n'observe un vrai sous agent refusé : S1 n'établit `agent_id` que sur `Glob`, et `garde_git` ne se déclenche que sur `Bash|PowerShell`. G8 revient intact. Correctif : rouge à la couche que `main()` emprunte, puis sonde vivante après 3.3, un sous agent lance `git commit --dry-run -m sonde`, inoffensive dans les deux cas.

**P6 HAUTE, étape 5.4, sortie attendue fausse.** Lancé : `./.venv/Scripts/python.exe .claude/hooks/doctor.py` rend exactement `doctor EVE : 11 OK, 0 alerte(s). Dispositif : .claude/README.md`, puis deux lignes `info`. Les lignes OK ne sont imprimées que sous `if complet:` : `fiches d'agents : completes` n'apparaîtra jamais à 5.4. Même piège en 1.4 : `doctor` ne lit aucun matcher. Correctif : `doctor.py --complet` à 5.4 ; renommer 1.4 ; faire de l'apparition d'un fichier de relevé la vraie preuve d'activité.

**P7 HAUTE, étape 7.1, état de départ et angle mort de git.** Aucune tâche ne capture l'état initial. Pire, lancé : `git check-ignore -v` rend `.git/info/exclude:17: .claude/` et `:18: chantiers/`. Scénario : un agent réécrit `.claude/hooks/garde_perimetre.py` ou l'attendu d'une fixture, `git status --porcelain` reste à 12 lignes, et tous les contrôles restent verts. Correctif : une tâche 0 qui sauvegarde l'état git plus un manifeste sha256 de `.claude/` et des fixtures, rejoué après chaque appel d'agent. **Git n'est pas le filet sur ce périmètre.**

**P8 MOYENNE, étapes 4.1 et 4.5, fixture `mur`.** `mur` reste « une tâche dont le chemin normal bute sur un verrou », sans commande ni message attendu. Un champ vide ne distingue pas « aucun mur rencontré » de « mur caché ». Correctif : nommer la commande exacte et le message exact attendu, et prouver d'abord depuis le fil que le mur est atteignable.

**P9 MOYENNE, étape 4.2, variable confondante.** `CLAUDE.md` est injecté dans le contexte d'un sous agent, je le reçois moi même, et il dit « Agents (.claude/agents/, lecture seule) » et « Le code s'écrit dans le fil principal ». La doctrine n'est corrigée qu'en tâche 6, après. Scénario : à 4.2 l'agent refuse en citant `CLAUDE.md`, le rouge n'est pas rouge, et on attribuera à la clause un refus qui vient de la doctrine. Correctif : passer 6.2 avant la tâche 4, ou exiger que la transcription relève le motif cité par l'agent, seul élément discriminant.

**P10 BASSE, étapes 5.1 et 5.2.** `test_gardes.py:13-17` n'importe pas `doctor` : le rouge est `NameError`, pas l'`AttributeError` annoncé. Et les trois cas testent `fiches_manquantes` isolément : la fonction pourrait être livrée non branchée dans `verifications()`. Correctif : ajouter l'import, et un quatrième cas qui assert que `verifications()` rend bien une ligne nommant les fiches.

## Sur les six points demandés

Trouvé sur les six : commande dont la sortie annoncée est fausse (P1, P6), rouge pour la mauvaise raison (P5, P10), vérification qui ne discrimine pas (P4, P6, P7, P8), preuve circulaire (P3, P8), étape irréversible présentée comme sûre (P1, P7), critère de la spec sans étape (P7 pour le critère 1). À décharge : la cible `%TEMP%\sonde-eve-perimetre.txt` est bien hors périmètre, le compte de contrôles 11 vers 12 est exact, et `doctor` ne rend aujourd'hui aucune alerte.

**Synthèse : le plan échoue d'abord sur ses propres commandes (P1, P2, P6), puis sur trois preuves qui ne peuvent pas contredire leur hypothèse (P3, P4, P7) ; en l'état, la tâche 1 casserait `settings.json` sans filet et la porte d'arrêt de la tâche 2 se jouerait sur un résultat non conclusif.**
