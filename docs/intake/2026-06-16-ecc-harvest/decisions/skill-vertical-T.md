# ECC Harvest — décisions cluster `skill:vertical` (lot T)

Doer: lot vertical-T (7 skills). Worktree `maos-ecc`. Méthode: intake-audit, barre VERTICAL (CLUSTERS.md).
Source ECC: `affaan-m/ecc` (MIT au niveau dépôt; licence par-skill notée quand différente). Cible: `packages/skills/library/<slug>/SKILL.md`.
Barre VERTICAL: garder (adopt/adapt) UNIQUEMENT si FORT + auto-suffisant. Rejeter: niche/thin/faible-réemploi, cœurs exec sortants (§5), wrapper mince sur API tierce/payante (§11), dup-pas-mieux. Un audit qui ne peut pas dire `reject` est cassé.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B).
Recadrage transverse: MAOS = abonnement (§11), local-first, PAS de coût per-token PAYG ni de clés d'API tierces. Tout chiffre = unités de quota, jamais $/€.
Sanitize (regex secrets/PII/internal + `@anthropic-ai/sdk`): voir par item. Keepers = 0 secret, 0 import SDK.

---

## returns-reverse-logistics
- **décision**: adapt
- **raison**: expertise-domaine dense et auto-suffisante (logique de politique de retour, grading A–D, arbres de décision de disposition pilotés par l'économie de récupération, scoring de fraude pondéré, recouvrement fournisseur RTV, garanties). Aucune exécution sortante, aucune clé, aucune dépendance tierce — c'est de la connaissance pure, exactement ce que la barre VERTICAL veut garder quand c'est FORT. La valeur est un cadre de jugement réutilisable (économie de disposition, scoring de signaux, matrices d'escalade), pas un wrapper d'outil.
- **dedup**: non — rien dans `our-assets-index.md` ne couvre les opérations de retours/reverse-logistics; `Code Reviewer`/`mas-reviewer` jugent du code, pas des décisions de disposition marchande.
- **licence source**: Apache-2.0 (au niveau du skill ECC) — notée telle quelle dans le metadata, pas réécrite en MIT (intégrité de provenance).
- **chemin library**: `packages/skills/library/returns-reverse-logistics/SKILL.md`
- **adaptation**: boosté au format §12 (Prompt Defense Baseline + 7 sections). Reframe $/€ → unités de quota là où des chiffres servaient d'illustration de coût agentique; les montants marchands (prix produit, seuils de fraude $) RESTENT en devise car ils décrivent le domaine réel des retours, pas la consommation LLM de MAOS — distinction explicitée dans le corps. Aucune machinerie d'exécution à stripper (le skill n'en a pas). Tableaux de grading/disposition/fraude condensés en Principles + Process.
- **état**: keeper. Re-audit: si une future surface "domaine e-commerce/retours" est scopée en ROADMAP, promouvoir de library → routable; sinon dormant (arsenal).

## taste (GEM)
- **décision**: adapt
- **raison**: GEM flaggée — lentille de direction créative ("taste"), la couche au-dessus du rendu qui décide *quoi* produire et *pourquoi* pour qu'un lot de générations lise comme UNE chose intentionnelle. La doctrine transférable est forte et auto-suffisante: décider la direction d'abord / la juger en dernier, cohérence > nouveauté, contrainte dure (1 famille primaire + 1 accent), générer ~10 / garder ~2 (la cohérence vient du rejet, pas du prompt). C'est une discipline de jugement réutilisable pour tout livrable génératif.
- **dedup**: non — `frontend-design`/`UI Designer` traitent l'implémentation UI; aucune lentille MAOS ne couvre la *direction créative générative* (choisir/défendre une direction esthétique avant génération). Référence croisée notée (`frontend-design` = même discipline "direction d'abord" appliquée à l'UI).
- **chemin library**: `packages/skills/library/taste/SKILL.md`
- **adaptation**: STRIP lourd. Le skill source est soudé à un pipeline MV spécifique (Remotion/fal.ai/RTSP/ffmpeg, beat-math 138 BPM, presets fal.ai, skeleton Remotion) + une esthétique nommée unique (angelcore/cloud-trance). Tout cela = mécanique projet-bornée et egress vers services de génération tiers → NON repris dans la version library. Gardé: la *méthode* (decide-first/judge-last, coherence>novelty, contrainte 1-primary-1-accent, generate-10-keep-2, defend-on-every-choice), généralisée hors du genre d'origine. Reframe: la boucle générer/rejeter = unités de quota (§11), jamais cash; un generate-count élevé = direction sous-spécifiée, pas "prompter plus fort".
- **état**: keeper. Re-audit: à promouvoir vers une surface "creative-direction" si la ROADMAP scope un atelier génératif; sinon arsenal dormant. Pas de secret, pas d'import SDK.

## uspto-database
- **décision**: reject
- **raison**: wrapper mince sur API tierce à clé. Le cœur = plomberie d'appels PatentSearch/PatentsView + TSDR/ODP exigeant `USPTO_API_KEY`/`PATENTSVIEW_API_KEY` (en-tête `X-Api-Key`), egress réseau vers des hôtes hors `permissions.json#allowed_hosts` (§5). La seule lentille transférable — discipline de log de recherche reproductible (priorité source officielle, cross-check, table de log datée, séparer faits/inférence/secondaire) — est mince et déjà couverte conceptuellement par notre doctrine reviewer/vérification (`mas-reviewer`, §7 verification). La barre VERTICAL rejette explicitement les wrappers minces sur API tierce.
- **dedup**: oui sur la lentille sûre (discipline de log reproductible = sous-ensemble de notre vérification/reviewer); le reste = egress à clé par construction.
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: clé d'API tierce + egress réseau hors allowlist (§5) + wrapper mince (barre VERTICAL) + lentille transférable = dup-no-better de la doctrine de vérification. Re-audit: seulement si un domaine "IP/brevets" est scopé en ROADMAP avec déclaration d'hôtes dans `config/permissions.json` et gestion de clé hors-repo — et alors on coderait l'intégration, pas ce skill.

## uncloud
- **décision**: reject
- **raison**: CLI d'orchestration self-hosting de niche (`uc`: deploy/scale/machine init via SSH, WireGuard mesh, Caddy ingress autogénéré, volumes, images push). C'est un cœur d'exécution sortante pure — chaque commande agit sur des machines distantes/infra (§5: actions risquées, hors sandbox projet). Out-of-product, faible réemploi pour un cockpit local-first macOS/Next.js. Flaggée likely-reject (niche) en CLUSTERS.md, confirmé.
- **dedup**: non pertinent — rien à dédupliquer; le contenu est de l'exec infra que MAOS ne doit pas embarquer.
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: cœur exec sortant sur infra distante (§5) + niche/faible-réemploi (barre VERTICAL) + out-of-product. Aucune lentille transférable au-delà de "ne jamais éditer le Caddyfile généré", trop mince. Re-audit: non (conflit structurel avec local-first; un besoin d'orchestration infra passerait par un MCP dédié audité, pas par ce skill).

## videodb
- **décision**: reject
- **raison**: wrapper mince sur le SaaS VideoDB exigeant `VIDEO_DB_API_KEY` ("50 uploads gratuits", plan-gated → payant). Upload/transcode/index/reframe/génération côté serveur tiers (egress) + capture desktop (écran/micro/audio système = surface PII/screen-capture, §5). Le cadrage transverse §11 (pas de clé d'API tierce par défaut, abonnement) et §5 (egress hors allowlist, capture) le disqualifient. Aucune lentille transférable que `taste` n'abstraie déjà (direction) — ici tout est plomberie d'appels SDK vers un service payant.
- **dedup**: oui — la seule valeur "réutilisable" (penser perception/timeline vidéo) est soit mécanique soit déjà couverte par la lentille `taste`; le reste = egress payant à clé.
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: clé/SaaS tiers payant (§11) + egress côté serveur + capture desktop PII (§5) + wrapper mince (barre VERTICAL). Re-audit: non, sauf MCP vidéo dédié explicitement scopé + audité + hôte déclaré dans `permissions.json`.

## visa-doc-translate
- **décision**: reject
- **raison**: skill mono-usage de niche: OCR de documents de visa (passeports, cartes d'ID, certificats bancaires) → PDF bilingue. Deux drapeaux durs: (1) il manipule de la PII sensible (pièces d'identité, certificats financiers) et (2) il s'auto-exécute "WITHOUT asking for confirmation" à chaque étape — collision directe avec §5 (écritures/exec gatées sur données sensibles; jamais d'auto-exec sur PII/secrets). Thin + niche + auto-exec-sur-PII = triple disqualification VERTICAL.
- **dedup**: non — rien à garder; la "lentille" OCR→PDF est mécanique et tool-bornée (sips/Vision/EasyOCR/reportlab).
- **chemin library**: aucun (T0).
- **état**: rejeté. KILL: auto-exécution sans confirmation sur documents PII/identité (§5) + niche/mono-usage (barre VERTICAL) + thin. Flaggée likely-reject en CLUSTERS.md, confirmé. Re-audit: non.

## windows-desktop-e2e
- **décision**: reject
- **raison**: skill de test E2E Windows natif (pywinauto/UIA, POM, tiers de sandbox, CI `windows-latest`, Qt). Qualité réelle et substantielle — MAIS c'est un skill ENG/testing Windows-only, à très faible réemploi pour un cockpit local-first macOS/Next.js (notre E2E = Playwright web/`webapp-testing`). La barre VERTICAL rejette niche/faible-réemploi même quand c'est fort. La lentille transférable (tiers d'isolation de test, priorité de locator stable > fragile, jamais `time.sleep` → waits conditionnels, redaction PII dans les traces) est de la bonne doctrine de test, mais générique et déjà portée par `webapp-testing` + nos critères de vérification §7.
- **dedup**: oui sur la lentille (discipline d'isolation/locator/no-sleep/redaction = déjà chez `webapp-testing` + §7); le reste = mécanique pywinauto Windows-only inutilisable ici.
- **chemin library**: aucun (T0).
- **état**: rejeté (lentille de discipline de test notée pour backlog si un jour MAOS teste des desktops natifs — improbable). KILL: niche Windows-only / faible-réemploi sur stack mac+web (barre VERTICAL) + lentille = dup-no-better de `webapp-testing`/§7. Flaggée likely-reject en CLUSTERS.md, confirmé. Re-audit: si MAOS cible un jour le packaging desktop natif testé (hors ROADMAP actuel).

