---
id: resource-kpi-row-c75c2606
slug: resource-kpi-row-c75c2606
source_key: 'sha256:c75c260635dbed26d8baf632ac01ed6e3316098355551f55af2829140e238aae'
part_of: null
order: null
manifest: null
derived_from: 'sha256:c75c260635dbed26d8baf632ac01ed6e3316098355551f55af2829140e238aae'
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
  - data-viz
  - dashboard
  - python
  - storytelling
  - student-project
  - open-data
domain: data science
---
# KPI row

## Summary

Assignment spec for an EFREI individual student project: build a Streamlit data-storytelling dashboard from a public open-data source, following a narrative arc (hook → context → insight → implications) and meeting defined technical, UX, and reproducibility criteria.

## Fields/API

**deliverables**: - Deployable Streamlit app with coherent narrative and interactive components
- Demo video (2–4 min)
- ZIP archive: dataset/link, README, Python code — named StreamlitApp25_<id>_NOM_BDMLn.zip
**technical_requirements**: **streamlit_version**: ≥ 1.33
**mandatory_features**: - Sidebar controls (filters, date range, region, variable selection)
- ≥ 3 interactive visuals with tooltips/hover
- At least one map (if geo data exists) or small multiples otherwise
- KPI metrics header tied to filters
- Data quality section (missingness, duplicates, validation)
**performance**: st.cache_data, efficient merges, pre-aggregation
**accessibility**: alt text, readable color contrast, labelled axes and units
**reproducibility**: pinned requirements.txt, deterministic environment, data download script with caching
**recommended_app_structure**: **app.py**: entry point
**sections/**: - intro.py
- overview.py
- deep_dives.py
- conclusions.py
**utils/**: - io.py (load_data, fetch_and_cache)
- prep.py (cleaning, feature engineering)
- viz.py (chart functions)
**data/**: optional cached CSV/parquet
**assets/**: logos, icons, images
**narrative_patterns**: - Before/After change over time
- Compare groups/regions (map + small multiples)
- Rankings & distribution (top/bottom N, outliers)
- Flow/throughput (sankey, network)
- What-if exploration (scenario sliders)
**evaluation_rubric**: **narrative_problem_framing**: 25 pts — audience, questions, takeaways, storyboard
**data_work**: 25 pts — sourcing, cleaning, validation, feature engineering
**visualization_ux**: 25 pts — chart types, annotations, color, interactions
**engineering_quality**: 15 pts — code structure, caching, performance, docs
**communication**: 10 pts — report clarity, demo video, transparency about limits
**approved_data_portals**: - https://www.data.gouv.fr/datasets
- https://gd4h.ecologie.gouv.fr/en/catalogue
- https://data.europa.eu/data/combined?locale=en
**dataset_selection_criteria**: - Concrete question and audience
- Sufficient time/region/category granularity
- Clean schema with data dictionary and units
- License compatible with academic reuse
- Manageable size (or plan for sampling/caching)
**kpi_row_pattern**: st.columns(3) → each column calls .metric(label, value, delta)
**key_libraries**: - streamlit
- pandas
- numpy
- pyarrow
- plotly
- altair
- geopandas
- pydeck

## Constraints

- Streamlit version must be ≥ 1.33
- Minimum 3 interactive visuals required
- Map required if dataset has geo fields
- All dependencies pinned in requirements.txt
- People-related data must be aggregated to prevent re-identification
- Do not over-claim causality — document uncertainty explicitly
- File naming convention: StreamlitApp25_<id>_NOM_BDMLn.zip

## Examples

**kpi_row_code**: c1, c2, c3 = st.columns(3)
c1.metric("KPI 1", "…", "∆ vs. baseline")
c2.metric("KPI 2", "…")
c3.metric("KPI 3", "…")
**cache_pattern**: @st.cache_data(show_spinner=False)
def get_data():
    df_raw = load_data()
    tables = make_tables(df_raw)
    return df_raw, tables
**example_themes**: - Air quality near low emission zones (GD4H)
- EU electricity production mix vs CO₂ intensity
- Public transport usage vs pollution in French metros
- Water quality compliance by region and season
- Renewable adoption vs energy prices
