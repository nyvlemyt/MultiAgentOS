# Verdict de vérification indépendante — PR #65 (explain-diff) & PR #66 (garde-fous God-file)

Session du 2026-08-01, worktree `stoic-archimedes-114bea`. Aucune affirmation de la session
précédente n'a été reprise sur parole : chaque point est prouvé ou réfuté par une commande et
sa sortie. Tout ce qui suit a été exécuté dans cette session.

## Tableau de bord

| # | Point vérifié | Verdict | Note |
|---|---------------|---------|------|
| 1 | Hook 800 lignes vivant (MAOS) | **PROUVÉ** | refus réel du Write ET de l'Edit ; .md 900 lignes et petit .ts passent |
| 2 | Sonar 5ᵉ check sur #65 / #66 | **RÉFUTÉ puis corrigé → PROUVÉ** | #66 avait **4 issues ouvertes** malgré un gate vert |
| 3 | Portique `check-explanation.sh` | **PROUVÉ** | sort 1 en nommant exactement mes 4 défauts plantés ; sort 0 sur la vraie page |
| 4 | La page dit-elle vrai ? | **PROUVÉ (3/3)** | les 3 affirmations vérifiées par exécution, + 8 faits annexes recoupés |
| 5 | Les 4 checks locaux, refaits | **PROUVÉ** | 4/4 verts sur les deux branches, ligne « PASS: 335 source files » présente |
| 6 | OtakuGO (hook + plancher CI) | **PROUVÉ, avec 1 bug trouvé et corrigé** | exception `30_functions.sql` silencieusement inerte |

**Deux défauts réels trouvés et corrigés pendant cette session** (détail §2 et §6.4) :

1. PR #66 n'était pas Sonar-clean (4 code smells shell) — le gate vert masquait le problème,
   exactement le cas d'usage pour lequel CLAUDE.md §7 impose `sonar-pr-issues.sh` en plus du gate.
2. Les globs d'exception des deux hooks n'étaient pas ancrés : le harness passe un chemin
   **absolu**, donc `.claude/skills/*/scripts/*` (MAOS) et `supabase/schemas/30_functions.sql`
   (OtakuGO) ne matchaient jamais → un fichier explicitement en liste blanche aurait été refusé.

---

## 1. Le hook est-il vivant ? — PROUVÉ

### 1.1 Premier essai : non bloqué, et pourquoi

Ce worktree était sur `claude/verification-multiagent-os-2be365` = `fd68ba4` (pointe de `main`),
donc **avant** #66 : son `.claude/settings.json` n'a aucun bloc `PreToolUse`. Le Write de
`/tmp/test-limite.ts` (900 lignes) a donc réussi. Diagnostic demandé, exécuté :

```
$ wc -l < /tmp/test-limite.ts        →  900
$ command -v jq                      →  /usr/bin/jq            (jq présent)
$ ls .claude/hooks/limit-file-size.sh → No such file or directory  (branche non checkoutée ici)
$ jq '.hooks.PreToolUse // "ABSENT"' .claude/settings.json → "ABSENT"
$ git ls-tree chore/god-file-guardrails .claude/hooks/limit-file-size.sh
  100755 blob 01b4ae7…    (bit exécutable présent côté git ; de toute façon lancé via `bash`)
```

Cause : ni chmod, ni jq, ni chemin — simplement la branche non présente dans ce worktree.

### 1.2 Rendu vivant, puis re-testé — le hook refuse

```
$ git checkout chore/god-file-guardrails -- .claude/settings.json .claude/hooks/limit-file-size.sh
```

Découverte utile : **Claude Code relit `settings.json` en cours de session** — pas besoin de
redémarrer. Les deux chemins d'écriture ont été testés via les vrais outils :

| Outil | Cible | Résultat |
|-------|-------|----------|
| `Edit` | `/tmp/test-limite.ts` (900 l. sur disque) | **refusé** |
| `Write` | `/tmp/test-limite.ts`, contenu 900 lignes | **refusé** |
| `Write` | `/tmp/test-petit.ts` (3 lignes) | créé |
| `Edit` | `/tmp/test-limite-doc.md` (900 lignes) | modifié |

Message de refus, mot pour mot :

```
Refuse: /tmp/test-limite.ts would reach 900 lines; the project cap is 800 (CLAUDE.md §7).
Split it into modules with one responsibility each, then retry. Same cap is enforced in CI by
scripts/check-max-lines.sh, so raising it here does not help.
```

Le plafond 800 et `CLAUDE.md §7` sont bien cités, comme attendu.

### 1.3 Matrice complète (contrat stdin réel du hook, `scratchpad/hook-probe.sh`)

| lignes | fichier | décision |
|--------|---------|----------|
| 900 | `/tmp/test-limite.ts` | DENY |
| 900 | `/tmp/doc.md` | ALLOW |
| **800** | `…/x.ts` | **ALLOW** (borne exacte) |
| **801** | `…/x.ts` | **DENY** |
| 900 | `…/packages/agents/src/dispatch.ts` | ALLOW (exception documentée) |
| 900 | `…/packages/agents/src/other.ts` | DENY |
| 900 | `…/packages/skills/library/big.ts` | ALLOW (généré) |
| 900 | `…/data/cache/big.ts` | ALLOW (état) |
| 900 | `/tmp/x.py` | DENY |
| 900 | `/tmp/x.dart` | ALLOW (Dart hors périmètre côté MAOS — normal) |

Constat annexe : `dispatch.ts` fait **821 lignes** sur `main` aujourd'hui (`awk 'END{print NR}'`),
donc l'exception n'est pas décorative — sans elle, `pnpm lint` échouerait. La carte
`docs/backlog/dispatch-ts-god-file.md` reste due.

---

## 2. Sonar, 5ᵉ check — RÉFUTÉ sur #66, corrigé, re-prouvé

### 2.1 État initial

```
$ bash scripts/sonar-pr-issues.sh 65
PR #65: 0 open issue(s), 0 to-review hotspot(s).   SONAR CLEAN.   exit=0

$ bash scripts/sonar-pr-issues.sh 66
  [MAJOR   ] CODE_SMELL  shelldre:S7688   scripts/check-max-lines.sh:11   Use '[[' instead of '['…
  [CRITICAL] CODE_SMELL  shelldre:S131    scripts/check-max-lines.sh:12   Add a default case (*)…
  [MAJOR   ] CODE_SMELL  shelldre:S7688   scripts/check-max-lines.sh:18
  [MAJOR   ] CODE_SMELL  shelldre:S7688   scripts/check-max-lines.sh:24
PR #66: 4 open issue(s), 0 to-review hotspot(s).   SONAR NOT CLEAN.   exit=1
```

Le gate était pourtant `OK` sur les deux PR — c'est précisément le piège que CLAUDE.md §7
décrit. L'annonce « 5/5 vert » de la session précédente était donc **fausse pour #66**.

Concordance des sha vérifiée avant de conclure (`api/project_pull_requests/list`) :
`#65 → cd6068e6…` = HEAD, `#66 → 70fd8e99…` = HEAD. L'analyse portait bien sur le bon commit.

### 2.2 Corrections poussées

- `821b918` — `[[ ]]` aux 3 endroits + cas `*)` par défaut dans `check-max-lines.sh`.
- `4d70f3a` — ancrage des globs d'exception du hook (voir §6.4, même classe de bug).

Comportement inchangé, re-prouvé : `PASS: 335 source files under the 800-line cap` et, avec
`MAX_LINES=200`, sortie 1 avec la liste des fautifs (le script sait donc encore échouer).

### 2.3 État final

```
$ # sha analysée == HEAD ?
poll 1: analysed=4d70f3a (HEAD=4d70f3a)   SHA MATCH
$ bash scripts/sonar-pr-issues.sh 66
PR #66: 0 open issue(s), 0 to-review hotspot(s).   SONAR CLEAN.   exit=0
$ curl …/qualitygates/project_status?…&pullRequest=66   →  gate: OK
$ gh pr view 66 …  →  changes SUCCESS · build-test SUCCESS · SonarCloud SUCCESS
$ bash scripts/sonar-pr-issues.sh 65  →  exit=0  ·  gate OK  ·  sha cd6068e6 == HEAD
```

Observation à garder : **SonarCloud n'analyse pas `.claude/`**. Le hook
`limit-file-size.sh` échappe donc au lint Sonar — ses défauts ne peuvent être trouvés qu'à la
main (c'est comme ça que celui du §6.4 est sorti).

---

## 3. Le portique explain-diff fait-il son travail ? — PROUVÉ

Branche `feat/explain-diff-skill` checkoutée. J'ai écrit **ma propre** page non conforme
(`scratchpad/data/explanations/2026-08-01-explanation-fixture-nonconforme.html`), sans lire de
fixture existante, avec 4 défauts plantés : 4 questions au lieu de 5 · une option sans
`data-feedback` · un `<link>` vers un CDN · un schéma en caractères de dessin de boîtes.

```
$ bash .claude/skills/explain-diff/scripts/check-explanation.sh <ma-page>
  ✗ page loads a remote resource (src=/<link>/@import/url()) — must be self-contained
  ✗ box-drawing characters found — diagrams must be HTML/CSS or inline SVG, not ASCII art
  ✗ quiz must have exactly 5 questions (found 4)
  ✗ q2: 2 data-feedback value(s) for 3 options — every option needs one
FAIL — 4 check(s) failed
EXIT=1
```

Les 4 défauts, tous nommés, **aucun faux positif** sur les 13 autres contrôles. Puis sur la
vraie page :

```
$ bash …/check-explanation.sh data/explanations/2026-07-31-explanation-pr-45-arsenal-slug-fix.html
  17 contrôles ✓ (dont : 5 questions, 1 seule bonne réponse par question, feedback partout,
  0 chargement réseau, ancres toutes résolues, data-base-sha + data-head-sha, « Not covered »)
PASS — deliverable
EXIT=0
```

---

## 4. La page dit-elle vrai ? — PROUVÉ (3 affirmations sur 3)

Méthode : lecture du diff réel de `39794b8` (parent confirmé `c200b944`), puis **exécution**.
J'ai matérialisé la version **pré-fix** de `select.ts` (`git show c200b944:…`) à côté de la
version actuelle et fait tourner les deux sur le même faux routeur et le même faux retrieveur
(fichier de test jetable, supprimé après coup).

```
$ pnpm --filter @mas/skills exec vitest run src/verif-pr45.test.ts
pre-fix  : skill-a, skill-b, skill-c, sec-19
post-fix : sec-19, skill-a, skill-b, skill-c
agent stub hit -> skill-a, skill-b, skill-c, sec-19
fused order: sec-19 > skill-a > skill-b > skill-c
score rank0 = 1/(60+0) = 0.016666666666666666
score rank1 = 1/(60+1) = 0.01639344262295082
'sec-19'.localeCompare('skill-a') = -1
Test Files 1 passed · Tests 4 passed
```

**(a) `known.get(hit.id)` ne matchait jamais — VRAI.** Avec l'identifiant réellement émis en
production (`mas-arsenal/skill/sec-19.md`), le code pré-fix rend l'ordre purement lexical
(`sec-19` dernier : la fusion n'a jamais eu lieu) ; le code post-fix le place premier. Et la
recherche brute confirme la cause : `known.get('mas-arsenal/skill/sec-19.md')` → `undefined`,
`known.get('sec-19')` → défini. La forme de l'identifiant est bien celle-là :
`retriever.ts:261` construit `` `${collection}/${rest}` `` et `data/arsenal-index/` contient
`skill/`, `agent/`, `rule/`, `command/` (877 stubs dans `skill/`).

**(b) `normalizeArsenalHitId` rend `undefined` pour un stub agent — VRAI.** Prouvé par le
comportement, pas par lecture : un hit `mas-arsenal/agent/sec-19.md` dont le slug **collisionne**
avec une vraie compétence `sec-19` donne un résultat identique au run sans retrieveur
(`skill-a, skill-b, skill-c, sec-19`) ; idem pour `rule` et `command` ; le contrôle
`mas-arsenal/skill/sec-19.md` fait bien remonter `sec-19`. La garde anti-collision tient.

**(c) `rrfFuse` place `sec-19` en premier — VRAI.** Ordre obtenu :
`sec-19 > skill-a > skill-b > skill-c`. Égalité à `1/(60+0) = 1/60` (rang 0-based, `rrf.ts:18`),
tranchée par `localeCompare` → `-1`, donc `sec-19` avant `skill-a`. La page dit « e avant k » :
exact.

**Faits annexes recoupés, tous exacts** : `2 files changed +48 −3` (= `git show --stat`) ·
`DEFAULT_K = 15`, `DEFAULT_N = 5` · « 0 changement de comportement sans retrieveur » (chemin
`semanticOrder.length > 0 ? rrfFuse(…) : tagOrder`) · `select.ts:144-157` et `:175-185`
(fonction ligne 154, réécriture 178-181) · `select.test.ts:164-188` (les 2 tests ajoutés y sont) ·
`arsenalRetrieverFor()` bien à `mission-llm.ts:92-115` · « le test pré-existant passait un slug
nu » (`select.test.ts:154` avant #45 : `id: 'sec-19'`) · « ~877 » = 877 stubs exactement.

**Aucune affirmation fausse ou non vérifiable trouvée.** La section « Not covered » est honnête
et ne cache pas de trou (elle signale même explicitement la question « un autre consommateur
partage-t-il la même hypothèse de forme d'identifiant ? », non traitée).

---

## 5. Les 4 checks locaux, refaits par moi — PROUVÉ

| Branche / commit | `pnpm -r test` | `pnpm lint` | `pnpm build` | `smoke` |
|---|---|---|---|---|
| `feat/explain-diff-skill` `cd6068e` | 0 | 0 | 0 | 0 (32 passed) |
| `chore/god-file-guardrails` `821b918` | 0 | 0 | 0 | 0 (32 passed) |
| `chore/god-file-guardrails` `4d70f3a` (final) | 0 | 0 | 0 | 0 (32 passed) |

Détail des tests sur la branche garde-fous : `core 114 · db 34 · skills 38 · memory 120 ·
agents 228 · worker 8 · web 147` — 7 paquets, 0 échec.

Ligne exigée, présente **sur la branche #66 uniquement** (c'est #66 qui ajoute le script à
`pnpm lint`) :

```
PASS: 335 source files under the 800-line cap (§7 God-file guard)
```

Sur `feat/explain-diff-skill` la ligne est absente, et c'est normal : cette branche ne modifie
pas `package.json`. À noter pour l'ordre de merge — la ligne n'apparaîtra partout qu'après #66.

---

## 6. OtakuGO_UP — PROUVÉ, avec un bug trouvé et corrigé

### 6.1 Plancher CI local

```
$ cd /Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP && bash scripts/check-max-lines.sh
PASS: 339 source files under the 800-line cap (God-file guard)
exit=0
```

Les exceptions y sont écrites en **relatif**, ce qui est correct : la source est
`git ls-files`, qui produit des chemins relatifs.

### 6.2 Hook vivant sur un `.dart` de 900 lignes

Limite honnête d'abord : je ne peux pas démarrer une session Claude Code dans un autre dépôt
depuis ici. J'ai donc fait mieux que de la lecture — j'ai enregistré **le script d'OtakuGO**
(chemin absolu) dans le `settings.json` de cette session et déclenché une vraie écriture par
l'outil. Le refus vient donc bien du harness, en exécutant leur script :

```
Refuse: /tmp/otakugo-probe/lib/features/x/big_widget.dart would reach 900 lines; the project
cap is 800 (docs/decisions/file-size-guard.md). Split it into units with one responsibility
each — for Flutter, one widget or one controller per file — then retry. The same cap runs in
CI, so working around this hook does not help.
```

Négatifs vérifiés : `small_widget.dart` (3 lignes) créé ; `.md` de 900 lignes modifié sans
blocage. L'ADR citée existe (`docs/decisions/file-size-guard.md`, 4217 octets).

L'enregistrement dans le `settings.json` d'OtakuGO lui-même est vérifié statiquement : même
schéma exact (`PreToolUse` / `matcher: "Write|Edit"` / `bash "$CLAUDE_PROJECT_DIR/…"`) que
celui prouvé vivant en §1.2, hook `-rwxr-xr-x`, `jq .` valide.

### 6.3 `settings.json` valide et permissions intactes

```
$ jq . .claude/settings.json > /dev/null  →  VALID
```

Les 2 règles `permissions.allow` sont présentes (`Bash(supabase db push:*)`,
`Bash(git remote set-url origin https://github.com/Reseau-Social-Anime/*)`) et
`.claude/settings.local.json` (1 permission) n'a pas été touché — mtime `2026-07-20 03:48`,
contre `2026-07-31 20:45` pour `settings.json`.

Réserve à connaître : `.claude/` **n'a jamais été suivi par git** dans OtakuGO
(`git log -- .claude` vide, et non ignoré). Il n'existe donc **aucune référence git** pour
differ l'avant/après : je peux affirmer que les permissions actuelles sont valides et
cohérentes, pas qu'aucune ligne n'a disparu. Le seul témoin est le fichier `settings.local.json`
intact.

### 6.4 Bug trouvé : une exception silencieusement inerte

Le harness passe **toujours** un chemin absolu. Or l'exception héritée était écrite en relatif :

```
$ hook-probe  supabase/schemas/30_functions.sql (2264 lignes, en liste blanche)  →  DENY  ✗
```

Autrement dit, toute édition de ce fichier légitimement whitelisté aurait été refusée. Même
classe de bug côté MAOS avec `.claude/skills/*/scripts/*`. Corrigé des deux côtés en ancrant
les motifs avec `*/` (+ cas `*)` explicite) :

| après correction | MAOS | OtakuGO |
|---|---|---|
| chemin whitelisté, 900 l. | ALLOW ✓ | ALLOW ✓ |
| source ordinaire, 900 l. | DENY ✓ | DENY ✓ |
| source ordinaire, 800 l. | ALLOW ✓ | ALLOW ✓ |
| `.md`, 900 l. | ALLOW ✓ | ALLOW ✓ |

Côté MAOS c'est poussé (`4d70f3a`, PR #66, 5/5 re-vérifié). Côté OtakuGO le fichier est modifié
**mais non committé** — voir la proposition ci-dessous.

### 6.5 Step CI

```
$ git diff .github/workflows/ci.yml
@@ -28,6 +28,8 @@
       - name: Check tracked files and migration log
         run: ./tool/check_repository_hygiene.sh
+      - name: God-file guard (file size cap)
+        run: bash scripts/check-max-lines.sh
```

Ligne 31 du fichier, dans le job `repository-hygiene` / `name: Repository / Hygiene` (ligne 21),
juste après le step d'hygiène existant. C'est le seul changement du fichier.

### 6.6 Commit dédié proposé — À VALIDER PAR TOI, rien n'est committé

Exactement 5 chemins, tous des artefacts du garde-fou :

```bash
cd /Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP
git add .claude/settings.json .claude/hooks/limit-file-size.sh scripts/check-max-lines.sh .github/workflows/ci.yml docs/decisions/file-size-guard.md
git commit -m "chore(guards): enforce the 800-line file cap in hook + CI"
```

Restent volontairement dehors : `docs/missions/_state/*`, `docs/missions/_reports/OP-01-rapport.md`,
`.claude/inbox/*`, `.claude/agents/*`, `.claude/commands/*`, `.claude/skills/*`,
`.claude/workflows/*`, `.claude/*.log`.

Deux décisions qui t'appartiennent :

1. **`.claude/settings.json` n'a jamais été committé** dans OtakuGO. Le committer partage
   l'enregistrement du hook (sans quoi le garde-fou ne suit pas le dépôt) mais publie aussi les
   2 règles `permissions.allow`. `settings.local.json` reste dehors, comme il faut.
2. Le reste de `.claude/` (agents, commands, skills, inbox, logs) est **entièrement non suivi**.
   Ça mérite sa propre décision — probablement `.gitignore` pour `inbox/`, `*.log` et
   `worktrees/`, et un commit séparé pour agents/commands/skills.

---

## Ce que cette session a changé

| Dépôt | Fichier | Commit |
|---|---|---|
| MAOS | `scripts/check-max-lines.sh` (`[[ ]]` + cas par défaut) | `821b918`, poussé |
| MAOS | `.claude/hooks/limit-file-size.sh` (globs ancrés) | `4d70f3a`, poussé |
| MAOS | ce verdict | committé sur `claude/verification-multiagent-os-2be365` |
| OtakuGO | `.claude/hooks/limit-file-size.sh` (glob `30_functions.sql` ancré) | **non committé**, en attente §6.6 |

État final des PR : **#65 → 5/5 vert** (`cd6068e`) · **#66 → 5/5 vert** (`4d70f3a`), sha analysée
par Sonar identique au HEAD dans les deux cas.

## Leçons à porter

1. **Un gate vert ne vaut pas un check Sonar.** #66 l'a démontré : gate `OK`, 4 issues ouvertes.
   `sonar-pr-issues.sh` doit sortir 0 — et il faut vérifier que la sha analysée est bien le HEAD
   avant de conclure quoi que ce soit.
2. **`.claude/` échappe à Sonar.** Tout script de hook est du code non lint-é : il a besoin d'un
   test manuel de sa matrice de décision, sinon un glob mort passe inaperçu.
3. **Un glob d'exception s'écrit en absolu** dans un hook (`*/…`) et en relatif dans un scan
   `git ls-files`. Les deux étages du même garde-fou n'ont pas la même convention de chemin.
4. **Claude Code relit `settings.json` en cours de session** : un hook peut être testé sans
   redémarrer, ce qui rend ce genre de vérification bien moins coûteux qu'attendu.
