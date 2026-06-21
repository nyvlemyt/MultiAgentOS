# ECC Harvest — décisions cluster `skill:vertical` (lot R)

Doer: lot R (7 skills). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit, barre VERTICAL (CLUSTERS.md) — garder (adopt/adapt) UNIQUEMENT si FORT + auto-suffisant dans son domaine; rejeter niche/thin/low-reuse, cœurs d'envoi-sortant/paiement (§5), ou dup-sans-mieux.
Source ECC: `affaan-m/ecc` (MIT, sauf `inventory-demand-planning` + `logistics-exception-management` = Apache-2.0 déclarés en frontmatter source). Cible keepers: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B). Aucun équivalent vertical (réseau-homelab, demand-planning, freight-claims) dans nos assets → pas de dup.
Recadrage transverse: MAOS = abonnement (§11), unités de quota jamais $/€. Tout push de config-device / génération de clé / appel API externe = §5-gated (validation humaine). Sanitize (regex secrets/PII/internal + `@anthropic-ai/sdk`): 7/7 sources clean, aucun secret en dur (les sources homelab utilisent des placeholders `<paste_...>`), aucun import SDK.

---

## homelab-vlan-segmentation
- **décision**: adapt
- **raison**: doctrine réseau forte et auto-suffisante — segmentation IoT/guest/trusted/servers, isolation par firewall, mapping SSID→VLAN, ports trunk/access, anti-patterns concrets (VLAN sans règle = pas de sécurité, native=management → VLAN-hopping). Lentille checklist sécurité-réseau que MAOS ne possède pas. Recadrée: tout `apply` de config (UniFi/pfSense/MikroTik/iptables) sur un device est une action à effet de bord → §5-gated (validation humaine), le skill ne fait que produire le plan/diff.
- **dedup**: non — `Security Engineer`/`Threat Detection Engineer` font threat-modeling/SIEM, pas de design VLAN homelab; rien d'équivalent dans les 24 skills.
- **chemin library**: `packages/skills/library/homelab-vlan-segmentation/SKILL.md`
- **état**: keeper écrit au format §12 (ligne 1 `---`, commentaire source, summary L1, metadata complet cluster:skill:vertical/tier:T2, Prompt Defense Baseline verbatim + 7 sections). Reframe quota, push-device marqué §5. 0 secret, 0 `@anthropic-ai/sdk`.

## homelab-wireguard-vpn
- **décision**: adapt
- **raison**: doctrine VPN forte et auto-suffisante — setup serveur, génération de keypair par client, split-tunnel vs full-tunnel, règles iptables forward *scopées* (pas de blanket ACCEPT), DDNS, troubleshooting handshake. Hygiène clé exemplaire (umask 077, chmod 600, jamais en VCS). Lentille accès-distant que MAOS n'a pas. Recadrée: génération de clé + écriture de `wg0.conf` + push iptables = actions à effet de bord / matériel sensible → §5-gated; le helper Python génère des chaînes de config, n'exécute aucun envoi.
- **dedup**: non — rien d'équivalent dans les 24 skills / 56 agents (le plus proche, `Security Engineer`, ne couvre pas le tunneling WireGuard opérationnel).
- **chemin library**: `packages/skills/library/homelab-wireguard-vpn/SKILL.md`
- **état**: keeper écrit au format §12 (8 sections, Prompt Defense Baseline verbatim, summary L1, metadata cluster:skill:vertical). Clés = placeholders (`<paste_..._key>`), aucun secret réel; helper de build de config conservé mais cadré "écrire en mode 600, ne jamais logger". 0 `@anthropic-ai/sdk`.

## inventory-demand-planning
- **décision**: adapt
- **raison**: expertise domaine très dense et auto-suffisante — sélection de méthode de prévision par pattern (MA/SES/Holt-Winters/Croston/causal/ML), métriques (WMAPE, biais, tracking signal), safety stock (formules demande+lead-time variability, intermittent, new-product analog), ABC/XYZ + matrice de politique, planning promo (lift, cannibalisation, forward-buy, post-promo dip), transitions saisonnières, kill-decision slow-mover. Cadres de décision binaires/tabulaires = matière première idéale pour un skill §12. Aucune exécution ni egress; pur raisonnement cognitif.
- **dedup**: non — aucun de nos 56 agents ni 24 skills ne couvre la planification de la demande retail (`Data Engineer`/`Database Optimizer` = infra data, pas forecasting demand-planner).
- **chemin library**: `packages/skills/library/inventory-demand-planning/SKILL.md`
- **état**: keeper écrit au format §12 (Prompt Defense Baseline verbatim + 7 sections, summary L1, metadata cluster:skill:vertical/tier:T2). Source Apache-2.0 → license:Apache-2.0 en metadata. Reframe: les chiffres $ du domaine (valeur SKU, marge) sont des données métier de l'utilisateur, PAS du coût LLM; aucune confusion avec le quota MAOS. 0 secret, 0 `@anthropic-ai/sdk`.

## ios-icon-gen
- **décision**: reject
- **raison**: utilitaire de génération d'images niche, NON auto-suffisant et low-reuse. Le cœur du skill délègue à des scripts externes empaquetés (`$SKILL_DIR/scripts/iconify_gen.sh` qui frappe l'API Iconify = egress réseau, et `generate_icons.swift` qui exige `swift`/SF Symbols donc macOS-only). Sans ces binaires + l'accès réseau, le skill est une coquille; une fois l'egress strippé (barre VERTICAL: strip external exec/egress), il ne reste qu'un tableau de noms d'icônes SF Symbols — trop mince pour un §12. Hors-domaine pour un command-center multi-agent local-first; flaggé likely-reject dans CLUSTERS.md.
- **dedup**: partiel — la génération d'assets visuels recoupe `canvas-design`/`algorithmic-art` (qu'on possède), mais sans les surpasser; dup-sans-mieux sur la partie réutilisable.
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: dépendance à exec/egress externes (script appelant l'API Iconify + toolchain Swift macOS-only) que la barre VERTICAL impose de stripper → squelette sans valeur; niche/low-reuse; dup-sans-mieux de canvas-design. Re-audit: non, sauf si un besoin récurrent et concret de génération d'icônes iOS apparaît dans un projet réel enregistré — et alors comme outil, pas comme skill.

## ito-market-intelligence
- **décision**: reject
- **raison**: recherche prediction-market (Polymarket/Kalshi/Itô) finance-adjacente. Le cœur fonctionnel dépend d'un `ITO_API_KEY` gaté + d'egress vers des venues externes et `deep-research`/`exa-search`/`x-api` (chaînes de skills absentes chez nous). Une fois l'egress strippé (barre VERTICAL), il ne reste qu'un template de brief générique "séparer faits/signaux/interprétation, pas de conseil d'investissement" — mince, non auto-suffisant, hors-domaine pour un command-center de dev local-first. Frôle §5 (domaine finance/trading) même en lecture seule.
- **dedup**: oui sur la partie sûre — la lentille "recherche source-grounded + caveats" recoupe nos compétences research existantes sans les surpasser; le reste = egress externe gaté.
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: dépendance API externe gatée (`ITO_API_KEY`) + egress vers venues prediction-market que VERTICAL impose de stripper → reste un teaser mince; domaine finance/trading (§5-adjacent); dup-sans-mieux de la recherche. Re-audit: non, sauf si MAOS scope explicitement un domaine "market-research/trading" en ROADMAP, et alors via `config/permissions.json` + gate §5, jamais ce teaser.

## ito-trade-planner
- **décision**: reject
- **raison**: worksheet de planification de trade prediction-market — domaine trading/finance (§5-adjacent). Même non-exécutant et non-advisory par construction (que des checklists/tables de paramètres), il reste mince, dépend de `ITO_API_KEY` gaté + d'une chaîne `prediction-market-risk-review` qu'on n'a pas, et est hors-domaine pour un command-center de dev local-first. La seule lentille transférable — "construire un worksheet neutre avant toute action, exiger approbation humaine" — on l'a déjà via le gate §5 + autonomy `manual`. Frère du `ito-market-intelligence`: même verdict.
- **dedup**: oui — la discipline "research→approval humaine avant exécution" = dup-sans-mieux de §5 + niveaux d'autonomie (CLAUDE.md §4).
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: domaine trading/finance (§5-adjacent) + dépendance à des chaînes externes absentes + lentille gate-humain = dup-sans-mieux de §4/§5; trop mince une fois le venue-binding retiré. Re-audit: non, même condition que `ito-market-intelligence` (scope finance explicite en ROADMAP requis).

## logistics-exception-management
- **décision**: adapt
- **raison**: expertise freight très dense et auto-suffisante — taxonomie d'exceptions (delay/damage visible+concealed+temp/shortage/overage/refusal/lost), comportement carrier par mode (LTL/FTL/parcel/intermodal/ocean/air), fondamentaux de claims (Carmack, fenêtre 9 mois, docs requis), classification de sévérité 3-axes, arbre eat-the-cost vs fight-the-claim, séquençage de priorité, red flags fraude, protocoles d'escalade. Cadres de décision binaires/tabulaires = matière §12 idéale. Aucune exécution ni egress; pur raisonnement opérationnel. Les templates de comms sont des brouillons à valider, pas des envois — pas de §5 (aucun envoi sortant automatique).
- **dedup**: non — aucun de nos agents/skills ne couvre la gestion d'exceptions fret (`Incident Response Commander` = incidents prod logiciels, pas freight claims).
- **chemin library**: `packages/skills/library/logistics-exception-management/SKILL.md`
- **état**: keeper écrit au format §12 (Prompt Defense Baseline verbatim + 7 sections, summary L1, metadata cluster:skill:vertical/tier:T2). Source Apache-2.0 → license:Apache-2.0. Reframe: chiffres $ = exposition financière métier de l'utilisateur, pas du quota LLM; templates = brouillons (le skill ne fait JAMAIS d'envoi — §5 respecté). 0 secret, 0 `@anthropic-ai/sdk`.

---

## Bilan lot R
7 audités · **4 keepers** (homelab-vlan-segmentation, homelab-wireguard-vpn, inventory-demand-planning, logistics-exception-management) · 3 rejets (ios-icon-gen, ito-market-intelligence, ito-trade-planner). Chaque keeper = SKILL.md §12 sous `packages/skills/library/<slug>/`. Tout chiffre $ des verticals = données métier utilisateur, jamais quota MAOS. Push-device (homelab) marqué §5-gated; aucun envoi sortant automatique dans les comms logistics.
