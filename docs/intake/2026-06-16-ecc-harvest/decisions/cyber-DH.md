# ECC Harvest — décisions cluster `cyber:container-security` (lot DH)

Doer: lot DH (10 skills). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: `intake-audit` cycle complet, barre LARGE (T1 défensif, bibliothèque).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `/tmp/cybersec-inspect/skills/<slug>`, Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.

**Garde-fou défensif (étape 0).** Lentille harden + detect + network-policy + provenance pour des charges container/k8s que MAOS posséderait/superviserait. Mappe directement sur CLAUDE.md §5 (sandbox projet, `allowed_hosts`, actions risquées gated) et nourrit `mas-sec-reviewer`. KILL réservé à toute arme/ciblage-de-masse/évasion : aucune des 10 sources n'est offensive — ce sont des détections (Falco/audit), des durcissements (CIS, distroless, daemon), de la micro-segmentation (Calico default-deny) et de la provenance (cosign). Le contenu « escape » est en posture **détection** (règles Falco qui alertent sur les tentatives), pas un playbook d'évasion. Conservé.

**Recadrage transverse §11.** MAOS = abonnement, jamais de coût per-token PAYG. Aucune source ne mentionne de $/€ ni d'`@anthropic-ai/sdk`. Sanitize secrets/PII : les clés cosign, certs TLS et tokens OIDC des sources sont des **commandes de génération/exemples** (`cosign generate-key-pair`, `openssl genrsa`, webhooks `XXXXX` masqués), aucun secret réel embarqué → 10/10 sources clean.

**Frameworks préservés.** Chaque keeper reporte `nist_csf` + `mitre_attack` (et `d3fend_techniques` quand présent) du frontmatter source sous `metadata.frameworks`.

**Renommages.** Aucun. Les 10 slugs source sont descriptifs, disjoints du corpus existant (`comm -12` cyber↔ECC = vide, cf. cybersec-clusters.md), et déjà au format kebab-case attendu → library-slug == source-slug pour les 10.

**Bilan: 10 keepers / 10 sources (0 reject).**

---

## analyzing-kubernetes-audit-logs
- **décision**: adapt (keeper)
- **raison**: parsing des audit logs API-server k8s (exec-into-pod, accès secrets, modifs RBAC, pods privilégiés, accès anonyme) → règles de détection. Pure lentille défensive/SOC, nourrit `mas-sec-reviewer` et la doctrine §5 (détecter l'escalade dans une charge supervisée). Recadré : pas de chiffre cash, toute télémétrie en quota/events MAOS.
- **dedup**: non — aucun skill MAOS ne couvre l'analyse d'audit-logs k8s ; disjoint du corpus ECC (collision = vide).
- **sanitize**: clean (snippets Python d'exemple, aucun secret).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1613, T1078, T1552.007].
- **chemin library**: `packages/skills/library/analyzing-kubernetes-audit-logs/SKILL.md`
- **état**: boosté shape exemplaire (ligne 1 `---`, commentaire source, summary L1, metadata complet + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret.

## detecting-container-drift-at-runtime
- **décision**: adapt (keeper)
- **raison**: détection de drift runtime sous modèle immutable DIE (Detect-Isolate-Evict) : tout changement d'un container en cours vs son image = IoC potentiel. Cinq types de drift (binaire/fichier/config/package/réseau) détectés via Falco/eBPF + vérification continue de digest ; prévention via readOnlyRootFilesystem + PSS restricted ; playbook isolate/evict/remediate. Posture purement défensive (durcissement + détection), mappe §5 sandbox.
- **dedup**: non — aucun équivalent runtime-drift dans le corpus MAOS ; disjoint d'ECC.
- **sanitize**: clean (règles Falco YAML + manifests k8s d'exemple, aucun secret).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525].
- **chemin library**: `packages/skills/library/detecting-container-drift-at-runtime/SKILL.md`
- **état**: boosté shape exemplaire (8 blocs, Prompt Defense Baseline verbatim, frameworks préservés). 0 sdk, 0 secret.

## detecting-container-escape-attempts
- **décision**: adapt (keeper)
- **raison**: détection (PAS exploitation) des tentatives d'évasion container→hôte. Catalogue les vecteurs (privileged, docker.sock, CVEs kernel, abus capabilities, /proc & cgroup sensibles, nsenter/unshare) uniquement pour reconnaître leurs indicateurs ; détection 5 couches (syscall/file/process/network/auditd) via règles Falco qui ALERTENT, profil seccomp qui LOG, règles auditd. Garde-fou: nommer un vecteur pour le détecter = défense ; aucun exploit fonctionnel reproduit. Posture conforme §5/mas-sec-reviewer.
- **dedup**: non — pas d'équivalent escape-detection MAOS ; disjoint d'ECC.
- **sanitize**: clean (règles Falco/seccomp/auditd + event-generator de test ; webhook Slack masqué `xxx`, aucun secret réel).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525], d3fend_techniques préservés (5).
- **chemin library**: `packages/skills/library/detecting-container-escape-attempts/SKILL.md`
- **état**: boosté shape exemplaire (8 blocs, Prompt Defense Baseline verbatim, frameworks+d3fend préservés, lentille strictement détection). 0 sdk, 0 secret.

## detecting-container-escape-with-falco-rules
- **décision**: adapt (keeper)
- **raison**: variante Falco-spécifique de la détection d'évasion : jeu de règles Falco prêtes qui ALERTENT (host mount, nsenter, privileged launch, sysrq/cgroup writes, module load, shadow read, docker.sock), install Helm/standalone, falco.yaml + routage falcosidekick, test via event generator. Complémentaire de `detecting-container-escape-attempts` (générique 5-couches) ; ici = engineering opérationnel des règles. Posture détection, conforme §5.
- **dedup**: chevauchement partiel volontaire avec `detecting-container-escape-attempts` (générique vs outil Falco concret) — gardés distincts comme la doctrine cyber-clusters (deux angles), pas dup-no-better.
- **sanitize**: clean (règles YAML + commandes install ; webhook Slack `XXXXX`, routingkey `xxxx` masqués, aucun secret réel).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525, T1068], d3fend_techniques préservés (5).
- **chemin library**: `packages/skills/library/detecting-container-escape-with-falco-rules/SKILL.md`
- **état**: boosté shape exemplaire (8 blocs, Prompt Defense Baseline verbatim, frameworks+d3fend préservés). 0 sdk, 0 secret.

## detecting-privilege-escalation-in-kubernetes-pods
- **décision**: adapt (keeper)
- **raison**: détection + prévention 3-couches de l'escalade de privilège dans les pods k8s — admission (PSS restricted, OPA Gatekeeper/Kyverno bloquant caps dangereuses/privileged/hostPID/hostNetwork), runtime (Falco : setuid exec, gain de capability, démarrage cap dangereuse, write /etc/passwd), audit (policy + requêtes kubectl/jq). Mappe directement §5 (gating cross-projet/haut-risque) appliqué à la couche orchestration. Posture défensive.
- **dedup**: non — pas d'équivalent privesc-k8s MAOS ; disjoint d'ECC. Complète `detecting-container-escape-*` (escape vs escalation interne).
- **sanitize**: clean (manifests PSS/Gatekeeper/Falco + requêtes jq d'exemple, aucun secret).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525, T1068], d3fend_techniques préservés (5).
- **chemin library**: `packages/skills/library/detecting-privilege-escalation-in-kubernetes-pods/SKILL.md`
- **état**: boosté shape exemplaire (8 blocs, Prompt Defense Baseline verbatim, frameworks+d3fend préservés). 0 sdk, 0 secret.

## hardening-docker-containers-for-production
- **décision**: adapt (keeper)
- **raison**: durcissement Docker production CIS Benchmark v1.8.0 (host/daemon/image/runtime) : non-root, read-only rootfs, cap-drop ALL, limites ressources, no-new-privileges, seccomp/AppArmor, content trust, TLS daemon, auditd hôte ; validation docker-bench/hadolint/dockle. Cœur défensif least-privilege/immutabilité, mappe §5 sandbox.
- **dedup**: non — pas d'équivalent hardening-docker MAOS ; disjoint d'ECC. Complète daemon-hardening (lot DH item 7).
- **sanitize**: clean (Dockerfile/daemon.json/flags d'exemple, certs = chemins, aucun secret réel).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525, T1068].
- **chemin library**: `packages/skills/library/hardening-docker-containers-for-production/SKILL.md`
- **état**: boosté shape exemplaire (8 blocs, Prompt Defense Baseline verbatim, frameworks préservés). 0 sdk, 0 secret.

## hardening-docker-daemon-configuration
- **décision**: adapt (keeper)
- **raison**: durcissement du daemon dockerd (cible root la plus précieuse) : userns-remap (mappe root container→UID hôte non-privilégié), icc:false, no-new-privileges, API distante TLS+tlsverify mutuel, rootless, content trust, protection socket (jamais monté dans un container). Couche daemon complémentaire du hardening container. Mappe §5.
- **dedup**: non — pas d'équivalent MAOS ; disjoint d'ECC. Complète `hardening-docker-containers-for-production` (item 6, couche runtime/image).
- **sanitize**: clean (daemon.json + openssl genrsa = commandes de génération de certs, pas de clé réelle ; aucun secret embarqué).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525, T1553].
- **chemin library**: `packages/skills/library/hardening-docker-daemon-configuration/SKILL.md`
- **état**: boosté shape exemplaire (8 blocs, Prompt Defense Baseline verbatim, frameworks préservés). 0 sdk, 0 secret.

## implementing-container-image-minimal-base-with-distroless
- **décision**: adapt (keeper)
- **raison**: réduction de surface d'attaque via bases minimales distroless/DHI (zéro shell/package-manager/coreutils, ~95% de surface en moins, CVEs 50-200+→0-5) : choix de base par runtime, build multi-stage artifacts-only, USER nonroot, stratégies de debug sans shell, scan Trivy. Lentille supply-chain défensive, mappe §5.
- **dedup**: non — pas d'équivalent MAOS ; disjoint d'ECC.
- **sanitize**: clean (Dockerfiles d'exemple, aucun secret).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525, T1195].
- **chemin library**: `packages/skills/library/implementing-container-image-minimal-base-with-distroless/SKILL.md`
- **état**: boosté shape exemplaire (8 blocs, Prompt Defense Baseline verbatim, frameworks préservés). 0 sdk, 0 secret.

## implementing-container-network-policies-with-calico
- **décision**: adapt (keeper, source mince → corps enrichi)
- **raison**: micro-segmentation zero-trust k8s via Calico : audit → default-deny ingress+egress par namespace → allow granulaires → restriction egress (DNS-based) → validation par tests de connectivité. C'est le limbe RÉSEAU de §5 (`allowed_hosts`/egress gating) appliqué aux pods — contient le mouvement latéral après compromission d'un pod. Source originale ~30 lignes (workflow squelette) ; corps reconstruit aux 7 sections §12 sans inventer de mécanique hors-source.
- **dedup**: non — pas d'équivalent network-policy MAOS ; disjoint d'ECC. Renforce la doctrine §5 réseau côté cluster.
- **sanitize**: clean (workflow + description CRD, aucun secret).
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525].
- **chemin library**: `packages/skills/library/implementing-container-network-policies-with-calico/SKILL.md`
- **état**: boosté shape exemplaire (8 blocs, Prompt Defense Baseline verbatim, frameworks préservés). 0 sdk, 0 secret.

## implementing-image-provenance-verification-with-cosign
- **décision**: adapt (keeper)
- **raison**: provenance supply-chain via Sigstore Cosign : signature key-based (KMS) ou keyless OIDC (Fulcio+Rekor), attestations SBOM/vuln/SLSA, intégration CI/CD (sign by digest), enforcement admission (policy-controller/Kyverno) = images signées seulement, vérif chaîne complète. Ancre de confiance pour quels containers MAOS autorise, mappe §5 (gating artefacts non-fiables).
- **dedup**: non — pas d'équivalent provenance/signing MAOS ; disjoint d'ECC. Complète distroless (item 8) sur l'axe supply-chain.
- **sanitize**: clean. Note: la doctrine du corps insiste sur KMS/keyless et INTERDIT les clés long-terme en repo/env (renforce §11/secrets) ; `cosign generate-key-pair` = commande de génération, aucune clé réelle présente.
- **frameworks**: nist_csf [PR.PS-01, PR.IR-01, ID.AM-08, DE.CM-01], mitre_attack [T1610, T1611, T1609, T1525, T1195].
- **chemin library**: `packages/skills/library/implementing-image-provenance-verification-with-cosign/SKILL.md`
- **état**: boosté shape exemplaire (8 blocs, Prompt Defense Baseline verbatim, frameworks préservés). 0 sdk, 0 secret.

---

## Bilan final lot DH

10/10 keepers, 0 reject, 0 renommage (library-slug == source-slug pour les 10). Cluster `cyber:container-security`, tier T1, status library. Garde-fou défensif tenu : détection (audit-logs, drift, escape ×2, privesc), durcissement (containers, daemon, distroless), réseau (Calico default-deny), provenance (cosign). Aucune arme/évasion/ciblage-de-masse. Sanitize 10/10 clean, 0 `@anthropic-ai/sdk`, recadrage §11 (quota, jamais $/€) appliqué partout. Frameworks (nist_csf/mitre_attack + d3fend quand présent) préservés sous `metadata.frameworks`.
