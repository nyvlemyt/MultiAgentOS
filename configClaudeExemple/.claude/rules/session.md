# Session : quand je m'arrête, et ce que je laisse

Une session a un poids. Passé un certain poids, elle coûte cher, elle oublie son propre début, et elle finit par se faire résumer par la machine plutôt que par moi. Motif porté de MAOS (`C:\dev\maos\TOKEN_STRATEGY.md` section 8, la marge de quota qui met l'exécution en pause ; `docs/learning/2026-06-27-md-handoff-prompts.md` section 11, le prompt à coller dans une session vierge ; lus le 18/09/2026). Rien n'en est recopié.

## Les signes du poids

Le poids se constate, il ne s'estime pas. Un seul de ces signes suffit.

- Le harnais annonce un résumé du contexte (compaction), affiche son avertissement de contexte bas, ou affiche une remise en cache au delà de la moitié de la fenêtre (702 000 jetons sur une fenêtre de 1 M, vus le 17/09/2026).
- J'ai relu le journal pour savoir ce que la session avait déjà fait.
- Trois jalons ont été livrés depuis le démarrage, ou la session couvre deux chantiers différents.
- Une sortie d'outil est tronquée par sa taille.

## Ce que je fais alors

1. **Je finis l'unité en cours** : la tâche en main, son verdict, son écriture au journal. Une session lourde s'arrête à une frontière propre, jamais au milieu d'un cycle de correction ni d'un agent lancé.
2. **Je le dis à Melvyn en une phrase**, avec le signe constaté, avant de commencer la passation. C'est lui qui décide de continuer quand même.
3. **Je lance `/fin-session`**, qui va jusqu'au prompt de relance.
4. **Je garde le lot suivant pour la session neuve.** Ce qui reste va au prompt de relance, et un jalon de plus dans une session saturée vaut moins qu'une reprise propre.

## Le prompt de relance

Il est écrit pour une session qui ne sait rien. Un bloc de code copiable, à la fin du handoff, qui donne :

- Le chantier, sa branche, son niveau de rigueur.
- Les fichiers à lire en entier, dans l'ordre, par leur chemin exact, et l'ordre de s'en tenir à ceux-là.
- L'état en trois lignes : ce qui est livré et prouvé, ce qui est livré non validé, ce qui n'est pas fait.
- La première action, seule et nommée.
- Ce qui s'écarte de la doctrine pour ce lot précis : cycles de correction déjà consommés, décision en attente. La doctrine elle même se charge toute seule dans la session neuve, elle ne se recopie pas ici.

Il se relit par une question : une session qui n'a que ce bloc et ces fichiers reprend-elle sans rien me demander ? Si non, il manque un fichier ou une ligne d'état.
