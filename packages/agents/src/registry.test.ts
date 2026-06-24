import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateFiche, loadTierAFiches } from './registry';

const FICHES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../fiches');

// A schema-complete frontmatter object (AGENTS.md §2). Each test mutates a copy.
function completeFiche(): Record<string, unknown> {
  return {
    id: 'x',
    name: 'X',
    tier: 'A',
    role: 'do a thing',
    domains: ['all'],
    responsibilities: ['r'],
    limits: ['l'],
    favorite_skills: ['s'],
    required_skills: ['superpowers:using-superpowers'],
    permissions: { fs_write: false, shell: false, network: false },
    budget: { default_tokens: 1000, model: 'claude-haiku-4-5' },
    quality_criteria: ['q'],
    output_format: 'json',
    common_mistakes: ['m'],
    escalate_when: ['e'],
  };
}

const tmpDirs: string[] = [];
afterEach(() => {
  for (const d of tmpDirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

describe('validateFiche (Phase 9 · 0c, finding U3)', () => {
  it('returns no errors for a schema-complete fiche', () => {
    expect(validateFiche(completeFiche())).toEqual([]);
  });

  it('flags a missing escalate_when (the §10 guarantee)', () => {
    const f = completeFiche();
    delete f.escalate_when;
    expect(validateFiche(f)).toContain('escalate_when');
  });

  it('flags an empty array key (U1: a mandatory key silently empty)', () => {
    const f = completeFiche();
    f.limits = [];
    expect(validateFiche(f)).toContain('limits');
  });

  it('flags a non-object permissions and an empty string role', () => {
    const f = completeFiche();
    f.permissions = 'nope';
    f.role = '   ';
    const errs = validateFiche(f);
    expect(errs).toContain('permissions');
    expect(errs).toContain('role');
  });

  it('flags a permissions object missing or mistyping a sub-key (0c hardening)', () => {
    // A permissions object that is present but omits a §5-gating sub-key.
    const missingSub = completeFiche();
    missingSub.permissions = { fs_write: false, shell: false }; // network omitted
    expect(validateFiche(missingSub)).toContain('permissions.network');

    // A sub-key present but not string|boolean is equally unusable by the gate.
    const mistyped = completeFiche();
    mistyped.permissions = { fs_write: false, shell: false, network: 3 };
    expect(validateFiche(mistyped)).toContain('permissions.network');
  });
});

describe('loadTierAFiches', () => {
  it('loads every shipped Tier A fiche with zero validation errors', () => {
    const fiches = loadTierAFiches(FICHES_DIR);
    // 9 shipped fiches (AGENTS.md §3) — regression guard on the roster count.
    expect(fiches).toHaveLength(9);
    const ids = fiches.map((f) => f.id).sort();
    expect(ids).toContain('agent-evaluator');
    expect(ids).toContain('orchestrator');
    // Every shipped fiche passes the §2 schema (no silent drift).
    for (const f of fiches) {
      expect(validateFiche({ ...f })).toEqual([]);
    }
  });

  it('throws when a fiche is missing a mandatory key', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mas-fiche-'));
    tmpDirs.push(dir);
    // escalate_when omitted on purpose.
    writeFileSync(
      join(dir, 'broken.md'),
      ['---', 'id: broken', 'name: Broken', 'tier: A', 'role: x', '---', '# Broken'].join('\n'),
      'utf-8',
    );
    expect(() => loadTierAFiches(dir)).toThrow(/escalate_when/);
  });
});
