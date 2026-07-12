# File d'intake — arsenal effets visuels (7 candidats)

> **Reconstruction (2026-07-13).** L'original a été committé sur le poste Windows
> (commit `83fe731`, jamais poussé — absent de tous les refs remote). Reconstruit depuis
> le débrief de la session d'origine. Si le poste Windows repousse un jour son commit,
> fusionner les deux versions (la sienne fait foi pour les URLs exactes).

Statut : **queués, pas audités.** Règle projet : un item = un dossier = un passage
(`intake-audit`, cf. CLAUDE.md §13) — pas d'audit à la chaîne.

## ⚠️ Alerte sécurité (canal de livraison)

Deux « guides » du domaine 0xLoucash accompagnaient le lot :

1. **« Fable 5 system prompt leak — guide injection »** — s'annonce lui-même comme une
   attaque par injection de prompt (fuite d'instructions / détournement du modèle).
   **Ne jamais l'ouvrir dans une session Claude. À supprimer, aucune valeur.**
2. **« 4 repos effets visuels » (0xLoucash)** — même domaine, jeton dans l'URL. Mis en
   **quarantaine** : le canal a servi à livrer une attaque, donc récupération en lecture
   seule + scan (Sanitize) avant lecture — jamais de confiance sur parole. À noter :
   0xLoucash est par ailleurs une source déjà utilisée légitimement (design-stack
   Phase 7 en vient), le contenu est probablement sain ; c'est le canal qui est suspect.

## Les 7 candidats — une pyramide, pas une liste plate

| # | Candidat | Rôle dans la pyramide |
|---|----------|----------------------|
| 1 | **react-three-fiber** (équipe poimandres) | Fondation WebGL — le seul vrai choix de dépendance du lot ; shadergradient et les effets shader reposent dessus |
| 2 | **shadergradient** | Dégradés shader au-dessus de r3f. La longue URL `shadergradient.co` fournie = config exportée (dégradés violet/bleu `#809bd6`→`#af38ff`, grain activé) — à conserver comme préréglage utilisateur |
| 3 | **liquid-logo** | Effet shader (logo liquide) |
| 4 | **liquid-glass** | Effet shader (verre liquide) |
| 5 | **skiper-ui** | Bibliothèque de composants animés — recoupe probablement vengenceui |
| 6 | **vengenceui** | Bibliothèque de composants animés — recoupe probablement skiper-ui |
| 7 | **animmasterlib** | Bibliothèque d'animations |

## Ordre d'audit (fondation d'abord)

1. `react-three-fiber` — **commencer ici** : trancher cette dépendance débloque tout le reste.
2. `shadergradient` → `liquid-logo` / `liquid-glass` (effets, dépendent de 1).
3. `skiper-ui` / `vengenceui` / `animmasterlib` (libs UI, dédupliquer entre elles).

Un dossier `docs/intake/<date>-<slug>.md` chacun.

## Agents & skills pour l'exploitation

Déjà disponibles dans le lot Tier B / skills :

- **Agents** : Frontend Developer · UI Designer · Senior Developer (fiche mentionne
  explicitement l'intégration Three.js) · UX Architect.
- **Skills** : `frontend-design` · `taste` · `gsap-skills`.

## Décisions en attente (utilisateur)

- **Destination** : polish cockpit (Phase 7, comme le design-stack) ou plus tôt pour
  l'Orbit view ?
- **Vigilance §11** : skiper-ui / vengenceui sont souvent freemium — vérifier qu'aucun
  n'exige de clé API payante avant tout `adopt`.
