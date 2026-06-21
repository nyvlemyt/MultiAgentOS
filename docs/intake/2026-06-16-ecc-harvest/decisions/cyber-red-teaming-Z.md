# ECC Harvest — décisions LOT Z (cluster `cyber:red-teaming`, Phase D)

Doer : LOT Z (8 skills source, AD-attack offensif). Worktree `maos-ecc`, branche `phase/ecc-harvest`.
Source : `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), `/tmp/cybersec-inspect/skills/<slug>/SKILL.md`.
Méthode : intake-audit **REJECT-HEAVY + DEDUP**. Ce lot est offensif (impersonation, vol de tickets, énumération d'attaque) → recadrage défense/détection + RENAME, ou rejet pur si arme sans valeur défensive nouvelle, ou rejet si dup d'un skill défensif déjà en bibliothèque.
Recadrage transverse : MAOS = abonnement (§11), jamais de chiffre $/€ → unités de quota. Évaluation autorisée uniquement ; toute action active (énumération live, modif config AD, exécution SharpHound/C2) = §5 `risk: high` gatée. Aucun secret, aucun payload exploit fonctionnel, aucun `@anthropic-ai/sdk` dans les sorties.

## Dedup pré-audit (slugs défensifs déjà en bibliothèque)

`ls packages/skills/library` révèle, issus des vagues antérieures :
- `detecting-dcsync-attack-in-active-directory`
- `detecting-kerberoasting-attacks`
- `detecting-pass-the-hash-attacks`
- **`detecting-pass-the-ticket-attacks`** ← découverte non anticipée par le brief (qui supposait pass-the-ticket distinct et absent). Il EST présent → le pass-the-ticket de ce lot devient un dup.
- `detecting-golden-ticket-attacks-in-kerberos-logs`, `detecting-golden-ticket-forgery`

Conséquence : 4 des 8 sources tombent en dup défensif (dcsync, pass-the-ticket, kerberoasting ×2). Un audit qui ne sait pas rejeter est cassé — ici 5 rejets sur 8, conformes au cadrage REJECT-HEAVY.

---

## conducting-domain-persistence-with-dcsync
- **décision** : reject
- **raison** : pure persistance offensive (réplication DRSUAPI, extraction KRBTGT/DA, fabrication de Golden Ticket via Mimikatz). La valeur défensive — détecter une réplication DRS depuis un hôte non-DC, surveiller les droits `GetChanges/GetChangesAll` — est **entièrement couverte** par le `detecting-dcsync-attack-in-active-directory` déjà en bibliothèque. Le corps source n'apporte aucun signal de détection nouveau, seulement le déroulé d'attaque (à ne pas reproduire). MITRE T1003.006/T1207/T1558.001.
- **dedup** : oui — dup-no-better de `detecting-dcsync-attack-in-active-directory`.
- **chemin library** : aucun (rejeté).
- **KILL** : weapon offensif (extraction de hash + Golden Ticket) sans contenu défensif neuf + dup d'un skill existant. Re-audit : non.

## conducting-pass-the-ticket-attack
- **décision** : reject
- **raison** : technique de mouvement latéral (vol de TGT/TGS dans LSASS, injection Mimikatz/Rubeus `ptt`). Les indicateurs de détection du corps (Event 4768/4769 adresses client inhabituelles, TGT réutilisé depuis une IP différente, même ticket sur plusieurs postes) sont déjà la matière du `detecting-pass-the-ticket-attacks` présent en bibliothèque. Le brief anticipait un reframe `detecting-and-preventing-pass-the-ticket` « distinct de pass-the-hash » — mais le slug pass-the-ticket existe **déjà**, donc reframe = doublon. MITRE T1550.003/T1558.003/T1003.001.
- **dedup** : oui — dup-no-better de `detecting-pass-the-ticket-attacks` (déjà présent ; le cadrage anti-dup prime sur l'instruction de reframe).
- **chemin library** : aucun (rejeté).
- **KILL** : dup d'un skill défensif existant ; le résidu unique = mécanique d'attaque, unsafe. Re-audit : non.

## exploiting-constrained-delegation-abuse
- **décision** : adapt (recadrage défensif + rename)
- **raison** : seul skill du lot apportant un contenu de détection/prévention **réellement neuf** et sans équivalent en bibliothèque (KCD, protocole-transition S4U2self/S4U2proxy, faille du nom de service non lié → substitution SPN, flag `TRUSTED_TO_AUTH_FOR_DELEGATION`). Recadré : inventaire défenseur de `msDS-AllowedToDelegateTo`, détections Event 4769 (impersonation+delegation flags), mismatch SPN/accès, Event 5136 sur l'attribut de délégation, durcissement (Protected Users, « sensitive — cannot be delegated », RBCD scopé, AES-only). MITRE T1558.003/T1550.003/T1134.001/T1078.002/T1021.
- **dedup** : non — aucun slug constrained/delegation existant (`implementing-attack-path-analysis-with-xm-cyber` = outil commercial sans rapport).
- **chemin library** : `packages/skills/library/detecting-and-preventing-constrained-delegation-abuse/SKILL.md`
- **état** : écrit. Ligne 1 `---`, commentaire source, summary L1, metadata complet (frameworks = MITRE IDs préservés), Prompt Defense Baseline VERBATIM, 7 sections §12. 0 payload exploit, 0 secret, 0 `@anthropic-ai/sdk`. Re-audit : si SpecterOps/MS publient une nouvelle primitive de délégation.

## exploiting-kerberoasting-with-impacket
- **décision** : reject
- **raison** : arme Kerberoasting (Impacket `GetUserSPNs` → extraction TGS → crack hors-ligne). Aucune valeur défensive au-delà de ce que couvre déjà `detecting-kerberoasting-attacks` (détection des requêtes TGS RC4 massives, Event 4769 chiffrement faible). Pur outillage offensif. MITRE T1558.003/T1110.002.
- **dedup** : oui — dup-no-better de `detecting-kerberoasting-attacks`.
- **chemin library** : aucun (rejeté).
- **KILL** : weapon offensif (impacket) + dup d'un skill défensif existant. Re-audit : non.

## performing-kerberoasting-attack
- **décision** : reject
- **raison** : même technique Kerberoasting (post-exploitation, requête TGS sur comptes SPN). Doublon de la source précédente ET dup du défensif `detecting-kerberoasting-attacks`. MITRE T1558.003/T1087.002.
- **dedup** : oui — double dup (de `exploiting-kerberoasting-with-impacket` et de `detecting-kerberoasting-attacks`).
- **chemin library** : aucun (rejeté).
- **KILL** : weapon offensif + double doublon. Re-audit : non.

## exploiting-active-directory-with-bloodhound
- **décision** : fold → `auditing-ad-attack-paths-with-bloodhound`
- **raison** : BloodHound est aussi un outil de défenseur (cartographier puis **couper** les chemins d'attaque). Source canonique de la trilogie BloodHound. Plié dans le skill défensif unique : sa liste de requêtes clés (shortest path to DA, Kerberoastable→DA, AS-REP, DCSync rights, GPO abuse) y est intégrée. MITRE T1087.002/T1069.002/T1482/T1615/T1018/T1033/T1016.
- **dedup** : oui — fold (un seul skill BloodHound canonique pour les 3 sources).
- **chemin library** : `packages/skills/library/auditing-ad-attack-paths-with-bloodhound/SKILL.md` (folded-in).

## conducting-internal-reconnaissance-with-bloodhound-ce
- **décision** : fold → `auditing-ad-attack-paths-with-bloodhound`
- **raison** : variante BloodHound CE (déploiement Docker Compose, SharpHound v2, bibliothèque Cypher étendue, types de chemins d'attaque, changement du mot de passe admin par défaut). Apport unique plié dans le canonique : procédure de déploiement CE + hygiène (off-prod, default-creds changées) + requêtes Cypher additionnelles (LAPS lisible, sessions DA). MITRE T1087.002/T1069.002/T1482/T1018/T1615.
- **dedup** : oui — fold dans le canonique.
- **chemin library** : `packages/skills/library/auditing-ad-attack-paths-with-bloodhound/SKILL.md` (folded-in).

## performing-active-directory-bloodhound-analysis
- **décision** : fold → `auditing-ad-attack-paths-with-bloodhound`
- **raison** : 3e variante (SharpHound/Invoke-BloodHound/AzureHound, requêtes pré-bâties + custom, et surtout une **table de remédiation** finding→fix). Choisie comme `pattern from` source car la plus complète et déjà dotée d'une section remédiation — recadrée en colonne vertébrale défensive du canonique. La section AMSI-bypass de la source est explicitement marquée `risk: high` gatée §5 et non reproduite comme payload. MITRE T1087.002/T1069.001/T1069.002/T1018/T1482/T1615 (software S0521).
- **dedup** : oui — fold dans le canonique (source de la table de remédiation et du commentaire `pattern from`).
- **chemin library** : `packages/skills/library/auditing-ad-attack-paths-with-bloodhound/SKILL.md` (folded-in).

---

## Bilan LOT Z

| résultat | count | slugs |
|---|---|---|
| reject (dup défensif / weapon) | 4 | dcsync, pass-the-ticket, kerberoasting-impacket, kerberoasting |
| fold (→ 1 BloodHound canonique) | 3 | bloodhound, bloodhound-ce, bloodhound-analysis |
| adapt (nouveau défensif) | 1 | constrained-delegation |

**2 fichiers library créés** : `detecting-and-preventing-constrained-delegation-abuse`, `auditing-ad-attack-paths-with-bloodhound` (3 sources pliées).
Sanitize : 0 payload exploit fonctionnel exporté, 0 secret, 0 `@anthropic-ai/sdk` dans les 2 sorties. Frameworks (MITRE ATT&CK IDs) préservés depuis les sources.
Aucune édition `ledger.tsv`, aucun `git add/commit/push`.
