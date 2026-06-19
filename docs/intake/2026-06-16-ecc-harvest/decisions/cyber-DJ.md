# ECC Harvest — décisions cluster `cyber:container-security` (lot DJ)

Doer: lot DJ (9 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5/§7 (durcissement conteneur,
scan d'images/manifests, sécurité du plan de contrôle Kubernetes, supply-chain registry/Helm). Nature du lot :
skills **DÉFENSIFS** (blue-team) container-security — CIS benchmarks (Docker Bench, kube-bench), évaluation
posture (etcd), scan de vulnérabilités d'images (Grype, Trivy), scan de manifests (Kubesec), durcissement
registry (Harbor) et Helm. Une seule skill au titre offensif (`performing-kubernetes-penetration-testing`),
traitée sous le garde-fou défensif ci-dessous.

Le frontmatter source porte `subdomain: container-security` + `frameworks` NIST-CSF (`PR.PS-01`, `PR.IR-01`,
`ID.AM-08`, `DE.CM-01`) / MITRE-ATTACK (`T1610`, `T1611`, `T1609`, `T1525`, plus variantes `T1573`/`T1195`/
`T1190`/`T1068`) : mappings préservés intégralement dans la metadata MAS (`frameworks`).

Garde-fou défensif appliqué : lentille auto-évaluation / détection / durcissement gardée ; aucun payload offensif
de ciblage tiers conservé. La skill pentest est **recadrée** en checklist d'auto-audit de *son propre* cluster
(trouver+corriger), recon externe sur infra tierce retirée, ATT&CK conservé comme carte de surface défensive.

Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 9 sources (mots de passe = placeholders
`<strong-password>` / `Harbor12345` exemple, tokens = placeholders `<github-token>`, clés = `<...>` génériques) ;
les rares littéraux d'exemple (`admin:Harbor12345`) reframés en placeholders dans la version MAS. Recadrage
transverse §11 : tout chiffre = quota d'abonnement, jamais $/€ ; les sources n'utilisaient pas de cash.
Recadrage §5 : ces scanners/benchmarks sont read-only par défaut ; toute remédiation (écriture
`/etc/docker/daemon.json`, `kube-apiserver.yaml`, `restart docker`, `kubectl apply` de pods privilégiés) est
une action `risk: high` qui passe par `mas-sec-reviewer` + clic humain (§5), explicité dans chaque corps.

---

## performing-docker-bench-security-assessment
- **décision**: adapt
- **raison**: assessment CIS Docker Benchmark via le script open-source Docker Bench for Security — audit
  read-only de la config hôte/daemon/runtime/operations, sortie PASS/WARN/FAIL. Nourrit `mas-sec-reviewer` +
  §5 (durcissement hôte conteneur). Lentille distincte des scanners d'images (vuln CVE) : ici on évalue la
  *posture de la plateforme* Docker, pas le contenu des images.
- **dedup**: non — aucune skill MAS n'audite la config daemon/hôte Docker contre CIS ; recoupe `mas-sec-reviewer`
  sur la philosophie gate-avant-écriture, sans la dupliquer (ce skill produit le rapport, le gate décide).
- **chemin library**: `packages/skills/library/performing-docker-bench-security-assessment/SKILL.md`
- **renommage**: aucun (slug source conservé).
- **état**: boosté §12 conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks préservés,
  Prompt Defense Baseline verbatim + 7 sections §12, 0 `@anthropic-ai/sdk`, 0 secret réel). Recadrages appliqués :
  scan read-only / remédiation `risk: high` gatée §5, quota ≠ cash §11, preuve JSON sous `data/` §8.

---

## performing-kubernetes-cis-benchmark-with-kube-bench
- **décision**: adapt
- **raison**: benchmark CIS Kubernetes via kube-bench (Aqua) — checks ciblés plan de contrôle / etcd / worker /
  policies, profils managed (EKS/GKE/AKS/OpenShift), sortie PASS/FAIL/WARN mappée aux ids CIS. Nourrit
  `mas-sec-reviewer` + §5 (durcissement cluster). Complète Docker Bench (hôte) côté orchestrateur K8s.
- **dedup**: non — distinct des scanners d'images (Trivy/Grype, CVE) et de Kubesec (analyse statique de manifest) ;
  ici audit *posture runtime du cluster* contre CIS. Recoupe `mas-sec-reviewer` sur le gate, sans le dupliquer.
- **chemin library**: `packages/skills/library/performing-kubernetes-cis-benchmark-with-kube-bench/SKILL.md`
- **renommage**: aucun (slug source conservé).
- **état**: boosté §12 conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks préservés,
  Prompt Defense Baseline verbatim + 7 sections §12, 0 sdk, 0 secret). Recadrages : scan read-only / remédiation
  manifest+restart `risk: high` gatée §5, bon profil `--benchmark`, re-bench obligatoire, quota ≠ cash §11.

---

## performing-kubernetes-etcd-security-assessment
- **décision**: adapt
- **raison**: évaluation posture etcd (le coffre des Secrets/RBAC/ConfigMaps du cluster) sur 5 axes — chiffrement
  au repos, TLS client+peer, contrôle d'accès, chiffrement des backups, isolation réseau — mappés CIS 2.1–2.7.
  Cœur défensif : etcd non durci = tous les Secrets en clair. Nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — granularité etcd-spécifique absente du benchmark cluster global (kube-bench le survole) ;
  recoupe la doctrine secrets/§8 mais ajoute la vérif concrète chiffrement-au-repos + rotation de clé.
- **chemin library**: `packages/skills/library/performing-kubernetes-etcd-security-assessment/SKILL.md`
- **renommage**: aucun (slug source conservé).
- **état**: boosté §12 conforme (frameworks préservés dont `T1573`, Prompt Defense Baseline verbatim + 7 sections,
  0 sdk, 0 secret). Renforcement défensif ajouté : matériel Secret = confidentiel, ne JAMAIS imprimer/logguer la
  valeur en clair (preuve = check ciphertext `k8s:enc:`) ; rotation de clé/réchiffrement = `risk: high` gaté §5.

---

## performing-kubernetes-penetration-testing  ⚠ skill au titre offensif — garde-fou appliqué
- **décision**: adapt (recadrage défensif lourd)
- **KILL criterion testé**: « pure attack playbook / weaponization / ciblage tiers / évasion » → **non déclenché**.
  La source est un audit *piloté par outils* (kube-hunter, kubescape, kube-bench + checks `kubectl`) d'un cluster,
  avec étape de cleanup explicite. Ce n'est pas un payload d'attaque autonome ni du ciblage de masse. → garde
  comme checklist d'**auto-évaluation défensive** (trouver+corriger SON propre cluster), conformément au garde-fou
  du lot. Si la source avait été un playbook d'exploitation pur sans cadrage outil/remédiation → REJECT.
- **raison**: vue attaquant de la surface de SON cluster (API server/kubelet/etcd/Dashboard exposés, RBAC trop
  large, Secrets fuités, NetworkPolicies manquantes) → liste de remédiation. ATT&CK-for-K8s relu comme carte de
  **détection/durcissement**, pas comme runbook d'attaque.
- **reframe appliqué**: (1) section `Scope & Authorization` ajoutée — cluster possédé + autorisé UNIQUEMENT ;
  recon externe / ciblage tiers / évasion = hors scope, rejetés. (2) recon externe (nmap/curl sur infra tierce)
  RETIRÉE du workflow ; enumeration read-only privilégiée. (3) toute sonde active (pod privilégié, exec,
  extraction de Secret, joignabilité metadata) = `risk: high` gatée §5 + cleanup obligatoire. (4) jamais de
  valeur de Secret en clair imprimée/loggée. (5) sortie = liste de remédiation routée `mas-sec-reviewer`, pas
  un runbook offensif.
- **dedup**: chevauche kube-bench (CIS) mais ajoute la lentille surface-attaquant + validation active gatée ;
  conservé distinct car il pilote la priorisation défensive par technique ATT&CK.
- **chemin library**: `packages/skills/library/performing-kubernetes-penetration-testing/SKILL.md`
- **renommage**: aucun — slug source conservé (le contenu est reframé défensif ; renommer masquerait la
  provenance ; la section Scope + description rendent l'intention défensive non ambiguë).
- **état**: boosté §12 conforme (Prompt Defense Baseline verbatim, section Scope & Authorization en plus des
  7 sections §12, 0 sdk, 0 secret). Re-audit: si un usage dérive vers du ciblage tiers en pratique → re-trancher
  vers REJECT et retirer de la library.

---

## scanning-container-images-with-grype
- **décision**: adapt
- **raison**: scanner CVE d'images/filesystems/SBOM (Anchore Grype, matching SBOM via Syft, feeds NVD/GHSA/OS).
  Lentille supply-chain défensive (`T1195`) : inventaire CVE → gate de build. Read-only ; la décision risquée
  est le gate (bloquer/accepter) routé `mas-sec-reviewer`.
- **dedup**: chevauche Trivy (CVE) mais coverage/matching différents et workflow SBOM-first Syft distinct ;
  conservé en complément (les deux scanners croisés = best practice). Pas de skill MAS équivalente.
- **chemin library**: `packages/skills/library/scanning-container-images-with-grype/SKILL.md`
- **renommage**: aucun (slug source conservé).
- **état**: boosté §12 conforme (frameworks préservés dont `T1195`, Prompt Defense Baseline verbatim + 7 sections,
  0 sdk, 0 secret). Recadrages : pin digest ≠ `:latest`, suppression seulement avec raison documentée +
  décision `mas-sec-reviewer`, DB à jour, quota ≠ cash §11.

---

## scanning-docker-images-with-trivy
- **décision**: adapt
- **raison**: scanner multi-cible Trivy (Aqua) — vuln (CVE OS+langage), misconfig (Dockerfile/K8s/Terraform),
  secret (creds en dur), license. Scanner conteneur par défaut (breadth). `T1190` préservé. Read-only ; gate +
  suppression + rotation de secret = décisions risquées routées `mas-sec-reviewer`.
- **dedup**: chevauche Grype (CVE) et Kubesec (misconfig manifest) mais ajoute scanners secret+license absents
  des deux ; conservé comme scanner principal. Pas de skill MAS équivalente.
- **chemin library**: `packages/skills/library/scanning-docker-images-with-trivy/SKILL.md`
- **renommage**: aucun (slug source conservé).
- **état**: boosté §12 conforme (frameworks préservés dont `T1190`, Prompt Defense Baseline verbatim + 7 sections,
  0 sdk, 0 secret réel). Renforcement défensif : un hit du scanner *secret* = matériel confidentiel, jamais
  imprimé ; rotation/suppression du secret fuité = action `risk: high` (§5 touche aux secrets). Pin digest,
  suppression documentée, quota ≠ cash §11.

---

## scanning-kubernetes-manifests-with-kubesec
- **décision**: adapt
- **raison**: analyse statique de manifests K8s (Kubesec/ControlPlane) — score numérique privilege-escalation /
  host-mounts / caps / securityContext, gate pré-deploy shift-left (`T1068`). Read-only ; le fix = édition
  interne du manifest, le deploy = action gatée §4.
- **dedup**: chevauche Trivy `config` (misconfig K8s) mais le scoring points-positifs/négatifs + webhook
  admission est purpose-built et complémentaire ; conservé distinct.
- **chemin library**: `packages/skills/library/scanning-kubernetes-manifests-with-kubesec/SKILL.md`
- **renommage**: aucun (slug source conservé).
- **état**: boosté §12 conforme (frameworks préservés dont `T1068`, Prompt Defense Baseline verbatim + 7 sections,
  0 sdk, 0 secret). Renforcement défensif : préférer CLI/API locale, NE PAS POSTer les manifests vers
  `v2.kubesec.io` (egress de topologie = §5 allowed_hosts) ; re-scan obligatoire ; score = plancher pas garantie.

---

## securing-container-registry-with-harbor
- **décision**: adapt
- **raison**: durcissement registry Harbor — scan Trivy auto + `prevent_vul`, content trust Cosign, RBAC projet,
  tags immuables + rétention, OIDC. Point de contrôle supply-chain amont du deploy (`T1190`/`T1195`) :
  empêche le pull d'images non signées/vulnérables. Nourrit §5.
- **dedup**: non — aucune skill MAS ne couvre le durcissement registry ; complète les scanners (qui observent)
  par l'enforcement (qui bloque).
- **chemin library**: `packages/skills/library/securing-container-registry-with-harbor/SKILL.md`
- **renommage**: aucun (slug source conservé).
- **état**: boosté §12 conforme (frameworks préservés dont `T1190`, Prompt Defense Baseline verbatim + 7 sections,
  0 sdk). Sanitize : mots de passe/secrets de la source (`harborAdminPassword`, DB pw, `secretKey`,
  `gitHubToken`, `admin:Harbor12345`) = placeholders ; corps insiste : secrets hors config commitée (§5/§11.bis).
  Recadrages : changements policy/RBAC/auth = `risk: high` gatés §5, `prevent_vul`+content-trust obligatoires,
  TLS + `oidc_verify_cert`, quota ≠ cash §11.

---

## securing-helm-chart-deployments
- **décision**: adapt
- **raison**: sécurisation des déploiements Helm — provenance GPG (`helm verify`/`--verify`), render-and-scan
  des templates (kubesec/checkov/trivy/kube-linter), securityContext durci par défaut, secrets hors values,
  RBAC Helm least-privilege. Gate supply-chain au deploy (`T1195`) ; chaîne avec Kubesec. Nourrit §5.
- **dedup**: non — chevauche Kubesec (étape de scan du rendu) mais ajoute provenance/secrets/RBAC/defaults Helm ;
  conservé distinct comme skill de déploiement sécurisé end-to-end.
- **chemin library**: `packages/skills/library/securing-helm-chart-deployments/SKILL.md`
- **renommage**: aucun (slug source conservé).
- **état**: boosté §12 conforme (frameworks préservés dont `T1195`, Prompt Defense Baseline verbatim + 7 sections,
  0 sdk, 0 secret). Recadrages : chart tiers = untrusted jusqu'à vérif provenance ; secret dans values =
  `risk: high` (§5) → External Secrets/helm-secrets ; render-and-scan avant deploy ; `helm install/upgrade`
  gaté §4/§5 ; pin digest ≠ tag ; quota ≠ cash §11.

