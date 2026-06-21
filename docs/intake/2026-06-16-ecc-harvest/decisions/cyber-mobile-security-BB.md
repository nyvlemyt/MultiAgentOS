# ECC Harvest — décisions cluster `cyber:mobile-security` (LOT BB)

Doer: lot BB mobile-security (7 skills source). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : intake-audit, barre LARGE (T2, library).
Source : `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), `subdomain: mobile-security` (13 skills au cluster ; 7 dans ce lot).
Garde-fou lot : tout est de l'**AppSec mobile autorisée sur sa PROPRE app** (test device en scope) ou de la pure défense (MDM/MAM, détection malware). KEEP par défaut. Recadrage : tests autorisés sur builds propres / test devices ; analyse read-only ; les payloads d'exploit sont strippés en détection + secure-config + remediation. Aucun CORE n'est une arme pure ⇒ 0 reject.
Recadrage transverse : MAOS = abonnement (§11), JAMAIS de coût per-token PAYG → toute mesure = unités de quota, jamais $/€. Actions actives (instrumentation on-device, bypass pinning, décryptage binaire, egress réseau, selective wipe) = §5-gated. Sanitize : 7/7 sources clean (pas de secret réel, pas d'`@anthropic-ai/sdk`).

Cadres préservés depuis le frontmatter source : OWASP MASVS / MASTG, NIST CSF, MITRE ATT&CK (et ATLAS AML.T0054 sur objection).

---

## analyzing-ios-app-security-with-objection
- **décision** : fold (→ `ios-app-security-assessment`)
- **raison** : la facette « exploration runtime Objection iOS » (keychain dump, sslpinning disable, method hooking, NSUserDefaults/SQLite/pasteboard) est strictement incluse dans le workflow de `performing-ios-app-security-assessment`, qui ajoute en plus la revue statique IPA, l'ATS, le format de finding MASTG et la résilience. Garder deux skills iOS quasi-identiques sur le runtime = doublon (dedup prévu par la consigne). On replie le contenu objection dans l'umbrella et on cite la source repliée dans un commentaire `<!-- folds: ... -->`.
- **dedup** : oui — superposé à l'assessment (superset). frida-RE reste distinct (RE binaire, pas runtime-REPL).
- **chemin library** : aucun (replié). Facette couverte par `packages/skills/library/ios-app-security-assessment/SKILL.md`.
- **état** : replié. ATLAS AML.T0054 + MITRE T1414/T1417.001/T1409/T1635 reportés dans le frontmatter de l'umbrella.

## performing-android-app-static-analysis-with-mobsf
- **décision** : adapt (keep)
- **raison** : analyse statique automatisée Android (MobSF/JADX) — secrets en dur, flags manifest (debuggable/allowBackup/exported non-gardés), crypto faible (ECB/IV statique), pinning absent, protections binaires. Lentille read-only distincte (n'exécute jamais l'app). Mappé OWASP MASVS / Mobile Top 10 2024.
- **dedup** : non — statique vs dynamique = distinct (consigne). Aucun équivalent dans nos assets (les `mas-*` couvrent planning/mémoire/router, pas l'AppSec mobile).
- **chemin library** : `packages/skills/library/android-static-analysis-mobsf/SKILL.md`
- **état** : KEEP. Recadré : scope/ownership obligatoire, MobSF en sandbox Docker jetable, triage manuel des HIGH (faux positifs), aveugles (obfusqué/natif) renvoyés au dynamique. Quota units, pas de $/€. Gate de CI optionnel.

## performing-dynamic-analysis-of-android-app
- **décision** : adapt (keep)
- **raison** : analyse dynamique runtime Android (Frida/Objection/ADB) — hook crypto/réseau/keystore, inspection heap, évaluation robustesse root/tamper/anti-debug. Trouve ce que le statique rate (obfuscation, valeurs décryptées). Distinct du statique.
- **dedup** : non — pendant dynamique du précédent. Les scripts JS de bypass root-detection sont conservés UNIQUEMENT comme moyen de **mesurer la force du contrôle sur son propre build** ; recadrage explicite « bypass pour vérifier, jamais pour vaincre du tiers », hooks read-only d'abord.
- **chemin library** : `packages/skills/library/android-dynamic-analysis/SKILL.md`
- **état** : KEEP. Recadré : test device/emulator dédié, jamais prod ; instrumentation = action active §5-gated ; remediation comme sortie ; quota units.

## performing-ios-app-security-assessment
- **décision** : adapt (keep — umbrella)
- **raison** : méthodologie iOS end-to-end MASVS/MASTG (statique IPA + runtime Frida/Objection + keychain + ATS + résilience), avec disclaimer d'autorisation et format de finding (ID/sévérité/MASVS/MASTG/PoC/impact/remediation) déjà natif. C'est le skill-pivot iOS du lot ; reçoit le fold d'objection.
- **dedup** : absorbe `analyzing-ios-app-security-with-objection` (superset runtime). Reste distinct de frida-RE (RE binaire ≠ assessment posture).
- **chemin library** : `packages/skills/library/ios-app-security-assessment/SKILL.md`
- **état** : KEEP. Recadré : autorisation écrite d'abord, statique avant runtime, bypass pinning/jailbreak seulement pour mesurer ses propres contrôles, keychain `AccessibleAlways` = finding High, actions actives §5-gated, quota units. Frontmatter enrichi des MITRE de la facette objection repliée.

## reverse-engineering-ios-app-with-frida
- **décision** : adapt (keep)
- **raison** : RE runtime iOS (ObjC/Swift enum, frida-trace, hook CCCrypt, FairPlay/class-dump) — facette distincte : comprendre la logique interne et l'exposition des clés, pas la posture d'assessment ni le runtime-REPL d'objection. Cadre MASVS-RESILIENCE.
- **dedup** : non — RE binaire ≠ assessment (umbrella) ≠ exploration objection. Garde distinct.
- **chemin library** : `packages/skills/library/ios-reverse-engineering-frida/SKILL.md`
- **état** : KEEP. Recadré DÉFENSIF : la question est « un attaquant pourrait-il extraire ce secret ? » → driver de secure-design ; own-app/autorisé + respect ToS/IP ; FairPlay décrypté seulement sur build propre ; clés extraites = preuve jetée après finding, jamais retenues/redistribuées ; actions actives §5-gated ; quota units.

## detecting-mobile-malware-behavior
- **décision** : adapt (keep)
- **raison** : triage malware mobile DÉFENSIF (statique : combos permissions à risque ; scan : C2/DexClassLoader/anti-emulateur ; réseau : beaconing/DGA/exfil ; runtime : observation SMS/fichiers/réseau/exec/caméra). Classifie le type, produit IOC + détection. Pure défense — déjà cadré « defensive only » dans la source.
- **dedup** : non — aucun skill malware mobile chez nous. Complète la doctrine sec-reviewer (§5) côté threat.
- **chemin library** : `packages/skills/library/mobile-malware-behavior-detection/SKILL.md`
- **état** : KEEP. Recadré : sandbox isolée hors réseau prod, hooks read-only (n'aide jamais l'échantillon), sortie = IOC + détection, JAMAIS de malware amélioré/redistribué ; egress/exécution §5-gated ; payloads time-delayed/multi-stage/C2 chiffré = pièges notés ; quota units. (La clé VirusTotal de la source = placeholder, strippée — pas de secret réel.)

## implementing-mobile-application-management
- **décision** : adapt (keep)
- **raison** : MAM entreprise (Intune App Protection Policies / Workspace ONE) — DLP, selective wipe, app config, conditional access, containerisation pour protéger la donnée corporate sur BYOD sans MDM complet. Pure défense/gouvernance.
- **dedup** : non — gouvernance mobile, aucun équivalent. Touche un invariant vie-privée fort.
- **chemin library** : `packages/skills/library/mobile-application-management/SKILL.md`
- **état** : KEEP. Recadré : invariant vie-privée (selective wipe/DLP = donnée corporate uniquement, perso jamais touché) ; tier selon sensibilité (sur-restriction → shadow IT) ; valider copy/paste + wipe + offline grace avant rollout ; selective wipe = action destructive §5-gated ; quota units. Pas une excuse pour ne pas développer sûr.

---

## Bilan lot BB

| source-slug | décision | library-slug |
|---|---|---|
| analyzing-ios-app-security-with-objection | fold | — (→ ios-app-security-assessment) |
| performing-android-app-static-analysis-with-mobsf | adapt | android-static-analysis-mobsf |
| performing-dynamic-analysis-of-android-app | adapt | android-dynamic-analysis |
| performing-ios-app-security-assessment | adapt | ios-app-security-assessment |
| reverse-engineering-ios-app-with-frida | adapt | ios-reverse-engineering-frida |
| detecting-mobile-malware-behavior | adapt | mobile-malware-behavior-detection |
| implementing-mobile-application-management | adapt | mobile-application-management |

**6 keepers + 1 fold. 0 reject** (aucun CORE n'est une arme pure ; tout = AppSec autorisée own-app ou pure défense, payloads strippés en détection+remediation).
KILL appliqué : payloads d'exploit fonctionnels strippés ; bypass de contrôles recadrés « vérifier son propre build, jamais vaincre du tiers » ; pas de secret réel ; pas d'`@anthropic-ai/sdk` ; toute action active = §5-gated ; aucune mesure en $/€.
Re-audit : si le repo source bouge de >6 mois, ou si une fiche agent « mobile-appsec » est explicitement scopée en ROADMAP (alors recâbler ces skills T2 en library vers cet agent).
