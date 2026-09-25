# Passation de la session du 18/09/2026

Ecrit en fin de session parce que la session est lourde : une journee entiere sur les verrous, neuf
agents, plus de 1 100 commandes d'attaque fabriquees. C'est le cas que `rules/session.md` prevoit.
Ce document est fait pour une session qui ne sait rien, et il se termine par le **prompt de relance**.

## L'etat en trois lignes

- **Livre et prouve** : les trois verrous et leur analyseur commun (lots 3, 3bis, 4), `793 cas de
  contrat verts`, `978 tests OK`, cout des hooks de +3 a +10 ms. Vingt-cinq defauts fermes le 18/09,
  quatre classes ecrites comme limites dans `securite.md`. La regle `session.md` est en place.
- **Livre non valide** : rien de plus. Melvyn a accepte les lots 2a, 2b, 3, 3bis et 4 le 18/09
  (`_decisions/0012`).
- **Pas fait** : la mini entreprise elle meme est a moitie. Cinq fiches d'agents sur neuf, aucune
  `model:` ni `skills:`, pas de hook `SubagentStop`, pas de memoire d'agents, pas de boucle
  d'evaluation, et le premier chantier de code mene par l'equipe (lot 1b) n'a jamais commence.

## Ce qui reste a faire, dans l'ordre

1. **Finaliser la branche `features/melvyn/esgRatingLastModif`** (mission 0). Le travail est fini depuis
   le 15/09 et dort dans l'arbre : douze fichiers modifies, migration `0027`, cinq tests qui echouent sur
   `d17cde8` donc qui prouvent le changement, `/gate` PASS a 164 tests. Il manque la relecture de Melvyn
   dans VS Code, puis **deux commits** (un pour le merge de `develop`, un pour les tests). Convention :
   anglais, `scope: description.` avec point final, aucun `Co-Authored-By`. Rien ne se pousse sans sa
   demande explicite.
2. **Recueillir le contexte des vraies missions.** Melvyn a mene des reunions et rapporte le besoin reel.
   C'est la premiere chose a ecouter : tout le reste du plan en depend, et `PLAN.md` date du 14/09.
3. **Ouvrir le chantier des bases de donnees** (refonte et ameliorations autour). Niveau structurant :
   bases, migrations, contrats aval. Passer par `/chantier`.
4. **Sauvegarder le dispositif** : un depot a part pour `.claude/` et `chantiers/`, pousse sur Azure
   DevOps. Aujourd'hui, trois verrous, 793 cas de contrat et tout l'historique des chantiers n'existent
   qu'a un seul endroit, sur un seul poste, sans sauvegarde.
5. **Etendre `/gate` a `.claude/`** : les verrous ne sont tenus que par des commandes lancees a la main.
6. **Refuser `manage.py shell -c` qui afficherait une valeur de la base** (tranche le 18/09).
7. **Reprendre la mini entreprise** : lot 2b tranches 3 et 4 (`model:`, `skills:`, `escalate_when` par
   fiche, hook `SubagentStop`), lot 2d (les quatre roles manquants : `planificateur-eve`,
   `verificateur-eve`, `securite-eve`, `chef-de-mission-eve`), lot 2e (memoire et boucle d'evaluation),
   puis **lot 1b**, le premier chantier de code mene par l'equipe, des que la mission 0 est commitee.

## Les deux gestes de la main de Melvyn

- **Sauvegarder `.env` hors du depot.** Une ligne : `New-Item -ItemType Directory -Force
  D:\sauvegardes\eve-env | Out-Null; Copy-Item .env,.env.dev1 D:\sauvegardes\eve-env -Force`. Motif :
  `.env` n'est pas dans git, donc rien ne peut le restaurer, et un `.env` faux fait tourner les tests sur
  la base partagee. Quand c'est fait, la phrase « une erreur y est irreparable » de `securite.md` devient
  fausse et doit etre corrigee.
- **Ajouter `CLAUDE.md` au manifeste d'empreintes** du chantier (le detail est dans le journal du
  17/09) : c'est le fichier qui dit au fil qui il est, et rien ne verrait sa modification.

## Ce qu'il ne faut pas refaire

- Ne pas rouvrir la chasse aux trous des verrous. Le critere de sortie est ecrit dans
  `design-lot-4.md` section 3 : un trou d'une classe **deja ecrite comme limite** dans `securite.md` ne
  rouvre rien, il rejoint les limites. C'est ce qui a permis de s'arreter apres quatre passes qui
  n'avaient jamais trouve moins que la precedente.
- Ne pas decouper `_commande.py` (1 000 lignes, au-dessus du seuil) dans un cycle de correction : c'est
  ce qui a introduit cinq regressions dans la nuit du 16.

## Ou lire, dans l'ordre

`chantiers/PLAN.md` (la vue unique) ; `chantiers/_decisions/0012` (les arbitrages du 18/09) ;
`chantiers/2026-09-15-mini-entreprise-agents/design-lot-4.md` section 3 (le critere de sortie) ;
`dashboard.html` (les cinq points d'etape) ; `journal.md` a partir du 18/09 pour le detail.

## Prompt de relance

```text
Reprends EVE. Lis dans cet ordre, en entier, et ne lis rien d'autre avant d'avoir fini :
chantiers/PLAN.md, chantiers/_decisions/0012-arbitrages-de-melvyn-du-18-09.md,
chantiers/2026-09-15-mini-entreprise-agents/handoff.md.

Etat : les verrous du poste sont finis et acceptes (793 cas de contrat, 978 tests, limites ecrites
dans .claude/rules/securite.md). La mini entreprise d'agents est a moitie : cinq fiches sur neuf,
pas de hook SubagentStop, pas de memoire d'agents, pas de boucle d'evaluation. La branche
features/melvyn/esgRatingLastModif porte un travail fini depuis le 15/09 et jamais commite.

Premiere action, une seule : demande moi le contexte des reunions que je viens de mener, avant de
proposer quoi que ce soit. PLAN.md date du 14/09 et il est probablement depasse.

Ensuite, dans cet ordre : finaliser la branche esgRatingLastModif (ma relecture, puis deux commits),
puis ouvrir le chantier de refonte des bases de donnees par /chantier, niveau structurant.

Garde-fous propres a cette suite : les deux cycles de correction par lot sont la regle, un trou
d'une classe deja ecrite comme limite ne rouvre pas un lot, et `_commande.py` ne se decoupe pas
pendant un cycle de correction.
```
