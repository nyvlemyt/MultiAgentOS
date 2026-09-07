# Classifieur — faux positifs sur les documents de cours

> Constaté le 2026-09-04 en promouvant les 51 candidats classés (P1-8, PR #77).
> Statut : **à traiter**. Bloque la crédibilité des registres, pas leur mécanique.

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

## Piste (à trancher en session dédiée)

1. **Porte d'entrée par provenance** : un candidat `untrusted` issu du convoyeur ne passe pas par la
   table mots-clés de mission. Il abstient par défaut → triage humain, ou passe par une table
   dédiée aux ressources. C'est un `if` sur un champ déjà rempli, pas un nouveau modèle.
2. **Registre `resources`** plutôt que de forcer les 5 registres de mission : un cours n'est ni une
   décision, ni un blocage, ni un apprentissage de mission. Le miroir études (P1-14) joue déjà ce
   rôle côté retrieval ; les registres n'ont peut-être simplement pas à recevoir de l'ingéré.
3. **Ne rien changer aux 5 règles de mission** : elles sont correctes *dans leur domaine*. Le défaut
   est l'absence de frontière, pas le contenu de la table.

## Rollback des 51, si Melvyn veut repartir de zéro

```bash
sqlite3 data/mas.db "update memory_candidates set status='pending' where status='accepted';"
rm data/memory/_global/{learnings,blockers,evals}.md
pnpm --filter @mas/memory seed && qmd update && qmd embed
```

## À relire avec

- `docs/decisions/0004-memory-intake-and-auto-capture.md` §5 (déterministe d'abord)
- `docs/backlog/memoire-v2-comprehension-graphify.md` (la vision fiches vivantes recoupe le sujet)
- `packages/memory/src/promote-candidates.ts` (le routage, lui, est neutre : il lit la décision, il ne la fabrique pas)
