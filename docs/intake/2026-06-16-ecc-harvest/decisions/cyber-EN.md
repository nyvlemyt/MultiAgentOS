# ECC Harvest — décisions cluster `cyber:cryptography` (lot EN)

Doer: lot EN (7 skills, 1 titré offensif). Worktree `maos-ecc` (branche `phase/ecc-harvest`). Méthode: intake-audit, barre LARGE (T1, library), garde-fou défensif explicite.
Source cybersec: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0). Cible: `packages/skills/library/<slug>/SKILL.md`.
Recadrage transverse: MAOS = abonnement (§11), PAS de coût per-token PAYG ; tout chiffre = unités de quota, jamais $/€. Secrets/keystores/réseau = gatés §5.
Sanitize (regex secrets/PII/internal): 7/7 sources clean. `@anthropic-ai/sdk`: absent des 7 sources.
Champ `frameworks` préservé depuis le frontmatter source (nist_csf/mitre_attack + nist_ai_rmf/atlas_techniques quand présents).

**Garde-fou défensif (KILL criterion explicite ce lot)**: `performing-hash-cracking-with-hashcat` est titré offensif. Gardé UNIQUEMENT s'il se recadre en validation défensive de politique de mot de passe / audit autorisé de robustesse des hashes de NOTRE propre org. Si guide d'attaque pur (cracking-pour-accès, ciblage de masse, évasion) → REJECT. Renommage slug → `auditing-password-hash-strength`.

---

## implementing-rsa-key-pair-management
- **décision**: adapt
- **raison**: doctrine défensive du cycle de vie des clés RSA (génération ≥3072, sérialisation PEM/DER/PKCS#8, passphrase AES-256 + perms 0600, RSA-PSS/OAEP, rotation versionnée avec rétention). Aucune surface offensive. Recadré sur §5 (clé privée = secret gaté, jamais hors sandbox, jamais commitée) et §11 (pas de $).
- **dedup**: non — `mas-sec-reviewer` gate les actions risquées mais ne porte pas la doctrine PKI/clés ; aucun skill crypto existant en `library/`.
- **chemin library**: `packages/skills/library/implementing-rsa-key-pair-management/SKILL.md`
- **frameworks**: nist_csf [PR.DS-01/02/10], mitre_attack [T1600, T1573, T1553, T1486].
- **renommage**: aucun (slug source conservé).
- **état**: boosté conforme (ligne 1 `---`, commentaire source, summary L1 ≤200 tok, metadata complet + frameworks, Prompt Defense Baseline verbatim, 7 sections §12). 0 sdk, 0 secret. Re-audit: si NIST SP 800-57 révisé ou clé-floor relevé.

## implementing-zero-knowledge-proof-for-authentication
- **décision**: adapt
- **raison**: primitive d'authentification défensive préservant la vie privée (Schnorr + Fiat-Shamir + ZKPP) ; le serveur prouve la connaissance d'un secret sans jamais le recevoir. Réduit le rayon d'exposition des credentials. Recadré §5 (jamais logger/persister transcript ni secret ; entrée verifier = non-fiable) + §11.
- **dedup**: non — aucun skill d'auth/ZKP existant ; complémentaire de `mas-sec-reviewer` (qui gate, ne conçoit pas l'auth).
- **chemin library**: `packages/skills/library/implementing-zero-knowledge-proof-for-authentication/SKILL.md`
- **frameworks**: nist_csf [PR.DS-01/02/10], mitre_attack [T1600, T1573, T1553].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections = Prompt Defense Baseline + 7 §12, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret. Re-audit: si la construction Schnorr/Fiat-Shamir est dépréciée pour l'auth.

## performing-cryptographic-audit-of-application
- **décision**: adapt
- **raison**: skill défensif CŒUR T1 — scan read-only code+config pour algos dépréciés (MD5/SHA-1/DES/RC4), modes ECB, secrets en dur, KDF faibles, TLS obsolète, avec rapport severity+remédiation. Nourrit directement `mas-sec-reviewer` ; un secret en dur = événement §5-critique. Recadré read-and-report (jamais weaponize), valeur de secret redacted.
- **dedup**: complémentaire — `mas-sec-reviewer` gate les actions ; ce skill apporte la doctrine de détection crypto qui produit les findings. Pas de doublon.
- **chemin library**: `packages/skills/library/performing-cryptographic-audit-of-application/SKILL.md`
- **frameworks**: nist_csf [PR.DS-01/02/10], mitre_attack [T1600, T1573, T1553].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret. Re-audit: ajout d'algos dépréciés (ex. futurs retraits NIST).

## performing-hardware-security-module-integration
- **décision**: adapt
- **raison**: durcissement défensif de la custody des clés via PKCS#11 (CloudHSM/YubiHSM2/SoftHSM) ; clé privée non-exportable, signing on-device, inventaire + conformité FIPS 140-2/3. Recadré §5 (PIN/SO-PIN = secrets gatés, jamais loggés/commités/hardcodés ; config provider sandbox-bound) + §11. Frameworks riches préservés (nist_ai_rmf + atlas_techniques — pertinent sécurité-agent §12).
- **dedup**: non — complète le skill RSA (software keys) côté hardware/tamper-resistant ; aucun doublon.
- **chemin library**: `packages/skills/library/performing-hardware-security-module-integration/SKILL.md`
- **frameworks**: nist_csf [PR.DS-01/02/10], mitre_attack [T1600, T1573, T1553, T1078.004, T1530], nist_ai_rmf [MEASURE-2.7, MAP-5.1, MANAGE-2.4], atlas_techniques [AML.T0070, AML.T0066, AML.T0082].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks complets, commentaire source). 0 sdk, 0 secret. Re-audit: évolution FIPS 140-3 ou dépréciation PKCS#11.

## performing-hash-cracking-with-hashcat  →  auditing-password-hash-strength
- **décision**: adapt (recadrage offensif→défensif lourd + RENOMMAGE)
- **garde-fou (KILL appliqué)**: skill titré offensif. La source elle-même se cadre "strictly for authorized penetration testing and password policy assessment / use to improve password policies, not exploit users / only with explicit written authorization" — ce n'est PAS un guide d'attaquant pur. Gardé UNIQUEMENT recadré en **validation défensive de politique de mot de passe** (auditer les hashes de NOTRE org contre une policy ; sortie = distribution de robustesse, jamais credential utilisable). Frontière de refus dure inscrite dans Principles/Red Flags : recovery-pour-accès, ciblage tiers, campagnes de masse, évasion → REJECT §5 risk:blocking. Toute mécanique « hashcat as attack tool » (flags d'attaque, rules de cracking ciblé, benchmark GPU pour casser) strippée.
- **dedup**: non — complète la posture credential-storage que `mas-sec-reviewer` consomme ; aucun skill d'audit de robustesse de hash existant.
- **chemin library**: `packages/skills/library/auditing-password-hash-strength/SKILL.md`
- **renommage**: `performing-hash-cracking-with-hashcat` → **`auditing-password-hash-strength`** (slug + name + description recadrés).
- **frameworks**: nist_csf [PR.DS-01/02/10], mitre_attack [T1600, T1573, T1553].
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source pointant le slug d'origine). 0 sdk, 0 secret. Re-audit: si réutilisé hors cadre self-audit autorisé → re-passer en KILL.

## performing-post-quantum-cryptography-migration
- **décision**: adapt
- **raison**: planification défensive forward-looking de la migration PQC (NIST FIPS 203/204/205, IR 8547) — inventaire algos quantum-vulnérables, TLS hybride X25519MLKEM768, validation ML-KEM/ML-DSA, crypto-agility, roadmap priorisée. Motivé par harvest-now-decrypt-later. Recadré §5 (scan TLS d'hôtes externes = `allowed_hosts` only ; lit-et-rapporte, n'écrit jamais sur la cible) + §11. Mécanique `scripts/agent.py` source convertie en étapes de process génériques (pas d'invocation tierce épinglée).
- **dedup**: non — horizon distinct (transition crypto à l'échelle infra), aucun skill PQC existant ; complète RSA/SSL côté future-proofing.
- **chemin library**: `packages/skills/library/performing-post-quantum-cryptography-migration/SKILL.md`
- **frameworks**: nist_csf [PR.DS-01/02/10], mitre_attack [T1600, T1573, T1553, T1040].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret. Re-audit: nouvelles publications NIST PQC ou révision IR 8547.

## performing-ssl-certificate-lifecycle-management
- **décision**: adapt
- **raison**: opérations PKI défensives — cycle de vie X.509/TLS (CSR, validation chaîne, monitoring expiration, renouvellement ACME, révocation CRL/OCSP) ; prévient outages et incidents de confiance. Recadré §5 (clé privée du cert = secret gaté in-sandbox 0600, jamais commitée ; endpoints CA/ACME/OCSP = `allowed_hosts` only) + §11.
- **dedup**: non — distinct du skill RSA (clés brutes) et de crypto-audit (revue) ; couvre le cycle de vie cert, absent ailleurs.
- **chemin library**: `packages/skills/library/performing-ssl-certificate-lifecycle-management/SKILL.md`
- **frameworks**: nist_csf [PR.DS-01/02/10], mitre_attack [T1600, T1573, T1553, T1040].
- **renommage**: aucun.
- **état**: boosté conforme (8 sections, summary L1, metadata + frameworks, commentaire source). 0 sdk, 0 secret. Re-audit: évolution ACME/RFC 8555 ou dépréciation OCSP.

---

## Bilan lot EN

- **Keepers**: 7/7 (6 défensifs natifs + 1 recadré offensif→défensif).
- **Rejets**: 0 (le garde-fou hashcat a été satisfait par recadrage défensif strict + renommage ; pas de guide d'attaquant pur, donc pas de KILL déclenché).
- **Renommages**: `performing-hash-cracking-with-hashcat` → `auditing-password-hash-strength`.
- **Sanitize**: 7/7 clean (0 secret/PII, 0 `@anthropic-ai/sdk`).
- **Conformité §12**: 7/7 à la forme exemplaire (ligne 1 `---`, frontmatter name/description/summary L1/metadata{origin/license/cluster/tier/status/frameworks}, commentaire source, Prompt Defense Baseline verbatim, 7 sections §12).
- **Recadrages transverses**: §11 (quota, pas de $/€) + §5 (secrets/PIN/clés gatés, jamais hors sandbox ; scans réseau = `allowed_hosts`).
