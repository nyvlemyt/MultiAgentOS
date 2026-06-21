# ECC Harvest — décisions cluster `cyber:zero-trust-architecture` (lot EI)

Doer: lot EI (9 skills). Worktree `maos-ecc`. Méthode: intake-audit, barre LARGE (T1, library, défensif).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (auteur amont `mahipal`), clone read-only `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`, licence **Apache-2.0**.
Cible keeper: `packages/skills/library/<slug>/SKILL.md` (forme exemplaire §12 boostée).
Frameworks préservés du frontmatter amont: `nist_csf`, `mitre_attack`, et le cas échéant `nist_ai_rmf` / `atlas_techniques`.

Recadrage transverse (CLAUDE.md):
- **§5** — tout ce cluster *est* la doctrine moindre-privilège + gating d'autonomie de MAOS: ZTNA = « pas d'accès implicite par le réseau », exactement notre règle « toute écriture hors `projects.path` est gated », et `allowed_hosts` de `config/permissions.json` = l'allowlist ZTNA appliquée au worker.
- **§11** — abonnement, jamais de PAYG. Tout chiffre amont en $/€ (licences vendeur, coût/utilisateur) → recadré en **unités de quota** ou supprimé; les SDK vendeur (AWS/GCP/Cloudflare) restent hors `apps/` et `packages/*/src/` — ce sont des skills-doctrine (KNOWLEDGE), pas du code runtime.
- **§12** — corps boosté: Prompt Defense Baseline (verbatim) + 7 sections (Overview / Principles citant la source / Process / Rationalizations / Red Flags / Verification).

Sanitize: 9/9 sources clean (0 secret, 0 PII, 0 clé privée, 0 import `@anthropic-ai/sdk`).

Nature défensive: 9/9 défensifs (ZTNA, IAP, microsegmentation, SDP). **Aucun KILL pour weaponization** — pas d'offensif dans ce lot.

## Stratégie de dedup (vendeurs ZTNA quasi-identiques)

Cinq skills décrivent le **même patron** « broker reverse-proxy identity-aware + posture device + accès per-app sans VPN » sur des vendeurs différents (AWS Verified Access, Zscaler ZPA, Cloudflare Access, Palo Alto Prisma Access, Google IAP). Garder les 5 en entier = duplication massive (token waste, §6). Décision:
- **1 keeper représentatif** du patron broker-cloud: `deploying-cloudflare-access-for-zero-trust` (le plus *local-first-friendly*: tunnel sortant vers apps auto-hébergées, pas d'IP publique exposée, palier gratuit — colle au modèle local-first de MAOS). Son corps porte une **table de delta vendeur** absorbant les 4 autres.
- **4 folds** dans ce keeper: AWS Verified Access, Zscaler ZPA, Palo Alto Prisma Access, Google IAP — chacun réduit à sa différence saillante (langage de policy, posture, topologie).
- **4 keepers distincts** car mécanisme *non* réductible au broker-cloud:
  - `configuring-microsegmentation-for-zero-trust` — workload↔workload (latéral), pas user↔app.
  - `deploying-software-defined-perimeter` — SDP CSA + Single Packet Authorization, architecture vendor-neutre « dark cloud ».
  - `implementing-beyondcorp-zero-trust-access-model` — le *modèle* canonique (doctrine), pas un produit.
  - `deploying-tailscale-for-zero-trust-vpn` — maillage WireGuard P2P auto-hébergeable (Headscale), topologie distincte + pertinence local-first directe.

Bilan: **5 keepers, 4 folds.**

---

## deploying-cloudflare-access-for-zero-trust
- **décision**: adapt (keeper représentatif du patron broker-cloud)
- **raison**: broker ZTNA identity-aware sans VPN — tunnel sortant publie une app auto-hébergée sans IP entrante, IdP authentifie chaque requête, posture device évaluée, policy per-app default-deny. C'est littéralement §5 appliqué à l'ingress (« pas de confiance implicite par le réseau » = notre règle de gating hors `projects.path` + `allowed_hosts`). Choisi comme représentant car le plus *local-first-friendly* (pas d'IP publique, palier gratuit).
- **dedup**: absorbe 4 vendeurs quasi-identiques via une **table de delta vendeur** dans le corps (AWS Verified Access=Cedar, Zscaler ZPA=App Connectors, Palo Alto Prisma=HIP/SASE inline, Google IAP=Access Context Manager).
- **chemin library**: `packages/skills/library/deploying-cloudflare-access-for-zero-trust/SKILL.md`
- **frameworks préservés**: nist_csf[PR.AA-01,PR.AA-05,PR.IR-01,GV.PO-01], mitre_attack[T1133,T1078,T1190,T1021], nist_ai_rmf[MEASURE-2.7,MEASURE-2.5,GOVERN-6.1,MAP-5.1], atlas_techniques[AML.T0051,AML.T0054,AML.T0056].
- **état**: boosté conforme — ligne1 `---`, commentaire source, summary L1, metadata{origin/license/cluster/tier/status/frameworks/folds}, Prompt Defense Baseline verbatim + 7 sections §12, recadrage $/€→quota (§11), 0 secret, 0 import sdk.

### Folds absorbés (pas de SKILL.md propre)
- **configuring-aws-verified-access-for-ztna** → fold. Delta unique = policy en **langage Cedar** + partage multi-compte AWS RAM. Même patron broker; rien de non-réductible.
- **configuring-zscaler-private-access-for-ztna** → fold. Delta = **App Connectors** + application-segments + accès navigateur clientless (SASE). Même patron.
- **deploying-palo-alto-prisma-access-zero-trust** → fold. Delta = posture **HIP** + GlobalProtect + Strata Cloud Manager (SASE avec security-policy inline). Même patron broker.
- **configuring-identity-aware-proxy-with-google-iap** → fold. Delta = **Access Context Manager** + identité par header per-request pour services GCP. Le *modèle* sous-jacent est couvert par le keeper BeyondCorp ci-dessous.

## configuring-microsegmentation-for-zero-trust
- **décision**: adapt (keeper distinct)
- **raison**: moindre-privilège *workload↔workload* (anti-mouvement-latéral, T1021/T1210/T1570), policy par identité-de-charge (labels) pas VLAN/IP. Mécanisme non réductible au broker user↔app → gardé distinct. Mappe l'*intérieur* de §5: chaque sandbox-projet = un segment, reach inter-sandbox = default-deny (jumeau de la règle anti-fuite cross-projet).
- **dedup**: non — aucun autre skill du lot ne couvre l'isolation workload↔workload; complète le broker (ingress) côté est-ouest.
- **chemin library**: `packages/skills/library/configuring-microsegmentation-for-zero-trust/SKILL.md`
- **frameworks préservés**: nist_csf[PR.AA-01,PR.AA-05,PR.IR-01,GV.PO-01], mitre_attack[T1021,T1210,T1570,T1046,T1018].
- **état**: boosté conforme — ligne1 `---`, commentaire source, summary L1, metadata{...frameworks}, Prompt Defense Baseline verbatim + 7 sections §12, recadrage $→quota, 0 secret, 0 import sdk.

## deploying-software-defined-perimeter
- **décision**: adapt (keeper distinct)
- **raison**: architecture ZTNA **vendor-neutre** (CSA v2.0) — Single Packet Authorization (resource invisible avant auth), mutual-TLS one-to-one, séparation controller/gateway/client. C'est le *modèle de référence* derrière les brokers; non réductible à un produit → gardé distinct. Doctrine §5 « invisible tant que non autorisé » + ancrage NIST SP 800-207.
- **dedup**: non — couche architecturale, pas un vendeur; complète le keeper broker (qui en est une implémentation managée).
- **chemin library**: `packages/skills/library/deploying-software-defined-perimeter/SKILL.md`
- **frameworks préservés**: nist_csf[PR.AA-01,PR.AA-05,PR.IR-01,GV.PO-01], mitre_attack[T1133,T1078,T1021,T1046,T1190].
- **état**: boosté conforme — ligne1 `---`, commentaire source, summary L1, metadata{...frameworks}, Prompt Defense Baseline verbatim + 7 sections §12, recadrage $→quota, 0 secret, 0 import sdk.

## implementing-beyondcorp-zero-trust-access-model
- **décision**: adapt (keeper distinct — le *modèle* canonique)
- **raison**: doctrine zero-trust fondatrice (Google BeyondCorp) — le réseau ne confère aucune confiance; décision per-request = f(identité, posture device, contexte). C'est le cadrage le plus propre de notre gating §4/§5: `(autonomy level, risk tag, sandbox)` EST une access-decision context-aware. Gardé pour le *modèle*, pas le produit (IAP Google = fold dans le keeper broker). Corps porte une **table de mapping BeyondCorp→MAOS**.
- **dedup**: non — modèle/doctrine, complémentaire des produits et de l'architecture SDP; absorbe la lentille « pourquoi » derrière tous les autres.
- **chemin library**: `packages/skills/library/implementing-beyondcorp-zero-trust-access-model/SKILL.md`
- **frameworks préservés**: nist_csf[PR.AA-01,PR.AA-05,PR.IR-01,GV.PO-01], mitre_attack[T1078,T1190,T1059,T1078.004,T1530].
- **état**: boosté conforme — ligne1 `---`, commentaire source, summary L1, metadata{...frameworks}, Prompt Defense Baseline verbatim + 7 sections §12, recadrage $→quota, 0 secret, 0 import sdk.

## deploying-tailscale-for-zero-trust-vpn
- **décision**: adapt (keeper distinct)
- **raison**: mesh VPN zero-trust **WireGuard P2P** — liens chiffrés bout-à-bout sans concentrateur central, ACLs identity-aware default-deny, exit-nodes/subnet-routers/Tailscale-SSH. Topologie distincte (maillage, pas broker/SDP). **Headscale** (control-server open-source auto-hébergeable) = pertinence local-first directe (§8). Les ACLs = jumeau device-level de `allowed_hosts` (§5).
- **dedup**: non — seule topologie mesh/P2P du lot; auto-hébergement = valeur unique pour le modèle local-first MAOS.
- **chemin library**: `packages/skills/library/deploying-tailscale-for-zero-trust-vpn/SKILL.md`
- **frameworks préservés**: nist_csf[PR.AA-01,PR.AA-05,PR.IR-01,GV.PO-01], mitre_attack[T1133,T1078,T1021,T1572].
- **état**: boosté conforme — ligne1 `---`, commentaire source, summary L1, metadata{...frameworks}, Prompt Defense Baseline verbatim + 7 sections §12, recadrage $→quota, 0 secret, 0 import sdk.

---

## Bilan lot EI
- **Keepers: 5** — deploying-cloudflare-access-for-zero-trust, configuring-microsegmentation-for-zero-trust, deploying-software-defined-perimeter, implementing-beyondcorp-zero-trust-access-model, deploying-tailscale-for-zero-trust-vpn.
- **Folds: 4** — configuring-aws-verified-access-for-ztna, configuring-zscaler-private-access-for-ztna, deploying-palo-alto-prisma-access-zero-trust, configuring-identity-aware-proxy-with-google-iap (absorbés dans la table de delta vendeur du keeper Cloudflare).
- **Rejects: 0** — aucun offensif/weaponization dans ce lot (9/9 défensifs).
- Sanitize 9/9 clean. Frameworks préservés sur les 5 keepers. Aucun `ledger.tsv`/git touché.
