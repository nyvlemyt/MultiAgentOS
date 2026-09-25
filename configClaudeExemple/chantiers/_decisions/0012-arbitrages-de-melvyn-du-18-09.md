---
status: accepted
date: 2026-09-18
decideur: Melvyn, le 18/09/2026, en reponse aux onze questions du fil
chantier: chantiers/2026-09-15-mini-entreprise-agents
---

# Les arbitrages de Melvyn du 18/09 : dix recommandations retenues, une reportee

Melvyn a demande d'appliquer toutes les recommandations du fil **sauf la onzieme**, qui reste en attente.
Cette fiche fige ce qui est tranche ; ce qui demande du travail est ordonne dans le prompt de relance du
handoff, parce que la session du 18/09 est trop lourde pour l'entreprendre (`rules/session.md`).

## Ce qui est tranche

| # | Sujet | Decision | Etat |
| --- | --- | --- | --- |
| 1 | La mission 0 (branche `esgRatingLastModif`) | **A finaliser** : relecture de Melvyn puis deux commits, un pour le merge de `develop`, un pour les tests | a faire, session neuve |
| 2 | Sauvegarde du dispositif | Un depot a part pour `.claude/` et `chantiers/`, pousse sur Azure DevOps | a faire, session neuve |
| 3 | Les lots de verrous (2a, 2b, 3, 3bis, 4) | **Acceptes en l'etat**, avec leurs limites ecrites dans `securite.md` | acquis |
| 4 | Les regles `agents.md` et `session.md` | **Gardees**, elles se chargent a chaque session | acquis |
| 5 | `_commande.py` au-dessus du seuil de 800 lignes | Decoupage **reporte au lot suivant** (scanner d'un cote, construction des invocations de l'autre) ; un decoupage pendant un cycle de correction est ce qui a introduit cinq regressions dans la nuit du 16 | a faire, plus tard |
| 6 | `/gate` n'analyse jamais `.claude/` | **A etendre** : les verrous ne sont tenus aujourd'hui que par des commandes lancees a la main | a faire, session neuve |
| 7 | Le manifeste d'empreintes ne surveille pas `CLAUDE.md` | A corriger, de la main de Melvyn (la commande est dans le handoff) | a faire, main de Melvyn |
| 8 | `manage.py shell -c` qui afficherait une valeur de la base | **Refuse par defaut** : `donnees.md` dit deja « jamais de valeur ligne a ligne, quelle que soit la base » | a implementer, session neuve |
| 9 | Les modules python absents de la table (`python -m <module>`) | **La limite est gardee telle quelle** : l'inverse refuserait `python -m pytest`, et un verrou qui gene le travail courant finit desactive | acquis, ecrit |
| 10 | La sauvegarde de `.env` hors du depot | **Retenue** : elle fait tomber le mot « irreparable » sur lequel toute la doctrine est batie | a faire, main de Melvyn |

## Ce qui est reporte

La onzieme : les actions de la main de Melvyn qui ne dependent pas du dispositif (message a Edmond,
Gaetan, la liste de lecture de la cartographie, la base `EveDevMel`, la decision `0004`). **Pas
maintenant**, sur sa demande. Elles restent listees dans `PLAN.md` section 3.

## Ce qui change dans le cap

Melvyn annonce trois choses qui reordonnent la suite, et qui seront cadrees en session neuve :

1. Il a mene des reunions et **rapporte le besoin reel** : le contexte des vraies missions est a recueillir
   avant de planifier quoi que ce soit d'autre.
2. Il veut **refaire les bases de donnees** et ameliorer ce qu'il y a autour. Nouveau chantier, niveau
   structurant (bases, migrations, contrats aval).
3. Il changera de session, et peut-etre de compte : la passation doit donc etre **autonome**, lisible par
   une session qui ne sait rien.
