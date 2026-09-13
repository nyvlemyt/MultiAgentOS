---
id: resource-kpi-row-179ca7da
slug: resource-kpi-row-179ca7da
source_key: 'sha256:179ca7dabd8e81470ff7ed00e333e84c2f74e62a9070e063d69936bd35b49864'
part_of: null
order: null
manifest: null
derived_from: 'sha256:179ca7dabd8e81470ff7ed00e333e84c2f74e62a9070e063d69936bd35b49864'
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
  - streamlit
  - data-visualisation
  - dashboard
  - python
  - storytelling
  - student-project
  - efrei
domain: data science
---
# KPI row

## Summary

Project brief for an individual EFREI student assignment: design and ship a Streamlit data-storytelling dashboard powered by a public open dataset. The app must follow a narrative arc (hook → analysis → insights → implications), include sidebar filters, ≥3 interactive visuals, a KPI metrics row, and a data-quality section. Graded on narrative framing, data work, visualisation/UX, engineering quality, and communication (100 pts total).

## Fields/API

**stack**: Python, Streamlit ≥1.33, Pandas, Plotly/Altair, GeoPandas/Pydeck (optional)
**data_sources**: French open data portals: data.gouv.fr, gd4h.ecologie.gouv.fr, data.europa.eu
**deliverables**: Deployable Streamlit app, 2–4 min demo video, ZIP with dataset link + README + Python code
**file_naming**: StreamlitApp25_<student_id>_NOM_BDMLx.zip
**narrative_patterns**: Before/After · Compare groups/regions · Rankings & distribution · Flow/throughput · What-if exploration
**required_features**: Sidebar controls · ≥3 interactive visuals with tooltips · Map or small multiples · KPI metrics header · Data quality section
**performance**: st.cache_data, efficient merges, pre-aggregation
**accessibility**: Alt text, readable contrast, labelled axes and units
**reproducibility**: requirements.txt with pinned deps, data download script, seeds.json for consistent sampling
**app_structure**: app.py + sections/{intro,overview,deep_dives,conclusions}.py + utils/{io,prep,viz}.py + data/ + assets/
**rubric**: **narrative_problem_framing**: 25 pts
**data_work**: 25 pts
**visualisation_ux**: 25 pts
**engineering_quality**: 15 pts
**communication**: 10 pts
**submission**: Deployed app URL (Streamlit Community Cloud) + repo link + storyboard + demo video

## Constraints

- Dataset must be from an approved public portal; license must be compatible with academic reuse.
- Streamlit version must be ≥1.33.
- App must include a KPI row tied to sidebar filters.
- At least one map if geo fields exist; otherwise small multiples are mandatory.
- No over-claiming causality; document uncertainty, sampling biases, and collection methods.
- People-related data must be aggregated to prevent re-identification.
- Code must run from a clean checkout (deterministic environment).
- ANTHROPIC_API_KEY and similar secrets must never appear in committed files (not directly stated in source, but standard practice — omit if strict faithfulness required).

## Examples

- Air quality evolution near low emission zones (GD4H datasets)
- Electricity production mix and CO₂ intensity across EU countries
- Public transport usage vs. pollution in French metros
- Water quality compliance by region and season
- Renewable adoption vs. energy prices
