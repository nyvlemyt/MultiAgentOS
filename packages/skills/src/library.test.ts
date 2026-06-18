import { describe, it, expect, beforeAll } from 'vitest';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, rmSync, readFileSync } from 'node:fs';
import {
  scanLibrarySkills,
  buildLibraryIndex,
  loadLibraryIndex,
  clusterToDomain,
} from './scanner.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const INDEX_PATH = resolve(REPO_ROOT, 'packages/skills/library/index.json');

describe('clusterToDomain', () => {
  it('maps known clusters to the fixed 9-domain taxonomy', () => {
    expect(clusterToDomain('skill:core-security')).toBe('security');
    expect(clusterToDomain('skill:core-memory')).toBe('memory');
    expect(clusterToDomain('skill:core-eval')).toBe('code-review');
    expect(clusterToDomain('skill:eng-lang')).toBe('code-execution');
  });

  it('defaults unknown clusters to planning', () => {
    expect(clusterToDomain('skill:does-not-exist')).toBe('planning');
    expect(clusterToDomain(undefined)).toBe('planning');
  });
});

describe('scanLibrarySkills', () => {
  const metas = scanLibrarySkills(REPO_ROOT);

  it('scans the cold library (≥100 boosted skills)', () => {
    expect(metas.length).toBeGreaterThan(100);
  });

  it('parses a known skill with summary, domain, and origin', () => {
    const taste = metas.find((m) => m.id === 'taste');
    expect(taste).toBeDefined();
    expect(taste!.summary.length).toBeGreaterThan(0);
    expect(taste!.summary.length).toBeLessThanOrEqual(800);
    expect(taste!.domain).toBe('research'); // cluster skill:vertical → research
    expect(taste!.origin).toBe('affaan-m/ecc');
    expect(taste!.cluster).toBe('skill:vertical');
    expect(taste!.path).toContain('packages/skills/library/taste/SKILL.md');
  });

  it('tags every skill with its cluster (router findByTags works)', () => {
    const taste = metas.find((m) => m.id === 'taste')!;
    expect(taste.tags).toContain('skill:vertical');
  });
});

describe('buildLibraryIndex + loadLibraryIndex round-trip', () => {
  beforeAll(() => {
    if (existsSync(INDEX_PATH)) rmSync(INDEX_PATH);
    buildLibraryIndex(REPO_ROOT);
  });

  it('writes a parseable index.json', () => {
    expect(existsSync(INDEX_PATH)).toBe(true);
    const parsed = JSON.parse(readFileSync(INDEX_PATH, 'utf8'));
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(100);
  });

  it('loadLibraryIndex reads the file back to the same metas (cheap runtime path)', () => {
    const loaded = loadLibraryIndex(REPO_ROOT);
    const scanned = scanLibrarySkills(REPO_ROOT);
    expect(loaded.length).toBe(scanned.length);
    const taste = loaded.find((m) => m.id === 'taste');
    expect(taste!.domain).toBe('research');
    expect(taste!.summary.length).toBeGreaterThan(0);
  });

  it('index entries carry the L1 summary, never the full body', () => {
    const parsed = JSON.parse(readFileSync(INDEX_PATH, 'utf8'));
    const taste = parsed.find((e: { id: string }) => e.id === 'taste');
    expect(taste.summary).toBeDefined();
    expect(JSON.stringify(taste)).not.toContain('## Prompt Defense Baseline');
  });
});
