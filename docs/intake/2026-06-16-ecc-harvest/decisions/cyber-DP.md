# ECC Harvest — décisions cluster `cyber:identity-access-management` (lot DP)

Doer: lot DP (8 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (gating cross-projet, allowed_hosts)
et §11 (discipline secrets, abonnement — jamais de clé committée).
Nature du lot: skills **DÉFENSIFS** (blue-team) IAM/PAM/secrets-management — durcissement d'identité, moindre privilège,
just-in-time, vaulting de credentials, secrets dynamiques, gouvernance d'accès, SSO/conditional-access.
Le frontmatter source porte `subdomain: identity-access-management` + `frameworks` NIST-CSF (PR.AA-01/02/05/06)
et MITRE-ATTACK (T1078/T1110/T1556/T1098, + T1003 sur les skills credential-dumping-adjacents) : mappings
préservés dans la metadata MAS.
Garde-fou défensif appliqué à chaque skill : lentille hardening/least-privilege/JIT/vaulting gardée ;
aucun payload offensif (pas de credential harvest/dump/escalade) — les techniques MITRE listées sont ce qu'on
PRÉVIENT, jamais ce qu'on exécute. Aucune de ces sources n'a déclenché de KILL (weaponization/mass-targeting/evasion absents).
Sanitize: 0 secret réel (mots de passe = `openssl rand`/`$env:...`/placeholders, ARN/domaines d'exemple `corp.local`),
0 PII, 0 `@anthropic-ai/sdk` dans les 8 sources. Recadrage transverse §11 : tout chiffre = quota d'abonnement,
jamais $/€ (les sources n'utilisaient pas de cash hors mentions de licences produit — recadrage léger).

Recoupe MAOS spécifique : ces skills mappent directement la doctrine §5 (gating cross-projet, moindre privilège,
sandbox par projet) et §11/§8 (discipline secrets, `.env` gitignored, abonnement-only). Ils nourrissent
`mas-sec-reviewer` (revue d'identité/secrets avant actions risquées) et la posture least-privilege du dispatcher.

---

## implementing-aws-iam-permission-boundaries
- **décision**: adapt
- **raison**: cap défensif de moindre-privilège AWS — la permission boundary fixe le MAXIMUM qu'une identity-policy peut accorder (permissions effectives = intersection boundary ∩ identity), permettant la délégation de création de rôles sans escalade. Pattern: boundary managée (services autorisés + Deny sur auto-modif/retrait de la boundary) + delegation-policy qui ne crée des rôles QU'AVEC la boundary attachée (Condition `iam:PermissionsBoundary`) + préfixe de nommage. Mappe directement §5 (moindre privilège, sandbox-par-projet, blast-radius).
- **dedup**: non — `mas-sec-reviewer` est la gate générique §5; aucun skill AWS IAM/permission-boundary dans notre surface. Angle = plafond d'autorisation côté cloud, pas gating per-task.
- **garde-fou défensif (§5)**: les techniques MITRE (T1078/T1098/T1078.004 = escalade/abus de compte) sont ce que la boundary PRÉVIENT. Recadrage MAOS explicite: les agents produisent la policy en DIFF; aucun write IAM sur un compte externe sans gate §5 + humain.
- **chemin library**: `packages/skills/library/implementing-aws-iam-permission-boundaries/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF PR.AA-01/02/05/06 + MITRE-ATTACK T1078/T1110/T1556/T1098/T1078.004 préservé + Prompt Defense Baseline; 7 sections §12 défensives; mots de passe/ARN = placeholders d'exemple, 0 secret réel, 0 sdk, 0 cash).

## implementing-azure-ad-privileged-identity-management
- **décision**: adapt
- **raison**: gouvernance d'identité Zero-Trust défensive (Microsoft Entra PIM) — supprime le privilège permanent: assignations "eligible" activées en just-in-time pour une fenêtre bornée (8h) derrière MFA/justification/ticket/approbation, puis auto-désactivées. Pattern: audit des rôles permanents → conversion en eligible (sauf break-glass ≤2 Global Admin) → settings (durée, MFA, approbation Global/Security Admin, expiry ~6 mois) → access reviews trimestrielles → alertes PIM + SIEM. Mappe §5 (moindre privilège, JIT).
- **dedup**: non — angle JIT/eligible-activation absent de notre surface; complète `mas-sec-reviewer` + §5. Distinct des boundaries AWS (cap statique) — ici c'est l'activation temporelle.
- **garde-fou défensif (§5)**: MITRE T1078/T1098 = abus de privilège que PIM PRÉVIENT. Recadrage MAOS: agents émettent la config en DIFF; activer/écrire des assignations sur un tenant réel = action §5 + humain. Secret Graph = secret §11 (env, jamais committé).
- **chemin library**: `packages/skills/library/implementing-azure-ad-privileged-identity-management/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF PR.AA-01/02/05/06 + MITRE-ATTACK T1078/T1110/T1556/T1098 préservé + Prompt Defense Baseline; 7 sections §12 défensives; client_secret/IDs = placeholders, 0 secret réel, 0 sdk, 0 cash).

## implementing-conditional-access-policies-azure-ad
- **décision**: adapt
- **raison**: enforcement Zero-Trust défensif (Entra Conditional Access) — évalue les signaux (risque user/sign-in, conformité device, location, app, client) AVANT d'accorder l'accès, puis applique grant-controls (MFA, device conforme, app gérée) ou session-controls. Mappe NIST 800-53 AC-2/3/6 + AU-3 + IA-2. Pattern: policies signal-first (pas allow-all), bloquer legacy-auth, escalade-sur-risque, exclure break-glass, **report-only avant enforce** (dry-run obligatoire), logs → SIEM. Mappe §5 (verified-access).
- **dedup**: non — angle access-control conditionnel par signaux absent de notre surface; complète `mas-sec-reviewer` + §5. Distinct de PIM (PIM = activation de rôle JIT; CA = condition d'accès par signal).
- **garde-fou défensif (§5)**: MITRE T1078/T1110 = abus auth/brute-force que CA bloque. Recadrage MAOS: agents émettent les policies en DIFF; enforce sur tenant réel = §5 + humain; report-only = dry-run imposé (anti-lockout).
- **chemin library**: `packages/skills/library/implementing-conditional-access-policies-azure-ad/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF PR.AA-01/02/05/06 + MITRE-ATTACK T1078/T1110/T1556/T1098 préservé + Prompt Defense Baseline; 7 sections §12 défensives réécrites — la source était squelettique [objectifs/contrôles/verif], corps reconstruit en doctrine opérationnelle; 0 secret, 0 sdk, 0 cash).

## implementing-delinea-secret-server-for-pam
- **décision**: adapt
- **raison**: PAM défensif (Delinea Secret Server) — vaulting de credentials privilégiés/partagés, rotation automatique (RPC) + heartbeat, discovery comptes privilégiés/service, session-recording + keystroke, dual-control Tier-0, forwarding SIEM. Anti-pattern visé: "credentials dans un tableur". Mappe §11/§8 (discipline secrets, état dans `data/`, `.env` gitignored).
- **dedup**: non — gestion de credentials privilégiés/vault absente de notre surface; complète §11 + §5 + `mas-sec-reviewer`. Distinct de Vault (Delinea = vault statique + rotation/session; HashiCorp = secrets dynamiques éphémères).
- **garde-fou défensif (§5/§11)**: MITRE T1003 (credential dumping) = ce que le PAM PRÉVIENT, jamais ce qu'on exécute. Recadrage MAOS explicite: protège les secrets d'un PROJET EXTERNE; MAOS s'authentifie par abonnement, ne vault jamais une clé committée; mots de passe admin = `$env:`/`openssl rand`, jamais committés. Vault write = §5 + humain.
- **chemin library**: `packages/skills/library/implementing-delinea-secret-server-for-pam/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF PR.AA-01/02/05/06 + MITRE-ATTACK T1078/T1110/T1556/T1098/T1003 préservé + Prompt Defense Baseline; 7 sections §12 défensives; tous mots de passe source = `$env:SS_ADMIN_PASSWORD`/`openssl rand`/placeholders → 0 secret réel, 0 PII, 0 sdk, 0 cash).

## implementing-google-workspace-admin-security
- **décision**: adapt
- **raison**: durcissement défensif de tenant Google Workspace — minimiser super-admins (2-3) + Advanced Protection FIDO2 + break-glass, 2SV phishing-résistante (clés/phone-prompt, pas de SMS), SPF/DKIM-2048/DMARC staged none→quarantine→reject, anti-spoofing, DLP (SSN/CB/confidentiel), OAuth blocked-with-allowlist + audit/revoke tokens, partage Drive externe restreint + liens publics off. Posture CIS defense-in-depth anti-BEC/phishing/exfil. Mappe §5 (identité) + §11 (secrets/sortie de données).
- **dedup**: non — angle hardening Workspace absent de notre surface; complète `mas-sec-reviewer` + §5/§11. Distinct des skills Azure/Entra (console + API différentes).
- **garde-fou défensif (§5/§11)**: MITRE T1566 (phishing) = ce qu'on PRÉVIENT. Anti-lockout martelé: grace-period MFA + DMARC monitoring d'abord. Recadrage MAOS: protège un tenant EXTERNE; credential GAM/API = env-injecté §11, jamais committé, jamais une PAYG MAOS. Writes tenant = §5 + humain.
- **chemin library**: `packages/skills/library/implementing-google-workspace-admin-security/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF PR.AA-01/02/05/06 + MITRE-ATTACK T1078/T1110/T1556/T1098/T1566 préservé + Prompt Defense Baseline; 7 sections §12 défensives; domaines/clés `corp.com` = placeholders d'exemple, 0 secret réel, 0 PII, 0 sdk, 0 cash).

## implementing-google-workspace-sso-configuration
- **décision**: adapt
- **raison**: fédération SAML 2.0 défensive (Workspace = SP, IdP = autorité d'auth) — centralise credentials + MFA côté IdP + révocation immédiate à l'offboarding. Params clés (ACS, Entity ID, NameID emailAddress, cert signature). Garde-fou critique: comptes break-glass super-admin restent en auth Google native (panne IdP/cert expiré ≠ lockout admin). Test des cas d'échec (cert/utilisateur non-assigné/clock-skew). Mappe §5 (verified-access).
- **dedup**: non — angle fédération SSO absent de notre surface; complète `mas-sec-reviewer` + §5. Complémentaire de google-workspace-admin-security (hardening) — ici c'est la délégation d'auth.
- **garde-fou défensif (§5)**: anti-lockout break-glass martelé; MFA doit être au IdP (sinon plus de 2e facteur). Recadrage MAOS: agents émettent le profil SSO en DIFF; write tenant = §5 + humain; certs/metadata IdP = inputs d'intégrité.
- **chemin library**: `packages/skills/library/implementing-google-workspace-sso-configuration/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF PR.AA-01/02/05/06 + MITRE-ATTACK T1078/T1110/T1556/T1098 préservé + Prompt Defense Baseline; 7 sections §12 défensives — source plus complète [Overview/flux SAML/workflow], boostée en doctrine + garde-fous; URLs `{domain}`/IdP = placeholders, 0 secret, 0 sdk, 0 cash).

## implementing-hashicorp-vault-dynamic-secrets
- **décision**: adapt
- **raison**: secrets dynamiques défensifs (HashiCorp Vault) — remplace les credentials statiques par des credentials éphémères per-request (DB/AWS/PKI) liés à un lease auto-révoqué; Vault possède le root (rotate-root, aucun humain ne le connaît); `lease revoke -prefix` = kill-switch incident. Pattern: HA Raft + auto-unseal KMS + audit + AppRole; rôles least-privilege avec creation/revocation statements + TTL courts; renew à ~70% TTL. Mappe NIST 800-53 IA-5, PCI-DSS Req 8, §11/§8.
- **dedup**: non — secrets dynamiques éphémères absents de notre surface; complète §11 + §5 + `mas-sec-reviewer`. Distinct de Delinea (vault statique + rotation; Vault = génération éphémère per-request).
- **garde-fou défensif (§5/§11)**: MITRE T1003 (credential dumping) = ce que les secrets éphémères neutralisent. Recadrage MAOS: protège les credentials d'un PROJET EXTERNE; MAOS s'authentifie par abonnement, ne stocke jamais de clé; secret-id AppRole/unseal keys = env-injectés §11, jamais committés. Vault write = §5 + humain.
- **chemin library**: `packages/skills/library/implementing-hashicorp-vault-dynamic-secrets/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF PR.AA-01/02/05/06 + MITRE-ATTACK T1078/T1110/T1556/T1098/T1003 préservé + Prompt Defense Baseline; 7 sections §12 défensives; passwords source = `$VAULT_DB_PASSWORD`/`$AWS_*` env, role-id/secret-id = placeholders → 0 secret réel, 0 sdk, 0 cash).

## implementing-identity-governance-with-sailpoint
- **décision**: adapt
- **raison**: gouvernance d'identité défensive (SailPoint IGA) — lifecycle joiner-mover-leaver, access-request avec approbation, campagnes de certification, role mining, enforcement SoD (combinaisons toxiques), reporting compliance. Mappe NIST 800-53 AC-2/3/6 + AU-3 + IA-2. Pattern: source autoritative → rôles birthright + requestable → provisioning/deprovisioning auto → certifications avec auto-revoke → SoD au request-time → SIEM. Mappe §5 (moindre privilège, account-lifecycle).
- **dedup**: non — angle IGA/lifecycle/certification absent de notre surface; complète `mas-sec-reviewer` + §5. Distinct de PIM (PIM = activation JIT de rôles privilégiés; IGA = gouvernance complète du cycle de vie + certification + SoD).
- **garde-fou défensif (§5)**: deprovisioning leaver = contrôle anti-orphan (T1078). Recadrage MAOS: agents émettent la config en DIFF; provisioning sur environnement réel = §5 + humain + validation non-prod; credential API = env §11.
- **chemin library**: `packages/skills/library/implementing-identity-governance-with-sailpoint/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF PR.AA-01/02/05/06 + MITRE-ATTACK T1078/T1110/T1556/T1098 préservé + Prompt Defense Baseline; 7 sections §12 défensives réécrites — source squelettique [objectifs/contrôles/verif], corps reconstruit en doctrine IGA opérationnelle; 0 secret, 0 PII, 0 sdk, 0 cash).

---

### Récap
- 8/8 keepers (tous `adapt`). 0 reject. Lot 100% défensif (blue-team IAM/PAM/secrets-management).
  Aucun KILL déclenché : pas de weaponization/mass-targeting/evasion dans les sources (comme prévu).
- Garde-fou défensif appliqué partout : lentille hardening/least-privilege/JIT/vaulting/gouvernance gardée ;
  les techniques MITRE listées (T1078/T1110/T1556/T1098, + T1003 credential-dumping sur Delinea & Vault,
  T1078.004 cloud-account sur AWS, T1566 phishing sur Workspace-admin) sont ce que chaque skill PRÉVIENT,
  jamais ce qu'il exécute. Aucun harvest/dump/escalade offensif.
- Recadrage MAOS transverse martelé : ces skills durcissent l'identité/secrets d'un PROJET EXTERNE.
  Les agents produisent la config en DIFF ; tout write réel (IAM, tenant, vault, provisioning, enforce CA/SSO)
  est une action §5-gatée + validation humaine. Anti-lockout explicite (break-glass + report-only + grace-period
  + DMARC monitoring) sur PIM/CA/Workspace/SSO.
- §11/§8 (secrets) : Delinea + HashiCorp Vault recadrés — MAOS s'authentifie par abonnement, ne vault/stocke
  jamais une clé committée ; secrets d'admin/AppRole/Graph/GAM = env-injectés, jamais committés.
  Aucun `ANTHROPIC_API_KEY`, aucune PAYG.
- Frameworks préservés dans la metadata des 8 : NIST-CSF PR.AA-01/02/05/06 + MITRE-ATTACK (T1078/T1110/T1556/T1098)
  sur tous ; variantes ajoutées : +T1078.004 (AWS), +T1003 (Delinea, Vault), +T1566 (Workspace-admin).
- Sources squelettiques boostées en doctrine opérationnelle complète : `conditional-access`, `sailpoint`
  (frontmatter only → objectifs/contrôles → 7 sections §12 réécrites). Sources riches (AWS-boundaries, PIM,
  Delinea, Workspace-admin, SSO, Vault) distillées + garde-fous MAOS ajoutés.
- Dedup : aucun chevauchement avec notre surface existante ; tous nourrissent `mas-sec-reviewer` + §5/§11.
  Distinctions internes au lot tracées (AWS-boundary=cap statique vs PIM=activation JIT vs CA=condition par signal ;
  Delinea=vault statique+rotation vs Vault=secrets éphémères ; PIM=rôles privilégiés vs SailPoint=IGA cycle-de-vie complet).
- Garde-fous techniques : 0 `@anthropic-ai/sdk`, 0 secret réel/PII dans les 8 outputs
  (mots de passe = `$env:`/`openssl rand`/`$VAULT_*`, domaines `corp.local`/`corp.com`, ARN/IDs/certs = placeholders).
