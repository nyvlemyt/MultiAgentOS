# ECC Harvest — décisions cluster `cyber:soc-operations` (lot DZ)

Doer: lot DZ (8 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (gating risky-action, allowed_hosts, secrets, sandbox cross-projet).
Nature du lot: skills **100% DÉFENSIFS** (blue-team SOC) — threat modeling, ticketing IR, investigation insider/phishing,
triage d'alertes, deception, réduction de faux-positifs, enrichissement IoC. Aucun candidat KILL (pas de weaponization /
mass-targeting / evasion).
Le frontmatter source porte `subdomain: soc-operations` + familles `nist_csf` + `mitre_attack` (et `nist_ai_rmf` +
`atlas_techniques` + `d3fend_techniques` sur certains) : tous mappings préservés dans `metadata.frameworks`.
Garde-fou défensif appliqué à chaque skill : lentille détection+investigation+gouvernance gardée ; toute action capable
d'exécuter du code, d'écrire des credentials, d'isoler un hôte, de purger des mailboxes ou d'atteindre un système tiers
est cadrée §5 (gate humain / owner-scoped, jamais déclenchée par MAOS contre un projet externe).
Sanitize: 0 secret réel, 0 PII réelle, 0 `@anthropic-ai/sdk` dans les 8 sources (clés = placeholders `YOUR_*_KEY`,
mots de passe de honeytoken = leurres fictifs, IPs/domaines = defangés/RFC-5737/exemple, noms = fictifs `jsmith`).
Recadrage transverse §11 : tout chiffre = quota d'abonnement, jamais $/€ ; aucune justification budgétaire en cash
(les sources parlaient de FTE/effort, pas de PAYG — recadrage léger).

---

## implementing-threat-modeling-with-mitre-attack
- **décision**: adapt
- **raison**: modélisation de menace défensive — sélection des acteurs pertinents (ATT&CK Groups par secteur/asset), construction des layers TTP (Navigator), mapping des règles de détection sur les technique IDs, gap analysis (couverts vs non-couverts, priorisés par phase kill-chain + criticité asset), roadmap de remediation phasée, validation par émulation owner-scoped. Nourrit `mas-sec-reviewer` + le classifieur §5 en ancrant QUELS comportements adverses un projet doit détecter.
- **dedup**: non — `mas-sec-reviewer` est une gate générique §5 ; aucun skill de threat-modeling ATT&CK dans notre surface. Angle distinct = cartographie couverture-détection vs TTP, pas autorisation per-task. Porte `nist_ai_rmf` + `atlas_techniques` (signal AI-security → doctrine sécurité-agent).
- **garde-fou défensif (§5)**: l'émulation adverse (Atomic Red Team / Caldera) est cadrée owner-scoped uniquement ; lancer une émulation contre un système hors sandbox = action §5 blocking. Le skill modélise et analyse, il n'attaque pas — l'émulation reste l'affaire du propriétaire, gatée humain.
- **chemin library**: `packages/skills/library/implementing-threat-modeling-with-mitre-attack/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/NIST-AI-RMF/ATLAS/D3FEND préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; 0 secret, 0 sdk, 0 cash).


## implementing-ticketing-system-for-incidents
- **décision**: adapt
- **raison**: système de ticketing IR défensif — taxonomie sévérité/catégorie + SLA réponse/résolution, création auto de tickets depuis les notable events SIEM (ServiceNow ITSM / Jira SM / TheHive), routing par sévérité, tracking SLA + auto-escalade sur breach, métriques MTTR/conformité-SLA. Le ticket = piste d'audit (preuve conformité) + colonne vertébrale de coordination SOC/IT/Legal.
- **dedup**: non — distinct de `performing-alert-triage-with-elastic-siem` (triage d'alerte unitaire) ; ici = cycle de vie de l'incident CONFIRMÉ. Aucun système de ticketing dans notre surface. Cadrage explicite "ne ticketer que les incidents confirmés, pas chaque alerte".
- **garde-fou défensif (§5)**: toute écriture sortante vers un ITSM tiers (create/escalate/resolve) = action état/réseau gatée §5 ; credentials plateforme = secrets owner-scoped, jamais committés (§5/§11). Le skill conçoit le workflow, MAOS ne pousse pas de tickets vers un système externe sans gate humain.
- **chemin library**: `packages/skills/library/implementing-ticketing-system-for-incidents/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; tokens API = placeholders, 0 secret réel, 0 sdk, 0 cash).

## investigating-insider-threat-indicators
- **décision**: adapt
- **raison**: investigation insider défensive — timeline d'activité SIEM du sujet (DLP/endpoint/email/proxy/auth/badge), détection d'exfiltration (downloads massifs, USB, email externe avec PJ, upload cloud), anomalies d'accès hors-scope + hors-heures vs baseline rôle, corrélation timeline RH/démission + accès physique, préservation de preuves SHA-256 + chaîne de custody pour Legal.
- **dedup**: non — aucun skill d'investigation insider dans notre surface. Angle distinct = corrélation read-only de télémétrie possédée sur un sujet autorisé, pas une gate d'autorisation per-task.
- **garde-fou défensif (§5 + privacy)**: AUTORISATION D'ABORD — gate dur. Aucune surveillance sans référent + autorisation Legal/RH/Privacy documentée (step 0). Investigation strictement read-only, scopée au sujet autorisé et à sa fenêtre ; pas d'expansion à d'autres employés ni à des systèmes non-possédés. Findings restent dans `data/` (§8). C'est le skill le plus sensible du lot côté vie privée — cadrage renforcé dans Principles/Red Flags.
- **chemin library**: `packages/skills/library/investigating-insider-threat-indicators/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; noms/IDs = fictifs `jsmith`, 0 PII réelle, 0 secret, 0 sdk, 0 cash).

## investigating-phishing-email-incident
- **décision**: adapt
- **raison**: IR phishing défensif end-to-end — analyse headers/authentification (SPF/DKIM/DMARC, chaîne Received, origine vraie), détonation URL+PJ en sandbox (URLScan/Any.Run/VT/MalwareBazaar) sans exécution locale, détermination du scope (message-trace/Graph), identification des cliqueurs + soumetteurs de credentials (POST proxy), puis containment (purge mailbox, blocage indicateurs, DNS sinkhole, reset credentials + révocation tokens).
- **dedup**: non — aucun skill d'IR phishing dans notre surface. Recoupe `performing-ioc-enrichment-automation` (enrichissement IOC) mais angle distinct = cycle d'investigation email complet.
- **garde-fou défensif (§5)**: phase analyse = read-only + sandbox (jamais d'exécution locale du payload) ; phase containment (purge/blocage/reset/révocation) = actions §5 high-risk gatées humain + scopées au tenant POSSÉDÉ uniquement. MAOS ne purge/bloque/reset jamais sur un système non-possédé. IOCs defangés partout dans le reporting.
- **chemin library**: `packages/skills/library/investigating-phishing-email-incident/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; clés API = placeholders `YOUR_*`, IOCs defangés/exemple, 0 secret réel, 0 sdk, 0 cash).

## performing-alert-triage-with-elastic-siem
- **décision**: adapt
- **raison**: triage d'alertes défensif dans Elastic Security — assessment du panel (sévérité/risk-score/MITRE/contexte host-user-process), context gathering ES|QL (events liés, activité même-user, signaux lateral movement), enrichissement threat-intel, classification (TP / benign-TP / FP / needs-investigation) via matrice risk-score × criticité-asset + SLA, documentation + décision d'escalade. AI features (Attack Discovery / AI Assistant) accélèrent sans remplacer le jugement analyste.
- **dedup**: non — distinct de `implementing-ticketing-system-for-incidents` (cycle de vie incident confirmé) et de `performing-false-positive-reduction-in-siem` (tuning systématique). Angle = triage unitaire read-only. Aucun skill de triage Elastic dans notre surface.
- **garde-fou défensif (§5)**: le triage CLASSE et escalade, il ne CONTAINE pas — toute quarantaine/blocage est une action séparée gatée §5. Investigation strictement read-only sur télémétrie possédée. Reframé "When to Use" générique de la source en sections §12 propres.
- **chemin library**: `packages/skills/library/performing-alert-triage-with-elastic-siem/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/D3FEND préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; IPs = RFC-5737/exemple, 0 secret, 0 sdk, 0 cash).

## performing-deception-technology-deployment
- **décision**: adapt
- **raison**: déploiement de deception défensive (couche détection haute-fidélité) — mapping des segments traversés, decoy systems (Canary file/DB servers), honeytokens AD + credentials cachés fictifs, canary docs/tokens (Word, clés AWS) dans les chemins sensibles, intégration de toute interaction comme alerte CRITIQUE (aucun user légitime ne touche un leurre). FP quasi-nul. Détecte lateral movement post-compromission + vol de credentials.
- **dedup**: non — aucun skill de deception/honeypot dans notre surface. Angle distinct = pièges actifs vs détection passive.
- **garde-fou défensif (§5)**: deux gates. (1) OWNER-SCOPED — leurres/honeytokens/canaries déployés UNIQUEMENT sur infra possédée ; jamais sur un système tiers. (2) Les credentials de honeytoken sont des LEURRES FICTIFS (leak-bait), jamais des credentials réels/réutilisés — designés pour alarmer à l'usage, pas pour donner un accès réel. (3) La réponse auto (isolation hôte, blocage IP firewall) = action §5 high-risk gatée humain même si la confiance est haute. (4) Deception = couche détection, JAMAIS substitut à patching/EDR/segmentation.
- **chemin library**: `packages/skills/library/performing-deception-technology-deployment/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; mots de passe honeytoken = leurres fictifs explicités, clés/tokens = placeholders, 0 secret réel, 0 sdk, 0 cash).

## performing-false-positive-reduction-in-siem
- **décision**: adapt
- **raison**: réduction de faux-positifs SIEM défensive (anti alert-fatigue) — identification des règles les plus bruyantes + FP rate, techniques de tuning (seuils, allowlists avec expiry+approver, corrélation single→multi-signal, exclusions temporelles maintenance/batch, baseline comportementale 3-sigma, filtrage threat-intel), cadence weekly-identify / bi-weekly-tune / monthly-validate / quarterly-report. Gate non-négociable = re-validation que les vrais positifs déclenchent encore après tuning.
- **dedup**: non — distinct de `performing-alert-triage-with-elastic-siem` (triage unitaire). Angle = ingénierie de détection / hygiène des règles. Aucun skill de FP-reduction dans notre surface.
- **garde-fou défensif (§5)**: gate = VALIDATION. Une règle tunée au silence qui ne détecte plus l'attaque = régression pire que le bruit ; explicité partout. Les tests adverses de validation (Atomic Red Team) = owner-scoped uniquement (§5), jamais contre un système non-possédé. Allowlists gouvernées (approver/reason/expiry), jamais de suppression silencieuse ouverte.
- **chemin library**: `packages/skills/library/performing-false-positive-reduction-in-siem/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/D3FEND préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; reframé "When to Use" générique source en sections propres ; 0 secret, 0 sdk, 0 cash).

## performing-ioc-enrichment-automation
- **décision**: adapt
- **raison**: enrichissement IOC automatisé défensif — moteur unifié IP/domaine/hash sur VirusTotal/AbuseIPDB/Shodan/GreyNoise/URLScan/MalwareBazaar (rate limits respectés), score de risque composite pondéré + disposition (clean/low/suspicious/malicious), GreyNoise RIOT soustrait pour les services known-benign (anti-FP). L'enrichissement = CONTEXTE, pas un verdict de blocage : revue analyste avant tout blocage.
- **dedup**: non — recoupe `investigating-phishing-email-incident` (qui enrichit aussi des IOCs) mais angle distinct = moteur d'enrichissement multi-source réutilisable. Aucun moteur IOC dans notre surface ; nourrit triage + IR.
- **garde-fou défensif (§5)**: skill réseau → lookups sortants UNIQUEMENT vers les `allowed_hosts` §5 (host non-listé = appel gaté, pas d'egress silencieux). Clés API = secrets owner-scoped, jamais committées ni inline (§5/§11). L'enrichissement ne BLOQUE jamais : toute action block/sinkhole/quarantine dérivée = action §5 séparée gatée. IOCs defangés dans le reporting.
- **chemin library**: `packages/skills/library/performing-ioc-enrichment-automation/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; clés = placeholders `YOUR_*_KEY`, IOCs defangés/exemple, 0 secret réel, 0 sdk, 0 cash).

---

### Récap
- 8/8 keepers (tous `adapt`). 0 reject. 0 rename (les 8 slugs sources sont clairs, disjoints de la library et entre eux). Lot 100% défensif (blue-team SOC operations).
- Aucun candidat KILL : pas de weaponization / mass-targeting / evasion dans le lot — threat modeling, ticketing IR, investigation insider/phishing, triage, deception, FP-reduction, enrichissement IoC sont tous de la défense.
- Garde-fous défensifs appliqués partout, par skill :
  - threat-modeling : émulation adverse owner-scoped + §5 (jamais hors sandbox).
  - ticketing : écritures ITSM sortantes gatées §5, credentials plateforme owner-scoped jamais committés.
  - insider-threat : AUTORISATION D'ABORD (Legal/RH/Privacy) = gate dur ; read-only scopé au sujet ; findings dans `data/`. Skill le plus sensible vie privée du lot.
  - phishing-IR : analyse sandbox sans exécution locale ; containment (purge/blocage/reset/révocation) = §5 high-risk gaté, tenant possédé uniquement ; IOCs defangés.
  - alert-triage : classe + escalade, ne containe pas (containment = action §5 séparée) ; read-only.
  - deception : owner-scoped only ; honeytokens = leurres fictifs (jamais credentials réels) ; auto-réponse isolate/block gatée §5 ; couche détection jamais substitut à la prévention.
  - FP-reduction : gate = re-validation (pas de règle tunée au silence) ; tests adverses owner-scoped ; allowlists gouvernées (approver/reason/expiry).
  - IOC-enrichment : lookups sortants restreints aux `allowed_hosts` §5 ; clés owner-scoped ; enrichissement = contexte, pas verdict (blocage = action §5 séparée).
- Frameworks préservés dans `metadata.frameworks` : NIST-CSF + MITRE-ATTACK sur les 8 ;
  `implementing-threat-modeling-with-mitre-attack` ajoute NIST-AI-RMF + MITRE-ATLAS + D3FEND (signal AI-security → doctrine sécurité-agent de `mas-sec-reviewer`) ;
  `performing-alert-triage-with-elastic-siem` et `performing-false-positive-reduction-in-siem` portent D3FEND.
- Recadrage §11 transverse : 0 chiffre cash dans les 8 outputs (les sources parlaient FTE/effort, pas PAYG) ; tuning/throughput = quota d'abonnement.
- Tous nourrissent la chaîne défensive SOC (triage → enrichissement → ticketing/IR) et la lentille §5 / `mas-sec-reviewer` (gating, allowed_hosts, secrets, sandbox cross-projet).
- Garde-fous techniques : 0 `@anthropic-ai/sdk`, 0 secret réel / PII réelle dans les 8 outputs (clés = placeholders `YOUR_*`, mots de passe honeytoken = leurres fictifs, IOCs defangés, noms = fictifs `jsmith`, IPs = RFC-5737/exemple).
