# ECC Harvest — décisions cluster `cyber:devsecops`, lot DF

Doer: lot DF (9 skills DevSecOps). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Source: `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `--depth 1`, Apache-2.0, auteur `mahipal`). Sources lues dans `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`.

**Méthode**: intake-audit, barre = *garde-fou DevSecOps défensif* (CLAUDE.md §5/§7/§11/§12). Lentille permanente : durcissement CI/CD (SAST, secret-scan, IaC-scan, signature d'artefact, policy-as-code) appliqué à **notre propre pipeline** (GitHub Actions, §7 « verification = 5 checks », lint-no-sdk-payg guard §11) + posture supply-chain. Critère KILL explicite : une skill weaponisable (offensive/mass-targeting/évasion), OU dont la lentille défensive duplique déjà un keeper/asset existant sans rien ajouter, OU sans fit de première main avec notre stack TS/Node/Next, est **rejetée** ou mise en **watch**.

**Sanitize** (regex secrets/PII/internal): 9/9 sources clean (les `secret`/`AWS_SECRET_ACCESS_KEY`/`GPG_PRIVATE_KEY` des sources sont des *placeholders pédagogiques* `EXAMPLE`/`REDACTED`/`secrets.X`, pas de vraie valeur). `@anthropic-ai/sdk`: absent des 9 sources. Recadrage transverse §11 : tout chiffre de coût = unités de quota d'abonnement, jamais $/€ (skills sans coût per-token ici ; les « license seat » GHAS/GitLab Ultimate sont notés comme contrainte tierce, pas comme dépense MAOS).

**Frameworks préservés** depuis le frontmatter d'origine : `nist_csf` + `mitre_attack` (9/9) ; `nist_ai_rmf` (opa, fuzz) ; `atlas_techniques` (fuzz).

**Dedup**: aucune collision avec `our-assets-index.md` (24 skills `.claude/`, 56 agents, 7 fiches Tier B) ni avec la library existante (`security-scan`/`security-review` = génériques, non tool-spécifiques). Collision **intra-lot** traitée : les 2 secret-scan se chevauchent (gitleaks dédié vs gitleaks+trufflehog thin-gate) → un seul keeper.

**Bilan lot DF : 7 keepers, 2 rejects.**

---

## building-devsecops-pipeline-with-gitlab-ci  *(source: idem)*
- **décision**: adapt (recadrage secure-pipeline)
- **raison**: c'est la **doctrine-chapeau** du cluster — shift-left + gates ordonnés (SAST → deps → container → secret → DAST) bloquants fail-closed. Mappe **directement** notre propre CI : le guard `lint-no-sdk-payg` (§11) et les « 5 verification checks » (§7) *sont* exactement de tels gates ; le deploy production reste un gate humain (§5). On porte le *pattern* (pas la plateforme : nous = GitHub Actions, pas GitLab Ultimate).
- **strip**: rien d'offensif ; ajout d'un garde-fou « scanne le pipeline que TU possèdes, jamais pour sonder/évader celui d'un tiers » (§5). DAST recadré : cible un staging contrôlé, jamais prod ni système tiers.
- **dedup**: non — chapeau conceptuel ; les stages individuels renvoient aux keepers dédiés (gitleaks, aqua/Trivy, GHAS/CodeQL, Checkov, OPA) sans les dupliquer.
- **chemin library**: `packages/skills/library/building-devsecops-pipeline-with-gitlab-ci/SKILL.md`
- **état**: boosté conforme (ligne 1 `---`, commentaire source verbatim, summary L1 ≤200 tok, metadata+frameworks préservés, Prompt Defense Baseline verbatim, 7 sections §12 = Overview/Principles[cite source]/Process/Rationalizations/Red Flags/Verification, 0 `@anthropic-ai/sdk`, 0 secret réel). « Licence seat » recadré en contrainte tierce, pas dépense MAOS (§11).

## implementing-aqua-security-for-container-scanning  *(source: idem)*
- **décision**: adapt (recadrage supply-chain défensif)
- **raison**: Trivy = scan défensif natif (CVE images/deps + secrets + misconfig + SBOM). Lentille dep-audit/supply-chain appliquée à **nos propres** images Docker + lockfiles, alimente `mas-sec-reviewer`. Gate fail-closed sur CRITICAL ; SBOM = provenance re-scannable.
- **strip**: rien d'offensif. Ajout garde-fou « scanne ce que TU possèdes » (§5) + suppressions `.trivyignore` obligatoirement time-boxées (`exp:`).
- **dedup**: partiel avec le keeper IaC (`trivy config` Dockerfile/k8s vs Checkov Terraform) → noté dans le corps : Trivy fait le misconfig léger, le keeper IaC garde la profondeur policy-as-code/custom-checks. Distinct de SAST (GHAS/CodeQL). Aucun équivalent existant en library.
- **chemin library**: `packages/skills/library/implementing-aqua-security-for-container-scanning/SKILL.md`
- **état**: boosté conforme (8 sections, frameworks préservés, 0 sdk, 0 secret réel). « Aqua Platform licence » recadré contrainte tierce (§11).

## implementing-code-signing-for-artifacts  *(source: idem)*
- **décision**: adapt (recadrage supply-chain intégrité)
- **raison**: signature + vérification fail-closed d'artefacts = lentille intégrité/provenance supply-chain (§5). Sigstore keyless (cosign+Rekor+Fulcio) > clés GPG longues. Mappe nos invariants : deploy = gate humain (§5), clés de signature = secrets jamais commit/log (§11), verify default-deny avec identité pinnée.
- **strip**: rien d'offensif. Ajout garde-fous : « signe seulement des identités que TU possèdes » (anti-impersonation), clés hors repo (§11), verify obligatoirement pinné, signature ≠ sûreté (scan en plus).
- **dedup**: non — aucune skill signature/provenance existante ; complète aqua-scanning (origine vs contenu) sans dupliquer.
- **chemin library**: `packages/skills/library/implementing-code-signing-for-artifacts/SKILL.md`
- **état**: boosté conforme (8 sections, frameworks préservés, 0 sdk, 0 secret réel ; `GPG_PRIVATE_KEY`/`secrets.X` sources = placeholders pédagogiques).

## implementing-fuzz-testing-in-cicd-with-aflplusplus
- **décision**: reject (watch)
- **raison**: AFL++ est un fuzzer **coverage-guided pour binaires C/C++ compilés** (instrumentation `afl-clang-fast`, persistent mode, harness C, QEMU/Unicorn pour firmware). Notre stack = TS/Node/Next — **aucune cible C/C++/binaire compilée** à fuzzer de première main. La *lentille* défensive (fuzzer les parseurs d'input non-fiable) est valable mais ne s'opérationnalise pas avec AFL++ sur notre surface ; l'implémentation entière (toolchain C, ASAN, corpus binaire) est hors-stack et lourde à maintenir pour zéro cible actuelle. Garde-fou DevSecOps respecté (c'est défensif) mais **fit de première main = nul**.
- **KILL/fit**: pas weaponisé, mais *out-of-stack* (no compiled C/C++ target) → coût d'install/maintenance > valeur ; lentille « fuzz untrusted-input parser » couverte conceptuellement sans ce kit.
- **dedup**: implicite — la doctrine « tester les parseurs sur input hostile » vit déjà dans notre posture secure-coding (`unknown`+Zod `safeParse` aux trust boundaries, §7) pour le JS/TS.
- **chemin library**: aucun.
- **état**: rejeté. **Re-audit (watch)**: rouvrir **uniquement** si MAOS introduit un parseur natif compilé (C/C++/Rust/WASM) traitant de l'input non-fiable — alors un fuzzer adapté au langage (cargo-fuzz/libFuzzer/jazzer) serait audité, pas forcément AFL++.

## implementing-github-advanced-security-for-code-scanning  *(source: idem)*
- **décision**: adapt (recadrage secure-pipeline — **fit le plus fort du lot**)
- **raison**: GHAS/CodeQL = SAST sémantique + secret-scanning push-protection + dependency-review/Dependabot **sur GitHub** — exactement notre CI (le dépôt MAOS tourne sur GitHub Actions). Lentille SAST+secret-scan pour **notre propre dépôt**, à côté du guard `lint-no-sdk-payg` (§11) et des « 5 checks » (§7), alimente `mas-sec-reviewer`. Push-protection sert directement §11 (aucun `ANTHROPIC_API_KEY` ne doit atteindre l'historique).
- **strip**: rien d'offensif. Garde-fous : scanne seulement les repos que TU possèdes (§5) ; ne pas désactiver un gate requis pour verdir un build (anti-bypass).
- **dedup**: non — `security-scan`/`security-review` library = génériques ; aucun keeper SAST-GitHub existant. Distinct des lentilles container (aqua) et IaC (Checkov).
- **chemin library**: `packages/skills/library/implementing-github-advanced-security-for-code-scanning/SKILL.md`
- **état**: boosté conforme (8 sections, frameworks préservés, 0 sdk, 0 secret). « GHAS seat » recadré contrainte tierce (§11).

## implementing-infrastructure-as-code-security-scanning  *(source: idem)*
- **décision**: adapt (recadrage config-security défensif)
- **raison**: scan misconfig IaC (Checkov/tfsec/KICS) **avant provisioning** = policy-as-code governance fail-closed sur PR. Recadré sur l'infra-as-config que **nous** écrivons (Dockerfiles + tout manifest k8s/CI). Pas de Terraform aujourd'hui mais la doctrine (plan-scan, custom checks, gate `soft_fail:false`, suppressions time-boxées) est transférable et alimente `mas-sec-reviewer`.
- **strip**: rien d'offensif. Garde-fous : scanne la config que TU possèdes (§5), suppressions justifiées+expiry, distinction nette vs drift-CSPM (runtime) et vs SAST (source).
- **dedup**: **partiel** avec aqua/Trivy (`trivy config` Dockerfile/k8s) → tranché dans le corps : ce keeper garde la **profondeur policy/custom-checks + Terraform plan**, Trivy garde le misconfig image rapide ; pas de double gate bloquant redondant sur le même artefact.
- **chemin library**: `packages/skills/library/implementing-infrastructure-as-code-security-scanning/SKILL.md`
- **état**: boosté conforme (8 sections, frameworks préservés inc. T1078.004/T1530, 0 sdk, 0 secret).

## implementing-policy-as-code-with-open-policy-agent  *(source: idem)*
- **décision**: adapt (recadrage policy-as-code interne)
- **raison**: OPA/Rego/conftest + Gatekeeper = enforcement déterministe, versionné, testable de règles de gouvernance. Mappe **directement** notre modèle : `config/permissions.json` *est* notre point d'extension déclaratif des catégories risquées (§5), et un gate Rego/conftest peut enforcer des invariants repo (ex. interdiction d'import `@anthropic-ai/sdk` §11) en CI fail-closed, en complément de `lint-no-sdk-payg`.
- **strip**: rien d'offensif. Garde-fou **clé** ajouté : une policy peut *durcir* mais **jamais** contourner/auto-approuver un gate humain §5. Rollout warn→deny obligatoire, exemptions scoping system-namespaces uniquement.
- **dedup**: non — aucun keeper policy-as-code existant ; distinct de Trivy/Checkov (scan) et Falco (runtime).
- **chemin library**: `packages/skills/library/implementing-policy-as-code-with-open-policy-agent/SKILL.md`
- **état**: boosté conforme (8 sections, frameworks préservés inc. `nist_ai_rmf`, 0 sdk, 0 secret).

## implementing-secret-scanning-with-gitleaks  *(source: idem)*
- **décision**: adapt (recadrage §11 — **bras d'enforcement secrets**)
- **raison**: Gitleaks = pre-commit hook + CI gate + scan d'historique + baseline + remédiation rotate-then-clean. C'est la **défense §11 la plus directe** : le mécanisme garantissant que `ANTHROPIC_API_KEY`/clés provider n'atteignent jamais le dépôt (`.env*` gitignored), en renfort de `lint-no-sdk-payg`. Profond et dédié (vs le thin-gate rejeté ci-dessous).
- **strip**: rien d'offensif. Garde-fou **clé** : le rewrite d'historique (`git filter-repo` + force-push) est marqué **action §5 risk:high** = validation humaine + coordination équipe, jamais autopilot ; remédiation **rotate-first**.
- **dedup**: oui vs `implementing-secrets-scanning-in-ci-cd` (intra-lot) → ce keeper, plus riche, absorbe la couverture CI ; l'autre est rejeté.
- **chemin library**: `packages/skills/library/implementing-secret-scanning-with-gitleaks/SKILL.md`
- **état**: boosté conforme (8 sections, frameworks préservés inc. T1003/T1110, 0 sdk, 0 secret ; `AWS_SECRET_ACCESS_KEY` source = payload de TEST `EXAMPLE`, pas un vrai secret).

## implementing-secrets-scanning-in-ci-cd
- **décision**: reject
- **raison**: thin wrapper « gitleaks + trufflehog en gate CI » via un script agent qui parse 2 rapports JSON et émet un verdict pass/fail. La valeur — secret-scan comme gate CI fail-closed — est **entièrement absorbée** par le keeper `implementing-secret-scanning-with-gitleaks` (qui couvre déjà pre-commit + CI + history + baseline + custom rules + remédiation). Garder les deux = dup-no-better ; le second n'ajoute que « trufflehog en plus », mentionnable dans le keeper.
- **KILL/fit**: dup-no-better du keeper gitleaks (intra-lot) ; aucune mécanique unique sûre à conserver.
- **dedup**: oui — couverture CI = keeper gitleaks.
- **chemin library**: aucun.
- **état**: rejeté. **Re-audit**: non — rouvrir seulement si un besoin spécifique « trufflehog verified-secrets contre services live » émerge, et alors comme add-on au keeper gitleaks, pas comme skill séparée.

---

## Synthèse lot DF

| slug source | décision | chemin library | raison (≤6 mots) |
|---|---|---|---|
| building-devsecops-pipeline-with-gitlab-ci | adapt | building-devsecops-pipeline-with-gitlab-ci | doctrine-chapeau gates fail-closed, notre CI |
| implementing-aqua-security-for-container-scanning | adapt | implementing-aqua-security-for-container-scanning | scan images/deps/SBOM, supply-chain défensif |
| implementing-code-signing-for-artifacts | adapt | implementing-code-signing-for-artifacts | signature+verify intégrité supply-chain §5 |
| implementing-fuzz-testing-in-cicd-with-aflplusplus | **reject (watch)** | — | AFL++ C-only, hors-stack TS |
| implementing-github-advanced-security-for-code-scanning | adapt | implementing-github-advanced-security-for-code-scanning | SAST+secret GitHub, fit le plus fort |
| implementing-infrastructure-as-code-security-scanning | adapt | implementing-infrastructure-as-code-security-scanning | misconfig IaC avant deploy, policy-governance |
| implementing-policy-as-code-with-open-policy-agent | adapt | implementing-policy-as-code-with-open-policy-agent | OPA/Rego mappe permissions.json §5 |
| implementing-secret-scanning-with-gitleaks | adapt | implementing-secret-scanning-with-gitleaks | bras enforcement §11, le plus riche |
| implementing-secrets-scanning-in-ci-cd | **reject** | — | dup-no-better du keeper gitleaks |

**7 keepers, 2 rejects.** Tous les keepers : ligne 1 `---`, commentaire source verbatim, summary L1 ≤200 tok, metadata complet + `frameworks` préservés (`nist_csf`+`mitre_attack` partout ; `nist_ai_rmf` opa ; pas de keeper portant `atlas_techniques` — seul le rejeté fuzz en avait), Prompt Defense Baseline verbatim, 7 sections §12 (Overview/When/Principles[cite source]/Process/Rationalizations/Red Flags/Verification), recadrés DÉFENSIVEMENT (durcissement CI/CD : gates fail-closed, scan, signature, policy-as-code), 0 `@anthropic-ai/sdk`, 0 secret réel. Mapping transverse : §5 (deploy/force-push/cross-project gated, `config/permissions.json`, `allowed_hosts`), §7 (5 verification checks = gates), §11 (no PAYG, secret-scan keeps `ANTHROPIC_API_KEY` out, quota≠cash, `lint-no-sdk-payg`), `mas-sec-reviewer`. Stack MAOS = GitHub Actions/TS/Node/Next.
