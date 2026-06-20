# ECC Harvest — décisions cluster `cyber:threat-intelligence` (LOT E)

Doer: lot E (10 slugs source). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit barre LARGE (T1, library), lentille DÉFENSIVE systématique (detect / mitigate / hardening).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Recadrage transverse: MAOS = abonnement (§11), zéro coût per-token PAYG → tout chiffre = unités de quota, jamais $/€. Actions risquées (sorties réseau hors `allowed_hosts`, envois de takedown, exécution de code adversaire, accès .onion) = gated §5, lecture/proposition seulement par défaut. État MAOS reste dans `data/` (§8). Aucun import `@anthropic-ai/sdk` dans les sources (clean 10/10).
Forme exemplaire respectée pour chaque keeper: ligne 1 `---`, frontmatter (`name`/`description` Use+Do NOT/`summary` L1/`metadata` avec frameworks NIST+MITRE préservés), commentaire `pattern from …`, `## Prompt Defense Baseline` VERBATIM, puis les 7 sections §12.

Bilan: **9 keepers** (1 canonical + 7 adaptés + 1 renommé) · **1 fold** · **0 reject** (aucune arme pure dans ce lot — tout est monitoring défensif).

---

## monitoring-darkweb-sources
- **décision**: adopt (canonique du couple dark-web)
- **raison**: monitoring défensif d'alerte précoce (forums/marketplaces/paste/leak-sites) pour les *propres* actifs de l'org. Lentille OPSEC forte + priorité aux feeds commerciaux (pas d'exposition analyste), accès direct = exception isolée/légalement validée. Pur défensif (ID.RA/DE.CM).
- **dedup**: doublon avec `performing-dark-web-monitoring-for-threats` (cf. infra) → ce slug est retenu comme canonique car plus riche sur OPSEC, classification de sévérité (P1/P2/P3), préservation de preuve, et gating légal. Aucun chevauchement avec un asset existant.
- **chemin library**: `packages/skills/library/monitoring-dark-web-sources/SKILL.md`
- **recadrage**: chiffres $→quota; accès direct/feeds = sortie réseau gated §5; vérifier-avant-escalade (claims d'extorsion fabriqués); jamais d'achat/participation marché criminel; preuve horodatée; remédiation = reset/rotation/MFA/blocklist. Le variant de collecte du fold (client Tor, monitor paste, ransomwatch) absorbé comme « cover clearnet blind spots / gated direct investigation ».
- **état**: écrit, conforme exemplaire (8 sections, Prompt Defense Baseline VERBATIM, 0 secret, 0 sdk).

## performing-dark-web-monitoring-for-threats
- **décision**: fold → `monitoring-dark-web-sources`
- **raison**: DUP quasi-total (note de dédup du lot confirmée). Même portée défensive (Tor, paste, leak-sites, credential monitoring). Apport unique = code de collecte (client SOCKS5 Tor, monitor paste, Ransomwatch JSON) — pattern conceptuel intégré dans le canonique sous « gated direct investigation » et « cover clearnet blind spots », sans dupliquer la machinerie. Le détail Ransomwatch est par ailleurs couvert plus proprement par `monitoring-ransomware-leak-sites`.
- **dedup**: oui — fold dans le canonique, cible notée dans le commentaire HTML du keeper.
- **chemin library**: aucun (fold).
- **état**: non écrit (replié). KILL n/a (gardé via fold). Pas de re-audit séparé.

## performing-paste-site-monitoring-for-credentials
- **décision**: adapt
- **raison**: détection précoce de fuite de credentials/secrets de l'org sur paste sites + code public, *avant* propagation dark-web. Pur défensif (détection→rotation). Apport distinct du canonique dark-web: profondeur regex credentials (email:pwd, tokens AWS/GitHub/Slack, clés privées, JWT, connection strings) + scoping par keywords org + GitHub code search.
- **dedup**: chevauche partiellement le canonique sur la mention paste-site, mais axe credential-pattern unique → garder distinct (le canonique délègue la profondeur paste à ce skill).
- **chemin library**: `packages/skills/library/monitoring-paste-sites-for-credentials/SKILL.md`
- **recadrage**: $→quota; **jamais persister de secret plaintext** (repo/logs/mémoire/ticket) — masquer, agir, jeter; ne monitorer que ses propres actifs; respecter rate-limits (backoff 429); sortie réseau gated §5.
- **état**: écrit, conforme exemplaire.

## performing-brand-monitoring-for-impersonation
- **décision**: adapt
- **raison**: protection de marque multi-canal (domaines lookalike, sites phishing, faux profils sociaux, apps contrefaites, mentions dark-web) pour la *propre* marque. Pur défensif; cœur = priorisation par maliciosité (page login, TLS, MX, similarité, âge, hosting).
- **dedup**: orchestrateur multi-canal; délègue la permutation de domaine à `detecting-typosquat-domains` et l'angle certificat aux skills CT (référencé dans le corps). Pas de dup-no-better.
- **chemin library**: `packages/skills/library/monitoring-brand-impersonation/SKILL.md`
- **recadrage**: $→quota; envois de takedown + sorties réseau gated §5 (drafts proposés, envoi = clic humain); observer-pas-attaquer (pas de probing du host phishing); durcissement CAA+DMARC; marque propre uniquement.
- **état**: écrit, conforme exemplaire.

## analyzing-certificate-transparency-for-phishing
- **décision**: adapt
- **raison**: détection précoce phishing/lookalike via CT (crt.sh historique + Certstream temps réel). La fenêtre « certificat émis avant lancement de campagne » = blocage proactif. Pur défensif.
- **dedup**: adjacent à `auditing-tls-certificate-transparency-logs` (cf. note de lot). **Gardé distinct**: cette lentille = détection brand-lookalike (Levenshtein, free-CA, énumération sous-domaines propres). L'autre = gouvernance PKI / intégrité de log. Chaque skill porte une technique unique → pas de fold.
- **chemin library**: `packages/skills/library/analyzing-ct-logs-for-phishing/SKILL.md`
- **recadrage**: $→quota; corroborer DNS avant blocklist/takedown; énumération CT = actifs propres seulement; sorties crt.sh/Certstream gated §5; CAA+DMARC; rate-limits.
- **état**: écrit, conforme exemplaire.

## auditing-tls-certificate-transparency-logs
- **décision**: adapt (renommé pour clarté de portée)
- **raison**: audit CT comme contrôle de **gouvernance PKI + intégrité de log** sur domaines *possédés*: alerte émission par CA non autorisée (joyau — possible hijack/abus validation BGP/CA compromise), cartographie surface d'attaque + risque subdomain-takeover (certs expirés), vérification intégrité RFC 6962 (STH + preuves de cohérence, anti split-view), preuve de conformité (PCI/SOC2). Techniques uniques absentes du skill phishing.
- **dedup**: distinct de `analyzing-ct-logs-for-phishing` (détection lookalike). Justifie 2 skills (note de lot: garder distinct si chacun porte une technique unique — ici oui: STH/consistency + authorized-CA baseline).
- **chemin library (renommé)**: `packages/skills/library/auditing-ct-logs-for-rogue-issuance/SKILL.md` (slug renommé pour exprimer la portée « émission non autorisée » vs simple « audit logs »).
- **recadrage**: $→quota; domaines possédés uniquement; baseline CA-autorisée avant alerte; révocation/blocklist gated §5; corroboration DNS; rate-limits (Atom/Postgres pour volume).
- **état**: écrit, conforme exemplaire.

## analyzing-typosquatting-domains-with-dnstwist
- **décision**: adapt
- **raison**: moteur de permutation de domaine (dnstwist) pour détecter squats/homoglyphes ciblant l'org; scoring de risque (ssdeep/pHash, MX, âge, fuzzer, IP) + monitoring continu (diff known-set) + blocklist + takedown. Pur défensif, propre-domaine.
- **dedup**: c'est le moteur que `monitoring-brand-impersonation` délègue; complémentaire de `analyzing-ct-logs-for-phishing` (angle certificat). Garder distinct (réutilisable hors brand-monitoring complet).
- **chemin library**: `packages/skills/library/detecting-typosquat-domains/SKILL.md`
- **recadrage**: $→quota; permutations de domaines possédés uniquement (jamais pour cibler un tiers); registered+resolving puis scoring avant action; observer-pas-attaquer; DNS/sorties + envois takedown gated §5.
- **état**: écrit, conforme exemplaire.

## analyzing-ransomware-leak-site-intelligence
- **décision**: adapt
- **raison**: renseignement DLS ransomware via feeds publics autorisés (Ransomwatch/RansomLook/DarkFeed/CTI commercial), JAMAIS accès .onion direct en prod. Tendances groupes, risque sectoriel/géo, veille org + supply-chain. Pur défensif (alerte précoce + priorisation patch/backup/tabletop/ISAC).
- **dedup**: absorbe proprement le bout « Ransomwatch » du fold dark-web; axe analytique (tendances/sectoriel/émergents) distinct du canonique dark-web. Garder distinct.
- **chemin library**: `packages/skills/library/monitoring-ransomware-leak-sites/SKILL.md`
- **recadrage**: $→quota; **ne jamais télécharger/manipuler les données victimes fuitées** (métadonnées seulement); accès direct .onion = exception isolée/gated §5; supply-chain in-scope; rapport doit finir en actions défensives.
- **état**: écrit, conforme exemplaire.

## performing-threat-landscape-assessment-for-sector
- **décision**: adapt
- **raison**: CTI stratégique défensif par vertical (acteurs ciblant le secteur → techniques ATT&CK communes → vecteurs initial-access → priorisation défensive + reporting board). Pur défensif (D3FEND techniques présents). Aligné §11.bis (cognition non-Claude possible, grounded par injection contexte).
- **dedup**: pas de dup; lentille stratégique (acteurs/secteur) distincte des skills tactiques de monitoring du lot. Référence `validating-detections-with-atomic-red-team` pour la partie émulation (gated, hors desk-assessment).
- **chemin library**: `packages/skills/library/assessing-sector-threat-landscape/SKILL.md`
- **recadrage**: $→quota; sources corroborées (ATT&CK+DBIR+vendor+ISAC, jamais source unique); pas de planification/staging offensif ici; claims grounded sur contexte injecté (anti-hallucination); rapport finit en recommandations défensives priorisées; sorties feeds gated §5.
- **état**: écrit, conforme exemplaire.

## performing-threat-emulation-with-atomic-red-team
- **décision**: adapt + **rename** (cas spécial du lot)
- **raison**: Atomic Red Team = **outil de validation défensive** (vérifie que les détections SIEM/EDR se déclenchent). KEEP avec cadrage explicite: porte d'AUTORISATION (autorisation écrite + scope + lab isolé), lentille détection-validation/purple-team, atomics bénins seulement, pas de payload destructif, cleanup. Renommé `validating-detections-with-atomic-red-team` (cadre défensif plus clair, comme suggéré par le lot).
- **dedup**: pas de dup; seul skill « exécution » du lot → traité Claude-only + risk:high/blocking en MAOS.
- **chemin library (renommé)**: `packages/skills/library/validating-detections-with-atomic-red-team/SKILL.md`
- **recadrage (KILL-aware mais KEEP encadré)**: en MAOS l'exécution de test = **risk:high/blocking** → pause humaine TOUJOURS même en autopilot (§5), `mas-sec-reviewer` PASS obligatoire avant tout run; jamais en prod / systèmes non possédés; métrique = « l'alerte a-t-elle fired » pas « l'action a-t-elle réussi »; $→quota. Une section « Authorization & Scope Gate (read first) » a été ajoutée en tête avant les 7 sections §12.
- **état**: écrit, conforme exemplaire (+ gate d'autorisation en surcouche).

---

## Couverture & contrôle
- 10/10 slugs source traités (9 keepers + 1 fold), aucun ignoré.
- Renames: 2 (`auditing-tls-certificate-transparency-logs`→`auditing-ct-logs-for-rogue-issuance`; `performing-threat-emulation-with-atomic-red-team`→`validating-detections-with-atomic-red-team`).
- Fold: 1 (`performing-dark-web-monitoring-for-threats`→`monitoring-dark-web-sources`).
- Reject: 0 (cohérent — le lot est 100 % monitoring défensif; l'audit *pouvait* rejeter, l'atomic-red-team était le candidat reject-or-gate → résolu en KEEP encadré conformément à la consigne).
- Sanitize: payloads/secrets — sources sans secret réel; exemples weaponisés strippés (aucun payload destructif réintroduit dans les keepers, code source non recopié, seuls patterns/process conservés). `@anthropic-ai/sdk`: absent partout.
- Frameworks NIST CSF / MITRE ATT&CK (+ ATLAS / NIST AI RMF / D3FEND le cas échéant) préservés dans `metadata.frameworks` de chaque keeper.
- Contraintes dures respectées: pas d'édition `ledger.tsv`, pas de git add/commit/push; seuls les 9 dossiers library + ce shard ont été créés.
- Re-audit: re-vérifier si le repo source bouge (>6 mois) ou si un vertical « detection-engineering / purple-team » est explicitement scopé en ROADMAP (alors `validating-detections-with-atomic-red-team` enregistre sa catégorie risquée dans `config/permissions.json`).
