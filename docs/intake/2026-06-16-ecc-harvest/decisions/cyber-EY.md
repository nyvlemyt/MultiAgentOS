# ECC Harvest — décisions cluster `cyber:network-security` (lot EY)

Doer: lot EY (10 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (garde-fou réseau, `allowed_hosts`, risky actions gated).
Nature du lot: skills **DÉFENSIFS** (blue-team) de sécurité réseau — RPKI/ROV anti-route-hijack, browser
isolation Zero-Trust, mitigation DDoS, NAC 802.1X, IPS Suricata, segmentation firewall, full-packet-capture
Arkime, baselining NetFlow, NGFW Palo Alto. Aucune arme offensive dans le lot.
Le frontmatter source porte `subdomain: network-security` + des `frameworks` (NIST-CSF + MITRE-ATTACK
sur les 10): mappings préservés dans la metadata MAS.
Garde-fou défensif appliqué à chaque skill: lentille analyse+détection+config-défensive gardée;
toute conséquence destructrice ou intrusive (règle firewall/ACL qui coupe l'accès, mode IPS inline qui
drop le trafic, ROV qui rejette des routes, capture full-packet sur réseau non-possédé, déploiement
RBI/SWG sur trafic tiers) recadrée en action RISQUÉE GATÉE §5; tout owner-scoped (jamais de
capture/inspection de réseaux tiers, jamais de blackhole/sinkhole exécuté par MAOS).
Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 10 sources (IP RFC5737/RFC1918, AS privés
RFC6996, secrets RADIUS/clés de partage = placeholders d'exemple uniquement, `YOUR_OINKCODE` /
`your-api-token` / `CF_API_TOKEN` = jetons-modèles non émis, pas des secrets réels). Recadrage transverse
§11: tout chiffre = quota d'abonnement, jamais $/€ (les sources ne facturent pas MAOS; les licences ET Pro /
Cloudflare Enterprise / PAN Threat-Prevention = prérequis tiers du projet externe, pas une facturation MAOS).

### Fold décidé (paire DUP NAC)
`implementing-network-access-control-with-cisco-ise` est **plié** dans le keeper vendor-neutre
`implementing-network-access-control` (même cœur : 802.1X + RADIUS + MAB + posture + VLAN dynamique).
Le delta Cisco-ISE (policy-sets ISE, dACL, SGT/TrustSec, CoA, profiling) est conservé comme variante
vendeur dans le corps du keeper neutre (Process + Rationalizations). On garde donc **un seul** SKILL.md
pour la NAC : pas deux fiches à 90 % redondantes (intake-audit : duplicate → merge via adapt_now).

---

## implementing-bgp-security-with-rpki
- **décision**: adapt
- **raison**: RPKI/ROV est une défense blue-team pure (anti-route-hijack/leak) : créer des ROAs au RIR, valider via cache (Routinator/FORT/OctoRPKI), appliquer ROV Valid/Invalid/NotFound sur ses propres routeurs. Lentille gardée; recadrée §5 (rejeter des routes = changement de joignabilité GATÉ, rollout soft-avant-drop) et owner-scoped (jamais de ROA/ROV pour des préfixes/AS non possédés).
- **dedup**: non — aucun équivalent réseau-BGP dans `our-assets-index.md`; complète le garde-fou réseau §5 / `allowed_hosts` côté routage inter-domaine.
- **chemin library**: `packages/skills/library/implementing-bgp-security-with-rpki/SKILL.md`
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata complet + frameworks nist_csf/mitre_attack préservés, 8 sections = Prompt Defense Baseline + 7 §12, 0 `@anthropic-ai/sdk`, 0 secret réel). Re-audit: si le repo source >6 mois stale.

## implementing-browser-isolation-for-zero-trust
- **décision**: adapt
- **raison**: RBI Zero-Trust = défense web blue-team (zero-day, phishing, exfil navigateur) : classification de risque d'URL, isolation des sites non-fiables, CDR sur les téléchargements, DLP par session, intégration SWG/ZTNA/conditional-access. Lentille gardée; recadrée §5 (router/bloquer du trafic live = changement gaté, monitor-mode d'abord) et owner-scoped (population d'utilisateurs et proxy possédés uniquement).
- **dedup**: non — pas d'équivalent isolation-navigateur dans `our-assets-index.md`; renforce le garde-fou réseau/risque §5.
- **chemin library**: `packages/skills/library/implementing-browser-isolation-for-zero-trust/SKILL.md`
- **note sanitize**: les imports `from agent import ...` et exemples Python du corps source = pseudo-API illustrative; non portés tels quels (le boost réécrit en Process/principes, pas de code exécutable injecté).
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks préservés, 8 sections, 0 sdk, 0 secret). Re-audit: si le repo source >6 mois stale.

## implementing-ddos-mitigation-with-cloudflare
- **décision**: adapt
- **raison**: mitigation DDoS Cloudflare = défense edge blue-team (L3/4 + L7) : managed rulesets, rate-limiting, WAF, Bot Management, verrouillage de l'origine (allowlist IP Cloudflare + Authenticated Origin Pulls). Lentille gardée; recadrée §5 (Block / Under-Attack mode = changement gaté, Log-mode d'abord) et owner-scoped (zones/origines possédées). Garde-fou secrets §5: jetons API en env, jamais committés.
- **dedup**: non — pas d'équivalent anti-DDoS dans `our-assets-index.md`; complète le garde-fou réseau §5.
- **chemin library**: `packages/skills/library/implementing-ddos-mitigation-with-cloudflare/SKILL.md`
- **note sanitize**: `$CF_API_TOKEN` / `your-api-token` du corps source = placeholders, pas des secrets émis; boost insiste sur env-only.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks préservés, 8 sections, 0 sdk, 0 secret réel). Re-audit: si le repo source >6 mois stale.

## implementing-network-access-control
- **décision**: adapt (keeper vendor-neutre, AVEC fold de la variante Cisco-ISE)
- **raison**: NAC 802.1X = défense IAM/edge blue-team : RADIUS (FreeRADIUS/NPS/ISE) + MAB + VLAN dynamique + posture + critical-VLAN fail-open. Lentille gardée; recadrée §5 (closed-mode = changement de joignabilité gaté, monitor-mode d'abord; secrets RADIUS hors fichiers committés) et owner-scoped (switches/RADIUS possédés).
- **fold**: `implementing-network-access-control-with-cisco-ise` **plié ici** (metadata.folds + commentaire source 2e ligne). Le delta ISE (policy sets, dACL, SGT/TrustSec, CoA, profiling, pre-auth ACL) = sous-section "Cisco ISE variant" du Process + lignes de Rationalizations. Pas de 2e fiche redondante.
- **dedup**: oui sur la paire NAC (neutre + ISE → 1 fiche); non vs `our-assets-index.md` (aucun NAC existant).
- **chemin library**: `packages/skills/library/implementing-network-access-control/SKILL.md`
- **note sanitize**: secrets RADIUS / mots de passe LDAP du corps source (`R4d1u5_S3cr3t_K3y!`, `C0mpl3x$3cretKey!`, etc.) = placeholders d'exemple; non portés en clair, boost insiste sur secret-store.
- **état**: boosté conforme (ligne 1 `---`, 2 commentaires source dont fold, summary L1, metadata + frameworks préservés + folds[], 8 sections, 0 sdk, 0 secret réel). Re-audit: si le repo source >6 mois stale.

## implementing-network-access-control-with-cisco-ise
- **décision**: reject (replié, pas indépendamment ingéré)
- **raison**: doublon à ~90 % du keeper vendor-neutre (même cœur 802.1X/RADIUS/MAB/posture/VLAN). intake-audit: duplicate → merge via adapt_now, pas deux fiches. Le delta unique Cisco (policy sets, dACL, SGT/TrustSec, CoA, profiling) est conservé comme variante vendeur DANS le keeper neutre — rien de perdu, surface de prompt non doublée.
- **dedup**: oui — replié dans `implementing-network-access-control`.
- **chemin library**: aucun (folded).
- **état**: rejeté-en-tant-que-fiche-séparée; contenu de valeur absorbé. Re-audit: non (fold structurel; ré-ouvrir seulement si un besoin Cisco-ISE profond justifie une fiche dédiée).

## implementing-network-intrusion-prevention-with-suricata
- **décision**: adapt
- **raison**: IDS/IPS Suricata = défense réseau blue-team : déploiement inline (NFQUEUE/AF_PACKET) ou passif, gestion rulesets ET, règles custom de détection, tuning faux-positifs, fail-open, EVE-JSON→SIEM. Lentille gardée; recadrée §5 (mode IPS inline drop = changement gaté, IDS-d'abord + fail-open obligatoire) et owner-scoped (réseaux possédés).
- **dedup**: non — pas d'IDS/IPS dans `our-assets-index.md`; complète le garde-fou réseau §5.
- **chemin library**: `packages/skills/library/implementing-network-intrusion-prevention-with-suricata/SKILL.md`
- **note sanitize**: `YOUR_OINKCODE` = placeholder de licence ET Pro, pas un secret émis; IP Tor du corps source = exemples de règle, recadrés "exemple de signature".
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks préservés, 8 sections, 0 sdk, 0 secret réel). Re-audit: si le repo source >6 mois stale.

## implementing-network-segmentation-with-firewall-zones
- **décision**: adapt
- **raison**: segmentation = défense anti-lateral-movement blue-team : mapping de flux, zones de confiance, VLAN, policy firewall default-deny + intra-zone deny, ACL inter-VLAN, microsegmentation, validation. Lentille gardée; recadrée §5 (règle deny qui coupe l'accès = changement gaté, baseline de flux d'abord) et owner-scoped (équipements possédés).
- **dedup**: distincte de la NAC (edge auth) et du NGFW (cf. infra) — ici l'architecture de zones/lateral-movement. Pas de doublon dans `our-assets-index.md`.
- **chemin library**: `packages/skills/library/implementing-network-segmentation-with-firewall-zones/SKILL.md`
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks préservés, 8 sections, 0 sdk, 0 secret réel; IP RFC1918 = exemples). Re-audit: si le repo source >6 mois stale.

## implementing-network-traffic-analysis-with-arkime
- **décision**: adapt (boost lourd — corps source maigre)
- **raison**: NTA full-packet-capture Arkime = défense/forensic réseau blue-team : requête de sessions API, export PCAP, détection beaconing (intervalle+jitter), DNS tunneling, mauvais émetteurs TLS. Source très courte (pas d'Overview/Process) → étoffée aux 7 sections §12. Lentille gardée read-only; recadrée §5 (capture autorisée + owner-scoped uniquement; jamais de blocage exécuté; creds viewer en env) et §11.
- **dedup**: complète `detecting-beaconing-patterns-with-zeek`/`analyzing-network-traffic-for-incidents` côté full-PCAP/Arkime; angle distinct (capture brute + pivot PCAP). Pas de doublon strict.
- **chemin library**: `packages/skills/library/implementing-network-traffic-analysis-with-arkime/SKILL.md`
- **note sanitize**: `--password secret` du corps source = placeholder CLI; boost insiste creds en env.
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks préservés, 8 sections, 0 sdk, 0 secret réel). Re-audit: si le repo source >6 mois stale.

## implementing-network-traffic-baselining
- **décision**: adapt (boost — corps source court)
- **raison**: baselining NetFlow/IPFIX = détection statistique blue-team : profils horaires/journaliers, stats par hôte, anomalies z-score + IQR (exfil, beaconing, ports anormaux). Source brève → étoffée 7 sections §12. Lentille gardée read-only; recadrée §5 (données autorisées owner-scoped; rapport, pas d'action) et §11.
- **dedup**: complémentaire d'Arkime (méta-flux statistique vs PCAP brut) et de `detecting-beaconing-patterns-with-zeek`. Pas de doublon strict.
- **chemin library**: `packages/skills/library/implementing-network-traffic-baselining/SKILL.md`
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks préservés, 8 sections, 0 sdk, 0 secret). Re-audit: si le repo source >6 mois stale.

## implementing-next-generation-firewall-with-palo-alto
- **décision**: adapt
- **raison**: NGFW Palo Alto = défense périmètre blue-team app/identité : zones, App-ID/User-ID policy default-deny, zone-protection, profils threat-prevention, SSL forward-proxy avec exclusions privacy, forwarding SIEM. Lentille gardée; recadrée §5 (deny qui coupe l'accès = gaté; déchiffrement = privacy-sensitive, exclusions financial/health; clé CA + creds hors fichiers committés) et owner-scoped.
- **dedup**: distincte de la segmentation (architecture de zones L2/ACL) — ici politique NGFW App-ID/Content-ID/déchiffrement. Pas de doublon dans `our-assets-index.md`.
- **chemin library**: `packages/skills/library/implementing-next-generation-firewall-with-palo-alto/SKILL.md`
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks préservés, 8 sections, 0 sdk, 0 secret réel; `CtsP@ss` etc. = placeholders d'exemple). Re-audit: si le repo source >6 mois stale.

### Bilan lot EY
- **Sources auditées**: 10. **Keepers (fiches library écrites)**: 9. **Folds**: 1 (cisco-ise → network-access-control).
- **Sanitize global**: 0 `@anthropic-ai/sdk`, 0 secret réel, 0 PII dans les 10 sources (tous IP RFC5737/RFC1918, AS RFC6996, secrets/tokens = placeholders d'exemple).
- **Recadrage §5/§11 appliqué partout**: défensif + owner-scoped + actions destructrices/intrusives gatées; quota d'abonnement, jamais $/€.
