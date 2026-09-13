---
id: resource-queues-simulation-5f4029c3
slug: resource-queues-simulation-5f4029c3
source_key: 'sha256:5f4029c36b9ac8ffeb6e7f6d6330c33689c82516ca6ce5b5bd1bfb50c61dcee2'
part_of: null
order: null
manifest: null
derived_from: 'sha256:5f4029c36b9ac8ffeb6e7f6d6330c33689c82516ca6ce5b5bd1bfb50c61dcee2'
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
doc_type: tutorial
actionability: resource
lane: knowledge
schema_version: '1'
tags:
  - queues
  - simulation
  - scheduling
  - FCFS
  - data-structures
  - algorithms
  - priority-queue
domain: Computer Science — Data Structures & Algorithms
---
# Queues – Simulation

## Goal

Use a queue to simulate a doctor's waiting-room scheduler and compute average global time (arrival → departure) and average waiting time (time not with the doctor) for a set of patients.

## Prerequisites

- Understanding of the FIFO queue abstract data type (enqueue / dequeue / peek)
- Basic ability to write simulation loops in a procedural or OO language
- Familiarity with the concept of a discrete-event or time-step simulation

## Steps

- Model each patient as a record with three fields: arrival_time (integer clock tick), examination_time (duration with the doctor), and blood_test (pair: duration away, duration of re-examination). Dataset: P1(3,10,4/5), P2(0,6,5/1), P3(2,8,3/3), P4(4,9,3/5), P5(6,4,3/4).
- Part 1 — FCFS without external tests: Maintain a single FIFO queue. At each clock tick, enqueue patients whose arrival_time equals current time. If the doctor is free and the queue is non-empty, dequeue the front patient and start their examination. Track per-patient start and end times to compute: global_time = end − arrival, waiting_time = start − arrival. Average both metrics over all patients.
- Part 2 — FCFS with external tests: After the doctor finishes examination, the patient leaves for blood/scanner for blood_test[0] ticks. During that interval the doctor picks the next patient from the queue (FCFS). When the external test completes, re-enqueue the returning patient (they join the back of the queue as a new arrival at that clock tick). A patient's full departure time is when the doctor completes their re-examination. Recompute average global and waiting times under these conditions.
- Part 3 — Shortest-auscultation-first (design only, no implementation): Replace the FIFO queue with a min-priority queue keyed on examination_time. When the doctor becomes free, dequeue the patient with the smallest remaining examination time rather than the longest-waiting one. This requires a data structure that supports priority-ordered removal (e.g., a binary heap or sorted linked list) rather than a plain FIFO. No implementation required; analyse which queue operations change and why.

## Result

A working discrete-event simulation (parts 1 and 2) that correctly sequences patients through a shared doctor resource, handles re-entrant patients after external tests, and outputs per-patient and aggregate timing metrics. Part 3 produces a design note identifying the FIFO → min-heap substitution needed for shortest-job-first scheduling.

## Next

- Implement the priority-queue variant from Part 3 and compare average waiting times against FCFS to observe the classic SJF trade-off.
- Generalise to multiple doctors (parallel servers) using multiple queues or a single shared queue with multiple dequeue consumers.
- Apply the same queue-simulation pattern to OS process scheduling (Round Robin, MLFQ) as mentioned in the problem statement.
