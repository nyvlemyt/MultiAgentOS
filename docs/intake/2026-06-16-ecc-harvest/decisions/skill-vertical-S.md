# ECC Harvest — décisions cluster `skill:vertical` (lot S)

Doer: lot vertical-S (8 skills). Worktree `maos-ecc`. Méthode: intake-audit, barre VERTICAL (CLUSTERS.md) — verticaux hors-produit, on garde (adopt/adapt) UNIQUEMENT si FORT + auto-suffisant; on rejette niche/mince/faible-réutilisation, cœurs exec-sortant (§5), dup-pas-mieux.
Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B). Aucun vertical réseau/manufacturing/diagnostic n'existe encore chez nous → 0 collision sur les keepers de ce lot.
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG, PAS de clé API tierce payante. Tout chiffre $/€ d'origine → recadré en quota d'abonnement ou retiré. Exec sortant (SSH config-push, curl egress) → strippé du chemin par défaut et §5-gated.
Sanitize (regex secrets/PII/internal + `@anthropic-ai/sdk`): aucun secret en dur dans les 8 sources (netmiko = pattern env-var/getpass = sûr; nutrient = `NUTRIENT_API_KEY` réel → motif central de rejet). `@anthropic-ai/sdk`: absent des 8 sources. Adresses d'exemple = plages de documentation (192.0.2.x) — laissées telles quelles.

Bilan: **6 keepers, 2 rejets.**

---

## netmiko-ssh-automation
- **décision**: adapt
- **raison**: doctrine Python Netmiko dont le **cœur transférable est la lentille read-only + safety-defaults** (collecte `send_command()`, inventaire explicite borné, timeouts conn/auth/read, concurrence bornée, credentials par env-var/getpass jamais en dur, parsing TextFSM comme optimisation pas preuve). Forte et auto-suffisante dans son domaine (automatisation réseau), aucun équivalent chez nous.
- **exec sortant §5**: le `send_config_set()` / `save_config()` (config-push SSH sur device prod) est un exec sortant mutant — **retiré du chemin par défaut, marqué §5-gated** (dry-run d'abord, flag opérateur explicite, save = approbation séparée, evidence before/after). Le SKILL réécrit garde le pattern *diagnostic* et encadre le push comme action gated, jamais auto.
- **dedup**: non — aucun skill/agent réseau chez nous.
- **chemin library**: `packages/skills/library/netmiko-ssh-automation/SKILL.md`
- **état**: keeper boosté §12. Credentials = env-var/getpass (sûr, pas de secret en dur). 0 `@anthropic-ai/sdk`. Config-push = §5 dans Red Flags + Verification.

## network-bgp-diagnostics
- **décision**: adapt
- **raison**: doctrine BGP **read-only** forte et auto-suffisante — flow de triage (neighbor/AFI-SAFI/VRF/ASN, dernier reset, reachability, policy avant transport), table d'interprétation d'état (Idle/Active/Connect/Established-zéro-prefix), checks AS-path regex avec token boundaries, parser de summary. Vertical réseau-diagnostic, aucun équivalent chez nous, valeur réelle dans son domaine.
- **exec sortant §5**: les actions mutantes (clear de session, modif auth/timers/update-source/route-maps/prefix-lists, relâchement ACL/firewall) sont déjà cadrées "change-window only" par la source — gardé et durci en §5-gated (jamais suggéré comme diagnostic auto; soft/route-refresh préféré si reset approuvé).
- **dedup**: non.
- **chemin library**: `packages/skills/library/network-bgp-diagnostics/SKILL.md`
- **état**: keeper boosté §12. 0 secret, 0 `@anthropic-ai/sdk`. Reset/policy-change = §5.

## network-config-validation
- **décision**: adapt
- **raison**: doctrine de **pré-flight read-only** forte et auto-suffisante — validation en couches (commandes destructrices, exposition credentials/management-plane, IP dupliquées + overlaps de subnet, références ACL/route-map/prefix-list orphelines, hygiène SNMPv3/NTP/logging/banner), parsing VTY par section pour ne pas déborder. Détecteurs purement analytiques (regex sur du texte de config), zéro exec sortant. Sert directement de **gate fail-closed avant tout push** (Netmiko/NAPALM/Ansible/API) — converge avec §5 (fail closed sur commandes dangereuses + credentials).
- **dedup**: non.
- **chemin library**: `packages/skills/library/network-config-validation/SKILL.md`
- **état**: keeper boosté §12. Analyse statique pure (aucun device touché), 0 secret, 0 `@anthropic-ai/sdk`. Recadré: gate fail-closed devant un push §5-gated.

## network-interface-health
- **décision**: adapt
- **raison**: doctrine de diagnostic d'interface **read-only** forte et auto-suffisante — la lecture "trend > valeur absolue" (baseline → intervalle → re-capture → delta), table de référence des compteurs (CRC/runts/giants/drops/resets/collisions → cause probable), flows CRC/drops/duplex, parser slice-par-header sûr (jamais une fenêtre de caractères arbitraire). Vertical réseau-diagnostic, valeur réelle, aucun équivalent chez nous.
- **exec sortant §5**: la seule action mutante (`clear counters`) est déjà cadrée "seulement après avoir enregistré la baseline" — gardé tel quel (faible risque, mais explicite: baseline d'abord).
- **dedup**: non.
- **chemin library**: `packages/skills/library/network-interface-health/SKILL.md`
- **état**: keeper boosté §12. 0 secret, 0 `@anthropic-ai/sdk`. Read-only; clear-counters = baseline d'abord.

## production-scheduling
- **décision**: adapt
- **raison**: doctrine manufacturing **dense et auto-suffisante** (15+ ans codifiés) — TOC/Drum-Buffer-Rope, SMED, OEE, séquençage (EDD/SPT/setup-aware EDD), optimisation changeover (matrice de setup + nearest-neighbor + 2-opt), réponse aux disruptions (breakdown/shortage/quality-hold/absentéisme), patterns ERP/MES, escalation/KPIs. C'est du savoir-domaine pur, zéro exec sortant, zéro dépendance externe. Coche tous les critères VERTICAL "FORT + auto-suffisant". Réutilisable comme savoir-injection grounding pour un futur agent ops/planning.
- **dedup**: non — rien de manufacturing chez nous.
- **chemin library**: `packages/skills/library/production-scheduling/SKILL.md`
- **état**: keeper boosté §12. Corps dense condensé en forme §12 (8 sections) en préservant le cœur opérationnel (DBR, dispatching, disruption, OEE, frameworks de décision). Chiffres $/€ d'origine = exemples métier intra-domaine (coût de changeover/OT, pas du billing MAOS) → laissés comme illustrations métier, recadrage §11 = note explicite "ce sont des coûts manufacturing, pas du quota MAOS". 0 secret, 0 `@anthropic-ai/sdk`.

## quality-nonconformance
- **décision**: adapt
- **raison**: doctrine qualité **dense et auto-suffisante** (15+ ans, FDA 21 CFR 820 / IATF 16949 / AS9100 / ISO 13485) — cycle de vie NCR, RCA (5-Why/Ishikawa/FTA/8D + red flags "operator error n'est jamais une root cause"), système CAPA (verification vs validation d'efficacité), SPC (sélection de chart, Cp/Cpk, Western Electric, sur-ajustement = tampering), inspection AQL/LTPD/skip-lot, supplier quality (SCAR/ASL/scorecards), COQ. Savoir-domaine pur, zéro exec sortant, zéro dépendance. Coche VERTICAL "FORT + auto-suffisant". Réutilisable comme grounding pour un futur agent qualité/ops.
- **dedup**: non — rien de qualité-manufacturing chez nous (notre `mas-reviewer`/`quality-controller` = qualité *logicielle*, lentille distincte).
- **chemin library**: `packages/skills/library/quality-nonconformance/SKILL.md`
- **état**: keeper boosté §12 (8 sections) en préservant NCR/RCA/CAPA/SPC/supplier/frameworks de décision. Chiffres $/% = économie qualité (COQ), pas du billing MAOS → note de recadrage §11. 0 secret, 0 `@anthropic-ai/sdk`.

---

## Rejets (KILL criteria + re-audit)

## manim-video
- **décision**: reject
- **raison**: wrapper d'outil niche (CLI `manim` + `ffmpeg` + délégation à `video-editing`/`remotion-video-creation`/`content-engine`). Mince, non auto-suffisant (dépend d'assets externes `assets/network_graph_scene.py` absents et d'une chaîne de skills vidéo qu'on n'a pas), aucune doctrine de domaine réutilisable — c'est un guide d'invocation d'outil, pas du savoir transférable. Hors-produit pour MAOS (cockpit multi-agent, pas un studio vidéo). Barre VERTICAL: niche + mince + faible-réutilisation = reject (flaggé likely-reject à juste titre).
- **KILL**: tool-wrapper niche, dépend d'une stack vidéo externe absente, zéro doctrine auto-suffisante, hors-produit.
- **dedup**: n/a (rien d'équivalent, mais aucune valeur à importer).
- **chemin library**: aucun (T0).
- **re-audit**: seulement si un domaine "génération vidéo/explainer" est explicitement scopé en ROADMAP — alors via intake-audit dédié avec la stack vidéo complète, jamais ce stub seul.

## nutrient-document-processing
- **décision**: reject
- **raison**: wrapper d'**API commerciale Nutrient DWS** — requiert `NUTRIENT_API_KEY` (`pdf_live_...`), tout le travail = `curl` POST egress vers `https://api.nutrient.io/build`, et recommande un MCP `npx @nutrient-sdk/dws-mcp-server`. Frontalement contraire au modèle MAOS: clé d'API tierce payante (§11 — un seul mode de facturation = abonnement; toute API payante tierce = opt-in default-OFF §11.bis, et ici la skill *est* l'API), egress réseau sortant vers un host non-allowlisté (§5 `allowed_hosts`), et `npx` non-épinglé exécutant du code tiers. La capacité document, on la possède déjà localement (skills `pdf`, `docx`, `xlsx`, `pptx` dans `our-assets-index.md`) — dup-pas-mieux en plus de l'unsafe.
- **KILL**: clé API tierce payante + egress vers host non-allowlisté (§5) + `npx` non-épinglé + dup-pas-mieux de nos skills doc locaux. Veto indépendant du score.
- **dedup**: oui — `pdf`/`docx`/`xlsx`/`pptx` couvrent convert/extract/OCR/forms en local, sans clé ni egress.
- **chemin library**: aucun (T0).
- **re-audit**: non (conflit structurel: API payante + egress contredisent local-first/§11; nos skills doc locaux couvrent déjà le besoin).
