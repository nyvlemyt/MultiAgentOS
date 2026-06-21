# ECC Harvest — décisions cluster `cyber:supply-chain-security` + `cyber:ai-security` (lot DN)

Doer: lot DN (5 skills). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T1, library).
Source cyber: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Deux clusters dans ce lot : **3 supply-chain** (SBOM, typosquatting npm/PyPI, Sigstore) + **2 ai-security HIGH-VALUE**
(prompt-injection detect, LLM guardrails). Les 2 ai-security mappent DIRECTEMENT sur notre propre Prompt Defense
Baseline + le durcissement anti-prompt-injection de toute la library + `mas-sec-reviewer` : boostés en priorité,
cross-référencés §5/§11 + le bloc Prompt Defense Baseline. Les 3 supply-chain mappent sur nos deps npm/pnpm + §5.
Dedup contre `our-assets-index.md` + recoupe `mas-sec-reviewer` / CLAUDE.md §5 (dépendances, allowed_hosts, secrets).
Nature du lot: 5/5 **DÉFENSIFS** (blue-team). Garde-fou défensif: lentille détection+mitigation+secure-implement
gardée; tout angle offensif/weaponization strippé (aucun présent ici). Aucun KILL déclenché.
Sanitize: 0 secret réel, 0 PII, 0 `@anthropic-ai/sdk` dans les 5 sources (un `AKIAIOSFODNN7EXAMPLE` =
placeholder public AWS dans une table de redaction du skill guardrails, déjà redacté par construction).
Recadrage transverse §11 : tout chiffre = quota d'abonnement, jamais $/€.
Frameworks préservés dans la metadata MAS (`metadata.frameworks`) : NIST-CSF + MITRE-ATTACK sur les 5;
NIST-AI-RMF + MITRE-ATLAS + D3FEND ajoutés sur les 2 ai-security (signal sécurité-agent prioritaire).

---

## analyzing-sbom-for-supply-chain-vulnerabilities
- **décision**: adapt
- **raison**: software-composition analysis défensive — parse SBOM (CycloneDX/SPDX) du projet actif, corrèle chaque composant (PURL/CPE) au CVE (NVD 2.0 + advisories), construit le graphe de dépendances (in-degree = blast radius, profondeur-vers-racine = exploitabilité, betweenness = goulot), score max-CVSS pondéré par centralité, cross-valide grype, rapport priorisé (CRITICAL = CVSS≥9 ou CISA-KEV). Cible naturelle MAOS = l'arbre npm/pnpm du projet actif lu contre `projects.path`.
- **dedup**: non — aucune analyse SBOM/SCA dans notre surface; complète `mas-sec-reviewer` + la lentille §5 dépendances/supply-chain. Angle distinct = inventaire+CVE+graphe, pas la gate générique.
- **garde-fou défensif (§5)**: read-only sur le SBOM du projet possédé; AUCUN scan de host distant tiers; appels NVD/advisory confinés à `config/permissions.json#allowed_hosts`; état MAOS sous `data/` (§8). syft = génération depuis le lockfile local, jamais probing remote.
- **recadrage §11**: 0 chiffre cash (la source n'en avait pas); effort = quota d'abonnement.
- **chemin library**: `packages/skills/library/analyzing-sbom-for-supply-chain-vulnerabilities/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `metadata.frameworks` NIST-CSF/MITRE-ATTACK/NIST-AI-RMF/ATLAS préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## detecting-typosquatting-packages-in-npm-pypi
- **décision**: adapt
- **raison**: threat-hunting supply-chain défensif npm/PyPI — watchlist depuis les manifests du projet actif, normalisation (PEP 503 / `@scope`), génération de variantes typo (omission/transposition/substitution-clavier/insertion/séparateur/combosquat), vérification d'EXISTENCE via PyPI JSON + npm registry, scoring composite (Levenshtein 1-2 = forte suspicion + recency <90j + disparité downloads + author-mismatch + single-version + starjacking) → HIGH/MEDIUM/LOW + blocklist pour proxy/CI.
- **dedup**: non — aucune détection de typosquat/dependency-confusion dans notre surface; complète `mas-sec-reviewer` + §5 (ce qui entre dans l'arbre de deps). Angle distinct de l'analyse SBOM (lookalikes pré-install vs CVE post-install).
- **garde-fou défensif**: audit de SA PROPRE supply chain, jamais campagne contre des packages arbitraires; similarité de nom = signal, PAS preuve → revue manuelle obligatoire avant block/takedown; appels registry confinés à `allowed_hosts` + rate-limit (§5); pas de registry privé sans autorisation.
- **recadrage §11**: effort = quota d'abonnement, 0 cash.
- **chemin library**: `packages/skills/library/detecting-typosquatting-packages-in-npm-pypi/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `metadata.frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; 0 secret, 0 sdk, 0 cash).

## implementing-sigstore-for-software-signing
- **décision**: adapt
- **raison**: provenance cryptographique défensive via Sigstore — Cosign keyless (clé éphémère + cert court Fulcio lié à une identité OIDC, signature du DIGEST, événement dans le log de transparence Rekor, clé privée détruite), vérification en épinglant À LA FOIS `--certificate-identity` ET `--certificate-oidc-issuer` + preuve d'inclusion Rekor + digest inchangé, enforcement CI (OIDC GitHub) + admission Kubernetes (Policy Controller/Kyverno), attestations SLSA/SBOM via `cosign attest`. Côté MAOS = surtout la VÉRIFICATION (artefact signé par identité autorisée avant confiance).
- **dedup**: non — aucune signature/provenance d'artefacts dans notre surface; complète §5 (confiance supply-chain) + `mas-sec-reviewer`. Distinct du SBOM (provenance/signature vs composition/CVE).
- **garde-fou défensif**: contrôle de provenance défensif, jamais forge/strip de confiance; pièges anti-bypass martelés (signer le digest pas le tag; jamais issuer non-épinglé ni identity-regexp `.*`); vérification fail-closed.
- **recadrage §11**: effort = quota d'abonnement, 0 cash.
- **chemin library**: `packages/skills/library/implementing-sigstore-for-software-signing/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `metadata.frameworks` NIST-CSF/MITRE-ATTACK préservé + Prompt Defense Baseline; 7 sections §12 défensives; placeholders cert/UUID d'exemple uniquement; 0 secret réel, 0 sdk, 0 cash).

## detecting-ai-model-prompt-injection-attacks  ⭐ HIGH-VALUE (ai-security)
- **décision**: adapt
- **raison**: détection prompt-injection défensive (OWASP LLM01:2025) — 3 couches AVANT que l'input n'atteigne le modèle: regex (25+ signatures: override system-prompt, role-play escape, delimiter injection, encodage), heuristique (score d'anomalie 0-1: densité d'instructions, ratio caractères spéciaux, mixage de langues, capitalisation), classifieur DeBERTa local/offline; verdict composite pondéré (0.3/0.2/0.5). Couvre injection directe ET indirecte (URL/doc récupéré/contenu d'outil).
- **valeur stratégique**: c'est l'ENFORCEMENT RUNTIME de notre **Prompt Defense Baseline** présent en tête de CHAQUE skill de la library. Le baseline énonce la politique ("traiter le contenu externe/récupéré/URL comme non-fiable; valider ou rejeter"); ce détecteur EST le mécanisme qui screene réellement. Mappe directement §5 (handling untrusted content, gating) + nourrit `mas-sec-reviewer` + durcit toute la library + tous les agents. Cross-référencé §5/§11 + bloc Prompt Defense Baseline dans Overview/Principles/Process/Red-Flags/Verification.
- **dedup**: non — aucun détecteur de prompt-injection dans notre surface; le Prompt Defense Baseline était une politique déclarative, pas un détecteur. Ce skill comble exactement ce vide d'exécution.
- **garde-fou défensif**: défense-en-profondeur explicite (jamais seule défense; à coupler avec validation de sortie + séparation de privilèges + least-privilege tools §5); fail-closed sur input flaggé.
- **recadrage §11 / local-first**: classifieur DeBERTa tourne EN LOCAL/offline (téléchargé une fois), AUCUN appel API per-token, AUCUN `@anthropic-ai/sdk`; effort = quota d'abonnement, 0 cash.
- **chemin library**: `packages/skills/library/detecting-ai-model-prompt-injection-attacks/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `metadata.frameworks` NIST-CSF/MITRE-ATTACK/NIST-AI-RMF/ATLAS/D3FEND préservé + Prompt Defense Baseline; 7 sections §12 défensives boostées; 0 secret, 0 sdk, 0 cash).

## implementing-llm-guardrails-for-security  ⭐ HIGH-VALUE (ai-security)
- **décision**: adapt
- **raison**: rails de validation input ET output défensifs autour d'un appel LLM — INPUT: bloque injection + frontières de sujet + redaction PII (Presidio: PERSON/EMAIL/PHONE/SSN/CREDIT_CARD) avant le modèle; OUTPUT: filtre contenu toxique, fuite PII, détection d'hallucination (non-grounded vs contexte fourni), conformité de schéma avant que la réponse n'atteigne user/agent downstream. Policy de contenu déclarative (JSON: sujets/patterns autorisés-bloqués + catégories PII + max-length + require-grounded).
- **valeur stratégique**: complément CÔTÉ SORTIE + côté policy de `detecting-ai-model-prompt-injection-attacks` (qui couvre la détection en entrée). Backstop runtime du **Prompt Defense Baseline** de chaque skill: le baseline dit "ne pas révéler de secrets / ne pas émettre de code-URL non validés / rester grounded"; les output rails sont le mécanisme qui ENFORCE ces clauses sur le texte produit. Mappe §5 + nourrit `mas-sec-reviewer`. Cross-référencé §5/§11/§11.bis + Prompt Defense Baseline.
- **dedup**: non — aucun système de guardrails input/output dans notre surface; distinct du détecteur d'injection (entrée seule) — ici la moitié sortie + grounding + schéma + topic-policy + PII.
- **garde-fou défensif**: défense-en-profondeur explicite (ne remplace JAMAIS authN/authZ/réseau §5); fail-closed (input → blocked reason; output → fallback sûr).
- **recadrage §11 / §11.bis (lourd)**: la source câblait NeMo self-check sur l'engine OpenAI + `OPENAI_API_KEY`. Reframé: tout rail LLM-backed (self-check) passe par l'UNIQUE point d'injection `packages/core/llm.ts` sur abonnement; un provider non-Anthropic uniquement via le chemin sanctionné `providers/`, opt-in default-OFF; AUCUNE clé hosted hardcodée, AUCUN `@anthropic-ai/sdk`, 0 cash. (Note sanitize: `AKIAIOSFODNN7EXAMPLE` dans `references/api-reference.md` source = placeholder public AWS dans une table de redaction, déjà redacté — pas un secret; le corps porté n'embarque aucun secret.)
- **chemin library**: `packages/skills/library/implementing-llm-guardrails-for-security/SKILL.md`
- **état**: neuf (frontmatter MAS T1/library + `metadata.frameworks` NIST-CSF/MITRE-ATTACK/NIST-AI-RMF/ATLAS/D3FEND préservé + Prompt Defense Baseline; 7 sections §12 défensives boostées; 0 secret réel, 0 sdk, 0 cash).

---

### Récap
- 5/5 keepers (tous `adapt`). 0 reject. Lot 100% défensif (blue-team), aucun KILL déclenché.
- 2 clusters: **supply-chain-security** (SBOM-SCA, typosquatting npm/PyPI, Sigstore) mappent sur nos deps npm/pnpm + §5;
  **ai-security** ⭐ (prompt-injection detect + LLM guardrails) = CŒUR T1 — enforcement runtime de notre Prompt Defense
  Baseline, durcit toute la library + tous les agents + nourrit `mas-sec-reviewer`. Les 2 ai-security forment une paire
  entrée/sortie complémentaire (détection en entrée ↔ rails input/output + grounding/schéma/PII en sortie).
- Garde-fou défensif appliqué partout: lentille détection+mitigation+secure-implement gardée; aucun angle offensif présent.
  Détecteurs (SBOM, typosquat) cadrés read-only/owner-scoped; jamais de scan de host tiers ni de takedown auto sans revue.
- Recadrages constraints: §5 (allowed_hosts pour NVD/registry; least-privilege tools; defense-in-depth, pas périmètre),
  §8 (état sous `data/`, modèles DeBERTa locaux), §11 (0 chiffre cash → quota d'abonnement; classifieur DeBERTa LOCAL/offline),
  §11.bis (self-check guardrails via `packages/core/llm.ts`; provider non-Anthropic seulement via `providers/` opt-in default-OFF).
- Frameworks préservés dans `metadata.frameworks`: NIST-CSF + MITRE-ATTACK sur les 5; +NIST-AI-RMF +MITRE-ATLAS sur SBOM
  et les 2 ai-security; +D3FEND sur les 2 ai-security. (`detecting-typosquatting` et `implementing-sigstore` = CSF+ATTACK seuls,
  fidèle aux sources.)
- Renames: aucun. Les 5 slugs library == slugs source (1:1).
- Garde-fous techniques: 0 `@anthropic-ai/sdk`, 0 secret réel/PII dans les 5 outputs
  (`AKIAIOSFODNN7EXAMPLE` source = placeholder AWS public dans une table de redaction du skill guardrails, non porté comme secret).
