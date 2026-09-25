# Rapport brut : attaque de la spec révision 1, axe chaîne du changement et périmètre

Agent : `relecteur-eve`, mode attaque. Lancé le 16/09/2026 sur `design.md` révision 1, en parallèle de deux autres axes. Déposé tel quel le 16/09 au soir depuis la transcription de session. Vérification contradictoire dans `attaques/attaque-spec.md`.

---

## Attaque de spec, axe unique : chaîne du changement et périmètre

Objet : `chantiers/2026-09-15-mini-entreprise-agents/design.md`. Aucun fichier modifié. Rapport plus long que les 400 mots de ma fiche : le format demandé (scénario plus correctif par finding) l'impose.

**Fichiers ouverts** : `design.md`, `journal.md`, `_decisions/0009`, `chantiers/PLAN.md`, `chantiers/INDEX.md`, `.claude/hooks/{gate.py, verif_style.py, garde_perimetre.py, garde_git.py, doctor.py, _lib.py}`, `.claude/settings.json`, `.claude/README.md`, `.claude/commands/{gate.md, revue.md, chantier.md, verif-setup.md}`, `.claude/agents/relecteur-eve.md`, `.claude/skills/REGISTRE.md`, `.gitignore`, `.git/info/exclude`, `.graphifyignore`.

### A1 HAUTE. `/gate` et `/revue` lancés "depuis le banc" mesurent l'arbre de la mission 0

**Où** : design.md §5 ligne 51 ("sortie de `/gate` depuis le banc, recopiée brute"), ligne 56, §8 critère 6.
**Preuve** : `gate.py:34` `RACINE = _lib.racine_projet()` (donc `CLAUDE_PROJECT_DIR`, la racine) ; `gate.py:50` `cwd=str(cwd or RACINE)` ; `gate.py:183` tests lancés `cwd=str(RACINE)`. `gate.md:11` appelle un chemin relatif, sans option de dépôt. `revue.md` §1.1 : `git diff <base>` dans le cwd de session.
**Scénario** : l'agent écrit dans le banc, le fil lance `/gate`. Gate calcule `git diff develop...HEAD` sur la RACINE, c'est à dire `features/melvyn/esgRatingLastModif` avec le merge ouvert : il lint les fichiers de la mission 0, lance `manage.py test` sur l'arbre de la mission 0, et rend un PASS que la spec recopie comme preuve du banc. La revue adverse relit le même diff. Le critère 6 est atteint sans que rien du banc ait été vérifié.
**Correctif** : nommer `gate.py` dans les fichiers du dispositif à changer, lui ajouter une option de racine (`--depot <chemin>`), et ajouter une sonde S8 : `/gate` depuis le banc, vérifier que la ligne `info base : ... fichiers .py touches` cite un fichier du banc. Sinon, basculer d'office sur la condition d'arrêt de la ligne 69 (branche de l'arbre principal).

### A2 HAUTE. Le banc n'aura ni `.env`, ni `ruff.toml`, ni `pyrightconfig.json` : la table des faits ne cite que `.claude/` et `.venv/`

**Où** : design.md §4 ligne 31.
**Preuve** : `.gitignore` contient `.env` et `.venv` ; `.git/info/exclude` contient `ruff.toml`, `pyrightconfig.json`, `.coverage`. Donc `git worktree add` n'emporte aucun des cinq. Le `.env` vu dans `EveBackEnd-review` (journal ligne 138) y a été mis à la main, ce n'est pas le worktree qui l'a apporté.
**Scénario** : l'agent lance `python manage.py test` depuis le banc (autorisé par `settings.json:76`). Sans `.venv`, c'est le python du PATH, sans Django. S'il contourne avec `../../.venv/Scripts/python.exe`, il tourne sans `.env`, donc sans `SECRET_KEY` et sur le repli silencieux vers sqlite de `eve_back/settings.py:81-88`, précisément le défaut candidat 3 de la §7. Aucune sonde ne le voit.
**Correctif** : une étape E1bis qui liste ce que le banc n'a pas et dit qui le fournit (copie de `.env`, `ruff.toml`, `pyrightconfig.json`), et correction de la ligne 31.

### A3 HAUTE. Rien de mécanique ne retient l'agent dans le banc, et l'arbre non commité de la mission 0 n'est pas restaurable

**Où** : design.md §5 ligne 50 ("la fiche, invisible aux hooks"), §6 E0 et E4, §9 ligne 104.
**Preuve** : `garde_perimetre.py:109-118` et `_lib.normaliser` résolvent les chemins relatifs contre `CLAUDE_PROJECT_DIR`, pas contre le cwd de l'appel ; la racine et le banc sont tous deux dans le périmètre, donc aucun refus n'est possible dans un sens ni dans l'autre. `garde_git.py:118-124` interdit `git checkout <fichier>` et `git restore` sur l'arbre de travail.
**Scénario** : l'agent édite `c:/dev/Eve/EveBackEnd/data/schemas/issuer_data.py` au lieu du même chemin sous le banc. Le hook autorise. Ce fichier est un conflit résolu de la mission 0, non commité. E4 constate l'écart après coup, et il n'existe aucun retour en arrière : git l'interdit, et E0 n'a sauvegardé que `git status --porcelain`, une liste de noms.
**Correctif** : exiger que la mission 0 soit commitée (PLAN 0.4ter) avant E1, ou une copie de l'arbre dans le scratchpad ; E0 sauvegarde `git diff` et `git diff --cached` complets, pas seulement `--porcelain` ; la fiche impose des chemins absolus préfixés par le chemin du banc ; le fil vérifie `git status --porcelain` de la racine après chaque appel d'agent, pas seulement en fin de jalon.

### A4 HAUTE. `develop` local a deux commits de retard : le banc naîtrait sans `0025` ni `0026` et referait un doublon de migration

**Où** : design.md §6 E1 ligne 63 (`git worktree add ... develop`).
**Preuve** : `git log --oneline develop..origin/develop` rend `6cf61db` et `76acce9` ; `git ls-tree develop data/migrations/` s'arrête à `0024`, `origin/develop` va jusqu'à `0026`.
**Scénario** : le banc part d'un `develop` sans la rename Sustainalytics ni les corrections de type d'Edmond. Le chantier `snp_issuer_data` y lance `makemigrations` et produit un `0025_...`, troisième `0025` du dépôt, exactement le défaut que la mission 0 vient de corriger en renumérotant en `0027`. Le diff du banc devient irréconciliable avec la mission 0.
**Correctif** : E1 dit `origin/develop` après `git fetch`, la spec constate le retard de `develop` local, et nomme le numéro de migration attendu dans le banc.

### A5 HAUTE. `verif_style` perd sa logique delta dans le banc, et S5 est construite pour ne pas le voir

**Où** : design.md §5 ligne 47 (sonde S5).
**Preuve** : `verif_style.py:253-265` calcule `chemin.relative_to(racine)` puis `git cat-file --filters HEAD:<relatif>` avec `cwd=racine`. Pour un fichier du banc, le relatif est `chantiers/.../banc/data/...`, absent de HEAD, donc `contenu_base=None` ; `verif_style.py:184` et `:222` rendent alors tout défaut bloquant. Mesuré : `python .claude/hooks/verif_style.py data/schemas/issuer_data.py` rend aujourd'hui 3 défauts "preexistant dans HEAD, non bloquant" (espaces finaux lignes 119 à 5977, un substitut, dix marqueurs de travail).
**Scénario** : le premier `Edit` de l'agent sur ce fichier dans le banc déclenche un refus PostToolUse listant trois défauts qu'il n'a pas causés ; il les "corrige" et produit un diff massif, contre la règle du plus petit diff. S5 telle qu'écrite (un cadratin dans un fichier neuf du banc) passe au vert et ne voit rien : un fichier neuf n'a pas de base non plus.
**Correctif** : S5 porte sur un fichier suivi du dépôt dans le banc et vérifie qu'un défaut préexistant reste non bloquant ; `verif_style.py` entre dans la liste des fichiers du dispositif à changer.

### A6 MOYENNE. Quatre fichiers du dispositif changent et ne sont nommés nulle part

**Où** : design.md §2 et §5 (aucune ligne pour eux), §8 critères.
**Preuve** : `CLAUDE.md` section "Skills et agents" liste les quatre fiches et écrit "Le code s'écrit dans le fil principal" ; `.claude/README.md:23` liste les quatre agents et dit "lecture seule" ; `chantier.md` §1.2 impose une ligne dans `chantiers/INDEX.md`, qui porte encore "structurant (proposé)" et "En cadrage" ; `communication.md` impose `chantiers/PLAN.md` à chaque jalon.
**Scénario** : le lot livre `developpeur-eve` ; à la session suivante, `CLAUDE.md` et le manuel disent toujours que les agents sont en lecture seule et que le code s'écrit dans le fil. Pire pour `PLAN.md` : les deux sessions y écrivent, la dernière écrase la première.
**Correctif** : ces quatre fichiers entrent en §2 et dans la table §5, avec la ligne exacte qui change ; pour `PLAN.md`, dire qui écrit quoi et quand (la règle de partage existe déjà, `PLAN.md:98`, mais la spec ne la cite pas).

### A7 MOYENNE. `/verif-setup` est donné comme test aval de la ligne REGISTRE alors qu'il ne lit ni le registre ni les agents

**Où** : design.md §5 ligne 55, colonne "tests aval".
**Preuve** : `verif-setup.md:8-12` et `doctor.py` `verifications()` contrôlent settings, scripts de verrous, venv, ruff, coverage, npx, graphify, exclusions, base `.env`, branche, mémoire. Rien sur `.claude/agents/` ni sur `REGISTRE.md`.
**Scénario** : la fiche `developpeur-eve.md` est supprimée ou mal renommée ; `/verif-setup` rend zéro alerte et le lot se croit intact.
**Correctif** : soit ajouter à `doctor.py` un contrôle des fiches attendues dans `.claude/agents/` et le nommer comme livrable, soit retirer `/verif-setup` de cette case et écrire "relecture à la main".

### A8 MOYENNE. Le hook de relevé de E3 modifie `settings.json`, partagé avec la session mission 0, sans procédure de retour

**Où** : design.md §6 E3 ligne 65 ("un hook de relevé, ajouté puis retiré").
**Preuve** : il n'y a qu'un `settings.json` sur le poste (pas de `settings.local.json`) ; `.claude/README.md:34` : les hooks se rechargent quand `settings.json` change ; `doctor.py:77-78` : un `settings.json` illisible vaut "aucun verrou actif".
**Scénario** : le relevé est ajouté pendant que la session mission 0 travaille ; ses appels d'outils sont dumpés en JSON dans le scratchpad (entrées d'outils, chemins, contenus). Si la session T s'arrête avant le retrait, ou si le retrait laisse une virgule de trop, les deux sessions perdent tous leurs verrous sans le savoir.
**Correctif** : E3 sauvegarde une copie de `settings.json` dans le scratchpad, compare octet à octet après retrait, relance `doctor --complet` juste après, et ne se fait qu'avec l'accord de Melvyn, l'autre session à l'arrêt.

### A9 MOYENNE. Les fixtures n'ont ni emplacement, ni propriétaire, ni moment de rejeu

**Où** : design.md §5 lignes 50 à 53, §8 critère 2 ("jouées et transcrites") ; 0009 ligne 37 ("rejouables mécaniquement").
**Preuve** : le dossier du chantier contient `architecture/`, `dashboard.html`, `design.md`, `journal.md`. Aucun dossier de fixtures. `REGISTRE.md` n'en parle pas, `/verif-setup` ne les rejoue pas.
**Scénario** : la fiche est modifiée dans trois semaines ; personne ne sait où sont les fixtures ni comment les rejouer, et la greffe de B est morte à la première évolution.
**Correctif** : nommer le chemin (`chantiers/2026-09-15-mini-entreprise-agents/fixtures/<nom>.md` : brief exact, attendu, transcription, date), dire que le fil les rejoue, et quand (à chaque modification de la fiche, et avant tout lot suivant).

### A10 MOYENNE. Aucun chemin du retour : la branche du banc ne peut pas être supprimée par l'assistant

**Où** : design.md §6 ligne 69 : les conditions d'arrêt disent quand s'arrêter, jamais comment défaire.
**Preuve** : `garde_git.py:112-113` refuse `git branch -D` sans exception ; `git branch -d features/melvyn/banc-x` sur une branche non fusionnée est refusé par git lui même.
**Scénario** : S3 passe, le lot s'arrête. Restent sur le disque : le worktree `chantiers/.../banc/`, l'entrée `.git/worktrees/banc-<slug>/`, la branche `features/melvyn/banc-<slug>` que l'assistant ne peut pas supprimer, plus éventuellement le hook de relevé et un `garde_git.py` à demi modifié.
**Correctif** : une section "défaire" : `git worktree remove <chemin>` puis `git worktree prune` (non couverts par `garde_git`, donc autorisés), suppression de branche laissée à la main de Melvyn et dite comme telle, restauration de `settings.json` depuis la copie du scratchpad, `doctor --complet` en contrôle final.

### A11 BASSE. Tant qu'on y est : le banc est un chantier structurant avec migration, alors que 0009 le borne à "un petit chantier"

**Où** : design.md §7 ligne 77 ("chantier structurant court"), journal ligne 120 ("migration sur une table réelle"), 0009 ligne 14.
**Scénario** : le premier code jamais écrit par un agent porte une migration destinée à `EveDev`, pendant que la mission 0 se bat encore sur une migration. Deux risques au lieu d'un, exactement le motif avec lequel la §7 ligne 79 écarte le candidat 3.
**Correctif** : borner le banc au schéma, au modèle et aux tests, et sortir la migration du lot 1 ; ou l'assumer en écrivant "cette migration ne part jamais sur EveDev dans ce lot".

### A12 BASSE. Le worktree duplique tout le dépôt sous `chantiers/`, et les deux sessions ne le savent pas

**Preuve** : `.graphifyignore` exclut déjà `chantiers/`, donc graphify est couvert ; `Grep`, `Glob` et `ruff check .` ne le sont pas.
**Scénario** : la session mission 0 cherche `iss_esg_rating_last_modification`, obtient deux occurrences dont une dans le banc, et édite la mauvaise.
**Correctif** : une ligne dans la spec et dans `PLAN.md` annonçant le chemin du banc aux deux sessions, avec le rappel d'exclure `chantiers/` de toute recherche.

### Point sur lequel je ne trouve rien

**Point 3, périmètre d'écriture dépassé** : rien. Tout ce que la spec prévoit d'écrire (`.claude/`, `chantiers/`, le banc sous la racine, le scratchpad) est couvert par `garde_perimetre._racines_autorisees_par_defaut` (`garde_perimetre.py:52-61`). Aucune permission nouvelle n'est à demander à Melvyn. Le vrai problème est l'inverse, et c'est A3 : le verrou ne sait pas distinguer la racine du banc.

Les cinq autres points portent tous au moins un finding : chaîne oubliée (A1, A2, A5, A6, A7), collision mission 0 (A3, A4, A8, A12), tant qu'on y est (A11), livrable sans emplacement (A9), chemin du retour (A10).

### Hors axe

Le critère 4 demande "une ligne au `REGISTRE.md` avec identité, coûts et date de ré-audit", mais la section Agents du registre (`REGISTRE.md:44-46`) est un paragraphe sans colonnes : soit la spec dit de la convertir en table, soit elle ajuste son critère.
