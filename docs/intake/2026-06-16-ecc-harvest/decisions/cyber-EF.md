# ECC Harvest — décisions cluster `cyber:security-operations` (lot EF)

Doer : lot EF (7 skills, dont 2 à titre offensif). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode : skill `intake-audit` à barre LARGE (T1, library), avec **deux garde-fous KILL explicites** :
1. `performing-red-team-phishing-with-gophish` — gardé UNIQUEMENT comme **simulation de phishing interne autorisée** (sensibilisation des propres employés, gouvernance/consentement, métriques de clic et non récolte de credentials). Renommé `running-authorized-phishing-simulation`. Si guide pur de vol de credentials → reject.
2. `performing-ssrf-vulnerability-exploitation` — on possède déjà `defending-against-ssrf` (wave1). Titre offensif → reject comme dup-no-better + pur-offensif, sauf delta de DÉTECTION distinct (sinon détection-seule renommée `detecting-ssrf-exploitation`).
Les 5 autres (SIEM corrélation/tuning, SOAR, syslog, DNS-tunneling-detection) sont défensifs → gardés.

Source : `mukul975/Anthropic-Cybersecurity-Skills` (clone read-only, Apache-2.0). Cible : `packages/skills/library/<slug>/SKILL.md`.
Recadrage transverse : MAOS = abonnement (§11), AUCUN coût per-token PAYG ; tout chiffre = unités de quota, jamais $/€. `frameworks` (nist_csf + mitre_attack) préservés dans `metadata`.
Sanitize (regex secrets/PII/`@anthropic-ai/sdk`) : 7/7 sources clean. Les credentials des sources (`admin/changeme`, `<key>`, `api_key`, `--password`) sont des placeholders illustratifs → retirés/neutralisés dans les versions boostées (credentials fournis au runtime par l'opérateur). Aucun import `@anthropic-ai/sdk`.

Garde-fou KILL appliqué partout : reject de toute arme/ciblage de masse/évasion (weaponization / mass-targeting / evasion).

---

## implementing-siem-correlation-rules-for-apt
- **décision**: adapt (keeper défensif)
- **raison**: ingénierie de détection bleue — corrélation multi-événements/multi-hôtes en fenêtre glissante pour mouvement latéral APT (RDP→service install, Pass-the-Hash, PsExec). Detection-as-code Sigma→SPL + audit de couverture ATT&CK. Nourrit `mas-sec-reviewer` et le contexte menace §5. Aucun outillage offensif produit.
- **garde-fous KILL**: pas d'arme/évasion ; le skill DÉTECTE le mouvement latéral, ne le réalise pas. KILL si dérive vers C2/offensif → non déclenché. Read-only sur télémétrie, credentials runtime (non embarqués, §5/§11).
- **dedup**: non — distinct de `building-detection-rule-with-splunk-spl`/`building-detection-rules-with-sigma` (mono-événement) : ici corrélation multi-événements chaînée.
- **chemin library**: `packages/skills/library/implementing-siem-correlation-rules-for-apt/SKILL.md`
- **état**: boosté §12 — ligne 1 `---`, commentaire source, summary L1, metadata complet (frameworks préservés), Prompt Defense Baseline verbatim + 7 sections §12. 0 secret, 0 `@anthropic-ai/sdk`. Placeholders credentials retirés (recadrés runtime). Re-audit: si la source >6 mois stale ou nouveau skill de corrélation arrive.

## implementing-siem-use-case-tuning
- **décision**: adapt (keeper défensif)
- **raison**: boucle de detection-engineering pour réduire la fatigue d'alerte SANS perdre de couverture — FP rate par règle depuis les dispositions analystes, baselines environnementales, whitelists contextuelles, seuils statistiques (mean + N·stddev), preuve par précision + ratio alert-to-incident. Affûte le signal défensif (Splunk/Elastic) qui nourrit `mas-sec-reviewer`.
- **garde-fous KILL**: aucune arme/évasion ; garde-fou interne ajouté — le tuning ne doit JAMAIS désactiver/supprimer en masse une classe de vrais positifs (préservation de couverture = invariant vérifié). Non offensif.
- **dedup**: non — distinct de `building-detection-rules-with-sigma` (création de logique) : ici optimisation/tuning de règles existantes.
- **chemin library**: `packages/skills/library/implementing-siem-use-case-tuning/SKILL.md`
- **état**: boosté §12 conforme (ligne 1 `---`, commentaire source, summary L1, metadata+frameworks, Prompt Defense Baseline verbatim + 7 sections). 0 secret, 0 sdk. Re-audit: source >6 mois stale.

## implementing-soar-playbook-for-phishing
- **décision**: adapt (keeper défensif)
- **raison**: automatisation SOAR **côté réponse** au phishing signalé — parse .eml (headers + SPF/DKIM/DMARC), container Splunk SOAR, artefacts IOC CEF, déclenche playbook d'investigation, poll jusqu'à état terminal, verdict JSON. C'est de l'incident-response, pas de l'envoi.
- **garde-fous KILL**: NON offensif (ne crée/n'envoie aucun email). Garde-fous ajoutés : l'email = entrée non-fiable (jamais exécutée) ; toute action de **containment sortante** reste gated §5 (ne s'auto-exécute pas). Pas d'arme/évasion.
- **dedup**: non — receveur/réponse IOC distinct des skills de détection ; complémentaire de `running-authorized-phishing-simulation` (envoi simulé, gouverné à part).
- **chemin library**: `packages/skills/library/implementing-soar-playbook-for-phishing/SKILL.md`
- **état**: boosté §12 conforme. 0 secret (token SOAR runtime, non embarqué), 0 sdk. Re-audit: source >6 mois stale.

## implementing-syslog-centralization-with-rsyslog
- **décision**: adapt (keeper défensif)
- **raison**: backbone de collecte de logs résistant à la falsification — rsyslog TLS (gtls mode 1, x509/name mutuel) sur 6514, ségrégation par hôte, templates JSON, queues disk-assisted (no-drop). Précondition de toute détection en aval (un attaquant qui édite les logs locaux bat la détection). NIST DE.CM-01, résiste T1070/T1562.
- **garde-fous KILL**: non offensif ; garde-fous ajoutés — pas d'exfiltration hors-réseau, pas de désactivation d'un pipeline d'audit existant. Pas d'arme/évasion.
- **dedup**: non — collecte/transport, distinct des skills d'analyse (`analyzing-*-logs`) qui consomment les logs.
- **chemin library**: `packages/skills/library/implementing-syslog-centralization-with-rsyslog/SKILL.md`
- **état**: boosté §12 conforme. 0 secret (certs TLS + creds SSH runtime, non embarqués), 0 sdk. Re-audit: source >6 mois stale.

## performing-dns-tunneling-detection
- **décision**: adapt (keeper défensif — titre `performing-*` mais contenu 100% détection)
- **raison**: chasse bleue de l'exfiltration DNS — entropie de Shannon sur labels, distribution de longueur, cardinalité de sous-domaines, volume TXT pour distinguer DNS légitime d'un canal couvert. Read-only sur trafic capturé. Couvre T1048/T1041.
- **garde-fous KILL**: le titre est offensif-sonnant mais le corps ne construit AUCUN tunnel — détection pure. Garde-fous ajoutés : capture sur réseaux autorisés uniquement (§5) ; ne pas reproduire de payload de tunnel fonctionnel. Pas d'arme/évasion. (Conservé renommage NON nécessaire : slug déjà détection-orienté, gardé tel quel.)
- **dedup**: non — distinct de `analyzing-dns-logs-for-exfiltration` (analyse de logs) : ici méthode statistique entropie/cardinalité sur capture pcap.
- **chemin library**: `packages/skills/library/performing-dns-tunneling-detection/SKILL.md`
- **état**: boosté §12 conforme. 0 secret, 0 sdk. Re-audit: source >6 mois stale.

## performing-red-team-phishing-with-gophish → running-authorized-phishing-simulation (RENOMMÉ)
- **décision**: adapt (keeper sous garde-fou strict) — **rename source→library**: `performing-red-team-phishing-with-gophish` → `running-authorized-phishing-simulation`
- **raison**: la source se cadre déjà en "security awareness assessment" (open/click rates). Gardé UNIQUEMENT comme simulation interne autorisée pour sensibilisation des **propres employés** : gouvernance/consentement, autorisation écrite, métriques open/click/report, landing page **teach-on-click** qui redirige vers la formation. Logistique GoPhish conservée.
- **garde-fous KILL appliqués**: la source mentionnait "landing pages for credential capture" + `T1003`/`T1110` (cred-dump/brute-force) → STRIPPÉS. Capture de credentials = OUT par design (métriques de comportement, pas de mots de passe). Ciblage hors-org = reject. Envoi = action sortante `risk: high` §5 → gate humain obligatoire. PII de la liste de cibles protégée. Frameworks mitre nettoyés (T1003/T1110 retirés, gardé T1566 phishing). N'était PAS un guide pur de vol de credentials → donc keep-renamed, pas reject.
- **dedup**: non — côté envoi/simulation, complémentaire de `implementing-soar-playbook-for-phishing` (côté réponse).
- **chemin library**: `packages/skills/library/running-authorized-phishing-simulation/SKILL.md`
- **état**: boosté §12 conforme (frameworks réduits à la portée défensive). 0 secret (API key + SMTP runtime), 0 sdk. Re-audit: re-vérifier le garde-fou consentement/own-org si ré-importé ou si la source >6 mois stale.

## performing-ssrf-vulnerability-exploitation
- **décision**: reject
- **raison**: titre + corps 100% offensifs — sondage de métadonnées cloud (`169.254.169.254`, vol de credentials IAM AWS), scan de ports internes, handlers `file://`/`gopher://`/`dict://`, techniques de bypass (IP-encoding, DNS rebinding). On possède déjà `defending-against-ssrf` (wave1), qui couvre DÉJÀ toutes les signatures de détection correspondantes (log de destination résolue, signature encoding-trick, anomalie out-of-band/timing) + le design allowlist §5. La source n'apporte **aucun delta de détection distinct** : tout son contenu est le pendant offensif déjà neutralisé défensivement dans wave1.
- **garde-fous KILL appliqués**: garde-fou explicite "dup-not-better + pur-offensif sauf delta détection distinct" → aucun delta détection → reject (pas de variante `detecting-ssrf-exploitation` créée, car la détection est déjà complète chez `defending-against-ssrf`). KILL secondaire : reproduire les payloads de vol de credentials métadonnées = weaponization (§5 `risk: high` réseau sortant), interdit.
- **dedup**: oui — dup-no-better de `defending-against-ssrf` (qui détient déjà la vue détection + mitigation).
- **chemin library**: aucun (rejeté).
- **état**: rejeté. Re-audit: NON — recoupement structurel ; la valeur défensive est déjà capturée par `defending-against-ssrf`. Ne ré-importer que si un futur skill apporte une technique de DÉTECTION SSRF absente de wave1 (alors détection-seule, renommée).
