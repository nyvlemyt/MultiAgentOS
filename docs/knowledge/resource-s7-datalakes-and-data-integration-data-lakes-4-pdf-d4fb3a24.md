---
id: resource-s7-datalakes-and-data-integration-data-lakes-4-pdf-d4fb3a24
slug: resource-s7-datalakes-and-data-integration-data-lakes-4-pdf-d4fb3a24
source_key: 'sha256:d4fb3a24c26fba9e3cf1c39415947808eb39011f3fa41b720716d0e5b98f0acc'
part_of: resource-s7-datalakes-and-data-integration-013c4eca
order: 5
manifest: null
derived_from: 'sha256:d4fb3a24c26fba9e3cf1c39415947808eb39011f3fa41b720716d0e5b98f0acc'
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
doc_type: explanation
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - apache-airflow
  - orchestration
  - DAG
  - pipeline
  - data-lake
  - graph-theory
  - scheduling
  - python
  - etl
  - data-engineering
domain: data engineering
---
# S7 - Datalakes and Data Integration — Data_Lakes___4.pdf

## Thesis

L'orchestration de pipelines repose sur les graphes acycliques dirigés (DAGs) comme modèle mathématique rigoureux ; Apache Airflow traduit ce modèle en plateforme de production en implémentant le tri topologique pour planifier automatiquement l'exécution, gérer les erreurs et surveiller les workflows — ce qui permet de passer d'un pipeline manuel à un pipeline autonome.

## Context

Cours EFREI 2024-2025, 4e séance de la série Data Lakes & Data Integration. Point de départ : pipeline TP3 fonctionnel mais entièrement manuel (download HuggingFace → staging MySQL → curated MongoDB). Le problème posé est la transition vers la production : dépendances explicites, planification automatique, gestion des échecs, surveillance. Apache Airflow (créé par Airbnb 2014, projet Apache 2019) est la réponse présentée.

## Reasoning

**Fondation théorique — DAGs.** Un DAG (Directed Acyclic Graph) G=(V,E) modélise les tâches (sommets) et leurs dépendances (arêtes orientées, sans cycle). L'absence de cycle garantit la terminaison ; la structure induit un ordre partiel permettant le parallélisme. Le tri topologique (algorithme de Kahn : file des sommets à degré entrant 0, décrémentation itérative) donne un ordonnancement d'exécution valide — c'est exactement ce que le Scheduler d'Airflow implémente.

**Architecture Airflow.** Quatre composants : (1) Scheduler — cœur, applique le tri topologique, soumet les tâches prêtes ; (2) Webserver — UI de surveillance et déclenchement manuel ; (3) Workers — exécution des tâches individuelles selon l'Executor configuré ; (4) Metadata Database (PostgreSQL/MySQL) — état persistant de tous les DAGs, tâches, variables et connexions.

**Définition de DAGs en Python.** Les décorateurs `@dag` et `@task` (TaskFlow API) transforment des fonctions Python en DAGs et tâches. L'enchaînement `extract() → transform() → load()` crée implicitement les dépendances ; l'opérateur `>>` les exprime explicitement. Le fichier doit résider dans le répertoire `dags/`.

**Scheduling.** Paramètre `schedule` : presets (`@daily`, `@hourly`, `@weekly`), expressions cron (`'0 9 * * 1-5'`), `timedelta`, ou `None` (manuel). `catchup=False` évite de rejouer les exécutions passées. Le backfilling manuel via CLI permet de ré-exécuter sur des dates historiques.

**Executors.** SequentialExecutor (développement, une tâche à la fois) → LocalExecutor (parallélisme local, taille modérée) → CeleryExecutor (cluster distribué via Redis/RabbitMQ) → KubernetesExecutor (un pod par tâche, isolation et scalabilité maximales).

**Gestion des erreurs.** Paramètres `retries`, `retry_delay`, `on_failure_callback`. États de tâche : queued → running → success / failed / up_for_retry / upstream_failed. Le statut `upstream_failed` propage l'échec en aval par défaut.

**Concepts avancés.** XCom : échange de petites données entre tâches via la Metadata DB (identifiants, compteurs, chemins — jamais des DataFrames volumineux). Sensors : attente d'un événement externe (`FileSensor`, `HttpSensor`, `SqlSensor`) ; mode `poke` (worker bloqué) vs `reschedule` (worker libéré entre vérifications). Branching : `@task.branch` retourne le `task_id` de la branche à exécuter, les autres sont marquées `skipped`. Trigger Rules : `all_success` (défaut), `one_success`, `all_done`, `none_failed` (utile après branching), `all_failed`. TaskGroups : regroupement visuel dans l'UI sans modifier la logique d'exécution, reflète naturellement les zones d'un Data Lake.

## Trade-offs

**DVC vs Airflow.** DVC (dépendances sur fichiers/données versionnés, YAML, exécution locale) excelle en développement/expérimentation pour la reproductibilité. Airflow (dépendances logiques entre tâches, Python, planification distribuée) excelle en production. Les deux coexistent dans un projet réel : DVC versionnant les données/modèles, Airflow orchestrant l'exécution quotidienne.

**Executors.** SequentialExecutor = simple mais bloquant (hors production). LocalExecutor = bon compromis sans infrastructure. CeleryExecutor = scalabilité horizontale mais dépendance à Redis/RabbitMQ. KubernetesExecutor = isolation maximale mais complexité opérationnelle élevée.

**Sensor poke vs reschedule.** `poke` : worker occupé en continu → consomme des ressources pendant l'attente. `reschedule` : worker libéré entre les vérifications → préférable pour les longues attentes.

**XCom.** Conçu pour de petites données (identifiants, compteurs, chemins). Passer des DataFrames ou fichiers via XCom surcharge la Metadata DB — utiliser un stockage externe et ne transmettre que le chemin.

**Kahn vs DFS pour le tri topologique.** Complexité identique O(|V|+|E|). Kahn plus intuitif (traite les tâches prêtes en premier, analogue direct au Scheduler). DFS plus compact à implémenter.

## See also

- Cours 3 — pipeline TP3 (download→MySQL→MongoDB)
- Cours 2 — DVC versioning et orchestration légère
- TP4 — mise en pratique : transformer le pipeline TP3 en DAG Airflow autonome
- Algorithme de Kahn (Annexe A) — implémentation Python complète avec détection de cycles
- Expressions cron (Annexe B) — référence des 5 champs et presets Airflow
