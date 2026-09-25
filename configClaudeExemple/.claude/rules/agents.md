# Agents : qui lance qui, qui écrit quoi, ce que ça coûte

Source des motifs : la doctrine de MAOS (`C:\dev\maos\CLAUDE.md` sections 6, 8 et 12, et
`packages/agents/fiches/orchestrator.md`), lue à la source le 16/09/2026. Rien n'en est recopié.
Cette règle dit comment la mini entreprise d'agents d'EVE travaille ; les fiches sont dans
`.claude/agents/`, et la ligne `tools` de chaque fiche fait foi sur ce qui lui est ouvert.

## Qui lance qui

- **Un agent ne lance jamais un agent.** Le fil principal orchestre, seul. Motif : un agent qui en lance
  un autre crée un arbre dont personne ne voit ni la profondeur, ni le coût, ni les écritures ; et le
  rapport qui remonte est alors le résumé d'un résumé. Mécaniquement, aucune fiche du poste ne déclare
  l'outil `Task`, et c'est volontaire.
- **Le fil ne délègue pas ce dont il est responsable** : commit, push, opération serveur, et l'édition
  d'un fichier qui est lui-même une barrière (`garde_*.py`, `_lib.py`, `settings.json`). Ce que le fil
  écrit, Melvyn le relit dans VS Code avec tout le contexte ; ce qu'un agent écrit n'a pour trace que
  son propre rapport. Et un hook qui plante n'arrête plus rien, sans que rien ne le dise.
- **Un agent qui bloque escalade, il ne devine pas.** Chaque fiche porte une section `escalate_when` :
  les conditions précises où il s'arrête et rend la main plutôt que de choisir à la place du fil. Une
  fiche sans `escalate_when` est incomplète.
- **Boucle bornée.** Après un verdict de vérification non favorable, deux cycles de correction au plus,
  puis une nouvelle revue. Au troisième échec, on consigne l'état exact et on remet la main à Melvyn.
  Une boucle « jusqu'à ce que ce soit bon » n'est pas une boucle, c'est une fuite.

## Qui écrit quoi

- **Un fichier, un écrivain.** Le fil écrit les artefacts du chantier (journal, dashboard, spec, plan,
  revue). Un agent n'écrit que dans le périmètre que son brief lui donne, avec les seuls outils que
  déclare sa fiche.
- **Le fil est le seul écrivain de la mémoire.** Aucun agent n'écrit dans le bucket mémoire. Un agent
  qui rencontre un fait durable le **propose** dans son rapport ; le fil décide, vérifie, et écrit.
  Motif : la mémoire est lue à chaque session et personne ne la relit ligne à ligne ; une écriture non
  vérifiée y devient une vérité permanente.
- **Aucun rapport d'agent ne monte au chat tel quel.** Il se dépose brut dans
  `chantiers/<chantier>/agents/<date>-<agent>-<n>.md`, puis le fil le transcrit.
- **Aucune affirmation d'agent n'est reprise sans revérification de la main du fil**, sortie de commande
  à l'appui. Ce n'est pas de la défiance : sur ce chantier, plusieurs faits d'agents se sont révélés
  faux, et plusieurs vérificateurs se sont corrigés eux-mêmes en cours de route.

## Ce que ça coûte

Pas de compteur, pas de budget en jetons à tenir à la main : des habitudes qui coûtent peu et qui
évitent la dépense inutile.

- **Le résumé avant le corps.** Un rapport commence par son verdict et ses findings, le plus grave en
  tête ; le détail suit. Le fil doit pouvoir décider en lisant les dix premières lignes.
- **Un brief borné.** On nomme à l'agent les fichiers qu'il doit lire, et on lui dit de ne pas en lire
  d'autres. Un brief qui dit « regarde le dépôt » coûte dix fois un brief qui dit « lis ces quatre
  fichiers ». On borne aussi la sortie (400 mots pour une relecture, 300 pour un rapport de code), les
  sorties de commandes ne comptant pas dans la limite.
- **Un axe par agent.** Trois relecteurs sur trois axes trouvent plus qu'un relecteur sur trois axes, et
  chacun coûte moins.
- **Le coût des agents d'un chantier structurant s'écrit au dashboard**, en ordre de grandeur, au point
  d'étape. Pas pour le tenir, pour le voir.
- **Un agent qui lit des données est une erreur de brief** : les verrous le refuseront, et le coût sera
  payé pour rien.
