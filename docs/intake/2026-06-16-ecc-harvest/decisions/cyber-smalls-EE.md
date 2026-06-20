# ECC Harvest — décisions LOT EE (cyber smalls : deception / IAM / zero-trust / appsec)

Doer : lot EE (9 skills sources). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : intake-audit, barre LARGE défensive (T1, library) — tout KEEP sauf dup avéré d'un skill existant.
Source : `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), clone read-only `/tmp/cybersec-inspect/skills/`.
Cible des keepers : `packages/skills/library/<slug>/SKILL.md`.
Dedup contre l'existant : `ls packages/skills/library` (754 slugs déjà présents au moment de l'audit — plusieurs voisins cyber déjà moissonnés du même repo source).
Recadrage transverse : MAOS = abonnement (§11), AUCUN coût per-token PAYG → tout chiffre en unités de quota, jamais $/€. Déploiements (DC, endpoints prod, listeners réseau, RASP en prod) = actions risquées §5, human-gated, jamais autopilot. Sanitize secrets/PII/`@anthropic-ai/sdk` : 9/9 sources clean (aucun import SDK ; les clés/cpassword des sources sont des leurres inertes ou des placeholders de doc).

Bilan lot : **6 KEEP (adapt) · 3 REJECT (dup)**.

---

## deploying-active-directory-honeytokens
- **décision** : adapt (KEEP)
- **cluster** : `cyber:deception-technology`
- **raison** : facette spécifiquement Active Directory de la déception, absente de l'existant. Le repo a déjà `implementing-honeytokens-for-breach-detection` (leurres génériques : fausses clés AWS, DNS, docs) et `performing-deception-technology-deployment` (déception générique), mais aucun ne couvre les leurres AD-natifs : compte privilégié factice (AdminCount=1, mot de passe vieilli), SPN de honeyroasting rendant toute requête TGS Event 4769 définitivement malveillante, GPO leurre avec piège cpassword, chemins BloodHound trompeurs, et la surface d'événements AD (4769/4662/4663/5136/4768). Recadré §5 (écriture sur un DC de prod = human-gated), leurres toujours inertes, coût en quota (§11).
- **dedup** : non — facette AD distincte du honeytoken générique.
- **chemin library** : `packages/skills/library/deploying-active-directory-honeytokens/SKILL.md`
- **état** : keeper conforme (ligne 1 `---`, commentaire source, summary L1, metadata complet avec frameworks NIST CSF + MITRE ATT&CK + Engage, Prompt Defense Baseline VERBATIM, 7 sections §12, 0 sdk, 0 secret). Re-audit : si le générique `implementing-honeytokens-for-breach-detection` absorbe un jour les techniques AD, fusionner.

## implementing-deception-based-detection-with-canarytoken
- **décision** : reject (dup)
- **cluster** : `cyber:deception-technology` (n/a — rejeté)
- **raison** : doublon quasi parfait de l'existant `implementing-canary-tokens-for-network-intrusion`, lui-même déjà moissonné du **même** repo source mukul975. Mêmes types de jetons (DNS / web-bug HTTP / clé AWS / document), même produit (Thinkst Canary / canarytokens.org), même câblage d'alerte SOC. Le skill existant est plus complet (placement par zone réseau, webhooks Slack/Teams/SIEM, cadrage §5 outbound POST hors allowed_hosts). Rien de transférable non déjà présent.
- **dedup** : oui — dup-no-better de `implementing-canary-tokens-for-network-intrusion`.
- **chemin library** : aucun.
- **état** : rejeté. KILL : dup avéré d'un skill existant du même corpus. Re-audit : non (conflit structurel — même produit, même facette).

## implementing-network-deception-with-honeypots
- **décision** : adapt (KEEP)
- **cluster** : `cyber:deception-technology`
- **raison** : facette « honeypots de service réseau » distincte. L'existant couvre la déception générique (`performing-deception-technology-deployment`) et le honeypot anti-ransomware par fichiers-canaris (`implementing-honeypot-for-ransomware-detection`), mais aucun skill ne couvre le déploiement et l'exploitation de honeypots de SERVICE (OpenCanary / Cowrie / T-Pot / Dionaea) émulant SSH/HTTP/SMB/FTP/RDP, avec capture de session et de commandes, niveaux d'interaction (low/medium/high), placement par segment VLAN, isolation de l'hôte. Recadré §5 (ouvrir des listeners et enregistrer des sessions = action risquée human-gated), hôte dédié sans donnée de prod, coût en quota (§11).
- **dedup** : non — facette service-réseau distincte des deux honeypots existants.
- **chemin library** : `packages/skills/library/implementing-network-deception-with-honeypots/SKILL.md`
- **état** : keeper conforme (8 blocs, Prompt Defense Baseline VERBATIM, frameworks NIST CSF + ATT&CK + Engage, 0 sdk/secret). Re-audit : si un futur skill « honeynet » couvre l'émulation de service, fusionner.

## implementing-hardware-security-key-authentication
- **décision** : adapt (KEEP)
- **cluster** : `cyber:identity-and-access-management`
- **raison** : facette « implémentation serveur RP FIDO2/WebAuthn » distincte de l'existant `implementing-passwordless-authentication-with-fido2` (qui porte la décision/posture passwordless) et de `configuring-multi-factor-authentication-with-duo` (MFA poussée). Ici : construction du relying-party (python-fido2, Fido2Server, RP ID = suffixe enregistrable de l'origine), cérémonies registration/authentication, stockage des credential records (credential_id binaire, clé COSE, sign_count uint32 pour détection de clone), enrôlement YubiKey/Titan/SoloKeys, migration vers passkeys (discoverable credentials), cible AAL3 (NIST SP 800-63B). Recadré : aucun secret réel dans le repo, rollout prod §5-gated, coût en quota (§11).
- **dedup** : non — facette implémentation-RP distincte de la posture passwordless.
- **chemin library** : `packages/skills/library/implementing-hardware-security-key-authentication/SKILL.md`
- **état** : keeper conforme (frameworks NIST CSF + AI RMF + 800-63B AAL3 + ATLAS + ATT&CK préservés, Prompt Defense Baseline VERBATIM, 7 sections §12, 0 sdk/secret). Re-audit : si l'existant fido2 absorbe l'implémentation RP, fusionner.

## implementing-privileged-access-workstation
- **décision** : adapt (KEEP)
- **cluster** : `cyber:identity-and-access-management`
- **raison** : la PAW (poste d'administration dédié et durci) est une facette absente. L'existant couvre des coffres PAM (`implementing-privileged-access-management-with-cyberark`, `implementing-delinea-secret-server-for-pam`, `implementing-zero-standing-privilege-with-cyberark`) et le durcissement d'endpoints utilisateurs (`hardening-windows-endpoint-with-cis-benchmark`), mais aucun ne couvre le POSTE PAW lui-même : modèle d'administration en tiers (Tier 0/1/2), principe clean-source, baseline VBS/Credential Guard/Device Guard/AppLocker via Intune/GPO, accès JIT par appartenance de groupe temporisée, intégration coffre PAM + monitoring de session. Le coffre est une intégration de la PAW, pas la PAW. Recadré §5 (enforcement de politique sur endpoints prod = human-gated), coût en quota (§11).
- **dedup** : non — la PAW (endpoint durci + tiering) ≠ coffre PAM ni durcissement d'endpoint générique.
- **chemin library** : `packages/skills/library/implementing-privileged-access-workstation/SKILL.md`
- **état** : keeper conforme (frameworks NIST CSF + ATT&CK + Microsoft-PAW/CIS, Prompt Defense Baseline VERBATIM, 7 sections §12, 0 sdk/secret). Re-audit : néant.

## implementing-zero-trust-with-beyondcorp
- **décision** : reject (dup)
- **cluster** : `cyber:zero-trust` (n/a — rejeté)
- **raison** : doublon de l'existant `implementing-beyondcorp-zero-trust-access-model` (déjà moissonné du même repo mukul975, cadré comme la doctrine canonique BeyondCorp vendor-portable + framing autonomie/gating §4/§5 de MAOS). Même produit/sujet : modèle BeyondCorp Google, Identity-Aware Proxy (IAP), Access Context Manager, device-trust, context-aware access. La source EE est plus mince (4 steps GCP) et n'apporte aucune facette absente. L'existant disjoint déjà explicitement les déploiements voisins (cloudflare-access, microsegmentation, SDP).
- **dedup** : oui — dup-no-better de `implementing-beyondcorp-zero-trust-access-model`.
- **chemin library** : aucun.
- **état** : rejeté. KILL : dup avéré (même modèle BeyondCorp/IAP/Access Context Manager). Re-audit : non.

## analyzing-active-directory-acl-abuse
- **décision** : adapt (KEEP)
- **cluster** : `cyber:identity-security`
- **raison** : détection DÉFENSIVE des chemins d'abus d'ACL AD (per guardrail, garder). Facette distincte de `auditing-ad-attack-paths-with-bloodhound` (cartographie de graphe) et de `detecting-dcsync-attack-in-active-directory` (réplication d'identifiants). Ici : lecture brute du `nTSecurityDescriptor` via ldap3, parsing du DACL en SDDL, résolution SID→principal, flag des ACE à droits dangereux (GenericAll 0x10000000 / WriteDACL 0x00040000 / WriteOwner 0x00080000 / GenericWrite 0x40000000) tenus par des trustees NON-admin sur des objets sensibles (Domain Admins, DC, GPO), exclusion des trustees admin attendus, documentation de la chaîne d'attaque + remédiation. Détection/durcissement uniquement, jamais exploitation. C'est l'entrée que BloodHound consomme. Recadré §5 (write-back ACL = human-gated, LDAPS obligatoire), coût en quota (§11).
- **dedup** : non — facette lecture/parse de DACL distincte du graphe BloodHound et de la détection DCSync.
- **chemin library** : `packages/skills/library/analyzing-active-directory-acl-abuse/SKILL.md`
- **état** : keeper conforme (frameworks NIST CSF + ATT&CK T1098/T1098.007/T1484.001/T1222.001/T1078.002 préservés, Prompt Defense Baseline VERBATIM, 7 sections §12, cadrage défensif explicite, 0 sdk/secret). Re-audit : néant.

## implementing-runtime-application-self-protection
- **décision** : adapt (KEEP)
- **cluster** : `cyber:application-security`
- **raison** : RASP — contrôle runtime sans équivalent dans la library (le WAF inspecte HTTP en externe ; RASP instrumente l'app de l'intérieur). Aucun slug existant ne couvre l'auto-protection à l'exécution : agent OpenRASP via JVM agent (Java) / hooks middleware (Python) interceptant au niveau fonction les opérations dangereuses (SQL, exec commande, I/O fichier, désérialisation) avec contexte d'exécution réel → quasi-zéro faux positifs. Doctrine monitor-mode d'abord (baseline + tuning) puis block-mode, télémétrie vers SIEM, couverture OWASP Top 10 (SQLi/cmd-injection/SSRF/path-traversal/XXE/deserialization). Complète (jamais remplace) WAF + SAST/DAST + secure coding. Recadré §5 (rollout prod = human-gated, validation staging d'abord), coût en quota (§11).
- **dedup** : non — aucun skill RASP existant ; distinct du WAF et du SAST/DAST.
- **chemin library** : `packages/skills/library/implementing-runtime-application-self-protection/SKILL.md`
- **état** : keeper conforme (frameworks NIST CSF + AI RMF + ATT&CK + OWASP Top 10, Prompt Defense Baseline VERBATIM, 7 sections §12, 0 sdk/secret). Re-audit : néant.

## implementing-devsecops-security-scanning
- **décision** : reject (fold/dup)
- **cluster** : `cyber:application-security` (n/a — rejeté)
- **raison** : la facette « pipeline unifié SAST+DAST+SCA+secrets shift-left » est déjà couverte. L'existant `building-devsecops-pipeline-with-gitlab-ci` porte exactement la même doctrine d'orchestration (gates de sécurité bloquant le déploiement sur findings critical/high, shift-left), à GitLab CI près vs GitHub Actions ici. Et chaque composant individuel existe déjà comme skill dédié : `implementing-secret-scanning-with-gitleaks` (Gitleaks), `integrating-dast-with-owasp-zap-in-pipeline` (OWASP ZAP), `implementing-semgrep-for-custom-sast-rules` (Semgrep SAST), `performing-container-security-scanning-with-trivy` / `scanning-containers-with-trivy-in-cicd` (Trivy SCA/conteneur). La source EE n'est que de la colle fine au-dessus de skills déjà présents ; aucune facette propre absente.
- **dedup** : oui — concept d'orchestration dup de `building-devsecops-pipeline-with-gitlab-ci` ; outils individuels tous déjà présents. Fold dans les skills existants.
- **chemin library** : aucun.
- **état** : rejeté. KILL : entièrement couvert (orchestration + 4 composants déjà en library). Re-audit : non.

---

Notes hard respectées : aucune édition de `ledger.tsv` ; aucun `git add/commit/push` ; seuls 6 dossiers library propres + ce shard créés ; les 9 slugs sources couverts.
