---
id: resource-s7-ml2-esb-dataset-change-log-version-9-pdf-7033d1c4
slug: resource-s7-ml2-esb-dataset-change-log-version-9-pdf-7033d1c4
source_key: 'sha256:7033d1c4f6831fdf0cb77e5fed3a9cded9bcd2d4432d13938ad7ffccfca0c6b4'
part_of: resource-s7-ml2-fa640f29
order: 16
manifest: null
derived_from: 'sha256:7033d1c4f6831fdf0cb77e5fed3a9cded9bcd2d4432d13938ad7ffccfca0c6b4'
sources: []
lifecycle: distilled
superseded_by: null
trust: untrusted
ocr_confidence: null
retrieval_context: null
quality_score: null
kind: resource
register: learnings
scope: global
doc_type: reference
actionability: resource
lane: resources
schema_version: '1'
tags:
  - electric-school-bus
  - ESB
  - dataset
  - transportation
  - education
  - equity
  - fleet
  - EV
domain: clean transportation
---
# S7 - ml2 — esb-dataset-change-log-version-9.pdf

## Summary

Version 9 (June 2025) changelog for the World Resources Institute dataset tracking electric school bus (ESB) adoption across US school districts. Lists every updated variable across six spreadsheet tabs: district-level demographics and fleet data, bus-level procurement and status data, state-level aggregates, utility partnerships, county mappings, and congressional district mappings.

## Fields/API

**sheet**: Sheet 1 — District-level
**variables**: - 0a. Has committed ESBs?
- 1a–1t. LEA identity, address, locale, geolocation, census region/division
- 2a. Total buses; 2b. Contractor used?
- 3a–3i. ESB counts by status (committed, awarded, ordered, delivered, operating), batch sizes (up to 5), % fleet electric
- 3j. Government agency involved (non-funding)
- 3k1–3k3. Utility/energy company involved
- 3l1–3l3. Other groups involved
- 3m. Notes
- 4b. Students in district; 4c. Schools
- 4e. % eligible free/reduced lunch; 4f. Median household income; 4g. % below poverty line
- 4h–4u. Race/ethnicity breakdown (White, Black, AIAN, Asian, NHPI, other race, two+ races, Hispanic/Latino)
- 6e. Applied for ESB funding but not awarded
**sheet**: Sheet 2 — Bus-level
**variables**: - 1a–1f. State, LEA name, LEA ID, city
- 2c1–2c2. Fleet operators
- 3a. ESBs committed
- 3n. Current bus status; 3o. Batch
- 3p–3s. Quarter awarded/ordered/delivered/first operating
- 3t. Bus OEM; 3u. Powertrain manufacturer; 3v. Model; 3w. Type; 3x. Dealer
- 3y. Multiple funding sources?; 3z. Funding sources; 3aa. Administering agencies
- 3ab. $ toward bus; 3ac. Charging company; 3ad. Charging funding source; 3ae. $ toward charger
- 3af1–3af2. Notes
**sheet**: Sheet 3 — State-level
**variables**: - 3a. Number of committed ESBs
- 3i. % committed ESBs
- 8a. Approximate total students riding ESBs
**sheet**: Sheet 4 — Utilities
**variables**: - 1a. State
- 1b. LEA name
- 1c. LEA ID
- 9a. Utility name
**sheet**: Sheet 5 — Counties
**variables**: - 1a–1c. State/LEA/ID
- 10a. County name
- 10b. County FIPS code
- 10c. Number of counties in LEA
**sheet**: Sheet 6 — Congressional districts
**variables**: - 1a–1c. State/LEA/ID
- 11a. Congressional district
- 11b. District code
- 11c. Number of districts in LEA

## Constraints

- Version 9 — June 2025; all listed variables reflect updated values for this release only.
- Authors: Leah Lazer, Lydia Freehafer, Brian Zepka (World Resources Institute).
- Demographic and socioeconomic variables (4b–4u) are district-level, not bus-level.
- Batch size fields (3h) repeat the same field code for batches 1–5; likely indexed sub-fields.
- Bus-level status quartiles (3p–3s) track the procurement pipeline at bus granularity.

## Examples

- A district with 3a=12 ESBs committed, 3e=8 delivered, 3f=6 operating, and 3i=15% fleet electric would appear across Sheet 1 columns.
- A single bus row in Sheet 2 captures OEM, powertrain maker, dealer, all funding sources, dollar amounts toward bus and charger, and quarterly milestones.
- Sheet 3 enables state-level roll-ups: total committed ESBs and share of statewide fleet, plus ridership estimate.
