---
id: resource-s7-nosql-tutorial-cassandra-install-with-docker-pdf-19200867
slug: resource-s7-nosql-tutorial-cassandra-install-with-docker-pdf-19200867
source_key: 'sha256:192008674a9bbbdfdb2e09c0afa9bacf7ba6898c3aecd2c72324ce00d3cc77dc'
part_of: S7 - nosql
order: 11
manifest: null
derived_from: 'sha256:192008674a9bbbdfdb2e09c0afa9bacf7ba6898c3aecd2c72324ce00d3cc77dc'
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
doc_type: howto
actionability: area
lane: resources
schema_version: '1'
tags:
  - cassandra
  - nosql
  - docker
  - cqlsh
  - installation
domain: databases
---
# S7 - nosql — Tutorial Cassandra Install with Docker.pdf

## Problem

Install and run an Apache Cassandra node locally without a native setup, using Docker.

## Solution

Pull the official Cassandra image, start a named container, then connect via the CQL shell (cqlsh) through docker exec.

1. Pull the image:
```
docker pull cassandra:latest
```
2. Start the cluster container:
```
docker run --name cass_cluster cassandra:latest
```
3. Open an interactive CQL shell against the running node:
```
docker exec -it cass_cluster cqlsh localhost
```

## Variations

- Replace `latest` with a specific version tag (e.g. `cassandra:4.1`) to pin the version.
- Add `-d` flag to `docker run` to run the container in detached (background) mode.
- Use `docker run --name cass_cluster -p 9042:9042 cassandra:latest` to expose the native CQL port to the host.

## Pitfalls

- The container may take 30–60 seconds to fully initialize before `cqlsh` can connect; if the exec fails immediately, wait and retry.
- Omitting `--name` makes it harder to reference the container in subsequent `docker exec` commands.
- Data is not persisted by default; mount a volume (`-v /host/path:/var/lib/cassandra`) for durable storage.
