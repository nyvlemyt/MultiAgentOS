import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const META_DIR = resolve(__dirname, '../migrations/meta');

interface JournalEntry {
  idx: number;
  tag: string;
}
interface Snapshot {
  id: string;
  prevId: string;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

const journal = readJson<{ entries: JournalEntry[] }>(resolve(META_DIR, '_journal.json'));

/**
 * Guards against the meta-snapshot drift recorded in
 * docs/backlog/drizzle-0006-snapshot-drift.md: every journal entry must own a
 * snapshot file, and the id/prevId chain must be unbroken so `drizzle-kit
 * generate` diffs against the true latest snapshot (not a folded-in earlier one).
 */
describe('drizzle migration meta chain', () => {
  it('has a snapshot file for every journal entry', () => {
    for (const entry of journal.entries) {
      const file = resolve(META_DIR, `${String(entry.idx).padStart(4, '0')}_snapshot.json`);
      expect(() => readJson<Snapshot>(file), `missing snapshot for ${entry.tag}`).not.toThrow();
    }
  });

  it('links each snapshot prevId to the previous snapshot id (unbroken chain)', () => {
    const ordered = [...journal.entries].sort((a, b) => a.idx - b.idx);
    let prevId: string | undefined;
    for (const entry of ordered) {
      const snap = readJson<Snapshot>(
        resolve(META_DIR, `${String(entry.idx).padStart(4, '0')}_snapshot.json`),
      );
      if (prevId !== undefined) {
        expect(snap.prevId, `chain break at ${entry.tag}`).toBe(prevId);
      }
      prevId = snap.id;
    }
  });
});
