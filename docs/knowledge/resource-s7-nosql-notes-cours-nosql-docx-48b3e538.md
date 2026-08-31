---
id: resource-s7-nosql-notes-cours-nosql-docx-48b3e538
slug: resource-s7-nosql-notes-cours-nosql-docx-48b3e538
source_key: 'sha256:48b3e5380bbab4ba1274dce65cb318270c6c5b93a7aec9d95591cf6349f2ac4b'
part_of: resource-s7-nosql-a014403d
order: 8
manifest: null
derived_from: 'sha256:48b3e5380bbab4ba1274dce65cb318270c6c5b93a7aec9d95591cf6349f2ac4b'
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
  - nosql
  - mongodb
  - cassandra
  - neo4j
  - redis
  - database
  - big-data
  - document-model
  - column-model
  - graph-model
  - key-value
  - cours
domain: databases
---
# S7 - nosql — Notes-cours-NoSQL.docx

## Thesis

Les technologies NoSQL (Not Only SQL) ont émergé pour pallier les limites des modèles relationnels face au Big Data et aux données distribuées, en proposant quatre familles de modèles de données adaptées à des besoins différents.

## Context

Les SGBD relationnels peinent à absorber des volumes massifs (Big Data) et des données réparties sur plusieurs nœuds. NoSQL désigne un ensemble hétérogène de bases de données qui abandonnent ou assouplissent le modèle tabulaire pour gagner en scalabilité et en flexibilité de schéma.

## Reasoning

Quatre modèles NoSQL coexistent, chacun avec un représentant canonique : (1) **Document (MongoDB)** — chaque enregistrement est un objet JSON autonome, ex. `{ N°élève: 1, Nom: 'A', Adresse: 'Paris', Année: 2002 }` ; (2) **Colonne (Cassandra)** — représentation parcimonieuse : seules les colonnes renseignées sont stockées par ligne, ce qui évite de persister des valeurs nulles ; (3) **Graphe (Neo4J)** — entités et relations forment un graphe, adapté aux réseaux sociaux ou aux cartes de transport ; (4) **Clé-Valeur (Redis)** — modèle le plus simple : une clé pointe vers une valeur opaque, très rapide en lecture/écriture. Le cours retient MongoDB 8.2.4 comme technologie d'exploration pratique ; son démarrage requiert trois composants : le serveur `mongod --dbpath <dossier>`, le shell interactif `mongosh`, et les outils CLI (`mongoimport`) à placer dans le répertoire `bin` de l'installation.

## Trade-offs

Chaque modèle optimise un cas d'usage précis au détriment des autres : le document offre une flexibilité de schéma mais complexifie les jointures ; la colonne gère l'écriture parcimonieuse à grande échelle mais impose une modélisation orientée requête ; le graphe excelle sur les traversées relationnelles profondes mais scale moins bien en volume brut ; le clé-valeur est le plus rapide mais n'offre aucune structure interne interrogeable. Aucun modèle ne remplace les autres universellement.

## See also

- MongoDB Community Server
- mongosh
- mongoimport
- Cassandra
- Neo4J
- Redis
- Big Data
- bases de données relationnelles
