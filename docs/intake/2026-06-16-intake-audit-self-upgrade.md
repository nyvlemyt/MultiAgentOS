# Intake — Patterns d'audit/sanitisation ECC → upgrade du skill `intake-audit`

- **Date** : 2026-06-16
- **Slug** : intake-audit-self-upgrade
- **Auditeur** : Doer B2 (campagne ECC Harvest)
- **Type** : pattern(s) (pas un repo à installer — on extrait la *lentille*, pas le code)
- **Cible d'intégration** : `.claude/skills/intake-audit/SKILL.md` (notre skill, pré-existant)

> Méta-note : cet audit applique le process intake-audit **à lui-même**. C'est la
> tâche racine de la campagne — chaque audit de keeper en aval hérite de ses
> garde-fous. Un audit incapable de dire `reject` est cassé : je justifie chaque
> adoption et je liste explicitement ce que je NE prends PAS (§ Ce que je rejette).

---

## Étape 0 — Guardrails (CLAUDE.md §5/§8/§11/§12/§13)

| Garde-fou | Statut pour les patterns ECC visés |
|---|---|
| Local-first, subscription-only (§11) | OK — patterns purement prose/regex, aucun appel LLM, aucun PAYG. |
| Memory Keeper seul rédacteur (§8) | OK — ces patterns régissent l'audit *avant* mémoire, n'écrivent jamais dans `data/memory/`. |
| ≤7 tools/agent | N/A — c'est un skill (savoir injectable), pas un agent. |
| Risky actions gated (§5) | RENFORCÉ — les patterns ajoutent une couche de défiance vis-à-vis du code étranger. |
| Pas de framework sans ADR | OK — zéro dépendance ajoutée, on distille des patterns en prose. |

Aucune violation. Décision plancher possible : `adapt_now` (jamais `implement_now` brut,
car les sources ECC ciblent le *fork open-source* — domaine voisin, pas identique).

---

## Étape 1 — Identité

**Ce que c'est** : trois patterns issus de la base ECC (affaan-m/ecc), inspectés en
read-only dans `/tmp/ecc-inspect/` :

- `agents/opensource-sanitizer.md` — auditeur **indépendant** « never trust the
  forker's work », re-scan secrets/PII/refs internes via 20+ regex, read-only, verdict
  PASS/FAIL/PASS-WITH-WARNINGS. Porte aussi un en-tête **Prompt Defense Baseline**
  (6 règles anti-injection réutilisables).
- `skills/opensource-pipeline/SKILL.md` — pipeline 3 étages (forker → sanitizer →
  packager) où le sanitizer est la **safety gate** non contournable.
- `skills/production-audit/SKILL.md` — **réécriture maintainer-safe** d'une idée
  communautaire périmée : garde la lentille « production-readiness », retire
  l'exécution distante non-épinglée (`npx <pkg>@latest`) et l'égress de données vers
  un service d'audit tiers.

- **Source** : affaan-m/ecc (270 skills / 67 agents), campagne `docs/intake/2026-06-16-ecc-harvest/`.
- **Signal de récence** : snapshot Jun 2026 ; patterns stables (regex + prose, pas de SDK).
- **Obsolescence** : faible (regex de secrets à rafraîchir au fil des nouveaux formats de tokens).

---

## Étape 2 — Fit

**Ce que ça améliore concrètement** : notre `intake-audit` décide d'adopter du code
étranger (skills/agents/repos) mais n'avait **aucune passe de vérification
indépendante** ni de doctrine de durcissement à l'adoption. Les 3 patterns comblent
exactement ce trou, fichier par fichier :

| Pattern ECC | Trou comblé dans `intake-audit` | Surface touchée |
|---|---|---|
| sanitizer « never trust » + regex | Sous-étape **Sanitize** dans le Process | Process step 4-bis |
| Prompt Defense Baseline | En-tête anti-injection sur tout agent/skill adopté | sortie d'adoption (step 8) |
| production-audit maintainer-safe | Défaut d'adaptation : retirer exec/égress, garder la lentille | step 8 (Appropriation) |

**Doublon ?** Partiel et complémentaire : `mas-sec-reviewer` existe déjà comme gate
runtime (§5), mais il opère **à l'exécution** sur des actions risquées. La passe
Sanitize opère **à l'ingestion build-time** sur le contenu importé. Ce n'est pas un
doublon — c'est un étage amont. Je relie les deux explicitement (la Sanitize ne
remplace pas le sec-reviewer ; elle le précède).

---

## Étape 3 — Trois coûts

- **Install** : faible. ~80 lignes de prose ajoutées à un skill existant, zéro dépendance,
  zéro token runtime supplémentaire (le skill est chargé L2 seulement à l'activation).
- **Maintenance** : faible-moyen. Les regex secrets/PII dérivent (nouveaux formats de
  tokens GitHub/cloud). Propriétaire : auteur du skill ; re-audit à 6 mois.
- **Removal** : facile (réversible). Tout est additif à l'intérieur d'un seul fichier ;
  retirer = supprimer les sous-sections ajoutées. Aucune racine systémique.

---

## Étape 4 — Score 7 axes (0–5)

| Axe | Score | Justification |
|---|---|---|
| project_fit | 5 | Comble le trou exact : défiance + durcissement à l'ingestion de code étranger. |
| token_efficiency | 4 | Prose L2, chargée à l'activation seulement ; le summary L1 reste ≤200 tokens. |
| safety | 5 | Augmente directement la posture sécu (§5) : re-scan + baseline anti-injection. |
| implementation_effort | 5 | Édition d'un fichier existant, additive, non cassante. |
| evidence_maturity | 3 | Patterns ECC matures mais conçus pour le fork OSS, pas l'intake MAS — d'où adapt. |
| user_value | 5 | Tâche racine : chaque audit de la campagne en dépend. |
| phase_compatibility | 5 | Campagne ECC en cours ; pré-requis explicite avant tout audit keeper. |

---

## Étape 5 — KILL criteria (veto — l'audit DOIT pouvoir dire reject)

- Paid API key / PAYG → reject. **Vérifié** : aucun. Les patterns sont prose+regex.
- Exécute du code sans audit → blocked jusqu'à sec-review. **N/A** : on n'importe pas
  de code exécutable ; on distille de la prose. (C'est précisément ce que le pattern
  production-audit nous apprend à exiger des *autres* imports.)
- Touche email/finance/payment/secrets/deploy → Security Reviewer d'abord. **N/A**.
- Framework lourd → extraire le principe seulement. **APPLIQUÉ** : on n'installe PAS
  les agents ECC forker/sanitizer/packager ni le pipeline `/opensource` ; on extrait
  la lentille.
- Hors phase → backlog_next. **N/A** : en phase.
- Évidence faible → watch. **N/A** : évidence suffisante (patterns lisibles, testés en OSS).

**Verdict du veto** : aucun couperet déclenché. L'adoption est sûre EN TANT QUE
patterns adaptés, pas en tant qu'import direct.

---

## Étape 6 — Décision

**`adapt_now`** (pas `implement_now`).

Justification (≤4 lignes) : les patterns visent le *fork open-source* (domaine
voisin) ; importés bruts ils introduiraient un pipeline `/opensource` + 3 agents hors
scope MAS. On garde la **lentille** (défiance indépendante, regex de sanitisation,
durcissement anti-injection, réécriture maintainer-safe) et on l'encode dans notre
`intake-audit` existant — conforme au Principe 4 (garder le principe, rejeter
l'implémentation lourde) et à la doctrine knowledge « fabriquer > importer »
(`skills-reference.md` §Règle absolue).

---

## Étape 7 — Appropriation (la version MultiAgentOS)

1. **Sous-étape « Sanitize »** dans le Process : passe de vérification indépendante
   sur tout contenu importé (re-scan secrets/PII/refs internes via regex, principe
   « never trust the previous stage »). C'est l'esprit du sanitizer, **réduit** à ce
   dont l'intake a besoin (pas de git-history audit complet ni de `.env.example`
   completeness — hors scope ; on importe des patterns, pas des repos forkés).
2. **« Prompt Defense Baseline »** : en-tête de durcissement anti-injection standard,
   appliqué à TOUT agent/skill adopté. Bloc boilerplate réutilisable copié (texte
   exact) dans le body.
3. **« Réécriture maintainer-safe » comme défaut d'adaptation** : à l'adoption,
   retirer l'exécution externe non-épinglée + l'égress de données tierces, garder la
   lentille. C'est exactement ce que production-audit a fait à son ancêtre communautaire.
4. **Barre LARGE + tiers d'effort T0/T1/T2** dans l'enum de décision : pour
   l'application cohérente en batch (campagne ECC). Barre large = garder tout item
   non-dup-pas-mieux, non-stub, performant, à valeur dans son domaine ; rejeter
   seulement dup-pas-mieux / stub / unsafe (PAYG/secrets = auto-reject §11).
   T0=reject · T1=core deep · T2=arsenal deep (priorité de batch, pas niveau d'effort —
   tout est deep-boosté).

**Comment rendre ça moins cher** : prose en L2 uniquement (jamais dans le summary L1
injecté à chaud) ; regex déterministes (pas d'appel LLM pour scanner) ; la Sanitize
ne tourne que pour les items `kind ∈ {repo, course, skill, agent}` apportant du
contenu étranger, pas pour une simple idée/principe.

---

## Étape 8 — Plan d'intégration

- **Phase cible** : campagne ECC Harvest (maintenant — pré-requis racine).
- **Fichiers** : `.claude/skills/intake-audit/SKILL.md` (seul).
- **Agents/skills touchés** : aucun nouveau ; relie à `mas-sec-reviewer` (gate runtime aval).
- **Budget tokens** : nul au runtime (skill statique).
- **DoD binaire** :
  - [ ] Les 5 sections §12 toujours présentes (Principles/Process/Rationalizations/RedFlags/VerificationCriteria).
  - [ ] Sous-étape Sanitize ajoutée au Process, citant la source ECC en commentaire.
  - [ ] Bloc Prompt Defense Baseline présent (texte exact) + source citée.
  - [ ] Défaut « maintainer-safe rewrite » dans l'Appropriation.
  - [ ] Barre large + tiers T0/T1/T2 dans la decision-enum.
  - [ ] Summary L1 ≤ ~200 tokens (≤ ~150 mots).
  - [ ] KILL criteria intacts (l'audit peut toujours dire reject).
  - [ ] `grep '@anthropic-ai/sdk'` dans le dossier du skill → vide.
- **Validation humaine** : risk faible (édition de prose d'un skill) ; pas de gate
  humain requis, mais relecture commander recommandée vu le rôle racine.

---

## Ce que je REJETTE explicitement (preuve que l'audit peut dire non)

- **Les 3 agents ECC** (`opensource-forker`, `opensource-sanitizer`,
  `opensource-packager`) en tant que fiches : hors scope MAS (fork OSS, pas intake).
- **Le skill `opensource-pipeline`** et ses commandes `/opensource` : pipeline de
  publication GitHub — sans rapport avec notre lifecycle de mission.
- **Le git-history audit complet + `.env.example` completeness** du sanitizer :
  utiles pour un repo forké, surdimensionnés pour l'ingestion d'un pattern.
- **Le `gh repo create --public --push`** (étape 7 du pipeline) : action réseau
  sortante destructive-adjacent — serait de toute façon `risk: high` chez nous (§5).
- **Le système de scoring 0-100 + bands** de production-audit : on garde déjà notre
  scoring 7-axes 0-5 ; importer un second barème = doublon, pas mieux → reject.

---

## Étape 9 — Re-audit

- **Date** : 2026-12-16 (6 mois) — ou condition : rafraîchir les regex Sanitize dès
  qu'un nouveau format de secret/token large (cloud/CI) devient courant.
