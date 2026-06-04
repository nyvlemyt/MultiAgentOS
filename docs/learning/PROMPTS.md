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

## Cycle courant : `2026-06-04-vibeflow-reaudit`

**{{SCOPE}}** = Reconcilier + ré-auditer la distillation vibeflow (faite avant sur sources MCP incomplètes, beaucoup en 404) contre les 43 PDFs maintenant présents. Non-exhaustif : priorise où un PDF existe ET la distillation précédente était partielle/absente. Inclut 2 corrections Batch 1 confirmées par un vérificateur :
- **gouvernance.md §RES-024** : stat « 40% Gartner » présentée comme sourcée mais ABSENTE du PDF "Audite tes agents IA en 10 minutes" → retirer/re-sourcer. Vérifier qu'aucune autre stat inventée ne traîne.
- **RES-023** : PDF "Structurer la gouvernance AVANT de déployer tes agents IA.pdf" lu mais NON distillé (4 piliers + checklist pré-deploy + contrat d'agent long-form / contract.yaml 100+ lignes). Trancher le mapping RES et distiller le net-new, ou justifier le skip.
