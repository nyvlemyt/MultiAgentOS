# Classifieur — faux positifs sur les documents de cours

> Constaté le 2026-09-04 en promouvant les 51 candidats classés (P1-8, PR #77).
> Statut : **RÉSOLU le 2026-09-07**. Décision et raisonnement :
> `docs/decisions/0004-memory-intake-and-auto-capture.md` §Amendement (2026-09-07).
> Mise en œuvre : porte de provenance (`isIngestedProvenance`, `classifier.ts`) + passe de
> retrait des décisions déjà stockées (`mas reclassify`, `reclassify.ts`).
> Mesuré après correction : 379 scannés → 51 décisions retirées (43 + 7 + 1, exactement les
> faux positifs listés ci-dessous), `mas promote --candidates` promeut **0**, les 378 fiches
> restent servies par le miroir études (`mem:eval` 12/12, dont `etudes-fourier`).

## Le symptôme, mesuré

Les 51 candidats que le classifieur avait rangés dans un registre sont **51 documents de cours**,
et les trois quarts des rangements sont faux :

| Registre | N | Ce que c'est vraiment |
|---|---|---|
| `blockers` | 7 | Des TD/TP DevOps. La règle `\b(blocked\|bloqué\|blocker\|stuck)\b` frappe sur la consigne du sujet : « Checkpoint: do a commit and call us to check your results (don't stay **blocked**) ». |
| `evals` | 1 | Un « **Score** Report » d'anglais. La règle `\b(eval\|benchmark\|score\|R@\d)\b` frappe sur le titre. |
| `learnings` | 43 | Des supports de cours (Deep Learning, ML2, Data Lakes). La règle `\b(learned\|learning\|TIL\|pattern\|appris)\b` frappe sur « Deep **Learning** » — le mot du domaine, pas le mot du registre. |

Les titres eux-mêmes disent la nature du contenu : `| DEEP | LEARNING | (cid:136) MASTER | 1 |`,
`| Data | Lakes | et Data | Intégration |` — de l'extraction de tableau PDF, pas du savoir de mission.

## La cause

`classifyByRulesOnly` (`packages/memory/src/classifier.ts`) applique sa table de mots-clés aux
**200 premiers caractères de n'importe quel corps**. Cette table a été calibrée en juin sur des
candidats de *mission* (des phrases écrites par un agent : « Decided to… », « We learned that… »),
puis réutilisée telle quelle sur le tapis roulant d'ingestion, qui lui sert de la **prose de cours**.
Les mots du registre (`learning`, `score`, `blocked`) sont aussi des mots du domaine enseigné : la
règle ne peut pas les distinguer, parce qu'elle n'a jamais eu à le faire.

Le vrai signal manquant est déjà en base et n'est pas lu : `trust='untrusted'` + `source_kind`
d'ingestion. Un document ingéré n'est **pas** un candidat de mission ; le lui appliquer, c'est
appliquer un classifieur hors de son domaine de validité.

## Ce qui a été retenu (2026-09-07)

1. **Porte d'entrée par provenance** — retenu tel quel. `isIngestedProvenance` lit trois champs
   déjà remplis (`trust`, `candidateType === 'reference'`, `source_kind`) et échoue fermée : un
   seul suffit. Un tag utilisateur explicite passe outre — un humain qui a regardé le document
   surclasse l'heuristique.
2. **Registre `resources`** — **écarté**. Les registres ne reçoivent tout simplement pas d'ingéré :
   ils sont un journal de bord à la première personne, le miroir études sert déjà le retrieval
   (378 fiches), et leur mécanique est hostile aux documents longs (le déchiquetage `##` et les
   51 titres en commentaire HTML l'ont montré). Argumentaire complet dans l'amendement de l'ADR.
3. **Les 5 règles de mission n'ont pas bougé.** En revanche le signal « source type »
   (`skill`/`pattern`/`repo`/`course` → `learnings`) est retiré : son domaine entier est hors
   bornes. Et le fallback LLM n'est plus consulté sur un ingéré — le chemin de capture est
   désormais zéro-LLM *par construction*.

## Reste ouvert

- **Les 379 sont `rejected`** (décision Melvyn du 2026-09-09), pas en attente : la décision étant
  prise, les laisser `pending` aurait saturé la boîte de réception pour toujours. Le savoir n'est
  pas perdu — il vit dans le miroir études.
- La suite, si le besoin de classement revient : une table propre aux ressources (kind / matière /
  niveau) routant vers des **attributs de fiche** — pas vers les 5 registres, que l'amendement
  ferme définitivement à l'ingéré.

## Rollback des 51 (historique — déjà exécuté le 2026-09-04)

```bash
sqlite3 data/mas.db "update memory_candidates set status='pending' where status='accepted';"
rm data/memory/_global/{learnings,blockers,evals}.md
pnpm --filter @mas/memory seed && qmd update && qmd embed
```

## À relire avec

- `docs/decisions/0004-memory-intake-and-auto-capture.md` §5 (déterministe d'abord)
- `docs/backlog/memoire-v2-comprehension-graphify.md` (la vision fiches vivantes recoupe le sujet)
- `packages/memory/src/promote-candidates.ts` (le routage, lui, est neutre : il lit la décision, il ne la fabrique pas)
