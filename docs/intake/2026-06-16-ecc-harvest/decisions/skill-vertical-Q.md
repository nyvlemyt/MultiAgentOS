# ECC Harvest — décisions cluster `skill:vertical` (lot Q)

Doer: lot vertical-Q (7 skills). Worktree `maos-ecc`. Méthode: intake-audit, barre VERTICAL (out-of-product) — keep (adopt/adapt) UNIQUEMENT si fort + auto-suffisant dans son domaine (doctrine réutilisable réelle). Reject si niche/mince/faible-réutilisation, ou si le cœur est exécution/egress (send/paiement/PHI-egress, §5), ou dup-not-better.
Source ECC: `affaan-m/ecc` (MIT — quelques fiches sous Apache-2.0, compatible; on conserve `license:` réel dans la metadata). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + `packages/skills/library/` existant (notamment `homelab-network-readiness`, `hipaa-compliance`, `healthcare-*`).
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG. Tout chiffre métier ($/€ tarifs fret/énergie/douane) = chiffres du DOMAINE de l'utilisateur final, conservés tels quels (ce ne sont PAS des coûts LLM); seul le coût LLM/quota MAOS se mesure en quota units. Aucune fiche n'exécute d'I/O réseau, de paiement, ni ne manipule de PHI réelle.
Sanitize (regex secrets/PII/internal + `@anthropic-ai/sdk`): voir par item. `fal-ai-media` portait une clé `FAL_KEY` + `ELEVENLABS_API_KEY` → motif de rejet (§5/§11), non importé en library.

Décisions: 5 keepers (3 adopt + 2 adapt), 2 reject.

---

## carrier-relationship-management
- **décision**: adopt
- **raison**: doctrine opérationnelle forte et auto-suffisante de gestion de portefeuille transporteurs fret (vetting FMCSA, décomposition tarifaire par composant, routing guides 3-deep, scorecard 5 métriques actionnables, RFP pondéré, règles consolidation/diversification/exit). 15+ ans d'expertise codifiée, aucune exécution sortante: pure lentille de raisonnement/recommandation. Les $ = économies fret de l'utilisateur (domaine), pas du coût LLM.
- **dedup**: non — rien d'équivalent en library; voisin lointain `lead-intelligence`/`finance-billing-ops` mais domaine et doctrine distincts.
- **sanitize**: clean — 0 secret/PII, 0 `@anthropic-ai/sdk`, aucun endpoint exécutable. License source = Apache-2.0 (compatible MIT), conservée telle quelle dans la metadata.
- **chemin library**: `packages/skills/library/carrier-relationship-management/SKILL.md`
- **état**: boosté §12 (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata complet, Prompt Defense Baseline verbatim, 8 sections = Overview/When/Principles(cite source)/Process/Rationalizations(table)/Red Flags/Verification(binaire)). Recadrage §5 (advisory-only, jamais de tender/paiement sortant) + §11 ($ fret ≠ quota) injecté. 0 import SDK.

## customs-trade-compliance
- **décision**: adopt
- **raison**: doctrine forte et auto-suffisante de conformité douanière/commerce international (classification HS via GRI en ordre strict, hiérarchie de valorisation WTO, Incoterms 2020, optimisation droits FTA/FTZ/drawback, adjudication restricted-party screening, mitigation pénalités via prior disclosure). Pure analyse: le screening décrit est de l'**adjudication de raisonnement**, PAS un pipeline d'exécution/egress — aucune soumission d'entrée, aucun appel API gouvernement/broker, aucun paiement.
- **dedup**: non — aucun équivalent en library; ne recoupe pas `hipaa-compliance` (santé) ni les autres compliances.
- **sanitize**: clean — 0 secret/PII, 0 `@anthropic-ai/sdk`, 0 endpoint exécutable. License Apache-2.0 conservée.
- **chemin library**: `packages/skills/library/customs-trade-compliance/SKILL.md`
- **état**: boosté §12 (8 sections, Prompt Defense verbatim, summary L1 ≤200 tok, metadata complet). Garde-fou explicite: §5 (jamais de filing/screening-live/paiement) + §11 ($ douane = économies du domaine, pas quota). 0 import SDK.

## energy-procurement
- **décision**: adopt
- **raison**: doctrine forte et auto-suffisante d'achat d'énergie C&I (load profiling depuis données 15-min, décomposition facture par composant, stratégies fixed/index/block-and-index/layered, mitigation demand-charge à valeur empilée, évaluation PPA physique/virtuel + RECs, reporting Scope 2). Pure analyse/modélisation: aucune exécution de trade, signature PPA, dispatch batterie ni enrôlement programme.
- **dedup**: non — aucun équivalent en library.
- **sanitize**: clean — 0 secret/PII, 0 `@anthropic-ai/sdk`, 0 endpoint exécutable. License Apache-2.0 conservée.
- **chemin library**: `packages/skills/library/energy-procurement/SKILL.md`
- **état**: boosté §12 (8 sections, Prompt Defense verbatim, summary L1 ≤200 tok, metadata complet). Garde-fou: §5 (advisory-only, jamais de trade/PPA/dispatch/enrollment; VPPA = flag trésorerie/ISDA, pas une décision ici) + §11 ($ énergie = économies du domaine, pas quota). 0 import SDK.

## fal-ai-media
- **décision**: reject
- **raison**: wrapper mince au-dessus d'une API média tierce payante (fal.ai via MCP, génération image/vidéo/audio facturée per-unit), avec en prime un snippet `ELEVENLABS_API_KEY` (TTS payant) et une config MCP exigeant `FAL_KEY`. Le cœur du skill EST l'exécution/egress payante vers un service tiers → §5 (envoi sortant + appels réseau hors allowlist) et §11 (API payante, opt-in/default-OFF au mieux, jamais un skill library d'office). De plus le skill se déclare lui-même "drift-prone" (model IDs/prix/tool names changent vite) = faible durabilité. La seule lentille transférable — un pipeline média générique (itérer en modèle bon-marché puis finaliser, seed pour reproductibilité, estimer le coût avant un job lourd) — est trop mince pour justifier une fiche dédiée et recoupe déjà `video-editing` / `content-engine` en library.
- **dedup**: lentille pipeline média = couverte par `video-editing` + `content-engine` (dup-no-better); le reste = exécution payante tierce, unsafe par construction.
- **sanitize**: NON-clean — contient `FAL_KEY`/`ELEVENLABS_API_KEY` placeholders + endpoint `api.elevenlabs.io` + `npx fal-ai-mcp-server` non-épinglé. Motif de rejet, pas de strip-and-keep (il ne resterait qu'une coquille).
- **chemin library**: aucun (T0).
- **KILL**: API média tierce payante au cœur (§11) + egress/exec réseau payant (§5) + clés API tierces + skill auto-déclaré drift-prone. Re-audit: seulement si MAOS scope explicitement un "media agent" en ROADMAP, et alors via provider opt-in sous `packages/core/src/providers/` (§11.bis) + déclaration de catégorie risquée dans `config/permissions.json`, jamais comme skill library exécutant un appel payant.

## healthcare-phi-compliance
- **décision**: adapt
- **raison**: par instruction du lot, on garde UNIQUEMENT la lentille compliance/checklist, jamais du code qui manipule de la PHI réelle. La source est précisément ça côté valeur: une lentille **multi-juridiction** (HIPAA/DISHA/GDPR) de classification (PHI vs PII non-patient) + liste de leak-vectors + checklist pré-déploiement binaire — distincte de notre `hipaa-compliance` existant (qui couvre les *decision-gates* HIPAA + BAA/covered-entity). Adaptée: tout le code SQL/RLS/TypeScript manipulant de la PHI a été **strippé**; réécrite en skill de revue/audit only. Renvoi explicite vers `hipaa-compliance` pour les gates HIPAA et vers `mas-sec-reviewer` pour le gate risk:high/blocking.
- **dedup**: chevauchement partiel avec `hipaa-compliance` — résolu par scoping serré: ici = classify+leak-vector+deploy-checklist cross-régime; là-bas = HIPAA gates/BAA. Pas dup-no-better (lentille complémentaire, pas redondante).
- **sanitize**: source clean côté secrets (0 `@anthropic-ai/sdk`, 0 vraie PII — exemples génériques). Strip applied = retrait du code PHI-handling (RLS/schema/handlers) pour respecter "jamais de code manipulant de la PHI réelle" (§5/§8). La fiche library ne contient AUCUN bloc de code.
- **chemin library**: `packages/skills/library/healthcare-phi-compliance/SKILL.md`
- **état**: boosté §12 (8 sections, Prompt Defense verbatim, summary L1 ≤200 tok, metadata complet, license:MIT — origin recadrée affaan-m/ecc). Review-only, 0 bloc de code, 0 PHI, 0 import SDK. Re-audit: si `hipaa-compliance` absorbe un jour la lentille classification/checklist cross-régime, fusionner.

## homelab-network-setup
- **décision**: adapt
- **raison**: lentille de **design greenfield** réseau home/lab (séparation des rôles, choix de classe de passerelle selon l'opérateur, plan IP/DHCP/DNS, anti-patterns débutant). Distincte de notre `homelab-network-readiness` existant qui couvre la **revue de changement risqué** sur un réseau vivant (cutover VLAN, déplacement DNS, ajout VPN). Adaptée: scoping serré sur la conception-sur-papier; tout changement live + config plateforme-spécifique renvoyés à `homelab-network-readiness`; rappel §5 (infra hors sandbox, jamais exécuté depuis MAOS).
- **dedup**: chevauchement avec `homelab-network-readiness` — résolu par division nette: ici = planifier un réseau neuf; là-bas = réviser/sécuriser un changement sur un réseau existant. Complémentaire, pas dup-no-better.
- **sanitize**: clean — 0 secret/PII, 0 `@anthropic-ai/sdk`. Pas de commandes plateforme exécutables (volontairement retirées au profit du plan).
- **chemin library**: `packages/skills/library/homelab-network-setup/SKILL.md`
- **état**: boosté §12 (8 sections, Prompt Defense verbatim, summary L1 ≤200 tok, metadata complet, license:MIT). Plan-only, renvoi explicite vers readiness pour l'exécution/risque, §5 rappelé. 0 import SDK.

## homelab-pihole-dns
- **décision**: reject
- **raison**: flaggé likely-reject (niche) dès CLUSTERS.md, confirmé. Le cœur du skill = un **how-to d'installation Pi-hole** très spécifique à un produit: docker-compose, `curl https://install.pi-hole.net | bash`, install bare-metal, commandes `pihole -g`/`pihole -w`, config cloudflared/DoH. C'est de l'exécution d'infra hors-produit, plateforme-spécifique, à faible réutilisation transverse. La seule lentille SÛRE et transférable (le DNS-filtering local comme dépendance avec fallback, réservation d'adresse, test sur un client d'abord) est **déjà couverte** par `homelab-network-readiness` (qui nomme explicitement Pi-hole/AdGuard/Unbound) et le plan DNS de `homelab-network-setup` (keeper ci-dessus). Garder le how-to d'install n'apporterait qu'une recette produit fragile que MAOS ne doit de toute façon pas exécuter (§5, infra hors sandbox).
- **dedup**: oui — lentille DNS-filtering = dup-no-better de `homelab-network-readiness` + `homelab-network-setup`. Le delta unique (recette d'install Pi-hole) = exactement la partie à ne pas adopter.
- **sanitize**: la source était prudente (`WEBPASSWORD` via `.env`/secret, tag épinglé, "review before running") mais le contenu reste un installeur `curl|bash` + commandes système — non pertinent pour une fiche library MAOS.
- **chemin library**: aucun (T0).
- **KILL**: how-to d'install produit-spécifique niche (faible réutilisation) + cœur = exécution d'infra hors sandbox (§5) + lentille sûre dup-no-better de readiness/setup. Re-audit: non, sauf si un futur domaine "homelab ops exécutant" est scopé en ROADMAP — et alors la doctrine vient de readiness, pas d'une recette d'install.

