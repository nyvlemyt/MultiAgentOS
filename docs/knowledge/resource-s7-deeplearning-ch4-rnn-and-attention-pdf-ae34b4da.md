---
id: resource-s7-deeplearning-ch4-rnn-and-attention-pdf-ae34b4da
slug: resource-s7-deeplearning-ch4-rnn-and-attention-pdf-ae34b4da
source_key: 'sha256:ae34b4daed381ce9cd10257435fd3ed06b33c8b76781eea3660b74c5370bc452'
part_of: resource-s7-deeplearning-062b2dc8
order: 3
manifest: null
derived_from: 'sha256:ae34b4daed381ce9cd10257435fd3ed06b33c8b76781eea3660b74c5370bc452'
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
  - RNN
  - LSTM
  - GRU
  - attention
  - seq2seq
  - recurrent-networks
  - deep-learning
  - gates
  - hidden-state
domain: deep learning
---
# S7 - deepLearning — CH4_RNN_and_Attention.pdf

## Thesis

Recurrent architectures process sequential data by maintaining a hidden state across time steps; LSTM and GRU add gating mechanisms to combat the vanishing-gradient / forgetting problem that cripples SimpleRNN on long sequences; attention lets a seq2seq decoder consult all encoder states instead of relying on a single final vector.

## Context

SimpleRNN collapses the entire history into one hidden state hₜ, which means early information is progressively diluted through repeated non-linear transformations. This makes it impractical for long text or time-series. LSTM (Hochreiter & Schmidhuber 1997) introduced a separate cell state cₜ that carries information along a nearly linear path, controlled by explicit gates. GRU (Cho et al. 2014) simplified LSTM by merging hₜ and cₜ into a single hidden state and replacing the three LSTM gates with two. Attention (Bahdanau et al. 2015) addressed the seq2seq bottleneck where all source information had to pass through one final encoder state before decoding.

## Reasoning

**SimpleRNN** — at each step t the network computes hₜ = tanh(W·xₜ + U·hₜ₋₁ + b). Gradients must flow back through every tanh, causing exponential decay (vanishing) or growth (exploding). **LSTM** — introduces cell state cₜ updated via: forget gate fₜ = σ(...), input gate iₜ = σ(...), candidate c̃ₜ = tanh(...), output gate oₜ = σ(...); cₜ = fₜ∘cₜ₋₁ + iₜ∘c̃ₜ; hₜ = oₜ∘tanh(cₜ). Because cₜ is updated additively through the forget/input path, gradients can propagate without repeated squashing. **GRU** — collapses to two gates: update gate zₜ = σ(Wz·xₜ + Uz·hₜ₋₁ + bz); reset gate rₜ = σ(Wr·xₜ + Ur·hₜ₋₁ + br); candidate ĥₜ = tanh(Wh·xₜ + Uh·(rₜ∘hₜ₋₁) + bh); final state hₜ = (1−zₜ)∘hₜ₋₁ + zₜ∘ĥₜ. The update gate zₜ acts as a soft switch: near 0 = keep old memory, near 1 = write new candidate. **Attention** — at each decoder step the mechanism computes alignment scores between the decoder state and every encoder hidden state, derives a softmax weight vector, and forms a context vector as the weighted sum of encoder states. The decoder then attends to whichever source positions are most relevant for the current output token, rather than relying solely on the final encoder state.

## Trade-offs

**model**: SimpleRNN
**best_for**: Short dependencies, quick experiments
**strength**: Fewest parameters, fast
**limitation**: Forgets early inputs; vanishing gradients on long sequences
**model**: LSTM
**best_for**: Long dependencies where explicit memory is critical
**strength**: Separate cell state cₜ shields gradients; very powerful on long text/time-series
**limitation**: ~4× the parameters of a SimpleRNN cell; slower to train
**model**: GRU
**best_for**: Practical recurrent baseline when speed or parameter budget matters
**strength**: Similar performance to LSTM with fewer gates and no separate cₜ
**limitation**: Less explicit memory structure; may underperform LSTM when very long memory is critical
**model**: RNN + Attention
**best_for**: Seq2Seq tasks (translation, summarisation) and alignment tasks
**strength**: Decoder can look back at all encoder states with learned weights; resolves bottleneck
**limitation**: More computation per decoding step; more complex implementation

## See also

- Transformer / self-attention (successor architecture)
- Bidirectional RNN
- Encoder-Decoder (seq2seq) framework
- Vanishing gradient problem
- Bahdanau attention mechanism
