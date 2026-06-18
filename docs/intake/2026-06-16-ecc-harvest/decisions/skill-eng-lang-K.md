# ECC Harvest — décisions cluster `skill:eng-lang` (lot K — Java/JVM)

Doer: lot K Java/JVM (9 skills). Worktree `maos-ecc`. Méthode: intake-audit, barre LARGE (T2, library — arsenal par langage). Source ECC: `affaan-m/ecc` (MIT). Cible: `packages/skills/library/<slug>/SKILL.md`.

Dedup contre `our-assets-index.md` (24 skills `.claude/skills/` + 56 agents + 7 fiches Tier B). Aucun de ces actifs ne couvre Java/Spring/Quarkus/JPA/tinystruct : zéro chevauchement avec notre stack MAOS (Next.js/Node/TypeScript). Ces skills sont un **arsenal par langage** au sens CLUSTERS.md §ENG (gardés s'ils ajoutent de la valeur dans leur domaine, même sans usage MAOS courant).

Recadrage transverse: MAOS = abonnement (§11). Tout chiffre de coût = unités de quota, jamais $/€. Aucune exécution externe/egress n'est ordonnée par ces skills : ce sont des guides de *doctrine* Java (le code-exemple cible le projet externe à `projects.path`, lu en read-only par MAOS, §8). Les commandes shell (`mvn`, `gradle`, `docker`, `k6`, `trivy`, OWASP ZAP) sont décrites comme étapes de vérification d'un projet utilisateur, pas comme actions auto-exécutées par MAOS — elles restent soumises au gating §5 (shell/réseau/`curl|sh`).

Sanitize (regex secrets/PII/internal + `@anthropic-ai/sdk`): 9/9 sources clean. Aucune clé/secret en dur (les `${DB_PASSWORD}` etc. sont des placeholders d'env, conservés). Aucun import `@anthropic-ai/sdk` (sources Java, sans rapport). Les notes sécurité présentes dans les sources (spoof `X-Forwarded-For` springboot-patterns ; prompt-injection sur retours d'outil MCP tinystruct) sont du **contenu pédagogique correct** — conservées et renforcées, pas des vulnérabilités à stripper.

Décision trio `*-tdd` / `*-verification` (springboot, quarkus): chaque membre gardé car delta framework-spécifique non-dup — `patterns` = architecture, `tdd` = boucle red-green-refactor + slices de test, `verification` = gate build→static→test→sécurité→diff (+ native pour Quarkus). Pas de consolidation : les trois lentilles sont distinctes et complémentaires.

---

## java-coding-standards
- **décision**: adopt
- **raison**: socle de standards Java 17+ pour Spring Boot ET Quarkus, avec détection de framework depuis le build file puis overlay `[SPRING]`/`[QUARKUS]` (naming `*Controller` vs `*Resource`, immutabilité + champs publics Panache idiomatiques, constructor injection vs `@Singleton`/`@ApplicationScoped`, Optional sans `get()`, pipelines réactifs non-bloquants, exceptions domaine centralisées, config type-safe, slices de test). Lentille dense et correcte ; la valeur centrale est *le bon dialecte au bon endroit*.
- **dedup**: non — aucun de nos 24 skills / 56 agents / 7 fiches ne couvre Java. Hors stack MAOS (TS/Node) mais arsenal par langage (CLUSTERS.md §ENG), gardé pour valeur dans son domaine.
- **chemin library**: `packages/skills/library/java-coding-standards/SKILL.md`
- **état**: boosté §12. Ligne 1 = `---`, commentaire source, summary L1, metadata complet, Prompt Defense Baseline verbatim + 7 sections §12 (Overview/When/Principles citant la source/Process/Rationalizations table/Red Flags/Verification binaire). 0 secret (placeholders d'env conservés), 0 import `@anthropic-ai/sdk`. Recadré §8 : guide du code écrit contre le projet externe (read-only), n'exécute rien.

## springboot-patterns
- **décision**: adopt
- **raison**: architecture Spring Boot production : couches fines controller→service→repository (constructor injection), DTO records + Bean Validation, `@ControllerAdvice` centralisé (RFC 7807), `@Transactional` writes / `readOnly` reads, caching/async/scheduled, filtres (logging + rate-limit Bucket4j), pagination, retry backoff, HikariCP, observabilité Micrometer/OTel. La note sécurité "ne jamais faire confiance à `X-Forwarded-For` sans ForwardedHeaderFilter + proxy de confiance" est conservée et renforcée (contenu correct, pas une vuln).
- **dedup**: non — zéro couverture Spring dans nos actifs. Hors stack MAOS, arsenal par langage.
- **chemin library**: `packages/skills/library/springboot-patterns/SKILL.md`
- **état**: boosté §12. Ligne 1 = `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim + 7 sections §12 (Process/Rationalizations table/Red Flags/Verification binaire). 0 secret (placeholders env), 0 import sdk. Recadré §8 (code contre projet externe read-only) ; commandes/réseau décrites côté projet utilisateur, soumises au gating §5, jamais auto-exécutées par MAOS.

## springboot-tdd
- **décision**: adopt
- **raison**: boucle TDD red-green-refactor Spring Boot + sélection de slice de test (unit Mockito / `@WebMvcTest`+MockMvc / `@DataJpaTest`+Testcontainers / `@SpringBootTest`), AssertJ, builders de données, gate JaCoCo 80%. Delta non-dup vs `springboot-patterns` (architecture) et `springboot-verification` (gate CI) : ici = *comment écrire les tests*, slice par slice. Aligné `superpowers:test-driven-development` (§7).
- **dedup**: non — aucun skill TDD Java chez nous ; `superpowers:test-driven-development` est générique (process), celui-ci est Spring-spécifique (slices/annotations).
- **chemin library**: `packages/skills/library/springboot-tdd/SKILL.md`
- **état**: boosté §12. Ligne 1 = `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim + 7 sections §12. 0 secret, 0 import sdk. Recadré §5/§8 : exécution des tests = action shell gated sur le projet externe read-only, pas auto-run par MAOS.

## springboot-verification
- **décision**: adopt
- **raison**: gate de vérification Spring Boot ordonné stop-on-first-failure : build → static (Checkstyle/PMD/SpotBugs) → tests+JaCoCo 80% → sécurité (OWASP dependency-check + grep secrets + smells System.out/getMessage/CORS wildcard) → format → diff review → verdict binaire READY/NOT READY. Mappe directement sur la doctrine "5 checks" de §7. Delta non-dup vs patterns (archi) et tdd (authoring) : ici = *gate*.
- **dedup**: non — pas de gate Java chez nous. Renforce §7 dans le domaine Spring.
- **chemin library**: `packages/skills/library/springboot-verification/SKILL.md`
- **état**: boosté §12. Ligne 1 = `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim + 7 sections §12. 0 secret (le grep cherche des secrets, n'en contient pas), 0 import sdk. Recadré §5/§8 : phases shell (mvn/gradle/grep/OWASP) = actions gated sur le projet externe read-only.

## quarkus-patterns
- **décision**: adopt
- **raison**: architecture Quarkus 3.x LTS cloud-native/event-driven avec Apache Camel : JAX-RS/RESTEasy Reactive, CDI `@ApplicationScoped`, Panache repositories, routes Camel (direct/RabbitMQ/file/choice), EventService (tracking succès/erreur), Logback+Logstash + LogContext propagé, CompletableFuture async, caching Quarkus, config YAML par profil, health checks, readiness GraalVM native. Contrepartie Quarkus de springboot-patterns avec centre de gravité distinct (CDI/Panache/Camel/native).
- **dedup**: non — zéro couverture Quarkus chez nous. Hors stack MAOS, arsenal par langage.
- **chemin library**: `packages/skills/library/quarkus-patterns/SKILL.md`
- **état**: boosté §12. Ligne 1 = `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim + 7 sections §12. 0 secret (les `${DB_PASSWORD}`/`${RABBITMQ_PASSWORD}` = placeholders env conservés), 0 import sdk. Recadré §5/§8 : messaging/réseau côté projet utilisateur, gated ; code contre projet externe read-only.

## quarkus-tdd
- **décision**: adopt
- **raison**: TDD Quarkus 3.x tuné event-driven/Camel. Delta framework-spécifique fort vs springboot-tdd : `@InjectMock` (pas `@MockBean`), Panache `persist()` void → `doNothing`+`verify`, test de routes Camel via `AdviceWith`+`MockEndpoint`, async `CompletableFuture` déterministe (executor synchrone, cause `CompletionException`, propagation `LogContext`), REST Assured, layout `@Nested`/`@DisplayName`/given-when-then. Non-dup : ces deltas n'existent ni dans springboot-tdd ni dans quarkus-verification.
- **dedup**: non — aucun TDD Java/Quarkus chez nous ; complémentaire de `superpowers:test-driven-development` (générique).
- **chemin library**: `packages/skills/library/quarkus-tdd/SKILL.md`
- **état**: boosté §12. Ligne 1 = `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim + 7 sections §12. 0 secret, 0 import sdk. Recadré §5/§8 : exécution = action shell gated sur projet externe read-only.

## quarkus-verification
- **décision**: adopt
- **raison**: gate de vérification Quarkus ordonné stop-on-first-failure avec les phases que le gate Spring n'a PAS : compilation native GraalVM (reflection/resources/JNI), build+scan d'image conteneur (Trivy/Grype), health endpoints, en plus de build→static→tests+JaCoCo→sécurité (dependency-check + `quarkus:audit` + ZAP) → perf k6 → config → docs. Delta natif/conteneur = non-dup vs springboot-verification. Mappe sur §7.
- **dedup**: non — pas de gate Quarkus chez nous.
- **chemin library**: `packages/skills/library/quarkus-verification/SKILL.md`
- **état**: boosté §12. Ligne 1 = `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim + 7 sections §12. 0 secret, 0 import sdk. Recadré §5/§8 : phases shell/réseau (mvn/docker/k6/trivy/ZAP/registry) = actions gated sur le projet externe read-only ; ZAP/k6/registry sont des sorties réseau, soumises à l'allowlist §5.

## jpa-patterns
- **décision**: adopt
- **raison**: data-access JPA/Hibernate pour Spring Boot — design d'entités (index, auditing), mapping de relations + prévention N+1 (JOIN FETCH / projections), repositories + projections, scoping transactionnel (`readOnly` reads), pagination, stratégie d'indexation, pooling HikariCP, second-level cache prudent, migrations Flyway/Liquibase (jamais auto-DDL en prod). Centre de gravité distinct de springboot-patterns : la *frontière base de données* (perf/correction).
- **dedup**: non — aucune couverture JPA/Hibernate chez nous.
- **chemin library**: `packages/skills/library/jpa-patterns/SKILL.md`
- **état**: boosté §12. Ligne 1 = `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim + 7 sections §12. 0 secret, 0 import sdk. Recadré §8 : la base appartient au projet externe ; MAOS ne s'y connecte pas, il guide le code de persistance.

## tinystruct-patterns
- **décision**: adopt
- **raison**: framework Java niche tinystruct — principe CLI=HTTP equal citizens, `AbstractApplication` sans `main()`, routes `@Action` + `ActionRegistry`, JSON natif `Builder`/`Builders` zéro-dépendance, persistance `AbstractData` + génération POJO, SSE, uploads, config `application.properties`, et support MCP natif (SDK 1.7.26+). La **SECURITY WARNING prompt-injection** de la source (les retours d'outil MCP rentrent dans le contexte modèle → valider longueur/charset/nullité) est conservée, promue en Principe #6 et alignée sur le Prompt Defense Baseline — contenu de sécurité correct, renforcé pas strippé.
- **dedup**: non — aucune couverture tinystruct chez nous. Note : MAOS a déjà `mcp-builder` (Python/Node), mais celui-ci couvre les outils MCP *côté tinystruct/Java* — angle distinct, non-dup.
- **chemin library**: `packages/skills/library/tinystruct-patterns/SKILL.md`
- **état**: boosté §12. Ligne 1 = `---`, commentaire source, summary L1, metadata, Prompt Defense Baseline verbatim + 7 sections §12. 0 secret (les `database.password=` vides de la config = placeholders), 0 import `@anthropic-ai/sdk`. Recadré §5/§8 : outbound HTTP/SSE = sorties réseau gated ; code contre projet externe read-only.

---

## Synthèse lot K

9/9 keepers (9 adopt, 0 adapt, 0 backlog, 0 reject). Aucune consolidation : les trios `*-tdd`/`*-verification` (springboot, quarkus) gardent chacun un delta framework-spécifique non-dup (slices de test vs gate ; Spring vs Quarkus/Camel/native). Sanitize 9/9 clean (placeholders env conservés, aucun secret en dur, aucun import SDK PAYG). Deux notes de sécurité présentes dans les sources (spoof `X-Forwarded-For` ; prompt-injection MCP) conservées et renforcées. Tout l'arsenal est hors stack MAOS (TS/Node) mais entre au titre d'arsenal-par-langage (CLUSTERS.md §ENG) ; recadrage transverse §8 (code contre projet externe read-only, n'exécute rien) + §5 (mvn/gradle/docker/k6/trivy/ZAP/outbound = actions gated côté projet utilisateur) + §11 (zéro chiffre $/€, abonnement).
