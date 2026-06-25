import { describe, it, expect } from 'vitest';
import { rrfFuse } from './rrf.js';

describe('rrfFuse — Reciprocal Rank Fusion', () => {
  it('fuses two ranked id-lists into one deterministic order (c=60)', () => {
    // a: [x,y,z]  b: [z,w,x]
    // score(id) = Σ 1/(c+rank), rank 0-based.
    // x: 1/60 + 1/62, y: 1/61, z: 1/62 + 1/60, w: 1/61
    // x==z (both 1/60+1/62) → tie broken by id asc → x before z.
    // y==w (both 1/61) → tie broken by id asc → w before y.
    const fused = rrfFuse([['x', 'y', 'z'], ['z', 'w', 'x']]);
    expect(fused).toEqual(['x', 'z', 'w', 'y']);
  });

  it('dedupes ids appearing in multiple lists', () => {
    const fused = rrfFuse([['a', 'b'], ['a', 'b']]);
    expect(fused).toEqual(['a', 'b']);
    expect(new Set(fused).size).toBe(fused.length);
  });

  it('is deterministic across repeated calls', () => {
    const lists = [['p', 'q', 'r'], ['r', 's', 'p']];
    expect(rrfFuse(lists)).toEqual(rrfFuse(lists));
  });

  it('breaks score ties by id ascending', () => {
    // Single list: each id has a unique rank, so no ties — order preserved.
    expect(rrfFuse([['b', 'a']])).toEqual(['b', 'a']);
    // Two single-element lists at rank 0 → equal score → id asc.
    expect(rrfFuse([['b'], ['a']])).toEqual(['a', 'b']);
  });

  it('handles empty lists and an empty input', () => {
    expect(rrfFuse([])).toEqual([]);
    expect(rrfFuse([[], []])).toEqual([]);
    expect(rrfFuse([[], ['a']])).toEqual(['a']);
  });
});
