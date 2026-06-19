# ECC Harvest — décisions cluster `cyber:identity-access-management` (lot DQ)

Doer: lot DQ (9 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (moindre-privilège, gates d'autonomie,
écriture hors-sandbox interdite, secrets/keystores gatés). C'est le **cœur conceptuel** de §5 côté IAM.
Nature du lot: skills **DÉFENSIFS** (blue-team) IAM — JIT, PAM, passwordless/phishing-resistant, SSO SAML, SCIM, ZSP.
Le frontmatter source porte `subdomain: identity-access-management` + `frameworks` NIST-CSF/MITRE-ATTACK (et
NIST-AI-RMF/ATLAS pour `implementing-passwordless-authentication-with-fido2`) : mappings préservés dans la metadata MAS.
Garde-fou défensif appliqué à chaque skill : lentille moindre-privilège + accès time-bound + audit gardée ;
aucun payload offensif (les sources sont des guides de déploiement de contrôles, pas des exploits — KILL weaponization
non déclenché). Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 9 sources (les `your-secure-token-here`,
GUID YubiKey publics, ARN/role d'exemple, tokens bearer placeholder = exemples, pas de credential réel). Recadrage
transverse §11 : tout chiffre = quota d'abonnement, jamais $/€ (les sources n'utilisaient pas de cash → recadrage léger).

**Note dédup passwordless (entra vs fido2)** — pré-signalée par la tâche : les deux gardés, deltas distincts.
`implementing-passwordless-auth-with-microsoft-entra` = rollout vendor-IdP riche (Entra ID, Conditional Access,
authentication strength, WHfB via Intune, Cloud Kerberos Trust, TAP, Graph API, métriques d'adoption). 
`implementing-passwordless-authentication-with-fido2` = couche **protocole** FIDO2/WebAuthn générique (RP-server,
WebAuthn API, attestation, AAL3 NIST 800-63B) + porte les tags AI-security (NIST-AI-RMF + ATLAS) absents de l'Entra.
Angles orthogonaux (plateforme vs protocole) → pas de fold, conservés séparés avec cadrage explicite dans chaque Overview.

---

## implementing-just-in-time-access-provisioning
- **décision**: adapt
- **raison**: cœur conceptuel de §5 côté IAM — provisioning JIT pour atteindre Zero Standing Privilege : 4 modèles (broker-and-remove, elevation-on-demand, compte éphémère, toggle d'appartenance de groupe), routing d'approbation risk-tiered (auto <1h / single / dual manager+sécu / break-glass post-review), grants time-bound à auto-révocation à l'expiry (peu importe l'état de session) + grace 15min + termination forcée, intégrations IAM/IGA/PAM/ITSM/SIEM, audit complet + tracking des grants demandés-mais-inutilisés.
- **dedup**: non — `mas-sec-reviewer` est une gate générique §5; aucun skill de provisioning JIT/élévation time-bound dans notre surface. Angle distinct = *quand* l'accès est accordé (cycle de vie de l'élévation), pas l'autorisation per-task ponctuelle.
- **garde-fou défensif (§5)**: la lentille moindre-privilège + gate humaine sur high-risk recoupe directement §5; aucun payload offensif (guide de déploiement de contrôle). Cadrage explicite : JIT contrôle *quand*, la ressource doit toujours appliquer l'autorisation object-level.
- **chemin library**: `packages/skills/library/implementing-just-in-time-access-provisioning/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 chiffre cash).

## implementing-pam-for-database-access
- **décision**: adapt
- **raison**: PAM bases de données (Oracle/SQL Server/PostgreSQL/MySQL) — proxy de session (le DBA ne voit jamais le credential brut), vaulting + rotation, credentials dynamiques courts par session, rôles DB least-privilege (pas de DBA en blanc), audit de chaque requête vers SIEM. Source mince (objectifs+controls+verif) **boostée** depuis la description (proxy/vault/query-audit/dynamic-creds/least-priv-roles) en 7 sections opératoires.
- **dedup**: non — angle credential-de-base-de-données absent de notre surface; complète §5 (secrets handling) + `mas-sec-reviewer`. Distinct de la PAM CyberArk générique (ici = spécifique DB + query auditing).
- **garde-fou défensif**: contrôle de credentials privilégiés, jamais harvest/abus; cadrage : PAM contrôle la *connexion* privilégiée, l'autorisation row/column reste dans la DB.
- **chemin library**: `packages/skills/library/implementing-pam-for-database-access/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret réel, 0 sdk, 0 cash).

## implementing-passwordless-auth-with-microsoft-entra
- **décision**: adapt
- **raison**: rollout passwordless **vendor-IdP** (Entra ID) phishing-resistant — FIDO2 (attestation+AAGUID-restricted), WHfB (TPM + Cloud Kerberos Trust hybride sans PKI), passkeys Authenticator, cert-based; gouverné par Conditional Access authentication-strength (report-only puis enforced), security-key obligatoire pour les rôles admin, blocage legacy auth; bootstrap via Temporary Access Pass + clé de backup anti-lockout + break-glass; sortie de SMS/voice; métriques d'adoption via Graph. Aligné mandats EO 14028 / CISA.
- **dedup**: distinct de `implementing-passwordless-authentication-with-fido2` (cf. note d'en-tête) — ICI = plateforme/déploiement Entra+Intune+Graph; LÀ = protocole FIDO2/WebAuthn générique (RP-server). Deltas orthogonaux, gardés séparés. Aucun chevauchement avec notre surface (assurance d'identité absente).
- **garde-fou défensif (§5)**: durcit l'assurance d'identité, jamais ne l'affaiblit; PowerShell source = config de contrôles défensifs, reformulé en guidance (pas de bloc exécutable verbatim). GUID AAGUID YubiKey/Titan + role-IDs Entra = identifiants publics, pas des secrets.
- **chemin library**: `packages/skills/library/implementing-passwordless-auth-with-microsoft-entra/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret réel, 0 sdk, 0 cash).

## implementing-passwordless-authentication-with-fido2
- **décision**: adapt
- **raison**: implémentation **protocole** FIDO2/WebAuthn dans une relying party propre — cérémonie registration (attestation+challenge+origin vérifiés, stockage clé publique + sign count) + assertion (signature vs clé publique stockée, origin, user-presence/verification, sign-count non-régressant), security keys + platform authenticators (biométrie), backup credential anti-lockout, cible AAL3 NIST 800-63B. Aucun secret partagé ne quitte le device → phishing-resistant par construction.
- **dedup**: distinct de `implementing-passwordless-auth-with-microsoft-entra` (cf. note d'en-tête) — gardés séparés : ICI = protocole/RP-server; LÀ = déploiement vendor-IdP. Deltas réels. **Porte en plus les tags AI-security** (NIST-AI-RMF + MITRE ATLAS) absents de l'Entra → prioritaire pour la doctrine sécurité-agent de `mas-sec-reviewer`.
- **garde-fou défensif (§5)**: renforce l'assurance d'identité, jamais ne l'affaiblit; origin-binding = anti-phishing martelé en Principles + Red Flags; recovery ne doit pas réintroduire un facteur phishable.
- **chemin library**: `packages/skills/library/implementing-passwordless-authentication-with-fido2/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/NIST-AI-RMF/ATLAS préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## implementing-privileged-access-management-with-cyberark
- **décision**: adapt
- **raison**: PAM entreprise (CyberArk) — vault FIPS chiffré (credential jamais vu), cycle rotation/verification/reconciliation par plateforme (domain-admin 24h/root 72h/network 7d/cloud-keys 90d), isolation+recording de session via PSM (video+keystroke, stockage tamper-proof), Master Policy dual-control/exclusive-access/one-time-password, analytics comportementale (PTA) anti-vol de credential, élévation JIT, break-glass + DR testés, audit → SIEM. Principes généralisables à toute PAM.
- **dedup**: non — angle vault-credential + isolation/recording de session privilégiée absent de notre surface; complète §5 (least-privilege, session control, secrets) + `mas-sec-reviewer`. Distinct de `implementing-pam-for-database-access` (générique vs spécifique-DB) et de `implementing-privileged-session-monitoring` (ici déploiement PAM complet, là focus recording/monitoring).
- **garde-fou défensif (§5)**: protège des credentials privilégiés, jamais harvest/abus; cadrage : PAM contrôle credential+session, pas l'autorisation interne de la ressource. Vendor-specifics reformulés en doctrine.
- **chemin library**: `packages/skills/library/implementing-privileged-access-management-with-cyberark/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret réel, 0 sdk, 0 cash).

## implementing-privileged-session-monitoring
- **décision**: adapt
- **raison**: monitoring/recording de sessions privilégiées via proxy PAM (CyberArk PSM/PSMP ou open-source Teleport/Guacamole) — architecture proxy-only (firewall bloque RDP/SSH direct, autorise depuis le proxy), credentials vaultés/jamais exposés, recording video+keystroke tamper-proof + rétention compliance (PCI 1an/SOX 7ans/HIPAA 6ans), détection temps-réel de commandes high-risk → alert/suspend/terminate, live monitoring + workflow de revue searchable, métadonnées → SIEM (CEF).
- **dedup**: non — angle session-recording/forensic-trail absent de notre surface; complète §5 (session control, audit) + `mas-sec-reviewer`. Distinct de la PAM CyberArk complète (ici focus recording/monitoring) et du JIT (ici l'observation, pas le grant).
- **garde-fou défensif (§5)**: les patterns de commandes high-risk (lsass-dump, `curl|bash`, `rm -rf /`, mimikatz, etc.) sont des **signatures de détection**, pas des instructions à exécuter — explicité en Principles + Red Flags. Aucun probing tiers; tout sur infra possédée/proxy.
- **chemin library**: `packages/skills/library/implementing-privileged-session-monitoring/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; signatures = inputs de détection; 0 secret, 0 sdk, 0 cash).

## implementing-saml-sso-with-okta
- **décision**: adapt
- **raison**: SSO SAML 2.0 (Okta IdP) — flows SP/IdP-initiated, mapping attributs+groupes (RBAC), gestion de certificats, et surtout le **durcissement anti-forge/replay** (signatures SHA-256 jamais SHA-1, chiffrement AES-256 des assertions, audience restriction anti-replay cross-SP, conditions temporelles NotBefore/NotOnOrAfter vs clock-skew, validation InResponseTo), rotation de cert avant expiry, Single Logout.
- **dedup**: non — fédération SAML absente de notre surface; complète §5 (assurance d'identité) + `mas-sec-reviewer`. Distinct de SCIM (SAML authentifie, SCIM provisionne le cycle de vie).
- **garde-fou défensif (§5)**: durcit la validation d'assertion, jamais ne génère d'assertions forgées; cadrage : SAML authentifie, l'autorisation reste côté SP. Aucun secret réel (cert/Entity-ID = config).
- **chemin library**: `packages/skills/library/implementing-saml-sso-with-okta/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## implementing-scim-provisioning-with-okta
- **décision**: adapt
- **raison**: provisioning/deprovisioning automatique SCIM 2.0 (RFC 7644, Okta IdP) — serveur SCIM conforme (endpoints requis, CRUD Users/Groups, filtre `userName eq`, pagination, bearer-auth sur HTTPS), mapping attributs Okta→schéma SCIM, désactivation `active:false` jamais hard-delete, erreurs conformes au schéma SCIM, validation via la test-suite Okta. **Valeur sécurité = deprovisioning timely** qui ferme la surface des comptes orphelins.
- **dedup**: non — cycle de vie de compte automatisé absent de notre surface; complète §5 (account lifecycle, least privilege) + `mas-sec-reviewer`. Distinct de SAML (SCIM provisionne, SAML authentifie).
- **garde-fou défensif (§5)**: le `your-secure-token-here` source = **placeholder**, jamais un secret committé — explicité en Principles/Red Flags (bearer hors source control). Auth+TLS obligatoires sur chaque endpoint.
- **chemin library**: `packages/skills/library/implementing-scim-provisioning-with-okta/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; bearer = placeholder; 0 secret réel, 0 sdk, 0 cash).

## implementing-zero-standing-privilege-with-cyberark
- **décision**: adapt
- **raison**: Zero Standing Privilege multi-cloud (AWS/Azure/GCP) via CyberArk Secure Cloud Access — aucun rôle privilégié au repos; accès cloud minté JIT en rôle IAM éphémère, scopé minimal, détruit à l'expiry. Gouverné par le framework **TEA** (Time 15min–8h/Entitlements scopés + deny iam:*/org:*/sts:*/Approvals auto-manager-multi), scoping basé sur l'usage réel (CloudTrail), session monitoring, migration phasée off-standing-roles, garde anti-drift. Expression cloud de §5.
- **dedup**: non — angle rôle-cloud-éphémère absent de notre surface; complète directement §5 (least-privilege, time-bound elevation, gate humaine) + `mas-sec-reviewer`. Distinct de `implementing-just-in-time-access-provisioning` (JIT générique/on-prem-aware) et de la PAM CyberArk (vault on-prem) — ici = rôles cloud éphémères.
- **garde-fou défensif (§5)**: supprime le privilège permanent, le re-crée jamais; auto-approve borné aux low-risk repeats (la gate humaine high-risk reste); break-glass time-bound + post-review, pas de rôle admin permanent.
- **chemin library**: `packages/skills/library/implementing-zero-standing-privilege-with-cyberark/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; trust-policy/ExternalId d'exemple = placeholders; 0 secret réel, 0 sdk, 0 cash).

---

### Récap
- **9/9 keepers** (tous `adapt`). 0 reject. Lot 100% **défensif** (blue-team IAM) — cœur conceptuel de §5
  côté identité/accès : moindre-privilège, élévation time-bound, isolation de session, gate humaine high-risk.
- **Aucun rename** : les 9 slugs library = les 9 slugs sources à l'identique.
- **Note dédup passwordless résolue** : `entra` (rollout vendor-IdP : Conditional Access/WHfB/Intune/Cloud-Kerberos/TAP/Graph)
  et `fido2` (protocole WebAuthn/RP-server, AAL3, **+ tags AI-security NIST-AI-RMF/ATLAS**) gardés tous deux,
  deltas orthogonaux (plateforme vs protocole), cadrage croisé explicite dans chaque Overview. Pas de fold.
- **Frameworks préservés** : NIST-CSF (PR.AA-01/02/05/06) + MITRE-ATTACK sur les 9 ;
  ATT&CK étendu selon le skill (T1003 sur les deux PAM, T1566 sur entra-passwordless, T1553 sur SAML, T1078.004 sur ZSP) ;
  `implementing-passwordless-authentication-with-fido2` ajoute NIST-AI-RMF + MITRE-ATLAS (signal AI-security
  → prioritaire pour la doctrine sécurité-agent de `mas-sec-reviewer`).
- **Garde-fou défensif** appliqué partout : guides de déploiement de contrôles, aucun exploit (KILL weaponization
  non déclenché). Cas notables : (a) `implementing-privileged-session-monitoring` — les patterns de commandes
  high-risk (lsass-dump, `curl|bash`, mimikatz…) sont des **signatures de détection**, jamais des instructions
  d'exécution ; (b) cadrage transverse : ces skills contrôlent *quand/comment* l'accès est accordé et la session
  observée, l'autorisation object-level/row-column reste côté ressource.
- **Recadrage §11 transverse** : 0 chiffre cash (les sources n'en avaient pas), tuning = quota d'abonnement.
- **Sanitize** : 0 `@anthropic-ai/sdk`, 0 secret réel/PII dans les 9 outputs — le bearer SCIM
  (`your-secure-token-here`), les GUID AAGUID YubiKey/Titan, les role-IDs Entra, les ARN/ExternalId CyberArk
  sont des **placeholders/identifiants publics**, explicitement traités comme tels (jamais committés).
- Tous nourrissent `mas-sec-reviewer` + la lentille §5 (moindre-privilège, élévation gatée, secrets, session control).
