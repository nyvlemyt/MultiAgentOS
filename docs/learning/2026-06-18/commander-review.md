# Revue de Commandant — 2026-06-18

> Capture intégrale de la vision donnée par l'utilisateur (le commandant) après livraison de
> Mission-dashboard (#30, mergé) et Agent Control Panel (Spec A, #31, draft). **Rien ne doit
> être perdu** : chaque idée est ici, taguée, et routée. Source = dump utilisateur 2026-06-18.

## 0. Principe directeur (énoncé par le commandant)

- **Aucune idée perdue.** Tout ce qu'on dit/ajoute → mémoire projet + `docs/knowledge/`. Une
  idée non prioritaire n'est pas jetée : elle est mise « sur le côté », prête à être écrite en phase.
- **On peut pousser les phases ouvertes** en sachant qu'on reviendra dessus (itératif assumé).
- **Pour donner de bonnes modifs, il faut d'abord l'arsenal** : plus de skills/agents/règles,
  installés + appris + testés en vrai, avant de décider quoi changer. Compétences = prérequis.

## 1. Idées capturées (brutes → structurées)

### I1 — Chat / Composer = un vrai espace type app Claude *(PRIORITÉ design produit)*
- « créer un espace comme l'app Claude. Je veux un putain de chatbot hyper pratique, plus de place. »
- Potentiellement **une page dédiée** au chat (pas seulement un panneau latéral).
- Référence visuelle/produit : **mammouth.ia** — plusieurs choix d'**agent SDK / LLM** dans l'UI.
- → Étend / redéfinit **Spec B (Rich Composer)** : ce n'est plus juste un composer enrichi,
  c'est un **espace conversationnel premium** avec sélecteur de modèle/agent.

### I2 — Acquérir TOUTES les compétences maintenant *(PRIORITÉ exécution — fait en premier)*
- « prendre toutes les compétences possibles maintenant : skills / agents / règles. »
- Les **installer, apprendre, utiliser pour voir si ça marche vraiment** (pas juste harvester).
- = campagne **ECC + Cybersecurité** (`docs/intake/2026-06-16-ecc-harvest/`), élevée au rang de
  **première phase** (la roadmap la traitait comme orthogonale ; le commandant la met devant).

### I3 — Audit design + disposition + vraie maquette type Figma *(via MCP)*
- Refaire un **audit** : pas que le design, aussi la **disposition des pages et des éléments**.
- On a **plein de composants** → faire **une vraie maquette (type Figma)**.
- → **trouver les connecteurs MCP** pour produire/piloter la maquette.
- Ensuite : intégrer tous les composants/idées/pages, **le plus beau design possible**, puis
  **modifier les pages en ajoutant les composants**.

### I4 — Mémoire reliée (second cerveau finalisé)
- **Revoir et finaliser la mémoire.**
- **Plein de MCP à faire.** Question ouverte : quel est le meilleur connecteur pour **Obsidian** ?
  (« j'ai plein de ressources à analyser pour bien le faire »).
- **qmd** : https://github.com/tobi/qmD — candidat connecteur mémoire/markdown à évaluer.
- **Garder TOUS les liens en mémoire** pour évolutions et MAJ futures. D'autres liens à venir.

### I5 — Persistance anti-oubli (méta)
- Tout ajout (skill/agent/règle/idée/lien) → mémoire projet, jamais perdu. Voir [[project_learning-bootstrap]].

## 2. Séquence maîtresse (ordre validé par le commandant)

> « une fois qu'on a pris les compétences, fait la maquette, mise en place → il faut faire la
> mémoire reliée. Puis tous les axes encore sur le côté, prêts à être écrits en phases. »

| # | Phase | Contenu | État entrée |
|---|-------|---------|-------------|
| **P1** | **Compétences** (ECC + cybersec) | Harvest → install → apprendre → tester pour de vrai. `docs/intake/2026-06-16-ecc-harvest/` (PLAN + KICKOFF prêts). Attended, budget levé. | prête à lancer |
| **P2** | **Maquette d'app** (Figma-like via MCP) | Audit design + **disposition pages/éléments** ; trouver le(s) MCP maquette ; concevoir le plus beau design intégrant tous nos composants/idées. | à cadrer (dépend partiellement de P1 pour les idées de skills/agents à exposer) |
| **P3** | **Mise en place** | Modifier les pages, ajouter les composants selon la maquette P2. Inclut I1 (espace chat type app Claude / page dédiée / sélecteur modèle-agent). | dépend P2 |
| **P4** | **Mémoire reliée** | Finaliser le second cerveau : MCPs, connecteur Obsidian (recherche du meilleur), qmd, registre de liens. | dépend P1 (skills mémoire) |
| **P5** | **Axes restants** | Tous les axes « sur le côté » écrits en phases (manager projet, export rapports, stats agent, vrai LLM capstone…). | continu |

**Priorité absolue immédiate : P1 (compétences).** Le reste découle.

## 3. Routage des items (où va quoi)

| Item | Type | Destination |
|------|------|-------------|
| I1 espace chat type app Claude | redéfinition feature | **Spec B élargie** — réécrire la spec avant de builder ; mémoire `project_ui_chat_space_vision` |
| I2 toutes compétences | phase exécution | **P1** = ECC harvest (déjà cadré) ; mémoire `project_ecc-harvest` (existe) |
| I3 audit design + maquette MCP | phase + recherche MCP | **P2** ; mémoire `project_design_audit_mockup` ; recherche MCP Figma |
| I4 mémoire reliée + Obsidian + qmd | phase + recherche | **P4** ; mémoire `project_linked_memory` + `reference_links_registry` |
| I5 anti-oubli | principe | renforce `project_learning-bootstrap` + cette doctrine de revue |
| Liens (qmd, mammouth, +à venir) | référence | `reference_links_registry` (mémoire) — append-only |

## 4. Finalisation de la situation actuelle (fait ce tour)

- **#30 Mission-dashboard** : mergé, PASS. Axes d'amélioration du commandant → P3 (intégrés à la
  refonte chat/maquette plutôt que rouverts isolément).
- **#31 Agent Control Panel** : Checker PASS 8/8 ; fix seed `e9f5c55` **poussé** → #31 réellement
  5/5 vert (Sonar re-confirmé sur HEAD `e9f5c55`). Reste **DRAFT** (le commandant merge).
- Doctrine de revue formalisée : `docs/workflows/commander-feedback-loop.md`.

## 5. Décisions en attente (à confirmer par le commandant)

1. **Lancer P1 (ECC harvest) maintenant ?** Attended + quota réel (budget lean levé pour la campagne). Feu vert ?
2. **Spec B** : je réécris la spec « espace chat type app Claude » (page dédiée + sélecteur modèle/agent, réf mammouth.ia) avant P3 ?
3. **Liens supplémentaires** : tu en avais d'autres à donner — balance-les, je les classe dans `reference_links_registry`.
