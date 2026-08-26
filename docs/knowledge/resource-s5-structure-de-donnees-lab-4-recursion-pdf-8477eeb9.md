---
id: resource-s5-structure-de-donnees-lab-4-recursion-pdf-8477eeb9
slug: resource-s5-structure-de-donnees-lab-4-recursion-pdf-8477eeb9
source_key: 'sha256:8477eeb9f9f729f83c3209ffb58f6640f4d6a9ac064e65034ba59beff528533d'
part_of: S5 - Structure de données
order: 5
manifest: null
derived_from: 'sha256:8477eeb9f9f729f83c3209ffb58f6640f4d6a9ac064e65034ba59beff528533d'
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
  - recursion
  - C
  - algorithms
  - data-structures
  - hanoi
  - parsing
  - prefix-postfix
domain: computer-science
---
# S5 - Structure de données — Lab 4 Recursion.pdf

## Goal

Practice writing recursive functions in C across five increasing levels of difficulty: arithmetic, iteration, combinatorial puzzle, grammar parsing, and expression transformation.

## Prerequisites

- Basic C syntax (functions, pointers, arrays)
- Understanding of the call stack
- Familiarity with the concept of a base case vs. recursive case

## Steps

- Ex 1 — Recursive multiply: define multiply(a, b) as: if b == 0 return 0, else return a + multiply(a, b-1). Implement in C with that base case.
- Ex 2 — Print 1 to 30: define printTo(n) as: if n > 30 return, else print n then call printTo(n+1). Seed the first call with printTo(1).
- Ex 3 — Tower of Hanoi: implement void towers(int n, char from, char to, char aux). Base case: n == 0, do nothing. Recursive case: move n-1 disks from→aux using to, move disk n from→to, move n-1 disks aux→to using from.
- Ex 4 — Algebraic expression validator: implement four mutually recursive functions (expr, term, factor, getsymb) that consume a character string via a shared position pointer *ppos. expr calls term, optionally consumes '+' and calls term again; term calls factor, optionally consumes '*' and calls factor again; factor accepts a letter or a '('-delimited recursive call to expr followed by ')'. Print 'valid' if the full string is consumed, 'invalid' otherwise.
- Ex 5 (Bonus) — Prefix to postfix: read one symbol; if it is an operator, recursively convert left operand then right operand, then emit the operator; if it is an operand, emit it directly. Example: -++A*BCD*EF → ABC*+D+EF*-.

## Result

Five working C programs demonstrating: tail-style arithmetic recursion, simple countdown recursion, the classic three-peg Hanoi solution, a recursive-descent parser for a small grammar, and a prefix-to-postfix tree traversal.

## Next

- Compare recursive multiply with iterative version and measure call-stack depth for large b
- Extend the expression parser to support subtraction and division
- Implement an iterative Hanoi solution using an explicit stack and compare move counts
- Add error recovery to the parser so it reports the position of the first invalid character
