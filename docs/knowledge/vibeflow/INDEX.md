# VibeFlow Resources — Index Intégré

Source : Notion database wiki @le_gouverneur_ia (`collection://37424138-fc8c-80d9-b8f6-000b35b15256`, page https://tangible-mink-e9a.notion.site/Ressources-62124138fc8c834cb89581026c259dcd). Prompts copy-paste de gouvernance IA pour Claude Code.

**Ce fichier ≠ copie de la page Notion.** Catégorisation autoritaire (fournie par l'utilisateur) + contenu réel extrait dans les 5 fichiers catégorie de ce dossier. **VibeFlow n'est PAS la source de vérité unique** — voir `docs/knowledge/README.md` pour l'articulation avec les autres sources (recherche académique, doctrine, cours).

## Statut d'accès

**Réconciliation 2026-06-04 → mise à jour 2026-06-05** (cycle `vibeflow-index-reconciliation`) : **44 PDFs présents** dans `docs/ressources/` ré-appariés à l'INDEX. Le statut « ❌ 404 / à ré-exporter » de l'ère MCP est **caduc**. Détail : `docs/learning/2026-06-04-vibeflow-index-reconciliation/build-report.md`.

- **44 PDFs** → **42 mappés à un n° RES** (`+RES-058/059/060/061` nouveaux locaux), **1 nouveau sans n°** (« Comment rendre tes projets IA portables »), 1 méta (page catalogue Notion).
- **RES-023 TRANCHÉ (2026-06-05, utilisateur)** = `023-Structurer la gouvernance AVANT...pdf`. Le PDF « Gouverner tes Agents IA Templates+Prompts » **renuméroté RES-059** (n° local, source Notion 404) — distillation dans agents-skills.md.
- **RES-022** : `022-Lean claude.pdf` = en réalité la page **Overview Claude Code Docs** (**doc de référence, NON distillée** — son contenu propre n'est repris nulle part) ; la règle « <200 lignes » provient de **RES-012**, pas de ce PDF.
- **4 PDFs portent un préfixe RES** : `022-`, `023-`, `024-`, `RES-040-`.
- **Orphelins** (ligne RES sans PDF) : 004, 009a, 011, 014, 048, 049, 050 (sources MCP/local ou doublons superseded) + 047 (archivée).
- **Re-vérifiés (glance 2026-06-05)** : RES-003 → **watch** (contexte ; re-promouvable Phase 4/5) ; RES-006 → **superseded confirmé** (synthèse couverte 013+012+051+057).

### Historique (ère MCP, 2026-06-03)
- **Intégration Notion MCP ~17 pages** (RES-034→057) ; anciennes RES-003→033 en 404 via MCP. **Ce blocage est levé** par les PDFs locaux.
- **6 ressources sauvées localement** dans `docs/claude doc/`.

## Catégorisation autoritaire (5 catégories)

### 🏛️ Gouvernance & Architecture IA (14)
RES-057, 055, 042, 040, 036, 024, 023, 022, 013, 008, 006, 004, 003, **061** (n° local : 3 Paradigmes)

### 🧠 Mémoire & Contexte (10)
RES-056, 045, 044, 041, 034, 029, 014, 007, 011, **060** (n° local : Registre Learning Records)

### 🤖 Agents & Skills (9)
RES-046, 043, 037, 035, 015, 016, 009a, 009b, **059** (n° local : Gouverner Templates+Prompts)

### ⚙️ Hooks & Sortir du Terminal (3)
RES-025, 026, 027

### 🚀 Workflows, Doctrine & Modèles (10)
RES-053, 052, 039, 038, 032, 031, 030, 028, 012, **058** (nouveau : setup SaaS)

### + Docs VibeFlow externes (Google Docs / outils)
- **Graphify** (knowledge graph codebase) → `memory-patterns.md` §Graphify
- **Instagram × Obsidian** (Loucash, ingestion) → `memory-patterns.md` §Instagram×Obsidian

## Table d'intégration (statut réel)

**Colonnes** : `Accès` = présence d'un PDF dans `docs/ressources/` (vérifié 2026-06-04). `Statut catalogage` = `distilled <fichier>` | `backlog_next:<phase>` (PDF prêt, distillation au pré-vol) | `superseded` | `orphelin` (pas de PDF, source MCP/local) | `nouveau` | `méta`.

| RES | Titre | Cat | Phase | Accès | Statut catalogage |
|-----|-------|-----|-------|-------|---------|
| 057 | Pourquoi l'IA casse en boucle (base saine 3 principes) | Gouv | 3 | ✅ PDF | distilled gouvernance.md |
| 055 | Anthropic 15 juin : billing 3 voies | Gouv | veille | ✅ PDF | distilled CLAUDE.md §11 |
| 042 | OWASP Readiness Toolkit | Gouv | 3.5 | ✅ PDF | distilled gouvernance.md |
| 040 | 3 dérives silencieuses + EVAL-XXX | Gouv | 3.5 | ✅ PDF (préfixe RES-040-) | distilled gouvernance.md |
| 036 | Durcir règles (3 niveaux mémoire→contract→doctrine) | Gouv | 4/6 | ✅ PDF | distilled gouvernance.md |
| 024 | Audite tes agents 10 min | Gouv | 3.5 | ✅ PDF (préfixe 024-) | distilled gouvernance.md (4 piliers+verdict) |
| 023 | Structurer la gouvernance AVANT de déployer (4 piliers, cadrage→monitoring) | Gouv | ref | ✅ PDF (préfixe `023-`) | distilled gouvernance.md — **TRANCHÉ 2026-06-05** (utilisateur) = `023-Structurer...pdf` ; le PDF « Gouverner Templates+Prompts » n'est PAS RES-023 → ligne orphelin dédiée |
| 022 | Lean CLAUDE.md *(le PDF est en fait l'Overview Claude Code Docs)* | Gouv | 3 | ✅ PDF (préfixe `022-`) | **référence (Getting-Started Overview), NON distillée** — le contenu propre de l'Overview (install / surfaces / « what you can do ») n'est distillé nulle part ; les modes & permission-modes sont couverts ailleurs (`../claude-code-context-and-modes.md`) mais PAS l'Overview lui-même. La règle « CLAUDE.md < 200 lignes » vient de **RES-012** (DON'T#1), pas de ce PDF ; self-audit → backlog/self-audit-lean-claude-md.md |
| 013 | Starter kit 3 fichiers | Gouv | ref | ✅ PDF | distilled gouvernance.md (3 types fichiers) |
| 008 | Audit 3 dettes IA cachées | Gouv | ref | ✅ PDF | distilled gouvernance.md (3 dettes /30) |
| 006 | Structure projet IA universelle (« Guide Universel, peu importe l'outil ») | Gouv | ref | ✅ PDF | **superseded confirmé** (glance 2026-06-05 : synthèse tool-agnostic des primitives 013+012+051+057 ; garder réf cross-tool) |
| 004 | Agents et gouvernance : 4 piliers | Gouv | ref | ❌ pas de PDF | superseded (orphelin ; 4 piliers couverts par 024/Structurer AVANT) |
| 003 | Architecture du contexte (« L'Architecture Complète du Contexte ») | Gouv | 4/5 | ✅ PDF | **watch — confirmé 2026-06-06** (fichiers/prompts/arborescence « prêt à copier » ; overlaps 013/057/030 ; distill au pré-vol Phase 4/5 si design context-pack) |
| 056 | Le sommaire que ton IA lit avant | Mém | 4 | ✅ PDF + 📁 | distilled memoire.md |
| 045 | Cadre mental : par où commencer | Mém | ref | ✅ PDF | distilled memoire.md |
| 044 | Rituel close-out 3 champs | Mém | 4 | ✅ PDF | distilled memoire.md |
| 041 | Mémoire 3 niveaux + mapping outil | Mém | 4 | ✅ PDF | **distilled memory-patterns.md §RES-041** (3 niveaux stockage/rappel/décision ; N3=jugement non-pluginnable ; ⚠️ Mem0 cloud rejeté §11) |
| 034 | Rituel consolidation mémoire (4 actions) | Mém | 4 | ✅ PDF | distilled memoire.md |
| 029 | Mémoire agent : 5 registres | Mém | 4 | ✅ PDF + 📁 | distilled memoire.md |
| 014 | Prompt context agentic | Mém | 3 | ❌ pas de PDF | orphelin (reste à ré-exporter) |
| 007 | Mémoire projet IA v2 (« La Mémoire Projet pour ton IA ») | Mém | ref | ✅ PDF | **superseded confirmé** (glance 2026-06-06 : intro générique « pourquoi mémoire » + compat outils ; zéro contenu unique vs 029+041) |
| 011 | Mémoire projet IA v1 | Mém | ref | ❌ pas de PDF distinct | superseded by 029 (orphelin) |
| 046 | Critère de succès agent (3 formes) | Ag | 3 | ✅ PDF | distilled agents-skills.md |
| 043 | Agent-auditeur : template 4 champs | Ag | 3.5 | ✅ PDF | distilled agents-skills.md |
| 037 | 3 modes audit STRICT/AUDIT/SHADOW | Ag | 3.5 | ✅ PDF | distilled agents-skills.md + agent-patterns.md |
| 035 | Skill ou Agent : test binaire | Ag | 3 | ✅ PDF | distilled agent-patterns.md |
| 048 | Architecture agent qui tient (matrice agent/skill) | Ag | 3 | ❌ pas de PDF (source MCP) | distilled agents-skills.md |
| 015 | Guide agents IA | Ag | ref | ✅ PDF | distilled agents-skills.md (test 3-Q+10-Q+6 erreurs) |
| 016 | Managed Agents : décision sub-agents vs teams | Ag | 3.5 | ✅ PDF | distilled agents-skills.md (⚠️ Managed=PAYG, valide local-first) |
| 009a | Template .claude/ folder | Ag | ref | ❌ pas de PDF | superseded (orphelin) |
| 009b | Starter kit gouvernance | Ag | ref | ✅ PDF (`Starter Kit Gouvernance 5 fichiers`) | superseded |
| 025 | 3 chemins hors du terminal | Hooks | 6 | ✅ PDF | backlog_next:Phase6 |
| 026 | 8 hooks Claude Code | Hooks | 6 | ✅ PDF | backlog_next:Phase6 |
| 027 | 3 hooks essentiels | Hooks | 6 | ✅ PDF | backlog_next:Phase6 |
| 053 | Le système qui fait tourner ma distribution | WF | ref | ✅ PDF + 📁 | distilled workflows.md |
| 052 | Features natives vs skills custom (tableau 23) | WF | 3 | ✅ PDF | distilled workflows.md |
| 051 | Ma doctrine : trio Constitution+Registres+Usage | WF | ref | ✅ PDF (`Le Stack Doctrine`) | distilled workflows.md |
| 050 | Framework SOUSTRAIRE | WF | ref | ❌ pas de PDF | distilled via 052 (orphelin) |
| 049 | Procédure custom (remplacer mode plan) | WF | ref | ❌ pas de PDF | distilled via 052 (orphelin) |
| 039 | Le parcours du vibe coder (3 étapes) | WF | ref | ✅ PDF | backlog_next:ref |
| 038 | Poor Man's Ultraplan (3 fichiers 30min) | WF | ref | ✅ PDF | superseded (superpowers:writing-plans) |
| 032 | Superpowers : stack + doctrine | WF | ref | 📁 local | distilled workflows.md |
| 031 | 3 checks avant upgrade modèle | WF | 3.5 | ✅ PDF + 📁 | distilled workflows.md |
| 030 | Les 6 modes de Claude Code | WF | 3.5 | ✅ PDF (`Audit des 6 modes`) | distilled `../claude-code-context-and-modes.md` |
| 028 | Du vibe coding à la gouvernance | WF | ref | ✅ PDF | backlog_next:ref |
| 012 | Checklist DON'T / DO | WF | 3 | ✅ PDF | distilled gouvernance.md (5 DON'T/DO) |
| 058 | 🏗️ Le setup qui fait tourner mes SaaS avec Claude Code (10 briques) | WF | ref/5 | ✅ PDF **NOUVEAU** | **nouveau** → backlog_next:Phase5 (setup/prod SaaS, voisin RES-053) |
| — | **Comment rendre tes projets IA portables** | Gouv/transv. | 5 | ✅ PDF | **nouveau** → backlog_next:Phase5 (portabilité projet — MAS référence par chemin absolu) |
| 060 | **Le Registre Learning Records** (LRN détaillé) | Mém | 4 | ✅ PDF | **distilled memoire.md** (n° local) — 8 champs · 4 déclencheurs · archivage 50. ⚠️ « 95 % » = headline NON sourcé ; « 50 % précision/3j » non sourcé |
| 061 | **Les 3 Paradigmes de la Gouvernance IA (Du Prompt à l'Orchestre)** | Gouv | 3.5 | ✅ PDF | **backlog_next:Phase3.5** (n° local) — **non distillé ce cycle (budget)** |
| 059 | **Gouverner tes Agents IA Templates + Prompts** (3 principes + 5 patterns contrats) | Ag | 5 | ✅ PDF | distilled agents-skills.md — **RES-059 (n° local, ex-candidat RES-023)** ; source Notion 404, à confirmer au ré-export |
| — | Ressources Accueil Notion | — | — | ✅ PDF | **méta** (la page catalogue elle-même, pas une ressource) |

**Note** : RES-051, 050, 049 mentionnés dans la catégorie Workflows par l'utilisateur ; leur contenu clé est référencé dans le tableau 23 de RES-052 (workflows.md). RES-051 (doctrine trio) fetchée en entier.

## Reste à récupérer — prioritaire (par phase)

L'utilisateur peut ré-exporter ces pages depuis Notion (markdown) pour intégration complète :

**Note (Batch 1, 2026-06-04)** : les ressources « à ré-exporter » étaient en fait disponibles en PDF dans `docs/ressources/`. Batch 1 Gouvernance+Agents distillé directement depuis ces PDFs (RES-024/023/013/008/012/015/016 ✅). Seule RES-022 (lean CLAUDE.md) n'a pas de PDF correspondant.

**Ré-audit (cycle `2026-06-04-vibeflow-reaudit`)** : 1 PDF supplémentaire identifié dans `docs/ressources/` et distillé — « Structurer la gouvernance AVANT de déployer tes agents IA » (4 piliers détaillé + contract.yaml long-form) = **RES-023** (tranché 2026-06-05 ; « Gouverner Templates+Prompts » → **RES-059**). Correction de fidélité : « 40 % Gartner » re-sourcé (vient de ce PDF, pas de RES-024). Détail : `docs/learning/2026-06-04-vibeflow-reaudit/build-report.md`.

### Radar « à distiller » par phase (PDF prêt, `backlog_next` — distillation au pré-vol de la phase)

| Phase cible | RES / PDF prêts | Pour |
|-------------|-----------------|------|
| **Phase 3** | — (RES-022 = Overview, **référence non distillée** ; self-audit constitution « <200 lignes » = RES-012, carte backlog) | self-audit lean CLAUDE.md |
| **Phase 3.5** | **061** « 3 Paradigmes » + **stat-sweep mémoire** (044/034/045) — **1 cycle combiné** | paradigmes orchestration + dette stats (cf. backlog/self-audit-memoire-reaudit-debt.md) |
| **Phase 4** | ✅ 041 + 060 **distillés** (cycle mémoire 06-06) ; reste 003 (watch, si context-pack) | mémoire — voir memoire.md / memory-patterns.md |
| **Phase 5** | NEW « Projets portables » · **058 setup SaaS** | portabilité + setup prod (RES-059 contrats = déjà distillé) |
| **Phase 6** | 025, 026, 027 (hooks) | autonomy gates + settings.json hooks |
| ref | 028, 039 | enrichissement |
| résolu (glance 2026-06-05) | 003 → **watch** (Phase 4/5) ; 006 → **superseded** | re-vérification faite, plus en attente |

Orphelins (pas de PDF, à ré-exporter si besoin) : 014 (prompt context agentic) ; 004/009a/011/048/049/050 = superseded ou source MCP/local.

## Total catalogué (2026-06-05)

- **44 PDFs** dans `docs/ressources/` : **42 mappés à un n° RES** (dont 058/059/060/061 nouveaux locaux ; RES-023 = 1 PDF après arbitrage) · **1 sans n°** (portables) · **1 méta**.
- **distilled / couvert** : ~29 RES (gouvernance/agents-skills/memoire/memory-patterns/workflows + claude-code-context-and-modes + CLAUDE.md §11 ; inclut RES-059, **RES-060 LRN, RES-041 3 niveaux**). **RES-022 = Overview = référence NON distillée** (hors compte).
- **backlog_next (PDF prêt)** : 025, 026, 027, 028, 039, **058**, **061** + portables = ~8, à distiller au pré-vol de leur phase.
- **watch** : 003 (contexte, re-promouvable Phase 4/5).
- **superseded** : 006, 004, 007, 011, 009a, 009b, 038.
- **orphelins** (pas de PDF) : 004, 009a, 011, 014, 048, 049, 050 + 047 archivée.
- **2 Google Docs** (Graphify, Instagram×Obsidian) + **6 locales** (`docs/claude doc/`) inchangées.
