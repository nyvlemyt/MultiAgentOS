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
1. Mapping RES↔PDF par TITRE (les noms de docs/resources/ ne portent pas le numéro RES sauf RES-040). Marque "non mappable" / "nouveau".
2. Pour chaque ressource du périmètre : ouvre le PDF source + le passage distillé existant, vérifie fidélité, corrige toute invention/sur-interprétation, enrichis les trous. Décision enum (implement_now/adapt_now/backlog_next/watch/reject) + justif.
3. Distille le retenu dans les fichiers docs/knowledge/ EXISTANTS (pas de nouveaux fichiers sauf nécessité). Mets à jour les statuts INDEX (vraie source : PDF vs MCP).

CONTRAINTES : ne touche PAS CLAUDE.md (idée touchant la constitution → backlog candidat self-audit). Aucun code/config runtime/.env. §11 (aucun PAYG adopté). Structure §12 (pas de stub ; principes + source citée ; jamais de chiffre absent du PDF présenté comme sourcé). Pause à 80% budget. Signale toute contradiction avec l'archi MAS, ne l'intègre pas en silence.

SORTIE OBLIGATOIRE (avant le résumé terminal) : écris docs/learning/{{CYCLE_SLUG}}/build-report.md au format build-report de README.md (périmètre · table RES↔PDF · table décisions · fichiers touchés · fidélité/écarts corrigés · contradictions signalées · questions ouvertes · commit proposé). NE COMMITE PAS. Laisse le working tree modifié. STOP — aucune phase de build.
```

## Template CHECKER (session B, fraîche)

```
Lis CLAUDE.md (§11, §12, §13), docs/learning/README.md, puis docs/learning/{{CYCLE_SLUG}}/build-report.md.

Tu es le CHECKER indépendant du cycle "{{CYCLE_SLUG}}". Tu ne fais confiance à AUCUNE affirmation du build-report : tu vérifies tout depuis les PDFs sources (docs/resources/) et les fichiers réels. Défaut = sceptique. Tu NE modifies AUCUN fichier.

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


## Cycle courant : `2026-06-07-vibeflow-paradigmes-statsweep`

> Ajuste le préfixe date au jour réel où tu lances (convention `YYYY-MM-DD`).

**Type** : cycle MIXTE = (A) distillation net-new RES-061 + (B) stat-sweep léger de la dette mémoire ère-MCP. Pré-vol Phase 3.5 + apurement de [self-audit-memoire-reaudit-debt.md](../backlog/self-audit-memoire-reaudit-debt.md). **Ordre : B d'abord (cheap, haute intégrité), A ensuite (droppe en premier si budget 80 %).**

**{{SCOPE}}** =
- **PARTIE B — stat-sweep (priorité, cheap)** : re-vérifier contre PDF les chiffres des distillations mémoire faites sous ère-MCP, JAMAIS re-confrontées (risque « 40 % Gartner » dormant dans `memoire.md`). Glance ciblé sur les NOMBRES, pas une re-distillation. Cibles, par priorité :
  - **RES-044** (`Rituel close-out de session 3 champs...pdf`) → la friction **« n°9 / n°10 »** (sub-agents MCP / 200+ entrées). PRIORITÉ 1.
  - **RES-034** (`Le rituel de consolidation memoire 4 actions...pdf`) → seuils « promouvoir 3 / index > 50 / 30 min·mois ».
  - **RES-045** (`Le cadre mental pour savoir par ou commencer.pdf`) → « 3 couches / diagnostic ».
  - **RES-029 / RES-056** → recoupe si budget (risque plus faible, déjà 📁 local).
  Chaque chiffre présenté comme sourcé dans `memoire.md` DOIT exister dans son PDF → sinon corrige/neutralise (comme « 95 % » / « 40 % Gartner »).
- **PARTIE A — distiller RES-061** (`Les 3 Paradigmes de la Gouvernance IA Du Prompt à l'Orchestre.pdf`) → fichier knowledge le plus adapté (`gouvernance.md` pour le cadrage gouvernance, ou `agent-patterns.md` pour l'angle orchestration — choisis selon le contenu réel, cross-ref si besoin). RES-061 = n° **local** (déjà dans INDEX, Gouv→14, `backlog_next:Phase3.5` → `distilled`). ⚠️ scan anti-stat sur ce PDF aussi.

MÉTHODE :
1. **(B)** Pour RES-044/034/045 (+029/056) : ouvre le PDF, localise chaque chiffre cité dans `memoire.md`, confirme verbatim OU corrige/neutralise + flag. Table « chiffre · PDF · page · présent ? · action ».
2. **(A)** Intake-audit COMPLET de RES-061 (cf. `intake-audit-template.md`) : ouvre le PDF, distille les 3 paradigmes dans le fichier existant choisi — structure §12 (Principes + source citée, jamais de chiffre absent du PDF présenté comme sourcé). Décision enum + justif. Cross-ref archi MAS (orchestrator-workers RES-035, modes audit RES-037) ; contradiction → signaler, pas intégrer.
3. Mets à jour INDEX : RES-061 `distilled`, et la dette stat (clear les ⏳ de RES-044/034/045 si vérifiés). Mets à jour [self-audit-memoire-reaudit-debt.md](../backlog/self-audit-memoire-reaudit-debt.md) §1 (résolu ou reste).

CONTRAINTES : docs/knowledge/ (memoire.md, gouvernance.md OU agent-patterns.md, INDEX.md) + docs/backlog/. Ne touche PAS CLAUDE.md. **AUCUN code / config / .env**. §11 (aucun PAYG). Structure §12. **Pause à 80 % budget — la PARTIE A (RES-061) saute en premier ; la PARTIE B (stat-sweep) est prioritaire car elle protège du savoir déjà committé.** Contradiction archi → signaler.

SORTIE OBLIGATOIRE : `docs/learning/2026-06-07-vibeflow-paradigmes-statsweep/build-report.md` (format README.md) — périmètre · **(B) table stat-sweep (chiffre · PDF · page · présent ? · action)** · **(A) RES-061 distillé (décision + fichier + fidélité)** · scan anti-stat RES-061 · fichiers touchés · dette §1 apurée ou restante · contradictions signalées · questions ouvertes · commit proposé. NE COMMITE PAS. Laisse le working tree modifié.
