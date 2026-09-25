# Rapport brut : redacteur-eve, relecture de la regle `.claude/rules/session.md`, 18/09/2026

Depose tel quel par le fil. Brief : lire `session.md`, ses deux voisines (`communication.md`, `agents.md`),
`/fin-session` et `CLAUDE.md` ; cinq axes (doublon, phrase sans effet, verifiable, forme EVE, exactitude
des sources MAOS citees) ; 300 mots au plus.

NEEDS_WORK

| Gravité | Axe | Phrase visée (`.claude/rules/session.md`) | Ce qui cloche | Réécriture proposée |
|---|---|---|---|---|
| Haute | 3 | l.9 « ou une remise en cache qui dépasse la moitié de la fenêtre (500 000 jetons sur une fenêtre de 1 M) » | Ce chiffre n'est affiché nulle part en séance : le signe s'estime, ce que la l.7 interdit. | « - Le harnais annonce un résumé du contexte (compaction), ou affiche son avertissement de contexte bas. » |
| Haute | 1 et 2 | l.29 « Les garde-fous qui valent pour la suite : commit et push sur demande explicite, boucle bornée à deux cycles de correction, rapports d'agents déposés dans `agents/`. » | Les trois sont déjà dans `git.md` (commits), `agents.md` (« Boucle bornée », « rapports bruts dans le dossier `agents/` du chantier ») et `communication.md`, et `CLAUDE.md` l.5 dit que `.claude/rules/` se charge automatiquement : la session neuve les a déjà. | Supprimer la puce entière. |
| Moyenne | 1 | l.18 « Je lance `/fin-session` : journal, handoff, dashboard, `PLAN.md`, mémoire. » | Recopie les cinq étapes de `.claude/commands/fin-session.md` l.10-14 (et `communication.md`, « Fin de session : /fin-session (handoff, mémoire, dashboard) »). Deux listes à maintenir. | « 3. **Je lance `/fin-session`**, qui va jusqu'au prompt de relance. » |
| Moyenne | 3 | l.12 « ou un rapport d'agent n'entre plus entier » | Invérifiable, et sans objet : `agents.md` veut le rapport déposé en fichier, jamais monté au chat. | « - Une sortie d'outil est tronquée par sa taille. » |
| Basse | 3 | l.10 « Il me faut relire le journal pour savoir ce que la session a déjà fait. » | Impression plutôt que constat. | « - J'ai relu le journal pour savoir ce que la session a déjà fait. » |
| Basse | 5 | l.3 « section 8, la marge qui met l'exécution en pause » | Exact (section 8 : « leave >= 30 % of the 5-hour window free », « Crossing either cap pauses ALL execution »), mais la section 8 parle du quota d'abonnement sur 5 heures, pas de la fenêtre de contexte : on peut croire que les 500 000 jetons en viennent. | « section 8, la marge de quota qui met l'exécution en pause » |

Axe 5, vérifié aux deux sources : la section 11 de `2026-06-27-md-handoff-prompts.md` est bien
« Orchestrator / launch prompt, WHAT TO PASTE into the new session ». Aucune source déformée.
Axe 4 : rien. Pas de tiret typographique, aucun caractère caché (contrôle python), fins de ligne LF comme
ses voisines, pointeurs cohérents (`CLAUDE.md` l.5, `fin-session.md` étape 2).

À vérifier par le fil : `.claude/README.md` et `/verif-setup` citent-ils `session.md` ? Non lus (hors brief).

CONTEXT.md : proposer les entrées « poids de session » et « prompt de relance » (fichier non lu, à
confirmer par le fil).
