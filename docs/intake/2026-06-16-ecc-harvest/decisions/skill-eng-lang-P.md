# ECC Harvest — décisions cluster `skill:eng-lang` (lot P — DB + infra)

Doer: lot P (7 skills DB/infra). Worktree `maos-ecc`. Méthode: intake-audit barre LARGE (T2, library, deep-boost).
Source ECC: `affaan-m/ecc` (MIT, crédit Supabase pour `postgres-patterns`). Cible: `packages/skills/library/<slug>/SKILL.md`.
Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B). Aucun **skill** DB/infra existant; l'agent `Database Optimizer` et `DevOps Automator` couvrent le *workflow de review*, pas la *référence opérationnelle par moteur* → pas de dup-no-better, complément net.
Recadrage transverse: MAOS = abonnement (§11), pas de coût per-token PAYG; tout chiffre = unités de quota, jamais $/€. Surface MAOS = SQLite/Drizzle (`packages/db`) → ces packs sont **arsenal pour projets externes enregistrés** (`projects.path`), pas pour la DB interne de MAOS.
Sanitize (regex secrets/PII/internal + `@anthropic-ai/sdk`): 7/7 sources clean — seuls des placeholders illustratifs (`postgres/postgres`, `s3cr3t`, base64 démo). Aucun import SDK.
**§5 — ops infra destructrices/déploiement**: `docker-patterns`/`kubernetes-patterns` décrivent l'exécution d'infra. Les patterns/doctrine sont gardés, mais toute commande destructrice ou de déploiement (`docker compose down -v`, `system prune`, `kubectl apply/delete/rollout undo/scale`, `drain`) est marquée **human-gated (§5)** dans le corps, jamais auto-exécutée. Idem `prisma migrate dev`/`deploy`, `deleteMany` sans `where`, `FLUSHALL`, `DROP USER`, `ALTER SYSTEM` (Postgres/MySQL).

---

## postgres-patterns
- **décision**: adopt
- **raison**: référence opératoire PostgreSQL solide (crédit Supabase) — cheat-sheet d'index par pattern d'accès (B-tree/composite/GIN/BRIN/covering/partial), defaults de types corrects (money = `numeric` jamais `float`), RLS optimisé (wrap `auth.uid()` en `SELECT`), upsert idempotent, pagination keyset O(1), claim de queue `FOR UPDATE SKIP LOCKED`, sondes catalogue (FK non-indexées, `pg_stat_statements`, bloat). 0 secret, 0 import SDK.
- **dedup**: non — aucun skill DB existant; `Database Optimizer`/`DevOps Automator` = *workflow de review*, pas la référence par moteur. Complément net.
- **recadrage**: arsenal pour projets externes (`projects.path`), PAS la DB interne MAOS (SQLite/Drizzle, dialecte différent). Coût = quota (§11). `ALTER SYSTEM`/`REVOKE`/`DROP`/DML non-borné → human-gated (§5).
- **chemin library**: `packages/skills/library/postgres-patterns/SKILL.md`
- **état**: deep-boosté, conforme (ligne 1 `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline + 8 sections §12, 0 SDK, 0 secret réel). KILL non déclenché. Re-audit: si le dialecte interne MAOS migre hors SQLite.

## mysql-patterns
- **décision**: adopt
- **raison**: référence MySQL/MariaDB complète — version-check d'abord (upsert `VALUES(col)` vs row-alias diverge), defaults InnoDB/utf8mb4, index equality-then-range lus via `EXPLAIN`, transactions courtes/ordonnées sans I/O, claim queue `SKIP LOCKED`, conscience du lag réplica (pin read-after-write sur primaire), users least-privilege + TLS. 0 secret, 0 import SDK.
- **dedup**: non — complète `postgres-patterns` sur un autre moteur; pas de skill MySQL existant.
- **recadrage**: arsenal projets externes (`projects.path`), pas la DB interne MAOS. Coût = quota (§11). `DROP/ALTER USER`, `SET GLOBAL`, DML sur `mysql.user`, tuning config → human-gated (§5).
- **chemin library**: `packages/skills/library/mysql-patterns/SKILL.md`
- **état**: deep-boosté, conforme (8 sections §12, Prompt Defense Baseline, 0 SDK, 0 secret réel). KILL non déclenché. Re-audit: idem postgres.

## redis-patterns
- **décision**: adopt
- **raison**: référence Redis riche — map structure→use-case, cache-aside/write-through + invalidation par tag, rate-limit fixed-window vs sliding-window atomique (Lua), lock single-node `SET NX PX` avec release token-checké (Redlock multi-node), Pub/Sub vs Streams (durabilité/replay), discipline TTL systématique, table d'éviction, pooling/cluster/sentinel, anti-stampede. 0 secret, 0 import SDK.
- **dedup**: non — domaine in-memory distinct des skills relationnels; aucun skill Redis existant.
- **recadrage**: arsenal projets externes (`projects.path`), pas l'état interne MAOS. Coût = quota (§11). `FLUSHALL`/del non-scopé/`CONFIG SET` prod → human-gated (§5); `KEYS *` = anti-pattern (bloque le serveur).
- **chemin library**: `packages/skills/library/redis-patterns/SKILL.md`
- **état**: deep-boosté, conforme (8 sections §12, Prompt Defense Baseline, 0 SDK, 0 secret réel). KILL non déclenché. Re-audit: si Redis entre dans la surface interne MAOS.

## prisma-patterns
- **décision**: adopt
- **raison**: référence Prisma 5.x/6.x à fort signal — version-check (`relationJoins` row-explosion), stratégies d'id, index FK+WHERE/ORDER BY, mapping DTO obligatoire, formes `$transaction` (timeout 5s, pas d'I/O dedans), pagination cursor `limit+1`, soft-delete via `findFirstOrThrow`, singleton `globalThis`, `connection_limit=1` serverless. Surtout: pièges critiques (`updateMany/deleteMany` renvoient count, `@updatedAt` skip le bulk, `deleteMany` sans `where` vide la table, `migrate dev` reset la DB). 0 secret, 0 import SDK.
- **dedup**: non — couche ORM TS, distincte des skills SQL bruts. Pertinent pour stack TS des projets (MAOS lui-même = Drizzle, dialecte/ORM différent).
- **recadrage**: arsenal projets externes (`projects.path`), pas la DB interne MAOS. Coût = quota (§11). `migrate dev/deploy`, breaking schema changes, `deleteMany` non-borné → human-gated (§5).
- **chemin library**: `packages/skills/library/prisma-patterns/SKILL.md`
- **état**: deep-boosté, conforme (8 sections §12, Prompt Defense Baseline, 0 SDK, 0 secret réel). KILL non déclenché. Re-audit: si MAOS adopte Prisma (peu probable, Drizzle est verrouillé).

## clickhouse-io
- **décision**: adopt
- **raison**: référence OLAP ClickHouse complète — choix de variante MergeTree (plain/Replacing/Aggregating), partition temporelle + ordering key, filtrage colonnes indexées d'abord, agrégats natifs (`uniq`, `quantile`, `*State`/`*Merge`), vues matérialisées, discipline de types (`LowCardinality`/plus petit type), éviter `SELECT *`/`FINAL`/JOINs. 0 secret, 0 import SDK.
- **boost de sécurité**: l'exemple source d'ingestion utilisait du **string-concat brut** (`INSERT ... VALUES ('${trade.id}', ...)`) = injection SQL + insert par ligne. Réécrit en **batch paramétré** (`ch.insert({values, format})`), avec note explicite "never string-concat / never per-row".
- **dedup**: non — moteur OLAP distinct des transactionnels; `postgres-patterns` le référence comme complément analytics.
- **recadrage**: arsenal projets externes (`projects.path`); MAOS interne = SQLite (OLTP), hors scope OLAP. Coût = quota (§11). `DROP`/`TRUNCATE`/`ALTER TABLE`/`DROP PARTITION` → human-gated (§5).
- **chemin library**: `packages/skills/library/clickhouse-io/SKILL.md`
- **état**: deep-boosté + durci, conforme (8 sections §12, Prompt Defense Baseline, 0 SDK, 0 secret réel). KILL non déclenché. Re-audit: si une couche analytics entre dans MAOS.

## docker-patterns
- **décision**: adopt
- **raison**: référence Docker/Compose solide — Dockerfile multi-stage (non-root, tag épinglé, HEALTHCHECK), stack dev avec `depends_on` gated par healthcheck, volumes bind+anonyme, découverte DNS par nom de service, isolation réseau (db backend-only), durcissement conteneur (`no-new-privileges`/`read_only`/`cap_drop ALL`/`tmpfs`), secrets hors layers via `env_file`/`.dockerignore`. 0 secret réel (placeholders `postgres/postgres` démo), 0 import SDK.
- **dedup**: non — aucun skill conteneur existant; `DevOps Automator` = agent workflow, pas la référence patterns.
- **recadrage / §5**: les commandes exécutent de l'infra host → skill design-first. Ops DESTRUCTRICES (`docker compose down -v`, `system prune`, `volume/image rm`) explicitement **human-gated (§5)**, jamais auto-run; bloc commandes séparé safe vs gated. Coût = quota (§11).
- **chemin library**: `packages/skills/library/docker-patterns/SKILL.md`
- **état**: deep-boosté + gating §5, conforme (8 sections §12, Prompt Defense Baseline, 0 SDK, 0 secret réel). KILL non déclenché (exécution infra encadrée, pas auto). Re-audit: si MAOS conteneurise son propre runtime.

## kubernetes-patterns
- **décision**: adopt
- **raison**: référence K8s production complète — template Deployment durci (securityContext non-root, `maxUnavailable:0`, 3 probes, requests+limits requis), table de décision probes avec math `failureThreshold×periodSeconds`, Services/Ingress TLS, ConfigMap vs Secret (Secrets = base64 seulement → Sealed Secrets/ESO), RBAC least-privilege (token off sauf si app appelle l'API, `Role` > `ClusterRole`, scoping `resourceNames`), HPA/PDB, Jobs `restartPolicy OnFailure`. 0 secret réel, 0 import SDK.
- **dedup**: non — aucun skill orchestration existant; complète `docker-patterns`.
- **recadrage / §5**: `kubectl` mute un cluster live → skill manifest+diagnostic-lecture-seule first. Commandes MUTANTES (`apply`/`delete`/`rollout undo`/`scale`/`drain`) **human-gated (§5)**, jamais auto-run; bloc read-only vs gated séparé. Coût = quota (§11).
- **chemin library**: `packages/skills/library/kubernetes-patterns/SKILL.md`
- **état**: deep-boosté + gating §5, conforme (8 sections §12, Prompt Defense Baseline, 0 SDK, 0 secret réel). KILL non déclenché (déploiement encadré). Re-audit: si MAOS déploie sur K8s.

---

## Bilan lot P
7/7 adopt. Keepers: postgres-patterns · mysql-patterns · redis-patterns · prisma-patterns · clickhouse-io · docker-patterns · kubernetes-patterns. 0 reject, 0 secret réel, 0 import `@anthropic-ai/sdk`. Recadrage commun: arsenal pour projets externes (`projects.path`), pas la DB/runtime interne MAOS (SQLite/Drizzle); coût en quota (§11); ops destructrices/déploiement (SQL DDL, `docker`/`kubectl` mutants, migrations Prisma, `FLUSHALL`) marquées human-gated (§5). Boost sécurité notable: `clickhouse-io` réécrit string-concat→insert paramétré.

