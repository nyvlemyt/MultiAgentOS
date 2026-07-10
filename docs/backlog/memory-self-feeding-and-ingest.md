# Backlog — Mémoire auto-alimentée + ingestion multi-source (vision utilisateur)

**Quand** : Phase 4.5 (après le socle mémoire Phase 4). **Source** : demande utilisateur 2026-06-09. **Statut** : vision capturée, à raffiner au pré-vol Phase 4.5.

## L'idée (mots de l'utilisateur)

Une mémoire qui :
1. **s'alimente toute seule quand elle peut** (auto-capture en fin de mission / de session) ;
2. me laisse **fournir facilement** ce qu'il faut ajouter : **skill, pattern, repo, connaissance, fiche de cours, note, ou autre** ;
3. soit faisable **visuellement** (je dépose / je clique) **OU** **automatique** ;
4. **range au bon endroit tout seul** (bon registre + bon scope global/projet) ;
5. le tout orchestré par le **skill `intake-audit`** dont on a parlé : il fait les **tests, analyse, amélioration, changements** avant d'écrire — il "alimente bien" la mémoire, il ne déverse pas.

## Ce qui est déjà en place (les seams du socle Phase 4 — à réutiliser, pas réinventer)

- **`captureCandidates()`** (`packages/memory/`) = le seam d'auto-capture. Le rituel l'appelle aujourd'hui ; **agentmemory** (hooks, auto) se branchera dessus sans refonte (ADR 0003 / capture BDR).
- **`MemoryRetriever`** (FtsRetriever FTS5 → QMD plus tard) = la recherche.
- **5 registres + scope (global/projet)** = la structure "bon endroit".
- **`memory_candidates` → `promoteCandidate`** sous **write-lock Memory Keeper (§8)** = le sas de revue.
- **Memory Center `/memory`** = la surface visuelle (inbox accept/reject/edit déjà câblée).
- **`docs/workflows/intake-audit-template.md`** = la **méthode** (déjà généralisée à : skill / agent / mcp / repo / doc / note / pattern / idée). Le **skill** = son automatisation.

## Ce que Phase 4.5 ajoute (mappé sur la vision)

| Vision | Construction 4.5 |
|--------|------------------|
| auto-alimentation "quand elle peut" | brancher l'auto-capture sur l'event **mission-complete** du dispatcher → `captureCandidates` (pattern agentmemory, local, §11-safe) |
| fournir facilement (repo/note/PDF/skill/pattern/cours…) | **Ideas Inbox** (déjà prévue Phase 4.5) = point d'entrée multi-source ; chaque dépôt = un dossier d'intake |
| visuel **ou** auto | Memory Center / Ideas Inbox = dépôt visuel ; un mode "auto-file" pour les sources à confiance haute |
| rangé au bon endroit | **classifieur** registre+scope (règles d'abord, LLM-léger si besoin) — choisit decisions/learnings/… et global/projet |
| le skill qui teste/analyse/améliore | **skill `intake-audit`** = automatise `intake-audit-template.md` (identité→fit→3 coûts→score→KILL→décision→appropriation→plan→ré-audit), réutilise le mission lifecycle |

## Contraintes (ne pas casser)

- **§8** : seul le Memory Keeper écrit `data/memory/`. L'ingestion passe par `memory_candidates` → promotion, jamais d'écriture directe.
- **§11** : pas de PAYG. Classifieur/auto-capture = local, zéro/peu de LLM (préférer des règles déterministes).
- **§12** : injection en mission garde le cap ≤5 items globaux/call ; le store grossit, le retrieval reste sélectif.
- **Réversibilité** : tout nouvel ingest passe par un seam (candidate inbox), jamais en dur.
- **Sécurité (§5)** : ingérer un **repo** ou exécuter du code (Graphify-like) = audit sécu obligatoire avant.

## Idées de critères de sortie (à figer au pré-vol 4.5)

- Je dépose une **note** dans l'inbox → intake-audit la score → proposée dans le bon registre+scope → j'accepte en 1 clic → retrouvable par requête.
- Une **mission qui se termine** émet des candidats automatiquement (sans geste humain) → triage dans `/memory`.
- Fournir un **repo / une fiche** déclenche un dossier d'intake (décision `implement_now|adapt_now|backlog|watch|reject`) — pas un déversement brut.
- Le **skill `intake-audit`** tourne en autonomie sur un item et rend un dossier `docs/intake/<date>-<slug>.md` + une décision.

## Lien

Prolonge `docs/backlog/second-brain-cross-project.md` (couche savoir cross-projet) + `docs/backlog/intake-audit-skill.md` (le skill). Pré-vol Phase 4.5 = intake-audit des ressources "ingestion / auto-capture / Ideas Inbox / Decision Log".
