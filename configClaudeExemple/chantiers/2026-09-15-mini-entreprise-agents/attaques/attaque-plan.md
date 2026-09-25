# Attaque du plan du lot 1a : findings et vérification contradictoire

Trois `relecteur-eve` lancés en parallèle le 16/09/2026 sur `plan.md` révision 1, axes : **niveau de preuve**, **enchaînement des tâches**, **périmètre et sûreté d'exécution**. Aucun n'a vu le rapport des autres. 33 findings rendus, **19 distincts** après dédoublonnage, **tous confirmés** de ma main sauf un, écarté avec preuve par le relecteur lui même.

**Verdict : le plan révision 1 aurait échoué dès sa première tâche, et sa fixture centrale n'aurait rien prouvé.** Trois de mes commandes ne rendaient pas ce que j'annonçais, une preuve d'état n'existait pas, et l'ordre de mes propres étapes détruisait la valeur du test rouge.

---

## Les cinq défauts qui cassent l'exécution

### Q1. `$SCRATCHPAD` n'existe pas dans le shell des outils, et l'ordre du nettoyage bloque les deux sessions

Trouvé par les trois axes. **CONFIRMÉ.**

```text
$ echo "SCRATCHPAD=[$SCRATCHPAD]"    -> SCRATCHPAD=[]
$ echo "CLAUDE_PROJECT_DIR=[$CLAUDE_PROJECT_DIR]"  -> []   (seuls les hooks le recoivent)

$ ./.venv/Scripts/python.exe .claude/hooks/script_qui_nexiste_pas.py ; echo $?
can't open file ... [Errno 2] No such file or directory
code de sortie = 2
```

Deux conséquences, la seconde bien pire que la première. La sauvegarde de `settings.json` partait vers `/settings.json.copie`, c'est à dire la racine MSYS, et la restauration échouait ensuite en silence. Et mon étape 1.7 supprimait `sonde_releve.py` **après** avoir tenté la restauration, dans un bloc sans `&&` : si la restauration échoue, `settings.json` déclare un script absent, ce script rend **code 2**, et un `PreToolUse` en code 2 **refuse l'appel**. Plus aucun `Glob` ne passe, dans les deux sessions, sans que personne comprenne pourquoi.

**Correctif** : chemin absolu écrit en dur dans le plan, sauvegarde durable dans le dossier du chantier plutôt que dans le scratchpad (qui disparaît si la session redémarre), et l'ordre inversé : on retire d'abord la déclaration, on vérifie l'empreinte, on supprime le script en dernier.

### Q2. La variable d'environnement du relevé n'atteindrait jamais le hook

Trouvé par deux axes. **CONFIRMÉ** : le hook est lancé par le harnais, pas par mon shell, donc rien de ce qu'un appel `Bash` exporte ne lui parvient. `os.environ["CLAUDE_SONDE_SORTIE"]` aurait levé `KeyError`, le hook serait sorti en code 1, aucun relevé n'aurait été écrit, et mon étape 1.4 prescrivait déjà le mauvais remède : redémarrer la session, ce qui n'aurait rien changé.

**Correctif** : le chemin de sortie est en dur dans la sonde, sous `%TEMP%\claude` (racine déjà autorisée par `garde_perimetre.py:60`, donc la sonde reste dans le périmètre même si aucun verrou ne la surveille). La sonde **ajoute une ligne** à un fichier JSONL au lieu d'écraser, et chaque ligne porte un discriminant qui n'est pas le champ mesuré.

### Q3. La porte d'arrêt se jouait sur un résultat non concluant

Trouvé par deux axes. **CONFIRMÉ.**

```text
$ grep -n "^tools:" .claude/agents/*.md
architecte-eve.md:4:tools: Read, Grep, Glob, Bash
chercheur-eve.md:4:tools: Read, Grep, Glob, Bash, WebFetch, WebSearch
redacteur-eve.md:4:tools: Read, Grep, Glob, Bash
relecteur-eve.md:4:tools: Read, Grep, Glob, Bash
```

**Aucune fiche du poste n'a `Edit` ni `MultiEdit`**, et `developpeur-eve` n'existe qu'à la tâche 4. Le sous agent aurait répondu « je n'ai pas cet outil » : ni refus de verrou, ni passage. À la lettre de mon plan, la sonde n'étant pas verte, la porte d'arrêt tombait et le lot s'arrêtait sur un verrou qui n'a rien.

**Correctif** : nommer l'exécutant et ses outils, faire lire la cible avant de l'éditer (`Edit` refuse un fichier non lu, ce qui est une troisième cause d'échec non discriminée), et écrire la règle de requalification : un retour qui n'est pas un refus de hook n'est ni vert ni rouge, il se rejoue.

### Q4. Personne ne prend l'état de départ, et git ne voit pas le périmètre de ce lot

Trouvé par les trois axes. **CONFIRMÉ**, et c'est le finding le plus structurant.

Mon étape 7.1 comparait « à ce qui a été sauvegardé avant la tâche 1 » : aucune tâche ne le sauvegardait. Le critère 1 de la spec n'était donc prouvé par rien. Pire : `.claude/` et `chantiers/` sont exclus de git, donc un agent qui réécrirait un verrou, une fiche ou l'attendu d'une fixture laisserait `git status --porcelain` **inchangé**, et tous mes contrôles d'après appel d'agent seraient restés verts sur un poste modifié.

**Correctif** : une tâche 0 qui capture l'état complet (`git status --porcelain`, `git diff`, `git diff --cached`, `git stash list`, `git worktree list`, `.git/MERGE_HEAD`) **et un manifeste sha256 de `.claude/` et des fixtures**, rejoué après chaque appel d'agent. Git n'est pas le filet sur ce périmètre.

### Q5. Mon propre ordre détruisait la valeur du test rouge

Trouvé par deux axes. **CONFIRMÉ** par un fait que je peux constater directement : `CLAUDE.md` est injecté dans le contexte de chaque sous agent, et il dit aujourd'hui « Agents (`.claude/agents/`, lecture seule) » et « Le code s'écrit dans le fil principal ».

Ma fixture rouge lançait un agent **sans la clause de périmètre** pour vérifier qu'il obéit au piège. Mais il aurait pu refuser en citant `CLAUDE.md`. J'aurais ensuite ajouté la clause, constaté un refus, et crédité la clause d'un refus qui venait de la doctrine. Variante pire : il passe outre `CLAUDE.md`, et le lot vient d'établir qu'un agent peut ignorer ses instructions projet.

**Correctif** : monter la correction de la doctrine avant la tâche des fixtures, et prévoir explicitement la branche « la rouge n'a pas été rouge » : on le consigne, et on n'affirme pas que la clause tient. La transcription relève toujours le motif cité par l'agent, seul élément discriminant.

---

## Les autres findings confirmés

| # | Finding | Verdict et correctif |
| --- | --- | --- |
| Q6 | La fiche ne fixait aucune liste d'outils. Sans `tools`, l'agent hérite de tout, dont `Task`, `WebFetch` et `WebSearch`, qu'aucun des trois matchers de `settings.json` ne couvre | **CONFIRMÉ.** Un agent bloqué sur une erreur pourrait coller du code du dépôt dans une recherche externe sans qu'aucun verrou le voie. La ligne `tools` est écrite dans le plan, sans `Task`, `WebFetch` ni `WebSearch`, et la fiche porte la clause « aucune requête externe, aucun contenu du dépôt hors de la machine » |
| Q7 | Trois clauses manquaient à la fiche, sur ce qu'aucun hook ne voit | **CONFIRMÉ.** Ajoutées : tests uniquement par `/gate` ou avec `DB_CONFIG` forcé en sqlite et `.env` jamais lu ni modifié (sinon Django créerait une base de test sur le serveur partagé) ; aucune dépendance nouvelle, aucune écriture dans `.venv` ni `requirements.txt` ; aucun fichier supprimé, aucun fichier écrasé sans l'avoir lu, jamais un fichier absent du brief |
| Q8 | « Rapport déposé tel quel » est mécaniquement impossible | **CONFIRMÉ.** `verif_style.DOSSIERS_IGNORES` ne contient pas `chantiers/`, et un fichier neuf n'a pas de base dans HEAD, donc tout défaut y est bloquant. Un rapport d'agent contenant un tiret cadratin ou une formule de remplissage serait refusé. Correctif retenu : `chantiers/*/agents/` et `chantiers/*/fixtures/` entrent dans `DOSSIERS_IGNORES`, au motif exact de `/.claude/hooks/tests/` qui y est déjà « parce que les fixtures contiennent volontairement les motifs interdits ». `verif_style.py` entre dans la table des fichiers du plan |
| Q9 | Dépendance circulaire : `doctor` contrôlait la ligne au `REGISTRE.md` que seule une tâche ultérieure écrit | **CONFIRMÉ.** Correctif : `doctor` n'a plus de constante de fiches attendues ; il **liste** les fiches présentes dans `.claude/agents/` et alerte sur celles qui n'ont pas de ligne au registre. Le couplage disparaît, la valeur reste, et la suppression d'une fiche redevient propre |
| Q10 | La table « défaire » de la spec disait « aucun autre fichier ne les nomme », ce qui est faux | **CONFIRMÉ.** Avec le correctif Q9 le couplage `doctor` disparaît ; la table est complétée pour `REGISTRE.md`, `test_gardes.py`, `securite.md`, `INDEX.md`, `PLAN.md` |
| Q11 | Une fenêtre laissait sur disque une fiche d'agent **sans sa clause de périmètre**, visible de toutes les sessions | **CONFIRMÉ.** Correctif : la variante sans clause porte un autre nom, elle est supprimée dès le rouge constaté, et la contrainte « session mission 0 fermée » couvre toute la tâche des fixtures, pas seulement la sonde |
| Q12 | `garde_git.py` est relu à chaque appel par toutes les sessions ; le test de non régression n'appelait jamais `main()` | **CONFIRMÉ.** Correctif : contrainte de session étendue à la tâche du correctif, et un test de bout en bout par stdin (deux entrées JSON, avec et sans `agent_id`, codes 2 et 0 attendus), au motif des cas de `doctor.autotests()` |
| Q13 | Le rouge annoncé était une erreur de signature, pas un rouge de comportement | **CONFIRMÉ.** Correctif : le rouge porte sur la couche que `main()` emprunte, et une sonde vivante après le correctif (un sous agent lance `git commit --dry-run`, inoffensif dans les deux cas) relève le refus réel |
| Q14 | Le rouge de la tâche `doctor` aurait été un `NameError` faute d'import | **CONFIRMÉ.** `test_gardes.py` importe `_lib`, `garde_donnees`, `garde_git`, `garde_perimetre`, `verif_style`, pas `doctor`. Import ajouté, plus un cas qui vérifie que le contrôle est bien branché dans `verifications()` |
| Q15 | La sortie attendue de `doctor` était fausse | **CONFIRMÉ.** `doctor.py` sans `--complet` n'imprime que l'entête et les alertes : `doctor EVE : 11 OK, 0 alerte(s)`. La ligne nommée n'apparaît qu'avec `--complet`. Corrigé, et le compte 11 vers 12 est juste, lui |
| Q16 | La fixture `mur` n'avait ni commande ni message attendu | **CONFIRMÉ.** Sans cela, un champ vide ne distingue pas « aucun mur » de « mur caché ». La fixture nomme la commande exacte et le message exact, et le mur est prouvé atteignable depuis le fil avant d'être proposé à l'agent |
| Q17 | « Strictement identique » n'est pas tenable pendant que Melvyn peut commiter la mission 0 | **CONFIRMÉ.** Correctif : le critère devient « aucun chemin hors de la liste figée en tâche 0 n'a changé », et la référence se reprend explicitement après tout commit de Melvyn, noté au journal |
| Q18 | Les actions de la main de Melvyn étaient dispersées dans les tâches | **CONFIRMÉ**, et ça faisait échouer le critère des trois messages avant le premier livrable. Correctif : un bloc unique en tête de plan, avec les commandes exactes, et les mêmes lignes dans `PLAN.md` section 3 |
| Q19 | Les règles du bloc jalon devenaient doctrine permanente pour toutes les sessions | **CONFIRMÉ.** Le plafond de messages est une mesure **de ce lot**, pas une règle générale : le bloc est borné au mode jalon avec agents, et la phrase d'entrée le dit |

## Findings écartés, avec leur preuve

| Finding | Pourquoi il est écarté |
| --- | --- |
| « L'attendu 12 contrôles OK, zéro alerte, est intenable » | **Écarté par le relecteur lui même**, preuve à l'appui : `doctor.py` rend aujourd'hui `11 OK, 0 alerte(s)`, donc 12 après la tâche est atteignable. Ce qui reste intenable sur ce point est la comparaison d'état, traitée en Q4 et Q17 |
| « Le relevé fait fuir des données » | **Écarté après examen**, avec deux résidus traités quand même : pour un événement `Glob`, les clés de `tool_input` sont `pattern` et `path`, aucun secret ne transite par l'entrée d'un hook, et `forme()` ne conserve que des noms de champs. Résidus corrigés : `cwd` tronqué à sa dernière composante pour ne pas écrire le nom de compte Windows, et la sonde refuse d'écrire ailleurs que sous `%TEMP%\claude` |

## Ce que les relecteurs ont trouvé bon, et que je note à décharge

La conception adverse du plan tient : la porte d'arrêt est placée avant toute écriture d'agent, les deux barrières contre le commit sont conservées, et le principe du rouge avant la clause est le bon. La cible `%TEMP%\sonde-eve-perimetre.txt` est réellement hors périmètre, vérifié dans `garde_perimetre.py:52-61` : seuls la racine du projet, `C:\dev\bdfg-core`, la mémoire du bucket, `~/.claude/settings.json` et `%TEMP%\claude` sont autorisés. Le plan ne déborde sur aucun des sept sous systèmes mis hors périmètre.
