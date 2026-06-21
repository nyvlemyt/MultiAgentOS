# Décisions — cyber:red-teaming, lots Y + AA (16 items)

Contexte : les deux lots offensifs (Y = builders C2 / exploits CVE / evilginx / lazagne ;
AA = ingénierie sociale, intrusion physique, mouvement latéral, OSINT, élévation de
privilèges) ont déclenché le **garde-fou cyber d'Anthropic** côté sous-agent (blocage
dur, 0 octet écrit). Conformément à la doctrine défensive (CLAUDE.md §5 « rejeter les
armes pures ») et à la politique d'usage, nous **ne contournons pas** le garde-fou.
Les décisions ci-dessous sont prises en session principale : rejet des armes/doublons,
et **réécriture défensive authoriale** des seuls items méthodologiques sans contenu
offensif. Aucun contenu d'attaque n'est produit dans ce dossier.

## Lot Y (8) — toutes REJETÉES (armes offensives pures)

| source | décision | raison |
|---|---|---|
| building-c2-infrastructure-with-sliver-framework | reject | Construction d'infra C2 = arme ; l'équivalent défensif (détection de beacons Sliver) existe déjà en cyber:threat-hunting. |
| building-red-team-c2-infrastructure-with-havoc | reject | Idem — opération de C2 offensif, aucune valeur défensive ne survit au strip. |
| exploiting-ms17-010-eternalblue-vulnerability | reject | Outil d'exploit ; le correctif/détection MS17-010 relève déjà de cyber:vulnerability-management + endpoint. |
| exploiting-zerologon-vulnerability-cve-2020-1472 | reject | Exploit CVE ; détection/patch Zerologon couverts par vuln-mgmt + détections AD existantes. |
| exploiting-nopac-cve-2021-42278-42287 | reject | Exploit CVE ; patch/détection relèvent de vuln-mgmt. |
| exploiting-active-directory-certificate-services-esc1 | reject | Exploit ADCS ESC1 ; le durcissement AD CS est couvert par iam/hardening. |
| performing-initial-access-with-evilginx3 | reject | Proxy d'hameçonnage AiTM (arme) ; la détection AiTM existe déjà (`performing-adversary-in-the-middle-phishing-detection`). |
| performing-credential-access-with-lazagne | reject | Outil de vol d'identifiants ; la détection du credential-dumping existe (`detecting-t1003-credential-dumping-with-edr`). |

## Lot AA (8) — 3 gardés (réécriture défensive), 5 rejetés/fold

| source | décision | slug bibliothèque | raison |
|---|---|---|---|
| executing-red-team-engagement-planning | adapt | planning-authorized-red-team-engagement | Réécrit en gouvernance défenseur (autorisation, RoE, déconfliction, rapport findings→détections). Aucune tradecraft offensive. |
| conducting-full-scope-red-team-engagement | fold | → planning-authorized-red-team-engagement | Doublon de méthodologie ; fusionné dans le canonique. |
| performing-physical-intrusion-assessment | adapt | conducting-authorized-physical-security-assessment | Réécrit en évaluation autorisée des contrôles physiques (badges, talonnage, zones, détection) ; pas de mode opératoire d'effraction. |
| conducting-social-engineering-pretext-call | adapt | defending-against-vishing-and-pretext-calls | Réécrit en défense : procédure de vérification d'identité, rappel hors-bande + double contrôle, signaux, formation. Pas de script d'attaque. |
| conducting-spearphishing-simulation-campaign | reject | — | Doublon de `running-authorized-phishing-simulation` (déjà en bibliothèque, cyber:security-operations). |
| performing-lateral-movement-with-wmiexec | reject | — | Doublon défensif de `hunting-for-lateral-movement-via-wmi`. |
| performing-open-source-intelligence-gathering | reject | — | Doublon de `collecting-defensive-osint`. |
| performing-privilege-escalation-on-linux | reject | — | Couvert par `hardening-linux-endpoint-with-cis-benchmark` + `detecting-privilege-escalation-attempts`. |

## Bilan red-teaming (24 = lots Y+Z+AA)
- Intégrés : 5 (`detecting-and-preventing-constrained-delegation-abuse`, `auditing-ad-attack-paths-with-bloodhound`, `planning-authorized-red-team-engagement`, `conducting-authorized-physical-security-assessment`, `defending-against-vishing-and-pretext-calls`).
- Rejetés/fold : 19 (armes pures + doublons d'actifs défensifs déjà présents).
- Aucune arme, aucun exploit, aucun C2 n'entre dans la bibliothèque — cohérent avec §5.
