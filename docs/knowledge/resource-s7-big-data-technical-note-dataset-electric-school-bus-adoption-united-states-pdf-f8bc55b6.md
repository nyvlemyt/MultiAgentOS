---
id: >-
  resource-s7-big-data-technical-note-dataset-electric-school-bus-adoption-united-states-pdf-f8bc55b6
slug: >-
  resource-s7-big-data-technical-note-dataset-electric-school-bus-adoption-united-states-pdf-f8bc55b6
source_key: 'sha256:f8bc55b6ca63e1e53ed2dcd9734b70edc6dbf4a6aa1aa7e3e218bc2f7e9d18d2'
part_of: resource-s7-big-data-70f04b2b
order: 25
manifest: null
derived_from: 'sha256:f8bc55b6ca63e1e53ed2dcd9734b70edc6dbf4a6aa1aa7e3e218bc2f7e9d18d2'
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
  - electric-school-buses
  - dataset
  - USA
  - school-districts
  - equity
  - transportation
  - ESB
  - WRI
  - big-data
domain: sustainable transportation
---
# S7 - big data — technical-note-dataset-electric-school-bus-adoption-united-states.pdf

## Summary

WRI technical note (Jan 2022) describing the structure, methodology, and limitations of the first centralised public dataset tracking electric school bus (ESB) adoption across all ~19 500 US local education agencies (LEAs). The dataset is organised by school district and counts 'committed' ESBs — those for which funding has been awarded or a formal purchase agreement signed. It is published at datasets.wri.org and updated quarterly.

## Fields/API

**Sheet 1 — Main dataset (8 categories)**: **Cat 1 — School district characteristics**: Base table from NCES 2020-21 LEA Directory: LEA ID, name, address, locale (urban/suburban/town/rural), census region/division, EPA region, lat/lon. ~19 500 rows covering all 8 LEA types plus private/nonprofit fleet operators.
**Cat 2 — School bus fleet characteristics**: Available for top-100 fleets only (~91 400 of 480 000 US buses): total buses, route buses, annual/average daily route mileage per bus (derived: annual mileage ÷ route buses ÷ 180 school days), students transported daily, ownership structure, driver pay, labour-shortage severity, union status.
**Cat 3 — ESB fleet characteristics**: Core adoption data collected by WRI from public sources: has_ESBs flag, number of committed ESBs, manufacturer, model, bus type (A–D), dealer, funding source(s), administering agency, utility/charging company involved, other stakeholders, notes. Multiple columns per variable when a district has >1 manufacturer/source.
**Cat 4 — Socioeconomic & demographic**: From NCES/US Census (2015-19 ACS): enrolled students, median household income, % below poverty, % by race/ethnicity (White, Black, AIAN, Asian, NHPI, other, multiracial, Hispanic), % students with disability, ARP ESB funding eligibility (Yes/No).
**Cat 5 — Expressions of interest**: Prior ESB funding application without award (DERA 2020, NJ VW Settlement), Climate Mayors EV Purchasing Collaborative membership, school district sustainability commitments (Schools for Climate Action, Green Schools National Network, A Climate to Thrive).
**Cat 6 — Sources & updates**: Per-district source URLs and date of most recent update for Cat 3 data.
**Sheet 2 — Utilities**: GIS-derived from HIFLD 2020 utility boundary shapefiles intersected with NCES district boundaries: utility names, ownership type flags (cooperative/federal/investor/municipal/state/wholesale), RTO/ISO identifier.
**Sheet 3 — Counties**: NCES Geographic Relationship Files: number of counties per district, county names, 5-digit FIPS codes (supports funding/policy analysis at county level; ~4 000 LEAs span ≥2 counties).

## Constraints

**Committed ESB definition**: An ESB is 'committed' only when funding has been formally awarded or a purchase agreement signed — stated intentions or fleet-electrification targets without a concrete agreement are excluded. This avoids overcounting but means most tracked buses are not yet in operation (typical funding-to-operation lag: 2+ years).
**Fleet data coverage**: School bus fleet characteristics (Cat 2) available for top-100 fleets only; represents ~1/5 of all US buses. Gaps exist for charter schools, tribal schools, and districts served by private operators whose service locations are unknown.
**Source reliability**: ESB commitment data aggregated from hundreds of disparate sources (news articles, press releases, funding announcements, social media). Cross-checking applied where possible; uncertainty cannot be quantified.
**Potential double-counting**: Districts with hybrid ownership (district + private operator) may be counted under both entities when sources report the same buses separately.
**Private operator location gaps**: ESBs owned by private fleet operators without known service locations appear in national totals but are excluded from regional/income/racial distribution analyses.
**Demographic incompleteness**: Racial/ethnic percentages are not comprehensive proxies for environmental justice; a full equity analysis requires additional indicators (pollutant exposure, health outcomes, policy history). Hispanic/Latino ethnicity is collected separately from race — summing non-White race categories does NOT equal % people of colour.
**Update cadence**: Quarterly; outdated information is an inherent risk of any static dataset between update cycles.
**LEA ID matching**: Data across sources merged via XLOOKUP on LEA ID, not district name, to avoid false matches across states or naming variants.

## Examples

**Equity analysis**: Filter to districts with ESBs; join Cat 4 to ask 'Are ESBs concentrated in higher-income or majority-White districts?'
**Journalism**: Cross-tabulate committed ESBs with EPA air-quality data to build a health-focused piece on ESB benefits.
**Policy advocacy**: Congressional staffer compares a member's state/district ESB count to national baseline; uses funding-source columns to argue for full appropriation of zero-emissions bus funding.
**Fleet planning**: A district staff member checks similarity to districts that have already committed ESBs to assess transition feasibility and identify peer districts for benchmarking.
