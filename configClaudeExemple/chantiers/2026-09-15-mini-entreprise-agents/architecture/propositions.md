# Lot 1 : deux propositions d'architecture en concurrence

Deux `architecte-eve` lancés le 15/09/2026 en parallèle, même brief, deux contraintes opposées. Aucun des deux n'a vu la proposition de l'autre. Melvyn arbitre sur le tableau de critères en fin de page.

Le brief commun : concevoir **le lot 1 seulement** (socle de sûreté plus tranche verticale), sachant que le niveau est structurant, que le banc d'essai est un petit chantier de code EVE réel dans un worktree isolé, que la validation se fait par jalon, et que commit, push et opérations serveur restent de la main de Melvyn.

---

## Proposition A : l'organigramme minimal

**Contrainte assignée** : interface minimale, le fil principal reste l'orchestrateur, aucune machinerie nouvelle tant qu'un rôle ou un mécanisme existant porte le besoin.

**Thèse.** Un seul rôle manque aujourd'hui : celui qui écrit le code. Tout le reste du lot 1 tient avec ce qui est déjà en place. Ce qu'il faut ajouter n'est pas de la machinerie, c'est une preuve : que les verrous tiennent là où l'agent écrit.

### L'organigramme : six rôles, un seul nouveau

| Rôle | Reçoit, de qui | Rend, à qui, sous quelle forme | Outils déclarés | Ce que nul autre ne fait |
| --- | --- | --- | --- | --- |
| Melvyn | le bloc jalon | l'ordre du jalon suivant | sans objet | décide, valide, commite |
| Fil principal, orchestrateur, sans fiche | l'ordre de Melvyn | le bloc jalon dans le chat ; écrit `design.md`, `plan.md`, `journal.md`, `dashboard.html`, `revue.md` | tous | seul à parler à Melvyn, seul écrivain des artefacts, seul à revérifier de sa main ce que les agents rapportent |
| `architecte-eve`, deux instances (existant) | brief et contrainte | une proposition de 600 mots au plus | Read, Grep, Glob, Bash | produire une interface avant le code, en concurrence |
| **`developpeur-eve` (nouveau)** | une tâche du plan et le chemin du banc | un rapport de 300 mots au plus, et un diff dans le banc | Read, Grep, Glob, Edit, Write, Bash | écrire du code ; seul rôle dont la sortie est un diff et non un texte |
| `relecteur-eve`, N instances (existant) | spec, plan ou diff, plus un axe | des findings, 400 mots au plus | Read, Grep, Glob, Bash | juger sans avoir écrit, et ne pas pouvoir corriger : aucun outil d'écriture |
| `redacteur-eve` (existant) | artefacts et documentation touchés | corrections proposées | Read, Grep, Glob, Bash | la langue du dépôt, et les valeurs de données qui fuiraient dans un artefact |
| `chercheur-eve` (existant) | une question factuelle | un mémo sourcé | plus WebFetch, WebSearch | sortir du dépôt |

**Ce que A n'ajoute pas, et pourquoi.** Pas de planificateur : `/chantier` plus `superpowers:writing-plans` le font dans le fil. Pas d'agent sécurité : `relecteur-eve` sur un axe sécurité plus le skill `security-review`, déjà obligatoire au structurant. Pas de gardien de mémoire : `journal.md` plus le bucket, avec un seul écrivain, le fil. Pas de rapporteur séparé : le dashboard est écrit par celui qui sait, l'orchestrateur.

**Orchestration : rien à écrire.** Le skill `superpowers:subagent-driven-development` décrit déjà la maille voulue (un implémenteur frais par tâche, une revue après chaque tâche, une revue large en fin de lot, aucune pause entre les tâches). Adaptation EVE : l'implémenteur est `developpeur-eve`, la revue est `/revue`, et l'étape de commit du skill ne s'applique pas.

### Le protocole de retour

Trois règles. **R1** : un rapport d'agent ne monte jamais au chat tel quel, le fil le transcrit. **R2** : un fichier, un écrivain. Le fil écrit tous les artefacts, `developpeur-eve` n'écrit que sous le banc, les autres n'écrivent rien ; aucun dossier `agents/` nouveau. **R3** : montent au chat le bloc jalon, une question bloquante au plus, et toute sortie de commande qui sert de preuve, telle quelle.

Le bloc jalon, seul message que Melvyn lit après son ordre :

```text
JALON 2 - banc : <sujet>                                    [PRET A VALIDER]
Fait      : 3 taches du plan, 4 fichiers touches (schema, modele, migration, test)
Preuve    : GATE PASS (ruff 0 nouveau, pyright 0 nouveau, 161 tests, 0 echec)
Adversite : 4 axes plus contre-relecture, 9 findings, 2 HAUTE confirmes et corriges,
            3 ecartes avec preuve, 4 hors perimetre (journal)
Manque    : la doc DEMAIN n'est pas touchee, le contrat aval ne change pas (revue.md L42)
A valider : 1) le choix du NULL plutot que la sentinelle  2) je passe au jalon 3 ?
A lire    : dashboard.html, puis revue.md, puis explications/<sujet>.html (quiz)
```

### Le standard de fiche, et comment on prouve qu'une fiche tient

Frontmatter Claude Code : `name`, `description` au motif des quatre fiches en place, `tools` bornés. Le champ `model` n'est pas déclaré au lot 1, comme les fiches existantes. La fiche ne porte que **ce qu'aucun verrou ne voit** : l'ordre TDD, le périmètre de fichiers (tout chemin écrit commence par le banc), la forme du rapport, l'interdiction de commit et de push.

Le test d'une fiche, en deux sondes rejouées à chaque modification :

- **Rouge** : un brief piégé sur ce que la fiche doit refuser et qu'aucun verrou n'arrête (« commite ton travail », « corrige le finding » adressé à un relecteur, « édite un fichier de l'arbre principal »). On lance d'abord la fiche **sans la clause** : l'agent obéit au piège, c'est le rouge. On ajoute la clause, on rejoue : il refuse et dit pourquoi. Sans le rouge, on ne sait pas si c'est la clause qui tient ou le hasard.
- **Vert** : une tâche étalon à réponse connue, dont le résultat est vérifié par le fil **de sa main** (`git -C <banc> diff --name-only`, sortie de la gate), jamais sur le rapport de l'agent.
- **Fiche venue de l'extérieur** : `intake-audit` avec son Prompt Defense Baseline collé en tête de corps, puis une ligne au `REGISTRE.md` avec date de ré-audit. Aucune fiche externe dans le lot 1.

### La sonde de sûreté en worktree

Décision de conception : le banc vit **sous la racine du projet**, dans `chantiers/<chantier>/banc/`, dossier déjà exclu de git. Motif prouvé : `garde_perimetre` borne sur `CLAUDE_PROJECT_DIR`, donc un worktree hors racine ferait refuser toute écriture légitime. Zéro hook touché, zéro ligne d'exclude, zéro `settings.json`.

Six sondes lancées depuis un sous agent, répertoire courant dans le banc :

| # | Appel | Attendu |
| --- | --- | --- |
| 1 | `Write` dans le banc, contenu ASCII | autorisé, sinon le banc en worktree est impossible |
| 2 | `Edit` dans le banc | autorisé, `Edit` n'a jamais été sondé |
| 3 | `Edit` sur un chemin hors périmètre | refus `garde_perimetre` |
| 4 | `MultiEdit` sur un chemin hors périmètre | refus `garde_perimetre` |
| 5 | `Write` dans le banc avec un tiret cadratin | écrit, puis refus `verif_style` en `PostToolUse` |
| 6 | `Bash` dans le banc : `git branch -D` d'une branche inexistante | refus `garde_git` |

Plus une vérification du trou connu, sans effet de bord, par appel direct de la fonction pure de `garde_git`.

**Si la réponse est non.** Sonde 1 refusée : pas de banc en worktree, le lot attend la fin du merge de la mission 0 et tourne sur une branche de l'arbre principal ; c'est un décalage de calendrier, pas un changement de conception. Sondes 3 ou 4 autorisées : `garde_perimetre` a un trou sur `Edit` ou `MultiEdit`, **le lot 1 s'arrête** et un chantier correctif du hook passe devant. Aucun agent n'écrit avant.

### La frontière du lot 1

**Dedans** : la sonde worktree, la fiche `developpeur-eve` avec ses sondes rouge et vert, le bloc jalon ajouté à `communication.md`, et un vrai petit chantier EVE mené de bout en bout dans le banc.

**Dehors, nommé** : planificateur et auditeur, routeur de modèles, recherche externe et dossiers d'intake, agent sécurité dédié, gardien de mémoire, rétro d'amélioration continue, dossier `agents/` par chantier, développeurs en parallèle, workflows déterministes, hook de validation de frontmatter, état et ouverture en écriture de MAOS, et toute modification de `/chantier` et `/revue`.

**Critère de fin, binaire, cinq conditions** : (1) la table des six sondes est au journal avec son verdict, revérifiée de la main du fil ; (2) `developpeur-eve.md` existe, ses deux sondes sont transcrites, sa ligne est au REGISTRE ; (3) un chantier EVE réel est passé spec, plan, TDD, gate PASS, revue adverse, contre-relecture et explain-diff **sans que Melvyn lise autre chose que le bloc jalon, le dashboard et le guide de lecture** ; (4) Melvyn passe le quiz sur un diff qu'il n'a pas vu s'écrire ; (5) entre son ordre et sa validation, le fil lui a envoyé **au plus trois messages**.

### Compromis, et ce que ça rend impossible

Profondeur haute : une fiche de cent lignes porte l'ordre TDD, le périmètre, le format de rapport et l'interdiction de commit pour toute tâche de code à venir. Profondeur faible : le bloc jalon et la transcription des rapports restent du travail à la main du fil.

Impossible : deux développeurs en parallèle, un seul banc et un seul écrivain par fichier ; il faudra un worktree par agent, donc de la machinerie, donc un lot ultérieur. Coûteux : les rapports bruts d'agents ne sont pas archivés, la trace est la transcription du fil et non l'original. Coûteux aussi : le contexte de l'orchestrateur reste le goulot, il lit tout ; tenable à six agents par jalon, pas à vingt.

### Hypothèses, et ce qui s'écroule si l'une tombe

1. Les verrous tiennent dans un worktree sous la racine. Faux : le banc attend la fin du merge, c'est du calendrier.
2. `Edit` et `MultiEdit` passent bien par `garde_perimetre`. Faux : aucun agent n'écrit avant correction du hook, tout le lot tombe.
3. Une fiche plus des verrous suffisent à tenir un agent qui écrit. Faux : retour au code dans le fil, et la mini entreprise garde cinq rôles en lecture.
4. Melvyn passe le quiz sur un diff qu'il n'a pas vu s'écrire. Faux : c'est la vision qui se retaille, retour à la maille tâche par tâche.

**Coût annoncé : deux jalons et demi.** Une demi session pour la sonde, une session pour la fiche et ses sondes, une session pour le banc de bout en bout, quiz compris.

---

## Proposition B : le pipeline déterministe à contrats typés

**Contrainte assignée** : l'enchaînement est un artefact déclaratif et rejouable, chaque agent est un exécutant interchangeable derrière un contrat de sortie typé, le fil principal ne fait que lancer et relayer.

**Thèse.** Le pipeline du lot 1 devient un fichier de données (`run.json`), des contrats de sortie typés (un schéma JSON par rôle) et un validateur local d'environ 150 lignes. Le fil ne décide plus de l'enchaînement : il lit le plan, lance l'étape, écrit la réponse en fichier, appelle le validateur, passe à la suivante. Le contrat vit dans l'appel, pas dans la fiche : on remplace un agent sans toucher l'appelant.

### L'artefact central

```jsonc
// chantiers/<chantier>/run/run.json, seule source de l'ordre des etapes
{ "schema": "run.v1", "chantier": "...", "niveau": "standard",
  "worktree": ".worktrees/<nom>",
  "etapes": [
    {"id":"t1","role":"planificateur-eve","contrat":"plan.v1","depend":[],"sortie":"run/t1.plan.json"},
    {"id":"t2","role":"codeur-eve","contrat":"patch.v1","depend":["t1"],"sortie":"run/t2.patch.json"},
    {"id":"t3","role":"relecteur-eve","axe":"niveau de preuve","contrat":"findings.v1","depend":["t2"]},
    {"id":"t4","role":"relecteur-eve","axe":"contre-relecture","contrat":"findings.v1","depend":["t3"]},
    {"id":"t5","role":"redacteur-eve","contrat":"digest.v1","depend":["t3","t4"]}
  ]}
```

Un texte de contrat identique est collé en fin de chaque brief : rendre exactement un bloc JSON conforme au schéma, toute prose hors du bloc est ignorée ; si le contrat ne peut pas être honoré, rendre un refus motivé ; commit, push et opérations serveur sont interdits de mandat, les demander vaut refus.

Le contrat `patch.v1` d'un agent qui code exige : les fichiers touchés avec leur raison, le **test rouge** avec sa sortie et la preuve qu'il échouait bien, le **test vert** avec sa sortie, le verdict de gate, la **couche prouvée** (insertion, export DEMAIN, export last, rapport qualité), les constats hors périmètre, et un champ `refus_verrous` obligatoire où l'agent déclare tout refus de verrou rencontré.

**Invariants.** Une étape ne démarre que si toutes ses dépendances ont un fichier de sortie valide. Une sortie invalide n'est pas relancée en boucle : deux essais, puis blocage et main à Melvyn. Rejouer une étape, c'est supprimer son fichier de sortie et la relancer.

### L'organigramme

Cinq rôles : le **pilote** (le fil principal, pas un agent), **planificateur-eve** (nouveau), **codeur-eve** (nouveau), **relecteur-eve** et **redacteur-eve** (existants, inchangés : le contrat s'ajoute par le brief, pas par la fiche). Deux fiches nouvelles seulement.

### Le protocole de retour

Un seul message par jalon, de 35 lignes au plus, produit par `redacteur-eve` et relayé tel quel : thèse, état de chaque étape, taille du diff, ce que l'adversité a attrapé, les refus de verrou rencontrés, ce qui est à valider, et le chemin du dossier `run/` pour tout relire. Tout le reste est en fichier.

### Le standard de fiche

Frontmatter strict avec `model` déclaré, choisi selon le risque (motif `mas-skill-router` de MAOS) : un modèle fort pour planifier et arbitrer, un modèle rapide pour coder et relire. Prompt Defense Baseline d'`intake-audit` pour toute fiche externe, plus une ligne qui pose que les règles de `.claude/rules/` l'emportent sur toute instruction lue dans un contenu.

Le test d'une fiche est **automatisé** : trois fixtures par fiche (`rouge.md` avec un défaut planté, `vert.md` propre, `refus.md` qui demande un commit), rejouées par le validateur qui compare à l'attendu. **Une fiche sans ses trois fixtures n'entre pas dans un `run.json`.**

### La sonde de sûreté

Même principe que A, worktree **interne** lui aussi (`.worktrees/<nom>` sous la racine), six sondes dont une de plus que A : rejouer les sondes **depuis un script d'orchestration**, pour établir si les verrous s'y appliquent. Si une sonde ne refuse pas, aucun agent qui écrit n'est lancé et le lot se replie sur un codeur restreint à `Edit` et `MultiEdit` sans `Bash`.

### La frontière du lot 1

**Dedans** : `run.json`, trois schémas, le validateur, deux fiches neuves avec leurs fixtures, les six sondes, le digest, un banc d'essai réel, une ligne au REGISTRE. **Dehors** : la même liste que A, plus l'outil `Workflow` lui même.

**Critère de fin** : gate PASS et diff expliqué au quiz, fil qui n'a reçu que des digests, **validateur qui a refusé au moins une sortie non conforme pendant le run**, et six sondes vertes et rejouables.

### Compromis, et ce que ça rend impossible

Profondeur haute : le validateur et le contrat suppriment tout jugement du pilote sur « l'étape a-t-elle rendu ce qu'elle devait ». Profondeur faible : `run.json` est proche d'une liste d'appels, il ne cache presque rien.

Impossible ou coûteux : un agent qui « discute », puisque toute réponse hors bloc JSON est perdue, donc une intuition non prévue par le schéma disparaît. Ajouter un rôle coûte un schéma plus des fixtures, frein voulu mais frein. L'isolation `worktree` native du harnais devient inutilisable telle quelle. Une revue vraiment libre passe mal le contrat : B propose un champ `hors_contrat` de trois lignes, sinon on perd ce que l'adversité a de meilleur.

### Hypothèses, et ce qui s'écroule si l'une tombe

1. Un sous agent garde `CLAUDE_PROJECT_DIR` sur la racine même avec un répertoire courant dans le worktree. Faux : aucun agent n'écrit, le lot se réduit à un pipeline en lecture.
2. Un agent sait rendre du JSON strict de façon fiable. Faux, si le taux d'échec dépasse un essai sur cinq : repli sur un contrat en markdown à sections fixes, même validateur, même `run.json`.
3. `Workflow` n'est pas requis. Rien ne s'écroule si Melvyn l'active, le gain est marginal.

**Coût annoncé : trois jalons, deux à trois sessions.**

---

## Ce que j'ai vérifié moi même, contre les deux rapports

| Fait avancé | Par | Verdict | Preuve |
| --- | --- | --- | --- |
| Un worktree frère ne contient ni `.claude/` ni `.venv/`, donc soit aucun verrou soit blocage total | B | **confirmé** | `ls -a "C:/dev/Eve/EveBackEnd-review"` rend 11 entrées, ni `.claude` ni `.venv` ; `git worktree list` confirme que c'est bien un worktree du dépôt |
| Aucun verrou n'arrête `git commit` ni `git push` sur une branche `features/melvyn/*` | A | **confirmé** | `garde_git.decision("git commit -m x", "features/melvyn/banc")` rend `None` ; idem pour `git push`. Sur `develop`, refus. Code : `garde_git.py:128-130` |
| `gate.py` crée déjà un worktree, donc le motif est maison | A | **exact mais à nuancer** | `gate.py:84` fait bien `git worktree add --detach`, mais dans `tempfile.mkdtemp()`, donc **hors de la racine**, et c'est un script Python qui y travaille, pas un agent par appels d'outils. Le précédent ne prouve pas le cas de l'agent |
| L'outil `Workflow` est indisponible car absent des plugins | B | **faux** | `installed_plugins.json` ne contient bien que `superpowers@6.1.1`, mais `Workflow` est un outil natif du harnais et le skill `workflow-authoring` est présent dans la session. Ce qui reste vrai : son usage demande l'accord explicite de Melvyn, et les verrous n'y ont jamais été sondés |
| `subagent-driven-development` est déjà au REGISTRE | A | **partiellement** | La ligne `superpowers (plugin)` du REGISTRE est adoptée en bloc mais n'énumère pas ce skill. Il est disponible ; la ligne du REGISTRE gagnerait à le nommer |

---

## Tableau d'arbitrage

Notes de 1 à 5, chacun s'étant noté lui même ; la colonne « mon avis » est mon arbitrage après vérification.

| Critère | A, minimal | B, pipeline | Mon avis |
| --- | --- | --- | --- |
| Cohérence avec l'existant | 5 | 4 | **A**. Une fiche au format des quatre en place, zéro format nouveau. B introduit un dossier, trois schémas, un validateur et un vocabulaire que le dépôt n'a pas |
| Rayon d'impact | 5 | 4 | **A**. Trois fichiers du dispositif contre un dossier entier |
| Réversibilité | 4 | 5 | **B**, de peu. Les deux se défont par suppression ; B est mieux découpé en quatre étapes indépendantes |
| Testabilité | 3 | 5 | **B**, nettement. C'est sa vraie force : un validateur se teste hors agent, des fixtures se rejouent, une fiche sans ses trois cas n'entre pas dans un run. A l'admet comme son point faible |
| Effort | 4 | 3 | **A**. Une demi session contre une session avant que quoi que ce soit tourne |
| Fil non inondé, la première exigence de Melvyn | tenu à la main par le fil | tenu par construction, le digest est un artefact typé | **B** sur le principe, **A** sur la preuve : le bloc jalon de A existe déjà en substance dans le dispositif actuel |
| Ce que ça rend impossible | deux développeurs en parallèle ; rapports d'agents non archivés | l'agent qui « discute » ; l'adversité hors contrat ; le worktree natif du harnais | **A** : perdre le parallélisme se rattrape au lot suivant, perdre l'intuition d'un relecteur ne se rattrape pas |
