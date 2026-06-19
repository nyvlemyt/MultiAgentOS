# ECC Harvest — décisions cluster `cyber:devsecops` (lot DG)

Doer: lot DG (8 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5/§7 (secure CI/CD, IaC/conteneur scan,
durcissement supply-chain, secure-coding). Nature du lot: skills **DÉFENSIFS** (blue-team) DevSecOps — intégration
pipeline SAST/DAST/SCA, durcissement images conteneur, threat-modeling, durcissement GitHub Actions.
Le frontmatter source porte `subdomain: devsecops` + `frameworks` NIST-CSF/MITRE-ATTACK (les 8) ; la skill de
threat-modeling porte en plus NIST-AI-RMF/ATLAS : mappings préservés dans la metadata MAS.
Garde-fou défensif appliqué à chaque skill : lentille secure-pipeline (détecter+bloquer+durcir) gardée ;
aucun payload offensif (ces 8 skills sont des intégrations CI/CD et du durcissement, pas du probing tiers).
Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 8 sources (tokens = placeholders `secrets.*`,
SHA d'exemple, hash tronqués). Recadrage transverse §11 : tout chiffre = quota d'abonnement, jamais $/€ ;
les sources n'utilisaient pas de cash (recadrage léger). Recadrage §11.bis sur Snyk : tier gratuit/SaaS = opt-in,
clé absente → désactivé, jamais un crash ; aucune dépendance PAYG introduite par la distillation.

---

## implementing-semgrep-for-custom-sast-rules
- **décision**: adapt
- **raison**: secure-coding défensif — authoring de règles Semgrep custom (YAML : pattern / pattern-either / metavariable-regex / pattern-not / mode taint source→sink→sanitizer) pour les patterns org-spécifiques que les rulesets communautaires ratent (secrets hardcodés, désérialisation unsafe, JWT none-alg, CSRF manquant). Discipline clé = tester chaque règle (`# ruleid:`/`# ok:` + `semgrep --test`), tagger CWE/OWASP + `fix`, gate CI sur ERROR, tuning précis (.semgrepignore/nosemgrep). Nourrit la lentille secure-coding de `mas-sec-reviewer` (§5/§7).
- **dedup**: non — `mas-sec-reviewer` est une gate générique §5 ; aucun outillage d'authoring SAST custom dans notre surface. Angle distinct = écrire+tester les règles statiques elles-mêmes.
- **garde-fou défensif**: Semgrep est statique/non-mutant ; analyse le projet externe en read-only (§8), tout fix = diff proposé derrière la review gate (§7), jamais de réécriture silencieuse. Aucun payload offensif.
- **chemin library**: `packages/skills/library/implementing-semgrep-for-custom-sast-rules/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline verbatim ; 7 sections §12 réécrites défensives ; 0 secret, 0 sdk, 0 cash).


## integrating-dast-with-owasp-zap-in-pipeline
- **décision**: adapt
- **raison**: DAST défensif en pipeline (OWASP ZAP) contre un staging POSSÉDÉ — baseline passif rapide en CI (2-5 min), full actif planifié hors chemin critique, scan API piloté par spec OpenAPI, gate `rules.tsv` (IGNORE/WARN/FAIL : FAIL sur XSS/SQLi, WARN sur headers/cookies). Catche le runtime que le SAST ne voit pas. Nourrit la lentille web-app-security de `mas-sec-reviewer`.
- **dedup**: non — aucun outillage DAST dans notre surface ; complète SAST/SCA (angle runtime). Distinct de `mas-sec-reviewer` (gate générique §5).
- **garde-fou défensif (§5)**: les scans actifs ÉMETTENT du trafic d'attaque → uniquement contre un staging possédé et coordonné, jamais prod-sans-coordination ni hôte tiers (§5 network gating / allowed_hosts). Martelé dans Principles/Process/Red Flags.
- **chemin library**: `packages/skills/library/integrating-dast-with-owasp-zap-in-pipeline/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline verbatim ; 7 sections §12 défensives ; placeholders staging.example.com ; 0 secret, 0 sdk, 0 cash).

## integrating-sast-into-github-actions-pipeline
- **décision**: adapt
- **raison**: SAST continu défensif en GitHub Actions (CodeQL sémantique + Semgrep custom) — scan PR/push + run hebdo planifié, SARIF sous catégories distinctes, gate merge via branch protection, budget faux-positifs < ~15 % (excludes CodeQL / .semgrepignore / nosemgrep ciblé, jamais suppression en bloc), path-filters pour borner le coût CI. Remplace la revue manuelle périodique par de l'enforcement par-changement. Arme de la lentille secure-coding de `mas-sec-reviewer` (§5/§7).
- **dedup**: chevauche `implementing-semgrep-for-custom-sast-rules` mais angle distinct = orchestration CI/gate/branch-protection des DEUX moteurs (l'autre = authoring de règles). Complète `mas-sec-reviewer`.
- **garde-fou défensif**: analyse read-only du projet externe (§8) ; tout fix = diff derrière la review gate (§7). Tokens (`SEMGREP_APP_TOKEN`/`GITHUB_TOKEN`) = `secrets.*`, jamais committés (§5 secrets).
- **chemin library**: `packages/skills/library/integrating-sast-into-github-actions-pipeline/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline verbatim ; 7 sections §12 défensives ; 0 secret réel, 0 sdk, 0 cash).

## performing-container-image-hardening
- **décision**: adapt
- **raison**: durcissement défensif d'images conteneur — multi-stage (build deps hors runtime), base minimale (distroless/slim/scratch), USER non-root, suppression package-manager/shell/setuid/docs, base pinnée par digest SHA256, securityContext K8s (runAsNonRoot, readOnlyRootFilesystem, drop ALL, seccomp RuntimeDefault), validation Trivy + docker-bench + assertions comportementales. Réduit la surface d'attaque (moins de paquets = moins de CVE). Nourrit la lentille supply-chain de `mas-sec-reviewer`.
- **dedup**: non — durcissement build-time absent de notre surface ; complète `scanning-containers-with-trivy-in-cicd` (ici = construire l'image durcie, là = la scanner). 
- **garde-fou défensif**: T1610/T1611 (deploy-container/escape) = ce qu'on DÉNIE, jamais ce qu'on exécute. Dockerfile durci = diff reviewable contre le projet externe read-only (§7/§8) ; réductions = compteurs CVE/taille, jamais $/€ (§11).
- **chemin library**: `packages/skills/library/performing-container-image-hardening/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK (incl. T1610/T1611) préservé + Prompt Defense Baseline verbatim ; 7 sections §12 défensives ; digest d'exemple = placeholder ; 0 secret, 0 sdk, 0 cash).

## performing-sca-dependency-scanning-with-snyk
- **décision**: adapt
- **raison**: SCA défensif des dépendances open-source (Snyk) — scan manifests/lockfiles, distinction direct/transitif, triage par exploit-maturity + reachability (pas CVSS seul), remédiation par fix-PR / override-pin du transitif safe (npm overrides, Maven dependencyManagement), risque accepté via `.snyk` avec reason+`expires` (jamais d'ignore non-borné), gate sur critical/high *corrigeables* + `monitor` pour les CVE nouvellement divulguées + licences (GPL/AGPL). Nourrit la lentille supply-chain de `mas-sec-reviewer`.
- **dedup**: chevauche `scanning-containers-with-trivy-in-cicd` (Trivy fait aussi du dep-scan) — gardés distincts : ici = SCA multi-écosystème app-level + fix-PR + policy d'exceptions ; Trivy = image/OS + IaC. Trivy explicitement nommé comme fallback gratuit.
- **recadrage §11.bis**: Snyk = SaaS tier-gratuit **opt-in** ; `SNYK_TOKEN` = secret CI, clé absente → skip avec warning, jamais crash ; fallbacks gratuits documentés (Trivy / OWASP Dependency-Check / pip-audit / npm audit). Snyk n'est PAS un chemin Anthropic-PAYG ; effort = quota, jamais $/€.
- **garde-fou défensif**: protection de la chaîne de dépendances ; aucun exploit. Token jamais committé (§5 secrets).
- **chemin library**: `packages/skills/library/performing-sca-dependency-scanning-with-snyk/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline verbatim ; 7 sections §12 défensives ; SNYK-* d'exemple = placeholders ; 0 secret réel, 0 sdk, 0 cash).

## performing-threat-modeling-with-owasp-threat-dragon
- **décision**: adapt
- **raison**: threat-modeling défensif design-phase (OWASP Threat Dragon) — scope (assets/dépendances/compliance/trust-boundaries), DFD (process/store/external-entity/flow), énumération par élément en STRIDE (+ LINDDUN privacy) mappée type-d'élément→catégories, classement Mitigated/N-A/Open avec owner+priorité+classe de mitigation (prevent/detect/respond/transfer), JSON versionné vivant. Front-end structuré de la lentille secure-design de `mas-sec-reviewer` (§5) : identifie les surfaces risk:high/blocking à gater par un humain.
- **dedup**: non — aucun outillage de threat-modeling/secure-design dans notre surface ; complète les skills de scan (angle conception, pas exécution).
- **garde-fou défensif**: STRIDE/LINDDUN = ce qu'on DÉFEND, jamais une procédure d'attaque ; énumération non-exécutante ; JSON = diff contre le projet read-only (§8) ; surfaces risk:high/blocking routées vers la gate humaine §5.
- **signal AI-security (§12)**: porte NIST-AI-RMF + MITRE ATLAS (AML.T0070/0066/0082) → prioritaire pour la doctrine agent-sandbox / prompt-injection de MultiAgentOS. `frameworks` AI préservés dans la metadata.
- **chemin library**: `packages/skills/library/performing-threat-modeling-with-owasp-threat-dragon/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK/NIST-AI-RMF/ATLAS préservé + Prompt Defense Baseline verbatim ; 7 sections §12 défensives ; 0 secret, 0 sdk, 0 cash).

## scanning-containers-with-trivy-in-cicd
- **décision**: adapt
- **raison**: scan conteneur défensif en CI/CD (Trivy) — CVE OS+deps des images (`--exit-code 1 --ignore-unfixed`), misconfig Dockerfile/IaC (`trivy config` : USER set, pas de :latest, pas de secret en ENV/ARG, COPY>ADD), `trivy fs` du build context (les paquets build-stage comptent), SBOM CycloneDX/SPDX découplé, exceptions `.trivyignore` avec statement+`expires` (VEX), cache DB (+ air-gapped) sans périmer les nouvelles CVE. Gate le push registry sur exit 0. Nourrit la lentille supply-chain de `mas-sec-reviewer`.
- **dedup**: chevauche `performing-sca-dependency-scanning-with-snyk` — distincts : Trivy = image/OS + IaC misconfig + SBOM (gratuit, défaut MAOS) ; Snyk = SCA app-level multi-éco + fix-PR. Complète `performing-container-image-hardening` (construire vs scanner).
- **garde-fou défensif**: T1610/T1611 = ce qu'on DÉNIE ; image scannée = bâtie depuis le projet read-only (§8) ; `ignore-unfixed` = réduction de bruit, pas masquage de risque corrigeable ; credentials registry = `secrets.*`, jamais committés (§5).
- **chemin library**: `packages/skills/library/scanning-containers-with-trivy-in-cicd/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK (incl. T1610/T1611) préservé + Prompt Defense Baseline verbatim ; 7 sections §12 défensives ; CVE/ARN d'exemple = placeholders ; 0 secret réel, 0 sdk, 0 cash).

## securing-github-actions-workflows
- **décision**: adapt
- **raison**: durcissement défensif des workflows GitHub Actions contre supply-chain/vol de credentials/élévation — pin SHA immuable (+ Dependabot), `permissions: {}` puis least-privilege par job, anti script-injection (input non-fiable via `env:` jamais inline `${{ }}`), fork PR hostiles par défaut (éviter `pull_request_target`, jamais checkout du head fork avec secrets), environment protection prod, jamais d'echo de secret + OIDC, CODEOWNERS sur `.github/workflows/`. Renforce directement §5 (supply-chain/secrets risqués) et §11 (clés jamais committées/client-side).
- **dedup**: non — durcissement CI-platform absent de notre surface ; protège la CI de MAOS *elle-même* + celle du projet externe. Complète les skills de scan (angle plateforme CI, pas code applicatif).
- **garde-fou défensif**: T1068/T1548 (élévation) = ce qu'on DÉNIE ; clés en `secrets.*`, jamais littéral ni `NEXT_PUBLIC_*` (§11) ; SHA d'exemple = placeholders.
- **chemin library**: `packages/skills/library/securing-github-actions-workflows/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `frameworks` NIST-CSF/MITRE-ATTACK (incl. T1068/T1548) préservé + Prompt Defense Baseline verbatim ; 7 sections §12 défensives ; 0 secret réel, 0 sdk, 0 cash).

---

### Récap
- 8/8 keepers (tous `adapt`). 0 reject. Lot 100% défensif (blue-team DevSecOps : SAST/DAST/SCA/durcissement conteneur/threat-modeling/CI hardening).
- 0 rename : les 8 slugs source = 8 slugs library (déjà descriptifs et sans collision, cf. cybersec-clusters.md §collisions = vide).
- Garde-fou défensif appliqué partout : lentille secure-pipeline (détecter+bloquer+durcir) gardée ; aucun payload offensif (ces skills sont des intégrations CI/CD et du durcissement, pas du probing tiers). Frontières dures explicitées : ZAP actif → staging possédé+coordonné uniquement (§5) ; analyses SAST/scan = read-only contre le projet externe (§8), fix = diff derrière la review gate (§7), jamais de réécriture silencieuse. Techniques MITRE mappées (T1610/T1611/T1068/T1548) = ce qu'on DÉNIE, jamais ce qu'on exécute.
- Frameworks préservés : NIST-CSF + MITRE-ATTACK sur les 8 ; `performing-threat-modeling-with-owasp-threat-dragon` ajoute NIST-AI-RMF + MITRE-ATLAS (AML.T0070/0066/0082) → signal AI-security prioritaire pour la doctrine agent-sandbox/prompt-injection de `mas-sec-reviewer` (§12).
- Recadrage §11 transverse : 0 chiffre cash (les sources n'en avaient pas) ; tuning/scan = quota d'abonnement. §11.bis sur Snyk : SaaS tier-gratuit **opt-in**, `SNYK_TOKEN` = secret CI, clé absente → skip+warning (jamais crash), fallbacks gratuits documentés (Trivy/OWASP Dependency-Check/pip-audit) ; Snyk n'est PAS un chemin Anthropic-PAYG.
- Tous nourrissent `mas-sec-reviewer` + la lentille §5/§7 (secure-coding, supply-chain, secrets, secure-design).
- Garde-fous techniques : 0 `@anthropic-ai/sdk`, 0 secret réel/PII dans les 8 outputs (tokens=`secrets.*`, SHA/CVE/ARN/digest = placeholders).
