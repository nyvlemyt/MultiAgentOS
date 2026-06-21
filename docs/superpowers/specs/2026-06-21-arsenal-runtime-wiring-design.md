# Spec — Câblage de l'arsenal froid dans le runtime (moteur A domaine-scopé + agent pilote)

- **Date** : 2026-06-21
- **Branche** : `phase/ecc-harvest` (worktree `maos-ecc`), PR #32 DRAFT
- **Statut** : Approuvé (brainstorm commander 2026-06-21)
- **Périmètre** : A (moteur de sélection domaine-scopé) + 1 agent domaine pilote (Sécurité défensive). B élargi (autres agents domaine) = cycle suivant.

## Problème (pourquoi)

La campagne ECC a produit **877 skills** (`packages/skills/library/`) + **32 fiches d'agents** (`packages/agents/library/`), indexés en `index.json` (L1, lisible router, gitignored). **Mais le runtime ne les consomme pas** :

1. `getSkillRouter()` ([dispatch.ts:91](../../../packages/agents/src/dispatch.ts#L91)) construit le `SkillRouter` depuis `scanOrchestratorSkills` **seulement** → `loadLibraryIndex` (877) n'entre jamais dans le router.
2. La sélection de skills par tâche est `mockSkillRouter` ([dispatch.ts:216](../../../packages/agents/src/dispatch.ts#L216)) — un mock, pas un vrai matching tâche→skill.
3. Les 32 fiches d'agents (`loadAgentLibraryIndex`) ne sont pas consultées ; dispatch n'utilise que `TIER_B_DELEGATION_MAP` (8 agents hardcodés).

Conséquence : **l'arsenal est inerte**. Ce cycle le rend vivant pour les skills (A) et le prouve via un agent domaine pilote (B).

## Modèle cible (le concept commander)

> Des agents **légers** (pas de sac de skills fixe) qui, à chaque tâche, **piochent dynamiquement les meilleurs skills de LEUR domaine**.

Un agent porte un **scope de domaine** ; pour chaque tâche reçue, le moteur sélectionne les meilleurs skills **dans ce scope**, et injecte leurs résumés L1 dans le prompt d'exécution. La promotion vers `.claude/skills/` reste **manuelle** (ADR 0005) — la sélection injecte des résumés, ne copie rien.

## Architecture

### Faits du code (confirmés, à réutiliser — ne pas réinventer)
- `SkillMeta` (`packages/skills/src/types.ts`) : `domain` (union 9 valeurs), `tags[]`, `summary` (L1), `cluster` (ex `cyber:web-application-security`), `origin`, `tier`. **Scope coarse = `domain` ; scope fin = préfixe de `cluster`.**
- `loadLibraryIndex(repoRoot): SkillMeta[]` (877) et `loadAgentLibraryIndex(repoRoot): AgentLibraryMeta[]` (32, `domains: string[]` déjà présent) — chemins cheap, lisent `index.json`.
- `SkillRouter` (`packages/skills/src/router.ts`) : `findByDomain`, `findByTags`, `buildPromptContext(ids)`, `domainFor(ids)`.
- Seam de sélection : `mockSkillRouter(t.id, t.skillsHint)` au **plan-time** ([dispatch.ts:216](../../../packages/agents/src/dispatch.ts#L216)) → `skillsJson` persistant sur la tâche → `buildPromptContext` à l'exécution.
- Budget : un budget-gate existe déjà dans le chemin de dispatch (PR #33) — l'appel LLM de sélection doit le respecter.

### Composant 1 — Router enrichi (library + orchestrateur)
`getSkillRouter()` charge **aussi** `loadLibraryIndex(repoRoot)`, mergé avec `scanOrchestratorSkills`, **dédup par `id`** (l'orchestrateur l'emporte sur la library en cas de collision). Le router connaît donc tout l'arsenal en L1, sans scan par-fichier. Garde le `catch` de dégradation existant (bundler Next → router vide, best-effort).

### Composant 2 — `selectLibrarySkills` (le moteur, dans `packages/skills`)
Signature (TS) :
```ts
interface DomainScope { domain?: Domain; clusterPrefix?: string; }
interface SelectParams {
  task: { id: string; title: string; description: string; skillsHint?: string[] };
  scope: DomainScope;            // dérivé de l'agent
  router: SkillRouter;
  llm?: RankFn;                  // optionnel ; absent ⇒ étage 2 sauté
  k?: number; n?: number;        // défauts K=15, N=5
}
async function selectLibrarySkills(p: SelectParams): Promise<{ skillIds: string[]; rationale: string; degraded: boolean }>
```
**Étage 1 — déterministe (0 token)** :
1. Filtre par scope : `domain` match ET/OU `cluster` commence par `clusterPrefix` (si fourni). Si scope vide → tout l'arsenal.
2. Score chaque candidat = `tagOverlap(task↔skill.tags)*w1 + hintMatch(skillsHint)*w2 + clusterAffinity*w3`. Tri stable (score desc, puis `id` asc pour déterminisme).
3. Shortlist = top-**K** (défaut 15).

**Étage 2 — rang LLM borné** :
4. Si `llm` fourni ET budget OK : envoyer **uniquement les K résumés L1** (jamais les 877) au `RankFn` → retourne l'ordre/sélection top-**N** (défaut 5).
5. Sinon (`llm` absent, throw, ou `budget_exceeded`) : **dégradation** → top-N de l'ordre déterministe ; `degraded=true`.

Invariants : `skillIds.length ≤ N` ; étage 2 ne reçoit que `≤K` items (garde-fou tokens, assert testable) ; sortie 100% déterministe quand `llm` mocké/absent.

### Composant 3 — Scope par agent + agent pilote
- Mapping `domainScopeFor(agentId): DomainScope`. Source : les fiches/délégation Tier B. Les 8 agents de `TIER_B_DELEGATION_MAP` reçoivent un `scope` (ajout d'un champ `scope?: DomainScope` à `DelegationEntry`, rétro-compatible — absent = scope vide = tout l'arsenal).
- **Agent pilote** : `security-defensive-specialist` (fiche dans `.claude/agents/` ou entrée de délégation), `scope = { domain: 'security', clusterPrefix: 'cyber:' }`. **Posture défensive stricte** : détecter/mitiger seulement, jamais d'offensif (cohérent reframe défensif de la récolte + CLAUDE.md §5). Ajouté à `TIER_B_DELEGATION_MAP` + routable par le planner pour les tâches cyber/sécurité.

### Composant 4 — Câblage dispatch (plan-time)
Remplacer `mockSkillRouter(t.id, t.skillsHint)` par :
```ts
const scope = domainScopeFor(t.agentHint);
const sel = await selectLibrarySkills({ task: t, scope, router: getSkillRouter(), llm: rankFnOrUndefined, k, n });
// skillsJson = sel.skillIds ; logEvent skill_router_decision { rationale, degraded, skills }
```
`buildPromptContext` à l'exécution est déjà câblé et fonctionne avec ces ids (les ids library sont maintenant dans le router).

## Flux de données
`planner (agentHint + skillsHint)` → `domainScopeFor(agentHint)` → `selectLibrarySkills` (étage 1 déterministe → étage 2 LLM borné / dégradation) → `skillsJson` (≤N ids) → `buildPromptContext` injecte N résumés L1 dans le prompt → exécution.

Preuve d'arsenal vivant : une tâche cyber, agentHint=`security-defensive-specialist`, fait remonter des skills `cluster=cyber:*` réels de la library.

## Tests (TDD, Vitest — écrire le test AVANT l'impl)
1. **Router merge** : `getSkillRouter`/équivalent testable inclut library + orchestrateur, dédup par id (collision → orchestrateur gagne).
2. **selectLibrarySkills déterministe** : scope=security → seuls skills security/cyber ; tri stable ; top-K respecté ; `skillsHint` boost l'ordre.
3. **Scope cluster** : `clusterPrefix:'cyber:'` → exclut les security non-cyber.
4. **Étage 2 LLM** : `llm` mocké réordonne la shortlist → top-N attendu ; assert le payload LLM ne contient **que ≤K** résumés.
5. **Dégradation** : `llm` undefined → top-N déterministe, `degraded=true` ; `llm` throw → idem ; budget_exceeded → idem.
6. **Câblage dispatch** : planifier une mission avec une tâche cyber → `skillsJson` contient des ids `cyber:*` (preuve arsenal vivant) ; event `skill_router_decision` loggé avec `degraded`.
7. **Agent pilote scopé** : `domainScopeFor('security-defensive-specialist')` = cyber scope ; une tâche déléguée au pilote ne pioche que dans cyber.
8. **Garde-fou défensif** : la sélection du pilote n'introduit aucun skill hors scope (pas de fuite hors cyber).

## Definition of Done (binaire)
- [ ] `getSkillRouter` (ou son équivalent testable) charge library+orchestrateur, dédup id.
- [ ] `selectLibrarySkills` implémenté : étage 1 déterministe + étage 2 LLM borné + dégradation ; K=15/N=5 défauts réglables, override par domaine possible.
- [ ] `mockSkillRouter` remplacé dans dispatch par `selectLibrarySkills`.
- [ ] Agent pilote `security-defensive-specialist` (scope cyber, posture défensive) wiré dans la délégation.
- [ ] 8 tests ci-dessus verts ; preuve arsenal vivant (test 6) explicite.
- [ ] Gate 5/5 : `pnpm lint && pnpm -r test && pnpm build && pnpm --filter @mas/web smoke` + Sonar rc=0 + gate OK + CI success sur HEAD sha.
- [ ] `index.json` reste gitignored (généré).
- [ ] Doc : AGENTS.md (ou §6.bis) note l'agent pilote ; un court note dans le shard d'intake si pertinent.

## Hors périmètre (YAGNI)
- Autres agents domaine (un seul pilote) → cycle B suivant.
- Embeddings / re-ranking sémantique (le LLM borné suffit).
- Auto-promotion vers `.claude/skills/` (reste manuelle, ADR 0005).
- Câblage complet de `loadAgentLibraryIndex` dans le routage de délégation (le pilote passe par `TIER_B_DELEGATION_MAP` ; la généralisation = cycle suivant).
- Modif du `mockMissionPlanner` au-delà du minimum pour router une tâche cyber vers le pilote.

## Garde-fous
- **§6/§11 tokens** : étage 2 borné à ≤K résumés ; respecte le budget-gate ; dégrade plutôt que dépenser.
- **§5 sécurité** : agent pilote défensif strict ; aucun skill offensif (la library est déjà reframée défensive). Pas d'exécution de binaire/exploit.
- **ADR 0005** : library lue à la demande, promotion manuelle.
- **Déterminisme tests** : LLM toujours mockable ; sortie déterministe sans LLM.
