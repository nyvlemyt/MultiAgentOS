# VibeFlow — Gouvernance & Architecture (patterns extraits)

Patterns issus des ressources Notion @le_gouverneur_ia, catégorie Gouvernance. Source intégrale fetchée 2026-06-03.

---

## RES-057 — Base saine : 3 principes d'architecture lisible pour une IA

**Principe** : quand l'IA casse le code en boucle, ce n'est presque jamais le modèle. C'est l'organisation des fichiers. 3 garde-fous :

1. **Un fichier, une job** : seuil ~300 lignes → découper (cible 150-200). Un "god file" force l'IA à tout lire pour changer une chose → casse en cascade.
2. **Ranger par domaine de sens** (panier/paiement/catalogue), pas en dossiers techniques fourre-tout. **Dépendances dans un seul sens** : la logique métier ne dépend jamais des détails techniques (DB, affichage, services externes).
3. **Un filet de vérification qui tourne VRAIMENT** : tests de non-régression relancés à chaque modif. **Piège** : un filet qui ne tourne plus est pire que pas de filet (fausse sécurité).

**Ordre quand le projet casse déjà** : (1) stabiliser le filet d'abord, (2) puis découper les gros fichiers un par un en vérifiant le filet vert après chaque, (3) enfin ranger par domaine.

**Application MAS** :
- **Valide CLAUDE.md §7** "No new top-level files without updating §3" + la structure par packages (core/db/agents/skills/memory/tokens).
- **Valide RES-048** (agent < 200 lignes) au niveau projet : un package = un domaine de sens.
- Le "filet qui tourne vraiment" = nos 28 tests Vitest. Confirme la discipline `pnpm -w test` avant chaque commit (la vérification Phase 3 close).
- **Pattern dépendances unidirectionnelles** : `packages/core` (LLM injection) ne doit pas dépendre de `apps/web`. À vérifier si on ajoute un dependency-cruiser en Phase 5.

---

## RES-042 — OWASP Readiness Toolkit (Top 10 Agentic 2026)

**Principe** : OWASP Top 10 for Agentic Applications 2026 (publié déc 2025, premier cadre officiel sécurité agents). 3 risques les plus fréquents en prod :

| ID | Risque | Couverture MAS |
|----|--------|----------------|
| **ASI03** | Identity & Privilege Abuse (escalade) | Tier A/B mandats + dispatcher seul pont. Chaque agent a identité+role+mandat (fiche). ✅ |
| **ASI02** | Tool Misuse & Exploitation (outils hors mandat) | CLAUDE.md §5 risky actions + hook PreToolUse (Phase 6) + `required_skills` déclaré. ✅ partiel |
| **ASI06** | Memory & Context Poisoning (corruption mémoire) | Memory Keeper seul écrivain + consolidation RES-034 + règle "quoi NE PAS retenir". ⚠️ Phase 4 |

**Mapping complet des 10 (priorité MAS)** :
- ASI01 Goal Hijack — partiel (contracts limitent scope, mais injection indirecte via docs externes non couverte). **Pertinent** : MAS lit des projets externes → risque prompt injection via leurs fichiers. Sec Reviewer à instrumenter.
- ASI04 Supply Chain — non couvert. **Pertinent Phase 6** : audit des MCP servers (QMD, Notion) + skills externes (skills.sh, taste-skill). C'est notre "audit sécu avant install".
- ASI05 RCE — partiel (hook bloque destructif, pas le code généré puis exécuté).
- ASI07 Inter-Agent Comm — non couvert. **Pertinent Phase 5** : messages Tier A↔B via dispatcher.
- ASI08 Cascading Failures — partiel. **Pertinent** : circuit breakers budget (TOKEN_STRATEGY §8).
- ASI10 Rogue Agents — partiel (consolidation détecte drift).

**Application MAS** :
- **Le prompt maître OWASP-readiness = un audit que Sec Reviewer peut tourner sur un projet enregistré.** À intégrer comme skill `mas-sec-reviewer` capability ou `/audit-owasp`.
- Les 3 templates (contracts.md, hook pre-action, consolidate.md) correspondent à : AGENTS.md (contracts), hook PreToolUse Phase 6, Memory Keeper consolidation Phase 4.
- **ASI04 Supply Chain = notre politique "no skill installed without security audit"** (CLAUDE.md). Formaliser en ADR 0005 (Skill Install Policy).

---

## RES-040 — 3 dérives silencieuses : EVAL-XXX + protocoles

**Principe** : l'hallucination est une propriété statistique des LLMs, pas un bug. On ne la corrige pas avec un meilleur modèle, on l'encadre par un rituel d'évaluation. (Anthropic a laissé tourner une régression Sonnet "thinking medium au lieu de high" pendant 34 jours sans la voir.)

**3 dérives** :
| Dérive | Symptôme | Détection |
|--------|----------|-----------|
| Hallucination factuelle | cite API/chiffre/référence qui n'existe pas, avec assurance | cross-check 2e LLM (autre famille) sur rubrique 5 critères |
| Biais d'ancrage | l'output reflète le prompt plus que la réalité | reformuler en 3e personne neutre, comparer (écart >30% = manipulé) |
| Dérive temporelle | template 6 mois cite prix/règles/outils périmés | revue trimestrielle 4 questions |

**Template EVAL-XXX (8 champs)** : Date / Output évalué / Contexte / Méthode (LLM-as-Judge | cross-check | confrontation réalité | reformulation) / Score qualitatif (rubrique 5 critères /5) / Anomalies / Cause probable / Action (Keep/Correct/Deprecate/Escalation) / Learning associé.

**Table de fréquence d'éval** :
- Décision structurante (BDR) → confrontation réalité J+30
- Prédiction quantitative → J+30, J+60, J+90
- Template/contenu → trimestriel
- Agent/skill → à chaque update majeur
- Output critique prod publique → mensuel
- One-shot non engageant → aucune éval

**Slogan** : "Pas tout, pas tout le temps. Mais quelque chose, tout le temps."

**Application MAS Phase 3.5** :
- **EVAL-XXX = le format de sortie exact du Quality Controller.** `data/memory/<projectId>/evals/EVAL-<timestamp>.md`. 8 champs.
- **Cross-check par modèle d'autre famille** → argument FORT pour le multi-model router (Phase 3.5) : QC en o1-mini ou Gemini évalue un output produit par Claude → évite la boucle fermée (Piège 1 : "évaluer avec le même LLM hallucine sur les mêmes biais").
- **Protocole 2 (reformulation neutre, écart >30%)** → Mission Planner devrait, pour les décisions structurantes, générer 2 formulations et comparer (anti-ancrage). Lien avec self-consistency (skills-reference.md).
- **Piège 2 : "tests passent ≠ bon raisonnement"** → confirme la distinction Reviewer (P5-Vérifier la forme) vs Quality Controller (P8-Évaluer le raisonnement). Les deux, dans l'ordre.
- **Table de fréquence** → cadence d'éval par type de tâche, à encoder dans le risk classifier.

---

## RES-036 — DURCIR : les 3 niveaux de durcissement des règles

**Principe** : la mémoire est passive, le comportement est actif. Une règle écrite n'est pas une règle appliquée. Pour qu'une règle soit respectée, il faut la **durcir** (la promouvoir d'un niveau passif à exécutoire) et l'**auditer trimestriellement**.

**Les 3 niveaux** :
```
NIVEAU 3 — DOCTRINE (exécutoire)   → CLAUDE.md / fiche agent. Lu à chaque exécution, ne peut pas l'ignorer.
        ↑ si ignorée malgré contract OU criticité haute
NIVEAU 2 — CONTRACT (procédural)   → AGENTS.md / .claude/rules/. Chaque agent doit la respecter.
        ↑ si ignorée 2-3 fois
NIVEAU 1 — MÉMOIRE (consultatif)   → data/memory/. L'agent PEUT la consulter, PEUT l'ignorer.
```

**Critères de promotion** :
- 1→2 : ignorée 2-3× OU concerne plusieurs agents OU impact bloquant OU stable (testée 3+×)
- 2→3 : ignorée malgré contract OU criticité haute (légale/financière/identitaire) OU filtre systémique OU non-négociable partout
- **Saut direct 1→3** : criticité haute immédiate (copyright, leak, violation publique) OU ignorée dès la 1ère chance OU pattern systémique

**Rituels** :
- `drift-log.md` : journal des règles ignorées (date capitalisation / date détection dérive / délai durcissement / niveau initial→final)
- **Circuit Breaker** : 2h/trimestre, **SANS IA ouverte** (sinon l'agent valide ses propres règles = Delegation Feedback Loop). L'humain décide.
- Audit trimestriel par agent (4 questions : mandat valide ? périmètre exact ? critères corrects ? sources actives ? + "Si je découvrais cet agent aujourd'hui, signerais-je ce mandat ?")

**Application MAS** :
- **C'est le pipeline LRN → CLAUDE.md** formalisé en 3 niveaux. Le Memory Keeper promeut : learning récurrent (niveau 1) → règle projet (niveau 2, AGENTS.md/rules) → doctrine (niveau 3, CLAUDE.md). Seuil de promotion déterministe.
- **Le `drift-log.md` = un registre MAS** : quand un agent ignore une règle (détectable via Quality Controller), tracer. Si une famille dérive en <7 jours → écrire directement niveau 3.
- **Circuit Breaker SANS IA** = rituel humain de Melvyn (pas un agent). MAS peut le *préparer* (exporter BDR/EDR/fiches) mais ne le *conduit* pas. Phase 6+.
- **Audit trimestriel par agent** = le `quarterly-agent-audit.md`. MAS peut générer le rapport, l'humain tranche.
- **"Delegation Feedback Loop"** : danger architectural majeur — un agent ne valide jamais ses propres règles. Confirme : Quality Controller ≠ exécutant (instance séparée).

---

## RES-055 — Anthropic 15 juin : billing (déjà dans CLAUDE.md §11)

Intégré : Agent SDK subscription = crédit mensuel séparé de Claude.ai depuis 2026-06-15. Voir CLAUDE.md §11 + `docs/knowledge/anthropic-ecosystem.md`.

---

## Synthèse — Mapping Gouvernance

| Pattern | Composant MAS | Phase |
|---------|---------------|-------|
| Base saine 3 principes (057) | structure packages + filet test | validé |
| OWASP 3 risques (042) | Sec Reviewer audit + ASI04 install policy | 3.5, 6 |
| EVAL-XXX 8 champs + 3 dérives (040) | Quality Controller output format + multi-model cross-check | 3.5 |
| DURCIR 3 niveaux (036) | pipeline LRN→rules→CLAUDE.md + drift-log + circuit breaker | 4, 6 |

**Ressources 404 à récupérer** : RES-024 (audit 10 min), RES-023 (governance cadrage→monitoring), RES-022 (lean CLAUDE.md), RES-008 (3 dettes), RES-013 (starter kit), RES-006/004/003. Voir INDEX.md.
