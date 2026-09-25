# Attaque de la spec du lot 1 : findings et vérification contradictoire

Trois `relecteur-eve` lancés en parallèle le 16/09/2026, un axe chacun, sur `design.md` révision 1 : **niveau de preuve**, **chaîne du changement et périmètre**, **aval et contrats**. Aucun n'a vu le rapport des autres. Ils ont rendu 31 findings ; après dédoublonnage, 23 findings distincts. Chacun a été revérifié de ma main avant d'être accepté : la colonne « preuve » ne cite que ce que j'ai lancé ou lu moi même.

**Verdict d'ensemble : la spec révision 1 est cassée sur son point central.** Le banc d'essai en worktree, tel qu'elle le décrit, ne tient pas. Quatre raisons indépendantes, toutes confirmées. Ce n'est pas un détail à corriger, c'est la deuxième condition d'arrêt de la spec qui se déclenche avant même d'avoir commencé.

---

## Les quatre défauts qui tuent le banc en worktree

### G1. `/gate` et `/revue` mesurent la racine, jamais le banc

Trouvé par les trois axes. **CONFIRMÉ.**

```text
$ grep -n "^RACINE\|cwd=RACINE" .claude/hooks/gate.py
34:RACINE = _lib.racine_projet()
50:    r = subprocess.run(["git", *args], cwd=str(cwd or RACINE), ...)
183:  r = subprocess.run(commande, cwd=str(RACINE), ...)      # manage.py test
```

`_lib.racine_projet()` rend `CLAUDE_PROJECT_DIR`, donc la racine, jamais le répertoire courant de l'appelant. Le scénario : l'agent code dans le banc, je lance `/gate`, la sortie annonce `GATE PASS` et 164 tests. Elle porte sur l'arbre de la **mission 0**, pas une ligne du banc n'a été analysée, et je recopie ce PASS comme preuve du travail de l'agent. Même mécanique pour `/revue`, qui diffe à la racine. Le critère de réussite le plus important du lot serait atteint avec une preuve vide.

Aggravant : la spec interdisait explicitement de modifier `/gate` et `/revue` dans ce lot. Elle exigeait donc une preuve tout en interdisant le seul moyen de l'obtenir. C'est une contradiction interne, pas un oubli.

### G2. Rien ne retient mécaniquement l'agent dans le banc, et l'arbre de la mission 0 n'est pas restaurable

Trouvé par les trois axes. **CONFIRMÉ.**

`garde_perimetre` borne sur `CLAUDE_PROJECT_DIR` : la racine **et** le banc sont tous deux dans le périmètre, donc aucun refus n'est possible dans un sens ni dans l'autre. Un agent à qui on demande d'écrire « hors du banc » peut parfaitement choisir `data/schemas/issuer_data.py` de l'arbre principal, qui est un conflit résolu de la mission 0, non commité, non relu par Melvyn.

Et il n'y a pas de retour en arrière : `git checkout <fichier>`, `git restore <fichier>` et `reset --hard` sont **interdits sans exception** par `rules/git.md` et refusés par `garde_git.py:109-125`. Le contrôle prévu (`git status --porcelain` comparé à l'état initial) constate le dégât, il ne le répare pas.

La fixture `rouge` de la spec demandait précisément à un agent d'écrire hors du banc, sans nommer de cible. C'était la plus dangereuse des sondes, et elle était écrite dans une spec dont le sujet est la sûreté.

### G3. `verif_style` perd sa logique delta dans le banc et bloque sur des défauts préexistants

Trouvé par l'axe chaîne. **CONFIRMÉ par mesure.**

```text
$ ./.venv/Scripts/python.exe .claude/hooks/verif_style.py data/schemas/issuer_data.py
data/schemas/issuer_data.py : preexistant dans HEAD, non bloquant : espaces en fin de ligne, lignes [119, 120, ...]
data/schemas/issuer_data.py : preexistant dans HEAD, non bloquant : substitut laisse en place, lignes [1688]
data/schemas/issuer_data.py : preexistant dans HEAD, non bloquant : marqueur de travail non termine, lignes [92, 112, ...]
```

Le verrou compare au contenu du même chemin dans `HEAD`. Pour un fichier du banc, le chemin relatif devient `chantiers/<chantier>/banc/data/...`, qui n'existe pas dans `HEAD` : il n'y a plus de base de comparaison, et **tout défaut devient bloquant**. Le premier `Edit` de l'agent sur ce fichier déclencherait un refus listant trois familles de défauts qu'il n'a pas causés. Il les corrigerait, et produirait un diff massif, contre la règle du plus petit diff.

Détail qui compte : la sonde S5 de la spec, telle qu'écrite, portait sur un fichier **neuf** du banc. Un fichier neuf n'a pas de base non plus, donc la sonde serait passée au vert sans jamais voir le problème.

### G4. Le banc n'aurait ni `.venv`, ni `.env`, ni `ruff.toml`, ni `pyrightconfig.json`

Trouvé par l'axe chaîne. **CONFIRMÉ.**

```text
$ cat .git/info/exclude | tail -12
CLAUDE.md / CONTEXT.md / .claude/ / chantiers/ / graphify-out/ / .graphifyignore
ruff.toml / pyrightconfig.json / .ruff_cache/ / .coverage
$ grep -n "venv\|^\.env" .gitignore
199:.venv    214:.env
```

`git worktree add` ne matérialise que les fichiers suivis. Aucun des cinq n'est suivi, donc aucun n'atterrit dans le banc. L'agent qui lance `python manage.py test` depuis le banc tombe sur le python du PATH, sans Django ; s'il contourne avec le `.venv` de la racine, il tourne sans `.env`, donc sur le repli silencieux vers sqlite de `eve_back/settings.py:81-88`, qui est précisément un des défauts candidats de la spec.

**Au passage, ma propre preuve était contaminée.** J'avais écrit que le worktree frère `EveBackEnd-review` ne contient ni `.claude` ni `.venv`, en citant son listing. Or ce listing montre un `.env`, qui n'est pas suivi non plus (`git ls-files .env` rend zéro ligne) : il y a été déposé à la main. Le listing ne prouve donc pas la mécanique qu'il était censé démontrer. La conclusion reste juste, l'argument était faux. Corrigé : on cite la mécanique, pas le listing.

---

## Les autres findings confirmés

| # | Finding | Axe | Verdict et preuve |
| --- | --- | --- | --- |
| G5 | `develop` **local** a deux commits de retard sur `origin/develop` ; un banc créé depuis lui produirait un troisième `0025`, exactement le défaut que la mission 0 vient de corriger en renumérotant en `0027` | aval, chaîne | **CONFIRMÉ.** `git log --oneline develop..origin/develop` rend `6cf61db` et `76acce9`. `origin/develop` s'arrête à `0026`, notre `0027` n'est pas commité, donc invisible depuis `develop` |
| G6 | `CLAUDE.md:28` et `.claude/README.md` disent « agents en lecture seule » et « le code s'écrit dans le fil principal ». Le lot livre le contraire et ne prévoit pas de les réécrire | aval, chaîne | **CONFIRMÉ.** Ligne lue : `- Agents (.claude/agents/, lecture seule) : ... Le code s'écrit dans le fil principal.` Un dispositif qui se contredit perd son autorité |
| G7 | Le champ « refus de verrou rencontré » est déclaratif et invérifiable : un lot où l'agent a buté trois fois et un lot sans incident rendent le même rapport | preuve | **CONFIRMÉ.** `_lib.py:155-160`, `refuser()` écrit sur stderr et sort. Aucun hook n'enregistre quoi que ce soit nulle part |
| G8 | Le test du correctif `garde_git` fabriquerait lui même le JSON attendu : il resterait vert pour toujours, y compris le jour où le harnais renomme le champ. La barrière disparaîtrait sans signal | preuve | **CONFIRMÉ** par raisonnement, non contesté. Correctif retenu : garder **les deux** barrières, la fiche et le hook, et faire de la présence du champ un contrôle vivant |
| G9 | Les sondes sur `Edit` et `MultiEdit` visaient un chemin inexistant : l'outil aurait échoué tout seul, et on aurait conclu que le verrou tient | preuve | **CONFIRMÉ**, avec une nuance à décharge : la sonde du 15/09 avait bien discriminé, parce que le retour portait le texte `REFUS garde_perimetre`. La spec doit exiger ce texte exact **et** une cible où l'outil réussirait sans le hook |
| G10 | Le répertoire courant reçu par un hook lors d'un appel de sous agent est inconnu, et `garde_git` calcule la branche courante dessus | preuve | **CONFIRMÉ.** `garde_git.py:199` : `branche = _branche_courante(entree.get("cwd") or ...)`. Une sonde de relevé doit établir ce que vaut ce champ |
| G11 | Le quiz est circulaire : le même fil écrit le code, la page d'explication, les questions, et déclare le quiz passé. Aucun seuil n'est fixé. Les critères 6, 7 et 8 imposent à Melvyn des obligations qu'il n'a jamais acceptées | preuve, aval | **CONFIRMÉ.** Le journal liste cinq choses tranchées par Melvyn : niveau, découpage, premier lot, banc, maille. Ni le plafond de trois messages ni le quiz n'y sont. Correctif : questions écrites par un relecteur qui n'a pas orchestré, seuil écrit d'avance, et ces trois critères marqués à valider |
| G12 | Modifier `garde_git` ou `settings.json` pendant que la session mission 0 tourne : elle hérite du changement sans le savoir. Un `settings.json` illisible vaut « aucun verrou actif » | aval, chaîne | **CONFIRMÉ.** `doctor.py` : `except (OSError, json.JSONDecodeError): alertes.append("settings.json absent ou illisible : aucun verrou actif")`. Correctif : copie de sauvegarde, comparaison après retrait, `doctor --complet` derrière, et accord de Melvyn avec l'autre session à l'arrêt |
| G13 | Aucun rapport d'agent n'est conservé : le lot mémoire n'aura pas sa matière première. Melvyn demande explicitement « qui fait quoi, dit quoi » | aval | **CONFIRMÉ.** Le correctif est gratuit et je l'adopte : chaque rapport est déposé tel quel dans `chantiers/<chantier>/agents/`, et le fil ne remonte quand même que le bloc jalon. Les deux règles étaient confondues dans la fiche 0009 |
| G14 | Les fixtures n'ont ni emplacement, ni propriétaire, ni moment de rejeu. Un livrable sans emplacement est un livrable qui n'existera pas | chaîne | **CONFIRMÉ.** Le dossier du chantier n'a aucun dossier de fixtures. Correctif : chemin nommé, contenu imposé (brief exact, attendu, transcription, date), rejeu à chaque modification de la fiche |
| G15 | Aucun chemin du retour. Les conditions d'arrêt disent quand s'arrêter, jamais comment défaire. Je ne peux pas supprimer la branche du banc | chaîne | **CONFIRMÉ.** `garde_git.py:112-113` refuse `git branch -D` sans exception, et `git branch -d` échoue sur une branche non fusionnée. Correctif : une section « défaire », avec la suppression de branche laissée à la main de Melvyn et dite comme telle |
| G16 | `/verif-setup` était donné comme test aval de la ligne au REGISTRE, alors qu'il ne lit ni les fiches d'agents ni le registre | chaîne | **CONFIRMÉ.** `doctor.py:65-125` contrôle settings, scripts de verrous, venv, ruff, coverage, npx, graphify, exclusions, base `.env`, branche, arbre, stash, mémoire. Rien sur `.claude/agents/` ni sur `REGISTRE.md` |
| G17 | Le banc recommandé (`snp_issuer_data`) porte une migration : le premier code jamais écrit par un agent viserait une table réelle, pendant que la mission 0 se bat encore sur une migration | chaîne | **CONFIRMÉ**, et c'est le motif avec lequel la spec écartait elle même un autre candidat. Deux risques au lieu d'un |
| G18 | `banc/` au singulier, figé dans la fiche et dans les fixtures, alors que le lot suivant prévoit plusieurs développeurs en parallèle | aval | **CONFIRMÉ**, correctif gratuit : `bancs/<slug>/`, et la racine du banc devient un paramètre du brief, pas un littéral de la fiche |
| G19 | La fiche ne dit pas de qui elle reçoit ni à qui elle rend, alors que « les agents sont reliés » est l'exigence 2 du brief de Melvyn | aval | **CONFIRMÉ**, correctif gratuit |
| G20 | Le hook de relevé écrirait l'entrée JSON brute des appels d'outils, qui contient le contenu des écritures | aval, hors axe | **CONFIRMÉ**, et c'est un risque de données : le relevé ne garde que les noms de champs et le type, jamais les valeurs de `tool_input` |
| G21 | Le worktree duplique tout le dépôt sous `chantiers/` : les recherches `Grep` et `Glob` des deux sessions verraient deux fois chaque fichier | chaîne | **CONFIRMÉ.** `.graphifyignore` exclut déjà `chantiers/`, mais ni `Grep`, ni `Glob`, ni `ruff check .` ne le font |
| G22 | La section Agents du `REGISTRE.md` est un paragraphe sans colonnes, alors que le critère exige une ligne avec identité, coûts et date de ré-audit | chaîne, hors axe | **CONFIRMÉ**, mineur : soit on convertit la section en table, soit on ajuste le critère |
| G23 | La spec annonce « ces sept sous systèmes » et en énumère une dizaine | preuve, hors axe | **CONFIRMÉ**, erreur de décompte à corriger |

## Findings écartés, avec leur preuve

| Finding | Pourquoi je l'écarte |
| --- | --- |
| « Un fait daté du 16/09 n'a pas sa preuve au journal » (axe preuve) | **Écarté comme périmé, pas comme faux.** Le relecteur a lu le journal avant que j'y écrive l'entrée du 16/09. Elle y est désormais, avec la commande et sa sortie complète. Le finding était juste au moment où il a été émis, et il est sans objet maintenant |
| « Un périmètre d'écriture serait dépassé » (axe chaîne, point 3) | **Écarté par le relecteur lui même**, après vérification : tout ce que la spec écrit (`.claude/`, `chantiers/`, le banc sous la racine, le scratchpad) est couvert par les racines autorisées de `garde_perimetre`. Aucune permission nouvelle n'est à demander à Melvyn. Le vrai problème est l'inverse, c'est G2 : le verrou ne sait pas distinguer la racine du banc |

## Ce que l'attaque n'a pas trouvé, et que je note à décharge

Les sondes S1 à S6 sont bien inoffensives dans les deux cas de figure. La distinction prouvé / documenté non vérifié / non prouvé de la section 4 est tenue ligne à ligne, sauf sur le point relevé en G4. Les deux conditions d'arrêt de la section 6 sont de vraies conditions, pas des intentions, et c'est la seconde qui vient de se déclencher.
