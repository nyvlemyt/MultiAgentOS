---
name: hexagonal-architecture
description: "Use to design, implement, or refactor a system as Ports & Adapters: business logic depends only on abstract ports, adapters implement them at the edges, dependencies always point inward. Use when the request involves domain boundaries, decoupling logic from frameworks/DB/transport, supporting multiple interfaces (HTTP/CLI/queue) for one use case, or strangler-pattern refactors of tightly-coupled services. Do NOT use for throwaway scripts, prototypes, or pure-research questions unrelated to structure."
summary: "Ports & Adapters: keep domain + use-cases free of framework/transport/persistence; model every side effect as an outbound port (capability, not technology); inbound adapters translate protocol→use-case input; one composition root wires concrete adapters; dependency direction is always inward. Refactor legacy via strangler (one vertical slice at a time, characterization tests first, no big-bang). Test per boundary: pure domain, use-case with fake ports, adapter contract+integration, E2E. Multi-language (TS/Java/Kotlin/Go). T2 backend arsenal."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-agent
  tier: T2
  status: library
---

<!-- pattern from affaan-m/ecc skills/hexagonal-architecture/SKILL.md -->

# Hexagonal Architecture (Ports & Adapters)

## Overview

Hexagonal architecture keeps business logic independent of frameworks, transport, and persistence. The core depends on abstract **ports**; **adapters** implement those ports at the edges; dependencies always point inward (adapter → application → domain; domain depends on nothing external). The payoff is testability and replaceable infrastructure: you can swap a database, add a CLI alongside an HTTP API, or stub every dependency in a unit test without touching business rules.

## When to Use / When NOT

Use when:
- Building a feature where long-term maintainability and testability matter.
- Refactoring layered or framework-heavy code where domain logic is tangled with I/O.
- The same use case must be reachable from multiple interfaces (HTTP, CLI, queue worker, cron).
- You need to replace infrastructure (DB, external API, message bus) without rewriting business rules.

Do NOT use when:
- The work is a throwaway script or prototype where the indirection cost is not repaid.
- The question is pure research, unrelated to code structure.

## Principles

*Source: affaan-m/ecc `skills/hexagonal-architecture/SKILL.md`.*

1. **Dependencies point inward, always.** Domain depends on nothing external; the application depends only on port interfaces; adapters depend on the application. Never the reverse.
2. **Ports model capabilities, not technologies.** `OrderRepositoryPort`, not `PostgresClient`. The technology lives in the adapter.
3. **Use cases are pure orchestration.** They receive ports by injection, coordinate domain rules, and return plain data — they never read `req`/`res`, queue metadata, or ORM rows.
4. **One composition root.** Concrete adapters are bound to use cases in a single, auditable wiring location — no hidden global singletons or service-locator behavior.
5. **Map at the edges.** Protocol↔use-case and app↔infrastructure mapping lives in adapters, never inside use cases.
6. **Immutability across boundaries.** Domain transformations return new values; infra errors are translated to application/domain errors before crossing inward.

## Process

1. **Model one use-case boundary.** Define a single use case with explicit input and output DTOs; keep transport wrappers (Express `req`, GraphQL context, job payloads) outside it.
2. **Define outbound ports first.** Name every side effect as a port: persistence, external calls, cross-cutting (`LoggerPort`, `ClockPort`, `UuidPort`).
3. **Implement the use case as pure orchestration.** Inject ports via constructor/arguments; validate application invariants; coordinate domain rules; return plain data.
4. **Build adapters at the edge.** Inbound adapter converts protocol input → use-case input; outbound adapter maps app contracts → concrete API/ORM. Mapping stays in adapters.
5. **Wire in a composition root.** Instantiate adapters, inject into use cases, in one centralized module.
6. **Test per boundary.** Domain = pure rules (no mocks); use case = orchestration with fake ports; outbound adapter = shared contract suite + real-infra integration; inbound adapter = protocol mapping; plus E2E for critical journeys.

### Legacy refactor (strangler) playbook

1. Pick one high-churn, low-blast-radius vertical slice. 2. Extract a use-case boundary with explicit I/O types. 3. Introduce outbound ports around existing infra calls. 4. Move orchestration out of controllers/services into the use case. 5. Keep old adapters but delegate to the new use case. 6. Add characterization tests before extraction; keep until the new boundary is stable. 7. Repeat slice-by-slice — never a big-bang rewrite; keep a per-slice rollback toggle.

### Multi-language mapping

Same boundary rules everywhere; only syntax/wiring differ. **TS/JS:** `application/ports/*` interfaces, constructor/argument injection, explicit factory container. **Java:** `application.port.in/out`, plain use-case classes (Spring optional), wiring in config not in domain. **Kotlin:** mirrors Java split; constructor injection (Koin/Dagger/Spring/manual). **Go:** small consumer-owned interfaces, structs with `New...` constructors, wire in `cmd/<app>/main.go`.

## Rationalizations

| Excuse | Reality |
|---|---|
| "The use case can read the ORM row directly, it's simpler" | That couples the domain to persistence and breaks testability. Map in the adapter. |
| "I'll wire dependencies wherever I need them" | Scattered wiring becomes a hidden service locator. One composition root, always. |
| "A port for the clock/UUID is overkill" | Non-deterministic side effects are exactly what fakes need to control in tests. Port them. |
| "Let's rewrite the whole module to hexagonal at once" | Big-bang rewrites lose behavior. Strangle one slice at a time with characterization tests. |
| "Name the port after the technology, we only use Postgres" | Ports model capabilities; technology choice is the adapter's secret. Name `OrderRepositoryPort`. |

## Red Flags

- Domain entities import ORM models, web framework types, or SDK clients.
- A use case reads `req`/`res` or queue metadata, or returns raw DB rows.
- Adapters call each other directly instead of flowing through use-case ports.
- Dependency wiring is spread across many files with global singletons.
- A legacy migration attempts a full rewrite instead of slice-by-slice with characterization tests.

## Verification Criteria (pass/fail)

- [ ] Domain and use-case layers import only internal types and ports — no framework/ORM/SDK imports.
- [ ] Every external dependency is represented by an outbound port modeling a capability.
- [ ] Use cases receive ports by injection and return plain data (no protocol/ORM types).
- [ ] A single composition root binds concrete adapters to use cases.
- [ ] Tests exist at each boundary: pure domain, use-case with fakes, adapter contract+integration.
- [ ] Any legacy refactor proceeds one vertical slice at a time with characterization tests in place first.
