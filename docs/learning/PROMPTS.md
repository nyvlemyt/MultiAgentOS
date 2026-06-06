# docs/learning/PROMPTS.md — Prompts réutilisables (Doer / Checker)

Templates pour la boucle d'apprentissage (protocole : `docs/learning/README.md`). Pour un nouveau cycle, remplace `{{CYCLE_SLUG}}` (ex `2026-06-04-vibeflow-reaudit`) et `{{SCOPE}}` (le périmètre du cycle), puis lance Doer en session A, Checker en session B fraîche.

**Rappel** : Doer ne commite pas. Checker audite le working tree. L'orchestrateur tranche le commit après lecture des 2 rapports.

---

## Template DOER (session A)

```
Lis CLAUDE.md (§11, §12, §13), docs/workflows/knowledge-bootstrap.md, docs/workflows/intake-audit-template.md, docs/knowledge/vibeflow/INDEX.md, docs/learning/README.md. Si docs/learning/{{CYCLE_SLUG}}/verify-report.md existe (cycle précédent), lis-le et corrige ses findings d'abord.

Tu es le DOER du cycle "{{CYCLE_SLUG}}". Travail = docs uniquement (docs/knowledge/, docs/backlog/, INDEX).

PÉRIMÈTRE : {{SCOPE}}

MÉTHODE (intake-audit léger par ressource, cf. intake-audit-template.md) :
1. Mapping RES↔PDF par TITRE (les noms de docs/ressources/ ne portent pas le numéro RES sauf RES-040). Marque "non mappable" / "nouveau".
2. Pour chaque ressource du périmètre : ouvre le PDF source + le passage distillé existant, vérifie fidélité, corrige toute invention/sur-interprétation, enrichis les trous. Décision enum (implement_now/adapt_now/backlog_next/watch/reject) + justif.
3. Distille le retenu dans les fichiers docs/knowledge/ EXISTANTS (pas de nouveaux fichiers sauf nécessité). Mets à jour les statuts INDEX (vraie source : PDF vs MCP).

CONTRAINTES : ne touche PAS CLAUDE.md (idée touchant la constitution → backlog candidat self-audit). Aucun code/config runtime/.env. §11 (aucun PAYG adopté). Structure §12 (pas de stub ; principes + source citée ; jamais de chiffre absent du PDF présenté comme sourcé). Pause à 80% budget. Signale toute contradiction avec l'archi MAS, ne l'intègre pas en silence.

SORTIE OBLIGATOIRE (avant le résumé terminal) : écris docs/learning/{{CYCLE_SLUG}}/build-report.md au format build-report de README.md (périmètre · table RES↔PDF · table décisions · fichiers touchés · fidélité/écarts corrigés · contradictions signalées · questions ouvertes · commit proposé). NE COMMITE PAS. Laisse le working tree modifié. STOP — aucune phase de build.
```

## Template CHECKER (session B, fraîche)

```
Lis CLAUDE.md (§11, §12, §13), docs/learning/README.md, puis docs/learning/{{CYCLE_SLUG}}/build-report.md.

Tu es le CHECKER indépendant du cycle "{{CYCLE_SLUG}}". Tu ne fais confiance à AUCUNE affirmation du build-report : tu vérifies tout depuis les PDFs sources (docs/ressources/) et les fichiers réels. Défaut = sceptique. Tu NE modifies AUCUN fichier.

VÉRIFIE :
1. Fidélité : pour chaque ressource que le Doer dit corrigée/enrichie/distillée, ouvre PDF + fichier, confirme. Cherche toute invention, chiffre non sourcé, sur-interprétation.
2. Mapping RES↔PDF : confirme par titre en ouvrant les PDFs. Signale les faux.
3. Findings du cycle précédent (si applicable) : réellement corrigés ?
4. Garde-fous : CLAUDE.md PAS édité en silence ? superseded ignorés ? §11 (aucun PAYG adopté) ? statuts INDEX = réalité des fichiers ? aucun code/.env touché (git diff/git status le prouvent) ? working tree non commité (le Doer ne devait pas commiter) ?

SORTIE OBLIGATOIRE (avant le résumé terminal) : écris docs/learning/{{CYCLE_SLUG}}/verify-report.md au format verify-report de README.md. VERDICT PASS/NEEDS_WORK/BLOCK + table findings (fichier:ligne | 🔴🟠🟡 | problème | correction) + couverture X/N vérifiés contre source + garde-fous + ce que tu n'as PAS pu vérifier. Si "fait" prétendu sans preuve → NEEDS_WORK. Ne modifie rien, ne commite rien.
```

## Template ORCHESTRATOR (session fraîche, pilote — pas besoin de l'historique)

```
Lis CLAUDE.md (§11, §12, §13), docs/learning/README.md, ROADMAP.md (section "Learning pre-flight"), docs/knowledge/vibeflow/INDEX.md, puis les 2 rapports du cycle : docs/learning/{{CYCLE_SLUG}}/build-report.md et verify-report.md.

Tu es l'ORCHESTRATEUR. Tu ne refais NI le travail NI la vérif : tu traites les 2 rapports comme l'interface. Tu peux ouvrir un fichier pour lever un doute, mais pas tout re-distiller.

ANALYSE :
1. Lis le VERDICT du verify-report. Recense les findings par sévérité.
2. Sanity-check : une contradiction évidente entre les 2 rapports ? un finding 🔴 ignoré ? Signale.
3. Décide la suite :
   - VERDICT BLOCK ou findings 🔴 → prépare un sous-cycle Doer "fix" (liste précise des corrections, format scope de PROMPTS.md). Pas de commit.
   - VERDICT NEEDS_WORK (🟠/🟡 seulement) → décide : corriger maintenant (sous-cycle Doer) ou commiter + backloguer les mineurs. Justifie.
   - VERDICT PASS → propose le commit docs (exclut pnpm-lock.yaml et tout fichier hors périmètre du cycle) et prépare le périmètre du PROCHAIN batch (cf. INDEX "Reste à récupérer" : Mémoire→Phase 4, Hooks→Phase 6).

SORTIE (terminal, court) :
A. Verdict + décision en 3 lignes.
B. La commande git commit proposée (à faire valider par l'humain — ne commite QUE si l'humain dit go).
C. Le {{SCOPE}} du prochain cycle, prêt à coller dans PROMPTS.md (slug + périmètre).
D. Ce qui part en backlog/candidat self-audit.

CONTRAINTES : ne modifie pas les fichiers knowledge (c'est le rôle du Doer). Commit = docs uniquement, après go humain. Ne lance aucune phase de build.
```

---


## Cycle courant : `2026-06-06-vibeflow-memoire-reaudit`

**Type** : cycle de **distillation** (intake-audit COMPLET par ressource, pas catalogage). Pré-vol Phase 4 (Mémoire) + durcissement du pont de persistance (knowledge-bootstrap §5.bis : Phase 4 sème le second cerveau DEPUIS `docs/knowledge/`).

**{{SCOPE}}** = Ré-auditer + compléter la distillation **MÉMOIRE** (`docs/knowledge/vibeflow/memoire.md`, `docs/knowledge/memory-patterns.md`, `docs/knowledge/project-doctrine.md` §5 registres), faite en partie sur sources MCP/404, contre les **PDFs mémoire réels** de `docs/ressources/`. Même profil de risque que le cycle gouvernance (stats inventées, sur-interprétation). **BONUS si budget < 80 %** : RES-061 « 3 Paradigmes de la Gouvernance IA » (Phase 3.5).

**RES ↔ PDF (mémoire) :**
- RES-029 = `La vraie mémoire de ton agent Claude Code 5 registres + rituel + Obsidian.pdf` → memoire.md (distilled, **re-vérifier fidélité**)
- RES-056 = `Le sommaire que ton IA lit avant de fouiller sa mémoire.pdf` → memoire.md (re-vérifier)
- RES-044 = `Rituel close-out de session 3 champs 5 minutes 1 an de mémoire.pdf` → memoire.md (re-vérifier)
- RES-034 = `Le rituel de consolidation memoire 4 actions 30 min-mois.pdf` → memoire.md (re-vérifier)
- RES-045 = `Le cadre mental pour savoir par ou commencer.pdf` → memoire.md (re-vérifier)
- **RES-041** = `Mémoire d'un système IA les 3 niveaux + mapping outil.pdf` → memory-patterns.md **PARTIEL → COMPLÉTER** (3 niveaux + mapping outil)
- **RES-007** = `La Memoire Projet pour ton IA.pdf` → marqué « superseded by 029 » : **ouvrir le PDF, confirmer** vraiment superseded OU contenu unique à récupérer
- **RES-003** = `L'Architecture Complete du Contexte dans Claude Code.pdf` → statut `watch` : **trancher** distill (Phase 4) vs garder watch
- **NET-NEW RES-060** = `Le Registre Learning Records le Fichier que 95% des Builders IA n'ont Pas.pdf` → **distiller** (registre learning = pont knowledge-bootstrap §5). ⚠️ **VÉRIFIER la stat « 95 % »** contre le PDF (piège type « 40 % Gartner » du cycle gouvernance).
- RES-014 (`Prompt context agentic`) = orphelin (pas de PDF) → laisser.
- **BONUS RES-061** = `Les 3 Paradigmes de la Gouvernance IA Du Prompt à l'Orchestre.pdf` → gouvernance.md ou agent-patterns.md (Phase 3.5).

(N°s 060/061 = **locaux**, source Notion 404, à confirmer au ré-export — convention RES-058/059.)

MÉTHODE (intake-audit COMPLET par ressource, cf. `intake-audit-template.md`) :
1. Pour chaque RES ci-dessus : ouvre le **PDF source** + le **passage distillé existant**. Vérifie fidélité ligne-à-ligne. Corrige toute invention/sur-interprétation/stat non sourcée. Enrichis les trous (ex RES-041 partiel).
2. **Scan anti-stat-inventée** sur TOUTES les sections mémoire (5 registres, 3 niveaux, sommaire, close-out, consolidation) : chaque chiffre présenté comme sourcé doit exister dans son PDF. Liste-les avec preuve (comme le cycle gouvernance).
3. Distille le net-new (RES-060 Registre Learning Records ; bonus RES-061) dans les fichiers `docs/knowledge/` EXISTANTS — structure §12 (Principes + source citée, jamais de chiffre absent du PDF présenté comme sourcé).
4. **Pont de persistance (§5.bis)** : aligne explicitement la connaissance mémoire distillée avec (a) les 5 registres de `project-doctrine.md`, (b) le modèle mémoire runtime visé Phase 4 (`data/memory/<projectId>/`). Signale tout écart entre la doctrine vibeflow et l'archi MAS — NE l'intègre PAS en silence.
5. Mets à jour les statuts INDEX (041 partiel→distilled, 007 tranché, 003 tranché, +060, +061 ; catégorie Mém +1, WF/Gouv pour 061).

CONTRAINTES : docs/knowledge/ (memoire.md, memory-patterns.md, project-doctrine.md, INDEX.md, +gouvernance/agent-patterns pour 061) + docs/backlog/. Ne touche PAS CLAUDE.md (idée touchant la constitution → backlog candidat self-audit). **AUCUN code / schéma `data/memory/` / config / .env** (c'est le BUILD Phase 4, pas ce cycle). §11 (aucun PAYG). Structure §12 (pas de stub ; jamais de chiffre inventé présenté comme sourcé). Pause à 80 % budget (le bonus RES-061 saute en premier). Toute contradiction avec l'archi MAS → signaler, pas intégrer.

SORTIE OBLIGATOIRE : `docs/learning/2026-06-06-vibeflow-memoire-reaudit/build-report.md` (format build-report de README.md) — périmètre · table RES↔PDF · table décisions (implement/adapt/backlog/watch/reject) · **scan anti-stat-inventée (chiffre · PDF · présent ?)** · fichiers touchés · fidélité/écarts corrigés · RES-041 complété · RES-007/003 tranchés (preuve) · net-new RES-060 (+061 bonus) distillé · **alignement pont de persistance §5.bis** · contradictions signalées · questions ouvertes · commit proposé. NE COMMITE PAS. Laisse le working tree modifié.
