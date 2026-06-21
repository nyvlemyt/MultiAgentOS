# ECC Harvest — décisions cluster `cyber:container-security` (lot DI)

Doer: lot DI (10 skills). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: `intake-audit` cycle complet, barre LARGE (T1 défensif, bibliothèque).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `/tmp/cybersec-inspect/skills/<slug>`, Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.

**Garde-fou défensif (étape 0).** Lentille harden + detect appliquée à des charges container/k8s que MAOS posséderait/superviserait : micro-segmentation réseau (NetworkPolicy vanilla + Calico GlobalNetworkPolicy default-deny), admission-control (Pod Security Admission/Standards, OPA Gatekeeper), durcissement RBAC least-privilege, détection runtime kernel (Tetragon eBPF, escape-detection), provenance supply-chain (in-toto/SLSA), et scan de vulnérabilités (Trivy/SBOM). Mappe directement sur CLAUDE.md §5 (sandbox projet, `allowed_hosts` ≈ NetworkPolicy egress, actions risquées gated, gating IAM cross-projet) et nourrit `mas-sec-reviewer`. KILL réservé à toute arme/ciblage-de-masse/évasion : aucune des 10 sources n'est offensive. `performing-container-escape-detection` est en posture **audit/détection** (énumère les vecteurs privileged/CAP_SYS_ADMIN/hostPath/docker.sock pour les repérer dans une charge supervisée), pas un playbook d'évasion → conservé avec recadrage défensif explicite. `performing-container-security-scanning-with-trivy` est du scan défensif (CVE/misconfig/secrets/SBOM) malgré la formule « security testing » du frontmatter source → conservé.

**Recadrage transverse §11.** MAOS = abonnement, jamais de coût per-token PAYG. Aucune source ne mentionne de $/€ ni d'`@anthropic-ai/sdk`. Sanitize secrets/PII : les clés (Ed25519 in-toto, OIDC, service-account tokens, CIDR d'exemple `203.0.113.0/24`) sont des **commandes de génération / exemples RFC-5737**, aucun secret réel embarqué → 10/10 sources clean.

**Frameworks préservés.** Chaque keeper reporte `nist_csf` + `mitre_attack` (et `nist_ai_rmf` + `atlas_techniques` quand présents — cas Tetragon) du frontmatter source sous `metadata.frameworks`.

**Renommages.** Aucun. Les 10 slugs source sont descriptifs, en kebab-case, disjoints du corpus existant (`comm -12` cyber↔ECC = vide, cf. cybersec-clusters.md) → library-slug == source-slug pour les 10. Note dedup interne au lot (paires complémentaires, non identiques) : `implementing-network-policies-for-kubernetes` (CNI-agnostique, ajoute blocage SSRF metadata) coexiste avec `implementing-kubernetes-network-policy-with-calico` (sur-ensemble Calico : GlobalNetworkPolicy, tiers, host-endpoint, service-account selectors) ; `implementing-kubernetes-pod-security-standards` (référence des profils/restrictions) coexiste avec `implementing-pod-security-admission-controller` (opérationnalisation : AdmissionConfiguration cluster-wide + migration PSP). Chaque corps croise-référence son jumeau. Dedup externe : `kubernetes-patterns` (lib T2, authoring de manifests) reste distinct — ces 10 skills sont des contrôles de sécurité, pas une référence d'écriture de manifests.

**Bilan: 10 keepers / 10 sources (0 reject).**

---

## implementing-kubernetes-network-policy-with-calico
- **décision**: adapt (keeper)
- **raison**: micro-segmentation zero-trust Calico (default-deny ingress/egress, GlobalNetworkPolicy cluster-wide, action:Deny ordonnées, sélecteurs service-account, host-endpoint SSH). Lentille défensive pure : les règles egress sont l'expression in-cluster de l'allowlist `allowed_hosts` (§5), et le default-deny coupe le lateral movement. Nourrit `mas-sec-reviewer`. Recadré : apply mutant = gate humain §5, télémétrie en quota (§11), 0 cash.
- **dedup**: complémentaire, non identique à `implementing-network-policies-for-kubernetes` (vanilla CNI-agnostique) — Calico est le sur-ensemble (GlobalNetworkPolicy, tiers, host-endpoint). Croise-référence ajoutée dans le corps. Distinct de `kubernetes-patterns` (authoring T2).
- **sanitize**: clean (YAML/snippets d'exemple, CIDR RFC-5737, aucun secret).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525].
- **chemin library**: `packages/skills/library/implementing-kubernetes-network-policy-with-calico/SKILL.md`
- **état**: boosté shape exemplaire (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata complet + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret.

## implementing-kubernetes-pod-security-standards
- **décision**: adapt (keeper)
- **raison**: référence des 3 profils PSS (Privileged/Baseline/Restricted) + matrice de restrictions + specs Restricted-compliant, enforcés par le controller PSA natif (GA 1.25+) au niveau namespace (modes enforce/audit/warn). Lentille admission-control défensive, nourrit `mas-sec-reviewer`. Recadré : labels enforce = mutation disruptive gated §11/§5, 0 cash.
- **dedup**: complémentaire de `implementing-pod-security-admission-controller` (jumeau opérationnel : AdmissionConfiguration cluster-wide + migration PSP). Ce skill = la *référence des profils* ; croise-référence ajoutée. Distinct de Gatekeeper (politique custom).
- **sanitize**: clean (YAML/snippets, aucun secret).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525].
- **chemin library**: `packages/skills/library/implementing-kubernetes-pod-security-standards/SKILL.md`
- **état**: boosté shape exemplaire (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret.

## implementing-network-policies-for-kubernetes
- **décision**: adapt (keeper)
- **raison**: NetworkPolicy CNI-agnostique (Calico/Cilium/Antrea) : default-deny, DNS-egress-avant-deny, allows par sélecteur, et surtout le **blocage SSRF metadata** (egress 0.0.0.0/0 except 169.254.169.254 + 100.100.100.200) qui coupe le vol de credentials cloud. Lentille défensive ; egress = allowlist §5 in-cluster ; nourrit `mas-sec-reviewer`.
- **dedup**: complémentaire de la version Calico (sur-ensemble vendor). Ici = portable + contrôle metadata-SSRF distinctif. Croise-référence ajoutée. Distinct de `kubernetes-patterns`.
- **sanitize**: clean (YAML/snippets, CIDR RFC-5737, aucun secret).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525].
- **chemin library**: `packages/skills/library/implementing-network-policies-for-kubernetes/SKILL.md`
- **état**: boosté shape exemplaire (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret.

## implementing-opa-gatekeeper-for-policy-enforcement
- **décision**: adapt (keeper)
- **raison**: policy-as-code admission (ConstraintTemplate Rego + Constraints) pour de la politique custom au-delà des 3 profils PSS fixes : required-labels, registries autorisées, block-privileged/:latest, require-limits, readonly-root. Rollout dryrun→deny. Lentille défensive admission-control, nourrit `mas-sec-reviewer`. Recadré : flip vers deny = mutation disruptive gated §5, 0 cash.
- **dedup**: non — couche complémentaire au-dessus de PSA (defense-in-depth, politique custom vs profils fixes). Distinct du corpus existant.
- **sanitize**: clean (Rego/YAML d'exemple, aucun secret).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525].
- **chemin library**: `packages/skills/library/implementing-opa-gatekeeper-for-policy-enforcement/SKILL.md`
- **état**: boosté shape exemplaire (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret.

## implementing-pod-security-admission-controller
- **décision**: adapt (keeper)
- **raison**: opérationnalisation du controller PSA natif (GA 1.25+) : défauts cluster-wide via AdmissionConfiguration (`--admission-control-config-file`) + exemptions, et migration PSP→PSA (audit, mapping SA→profil, label audit-first, enforce). Lentille défensive de rollout. Recadré : labels enforce rejettent des pods + édition du manifest apiserver = restart control-plane → gated §5, 0 cash.
- **dedup**: jumeau opérationnel de `implementing-kubernetes-pod-security-standards` (qui est la *référence des profils*). Ici = config cluster-wide + migration PSP, absentes du jumeau. Croise-référence ajoutée. Conservé comme paire complémentaire, non fusionné.
- **sanitize**: clean (YAML/jq d'exemple, aucun secret).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525].
- **chemin library**: `packages/skills/library/implementing-pod-security-admission-controller/SKILL.md`
- **état**: boosté shape exemplaire (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret.

## implementing-rbac-hardening-for-kubernetes
- **décision**: adapt (keeper)
- **raison**: durcissement RBAC least-privilege (suppression cluster-admin sprawl, Roles namespace > ClusterRole, SA dédié/token off, restriction des verbes d'escalade secrets/exec/token/clusterrole*, OIDC, audit jq/rbac-lookup/rakkess). Analogue in-cluster du gating cross-projet §5 (IAM). Audit (get) = read-only sûr ; remédiation (apply/delete bindings) peut casser des workloads / self-escalate → gated §5, 0 cash.
- **dedup**: non — aucun skill MAOS ne couvre le hardening RBAC k8s ; disjoint du corpus.
- **sanitize**: clean (jq/YAML d'exemple, aucun secret réel).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525].
- **chemin library**: `packages/skills/library/implementing-rbac-hardening-for-kubernetes/SKILL.md`
- **état**: boosté shape exemplaire (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret.

## implementing-runtime-security-with-tetragon
- **décision**: adapt (keeper)
- **raison**: détection runtime eBPF (Cilium Tetragon, TracingPolicy CRDs sur process/file/network/syscall, <1% overhead) avec enforcement in-kernel optionnel (Sigkill/Signal/Override). Couche défensive qui attrape ce que l'admission/réseau ratent (escape via setns, lecture /etc/shadow, crypto-miners). Recadré : Sigkill tue des process → enforcement high-risk gated §5 ; toujours démarrer en observe (Post). 0 cash.
- **dedup**: non — seule source runtime-detection kernel du lot ; disjoint du corpus.
- **sanitize**: clean (YAML CRD/snippets, aucun secret).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525], nist_ai_rmf [MEASURE-2.7, MAP-5.1, MANAGE-2.4], atlas_techniques [AML.T0070, AML.T0066, AML.T0082]. (seul keeper du lot portant nist_ai_rmf + atlas — cible AI-security ATLAS.)
- **chemin library**: `packages/skills/library/implementing-runtime-security-with-tetragon/SKILL.md`
- **état**: boosté shape exemplaire (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks étendus, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret.

## implementing-supply-chain-security-with-in-toto
- **décision**: adapt (keeper)
- **raison**: provenance supply-chain (in-toto CNCF graduated) : layout signé (steps/functionaries/inspections), link metadata par étape, chaînage de hashes, `in-toto-verify` fail-closed avant deploy, webhook admission failurePolicy:Fail, mapping SLSA L1–L4. Lentille défensive de provenance complétant le scan Trivy ; nourrit `mas-sec-reviewer` + dep-audit. Recadré : clés privées functionary = secrets, JAMAIS dans le repo (§5/§11) — layout porte des keyids publics seulement.
- **dedup**: non — complémentaire de Trivy (in-toto vérifie le *processus*, Trivy le *contenu*). Disjoint du corpus.
- **sanitize**: clean — les `in-toto-keygen`/Ed25519 sont des **commandes de génération**, aucun secret réel ; gate secrets explicitement renforcé dans le corps.
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525, T1195] (T1195 supply-chain compromise).
- **chemin library**: `packages/skills/library/implementing-supply-chain-security-with-in-toto/SKILL.md`
- **état**: boosté shape exemplaire (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret.

## performing-container-escape-detection
- **décision**: adapt (keeper, recadrage défensif explicite)
- **raison**: audit posture **read-only** des specs pods k8s (client Python kubernetes) pour les vecteurs d'escape : privileged:true, CAP_SYS_ADMIN, host PID/Net/IPC, hostPath writable vers / ou /etc, mount /var/run/docker.sock (classe CVE-2022-0492 cgroup abuse). Énumère des findings pour `mas-sec-reviewer`. **Pas un playbook d'évasion** : le script lit, n'exploite jamais. Garde-fou défensif renforcé (detection-only, remédiation séparée et gated §5). 0 cash.
- **dedup**: non — complémentaire de Tetragon (détection runtime kill) ; ici = audit statique des specs. Disjoint du corpus.
- **sanitize**: clean (snippets Python de lecture, aucun secret).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525].
- **chemin library**: `packages/skills/library/performing-container-escape-detection/SKILL.md`
- **état**: boosté shape exemplaire (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks, Prompt Defense Baseline verbatim, 7 sections §12 dont Rationalizations/Red Flags renforçant detection-only). 0 sdk, 0 secret.

## performing-container-security-scanning-with-trivy
- **décision**: adapt (keeper)
- **raison**: scan défensif (Trivy/Aqua, open-source) : CVE OS+deps, misconfig IaC/Dockerfile/K8s, secrets exposés, licences ; SBOM CycloneDX/SPDX ; gate CI/CD bloquant critical/high (SARIF/JUnit). Malgré la formule « security testing » du frontmatter source, c'est du scan posture, pas de l'offensif. Nourrit `mas-sec-reviewer` + dep-audit + supply-chain (pair avec in-toto). Recadré : scan read-only ; remédiation (upgrade dep/image) mute le projet → gated §5 ; finding secret = incident §5. 0 cash.
- **dedup**: non — complémentaire d'in-toto (Trivy = *contenu*, in-toto = *processus*). Disjoint du corpus.
- **sanitize**: clean (descriptions de steps, aucun secret).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525, T1195].
- **chemin library**: `packages/skills/library/performing-container-security-scanning-with-trivy/SKILL.md`
- **état**: boosté shape exemplaire (ligne 1 `---`, commentaire source, summary L1, metadata + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret.

---

**Récapitulatif lot DI — 10/10 keepers, 0 reject, 0 renommage.** Sanitize 10/10 clean (0 secret réel, 0 `@anthropic-ai/sdk`). Tous recadrés §11 (quota, jamais cash) et §5 (mutations cluster/projet gated humain). Paires complémentaires conservées distinctes (network: vanilla+Calico ; pod-security: standards+controller). Frameworks `nist_csf`+`mitre_attack` préservés sur les 10 ; `nist_ai_rmf`+`atlas_techniques` en plus sur Tetragon.
