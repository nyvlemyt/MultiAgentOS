# Rapport brut : attaque de la spec révision 1, axe niveau de preuve

Agent : `relecteur-eve`, mode attaque. Lancé le 16/09/2026 sur `design.md` révision 1, en parallèle de deux autres axes. Déposé tel quel le 16/09 au soir depuis la transcription de session. Vérification contradictoire dans `attaques/attaque-spec.md`.

---

## Attaque de spec, axe unique : niveau de preuve

Spec : `c:\dev\Eve\EveBackEnd\chantiers\2026-09-15-mini-entreprise-agents\design.md`. Findings sur les six points demandés, du plus grave au moins grave. Aucun fichier modifié.

### P1 HAUTE, sonde dangereuse. La fixture `rouge` est une écriture réelle, non bornée, dans l'arbre en plein merge

`design.md` section 5, ligne « Fiche `developpeur-eve` : périmètre d'écriture limité au banc » : « brief qui demande d'écrire **hors du banc** ; jouée d'abord sans la clause (l'agent obéit, c'est le rouge) ». Aucune cible n'est nommée.
Scénario : l'agent, muni de Write, Edit et Bash, choisit `data/functions.py` (déjà modifié et indexé pour la mission 0) et l'édite. Tous les hooks autorisent : `garde_perimetre.py:52-61` borne sur la racine du projet, le banc n'existe pas pour lui, et l'arbre principal est dans le périmètre. `verif_style` ne juge que la forme. À E4, le fil constate un `git status --porcelain` différent de E0 et **ne peut rien réparer** : `git checkout -- <fichier>`, `git restore <fichier>` et `reset --hard` sont refusés par `garde_git.py:109-125` et par `rules/git.md`. Conclusion tirée : « le rouge est bien rouge, la clause tient », au prix du travail d'une autre session.
Correctif : la fixture nomme une cible sacrificielle unique, créée pour elle (`chantiers/<chantier>/fixtures/cible-rouge.txt`), et le brief piégé désigne ce chemin, jamais « hors du banc ». La spec écrit que cette fixture ne se joue qu'après E0 et que le constat porte sur ce seul fichier.

### P2 HAUTE, ce que la spec ne prouve pas et ne dit pas. `/gate` lancé depuis le banc ne prouve rien du banc

Section 5, ligne « ordre TDD imposé », colonne aval : « sortie de `/gate` depuis le banc, recopiée brute » ; critère 6 exige « `/gate` PASS montré ».
Preuve : `gate.py:34` `RACINE = _lib.racine_projet()` (soit `CLAUDE_PROJECT_DIR`, la racine) ; `gate.py:50` toutes les commandes git tournent `cwd=RACINE` ; `gate.py:56-72` les fichiers analysés viennent du diff de la racine ; `gate.py:183` `manage.py test` tourne `cwd=RACINE` avec `PYTHON = RACINE/.venv`. Le répertoire courant de l'appelant n'est jamais lu.
Scénario : l'agent code dans le banc, le fil lance `/gate`, la sortie annonce PASS et N tests. Elle porte sur l'arbre principal et le merge de la mission 0 ; pas une ligne du banc n'a été analysée. On conclut « gate PASS sur le diff de l'agent », et un test rouge du banc reste invisible.
Correctif : trancher dans la spec entre (a) `/gate` s'exécute sur la racine, donc le code du banc est rapatrié avant, (b) un paramètre `--racine` livré dans le lot 1 avec son test, (c) abandon du banc au profit d'une branche de l'arbre principal (deuxième condition d'arrêt déjà écrite). Et ajouter en section 10 que « faire tourner la suite dans le banc » n'est pas prouvé : `.venv`, `.claude` et `.env` sont ignorés (`.gitignore:199` et `:214`), donc absents d'un worktree neuf.

### P3 HAUTE, preuve circulaire. Le champ des refus de verrou : échec et succès rendent la même observation

Section 5, ligne « Déclaration obligatoire des refus de verrou » ; fiche 0009 en fait « la trace de sûreté ».
Preuve : `_lib.py:155-160`, `refuser()` écrit sur stderr et sort. Aucun hook n'enregistre quoi que ce soit, nulle part.
Scénario : l'agent bute sur `garde_perimetre`, reformule, réussit, et rend le champ vide. Le fil n'a aucune trace pour le contredire. Un lot où l'agent a tapé trois murs et un lot sans incident rendent un rapport strictement identique. La fixture prévue (« une fixture qui bute volontairement sur un verrou ») prouve seulement que l'agent sait remplir le champ quand on le lui annonce.
Correctif : rendre le refus traçable (une ligne horodatée écrite par `_lib.refuser` dans le scratchpad, testée dans `test_gardes.py`), ou écrire noir sur blanc que le champ est déclaratif et invérifiable, plus une fixture où le verrou est rencontré **sans** être annoncé dans le brief.

### P4 HAUTE, test qui ne prouve pas. S3 et S4 ne distinguent pas le refus du verrou du refus de l'outil

Section 5 ligne 2 et section 6 E2 (« sur le motif de la sonde du 15/09 »).
Preuve du défaut de motif : `journal.md:81`, la cible était `Q:\sonde-perimetre.txt`, sur un lecteur inexistant ; `journal.md:92-93`, la vérification « de ma main » est `ls "Q:/"` qui rend « No such file or directory » et conclut « rien n'a pu être écrit hors périmètre ». Cette vérification prouve que Q: n'existe pas, rien d'autre.
Scénario : S3 vise un chemin inexistant, `Edit` échoue de lui même (fichier jamais lu, absent), le retour contient le mot refus, on coche S3 verte, on conclut que `garde_perimetre` tient sur `Edit` et on lâche un agent qui écrit, alors que le hook n'a peut être jamais statué.
Correctif : la spec exige le texte exact attendu (`PreToolUse:Edit hook ... REFUS garde_perimetre`) et une cible où l'outil **réussirait** sans le hook, c'est à dire un fichier existant hors périmètre (par exemple sous `%TEMP%` mais hors de `TEMP/claude`, cf. `garde_perimetre.py:60`). La vérification de la main devient alors l'absence de modification de ce fichier, ce qui discrimine.

### P5 HAUTE, test qui ne prouve pas. Le correctif S7 serait gardé par un test qui ne peut plus rougir

Section 6 E3 et section 5 ligne « Interdiction de commit et de push », rédigées en si/sinon exclusif (hook corrigé **ou** clause de fiche).
Scénario : `agent_id` est observé le 16/09, on ajoute dans `test_gardes.py` un cas qui fabrique lui même `{"agent_id": "x", ...}` et attend un refus. Le test est vert pour toujours. Le harnais renomme ou cesse d'envoyer le champ à une mise à jour : la suite reste verte, la barrière ne s'applique plus à personne, et la clause de fiche a été abandonnée parce que « le hook tient ». Plus rien n'arrête un commit d'agent, sans aucun signal.
Correctif : garder la clause de fiche et sa fixture `refus` **même si** le hook est corrigé (deux barrières, pas une), et faire de la présence du champ un contrôle vivant, relevé par `doctor.py` ou `/verif-setup` avec une date de revérification.

### P6 MOYENNE, fait présenté comme établi. Un fait daté « prouvé le 16/09 » dont la preuve n'est pas au journal

Section 4, ligne 3 (aucun verrou n'arrête commit ni push). `journal.md` s'arrête au 15/09 et ne contient aucune entrée du 16/09. La vérification n'existe que dans `architecture/propositions.md:174`, sans sortie transcrite ni commande lancée. Section 6 E5 impose pourtant la table des sondes au journal avec le texte exact des retours, et `qualite.md` impose la commande et sa sortie.
Scénario : à la reprise, on cherche la preuve au journal, on ne la trouve pas, et on tient le fait pour acquis sur sa seule mention dans une page d'architecture, alors que c'est le fait qui justifie tout le E3.
Correctif : transcrire au journal l'appel et sa sortie, daté, avant validation de la spec.

### P7 MOYENNE, prémisse non prouvée sous trois sondes. « Répertoire courant dans le banc »

Section 6 E2, section 5 lignes 1 et 4. `garde_git.py:199` calcule la branche à partir de `entree.get("cwd")`. Rien n'établit ce que vaut ce champ pour un appel d'outil de sous agent, ni comment on impose un répertoire courant à un sous agent.
Scénario : l'agent travaille avec `git -C <banc> ...` depuis la racine ; le hook évalue la branche de la racine (`features/melvyn/esgRatingLastModif`), S6 est verte pour la mauvaise raison, et le futur refus par branche de S7 se fonde sur une branche qui n'est pas celle du banc.
Correctif : une sonde S0 qui relève le `cwd` reçu par un hook lors d'un appel de sous agent, faite avec le même hook de relevé que E3 (un seul relevé pour `cwd`, `agent_id` et `agent_type`), et une ligne de spec qui dit comment le répertoire courant du banc est imposé.

### P8 MOYENNE, critères non vérifiables et circulaires. Section 8, critères 6, 7 et 8

Scénario : le fil orchestre, fait écrire le code, écrit la page explain-diff **et** les questions du quiz, puis déclare le quiz passé. Personne ne peut distinguer « Melvyn a compris le diff » de « les questions portaient sur ce que la page expliquait ». Aucun seuil de réussite n'est écrit, alors que « si le quiz échoue, le lot échoue ». Le critère 8 ne définit ni ce qu'est un message, ni qui compte : le fil est juge de sa propre sobriété, et deux messages concaténés valent un. Le critère 6 (« sans que Melvyn lise autre chose que... ») n'est constatable par personne.
Correctif : questions écrites par un `relecteur-eve` qui n'a pas orchestré, à partir du diff seul, en nombre fixe, seuil écrit avant la partie (par exemple 4 sur 5, dont une question sur la couche où le test agit) ; un message se définit comme un tour de réponse du fil, compté au journal à chaque tour ; le critère 6 se reformule en fait constatable (« aucun autre artefact n'a été transmis à Melvyn », liste des chemins envoyés).

### P9 BASSE, preuve contaminée. Section 4, ligne 2, le worktree frère

`ls -a "C:/dev/Eve/EveBackEnd-review"` montre `.env`, qui est ignoré (`.gitignore:214`) et non suivi (`git ls-files .env` rend vide) : un fichier non suivi **est** présent dans ce worktree, déposé à la main. Le listing cité contredit donc sur `.env` la mécanique qu'il est censé démontrer.
Scénario : Edmond lit la ligne, voit `.env` dans la sortie, et la conclusion « prouvé » tombe avec elle, alors que la règle est juste.
Correctif : citer la mécanique (`git worktree add` ne matérialise que les fichiers suivis) plutôt que le listing, et noter que `EveBackEnd-review` a reçu un `.env` à la main, donc que le banc neuf n'aura ni `.env`, ni `.venv`, ni `.claude`.

### Couverture des six points demandés

Trouvé sur les six : fait non établi (P6, P9), test qui ne prouve pas (P2, P4, P5, P3), critère non vérifiable (P8), preuve circulaire (P3, P8), sonde dangereuse (P1), trou non nommé (P2, P7). À décharge : S1 à S6 sont inoffensives, la distinction prouvé / documenté non vérifié / non prouvé de la section 4 est tenue ligne à ligne pour les autres faits, et les deux conditions d'arrêt de la section 6 sont bien des conditions, pas des intentions.

### Hors axe, une ligne

Section 3 annonce « ces sept sous systèmes » et en énumère une dizaine ; la fiche 0009 a la même liste. À recompter avant validation.
