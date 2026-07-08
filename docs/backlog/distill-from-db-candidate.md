# Backlog — Distiller depuis une entrée `memory_candidates` (pas seulement un fichier)

**Statut** : proposé · **Ouvert le** : 2026-07-08 · **Origine** : build distillation (PR #61)

## Constat

L'étage de distillation (`packages/memory/src/conveyor/distill.ts` + `distill-cli.ts`)
prend en entrée un **chemin de fichier SAS** sous `docs/resources/`, dont le chemin
remplit le champ requis `derived_from` de la fiche (ADR 0008 clause 6, contrat
`FicheSchema`).

La CLI `mas distill --all` scanne donc un répertoire du quai. C'est la surface
livrée et elle suffit au dogfood (les fiches capturées vivent sur disque au SAS).

Ce qui manque : distiller directement une **row `memory_candidates`** de la base.
La row ne persiste pas le chemin/URL source d'origine, donc elle ne peut pas
satisfaire un `derived_from` résolvable — le pont DB→distill est volontairement
non câblé plutôt que câblé sur une provenance bancale.

## Ce qu'il faut (petit, réversible, socket propre)

1. Ajouter une colonne `derived_from` (ou `source_path`) à `memory_candidates`
   (migration Drizzle additive — pas de rupture).
2. La renseigner au moment de la capture (le pipeline connaît déjà la source).
3. Un adaptateur `candidateToDistillInput(row): DistillInput` + une variante CLI
   `mas distill --candidate <id>`.

## Pourquoi ce n'est pas fait maintenant (completeness-over-yagni)

Bolt-on réversible avec un socket propre : la surface fichier-path est complète
et exercée ; l'ajout DB est un branchement supplémentaire, pas une refonte. On
l'ouvre quand la distillation depuis la file d'attente DB est réellement
exercée (pas avant — éviter de gold-plater une surface non utilisée).

Voir aussi : [[project-ingestion-dogfood]] · ADR 0008.
