# Prompt de la session autonome, nuit du 16 au 17/09/2026

Écrit par la session du 16/09 au soir, à la demande de Melvyn (« fais en sorte qu'il soit autonome parce qu'il va se lancer seul toute la nuit »). Lancement conseillé depuis `C:\dev\Eve\EveBackEnd`, en mode de permission `auto` (le classifieur approuve les actions sûres, les cinq verrous restent actifs quel que soit le mode) : `claude --permission-mode auto`. Coller ensuite le bloc ci dessous tel quel.

---

Tu reprends la mission T (mini entreprise d'agents) en **mode autonome** : personne ne lira ni ne répondra avant demain matin. Tu ne poses aucune question. Tu tranches, tu écris, tu continues.

Lis dans cet ordre avant d'agir, en entier : `chantiers/2026-09-15-mini-entreprise-agents/handoff.md` (dont la section « Mode autonome », qui est ta règle pour la nuit), puis `chantiers/2026-09-15-mini-entreprise-agents/journal.md` à partir de « 16/09/2026 au soir : lot 2 », puis `chantiers/PLAN.md` section « Mission T », puis `chantiers/2026-09-15-mini-entreprise-agents/audit/synthese-audit.md`. La mémoire `feedback-arbitrages-delegues` fait foi.

Commence par vérifier que tu tournes sur la doctrine du 16/09 : `grep -c developpeur-eve CLAUDE.md` doit rendre au moins 1, `python .claude/hooks/doctor.py --complet` doit rendre 13 OK et zéro alerte, et le comparateur `python chantiers/2026-09-15-mini-entreprise-agents/etat-depart/empreintes.py --comparer chantiers/2026-09-15-mini-entreprise-agents/etat-depart/manifeste.txt` doit rendre « poste intact ». Si l'un des trois échoue, écris le au journal et arrête toi : on ne construit pas sur un poste dont l'état est inconnu.

Puis, dans cet ordre, en appliquant le pipeline par lot du handoff (pré-vol à la source dans `C:\dev\maos` en lecture seule, spec attaquée, plan attaqué, exécution TDD, vérification indépendante lue en fichier, persistance après chaque tâche) :

1. **Fin du lot 2a** : le trou `.env`. Test rouge dans `.claude/hooks/tests/test_gardes.py` (écriture par `Write`, `Edit` et redirection shell sur `.env` et `.env.dev1` refusée ; lecture toujours autorisée), puis le correctif dans `garde_perimetre.py`, puis `doctor --complet`.
2. **Lot 2b**, les fondations MAOS vers EVE : REGISTRE au format `intake-audit`, règles (`securite.md` clé API et facturation à l'usage égalent rejet automatique, un agent ne lance pas un agent ; `qualite.md` porter le motif et citer la source ; discipline tokens ; écrivain unique de la mémoire), `model:` et `skills:` et `escalate_when` dans chaque fiche, contrôle de frontmatter dans `doctor`, hook `SubagentStop` vers `agents/index.jsonl`, journal des refus dans `_lib.refuser`, `token-watch` en Python après sonde de `transcript_path`.
3. **Lot 2d**, les rôles manquants, chacun sous 200 lignes au format EVE avec ses fixtures jouées : `planificateur-eve`, `verificateur-eve`, `securite-eve` et `/revue-securite`, `chef-de-mission-eve` ; verdict mécanique `PASS | NEEDS_WORK | BLOCK` dans `/revue`.
4. **Lot 2e**, mémoire et amélioration : `memoire.md`, provenance, registres BLK et EVAL, cinq destinations d'une idée, DURCIR en trois niveaux, boucle d'évaluation quantitative sans CDN.

Tu ne commences **jamais** le lot 1b : il attend le commit de la mission 0 par Melvyn. Tu ne modifies aucun fichier suivi par git (`git status --porcelain` identique à `etat-depart/status.txt` après chaque tâche). Aucun commit, aucun push, aucune écriture dans `C:\dev\maos`, aucune dépendance nouvelle, aucune requête externe hors documentation publique. Une porte d'arrêt qui tire arrête le lot, jamais contournée. Deux cycles de correction au plus après un `NEEDS_WORK`.

Après chaque tâche : journal (commande et sortie), comparateur repris. Après chaque lot : `handoff.md` section « Ce qui reste » réécrite, dashboard, mémoire `project-mission-t-etat`. La dernière ligne du journal dit toujours où tu en es. Quand tout est fait ou que rien ne peut avancer sans Melvyn : bloc jalon dans `handoff.md` et le dashboard, journal terminé par `ARRET : <motif>`, et tu t'arrêtes.

Le meilleur, pas le plus vite. Rien n'est recopié de MAOS : tout se réécrit au format EVE, source citée en tête. Aucune affirmation d'agent n'est reprise sans revérification de ta main.
