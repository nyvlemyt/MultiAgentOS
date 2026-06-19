# ECC Harvest — décisions cluster `cyber:cryptography` (lot EM)

Doer : lot EM (8 skills cryptographie appliquée). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : `intake-audit` lifecycle complet, barre LARGE (T1, défense — cryptographie appliquée).
Source : `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only `--depth 1`, Apache-2.0, author `mahipal`). Cible : `packages/skills/library/<slug>/SKILL.md`.

**Charte défensive.** Les 8 skills sont 100 % défensifs (cryptographie appliquée : CA/PKI OpenSSL, HSM/PKCS#11, TLS 1.3, AES-256-GCM au repos, signatures Ed25519, E2EE Double-Ratchet, envelope-encryption KMS, signature/vérif JWT). Aucune weaponisation : ces skills *protègent* données et communications, ils n'attaquent rien → aucun KILL offensif déclenché. Relevance MAOS **HAUTE** : TLS/JWT/secrets/data-at-rest mappent directement sur notre stack (Next.js + worker + SQLite `data/`) **et** sur CLAUDE.md §5 (gating secrets/`.env`) + §11 (credentials hors contexte agent). Ce cluster est la **doctrine cryptographique derrière nos garde-fous**.

**Recadrage transverse (§11).** MAOS = abonnement, jamais de PAYG per-token. Toute mention de coût/effort = unités de quota contre la fenêtre (TOKEN_STRATEGY §8), jamais €/$. Le skill KMS-envelope contient des chiffres $ KMS (`$0.03/10,000 requests`) → recadrés conceptuellement en « coût d'appel à minimiser par caching », sans propager le chiffre $.

**Sanitize (secrets / PII / `@anthropic-ai/sdk`).** 8/8 sources scannées. Les bodies sources ne contiennent **aucun secret réel** : pas de clé privée, pas de token, pas de PIN matériel — seulement des PINs/passphrases d'illustration génériques dans des prérequis SoftHSM2. Les skills boostés distillent le **pattern** (process numéroté) et ne recopient aucun snippet exécutable long → zéro secret propagé. `@anthropic-ai/sdk` : absent des 8 sources.

**Note doctrine secrets (§5/§11).** Plusieurs de ces skills touchent à la gestion de clés (HSM, KMS, Ed25519 private keys, JWT secrets). Recadrage systématique : dans MAOS, toute clé/secret vit hors du contexte agent ; l'écriture vers `.env*`/keystores est **risk:high gatée humain** (§5) ; aucun secret n'est jamais committé (§11.5). Red Flag « never log/commit a private key or JWT secret » ajouté dans les corps concernés.

---

## configuring-certificate-authority-with-openssl
- **décision** : adapt (keeper, boost §12)
- **identité** : trust anchor PKI — hiérarchie deux-tiers (Root CA offline air-gapped → Intermediate CA online → leaf server/client/code-signing), OpenSSL + python-cryptography, CRL + OCSP responder, certificate-policy OIDs, path-length constraints. Obsolescence : basse (X.509/PKI = standard stable).
- **fit** : doctrine cryptographique derrière la gestion de secrets §5/§11 — une clé CA est *the keys to the kingdom*, son écriture vers `.env`/keystore est risk:high gatée humain, jamais committée (§11.5). Pas de dup : aucun slug PKI préexistant en library ; `configuring-tls-1-3-*` consomme un cert mais n'émet pas, `configuring-hsm-*` stocke la clé mais ne décrit pas la hiérarchie de confiance.
- **3 coûts** : install = bas (markdown, snippets OpenSSL NON recopiés — pattern distillé) ; maintenance = suivi X.509/CRL/OCSP (rare) ; removal = trivial (un dossier slug).
- **scores** (0–5) : project_fit 4 · token_efficiency 5 · safety 5 (défensif, lecture/doctrine) · implementation_effort 5 · evidence_maturity 5 (standard PKI) · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Pas de PAYG, pas d'exécution, pas de secret réel (snippets OpenSSL génériques), pas de framework lourd, in-phase.
- **appropriation MAOS** : Root-offline = isolation de la clé catastrophique, CA-key = secret §5 gaté, jamais committée §11.5, recadrage quota §8.
- **chemin library** : `packages/skills/library/configuring-certificate-authority-with-openssl/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata complet (`frameworks` préservé : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12 (Overview/When/Principles citant source/Process/Rationalizations/Red Flags/Verification). 0 `@anthropic-ai/sdk`, 0 secret réel.
- **re-audit** : 12 mois ou changement majeur PKI/CRL/OCSP.

## configuring-hsm-for-key-storage
- **décision** : adapt (keeper, boost §12)
- **identité** : stockage de clés en matériel inviolable via PKCS#11 — clés non-extractibles (`CKA_EXTRACTABLE=False`) générées/utilisées dans la frontière HSM, SoftHSM2 (dev) → HSM physique/cloud (prod), slots isolés, cérémonie multi-personnes pour roots CA, niveaux FIPS 140-2, audit, backup/DR. Obsolescence : basse. Porte `nist_ai_rmf` + `atlas_techniques` (cible prioritaire sécu-agent).
- **fit** : **expression gold-standard de §11** — credentials hors contexte agent ; un host compromis ne livre que le droit de *demander* une opération, jamais la clé. Le PIN HSM = secret §5 gaté, jamais committé §11.5. Pas de dup : `implementing-aes-*` chiffre la donnée, `implementing-envelope-encryption-*` enveloppe en cloud ; ici on stocke la clé en hardware (delta distinct).
- **3 coûts** : install = bas (markdown, snippets PKCS#11 NON recopiés) ; maintenance = suivi HSM/PKCS#11 (rare) ; removal = trivial.
- **scores** : project_fit 4 · token_efficiency 5 · safety 5 (défensif, non-export) · implementation_effort 5 · evidence_maturity 5 (FIPS/PKCS#11) · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Pas de PAYG, pas d'exécution, pas de secret réel (PINs d'illustration génériques uniquement), in-phase.
- **appropriation MAOS** : non-extractabilité = doctrine §11 (clé hors contexte agent), PIN = secret §5, isolation par slot = blast radius borné, recadrage quota §8.
- **chemin library** : `packages/skills/library/configuring-hsm-for-key-storage/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` préservé : nist_csf/nist_ai_rmf/atlas_techniques/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret réel.
- **re-audit** : 12 mois ou évolution majeure PKCS#11/FIPS.

## configuring-tls-1-3-for-secure-communications
- **décision** : adapt (keeper, boost §12)
- **identité** : durcissement TLS 1.3 (RFC 8446) — handshake 1-RTT, PFS obligatoire (DH éphémère only, pas de RSA statique), 3 suites AEAD, groupes KX forts (x25519…), handshake chiffré, désactivation TLS 1.0/1.1 + CBC/RC4/3DES/SHA-1, politique 0-RTT (replay → idempotent only), OCSP stapling, HSTS, validation openssl/testssl.sh. Obsolescence : basse (TLS 1.3 = standard courant).
- **fit** : relevance HAUTE — gouverne tout TLS sortant du worker vers les `allowed_hosts` §5 (chiffrement-en-transit + PFS, vérifié pas supposé). Pas de dup : `configuring-certificate-authority-*` émet le cert mais ne configure pas le serveur TLS ; `implementing-aes-*` = at-rest pas in-transit.
- **3 coûts** : install = bas (markdown, configs nginx/python NON recopiées) ; maintenance = suivi RFC/cipher deprecations ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 (défensif) · implementation_effort 5 · evidence_maturity 5 (RFC 8446) · user_value 5 (mappe la stack) · phase_compatibility 5.
- **KILL** : aucun. Pas de PAYG, pas d'exécution, pas de secret, in-phase.
- **appropriation MAOS** : TLS sortant = §5 allowed_hosts (in-transit vérifié), 0-RTT replay = idempotence, recadrage quota §8, clé TLS = secret §5/§11.5.
- **chemin library** : `packages/skills/library/configuring-tls-1-3-for-secure-communications/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois ou nouvelle RFC TLS / dépréciation de suite.

## implementing-aes-encryption-for-data-at-rest
- **décision** : adapt (keeper, boost §12)
- **identité** : chiffrement at-rest AES-256-GCM (AEAD) — dérivation de clé PBKDF2 (≥600k iters)/Argon2id, nonce 96-bit CSPRNG jamais réutilisé, format `[salt][nonce][ciphertext][tag]`, streaming gros fichiers, détection de tampering via tag, wipe + rotation, AES-XTS pour full-disk. Obsolescence : basse (FIPS 197).
- **fit** : relevance HAUTE — pattern pour chiffrer l'état sensible persisté sous `data/` ; la clé = secret §5, jamais committée §11.5. Pas de dup : `configuring-tls-1-3-*` = in-transit ; `implementing-envelope-encryption-*` = wrapping cloud ; `implementing-end-to-end-*` = messaging.
- **3 coûts** : install = bas (markdown, snippets python NON recopiés) ; maintenance = suivi KDF params (iters) ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 (défensif) · implementation_effort 5 · evidence_maturity 5 (NIST FIPS 197) · user_value 5 (data/) · phase_compatibility 5.
- **KILL** : aucun. Pas de PAYG, pas d'exécution, pas de secret, in-phase.
- **appropriation MAOS** : chiffre l'état `data/` sensible, clé = secret §5/§11.5, nonce-uniqueness = invariant dur, recadrage quota §8.
- **chemin library** : `packages/skills/library/implementing-aes-encryption-for-data-at-rest/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois ou révision des paramètres KDF recommandés.

## implementing-digital-signatures-with-ed25519
- **décision** : adapt (keeper, boost §12)
- **identité** : signatures Ed25519 (Curve25519, 128-bit, clés 32 o, sigs 64 o) — déterministes (pas de nonce aléatoire à fuiter), constant-time (résistant side-channel), pas de hash séparé, signer le message complet, valider les clés publiques (low-order points), code-signing, multi-sig. Note Ed448 préféré en fédéral. Obsolescence : basse.
- **fit** : relevance HAUTE — primitive d'intégrité pour signer artefacts/requêtes (origine + non-tampering) ; la clé privée = secret §5/§11.5. Pas de dup : `implementing-jwt-*` = flux token avec claims (peut utiliser EdDSA mais surface distincte) ; `implementing-aes-*` = confidentialité pas authenticité.
- **3 coûts** : install = bas (markdown) ; maintenance = suivi recommandations curve (Ed448) ; removal = trivial.
- **scores** : project_fit 4 · token_efficiency 5 · safety 5 (défensif) · implementation_effort 5 · evidence_maturity 5 · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Pas de PAYG, pas d'exécution, pas de secret, in-phase.
- **appropriation MAOS** : signature d'artefacts/requêtes = intégrité, clé privée = secret §5/§11.5, validation clé publique = invariant, recadrage quota §8.
- **chemin library** : `packages/skills/library/implementing-digital-signatures-with-ed25519/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois ou changement de recommandation NIST sur les courbes Edwards.

## implementing-end-to-end-encryption-for-messaging
- **décision** : adapt (keeper, boost §12)
- **identité** : E2EE messagerie (Double Ratchet Signal simplifié) — X3DH/X25519 pour l'accord initial, ratchet X25519+HKDF+AES-256-GCM pour clés par-message, forward secrecy (suppression immédiate de chaque clé), out-of-order + replay, AEAD systématique, vérification identity-keys out-of-band (safety numbers). Obsolescence : basse (Signal = référence stable).
- **fit** : doctrine de référence pour tout canal confidentiel — server-never-decrypts + per-message keys + delete-after-use ; identity keys = secrets §5/§11.5. Pas de dup : `implementing-aes-*` = at-rest fichiers ; `configuring-tls-1-3-*` = transport client↔serveur (le serveur voit le clair) ; `implementing-digital-signatures-*` = signature ponctuelle pas session.
- **3 coûts** : install = bas (markdown, pas d'impl Double-Ratchet recopiée) ; maintenance = suivi évolutions protocole Signal ; removal = trivial.
- **scores** : project_fit 4 · token_efficiency 5 · safety 5 (défensif) · implementation_effort 5 · evidence_maturity 5 (Signal/X3DH) · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. Pas de PAYG, pas d'exécution, pas de secret, in-phase.
- **appropriation MAOS** : server-never-decrypts = invariant E2EE, forward-secrecy = delete-after-use, identity keys = secrets §5/§11.5, recadrage quota §8.
- **chemin library** : `packages/skills/library/implementing-end-to-end-encryption-for-messaging/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois ou évolution du protocole Signal/Double-Ratchet.

## implementing-envelope-encryption-with-aws-kms
- **décision** : adapt (keeper, boost §12 — recadrage $ → quota)
- **identité** : envelope encryption avec KMS — DEK local (AES-256-GCM) chiffre la donnée, KEK en KMS enveloppe le DEK ; flux GenerateDataKey → chiffrer local → stocker DEK chiffré + ciphertext → discard plaintext DEK → KMS-Decrypt à la lecture ; encryption-context authentifié, key-policies least-privilege, CloudTrail, rotation, caching, backoff. Obsolescence : basse.
- **fit** : pattern KEK-en-hardware + DEK-local pour gros volumes ; CloudTrail = analogue télémétrie §9. Pas de dup : `implementing-aes-*` = at-rest sans KMS ; `configuring-hsm-*` = clé hardware sans envelope ; `configuring-tls-*` = in-transit.
- **3 coûts** : install = bas (markdown, snippets boto3 NON recopiés) ; maintenance = suivi API KMS ; removal = trivial.
- **scores** : project_fit 4 · token_efficiency 5 · safety 5 (défensif) · implementation_effort 5 · evidence_maturity 5 · user_value 4 · phase_compatibility 5.
- **KILL** : aucun. ⚠️ **Recadrage §11** : la source porte un chiffre $ KMS (`$0.03/10,000 requests`) → recadré en « coût d'appel à minimiser via caching » (quota/round-trips), chiffre $ NON propagé ; Red Flag + Rationalization explicites ajoutés. Pas de PAYG, pas de secret, in-phase.
- **appropriation MAOS** : KEK-jamais-hors-boundary = §11, coût KMS = quota/round-trips (jamais $), CloudTrail = §9 télémétrie, recadrage quota §8.
- **chemin library** : `packages/skills/library/implementing-envelope-encryption-with-aws-kms/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret, 0 chiffre $ propagé.
- **re-audit** : 12 mois ou changement API/tarif KMS (le tarif n'étant pas propagé).

## implementing-jwt-signing-and-verification
- **décision** : adapt (keeper, boost §12)
- **identité** : signature/vérif JWT (RFC 7519) — HS256/RS256/ES256/EdDSA, validation alg-allowlist + rejet `alg=none`, défense algorithm-confusion / key-injection / weak-secret / replay, claims exp/nbf/aud, expiry court + refresh, rotation JWK Sets, middleware auth. Obsolescence : basse (RFC 7519 + attaques connues stables).
- **fit** : relevance HAUTE — gouverne tout token d'auth émis par le cockpit/worker ; secrets/clés JWT = secrets §5/§11.5. Pas de dup : `implementing-end-to-end-*` = canal confidentiel ; `implementing-aes-*` = at-rest ; `implementing-digital-signatures-*` = signature d'artefact brut pas token à claims.
- **3 coûts** : install = bas (markdown, snippets PyJWT NON recopiés) ; maintenance = suivi attaques JWT/libs ; removal = trivial.
- **scores** : project_fit 5 · token_efficiency 5 · safety 5 (défensif) · implementation_effort 5 · evidence_maturity 5 (RFC + attaques documentées) · user_value 5 (auth stack) · phase_compatibility 5.
- **KILL** : aucun. Pas de PAYG, pas d'exécution, pas de secret réel, in-phase.
- **appropriation MAOS** : alg-allowlist + reject-none = invariants durs, secrets JWT = §5/§11.5, expiry court = surface de replay réduite, recadrage quota §8.
- **chemin library** : `packages/skills/library/implementing-jwt-signing-and-verification/SKILL.md`
- **état** : boosté conforme — ligne 1 `---`, commentaire source, summary L1, metadata (`frameworks` : nist_csf/mitre_attack), Prompt Defense Baseline verbatim, 7 sections §12. 0 sdk, 0 secret.
- **re-audit** : 12 mois ou nouvelle classe d'attaque JWT.

---

## Bilan lot EM

- **Keepers : 8/8** (tous `adapt`, boostés §12). Rejets : 0. Folds : 0.
- **Charte défensive respectée** : 8/8 cryptographie appliquée 100 % défensive (CA/PKI, HSM, TLS 1.3, AES-at-rest, Ed25519, E2EE, KMS-envelope, JWT). Aucune weaponisation, aucun KILL offensif. Relevance MAOS **HAUTE** : TLS/JWT/secrets/data-at-rest mappent sur la stack + §5 (gating secrets/`.env`) + §11 (credentials hors contexte agent).
- **Sanitize** : 8/8 clean. Aucun secret réel dans les sources (seulement PINs/passphrases d'illustration génériques en prérequis SoftHSM2) ; les snippets exécutables longs NON recopiés (distillation en Process numéroté). `@anthropic-ai/sdk` absent partout.
- **Recadrage §11** : KMS-envelope portait un chiffre $ (`$0.03/10,000 requests`) → recadré en quota/round-trips à minimiser via caching, chiffre $ NON propagé. Aucun autre coût €/$ propagé.
- **Doctrine secrets §5/§11.5** : Red Flag + Rationalization « never commit/log a private key, HSM PIN, JWT secret, or DEK » ajoutés dans chaque corps concerné (CA, HSM, AES, Ed25519, E2EE, KMS, JWT).
- **`frameworks` préservé** dans chaque metadata (nist_csf systématique ; + mitre_attack partout ; + nist_ai_rmf/atlas_techniques pour HSM).
- **Cluster** : `cyber:cryptography`, tier T1, status library, origin `mukul975/Anthropic-Cybersecurity-Skills`, license Apache-2.0.
