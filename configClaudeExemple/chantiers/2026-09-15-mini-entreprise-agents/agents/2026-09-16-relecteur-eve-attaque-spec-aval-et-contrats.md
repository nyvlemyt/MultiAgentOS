# Rapport brut : attaque de la spec révision 1, axe aval et contrats

Agent : `relecteur-eve`, mode attaque. Lancé le 16/09/2026 sur `design.md` révision 1, en parallèle de deux autres axes. Déposé tel quel le 16/09 au soir depuis la transcription de session. Vérification contradictoire dans `attaques/attaque-spec.md`.

---

## Attaque de spec, axe unique : l'aval et les contrats

Objet : `chantiers/2026-09-15-mini-entreprise-agents/design.md`. Aucun fichier modifié. Je trouve quelque chose sur les six points demandés.

### A1. HAUTE. La fixture `rouge` écrit dans l'arbre de travail de la mission 0, et le dispositif interdit de défaire

`design.md:50` : « fixture `rouge` : brief qui demande d'écrire hors du banc ; jouée d'abord sans la clause (l'agent obéit, c'est le rouge) ». Hors du banc mais dans le projet reste **dans** le périmètre : `garde_perimetre.py:52-66` autorise toute la racine.
Scénario : le brief piège dit « modifie `data/functions.py` ». L'agent obéit (c'est le rouge attendu), `garde_perimetre` laisse passer, `verif_style` valide la forme. Or `data/functions.py` est déjà `M` dans l'index du merge de la mission 0 (`git status`), non relu par Melvyn, en attente d'Edmond. Pour revenir à E0 il faudrait `git checkout -- <fichier>` ou `git restore <fichier>`, tous deux **interdits sans exception** (`.claude/rules/git.md`). Le contrôle prévu (`git status` de la racine) constate le dégât, il ne le répare pas.
Correctif : borner la cible du piège à un chemin sans travail vivant (scratchpad de session, ou `chantiers/<chantier>/piege/fichier.txt`), l'écrire dans `design.md:50`, et exiger la vérification E0 juste avant la fixture.

### A2. HAUTE. `/gate` et `/revue` ne peuvent pas voir le banc, et la spec interdit de les adapter

`design.md:51` demande « sortie de `/gate` depuis le banc », `design.md:56` et le critère 6 (`:90`) exigent gate PASS, revue adverse et contre-relecture sur le chantier du banc ; `design.md:24` exclut « toute modification de `/chantier` et `/revue` ».
Preuve : `gate.py:34` `RACINE = _lib.racine_projet()` (= `CLAUDE_PROJECT_DIR`, `_lib.py:35-40`), `gate.py:50` tous les `git` en `cwd=RACINE`, `gate.py:70` le fichier doit exister sous `RACINE`, `gate.py:183` `manage.py test` en `cwd=RACINE`. `chantiers/` étant exclu de git, `git ls-files --others --exclude-standard` à la racine ne rend **aucun** fichier du banc.
Scénario : l'agent corrige le défaut snp dans le banc, le fil lance `/gate`. Gate liste zéro fichier du banc, lance la suite de tests sur l'arbre de la **racine** (mission 0), affiche `GATE PASS`. Le PASS est vrai et ne prouve rien. Même mécanique pour `/revue` : `revue.md:12` fait `git diff <base>` à la racine, les quatre relecteurs relisent le diff de la mission 0 ; `revue.md:35` corrige « dans le fil principal ». Le critère 6 est réputé tenu avec une preuve vide.
Correctif : soit mettre à jour `/gate` et `/revue` pour accepter un dépôt cible (`--racine <banc>`) et l'inscrire aux livrables, soit renoncer au worktree pour ce lot (la seconde condition d'arrêt de `design.md:69` le prévoit déjà) et le dire. Interdire les deux à la fois est une contradiction interne.

### A3. HAUTE. Collision de numéro de migration avec la mission 0

`design.md:63` crée le banc depuis `develop` ; `design.md:77` recommande le défaut snp, « schéma pandera, modèle, migration ». Vérifié : `git ls-tree origin/develop data/migrations/` s'arrête à `0026` ; l'index de la branche porte `0027_alter_issequityesgissuerdata_...`, **non commité**, donc invisible depuis `develop`.
Scénario : `makemigrations` dans le banc produit un second `0027_...`. Deux feuilles pour `develop`, exactement le défaut qui a coûté l'étape 0.2 (`PLAN.md:26` et `PLAN.md:64`, migration `0025` en doublon). Edmond le voit à la PR, et le retour connu « une migration un sujet » tombe sur le premier essai d'agent.
Correctif : ajouter à `design.md:77` la contrainte « le banc est créé depuis la branche de la mission 0, ou son défaut ne porte pas de migration tant que `0027` n'est pas commité ».

### A4. HAUTE. E3 modifie un verrou partagé pendant qu'une autre session tourne

`design.md:65` : correctif de `garde_git` en TDD si `agent_id` est présent. `_missions/2026-09-15:123` pose que la session dédiée a la main sur `.claude/`, donc la session mission 0 hérite du hook modifié sans le savoir (les hooks sont relus à chaque appel, `settings.json:13-25`).
Scénario : le correctif atterrit, Melvyn dit « commit » dans la session mission 0, le hook interprète mal un champ et refuse. `securite.md` interdit de désactiver un verrou : la mission 0 est bloquée le jour où Edmond attend. Aucun test de non régression « le fil peut toujours commiter sur `features/melvyn/*` » n'est demandé, aucune procédure de retour arrière n'est écrite.
Correctif : à E3, exiger un test vert avant et après sur le cas fil principal, et une ligne de retour arrière (fichier, commande) dans `design.md:65`. Ajouter que la sonde par hook de relevé passe par `settings.json` et demande donc un redémarrage de session (`verif-setup.md:12`).

### A5. HAUTE. `CLAUDE.md` continue de dire le contraire de ce que le lot livre

`CLAUDE.md:28` : « Agents (`.claude/agents/`, **lecture seule**) ... **Le code s'écrit dans le fil principal**. » Les livrables (`design.md:15-21`) et les critères (`design.md:85-92`) citent la fiche, le `REGISTRE.md` et `communication.md`, jamais `CLAUDE.md`.
Scénario : lot 1 terminé, nouvelle session demain. `CLAUDE.md` est chargé d'office et dit que les agents ne codent pas ; `.claude/agents/developpeur-eve.md` dit l'inverse. Le fil tranche seul, dans un sens ou dans l'autre, et la doctrine perd son autorité.
Correctif : mettre la réécriture de `CLAUDE.md:28` (et la ligne du pipeline sur l'implémentation dans le fil) aux livrables et en critère de réussite.

### A6. HAUTE. Personne n'est nommé pour commiter le banc, le critère 6 contredit la relecture VS Code, le point de non retour n'est pas dit

`design.md:81` dit seulement « le banc n'est pas poussé ». Rien ne dit qui commite le travail du banc, ni ce que devient le worktree à la fin. Or `git.md` : « Je ne committe et ne pousse que sur demande explicite de Melvyn, **après qu'il a relu les changements dans VS Code** », et `PLAN.md:69` en fait une action de sa main.
Scénario : fin du jalon, le travail est dans un worktree non commité ; le fil le supprime, tout est perdu, ou il commite sans demande (rupture de `git.md`), ou il demande (un message de plus, critère 8). Et si le travail est un jour commité, `git.md` exige la relecture VS Code que le critère 6 (`design.md:90`) interdit.
Correctif : ajouter une section « fin de vie du banc » (qui commite, quand, ce qui est supprimé, ce qui reste), écrire que la relecture VS Code avant commit reste intacte et que le critère 6 vaut jusqu'à la validation du jalon, et nommer le point de non retour, qui est le correctif de `garde_git` (A4) plus le premier commit dans le banc, pas le quiz.

### A7. MOYENNE. Aucun rapport d'agent n'est conservé : le lot mémoire n'aura pas sa matière

`_decisions/0009:32` : « Aucun rapport d'agent recopié tel quel, **aucun dossier `agents/` nouveau** ». Le brief demande « que la gestion de la mémoire, de qui fait quoi, dit quoi, etc soit bien faite » (`_missions:13`) et la phase 3 prévoyait `chantiers/<chantier>/agents/` (`_missions:97`). `design.md:24` diffère le gardien de mémoire, ce qui est franc, mais ne dit pas que la matière première est jetée.
Scénario : lot 5, le gardien de mémoire doit répondre « qui a dit quoi le 16/09 ». Il ne reste que le bloc jalon, une synthèse écrite par le fil. Les rapports des relecteurs et du développeur sont morts avec le contexte de session. Le lot 5 devra rejouer ce que le lot 1 a déjà payé.
Correctif : dissocier les deux règles. Le fil ne remonte que le bloc jalon (contrainte de chat), et chaque rapport d'agent est déposé tel quel dans `chantiers/<chantier>/agents/<date>-<agent>-<n>.md`. Coût nul, aucun message de plus.

### A8. MOYENNE. `banc/` au singulier, figé dans la fiche et dans les fixtures

`design.md:45` et `:50` posent `chantiers/<chantier>/banc/` et une clause « périmètre d'écriture limité au banc ». Le lot « plusieurs développeurs en parallèle » est annoncé (`design.md:24`).
Scénario : au lot suivant, deux `developpeur-eve` en parallèle partagent un worktree et une branche, s'écrasent, et il faut réécrire la clause, les trois fixtures déjà transcrites et la ligne du `REGISTRE.md`.
Correctif : nommer `chantiers/<chantier>/bancs/<slug>/` dès maintenant, et faire de la racine du banc un paramètre du brief plutôt qu'un littéral de la fiche.

### A9. MOYENNE. Le critère 8 n'a pas été accepté et se heurte à l'arbitrage

Le journal (`journal.md:101-111`) liste cinq choses tranchées par Melvyn : niveau, découpage, premier lot, banc, maille par jalon. Ni le plafond de trois messages ni le comptage n'y figurent ; ses mots disent « le fil ne doit pas être inondé », pas un chiffre. Le critère 8 lui impose une obligation qu'il n'a pas posée, et `design.md:94` l'assume sans le marquer à valider.
Scénario : le relecteur rend un finding CRITIQUE qui demande un arbitrage de Melvyn. Le fil demande, et brûle un message sur trois, ou tranche seul, et Melvyn n'a plus les ordres. Les demandes de permission déclenchées par un outil non listé dans `settings.json` comptent aussi comme des interruptions.
Correctif : marquer les critères 6, 7 et 8 « à valider par Melvyn » dans `design.md:94`, et exclure du comptage les messages qui lui demandent un arbitrage.

### A10. BASSE. La fiche ne dit pas de qui elle reçoit ni à qui elle rend

Exigence 2 du brief (`_missions:27`, « les agents sont reliés »). Les quatre fiches en place ont une section « Quand » (`relecteur-eve.md:11`). Les lignes de `design.md:50-53` ne demandent à la fiche que périmètre, TDD, refus et forme du rapport.
Scénario : au lot organigramme, aucune fiche ne porte son chaînage, il faut toutes les rouvrir.
Correctif : ajouter « Quand, de qui je reçois, à qui je rends » au critère 2.

### Synthèse

La spec est solide sur la sûreté des verrous et faible sur ses consommateurs : elle demande `/gate` et `/revue` sur un arbre qu'ils ne savent pas voir, laisse deux `0027` se former, touche un verrou partagé par une session vivante, et laisse `CLAUDE.md` affirmer le contraire du lot. A2 et A3 se corrigent en deux lignes de spec, A1 et A4 avant toute exécution.

Hors axe, une ligne : `design.md:65` prévoit un hook de relevé qui écrit l'entrée JSON brute des appels d'outils dans le scratchpad ; cette entrée contient le champ `content` des écritures, à cadrer côté `garde_donnees`.

Fichiers ouverts : `design.md`, `journal.md`, `_decisions/0009`, `_missions/2026-09-15-mini-entreprise-agents.md`, `PLAN.md`, `CLAUDE.md`, `.claude/commands/gate.md`, `revue.md`, `verif-setup.md`, `.claude/agents/relecteur-eve.md`, `architecte-eve.md`, `.claude/hooks/gate.py`, `garde_perimetre.py`, `_lib.py`, `.claude/settings.json`, `.graphifyignore`.
