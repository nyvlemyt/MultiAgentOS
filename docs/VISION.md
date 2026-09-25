# MAOS — Vision (reguidée le 2026-09-25)

> Source : Melvyn, dictée du 2026-09-25. Ce document est la **vision vivante** : il fusionne ce qui a toujours été dit (`PRODUCT_SPEC.md` §1, `ROADMAP.md`, cartes `docs/backlog/`) avec la reformulation du jour, et signale ce qui est devenu obsolète. Il **enregistre** ; il ne **décide** pas — chaque idée nouvelle passe par l'intake-audit (`CLAUDE.md` §13) avant d'entrer dans ROADMAP ou un ADR. Statuts : ✅ construit · 🟡 partiel · ⬜ nouveau · ❌ obsolète. Suivi visuel : `docs/resources/dashboards/etat-maos.html` (page vivante, mise à jour à chaque jalon).

## 1. La thèse en une phrase

MAOS est le poste de pilotage unique de Melvyn : on y parle à des agents (plusieurs LLM, dont un local), on y code comme dans VS Code, la mémoire est un cerveau centralisé qui grandit avec tous les projets et se visualise comme un graphe, et tout — configs, connecteurs, règles — vit dans MAOS **une seule fois** au lieu d'être recréé projet par projet. D'abord pour Melvyn, outil indispensable et « boosté ». Plus tard, une **tranche** vendable aux entreprises (gouvernance, stats, pont unique vers les IA), jamais l'intégralité des améliorations perso.

## 2. Ce qui change par rapport aux visions précédentes

| Avant (juin, `PRODUCT_SPEC` §1/§3) | Maintenant (25/09) | Effet |
|---|---|---|
| « Mission Control, **pas** un chat UI » | Mission Control **et** conversation avec des agents (façon Mammouth : plusieurs LLM + un local) — mais jamais *seulement* un chat | non-goal §3 à réécrire : « pas *seulement* un chat » ; la mission reste le cœur |
| Claude Code = moteur derrière MAOS | MAOS **remplace** Claude Code / Claude Desktop comme surface : mêmes fonctions, + présentations, + l'IA pilote l'interface elle-même | Phase 9 « exploitation » devient « MAOS-first » ; référence §9.bis (claudecodeui) |
| Config par projet (`CLAUDE.md`, `.claude/`) | Config **centralisée** dans MAOS, minimum dans chaque projet | rejoint `cockpit-mcp-surface`, `arsenal-management-console` |
| Mémoire = registres + fiches | Cerveau **visualisable** (graphe façon Obsidian / réseau de neurones), qui évolue avec tout ce qu'on lui dit | rejoint ADR 0010 mémoire v2 (Proposed) + `memoire-v2-comprehension-graphify` |
| — | **Proxy de gouvernance** (entreprise) : vérification des prompts avant l'envoi au LLM, règles, stats d'usage, sessions, chatbots internes ; « on ne passe plus que par ça » | NOUVEAU, entreprise, plus tard ; s'appuie sur §5 + `config/permissions.json` |
| — | Connecteurs perso : Jarvis, finance, dashboards d'activités | NOUVEAU ; règle connecteur 2-branches (`cockpit-mcp-surface`) |
| — | **Un MCP à Melvyn** intégré dans MAOS pour le booster | NOUVEAU ; rejoint `arsenal-mcp-runtime-activation` |
| — | Suivre l'avancée : dashboard maison **ou** Notion | dashboard maison = `etat-maos.html` (vivant, dès ce jour) ; Notion = option quand un connecteur MCP existe |
| — | Travail cloud du boulot à transmettre pour booster MAOS et être boosté par lui | canal d'intake §5 ci-dessous ; jamais de secret dans le repo (§5/§11) |

## 3. Les dix thèmes, avec leur état réel

1. **Agents + conversation multi-LLM (+ LLM local)** — 🟡 Tier A/B, router multi-provider (ADR 0002, Phase 3.5) ✅ ; LLM local ⬜ ; surface de conversation ⬜ (chat live = `BACKLOG` P2-8).
2. **Coder comme VS Code dans MAOS** — ⬜ ; moteur Agent SDK (Phase 2) ✅ ; éditeur / terminal / arbre de fichiers ⬜ (patron : siteboon/claudecodeui, §9.bis).
3. **Mémoire cerveau centralisée** — 🟡 convoyeur, registres, promotion par juge Opus ✅ ; graphe et visualisation ⬜ (ADR 0010) ; auto-alimentation 🟡 (`memory-self-feeding-and-ingest`).
4. **Configs centralisées, minimum par projet** — ⬜ (MAOS pousserait `CLAUDE.md`/skills/agents/MCP vers le projet ; carte backlog à créer après interview).
5. **Connecteurs / MCP (le tien, Jarvis, finance)** — 🟡 doctrine posée, MCP QMD décidé ; ton MCP ⬜ (à recevoir, voir §5).
6. **Gouvernance §5 (proxy de règles)** — 🟡 portique armé : catégories (#81), chemin (#82), hôte (net-guard) ✅ ; proxy prompt→LLM entreprise ⬜.
7. **Suivi des projets et de l'avancée** — 🟡 cockpit, rapports, priorités ✅ ; page vivante `etat-maos.html` ✅ ; Notion ⬜.
8. **Design premium** — 🟡 HUD sombre existant ; « moche mais pas prioritaire » reste la règle jusqu'à décision explicite.
9. **L'IA pilote l'interface, fait des présentations** — ⬜ ; graine existante : pages `explain-diff` ✅.
10. **Produit vendable (tranche entreprise)** — ⬜ ; principe : ne jamais mélanger perso et entreprise dans le code (éditions / drapeaux), décider la tranche à l'interview.

## 4. Obsolète ou à trancher

- Non-goal « pas un chat UI » (`PRODUCT_SPEC` §3) → à réécrire.
- `docs/BACKLOG.md` P0 (août) : tout est fait → archivé (section d'en-tête ajoutée ce jour).
- `ROADMAP.md` : phases 0-7 livrées (preuves = tests smoke : kanban idées, journal de décisions, priorités, rapport autopilot, assistant nouveau projet, pilule de langue), Phase 8 à moitié, Phase 9 en cours ; les en-têtes sans ✅ mentent par omission → à corriger dans une passe ROADMAP.
- Règle de travail « le travail mémoire vit sur `brique-1` » : obsolète depuis #79 — **tout part de `main`**.

## 5. Comment me transmettre les choses (canal d'intake)

- **Vidéos, URLs, docx, pptx** : `pnpm --filter @mas/memory mas capture <url|chemin>` → `mas distill --all` → `mas promote --all --approve-untrusted --run-cap 600000`. MAOS mange ses propres sources ; le net-guard autorise déjà les hôtes YouTube. Une liste d'URLs dans un fichier `.md` déposé dans `docs/resources/inbox/` suffit — je lance la chaîne.
- **Documents écrits** (travail cloud, notes, schémas) : déposer dans `docs/resources/inbox/` (créé ce jour) → `mas capture --inbox docs/resources/inbox`. Secrets, clés, données clients : **jamais** dans le repo — les décrire, pas les coller.
- **Ton MCP** : un dossier ou un dépôt → `/intake-audit` → carte backlog → branche courte depuis `main`.
- Chaque item passe l'intake-audit (identité → fit → coûts → KILL → décision). Le doc de vision enregistre, l'audit décide, la mission exécute.

## 6. Questions pour les sessions d'interview (à poser, pas à deviner)

1. Ton MCP : quels outils expose-t-il ? qui l'appelle (MAOS, Claude Code, les deux) ? authentification ?
2. LLM local : lequel (Ollama, LM Studio…) et pour quoi (privé, hors-ligne, coût) ? quelle part des tâches ?
3. Conversation avec les agents : par projet, globale, ou les deux ? historique persistant ? un agent = une voix ?
4. « Coder comme VS Code » : éditeur intégré dans MAOS, ou VS Code ouvert *par* MAOS ? terminal dedans ?
5. Configs centralisées : quoi exactement (`CLAUDE.md`, skills, agents, MCP, `.env`) ? poussées dans le projet ou liées ?
6. Graphe mémoire : lecture seule ou éditable ? nœuds = fiches, notions, projets ? quel outil de rendu ?
7. Notion : source de vérité ou miroir du dashboard maison ?
8. Entreprise : quelle tranche vendable ? multi-utilisateurs ? hébergement ? quelles règles de gouvernance en premier ?
9. Connecteurs perso : lesquels d'abord (finance, calendrier, « Jarvis » = voix ?) ?
10. Design : quand ça devient prioritaire ? une référence visuelle ?
11. Travail cloud du boulot : format, périmètre, contraintes de confidentialité.
12. Vidéos : la liste des URLs et ce que tu en attends (patrons à copier, outils à adopter, idées).

## 7. Ce qui ne bouge pas

Facturation §11 (abonnement, jamais PAYG) · portique §5 · un seul tronc `main` · PR en draft + 6 contrôles · merge = Melvyn · une session = un projet · intake-audit avant toute adoption · une page vivante par mission, maintenue.
