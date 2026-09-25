---
status: accepted
date: 2026-09-16
decideur: Melvyn
chantier: chantiers/2026-09-15-mini-entreprise-agents
---

# Mini entreprise d'agents, lot 1 : l'organigramme minimal de A, avec deux greffes de B

Décision prise par Melvyn à l'ouverture du chantier `2026-09-15-mini-entreprise-agents` (mission T), après lecture de deux propositions d'architecture concurrentes produites par deux `architecte-eve` lancés en parallèle sur le même brief avec des contraintes opposées. Fiche au format court : la décision est prise, elle n'est pas à trancher.

## Contexte

La vision de Melvyn du 15/09/2026 (`_missions/2026-09-15-mini-entreprise-agents.md`) porte huit sous systèmes indépendants. Une seule spec ne peut pas les porter sans devenir vague partout, et le vague dans une spec est précisément ce qui a produit le test posé au mauvais endroit le 15/09. Melvyn a donc tranché un découpage, puis retenu un premier lot : **socle de sûreté plus tranche verticale**, avec pour banc d'essai un petit chantier de code EVE réel dans un worktree isolé, et une validation par jalon.

Deux contraintes de conception ont été mises en concurrence. **A** : interface minimale, fil principal orchestrateur, aucune machinerie nouvelle tant qu'un mécanisme existant porte le besoin. **B** : pipeline déterministe, l'enchaînement devient un artefact de données rejouable et chaque agent rend une sortie typée validée mécaniquement.

Trois faits vérifiés dans le dépôt ont pesé sur l'arbitrage, tous consignés avec leur commande dans le `journal.md` du chantier :

1. Les quatre verrous actifs **s'appliquent déjà aux appels d'outils des sous agents**, sur `Bash` comme sur `Write` (sonde du 15/09, quatre refus venus des hooks).
2. Un **worktree frère ne contient ni `.claude/` ni `.venv/`** : ils sont exclus de git, donc `git worktree add` ne les emporte pas. Un agent y travaillerait soit sans aucun verrou, soit bloqué sur tout par `garde_perimetre`.
3. **Aucun verrou n'arrête `git commit` ni `git push` sur une branche `features/melvyn/*`** : `garde_git.decision("git commit -m x", "features/melvyn/banc")` rend `None`. Sur `develop`, il refuse.

## Décision

**L'ossature est celle de A**, avec deux greffes prises à B.

De A, retenu tel quel :

- Un seul rôle nouveau, `developpeur-eve`, le seul travail qu'aucun rôle existant ne fait : écrire du code. Les quatre fiches en place ne sont pas modifiées.
- Le banc d'essai est un worktree **sous la racine du projet**, dans `chantiers/<chantier>/banc/`, dossier déjà exclu de git. Motif : `garde_perimetre` borne sur `CLAUDE_PROJECT_DIR`, donc un worktree hors racine ferait refuser toute écriture légitime, et un worktree frère n'emporterait pas les verrous.
- Le **bloc jalon** comme unique message remontant au fil après un ordre : fait, preuve, adversité, manque, à valider, à lire. Aucun rapport d'agent recopié tel quel, aucun dossier `agents/` nouveau, un fichier un écrivain.
- Le partage des rôles entre verrou et fiche : ce qu'un hook peut tenir, c'est le hook qui le tient ; la fiche ne porte que l'invisible aux hooks (ordre TDD, périmètre de fichiers, forme du rapport, interdiction de commit).

De B, greffé :

- **Le test de fiche automatisé.** Trois fixtures par fiche, rejouables mécaniquement : `rouge` (un piège que la fiche doit refuser, joué d'abord sans la clause pour prouver que c'est bien la clause qui tient), `vert` (une tâche étalon à réponse connue, vérifiée de la main du fil), `refus` (une demande interdite, par exemple un commit). C'est la faiblesse que A reconnaissait lui même : une fiche ne se testait qu'à la main.
- **La déclaration obligatoire des refus de verrou.** Le rapport d'un agent porte un champ où il déclare tout refus de verrou rencontré, vide par défaut. C'est la trace de sûreté : un agent qui a buté sur un verrou doit le dire, et un champ systématiquement vide dans un lot où l'agent a tenté quelque chose est en soi un signal.

**Le trou du commit** : sondé avant d'être tranché. On établit d'abord si le JSON reçu par un hook permet de distinguer un appel de sous agent d'un appel du fil principal. Si oui, `garde_git` refuse `commit` et `push` aux sous agents et les laisse au fil principal : barrière mécanique, aucune gêne pour le travail de Melvyn. Si non, on retombe sur la fiche plus un contrôle de fin de jalon (`git log` et branche distante inchangés), et le trou est écrit noir sur blanc comme tel.

## Alternatives écartées

**B pur, le pipeline à contrats typés.** Écarté pour trois raisons, dans cet ordre. Son coût d'entrée est plus élevé qu'un premier essai réel : un dossier, trois schémas et un validateur avant que quoi que ce soit tourne, alors que A produit une équipe qui tourne en une demi session de plus. Il introduit dans le dispositif un vocabulaire et des artefacts que le dépôt n'a pas, contre la règle de qualité « chercher le motif existant et le suivre ». Et surtout, son contrat JSON strict rejette la réponse d'un agent qui sort du schéma même quand elle est juste : c'est précisément ce que l'adversité a de meilleur, et ce que le reproche du 15/09 demandait de renforcer, pas de brider. Ce qu'il apportait de mieux, la testabilité, est repris par greffe.

**A pur.** Écarté parce que son propre auteur note la testabilité des fiches comme son point faible, et qu'une fiche non testée est exactement le genre de régression silencieuse qu'on ne voit qu'après coup. La greffe coûte peu.

**B plus le bloc jalon de A.** Écarté : on paierait le coût d'entrée de B sans alléger ce qui coûte.

**Laisser le trou du commit hors périmètre.** Écarté par Melvyn : c'est le lot du socle de sûreté, et ce trou porte sur le seul point qu'il a posé comme intouchable.

## Conséquences

- Le lot 1 livre : la sonde de sûreté en worktree (et la sonde du trou commit), la fiche `developpeur-eve` avec ses trois fixtures, le bloc jalon inscrit dans `.claude/rules/communication.md`, une ligne au `REGISTRE.md`, et un petit chantier de code EVE réel mené de bout en bout dans le banc.
- Le lot 1 **ne livre pas**, et c'est nommé : planificateur et auditeur, routeur de modèles, recherche externe et dossiers d'intake, agent sécurité dédié, gardien de mémoire, rétro d'amélioration continue, développeurs en parallèle, pipeline déterministe et outil `Workflow`, état et ouverture en écriture de MAOS, et toute modification de `/chantier` et `/revue`. Ces modifications sont le livrable d'un lot ultérieur, une fois la preuve faite.
- Deux conditions d'arrêt sont acceptées d'avance. Si une sonde montre que `garde_perimetre` ne tient pas sur `Edit` ou `MultiEdit`, **le lot 1 s'arrête** et un chantier correctif du hook passe devant : aucun agent n'écrit de code avant. Si le banc en worktree s'avère impossible, le lot attend la fin du merge de la mission 0 et tourne sur une branche de l'arbre principal, sans changer la conception.
- Le critère de fin est binaire et porte sur Melvyn, pas sur moi : un chantier réel passé de bout en bout **sans qu'il lise autre chose que le bloc jalon, le dashboard et le guide de lecture**, et un quiz passé sur un diff qu'il n'a pas vu s'écrire. Si le quiz échoue, le lot échoue.
- Le numéro `0009` était annoncé dans `PLAN.md` pour la future fiche « adapter ou consolider » de la mission 1. Elle prendra `0010`.

## Amendement du 16/09/2026, après l'attaque de la spec

Trois `relecteur-eve` adverses ont attaqué la spec issue de cette décision. Vingt et un findings ont été confirmés de ma main (`chantiers/2026-09-15-mini-entreprise-agents/attaques/attaque-spec.md`). Trois d'entre eux touchent cette fiche et Melvyn les a tranchés le même jour.

**1. Le banc d'essai en worktree est abandonné pour ce lot.** Quatre raisons indépendantes, toutes vérifiées : `/gate` et `/revue` mesurent la racine et jamais le banc (`gate.py:34,50,183`) ; rien ne retient mécaniquement un agent dans le banc, et l'arbre non commité de la mission 0 n'est pas restaurable puisque `git restore` et `git checkout <fichier>` sont interdits sans exception ; `verif_style` perd sa base de comparaison dans le banc et rend bloquants des défauts préexistants ; et un worktree n'emporte ni `.venv`, ni `.env`, ni `ruff.toml`, ni `pyrightconfig.json`, aucun n'étant suivi par git. Le lot se découpe donc en **1a** (sondes, fiche, fixtures, doctrine, sans toucher au dépôt) et **1b** (le vrai chantier, sur une branche de l'arbre principal, après le commit de la mission 0).

**2. La règle « aucun dossier `agents/` nouveau » est renversée.** Elle confondait deux choses. Le fil ne remonte que le bloc jalon : c'est la contrainte de chat, elle reste. Mais les rapports bruts des agents sont désormais déposés tels quels dans `chantiers/<chantier>/agents/`. Motif : Melvyn demande explicitement de savoir « qui fait quoi, dit quoi », et le lot mémoire à venir n'aurait eu aucune matière première. Le coût est nul et n'ajoute aucun message dans le fil.

**3. La barrière de fiche contre le commit est conservée même si le hook fonctionne.** La rédaction initiale posait un choix exclusif entre le correctif de `garde_git` et la clause de la fiche. Un test de hook qui fabrique lui même son entrée JSON reste vert pour toujours, y compris le jour où le harnais renomme le champ : la barrière disparaîtrait sans aucun signal. Deux barrières, donc, plus une date de revérification.

**Précision du 16/09 au soir**, après relecture : cette fiche annonçait « un contrôle vivant de la présence du champ dans `doctor.py` ». Il n'existe pas, et il ne peut pas exister sous cette forme : `doctor.py` ne lit pas le corps des fiches, et aucun contrôle hors ligne ne peut constater que le harnais envoie toujours `agent_id`. Ce qui est réellement livré tient en deux choses : les fixtures `refus` et `mur`, rejouables à chaque modification de la fiche, et une ligne « maintien » au `REGISTRE.md` qui impose de resonder `agent_id` à la date de ré-audit. La promesse est ramenée à ce qui est tenu.
