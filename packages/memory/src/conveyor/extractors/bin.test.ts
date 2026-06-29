import { describe, it, expect } from 'vitest';
import { resolveBin, BIN_DIRS } from './bin';

describe('resolveBin', () => {
  it('exposes a fixed absolute-path allowlist (no PATH lookup)', () => {
    expect(BIN_DIRS.every((d) => d.startsWith('/'))).toBe(true);
  });

  it('throws a clear error when a binary is absent from every BIN_DIR', () => {
    expect(() => resolveBin('definitely-not-a-real-binary-xyz')).toThrow(/not found/);
  });
});
