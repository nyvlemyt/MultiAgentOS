# ECC Harvest — décisions cluster `cyber:vulnerability-management` (lot DM)

Doer: lot DM (8 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library) + **garde-fou défensif strict**.
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (priorisation du risque, gating,
posture). Nature du lot : gestion de vulnérabilités **DÉFENSIVE** (blue-team) — scan authentifié (OpenVAS, Nessus),
priorisation (CVSS, KEV+EPSS, SSVC), scan web (Nikto) et triage web (OWASP DAST/SAST). Le frontmatter source porte
`subdomain: vulnerability-management` + `frameworks` NIST-CSF (`ID.RA-01`, `ID.RA-02`, `ID.IM-02`, `ID.RA-06`) /
MITRE-ATTACK (`T1190`, `T1203`, `T1068`, +variantes `T1003`/`T1110`/`T1046`) ; deux skills portent en plus
`nist_ai_rmf` + `atlas_techniques` (KEV) : mappings préservés intégralement dans la metadata MAS (`frameworks`).

**Garde-fou défensif (KILL explicite)** : scanners = infra **possédée + autorisée** uniquement (autorisation écrite,
fenêtre de maintenance). REJECT tout résidu de weaponization / mass-targeting / évasion d'IDS. Appliqué à chaque skill :
lentille scan+priorisation+triage gardée ; toute évasion/contournement-de-détection retirée, tout payload de
validation reframé en test d'auto-app possédée, jamais en arme. Les scanners sont read-only par défaut ; toute
remédiation (patch, changement de config) est une action `risk: high` qui passe par `mas-sec-reviewer` + clic
humain (§5).

Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 8 sources (mots de passe = placeholders
`<password>`/`stored_in_vault`, IP/CVE = exemples). Les littéraux d'identifiants de scan (`scan_password_here`,
`smb_password_here`, `esxi_password_here`) reframés en placeholders `<...>` dans la version MAS, corps insiste :
credentials de scan en vault, jamais en clair dans la config. Recadrage transverse §11 : tout chiffre = quota
d'abonnement, jamais $/€ ; les sources n'utilisaient pas de cash (recadrage léger).

Bilan: **7 keepers (adapt) + 1 reject** (dup-no-better). Aucun renommage de slug.

---

## performing-authenticated-scan-with-openvas
- **décision**: adapt
- **raison**: scan authentifié (credentialed) via OpenVAS/Greenbone (GVM) — login SSH/SMB/ESXi sur les hôtes
  pour lire patchs/packages/config locale, ~10-50x plus de findings que l'unauthenticated. Lentille défensive
  read-only ; nourrit `mas-sec-reviewer` + §5 (visibilité host-level sur infra possédée).
- **dedup**: non — outil-spécifique GVM/open-source ; complémentaire à Nessus (commercial) ; aucune skill MAS
  ne couvre le scan authentifié. La validation credential-acceptance (NVTs auth-success) est purpose-built.
- **chemin library**: `packages/skills/library/performing-authenticated-scan-with-openvas/SKILL.md`
- **renommage**: aucun (slug source conservé).
- **état**: boosté §12 conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks préservés,
  Prompt Defense Baseline verbatim + 7 sections §12, 0 `@anthropic-ai/sdk`, 0 secret réel). Recadrages : infra
  possédée+autorisée UNIQUEMENT, credentials least-privilege en vault (placeholders `<...>`), validation auth
  obligatoire avant de croire les résultats, remédiation `risk: high` gatée §5, quota ≠ cash §11.

---

## scanning-infrastructure-with-nessus
- **décision**: adapt
- **raison**: scanner d'infra Tenable Nessus (serveurs/postes/équipements/OS) — policy tunée, scan
  authentifié/unauthenticated via REST API, interprétation severity + export. Lentille défensive read-only ;
  nourrit `mas-sec-reviewer` + §5 (inventaire vuln infra possédée). `T1046` (network discovery) préservé en plus.
- **dedup**: chevauche OpenVAS (scan authentifié) mais Nessus = scanner commercial dominant, plugins/policies
  Tenable-spécifiques + audits compliance (CIS/STIG/PCI) ; les deux croisés = best practice. Pas de skill MAS.
- **chemin library**: `packages/skills/library/scanning-infrastructure-with-nessus/SKILL.md`
- **renommage**: aucun (slug source conservé).
- **état**: boosté §12 conforme (frameworks préservés dont `T1046`, Prompt Defense Baseline verbatim + 7 sections,
  0 sdk, 0 secret réel). Recadrages : infra possédée+autorisée UNIQUEMENT, fenêtre de maintenance + exclusion
  des hôtes fragiles (medical/SCADA), credentials vault, policy tunée, validation manuelle des critical avant
  remédiation, remédiation `risk: high` gatée §5, quota ≠ cash §11.

---

## prioritizing-vulnerabilities-with-cvss-scoring
- **décision**: adapt
- **raison**: scoring CVSS v4.0/v3.1 — base metrics + threat + environmental + supplemental, vecteur string, et
  surtout priorisation *risk-based* (jamais base-score seul) en croisant EPSS/KEV/criticité d'actif/exposition →
  SLA P1-P5. Lentille défensive de priorisation déterministe ; nourrit `mas-sec-reviewer` + §5.
- **dedup**: chevauche conceptuellement la skill KEV (toutes deux priorisent) mais distinct : ici le *langage de
  sévérité* CVSS (vecteur, métriques, calcul) ; KEV se concentre sur la preuve d'exploitation. Usage croisé.
  Pas de skill MAS équivalente.
- **chemin library**: `packages/skills/library/prioritizing-vulnerabilities-with-cvss-scoring/SKILL.md`
- **renommage**: aucun (slug source conservé).
- **état**: boosté §12 conforme (frameworks préservés, Prompt Defense Baseline verbatim + 7 sections, 0 sdk,
  0 secret). Recadrages : jamais base-score seul (règle centrale), scoring déterministe (pas d'appel LLM, économie
  quota §11), rationale documentée pour audit, v2.0 interdit, critical routés `mas-sec-reviewer` §5, quota ≠ cash.

---

## performing-cve-prioritization-with-kev-catalog
- **décision**: adapt
- **raison**: priorisation CVE par preuve d'exploitation réelle — CISA KEV (BOD 22-01, flag ransomware, due dates
  FCEB) + EPSS + CVSS + criticité/exposition → modèle composite pondéré (KEV 30/EPSS 25/CVSS 20/crit 15/expo 10)
  → SLA P1-P5, KEV-listed = P1 toujours. Lentille défensive ; nourrit `mas-sec-reviewer` + §5 et déclenche threat-hunting.
- **dedup**: chevauche la skill CVSS (priorisation) mais distinct : ici la *preuve d'exploitation* (catalogue KEV +
  EPSS) pilote, CVSS n'est qu'un facteur. Usage croisé. Pas de skill MAS équivalente.
- **chemin library**: `packages/skills/library/performing-cve-prioritization-with-kev-catalog/SKILL.md`
- **renommage**: aucun (slug source conservé).
- **état**: boosté §12 conforme (frameworks préservés — seule skill du lot avec `nist_ai_rmf` + `atlas_techniques`,
  Prompt Defense Baseline verbatim + 7 sections, 0 sdk, 0 secret). Recadrages : KEV refresh quotidien, non-KEV ≠
  safe, scoring déterministe (économie quota §11), **egress feed limité aux hosts KEV/EPSS/NVD connus (§5
  allowed_hosts)** + feed = untrusted input, P1 routés `mas-sec-reviewer` §5, quota ≠ cash.

---

## triaging-vulnerabilities-with-ssvc-framework
- **décision**: adapt
- **raison**: triage par arbre de décision SSVC (CISA/SEI) — 5 points (exploitation status / technical impact /
  automatability / mission prevalence / public well-being) → 4 issues actionnables Track/Track*/Attend/Act + SLA.
  Là où CVSS donne un nombre, SSVC donne une *décision*. Lentille défensive déterministe ; nourrit `mas-sec-reviewer` §5.
- **dedup**: chevauche CVSS/KEV (toutes priorisent) mais distinct : SSVC = méthodologie *decision-tree* avec
  contexte mission+société, sortie = action pas score. Complémentaire, usage croisé. Pas de skill MAS équivalente.
- **chemin library**: `packages/skills/library/triaging-vulnerabilities-with-ssvc-framework/SKILL.md`
- **renommage**: aucun (slug source conservé).
- **état**: boosté §12 conforme (frameworks préservés, Prompt Defense Baseline verbatim + 7 sections, 0 sdk,
  0 secret). Recadrages : arbre = fonction pure déterministe (pas d'appel LLM, économie quota §11), exploitation
  status depuis preuve observée (KEV) pas CVSS, **egress KEV/EPSS limité aux hosts connus (§5 allowed_hosts)** +
  feed untrusted, Attend/Act routés `mas-sec-reviewer` §5, quota ≠ cash.

---

## performing-web-application-scanning-with-nikto  ⚠ section évasion source — garde-fou appliqué
- **décision**: adapt (recadrage défensif + strip évasion)
- **KILL criterion testé**: « évasion d'IDS / contournement de détection » → la source contient une section
  `evasion techniques (IDS avoidance)` (-evasion 1234). **RETIRÉE intégralement** de la version MAS : aucune
  utilité défensive sur infra possédée, l'évasion = se cacher d'un défenseur = posture offensive. Le reste de la
  skill (scan server/config read-only) est défensif et conservé. Si la skill avait été *centrée* sur l'évasion → REJECT.
- **raison**: scanner web-server open-source Nikto — misconfig, fichiers défaut/backup, versions obsolètes (CVE),
  méthodes HTTP dangereuses, headers de sécurité manquants, faiblesses SSL/TLS. Lentille défensive niveau
  serveur/config (pas app-logic → pairé ZAP/Burp) ; nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — couvre le durcissement web-server, complémentaire aux scanners d'infra (Nessus/OpenVAS) et au
  triage web (DAST/SAST). Pas de skill MAS équivalente.
- **chemin library**: `packages/skills/library/performing-web-application-scanning-with-nikto/SKILL.md`
- **renommage**: aucun — slug conservé (contenu reframé défensif ; description + Red Flags rendent l'intention
  non ambiguë).
- **état**: boosté §12 conforme (frameworks préservés, Prompt Defense Baseline verbatim + 7 sections, 0 sdk,
  0 secret). Recadrages : serveurs possédés+autorisés UNIQUEMENT (égress §5 allowed_hosts), **section évasion
  supprimée + interdite en Red Flag**, `-Pause` sur prod / pas d'agressif sur fragiles, validation manuelle des
  faux positifs (404 custom/WAF/CDN), scope server-only assumé, remédiation `risk: high` gatée §5, quota ≠ cash §11.

---

## performing-web-application-vulnerability-triage  ⚠ payloads de validation source — garde-fou appliqué
- **décision**: adapt (recadrage défensif app-possédée)
- **KILL criterion testé**: « payloads SQLi/XSS exploitables » → la source contient des payloads de *validation
  manuelle* (single-quote, boolean, time-based, reflected XSS). → **non déclenché** : usage = confirmer présence
  d'un finding sur SA PROPRE app, pas exploitation. Reframé : validation ⊂ app possédée + autorisée (non-prod),
  sonde minimale, JAMAIS de pivot vers exploitation/exfil. La version MAS retire les payloads littéraux explicites
  au profit de la doctrine « probe minimal, stop à la présence ». Si la source poussait à l'exploitation → REJECT.
- **raison**: triage de findings DAST/SAST (ZAP/Burp/Semgrep/SonarQube) — filtre vrais/faux positifs, OWASP Risk
  Rating (Likelihood × Impact), mapping OWASP Top10/CWE, priorisation. Réduit l'alert-fatigue. Lentille défensive
  déterministe ; nourrit `mas-sec-reviewer` + §5.
- **dedup**: non — couvre le triage *applicatif* (vs infra : Nessus/OpenVAS/CVSS/KEV). Complète Nikto (server-layer)
  par l'app-layer. Pas de skill MAS équivalente.
- **chemin library**: `packages/skills/library/performing-web-application-vulnerability-triage/SKILL.md`
- **renommage**: aucun (slug source conservé).
- **état**: boosté §12 conforme (frameworks préservés, Prompt Defense Baseline verbatim + 7 sections, 0 sdk,
  0 secret). Recadrages : validation ⊂ app possédée+autorisée non-prod (sonde minimale, **pas d'exploitation/exfil**,
  Red Flag explicite sur le pivot), OWASP Risk Rating déterministe (pas d'appel LLM, économie quota §11), injection
  → code review manuel, filtre faux-positifs avant rating, Critical/High routés `mas-sec-reviewer` §5, quota ≠ cash.

---

## performing-authenticated-vulnerability-scan
- **décision**: reject
- **raison**: version *générique* du scan authentifié credentialed (types de credentials par plateforme, comptes
  de service least-privilege, best-practices vault). Tout son contenu défensif récupérable est déjà couvert et
  rendu *concret* par les deux skills tool-spécifiques gardées du lot : `performing-authenticated-scan-with-openvas`
  (création de credentials + validation auth via GVM) et `scanning-infrastructure-with-nessus` (credentials
  authentifiés via Nessus). Cette skill n'ajoute aucun outil ni aucune procédure exécutable distincte — c'est de
  la doctrine générique sans surface propre.
- **dedup**: oui — **dup-no-better** : sous-ensemble conceptuel des deux skills gardées (mêmes credential-types
  SSH/SMB/SNMPv3/DB, mêmes best-practices vault/rotation/least-privilege, mêmes plugins de vérification d'auth),
  sans le binding outil qui rend les autres actionnables.
- **chemin library**: aucun (T0).
- **renommage**: n/a.
- **état**: rejeté. KILL: dup-no-better (couverte par OpenVAS + Nessus gardées) ; garder une 3e skill « scan
  authentifié » générique = bruit dans la library + chevauchement de routing. La doctrine least-privilege/vault
  est déjà injectée dans les corps des deux keepers. Re-audit: seulement si un scanner *tiers* non-couvert (Qualys,
  Rapid7 InsightVM) devient un besoin scopé — et alors comme skill tool-spécifique dédiée, pas comme générique.

---
