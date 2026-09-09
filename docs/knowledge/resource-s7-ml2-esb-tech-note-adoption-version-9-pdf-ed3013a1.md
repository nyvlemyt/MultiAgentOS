---
id: resource-s7-ml2-esb-tech-note-adoption-version-9-pdf-ed3013a1
slug: resource-s7-ml2-esb-tech-note-adoption-version-9-pdf-ed3013a1
source_key: 'sha256:ed3013a1278920939a0738c33eff0712ebc8d246a4eef04b052bf80917bdd388'
part_of: resource-s7-ml2-fa640f29
order: 17
manifest: null
derived_from: 'sha256:ed3013a1278920939a0738c33eff0712ebc8d246a4eef04b052bf80917bdd388'
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
  - electric school buses
  - ESB
  - dataset
  - school districts
  - environmental justice
  - equity
  - transportation
  - WRI
  - United States
domain: sustainable transportation
---
# S7 - ml2 — esb-tech-note-adoption-version-9.pdf

## Summary

WRI's first-of-its-kind public dataset tracking 'committed' electric school bus (ESB) adoption across ~19,500 U.S. school districts. Organized in six spreadsheet sheets, it combines ESB commitment data (district- and bus-level) with fleet characteristics, socioeconomic/demographic indicators, environmental-justice variables, utility data, county data, and congressional-district data. Data through December 31, 2024; version 9, June 2025. Available at https://datasets.wri.org/dataset/electric_school_bus_adoption.

## Fields/API

**Sheet 1 – District-level ESB adoption (11 categories)**: **Category 1 – School district characteristics**: Base table from NCES 2022–23 LEA Universe Survey. ~19,500 LEAs identified by LEA ID; includes address, locale (urban/suburban/town/rural), lat/long, regional groupings.
**Category 2 – School bus fleet characteristics**: Total bus count and ownership model (district-owned vs. private contractor), sourced from WRI's Dataset of U.S. School Bus Fleets (46 states + DC, 450k+ buses).
**Category 3 – Electric school bus fleet characteristics**: Number of 'committed' ESBs per district, procurement stage counts, manufacturer, funding sources, charging companies, utilities involved. Aggregated from Sheet 2.
**Category 4 – Socioeconomic and demographic characteristics**: Enrollment, tribal status (Bureau of Indian Education), median household income, poverty rate, racial/ethnic distribution. Source: NCES drawing on U.S. Census.
**Category 5 – Environmental justice and health**: % low-income (≤2× federal poverty level), % non-white/Hispanic, average ozone (ppb), average PM2.5 (µg/m³), adult asthma rate, % students with disability, Priority Outreach District (POD) flag. Source: EPA EJScreen 2023; CDC PLACES.
**Category 6 – Expressions of interest in ESBs**: Prior unsuccessful funding applications, Climate Mayors EV Purchasing Collaborative membership, sustainability commitments (Green Schools National Network, Schools for Climate Action), Generation 180 Solar School, Trust for Public Land Active Community Schoolyard participation.
**Category 7 – Sources**: Links to sources not in Table A1 (e.g., unawarded applications, stakeholder groups).
**Sheet 2 – Bus-level data**: One row per individual ESB. Fields: Bus ID (LEA-ID-based), current adoption stage, quarter entered each stage (awarded / ordered / delivered / operating — known and estimated), batch number, bus characteristics, funding source(s) and amounts, charger information, most-recent source date and links.
**Sheet 3 – State school bus fleets**: Total state bus count, committed ESBs per state, % fleet electrified, estimated students riding ESBs, primary transportation mode data, pupil transportation requirement and funding method.
**Sheet 4 – Utilities**: Utility names operating within each school district boundary; ownership type (cooperative, municipal, investor-owned, etc.); RTO/ISO assignment. Source: HIFLD 2020 shapefiles + GIS analysis.
**Sheet 5 – Counties**: All counties intersecting each school district (multi-row for multi-county districts). Source: NCES Geographic Relationship Files.
**Sheet 6 – Congressional districts**: All congressional districts within each school district (multi-row). Source: NCES Geographic Relationship Files.

## Constraints

**Committed ESB definition**: An ESB is 'committed' only when the fleet operator has been awarded funding OR has signed a formal purchase agreement with a manufacturer/dealer. Stated intentions, pending applications, or long-range electrification targets do NOT qualify.
**Adoption stages (four)**: Awarded → Ordered → Delivered → Operating. Quarters used (not exact dates) because sources rarely publish precise dates.
**Estimation methodology**: Missing stage dates are estimated using median inter-stage quarter gaps computed across three time periods (Early 2014–2018; Middle/COVID 2019–2021; Clean School Bus Program 2022+), deduped to one district per quarter to reduce bias. Estimates are never applied: (a) if the most-recent source is within the current/previous quarter, (b) if the estimate would land in the future (2024 Q2+). Publicly available data always supersedes estimates. Anachronistic results (67 buses, 0.01%) corrected case-by-case.
**LEA types covered**: All 9 NCES LEA types plus private schools and private fleet operators that hold ESBs. Demographic/fleet data is richest for regular public school districts (types 1–2, ~13,500 entities).
**Indicator selection criteria**: Prevalent (aligned with federal funding eligibility metrics), Curated (holistic but not overwhelming), Relevant to ESBs (air-pollution health outcomes; fleet and administrative factors).
**Source selection criteria**: Reputable (government or peer-reviewed preferred; news articles cross-checked), Appropriate scale (district-level or finer), Recent (updated within 3–5 years).
**Key limitations**: - Missing fleet data for many districts; gaps for charter and tribal LEAs.
- ESBs owned by private operators whose deployment location is unknown are excluded from geographic/equity analyses.
- Risk of double-counting when both a district and its fleet operator are separately reported.
- District-level averages mask within-district heterogeneity.
- Student-ridership estimates are highly approximate (state-average per-bus ridership × delivered/operating ESBs).
- Dataset is static between updates; an interactive monthly dashboard supplements it.

## Examples

**Priority Outreach Districts (PODs)**: 1,508 districts identified using top-quartile thresholds for % low-income, % non-white/Hispanic, and ozone or PM2.5 concentration (national + state lists); all tribal districts included regardless of data availability.
**Batch assignment example**: Albemarle County Public Schools: buses 5100090-1 & -2 awarded 2021 Q2 → Batch 1; buses 5100090-3 & -4 awarded 2022 Q1 → Batch 2. Adjacent-quarter criterion (same or consecutive quarters) groups buses into one batch.
**Median inter-stage gaps (Clean School Bus era 2022–2023)**: Awarded→Ordered: 1 quarter (n=145); Awarded→Delivered: 3 quarters (n=72); Ordered→Delivered: 2 quarters (n=113); Delivered→Operating: 0 quarters (n=7).
**DERA 2019–2020 rebates (FOIA appendix)**: 2019: 1 bus (Reynolds SD, OR, $20k). 2020 selectees: 20 buses across CA and PA (Lion buses, $65k–$300k per district). 2020 waitlist: 28 buses across WI, CA, KS, VA, PA, UT, CO, NY.
**Use case — equity analysis**: Filter Sheet 1 to districts with ESBs; compare % non-white and % low-income against national averages; cross-reference POD flag to assess whether electrification benefits reach highest-need communities.
**Use case — policy advocacy**: Congressional staffer looks up Sheet 6 to identify which congressional districts overlap their state's top ESB adopters; uses state-level data from Sheet 3 to brief their member on relative ESB penetration.
