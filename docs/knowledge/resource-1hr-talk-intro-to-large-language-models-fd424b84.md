---
id: resource-1hr-talk-intro-to-large-language-models-fd424b84
slug: resource-1hr-talk-intro-to-large-language-models-fd424b84
source_key: 'sha256:fd424b842464816b03e208ac323ab0abe780daf52503cc009743d554916620df'
part_of: null
order: null
manifest: null
derived_from: 'sha256:fd424b842464816b03e208ac323ab0abe780daf52503cc009743d554916620df'
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
  - LLM
  - transformer
  - pre-training
  - fine-tuning
  - RLHF
  - scaling-laws
  - tool-use
  - multimodality
  - LLM-OS
  - jailbreak
  - prompt-injection
  - data-poisoning
  - AI-security
  - system-1-system-2
  - self-improvement
domain: AI / Machine Learning
---
# [1hr Talk] Intro to Large Language Models

## Thesis

Large Language Models are next-word prediction engines that compress internet-scale text into neural network parameters; through staged training (pre-training → fine-tuning → RLHF) they become capable assistants; and they are best understood as the kernel of an emerging operating system paradigm — with commensurate, evolving security challenges.

## Context

Talk delivered November 2023 by Andrej Karpathy (originally at the AI Security Summit). Reference model throughout: Llama 2 70B (Meta, open weights, 140 GB fp16 parameters file + ~500-line run.c). Ecosystem snapshot: closed proprietary models (GPT-4, Claude, Bard) outperform open-source (Llama 2, Mistral/Zephyr) but the open ecosystem is closing the gap. Representative training cost for a 70B model: ~$2M, 6 000 GPUs, 12 days, 10 TB of internet text — state-of-the-art runs in late 2023 are 10–100× larger.

## Reasoning

1. **Inference (what an LLM is at rest):** Two files — a parameter blob (weights, fp16) and ~500 lines of run code. Fully self-contained; no network required. Running the model is computationally cheap; obtaining the weights is expensive.

2. **Pre-training:** A GPU cluster performs lossy compression of ~10 TB of crawled internet text into the parameter file via next-word prediction. The objective is simple but forces the network to internalize broad world knowledge. Output is the *base model* — an internet-document sampler, not yet an assistant.

3. **Architecture:** Transformer. Every mathematical operation is fully understood; what is opaque is what the ~100 B individual parameters *mean*. Known pathology: the 'reversal curse' — knowledge stored in one direction ("Tom Cruise's mother") may not be retrievable in the reverse direction ("Mary Lee Pfeiffer's son").

4. **Fine-tuning — stage 2 (alignment):** Swap the training corpus for ~100 K high-quality human-written Q&A conversations (collected via labeling contractors following detailed instructions: helpful, truthful, harmless). One day of compute. Produces the *assistant model* that answers questions in the correct format while drawing on pre-training knowledge.

5. **RLHF — stage 3 (optional):** Use human *comparison* labels (pick the better of two candidate answers) rather than generation labels. Comparison is easier for labelers on tasks like creative writing. Trains a reward model then fine-tunes via reinforcement learning. Incrementally improves quality beyond stage 2. Labeling is increasingly human–LLM collaborative (LLMs draft, humans curate).

6. **Scaling laws:** Next-word-prediction accuracy is a smooth, predictable function of N (parameter count) × D (training tokens). No saturation observed as of 2023. Consequence: larger cluster + more data = reliably better model with no algorithmic breakthrough required. This is the primary driver of the GPU gold rush.

7. **Tool use:** LLMs emit special tokens (e.g. |BROWSER|) that the surrounding harness intercepts, executes (web search, Python interpreter, calculator, image generator), and feeds results back into the context window. Capability is taught through fine-tuning examples and/or system-message instructions. Mirrors how humans reach for external tools rather than working everything out in their heads.

8. **Multimodality:** Vision input enables image→code workflows (sketch a UI, get working HTML/JS). Audio I/O enables speech-to-speech conversation. Each new modality extends capability and simultaneously expands the attack surface.

9. **System 1 → System 2 (research frontier):** Current LLMs are pure System 1: fixed compute per token, no deliberation. Research goal: allow the model to spend variable time reasoning (tree of thoughts, reflection, rephrase) so that accuracy increases monotonically with allocated time. Not yet productised as of November 2023.

10. **Self-improvement (research frontier):** AlphaGo analogy — stage 1 (imitate human experts) → stage 2 (self-play with verifiable reward). LLMs are stuck at stage 1. The blocker: no cheap, automatic reward signal exists for general open-ended language. Feasible in narrow verifiable domains (math, code execution); open question for the general case.

11. **LLM OS analogy:** LLM as kernel process coordinating: RAM ↔ context window (finite, precious working memory); disk/internet ↔ storage accessed via browsing or RAG; software tools ↔ calculator/interpreter/APIs; I/O peripherals ↔ vision/audio modalities. Ecosystem mirrors historical OS landscape: closed proprietary (Windows/macOS ↔ GPT/Claude/Bard) + open-source (Linux ↔ Llama ecosystem).

12. **Security — jailbreaks:** Role-play framing ("act as my deceased grandmother") bypasses safety training. Base64 or other encodings exploit the fact that refusal training data is mostly English. Adversarially optimised suffixes ('universal transferable suffix') or noise-pattern images can jailbreak models; these can be reoptimised after each patch, making exhaustive defence impractical.

13. **Security — prompt injection:** Malicious instructions hidden in content the LLM processes (faint white-on-white text in images, invisible text on scraped web pages, injected Google Doc content) hijack the model mid-task — redirecting outputs, fabricating links, or exfiltrating user data via attacker-controlled URLs encoded in markdown image tags.

14. **Security — data poisoning / backdoor:** Attacker-controlled text in pre-training or fine-tuning corpora can embed a trigger phrase (e.g. 'James Bond') that corrupts model outputs whenever the phrase appears at inference time. Demonstrated for fine-tuning; plausible for pre-training.

## Trade-offs

**Closed vs open models:** Closed models (GPT-4, Claude) lead on performance but offer no weight access, local deployment, or custom fine-tuning. Open models (Llama 2, Mistral) lag in quality but enable privacy, customisation, and offline use.

**Hallucination is structural, not fixable by fine-tuning:** Fine-tuning redirects the model's 'dreams' toward a helpful-assistant format but does not ground factual recall. RAG (retrieval into context window) and live browsing are more reliable than parameter memory for factual queries.

**Scaling is powerful but expensive and energy-intensive:** The guaranteed path to better models is more compute + more data; algorithmic progress is a bonus. Cost roughly doubles every ~6–12 months at the frontier.

**Capability expansion = attack surface expansion:** Every new modality or tool integration introduces a new vector for jailbreaks, prompt injection, and side-channel exfiltration. Security must evolve in lockstep with capability, but offence currently leads defence.

**Self-improvement ceiling:** Imitation fine-tuning is bounded by the quality of the best human labeler. Self-improvement via verifiable reward could break this ceiling but is currently confined to narrow domains with checkable outputs (math, code, games).

## See also

Karpathy (2015) 'Unreasonable Effectiveness of Recurrent Neural Networks' — conceptual predecessor using RNNs for the same next-token objective. | InstructGPT paper (OpenAI, Ouyang et al. 2022) — detailed RLHF pipeline and labeling instructions. | Chatbot Arena / LMSYS leaderboard — ELO-based human-preference ranking of LLMs. | AlphaGo (Silver et al., DeepMind) — canonical example of self-improvement via verifiable reward in a closed environment. | Kahneman 'Thinking Fast and Slow' — source of the System 1 / System 2 framework applied to LLM reasoning. | Universal Adversarial Triggers paper (Wallace et al.) — optimised jailbreak suffixes that transfer across prompts. | llama2.c (Karpathy, GitHub) — ~1 000-line C implementation of LLM inference, illustrating the two-file model.
