---
name: dashboard-builder
description: "Use to turn a metrics list into an operational monitoring dashboard (Grafana, SigNoz, Prometheus) that answers real operator questions. Do NOT use for product analytics dashboards, BI reporting, or UI chart layout work."
domain: observability
summary: "Builds operator-grade monitoring dashboards instead of vanity boards. Start from the four operator questions — is it healthy? where is the bottleneck? what changed? what action to take? — never from visual layout. Organize panels around five axes: health/availability, latency, throughput, saturation, service-specific risk. Inspect the target platform's existing dashboards (JSON schema, query language, variables, thresholds) before authoring. Build the minimum useful board (overview → performance → resources → service-specific) and cut every panel that does not answer a question. Each panel must have a title, units, and meaningful thresholds. Ships ready-to-import dashboard JSON plus a quality checklist."
metadata:
  origin: affaan-m/ecc
  license: MIT
  cluster: skill:core-agent
  tier: T1
  status: library
---
<!-- pattern from affaan-m/ecc skills/dashboard-builder/SKILL.md -->

# Dashboard Builder

## Overview

A monitoring dashboard is a decision instrument, not a metric gallery. This skill builds dashboards an on-call operator can act from. The discipline is to derive panels from the questions a human asks during an incident — never from "what metrics does this exporter emit?". Output is a valid, importable dashboard definition (Grafana/SigNoz JSON or equivalent) organized so that the first screen already answers "is it healthy?".

## When to Use / When NOT

Use when:
- Turning a metrics list or exporter into a working operational board ("Build a Kafka monitoring dashboard", "Grafana board for Elasticsearch", "SigNoz dashboard for this service").
- Refactoring a sprawling vanity board into a board that drives action.

Do NOT use for:
- Product/business analytics dashboards (funnels, MRR, retention) — that is a BI concern, not observability.
- General UI chart layout or front-end styling work (use a frontend/design skill).
- Building the metrics pipeline itself (instrumentation, exporters) — this skill consumes metrics, it does not produce them.

## Principles

*Source: `affaan-m/ecc skills/dashboard-builder`; reinforced by the signal-density test in `docs/knowledge/skills-reference.md` and observability practice.*

1. **Questions before panels.** A panel exists to answer a named operator question. No question → no panel.
2. **Five-axis structure.** Every operational board covers, in order: health/availability, latency/performance, throughput/volume, saturation/resources, service-specific risk.
3. **Minimum useful board.** Fewer panels that each carry signal beats a wall of charts. This is the signal-density test applied to dashboards: if removing a panel would not change an operator decision, remove it.
4. **Thresholds are part of the panel.** A number without a sane threshold and a unit is noise. Status colors must map to "act / watch / fine".
5. **Read the platform first.** Inspect existing dashboards to learn the JSON schema, query language, variables, and threshold styling before authoring new ones — do not invent a foreign shape.

## Process

1. **Enumerate operator questions.** Write the four anchors explicitly for this service: is it healthy? where is the bottleneck? what changed? what action should someone take?
2. **Map questions to the five axes.** Assign each candidate metric to health, latency, throughput, saturation, or service-specific risk. Drop metrics that map to none.
3. **Study the target platform schema.** Inspect an existing dashboard: JSON structure, query language, variables, threshold styling, section layout. Match it.
4. **Author the minimum useful board.** Sections in order: (1) overview, (2) performance, (3) resources, (4) service-specific. First screen answers "is it healthy?".
5. **Set units + thresholds per panel.** Every panel: title, unit, and act/watch/fine threshold coloring.
6. **Add variables for common filters.** Environment, instance, namespace — whatever an operator filters by during triage.
7. **Cut vanity panels.** Re-walk every panel against its question. If it answers none, delete it.
8. **Validate + hand off.** Confirm the JSON is valid and importable; deliver it plus the quality checklist below.

### Reference panel sets

- **Elasticsearch**: cluster health · shard allocation · search latency · indexing rate · JVM heap / GC.
- **Kafka**: broker count · under-replicated partitions · messages in/out · consumer lag · disk & network pressure.
- **API gateway / ingress**: request rate · p50/p95/p99 latency · error rate · upstream health · active connections.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Show every metric, the operator can filter." | A wall of charts hides the signal. Five axes, minimum useful board. |
| "I'll lay out the panels first, pick metrics after." | Layout-first produces vanity boards. Questions first, always. |
| "Thresholds can be added later." | A number with no threshold is undecidable at 3 a.m. Thresholds ship with the panel. |
| "This exporter emits 80 metrics, more data is better." | More panels = lower signal density. Map to the five axes or drop. |
| "I'll guess the dashboard JSON shape." | Read an existing board first; a foreign shape will not import or render. |

## Red Flags

- You are choosing colors or grid positions before you have written the operator questions.
- A panel cannot be tied to one of the four anchor questions.
- Panels have no units, no thresholds, or no titles.
- The board has no overview/health section as its first screen.
- You authored dashboard JSON without inspecting the platform's existing schema.

## Verification Criteria (binary pass/fail)

- [ ] The four operator questions are written down for this service.
- [ ] Panels are grouped into the five axes (health, latency, throughput, saturation, service-specific).
- [ ] The board opens with an overview/health section.
- [ ] Every panel has a title, a unit, and a meaningful threshold.
- [ ] At least one dashboard variable exists for a common triage filter.
- [ ] The dashboard JSON is valid and importable on the target platform.
- [ ] No panel exists that does not answer a stated operator question.
