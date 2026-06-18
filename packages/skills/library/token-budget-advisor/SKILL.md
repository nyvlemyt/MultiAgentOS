---
name: token-budget-advisor
description: "Use when the user explicitly wants to control answer depth or length before you answer — 'short version', 'tldr', 'brief', 'detailed', 'exhaustive', 'respond at 50% depth', 'how many tokens will this use', 'save tokens'. Offer a depth menu, then answer at the chosen level. Do NOT use when the user already set a level this session (maintain it silently), the answer is trivially one line, or 'token' means an auth/session/payment token rather than response size."
summary: "Gives the user an upfront, explicit choice over response depth instead of guessing. Before answering: (1) estimate input tokens (prose words×1.3, code chars/4); (2) classify complexity (Simple 3-8x … Complex 15-40x) to get a response window; (3) present four depth levels — Essential 25% / Moderate 50% / Detailed 75% / Exhaustive 100% — with estimated token counts; (4) answer at the chosen level. Honors shortcuts ('tldr'→25%, 'detailed'→75%) and maintains a session-set level silently. Heuristic only (~85-90% accuracy, ±15%) — always shows the disclaimer; no real tokenizer. MAS variant: this is the user-facing surface of the §6 eco/standard/expert depth control and TOKEN_STRATEGY signal-density discipline — Essential maps to eco, Exhaustive to expert; it is a depth-negotiation skill, never an excuse to drop a required deliverable section (code/commits/ADRs stay complete)."
metadata: {origin: community, license: MIT, cluster: skill:core-token, tier: T1, status: library}
---

<!-- pattern from affaan-m/ecc skills/token-budget-advisor/SKILL.md -->

# Token Budget Advisor

## Overview

Most depth mismatches happen silently: the user wanted a one-paragraph answer and got three pages, or wanted the deep dive and got a summary. This skill removes the guess by negotiating depth up front. When the user signals they care about response size, you estimate the input cost, classify the task complexity into a response window, and present four concrete depth options with token estimates so the user picks the level before any answer is generated. It trades one short clarifying turn for a right-sized answer, and it remembers the chosen level for the rest of the session.

In MultiAgentOS this is the user-facing face of the token discipline in TOKEN_STRATEGY §6 and the signal-density principle: Essential corresponds to eco-mode brevity, Exhaustive to expert-mode depth. It governs how much *prose* to emit — it is never license to omit a required deliverable (generated code, commit messages, ADRs, and UI copy are always produced in full regardless of the depth level).

## When to Use / When NOT

Use when:
- The user wants to control how long/detailed the response is
- They mention tokens, budget, depth, or response length
- They say "short version", "tldr", "brief", "al 25%", "exhaustive", etc.
- They want to choose a detail level upfront

Do NOT use when:
- The user already set a level this session — maintain it silently
- The answer is trivially one line
- "token" refers to an auth/session/payment token, not response size
- A complete deliverable is mandatory (never trim required code/commits/ADRs to hit a depth target)

## Principles

*Source: community TBA skill + CLAUDE.md §6 / TOKEN_STRATEGY §6 (signal-density; eco/standard/expert depth).*

1. **Negotiate depth before answering.** Offer the choice up front; do not back-fit length after the fact.
2. **Estimate, then classify.** Input estimate (prose words×1.3, code chars/4) feeds a complexity multiplier to size the response window.
3. **Be honest about precision.** It is a heuristic (~85-90%, ±15%), not a tokenizer. Always show the disclaimer.
4. **Sticky level.** Once the user picks a level, keep it silently for the session until they change it.
5. **Depth governs prose, never deliverables.** Trimming applies to explanation; required code, commits, ADRs, and UI copy stay complete (TOKEN_STRATEGY §6 — Caveman/eco never touch those either).

## Process

1. **Estimate input tokens.** Prose: `words × 1.3`. Code-heavy/mixed: `chars / 4`. Use the dominant content type.
2. **Classify complexity → response window.** Apply the multiplier range, cap at the model's output limit.

   | Complexity | Multiplier | Example |
   |---|---|---|
   | Simple | 3x – 8x | "What is X?", yes/no, single fact |
   | Medium | 8x – 20x | "How does X work?" |
   | Medium-High | 10x – 25x | Code request with context |
   | Complex | 15x – 40x | Multi-part analysis, architecture |
   | Creative | 10x – 30x | Stories, essays, narrative |

   Response window = `input × mult_min` … `input × mult_max`.
3. **Present the depth menu** with actual numbers, before answering:

   ```text
   Input: ~[N] tokens | Type: [type] | Complexity: [level]

   [1] Essential   (25%) -> ~[tokens]  Direct answer only
   [2] Moderate    (50%) -> ~[tokens]  Answer + context + 1 example
   [3] Detailed    (75%) -> ~[tokens]  Full answer with alternatives
   [4] Exhaustive (100%) -> ~[tokens]  Everything, no limits

   Precision: heuristic ~85-90% (±15%).
   ```

   Level tokens within the window: 25% = `min + (max-min)×0.25`, 50% = ×0.50, 75% = ×0.75, 100% = `max`.
4. **Answer at the chosen level.**

   | Level | Length | Include | Omit |
   |---|---|---|---|
   | 25% Essential | 2-4 sentences | Direct answer, key conclusion | Context, examples, alternatives |
   | 50% Moderate | 1-3 paragraphs | Answer + context + 1 example | Deep analysis, edge cases |
   | 75% Detailed | Structured | Examples, pros/cons, alternatives | Extreme edge cases |
   | 100% Exhaustive | No limit | Everything | Nothing |

5. **Apply shortcuts / sticky level.** "tldr"/"brief"/"1" → 25%, "moderate"/"2" → 50%, "detailed"/"3" → 75%, "full deep dive"/"4" → 100%. If a level was set earlier this session, reuse it silently.

## Rationalizations

| Excuse | Reality |
|---|---|
| "I'll just answer and let them ask for less" | Wrong-sized answers waste the window both ways. Negotiate first. |
| "I can give an exact token count" | No tokenizer here — it's heuristic. Show the ±15% disclaimer. |
| "They asked once, I'll ask the depth again" | A session-set level is sticky. Re-asking is noise. |
| "Essential means I can skip the code" | Depth trims prose, not deliverables. Required code/commits/ADRs stay complete. |
| "This is a one-liner, let me offer the menu" | Trivial answers skip the menu — the trigger does not fire. |

## Red Flags

- Presenting the depth menu for a trivially one-line answer
- Claiming an exact token count instead of a heuristic estimate
- Re-asking the depth level after the user already chose one this session
- Dropping required code / commit / ADR / UI content to hit a 25% target
- Firing on "auth token" / "payment token" where size control was never the intent

## Verification Criteria

- [ ] The depth menu is shown only when the user signals they want size control, before answering
- [ ] Input and response-window estimates are computed (words×1.3 / chars÷4 + complexity multiplier)
- [ ] The heuristic precision disclaimer (~85-90%, ±15%) is shown with any estimate
- [ ] A session-set level is reused silently on later turns
- [ ] The chosen level trims prose only; required deliverables (code/commits/ADRs/UI) remain complete
- [ ] The skill does not trigger when "token" means auth/session/payment
