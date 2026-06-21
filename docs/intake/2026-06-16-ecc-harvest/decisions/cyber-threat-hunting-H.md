# ECC Harvest — décisions cluster `cyber:threat-hunting` (LOT H — persistance)

Doer: LOT H (11 slugs source, chasse aux mécanismes de **persistance**, lentille 100 % défensive/détection). Worktree `maos-ecc`, branche `phase/ecc-harvest`. Méthode: intake-audit, barre LARGE (T1, library), garde-fou défensif (détection/hunting → KEEP sauf doublon → fold).
Source: `mukul975/Anthropic-Cybersecurity-Skills` (Apache-2.0), `domain: cybersecurity`, `subdomain: threat-hunting`, auteur `mahipal`.
Cible: `packages/skills/library/<slug>/SKILL.md`.

Recadrage transverse (CLAUDE.md): MAOS = abonnement (§11), tout coût = unités de quota, jamais $/€. Détection **lecture seule** — aucune modification de la cible (registre, tâches, DNS, fichiers) ; la remédiation est *proposée* et soumise au gate humain (§5). L'arbre source sous `projects.path` est read-only-by-default (§8). Aucune lecture hors sandbox projet (§5, fuite cross-projet). Appels réseau (passive-DNS) uniquement vers `config/permissions.json#allowed_hosts` (§5).
Sanitize (secrets/PII/internal): 11/11 sources clean. `@anthropic-ai/sdk`: absent des sources. Frameworks préservés (MITRE ATT&CK IDs, NIST CSF, sous-techniques) dans le frontmatter `metadata.frameworks`.

Bilan: **9 keepers · 2 folds · 0 reject**. Aucun « pur arme » dans ce lot — toutes les sources sont des skills de chasse/détection défensive, donc KEEP par défaut sauf recouvrement → fold. L'audit *pouvait* rejeter (garde-fou: une source offensive de pose de persistance aurait été reject) ; il ne l'a pas eu à le faire ici.

---

## analyzing-persistence-mechanisms-in-linux
- **décision**: keep (adapt)
- **chemin library**: `packages/skills/library/analyzing-persistence-mechanisms-in-linux/SKILL.md`
- **raison**: seule source Linux du lot — vecteurs orthogonaux à tout le reste (Windows). Couvre cron/anacron, units systemd service+timer, LD_PRELOAD, profils shell, SSH `authorized_keys`, init, corrélés à auditd. Aucun doublon dans la library (les voisins `analyzing-*` sont logs/forensics, pas persistance Linux). MITRE T1053.003/T1543.002/T1574.006/T1546.004/T1098.004 préservés.
- **adaptation**: lentille détection seule (la remédiation devient « proposée + gate §5 ») ; reads bornés à la sandbox (§5/§8) ; quota au lieu de cash (§11).

## hunting-for-persistence-mechanisms-in-windows
- **décision**: keep (adapt) — **rôle: parapluie/méthodologie large**
- **chemin library**: `packages/skills/library/hunting-for-persistence-mechanisms-in-windows/SKILL.md`
- **raison**: méthodologie large Windows (carte complète des nids de persistance: Run keys, services, tâches, WMI, startup, DLL search order, COM, AppInit, IFEO, Winlogon) + boucle baseline→anomalie. NE PAS fusionner avec les skills spécifiques: c'est l'umbrella qui *délègue* aux vecteurs profonds (WMI, registre, Run-key, startup, tâches). Recouvrement réel uniquement au niveau « enumerate the map », pas au niveau analyse profonde → garder distinct.
- **adaptation**: principe « delegate depth » explicite (renvoie aux skills dédiés) ; détection seule, remédiation gated (§5) ; quota (§11).

## detecting-wmi-persistence
- **décision**: **FOLD** → `hunting-for-persistence-via-wmi-subscriptions`
- **chemin library**: aucun (sous-ensemble plié dans le canonique WMI)
- **raison**: même vecteur exact (T1546.003, Sysmon Event 19/20/21, consumers ActiveScript/CommandLine, root\\subscription). Version plus mince: pas de Splunk SPL/KQL/PowerShell/Sigma, pas de scénarios APT, pas de chasse aux enfants WmiPrvSe.exe ni mofcomp.exe. Tout son contenu est un sous-ensemble strict du canonique. Pli matérialisé par un commentaire `<!-- folds: ... -->` dans le SKILL canonique.

## hunting-for-persistence-via-wmi-subscriptions
- **décision**: keep (adapt) — **canonique WMI** (réceptacle du fold ci-dessus)
- **chemin library**: `packages/skills/library/hunting-for-persistence-via-wmi-subscriptions/SKILL.md`
- **raison**: la version riche du vecteur WMI: triade __EventFilter/__EventConsumer/__FilterToConsumerBinding, Sysmon 19/20/21 + Windows 5861, requêtes Splunk/KQL/PowerShell + règle Sigma prêtes, scénarios APT29/Turla/FIN8, chasse WmiPrvSe.exe + mofcomp.exe. Absorbe `detecting-wmi-persistence`.
- **adaptation**: détection seule (suppression d'abonnement = gated §5, et perte de traçabilité si supprimé trop tôt) ; quota (§11).

## hunting-for-dns-based-persistence
- **décision**: keep (adapt)
- **chemin library**: `packages/skills/library/hunting-for-dns-based-persistence/SKILL.md`
- **raison**: vecteur infrastructure (couche DNS), distinct des persistances hôte — survit au reimaging. Hijacking d'enregistrements, dangling CNAME (subdomain takeover), wildcard, changements de délégation NS/MX, via passive-DNS + audit-logs fournisseur + diff de zone. Pas de doublon: les voisins library `analyzing-dns-logs-for-exfiltration` / `detecting-command-and-control-over-dns` / `performing-dns-tunneling-detection` ciblent exfil/C2/tunneling, **pas** la persistance d'enregistrements.
- **adaptation**: appels passive-DNS/résolveurs gatés par `allowed_hosts` (§5) ; jamais d'édition d'enregistrement (gate §5) ; quota (§11).

## hunting-for-registry-persistence-mechanisms
- **décision**: keep (adapt) — **canonique registre (large)**
- **chemin library**: `packages/skills/library/hunting-for-registry-persistence-mechanisms/SKILL.md`
- **raison**: chasse registre large couvrant les 4 vecteurs (Run/RunOnce T1547.001, Winlogon T1547.004, IFEO T1546.012, COM T1546.015) via boucle hypothèse→SIEM/EDR/Sysmon. Garde distinct de `hunting-for-registry-run-key-persistence`: ce dernier est le sous-vecteur Run-key approfondi (Sysmon Event 13). Le large *délègue* le deep-dive Run-key au skill dédié.
- **adaptation**: principe « delegate the Run-key deep dive » ; détection seule, écriture registre = gated (§5) ; quota (§11).

## hunting-for-registry-run-key-persistence
- **décision**: keep (adapt) — **distinct (sous-vecteur uniquement détaillé)**
- **chemin library**: `packages/skills/library/hunting-for-registry-run-key-persistence/SKILL.md`
- **raison**: NON plié dans le registre canonique car uniquement détaillé sur **Sysmon Event ID 13** (RegistryEvent Value Set): parse TargetObject/Details/Image, flag temp/AppData, PowerShell encodé, LOLBins, **chaînage Event 1 + Event 11** pour confirmer drop+exécution, génération de règles Sigma/Splunk. 10 étapes opérationnelles vs 7 génériques du large. La règle de dedup du lot autorisait explicitement « keep run-key distinct only if uniquely detailed » — c'est le cas.
- **adaptation**: détection seule, écriture registre = gated (§5) ; quota (§11).

## hunting-for-startup-folder-persistence
- **décision**: keep (adapt)
- **chemin library**: `packages/skills/library/hunting-for-startup-folder-persistence/SKILL.md`
- **raison**: moitié *filesystem* de T1547.001 (dossiers Startup user + all-users), outillage distinct des Run keys (watchdog filesystem, métadonnées fichier, résolution `.lnk`, corrélation Event 4663). Vecteur et tooling différents du registre → garder distinct, pas de fold.
- **adaptation**: énumère les deux dossiers ; watch temps-réel pour incident vivant ; suppression fichier = gated (§5) ; quota (§11).

## hunting-for-scheduled-task-persistence
- **décision**: **FOLD** → `hunting-for-suspicious-scheduled-tasks`
- **chemin library**: aucun (boilerplate plié dans le canonique tâches)
- **raison**: même vecteur (T1053.005) mais workflow 100 % générique (« formulate hypothesis / identify data sources / execute queries… » identique au registre générique), sans requêtes prêtes ni découverte de tâches cachées. Entièrement sous-ensemble de `hunting-for-suspicious-scheduled-tasks` (qui apporte inventaire complet, SPL/KQL, tâches dissimulées par Security-Descriptor, COM-handler). Pli matérialisé par commentaire `<!-- folds: ... -->`.

## detecting-malicious-scheduled-tasks-with-sysmon
- **décision**: keep (adapt) — **facette Sysmon uniquement outillée**
- **chemin library**: `packages/skills/library/detecting-malicious-scheduled-tasks-with-sysmon/SKILL.md`
- **raison**: gardée distincte du canonique car c'est la **recette de corrélation Sysmon** spécifique: Event 1 (création schtasks.exe + ligne de commande complète) + Event 11 (XML de tâche dans System32\\Tasks) + Windows 4698/4702, plus l'angle **lateral movement** via `schtasks /s` (T1021). Le canonique fait inventaire+triggers+tâches cachées ; celui-ci fait detection-engineering Sysmon. La consigne du lot autorisait « keep the sysmon-specific facet only if uniquely tooled » — c'est le cas.
- **adaptation**: détection-engineering lecture seule ; `schtasks /s` = indicateur de mouvement latéral à escalader, jamais à exécuter (§5) ; quota (§11).

## hunting-for-suspicious-scheduled-tasks
- **décision**: keep (adapt) — **canonique tâches planifiées** (réceptacle du fold)
- **chemin library**: `packages/skills/library/hunting-for-suspicious-scheduled-tasks/SKILL.md`
- **raison**: la version riche du vecteur tâches (T1053.005): inventaire complet (`schtasks /query`/`Get-ScheduledTask`), Event 4698/4699/4702 + TaskScheduler/Operational + Register-ScheduledTask, analyse action+trigger, **découverte des tâches cachées** (Security-Descriptor, noms mimant Windows, COM-handler), requêtes Splunk/KQL, baseline-diff. Absorbe `hunting-for-scheduled-task-persistence` ; pairé avec la facette Sysmon ci-dessus.
- **adaptation**: détection seule, suppression de tâche = gated (§5) ; quota (§11).

---

## Synthèse dedup (recouvrements de persistance résolus)
- **WMI**: `detecting-wmi-persistence` → FOLD dans `hunting-for-persistence-via-wmi-subscriptions` (canonique). ✅ conforme consigne.
- **Registre**: `hunting-for-registry-run-key-persistence` gardé DISTINCT du canonique `hunting-for-registry-persistence-mechanisms` (Run-key uniquement détaillé via Sysmon-13). ✅ conforme consigne.
- **Tâches planifiées**: `hunting-for-scheduled-task-persistence` → FOLD dans `hunting-for-suspicious-scheduled-tasks` (canonique) ; `detecting-malicious-scheduled-tasks-with-sysmon` gardé comme facette Sysmon uniquement outillée. ✅ conforme consigne (1 canonique + facette sysmon).
- **Windows umbrella**: `hunting-for-persistence-mechanisms-in-windows` gardé comme méthodologie large qui délègue aux vecteurs spécifiques, pas de fold de contenu vrai-doublon. ✅ conforme consigne.
- **DNS / Linux / Startup**: vecteurs uniques, aucun recouvrement → keep.

Re-audit: si le repo source dépasse 6 mois de stagnation, ou si un skill de remédiation auto (non-lecture-seule) est proposé sur le même vecteur (alors gate §5 obligatoire).
