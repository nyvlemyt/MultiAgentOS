# Sonar — le résidu de duplication de la PR #82 est dans path-guard.test.ts, pas dans les suites dispatch

> **Statut (2026-09-25)** : ouvert. Correctif mécanique (~10 lignes), à faire sur `feat/path-guard-s5` tant que la PR #82 est ouverte, sinon sur `main`.

## Le fait, mesuré

Après la PR #82 (portique §5 chemin), Sonar affichait **2,97 %** de lignes dupliquées sur le code neuf (27 / 910), juste sous le seuil de 3 % du quality gate. La description de la PR attribuait ce résidu aux trois copies non converties du harnais de test (`dispatch.test.ts`, `dispatch-chaining.test.ts`, `dispatch-tick.test.ts`). L'API dit autre chose :

- `api/measures/component_tree?component=nyvlemyt_MultiAgentOS2&pullRequest=82&metricKeys=new_duplicated_lines,new_duplicated_blocks&qualifiers=FIL` → un seul fichier porteur : `packages/core/src/path-guard.test.ts` (27 lignes, 2 blocs).
- `api/duplications/show?key=nyvlemyt_MultiAgentOS2:packages/core/src/path-guard.test.ts&pullRequest=82` → blocs **131-153** et **135-157** : le fichier est dupliqué avec lui-même, décalé d'un cas.

Cause : six `it()` d'une ligne consécutifs (`unquotes a C-quoted path…`, `decodes git octal escapes…`, `unescapes \t and \n…`, `strips a GNU-diff tab timestamp…`, `handles --no-prefix headers`, `covers a binary change…`), tous de la forme `it(LITERAL, () => { expect(diffTargetPaths(LITERAL)).toEqual([LITERAL]); })`. Le détecteur de copier-coller de Sonar anonymise les littéraux de chaîne : six formes identiques d'affilée dépassent son bloc minimal.

La conversion des trois suites vers `useDispatchHarness` (PR suivante) reste utile — les copies étaient réelles — mais **ne change pas ce chiffre**.

## Correctif

Replier les six cas en une table `it.each([{ name, diff, expected }])('%s', …)` — mêmes diffs d'entrée, mêmes tableaux attendus, mêmes noms de cas ; ne rien toucher d'autre dans le fichier. Vérifier ensuite `new_duplicated_lines` de la PR via `api/measures/component?component=nyvlemyt_MultiAgentOS2&pullRequest=<pr>&metricKeys=new_duplicated_lines,new_duplicated_lines_density` → attendu 0.

## Règle à retenir

Avant de « corriger la duplication », lister les blocs exacts par l'API (`component_tree` puis `duplications/show`). Une ressemblance visuelle entre helpers n'est pas un bloc CPD ; une suite de cas de test d'une ligne de même forme, si.
