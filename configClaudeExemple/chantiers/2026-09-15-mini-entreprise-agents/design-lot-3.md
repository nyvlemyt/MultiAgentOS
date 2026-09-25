# Spec du lot 3 : refondation des verrous de commande

**Revision 1**, 17/09/2026 au matin, ecrite par le fil apres la nuit autonome et le reproche de Melvyn
(« une correction implique une autre erreur, ca prouve que tu as mal commence »). Niveau **structurant**
(les verrous sont la barriere de securite du poste). Vocabulaire : `codebase-design` (module, interface,
seam, profondeur). Source des motifs portes : `C:\dev\maos`, `origin/feat/path-guard-s5`
(`packages/core/src/path-guard.ts` et son test) et `origin/main` (`packages/core/src/risk-classifier.ts`,
`docs/backlog/perms-category-matcher-brittleness.md`), lus le 17/09/2026. Rien n'en est recopie.

## 1. Le probleme, en une phrase

Trois verrous jugent des commandes shell avec **trois analyseurs differents** et **deux tables de verbes
qui divergent**, si bien que chaque correctif ferme un trou dans un analyseur et laisse le meme trou
ouvert dans les deux autres : la nuit du 16 au 17/09 a produit cinq regressions et six verdicts non PASS
pour cette seule raison.

## 2. Ce que la nuit a etabli, et qui commande la conception

| Fait | Preuve | Consequence pour la conception |
| --- | --- | --- |
| « Quel programme est lance, enveloppes traversees » est ecrit trois fois : `_lib._index_du_shell`, `garde_perimetre._programmes_invoques`, `garde_git._arguments_git` (qui ne saute que `sudo`, `time`, `exec`) | `env git push --force` PASSE, `env bash -c "git push --force"` REFUS (revue de cloture 2b1) | **une seule** fonction qui rend les programmes lances, consommee par les trois verrous |
| Deux tables de verbes : `_cibles_ecriture` et `_cibles_protegees` | `curl -o <hors>`, `dd of=<hors>`, `find <hors> -delete`, `[IO.File]::Delete('<hors>')` PASSENT au perimetre et sont REFUSES sur un `.env` | **un seul** catalogue d'effets qui rend « quels chemins sont ecrits ou detruits », puis deux predicats (hors perimetre, zone protegee) appliques au meme resultat |
| Le decoupeur a un repli silencieux : `shlex` echoue sur des guillemets juges non equilibres et `decouper_commande` retombe sur `commande.split()` | 17/09 au matin, `git log ... 2>/dev/null; git rev-list` REFUSE pour « ecriture sur `/dev/null;` » | **aucun mode degrade** : le decoupeur analyse ou dit pourquoi il ne peut pas, et les verrous refusent l'inanalysable en le disant |
| Une suite de tests verte ne prouve rien d'un verrou ; cinq fois un trou exploitable sous des tests verts | journal, bilan de la nuit | les tests se derivent **du contrat ecrit** (les regles), pas du code : un corpus de cas, ecrit avant le code, avec pour chaque phrase des regles un cas refuse **et** un cas autorise |
| Une doctrine qui promet plus que le code est pire qu'une absence de doctrine | quatre phrases de `securite.md` retrecies dans la nuit | `securite.md` et `git.md` se reecrivent **apres** mesure, a partir du corpus, jamais avant |
| Les rapports de `garde_donnees` sont clos : il juge le texte, pas le verbe | onze commandes, zero ecart (verification 2b1) | `garde_donnees` garde son balayage du texte brut **en plus** du nouvel analyseur ; il ne perd rien |

## 3. Le contrat, tel que les regles l'ecrivent

Le corpus executable est `.claude/hooks/tests/corpus_contrat.py` ; cette section en est la table des
matieres. Chaque ligne du corpus cite sa regle et sa source.

- **`git.md`, interdits sans exception** : `push --force` et variantes, `reset --hard`, `clean`,
  `branch -D`, `checkout .` ou `checkout -- <fichier>`, `restore <fichier>` (seul `--staged` permis),
  `stash drop`, `stash clear`, `commit --amend`, `--no-verify`, `config --global`, suppression de tag ou
  de branche distante, `rebase` interactif ou d'une branche partagee ; push seulement vers
  `features/melvyn/*` ; aucun commit ni merge sur `develop`, `master`, `test1` ; un sous agent ne
  committe ni ne pousse. **Quelle que soit la facon d'appeler git** : direct, derriere une enveloppe
  (`env`, `timeout 5`, `nice`, `command`, `nohup`, `stdbuf`, `uv run`, `winpty`, `start`, chemin absolu),
  derriere un shell imbrique (`bash -c`, `sh -c`, `pwsh -Command`, `cmd /c`), dans une substitution
  (`$(...)`, accents graves), avec `-C <chemin>` ou des options globales.
- **`securite.md`, perimetre** : ecriture, modification, suppression, deplacement (source **et**
  destination) seulement dans `EveBackEnd`, `C:\dev\bdfg-core`, la memoire du bucket, le scratchpad,
  `~/.claude/settings.json`. Copier **depuis** l'exterieur vers le projet est une lecture. **Zone
  protegee** : tout fichier dont le nom commence par `.env`, meme dans le projet, jamais ecrit, modifie,
  supprime, deplace, ecrase par copie ; sa lecture reste ouverte (`cat`, `grep`, `Read`, copie sortante,
  inventaire d'archive, et desormais un interpreteur qui lit sans indice d'ecriture).
- **`donnees.md`** : aucune lecture du contenu des dossiers de donnees ni d'un fichier de donnees hors
  documents identifies, ni du token ; noms, tailles et dates autorises ; inchange, non regresse.
- **Inanalysable = refuse, en le disant** : plus d'un niveau de shell imbrique, `-EncodedCommand`,
  `eval`, une commande lue depuis un tube (`curl ... | sh`, `echo x | bash`), des guillemets non
  equilibres apres retrait des documents en ligne.

## 4. Le decoupage en modules

Trois modules, une seam chacun, tous dans `.claude/hooks/`, bibliotheque standard seulement (un hook
demarre en quelques dizaines de millisecondes).

### 4.1 `_commande.py` : de la ligne de commande aux invocations

**Interface** : `analyser(commande: str, outil: str) -> Analyse`, ou `Analyse` porte `invocations:
list[Invocation]` et `opaque: str | None` (le motif pour lequel la commande ne peut pas etre jugee).
`Invocation` porte `programme` (nom canonique : base, minuscules, sans `.exe`), `args` (apres le
programme, enveloppes et affectations `VAR=x` retirees), `redirections` (operateur et cible),
`enveloppes` (celles traversees), `profondeur` (0 en direct, 1 dans un shell imbrique), `alimentee_par_tube`
(vrai si ses arguments viennent d'un tube, cas `xargs`), `texte` (la sous-commande brute).

**Ce que l'implementation cache** : le lexeur (`shlex` non POSIX, ponctuation), les separateurs (`;`,
`&&`, `||`, `|`, `&`, saut de ligne), les documents en ligne (`<<EOF` : le corps est **retire** avant
analyse, sauf s'il alimente un interpreteur, ou il devient une commande interne), les substitutions
(`$(...)`, accents graves : leurs commandes s'ajoutent aux invocations), les enveloppes et leur argument
numerique, les shells imbriques (redecoupage a un niveau), `find -exec`, `xargs`, les options de `cmd`
(`/c`, `/k`) distinguees d'un chemin absolu Git Bash.

**Modes d'echec** : jamais d'exception vers l'appelant, jamais de repli silencieux ; `opaque` vaut la
raison (« guillemets non equilibres », « shells imbriques sur plus d'un niveau », « commande encodee »,
« eval », « commande lue depuis un tube ») et `invocations` porte ce qui a pu etre analyse avant.

**Profondeur** : c'est le module profond du lot. Les trois verrous et `doctor` n'ont plus a connaitre ni
`shlex`, ni les enveloppes, ni les shells. `_lib.decouper_commande`, `premier_mot`, `commande_interne`,
`commande_non_analysable`, `profondeur_imbrication`, `_index_du_shell` disparaissent de `_lib` une fois
les appelants migres ; `_lib` garde le socle chemin (`normaliser`, `sous`, `racine_projet`,
`chemins_de_l_outil`, `lire_entree`, `refuser`, `autoriser`, `EXT_DONNEES`).

### 4.2 `_effets.py` : de l'invocation aux acces

**Interface** : `acces(inv: Invocation, texte_amont: str = "") -> list[Acces]`, ou `Acces` porte
`chemin` (brut, tel que cite), `mode` (`LIT`, `ECRIT`, `DETRUIT`), `origine` (la famille qui l'a
produit, pour le message de refus). `texte_amont` est le texte des sous-commandes qui alimentent un tube :
les cibles d'un verbe alimente par `xargs` sont les chemins cites en amont.

**Ce que l'implementation cache** : **un seul catalogue** `CATALOGUE: dict[str, Famille]`, declaratif,
qui dit pour chaque programme quels arguments il ecrit, detruit ou lit : toutes cibles (`rm`, `tee`,
`touch`, `Remove-Item`, `Set-Content`...), destination seule (`cp`, `Copy-Item`, `install`, `ln`),
deplacement (source detruite et destination ecrite : `mv`, `Move-Item`), edition en place (`sed -i`,
`awk -i`), option cible (`curl -o`, `wget -O`, `dd of=`, `tar -C` en extraction, `patch`), `find`
(`-delete` detruit son point de depart, `-exec` est deja une invocation), interpretes (`python -c`,
`node -e`, `pwsh -Command`, script du depot : chemins cites dans le texte, `ECRIT` si un indice
d'ecriture est present, `LIT` sinon ; `os.system(`, `subprocess` font redecouper leur argument comme
une commande interne), appels .NET depuis l'outil `PowerShell` (les deux conventions), lecteurs (`cat`,
`head`, `grep`... : `LIT`), metadonnees (`ls`, `stat`, `Get-ChildItem`... : rien). Les redirections
`>`, `>>` ecrivent leur cible, `<` la lit ; `/dev/null`, `nul`, `$null`, `&1`, `&2` ne sont pas des
cibles. Les gestionnaires de paquets (`npm install`, `uv`, `poetry`, `pip`) ne sont pas la commande
Unix `install`. Un residu de decoupage (`\`, `/` seuls, vide) n'est pas une cible.

**Profondeur** : c'est ici que vivait la dette. Une famille ajoutee vaut d'un coup pour le perimetre, la
zone protegee et les donnees.

### 4.3 Les trois verrous deviennent des politiques

`garde_perimetre.decision`, `garde_git.decision`, `garde_donnees.decision` **gardent leur signature**
(les tests en place, `doctor` et `settings.json` ne bougent pas) et deviennent courts : `analyser`, puis
pour chaque invocation `acces`, puis le predicat propre au verrou.

- **perimetre** : `opaque` refuse ; tout `Acces` en `ECRIT` ou `DETRUIT` dont le nom commence par
  `.env` refuse (zone protegee, message en premier) ; tout `Acces` en `ECRIT` ou `DETRUIT` hors des
  racines autorisees refuse ; **nouveau** : toute ecriture sous `.git/` refuse (un hook git est de
  l'execution de code ; motif `path-guard.ts` de MAOS ; le recours reste la main de Melvyn, comme pour
  `.git/info/exclude` aujourd'hui).
- **git** : pour chaque invocation dont `programme == "git"`, `_verifier(args, branche, agent)` inchange.
  Les enveloppes ne sont plus son probleme.
- **donnees** : pour chaque `Acces` (tous modes) `motif_de_refus` inchange, sauf famille metadonnees ;
  **plus** le balayage du texte brut existant (chemins absolus), conserve tel quel.

## 5. Ce que le lot ne fait pas

Pas de resolution de liens symboliques (jonctions Windows : limite ecrite, motif `realpath` de MAOS
note pour plus tard). Pas de suivi d'un script lu depuis un fichier (`bash script.sh`, `python x.py`
dont le corps ecrit sans nommer sa cible sur la ligne). Pas de decodage du base64. Pas de nouveau verbe
hors de ceux que le corpus nomme. Pas de changement de `verif_style`, `gate`, `nettoyer_caracteres`.
Pas de modification de `settings.json`. Aucun fichier suivi par git.

## 6. Ou le changement agit, ou on le prouve

| Changement | Couche | Interface publique la plus proche | Test principal a cette couche | Complements |
| --- | --- | --- | --- | --- |
| Le contrat devient executable | la trace et les tests | `corpus_contrat.CAS` | `test_contrat.py` : chaque cas joue contre le `decision()` de son verrou ; **ecrit et joue rouge avant tout code**, la liste des rouges au journal | `doctor --complet` lance la suite |
| Un seul analyseur de commande | `_commande.py` | `analyser(commande, outil)` | tests unitaires : enveloppes, shells, substitutions, documents en ligne, tubes, `find -exec`, modes d'echec, **plus** un test d'egalite : pour les onze commandes de `garde_donnees`, l'ancien decoupage et le nouveau rendent les memes chemins | le corpus, via les trois verrous |
| Un seul catalogue d'effets | `_effets.py` | `acces(invocation)` | tests unitaires par famille, un cas `ECRIT`, un `LIT` ou rien, un piege (option numerique, `grep rm x`) | le corpus |
| Les trois verrous deviennent des politiques | `garde_*.py` | `decision(...)`, signatures inchangees | les 98 tests en place passent **sans modification** de leurs attendus ; ceux qui testaient une fonction interne disparue sont reecrits sur `analyser` ou `acces` | `doctor --complet`, ses sept sondes par stdin |
| `.git/` protege en ecriture | `garde_perimetre` | `decision("Write", {"file_path": ".git/hooks/pre-commit"})` | cas au corpus, refuse ; `.gitignore` et `.git/info/exclude` en lecture passent | `securite.md` |
| Fin du repli silencieux | `_commande.py` | `Analyse.opaque` | cas au corpus : guillemets non equilibres refuse avec le motif ; `2>/dev/null;` passe ; document en ligne avec apostrophe dans le projet passe | les deux faux positifs du matin, rejoues |
| La doctrine dit ce que le code tient | `securite.md`, `git.md`, `.claude/README.md` | les fichiers charges a chaque session | relecture apres mesure : chaque phrase « couvert » a un cas vert au corpus, chaque phrase « non couvert » a un cas qui le montre | `redacteur-eve` |

## 7. Arbitrages proposes, avec l'alternative ecartee

| # | Question | Choix | Alternative ecartee |
| --- | --- | --- | --- |
| 1 | Reecrire ou rafistoler ? | reecrire l'analyse et le catalogue, garder les politiques et leurs signatures | « quatre lignes dans `_arguments_git` » : c'est la quatrieme fois qu'un correctif local laisse le trou dans l'analyseur d'a cote |
| 2 | Deux modules ou un ? | deux : analyser (syntaxe) et effets (semantique des programmes) | un seul : une famille de verbe ajoutee ne doit pas toucher le lexeur, et l'inverse ; deux seams parce que deux choses varient |
| 3 | Que faire d'une commande inanalysable ? | refuser en donnant le motif | repli `split()` : il a produit un faux refus ce matin et produirait un faux passage demain |
| 4 | Un document en ligne ? | son corps est du texte, retire de l'analyse, sauf s'il alimente un interpreteur | le laisser dans l'analyse : c'est le faux positif « chaque ligne du journal devient une sous-commande », ecrit dans `securite.md` |
| 5 | Un interpreteur qui lit un `.env` ? | autorise quand aucun indice d'ecriture n'est present dans le texte | tout refuser (choix 5 de `_decisions/0010`) : le catalogue sait desormais distinguer lire d'ecrire, et la lecture de `.env` est un droit ecrit dans `donnees.md` |
| 6 | `xargs rm` ? | les cibles sont les chemins cites en amont du tube ; sans chemin protege ni exterieur en amont, passe | refuser tout `xargs <verbe>` : `find . -name "*.pyc" \| xargs rm` est un usage courant du poste |
| 7 | `.git/` ? | ecriture refusee sous `.git/` (hooks, config) | laisser : un hook git s'execute a chaque commit, et rien aujourd'hui ne l'interdit a un agent |
| 8 | Qui ecrit le code du lot ? | le fil, parce que ces fichiers **sont** la barriere (`_decisions/0010`, arbitrage 9) | `developpeur-eve` : ce qu'un agent ecrit n'a pour trace que son rapport |
| 9 | Deux architectes ? | oui, contraintes « interface minimale, table declarative » contre « objets et registre de familles », choix motive dans `_decisions/0011` | un seul : niveau structurant, « design it twice » |

## 8. Risques

| Risque | Effet | Ce qu'on fait |
| --- | --- | --- |
| La reecriture perd un cas que l'ancien code tenait | un trou ferme se rouvre | les 98 tests en place restent, attendus inchanges ; le corpus contient tous les findings de la nuit ; la comparaison ancien contre nouveau sur les onze commandes de `garde_donnees` |
| Le refus de l'inanalysable gene le travail courant | des commandes legitimes refusees | les documents en ligne sont retires avant le test des guillemets ; cas verts au corpus pour les formes courantes du poste (heredoc avec apostrophe, `2>/dev/null`, `$(git rev-parse ...)`) |
| Le catalogue oublie un programme | un verbe qui ecrit passe | limite ecrite, comme aujourd'hui ; le verificateur fabrique ses entrees contre le contrat, pas contre le catalogue |
| Le hook ralentit | chaque appel d'outil attend | mesure : `analyser` sur le corpus entier en moins d'une seconde ; aucune E/S disque dans l'analyse |
| Cinq fichiers de la barriere changent en meme temps | une regression traverse | ordre : corpus rouge, `_commande` vert, `_effets` vert, un verrou a la fois, suite complete entre chaque, verification contradictoire a la fin |

## 9. Defaire

Les cinq fichiers (`_lib.py`, `garde_*.py`) sont copies dans `etat-depart/lot-3/` avant la premiere
ligne ; le retour est une copie inverse, puis `doctor --complet`. `_commande.py`, `_effets.py`,
`corpus_contrat.py`, `test_contrat.py` se suppriment ; aucun autre fichier ne les nomme sauf `doctor`
(si le lot y a branche la suite) et `README.md`.

## 10. Criteres de reussite

1. Le corpus est ecrit avant le code, sa liste de rouges du depart est au journal, et il est vert a la fin.
2. Les 98 tests en place passent, attendus inchanges (les tests de fonctions internes disparues sont
   reecrits, comptes au journal).
3. Une seule fonction rend les programmes lances ; une seule table dit ce qu'un programme ecrit ;
   `grep -c` de `ENVELOPPES` et de `VERBES_` dans `garde_*.py` rend zero.
4. Les quatre trous de `revue-lot-2b1.md` et les deux faux positifs du matin ont chacun un cas vert.
5. `doctor --complet` : 13 OK, 0 alerte, sept sondes OK.
6. La verification contradictoire (un `relecteur-eve` qui fabrique ses entrees contre le contrat) rend
   PASS, ou ses findings sont fermes en deux cycles au plus.
7. `securite.md`, `git.md`, `.claude/README.md` relus apres mesure : aucune phrase ne promet ce que le
   corpus ne prouve pas.

## 11. Non verifie a l'heure de cette revision

Le cout en temps d'un hook avec l'analyse complete (a mesurer sur le corpus). L'effet de `shlex` sur
les documents en ligne PowerShell (`@' ... '@`) : a sonder avant de decider s'ils sont traites comme
les heredocs bash. Le nombre exact de tests en place couples a une fonction interne qui disparait.


---

## Revision 2, 17/09/2026 : ce que l'attaque et les deux architectes ont change

Rapports bruts : `agents/2026-09-17-relecteur-eve-attaque-spec-lot-3-contrat.md` (12 findings, tous
verifies de ma main, tous integres sauf un requalifie), `agents/2026-09-17-architecte-eve-A-scanner-table.md`,
`agents/2026-09-17-architecte-eve-B-objets-registre.md`. Decision d'architecture : `_decisions/0011`.

### Ce qui change dans la conception (section 4)

- **Plus de `shlex`.** Mesure de ma main (`scratchpad/sonde_shlex2.py`) : le mode non POSIX leve
  `ValueError` sur `--format='%(x) %(y)'` et sur une here-string `@' '@` ; le mode POSIX leve sur un
  heredoc a apostrophe et rend un chemin Windows a antislashs nus en chemin **relatif donc dans le
  projet**. `_commande.py` porte un scanner caractere par caractere (etats : nu, apostrophe, guillemet,
  accent grave, `$(` avec profondeur, corps de document, here-string PowerShell) qui rend des tokens
  dequotes, des redirections (forme collee `2>/dev/null` comprise) et des separateurs. Aucun repli.
- **Trois fichiers, pas deux** : `_programmes.py` est un fichier de donnees pur (la table, zero fonction,
  un seul import pour `NamedTuple`), lu par `_commande` (enveloppes, shells, interpretes, `xargs`,
  `find`) et par `_effets` (familles d'ecriture et de lecture). Motif : le savoir sur les programmes en un
  seul endroit, sans cycle entre syntaxe et semantique (architecte A).
- **Trois modes d'acces** : `LIT`, `ECRIT`, `META`. `META` est la greffe de B : lister nominativement le
  fichier du token doit etre refuse quand lister le dossier des providers passe, donc les programmes de
  metadonnees rendent un acces type, pas rien. `DETRUIT` n'est pas distingue d'`ECRIT` (aucun cas ne le
  demande) ; `origine` porte le verbe pour le message.
- **`Invocation.amont`** remplace « alimentee par un tube plus texte amont » : `analyser` connait les
  tubes et `find -exec`, et livre a `acces` les cibles amont pretes (architecte A).
- **`cd` est suivi** : les chemins relatifs d'une invocation se resolvent contre le dernier `cd` de la
  meme ligne (changer de dossier vers l'exterieur puis supprimer un fichier relatif : REFUS). Finding
  HAUTE de l'attaque.
- **`find`** : cibles = point de depart **et** valeurs de `-name`, `-iname`, `-path` quand une action
  detruit (`-delete`, `-exec` sur un verbe qui ecrit). La r1 disait « le point de depart seul » et
  contredisait son propre cas de suppression par motif de nom. Finding CRITIQUE.
- **`git` cote effets** : `git rm` (sans `--cached`), `git mv`, `git clean` ecrivent leurs cibles ;
  `git -c core.hooksPath=X` et `git config core.hooksPath X` sont refuses par `garde_git` (execution de
  code, meme regle que `.git/`). Aujourd'hui `git` est traite comme une **enveloppe** par
  `garde_perimetre`, si bien que `git rm --cached <fichier protege>` est lu comme une suppression du
  fichier (sonde de ma main).
- **`-EncodedCommand`** : toute option prefixe de `-encodedcommand` a partir de `-e`, plus `-ec`.
- **Le corps d'un document en ligne est du texte, sauf s'il alimente un shell ou un interprete**
  (regle adoptee en toutes lettres, architecte B). Vaut pour les heredocs bash et les here-strings
  PowerShell.
- **Le mode PowerShell du scanner** : l'accent grave echappe (pas de substitution), `[T]::M(` et `).M(`
  donnent une invocation `::m` ou `.m` dont les arguments sont ceux du groupe (architecte A).

### Ce qui change dans le contrat (section 3 et corpus)

Le corpus passe de 262 a **315 cas** : variantes des interdits git (`+refspec`, `-n`, `push --no-verify`,
`checkout <fichier>` sans `--`, `restore --staged --worktree`, `branch --delete --force`, `config
--system`, `-c core.hooksPath`), verbes promis mais sans cas (`del`, `truncate`, `shred`, `awk -i`,
`Clear-Content`, `New-Item`, `git rm`, `git mv`), contournements du perimetre (`cd`, `..`, antislashs nus
et entre guillemets), `.git/info/exclude`, `settings.json` du profil (autorise) et `settings.local.json`
(refuse), donnees sur l'outil PowerShell (`Get-Content`, `Import-Csv`), `Archives Tania` avec espace,
`EVE_old`, `F:`, `.xls`, redirection entrante `<`, et huit cas PASSE du travail courant (`pip install -e`,
`uv pip install`, `ruff format`, `graphify update`, `tee` dans le projet, continuation de ligne,
`2>$null`, here-string dans le projet). Une limite est ecrite en cas PASSE annote : un chemin porte par
une variable de shell n'est pas resolu.

Un finding requalifie : `git config --global --get` citait « interdits sans exception » ; il cite desormais
le travail courant, et `git.md` gagnera la phrase « lecture possible avec `--get` ou `--list` » **apres
mesure** (critere 7). Deux attendus conserves contre l'avis du relecteur, avec leur motif ecrit dans le
cas : `git branch -d develop` reste REFUS (le verrou le tient depuis le 08/09 ; `git.md` recevra la phrase apres mesure) et
le listage nominatif du fichier du token reste REFUS (`donnees.md` : « jamais lu ni affiche »).

Photo apres revision : **315 cas, 264 verts, 51 rouges** sur le code actuel.
