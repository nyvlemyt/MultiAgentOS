---
id: resource-s5-structure-de-donnees-lab2-stack-implementation-pdf-0c441ebb
slug: resource-s5-structure-de-donnees-lab2-stack-implementation-pdf-0c441ebb
source_key: 'sha256:0c441ebb88b333cabc47a07777a41114a2d224cf0bf0d1b762a32aa167fc0532'
part_of: resource-s5-structure-de-donnees-333ec2f4
order: 8
manifest: null
derived_from: 'sha256:0c441ebb88b333cabc47a07777a41114a2d224cf0bf0d1b762a32aa167fc0532'
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
  - stack
  - C
  - data-structures
  - linked-list
  - array
  - file-io
  - ADT
  - preprocessor
domain: computer-science
---
# S5 - Structure de données — Lab2 Stack Implementation.pdf

## Goal

Implement a stack ADT in C using three interchangeable backing stores — static array, linked list, and file — all sharing the same interface and switchable via preprocessor flags.

## Prerequisites

- C structs and typedefs
- Pointer manipulation and dynamic memory (malloc/free)
- Basic file I/O (open, read, write, seek via file descriptor)
- Understanding of LIFO semantics (push, pop, top)

## Steps

- Define the shared interface in stack.h with three conditional blocks guarded by __STATIC__STACK__, __DYN__STACK__, and __FILE__STACK__; declare the five common operations (init_stack, push_stack, pop_stack, top_stack, display_stack).
- Ex 1 — Array implementation: use `int tab[MAX]` + `int top` inside stack_t; init sets top = -1; push increments top and writes to tab[top]; pop reads tab[top] and decrements; variant: dynamically allocate the array and double its size with realloc when full.
- Ex 2 — Linked list implementation: each node holds an int val and a next pointer; stack_t holds only a top pointer; push allocates a new node and prepends it; pop removes the head node and frees it.
- Ex 3 — File implementation: stack_t stores a filename, an open file descriptor, and top_off (byte offset of the last element); call set_file() before init_stack() to bind the file; push appends an int at top_off; pop seeks back and reads; the file persists between runs.
- Validate all three with the provided main(): push 5, 6, 7; display; pop three times printing each value; attempt a fourth pop on an empty stack and verify graceful failure (return code check, old value printed).

## Result

Three fully interchangeable stack implementations selectable at compile time (`-D__STATIC__STACK__`, `-D__DYN__STACK__`, `-D__FILE__STACK__`), all passing the same test harness including the empty-pop edge case.

## Next

- Dynamic-array variant: replace fixed MAX with realloc-based doubling to remove the capacity ceiling.
- Generic stack: replace int with void* (or _Generic / macro trick) to handle arbitrary element types.
- Apply the stack to algorithm problems: balanced-parentheses checker, postfix expression evaluator, iterative DFS.
