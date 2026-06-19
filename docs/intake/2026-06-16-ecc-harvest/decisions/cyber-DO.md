# ECC Harvest — décisions cluster `cyber:identity-access-management` (lot DO)

Doer: lot DO (8 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (modèle de permissions, gating cross-projet, posture auth/identité).
Nature du lot: skills **DÉFENSIFS** (blue-team) d'identity & access management — fédération, gouvernance/lifecycle, role-mining RBAC, durcissement AD/LDAP, MFA, OAuth2, détection d'anomalies d'authentification.
Le frontmatter source porte `subdomain: identity-access-management` + frameworks NIST-CSF/MITRE-ATTACK sur les 8
(+ NIST-AI-RMF sur `building-identity-governance-lifecycle-process` ; + NIST-AI-RMF & MITRE-ATLAS sur
`detecting-anomalous-authentication-patterns`, signal AI-security → prioritaire `mas-sec-reviewer`) : mappings préservés
dans `metadata.frameworks`.
Garde-fou défensif appliqué à chaque skill : lentille config/durcissement/détection gardée ; tout angle
offensif (tier-bypass AD, LDAP injection/relay, MFA-bypass/prompt-bombing, génération de trafic spray/stuffing,
probing de fédérations/directories tiers) explicitement reframé en owner-scoped/non-production/read-only, jamais en exploit.
Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 8 sources (préfixes de clés type `sk_live_`,
ARN/cert d'exemple = placeholders). Recadrage transverse §11 : les sources n'utilisaient pas de cash ; aucun chiffre
$/€ introduit. Note explicite §11 sur OAuth2 (secrets en env/vault, jamais committés ; MAOS s'authentifie par abonnement).

---

## building-identity-federation-with-saml-azure-ad
- **décision**: adapt
- **raison**: fédération SAML 2.0 défensive on-prem AD (AD FS / IdP tiers) ↔ Microsoft Entra ID + SSO SaaS. Modèles de fédération (federated/PHS/PTA/third-party), chaîne de confiance (token-signing cert, metadata, relying-party trust, claims rules, issuer URI), cycle de vie du cert de signature, durcissement (MFA edge, smart/extranet lockout, monitoring, DR managed-auth). Nourrit la posture auth/identité derrière §5.
- **dedup**: non — aucun skill de fédération SAML/SSO dans notre surface ; distinct d'OAuth2 (protocole), de la lifecycle IGA et du durcissement AD/LDAP. Complète `mas-sec-reviewer`.
- **garde-fou défensif (§5)**: config sur systèmes possédés uniquement ; reco/bypass d'une fédération tierce explicitement hors-scope (Principles + Red Flags). Claims = allowlist, redirect/ACS exact-match (anti token-redirection).
- **chemin library**: `packages/skills/library/building-identity-federation-with-saml-azure-ad/SKILL.md`
- **état**: neuf (ligne 1 `---`, commentaire source, summary L1, metadata T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé, Prompt Defense Baseline verbatim, 7 sections §12 défensives ; 0 secret, 0 sdk, 0 cash).

## building-identity-governance-lifecycle-process
- **décision**: adapt
- **raison**: gouvernance/lifecycle d'identité (IGA) défensif — machine à états joiner-mover-leaver pilotée par une source HR autoritaire (actions + rétention par état), intégration source HR (delta sync), birthright/role-mining, workflows de demande d'accès tiered par risque (LOW→CRITICAL + SoD + justification + time-limit), détection/remédiation des comptes orphelins par SLA-risque. Leaver fail-closed et rapide. Informe le modèle d'accès cross-projet §5.
- **dedup**: non — distinct de `building-role-mining-for-rbac-optimization` (math RBAC pure) ; ici = le processus lifecycle complet. Aucun skill IGA dans notre surface. Complète §5 + `mas-sec-reviewer`.
- **garde-fou défensif (§5/§8)**: design/mapping uniquement ; aucun provisioning/déprovisioning live vers systèmes tiers (Red Flags). Une seule source de vérité (anti-orphelins).
- **chemin library**: `packages/skills/library/building-identity-governance-lifecycle-process/SKILL.md`
- **état**: neuf (frontmatter T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/NIST-AI-RMF préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; 0 secret, 0 sdk, 0 cash).

## building-role-mining-for-rbac-optimization
- **décision**: adapt
- **raison**: role mining RBAC défensif — dériver un set de rôles minimal least-privilege depuis les assignations user-permission existantes. Matrice UPA binaire, 3 approches (bottom-up/top-down/hybride), 4 algos (clustering Jaccard, Formal Concept Analysis, graph dense-subgraph, décomposition booléenne U≈R×P), métriques (coverage>95%, WSC, deviation<5%, silhouette pour k), validation business obligatoire. Informe le least-privilege §5.
- **dedup**: non — complète `building-identity-governance-lifecycle-process` (qui possède le lifecycle JML ; ici = la math de découverte de rôles). Aucun skill de role-mining dans notre surface.
- **garde-fou défensif (§5/§6)**: analyse offline sur exports possédés, jamais de lecture live d'un directory tiers ; calcul déterministe/reproductible (LLM réservé à l'explication, pas au calcul).
- **chemin library**: `packages/skills/library/building-role-mining-for-rbac-optimization/SKILL.md`
- **état**: neuf (frontmatter T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; 0 secret, 0 sdk, 0 cash).

## configuring-active-directory-tiered-model
- **décision**: adapt
- **raison**: modèle d'administration AD à paliers (ESAE) défensif — séparation Tier 0/1/2 (un compromis à un palier ne pivote pas), PAWs, silos de politique d'authentification, mitigations de vol de credentials (PtH/PtT, LSASS, mouvement latéral). Mappe NIST 800-53 AC-2/AC-3/AC-6/AU-3/IA-2 + forwarding SIEM. Informe la logique de séparation de privilèges et de sandbox §5.
- **dedup**: non — angle isolation de privilèges absent de notre surface ; distinct du durcissement LDAP (protocole annuaire). Complète §5.
- **garde-fou défensif (§5)**: design/config sur domaines possédés, validé en non-production ; aucune technique de tier-bypass/PtH/dump LSASS contre un domaine tiers (Red Flags). Règle inviolable: credentials d'un palier supérieur jamais exposés sur un palier inférieur.
- **chemin library**: `packages/skills/library/configuring-active-directory-tiered-model/SKILL.md`
- **état**: neuf (frontmatter T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; le squelette source mince — Overview/Verification — réécrit en 7 sections complètes ; 0 secret, 0 sdk, 0 cash).

## configuring-ldap-security-hardening
- **décision**: adapt
- **raison**: durcissement LDAP défensif contre credential harvesting, LDAP injection, binding anonyme, channel-binding bypass — LDAPS/StartTLS, signing + channel binding (anti NTLM-relay T1557), suppression des binds anonymes/non-signés, ACLs least-privilege, sanitization des filtres, monitoring enum/brute/relay. Mappe NIST 800-53 AC/AU/IA + SIEM. Informe la posture auth-hardening §5.
- **dedup**: non — distinct du tiered-model AD (admin/privilèges) ; angle protocole annuaire + anti-injection/relay. Complète `mas-sec-reviewer` + §5.
- **garde-fou défensif (§5)**: config/monitoring sur directories possédés, validé non-production ; aucun probing offensif LDAP (injection/bypass) d'un système tiers (Red Flags). Input = untrusted (Prompt Defense Baseline) → filtres parametrisés.
- **chemin library**: `packages/skills/library/configuring-ldap-security-hardening/SKILL.md`
- **état**: neuf (frontmatter T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; squelette source mince réécrit ; 0 secret, 0 sdk, 0 cash).

## configuring-multi-factor-authentication-with-duo
- **décision**: adapt
- **raison**: déploiement MFA Duo défensif (VPN/RDP/SSH/web) — Auth Proxy (RADIUS/LDAP), SDK/SSO, ordre de force des facteurs (WebAuthn/FIDO2 > Verified Push > Push > TOTP > SMS dernier recours), policies adaptatives (réseaux de confiance, device-health), facteurs phishing-resistant pour privilégiés, défense MFA-fatigue. Critiques: fail-mode=safe en prod, SMS désactivé pour app-capable, offline pour laptops, logs SIEM + alertes fatigue/bypass. Mappe NIST 800-63B AAL2/AAL3 + 800-53 IA-2/3/5. Informe la gate auth §5.
- **dedup**: non — distinct d'OAuth2/SAML (design de flux protocole) ; ici = déploiement de second-facteur + policies. Aucun skill MFA dans notre surface. Complète §5.
- **garde-fou défensif (§5)**: config sur environnements possédés ; aucun test de MFA-bypass/prompt-bombing contre un tiers (Red Flags). Fail-mode=safe martelé (anti fail-open bypass).
- **chemin library**: `packages/skills/library/configuring-multi-factor-authentication-with-duo/SKILL.md`
- **état**: neuf (frontmatter T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; 0 secret, 0 sdk, 0 cash).

## configuring-oauth2-authorization-flow
- **décision**: adapt
- **raison**: configuration de flux OAuth 2.0/2.1 défensive — sélection de grant (Authorization Code + PKCE pour tous clients y c. SPA/mobile ; Client Credentials M2M ; Device Grant ; refresh rotatif), PKCE S256 (anti code-interception), scopes least-privilege, sécurité des tokens (TTL court, refresh single-use rotatif + reuse-detection, httpOnly/keychain, DPoP, revocation). Durcissement OAuth 2.1/RFC 9700 : PKCE obligatoire, redirect-URI exact-match, state CSRF, blocage implicit + ROPC. Informe la posture auth/token §5.
- **dedup**: non — distinct de la fédération SAML (protocole différent) et de la MFA Duo (facteurs). Aucun skill OAuth2 dans notre surface. Complète `mas-sec-reviewer`.
- **recadrage §11**: note explicite — secrets clients en env/vault, jamais committés ; MAOS s'authentifie par abonnement, pas via clé committée. Aucun `ANTHROPIC_API_KEY`.
- **garde-fou défensif (§5)**: implémentation/audit sur déploiements possédés ; aucun test de vol de token/interception contre un OAuth tiers (Red Flags).
- **chemin library**: `packages/skills/library/configuring-oauth2-authorization-flow/SKILL.md`
- **état**: neuf (frontmatter T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; préfixes de clés/exemples = placeholders ; 0 secret réel, 0 sdk, 0 cash).

## detecting-anomalous-authentication-patterns
- **décision**: adapt
- **raison**: détection d'anomalies d'authentification défensive (UEBA) — analyse read-only/offline de logs auth normalisés (Entra/Okta/Windows AD) : impossible travel (haversine), brute force (échecs/compte/fenêtre), password spraying (multi-comptes/source, peu d'essais), credential stuffing (échecs élevés + quelques succès, low success-rate), déviations comportementales vs baseline + Isolation Forest. Règles SIEM (Splunk SPL) + score de risque composite pondéré → actions tiered (suspend/force-MFA/step-up/monitor). Porte des tags AI-security (NIST-AI-RMF + MITRE ATLAS) → prioritaire `mas-sec-reviewer`. Nourrit la posture détection §5.
- **dedup**: non — angle détection comportementale d'auth absent de notre surface ; distinct de la MFA (prévention) et de l'IGA (lifecycle). Complète `mas-sec-reviewer` + §5.
- **garde-fou défensif (§5/§6)**: DÉTECTEUR uniquement — chaque routine parse des logs hors-ligne, AUCUNE génération de trafic d'attaque (spray/stuffing) ni payload (Principles + Red Flags) ; sources = logs possédés ; analytique déterministe (LLM réservé au résumé).
- **chemin library**: `packages/skills/library/detecting-anomalous-authentication-patterns/SKILL.md`
- **état**: neuf (frontmatter T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/NIST-AI-RMF/MITRE-ATLAS préservé + Prompt Defense Baseline ; 7 sections §12 défensives ; 0 secret, 0 sdk, 0 cash).

---

### Récap
- 8/8 keepers (tous `adapt`). 0 reject. Lot 100% défensif (blue-team identity & access management).
- 0 rename : les 8 slugs sources sont descriptifs, distincts entre eux et sans collision dans `packages/skills/library/`.
- Garde-fou défensif appliqué partout : lentille config/durcissement/détection gardée ; tout angle offensif strippé/reframé —
  tier-bypass AD (PtH/LSASS), LDAP injection/relay, MFA-bypass/prompt-bombing, génération de trafic spray/stuffing,
  probing de fédérations/directories tiers → owner-scoped, non-production, read-only. `detecting-anomalous-authentication-patterns`
  = détecteur strict (aucun générateur d'attaque).
- Frameworks préservés dans `metadata.frameworks` : NIST-CSF + MITRE-ATTACK sur les 8 ;
  `building-identity-governance-lifecycle-process` ajoute NIST-AI-RMF ;
  `detecting-anomalous-authentication-patterns` ajoute NIST-AI-RMF + MITRE-ATLAS (signal AI-security
  → prioritaire pour la doctrine sécurité-agent de `mas-sec-reviewer`).
- Recadrage §11 transverse : 0 chiffre cash (les sources n'en avaient pas) ; note explicite sur OAuth2
  (secrets en env/vault jamais committés ; MAOS = abonnement, pas de clé committée).
- Tous nourrissent `mas-sec-reviewer` + la lentille §5 (modèle de permissions, gating cross-projet, posture auth/identité,
  séparation de privilèges, détection).
- Garde-fous techniques : 0 `@anthropic-ai/sdk`, 0 secret réel/PII dans les 8 outputs (préfixes de clés `sk_live_`,
  ARN/cert = placeholders). Deux squelettes sources minces (AD tiered-model, LDAP hardening) ont été réécrits
  en 7 sections §12 complètes (Overview/Principles cite source/Process/Rationalizations/Red Flags/Verification).
