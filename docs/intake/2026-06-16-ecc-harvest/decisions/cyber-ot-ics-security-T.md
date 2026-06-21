# ECC Harvest — décisions cluster `cyber:ot-ics-security` (lot T)

Doer: lot T — segmentation / compliance / architecture / IR (9 slugs sources). Worktree `maos-ecc`. Méthode: intake-audit, barre LARGE (T1, library, défense OT).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0, clone read-only `/tmp/cybersec-inspect/skills/`).
Cible: `packages/skills/library/<lib-slug>/SKILL.md`.

**Garde-fou OT (rappel).** L'OT est sécurité-critique : un changement réseau/firewall/patch sur une usine vivante = action §5 (validation humaine + fenêtre de maintenance). Tout le contenu est cadré « autorisé + safety-first » : on défend une usine qu'on opère, jamais on n'attaque/ne sonde un ICS tiers. Aucun CORE n'attaque ni n'endommage un ICS → 0 reject pour cause offensive. Les 2 rejets-logiques ici sont des **folds** (fusion de doublons), pas des rejets de valeur.

**Recadrages transverses.** §11 : abonnement, pas de PAYG ; tout chiffre = unités de quota, jamais $/€ (impacte NERC CIP + patch). §5 : gating humain sur tout changement live. Sanitize : 9/9 sources clean (pas de secrets/PII/clé). `@anthropic-ai/sdk` : absent des sources. Tous les frameworks frontmatter préservés dans le metadata (IEC 62443, NERC CIP, Purdue/PERA, NIST CSF/SP 800-82, SANS PICERL, MITRE ATT&CK ICS).

**Dedup vs corpus existant.** Aucune collision avec les `.claude/skills/` MAOS ni le reste de la library (cluster OT neuf). Deux folds **internes au lot** (cf. consignes Doer).

---

## implementing-network-segmentation-for-ot
- **décision**: adapt (CANONIQUE de la paire segmentation)
- **raison**: doctrine défensive complète de segmentation OT sur le modèle Purdue : baseline passif 2-4 sem → VLAN par niveau → règles firewall OT-aware (DPI/function-code) → DMZ Niveau 3.5 sans pass-through → data diode unidirectionnel → isolation SIS/BPCS → monitor-then-enforce en fenêtre de maintenance + rollback → validation. Plus riche que le skill Purdue (ajoute isolation SIS, validation automatisée, config switch, phases de migration). Recadré §5 (cutover/enforce = gated).
- **fold**: reçoit `implementing-purdue-model-network-segmentation` (Purdue = le modèle DERRIÈRE la segmentation OT). Le commentaire `folds:` cite la source Purdue ; le corps absorbe PERA niveaux 0-5 + DMZ 3.5.
- **chemin library**: `packages/skills/library/ot-network-segmentation/SKILL.md`
- **état**: écrit, conforme (ligne1 `---`, commentaire source + commentaire fold, summary L1, metadata frameworks préservés, Prompt Defense Baseline VERBATIM, 7 sections §12, 0 sdk, 0 secret).

## implementing-purdue-model-network-segmentation
- **décision**: reject → FOLD (pas de valeur perdue)
- **raison**: doublon conceptuel de `implementing-network-segmentation-for-ot` (mêmes Purdue/VLAN/DMZ/firewall/data diode, frontmatter nist_csf/mitre_attack identiques). La version segmentation-for-ot est la plus riche → canonique. Purdue est le *modèle* derrière, pas un skill distinct.
- **chemin library**: aucun (folded).
- **état**: replié dans `ot-network-segmentation` (commentaire `folds:` + PERA dans le corps). KILL/dedup: dup-no-better, fold-into-richer. Re-audit: non.

## implementing-iec-62443-security-zones
- **décision**: adapt (gardé DISTINCT de la segmentation)
- **raison**: couche *policy* zones-&-conduits IEC 62443-3-2 — partition par risque/conséquence, SL-T 1-4, conduits (protocoles/direction/DPI/function-code), zone SIS SL-3 air-gap, validation. Distinct de la segmentation réseau concrète (VLAN/firewall) : c'est le « quoi/pourquoi » au-dessus du « comment ». Le contenu ne duplique pas segmentation-for-ot (modèle SL-T + conduits vs layout VLAN). Recadré §5.
- **dedup**: non — modèle zones&conduits ≠ implémentation réseau (renvoi croisé vers `ot-network-segmentation`).
- **chemin library**: `packages/skills/library/iec-62443-security-zones/SKILL.md`
- **état**: écrit, conforme (8 blocs, Prompt Defense Baseline VERBATIM, frameworks préservés).

## implementing-nerc-cip-compliance-controls
- **décision**: adapt (recadrage §11)
- **raison**: contrôles de conformité NERC CIP pour systèmes cyber BES (réseau électrique) : CIP-002 catégorisation impact, CIP-005 ESP/EAP + MFA Intermediate System, CIP-007 durcissement (ports/services, patch 35j, anti-malware, monitoring 90j/revue 15j, accès), CIP-010 baselines, CIP-013 supply-chain, MAJ 2025. Vertical distinct (énergie/BES) — pas de doublon. Recadré §11 (télémétrie en quota units, jamais $).
- **dedup**: non — réglementaire BES spécifique ; ne recoupe ni IEC 62443 ni segmentation.
- **chemin library**: `packages/skills/library/nerc-cip-compliance-controls/SKILL.md`
- **état**: écrit, conforme (frameworks NERC-CIP/IEC-62443/NIST-CSF préservés, §11 appliqué dans summary/principes/red-flags).

## securing-remote-access-to-ot-environment
- **décision**: adapt (CANONIQUE de la paire remote-access)
- **raison**: accès distant OT sécurisé complet — broker DMZ/jump server (pas de pass-through), MFA (CIP-005-7 R2.4), PAM, politique RBAC (targets/protocoles/durée par rôle), cycle request→approve→activate→terminate, co-attendance vendor, recording, credentials one-time time-limited, cibles interdites SIS/SAFETY-*. Plus riche que conduit-security (ajoute machine d'états de session, RBAC, alignement NERC CIP-005 + IEC 62443). Recadré §5 (octroi d'accès = gated).
- **fold**: reçoit `implementing-conduit-security-for-ot-remote-access` (conduit = le terme IEC 62443 du canal d'accès distant). Le commentaire `folds:` cite la source conduit.
- **chemin library**: `packages/skills/library/ot-remote-access/SKILL.md`
- **état**: écrit, conforme (commentaire source + fold, Prompt Defense Baseline VERBATIM, 7 sections §12).

## implementing-conduit-security-for-ot-remote-access
- **décision**: reject → FOLD (pas de valeur perdue)
- **raison**: doublon de `securing-remote-access-to-ot-environment` (mêmes jump server/MFA/recording/PAM/approval/vendor-escort/conduit IEC 62443). securing-remote-access est plus riche → canonique. « Conduit » est le cadrage IEC 62443 du même canal d'accès distant.
- **chemin library**: aucun (folded).
- **état**: replié dans `ot-remote-access` (commentaire `folds:` + conduit dans le corps). KILL/dedup: dup-no-better, fold-into-richer. Re-audit: non.

## implementing-ics-firewall-with-tofino
- **décision**: adapt (gardé DISTINCT)
- **raison**: firewall industriel Tofino (Belden/Hirschmann) au niveau zone/contrôleur — DPI OT (Modbus FC, S7comm ops, EtherNet/IP CIP), inline-bridge transparent, fail-open (dispo process), allowlists baseline, default-deny. Contrôle compensatoire canonique pour PLC legacy non-patchables. Complète (ne remplace pas) la segmentation architecture-level et le firewall périmétrique DMZ. Recadré §5 (insertion inline live = gated). Note défensive : un firewall en fail-open est correct en OT (dispo > blocage) — gardé tel quel, pas une faille.
- **dedup**: non — DPI niveau-contrôleur vs architecture (renvois croisés vers ot-network-segmentation et le périmètre Palo/Forti).
- **chemin library**: `packages/skills/library/ics-firewall-tofino/SKILL.md`
- **état**: écrit, conforme (frameworks préservés, fail-open justifié comme principe OT).

## implementing-ot-incident-response-playbook
- **décision**: adapt
- **raison**: playbooks IR spécifiques OT — SANS PICERL + IEC 62443 + NIST SP 800-82, contenir par isolation (jamais power-off), PLC en LOCAL/MANUAL, couper conduit IT/OT au DMZ en préservant intra-OT+safety, recovery safety-first (SIS→contrôleurs→HMI→historian→eng WS→connectivité IT/OT en dernier), playbooks ransomware (EKANS/LockerGoga) + SIS compromise (TRITON/TRISIS), reporting CISA 72h/ISAC 24h/NERC 1h. Recadré §5 (actions containment/recovery live = gated) ; priorité safety > availability > confidentiality.
- **dedup**: non — IR OT (vertical safety-critical) ≠ IR IT générique.
- **chemin library**: `packages/skills/library/ot-incident-response-playbook/SKILL.md`
- **état**: écrit, conforme (frameworks SANS-PICERL/NIST-SP-800-82/CIRCIA préservés, 7 sections §12).

## implementing-patch-management-for-ot-systems
- **décision**: adapt (recadrage §11)
- **raison**: programme de patch OT où dispo/safety priment — inventaire firmware/OS, priorisation risk-based (CVSS + CISA-KEV + exposition + niveau Purdue), staging lab obligatoire, fenêtre de maintenance + rollback, déférer avec contrôles compensatoires (virtual patching/isolation) si non-patchable, 35j NERC CIP-007-6. Recadré §11 (quota units, pas $) + §5 (déploiement/rollback live = gated).
- **dedup**: non — patch OT (safety/dispo, compensating controls) ≠ patch IT classique.
- **chemin library**: `packages/skills/library/ot-patch-management/SKILL.md`
- **état**: écrit, conforme (frameworks NERC-CIP-007/IEC-62443 préservés, §11+§5 appliqués).

---

## Bilan lot T
- **9 slugs sources couverts** (0 dropped).
- **7 keepers** (library) : ot-network-segmentation, iec-62443-security-zones, nerc-cip-compliance-controls, ot-remote-access, ics-firewall-tofino, ot-incident-response-playbook, ot-patch-management.
- **2 folds** (reject-logique, valeur préservée) : purdue-model→ot-network-segmentation ; conduit-security→ot-remote-access.
- **0 reject offensif** (garde-fou OT respecté : aucun CORE n'attaque un ICS).
- Tous frameworks frontmatter préservés ; §5 (gating OT) + §11 (quota/abonnement) appliqués partout pertinent ; Prompt Defense Baseline VERBATIM dans les 7 ; 0 `@anthropic-ai/sdk` ; 0 secret.
- Re-audit: si `mukul975/...` >6 mois stale, ou si un domaine « finance/OT-payment » est explicitement scopé en ROADMAP.
