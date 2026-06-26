import { describe, it, expect } from 'vitest';
import { basename, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTierAFiches } from './registry';
import { parseVerdict } from './reviewers';

// Bloc C · dim 3 — the agent eval-harness. The 22-agent audit that found seven
// stub fiche bodies was done by hand; nothing in code locked the §12 body bar, so
// a fiche could silently regress to a stub again. This is that lock: it asserts
// every Tier A fiche carries the four §12-mandated body sections (CLAUDE.md §12.4),
// grounds its Principles in a source, carries the §11 quota-not-cash Red Flag, and
// keeps its `## Verdict` vocabulary parseable by parseVerdict.

const FICHES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../fiches');
const fiches = loadTierAFiches(FICHES_DIR);

// The four §12-mandated H2 sections (CLAUDE.md §12.4, mirrored on the gold-standard
// agent-evaluator.md). `## Verification Criteria` is a prefix of the literal
// `## Verification Criteria (binary)` heading — substring match is intended.
const REQUIRED_SECTIONS = ['## Principles', '## Process', '## Red Flags', '## Verification Criteria'];

// Verdict tokens parseVerdict (reviewers.ts VERDICT_RE) recognises. A `## Verdict`
// menu line in any fiche must stay within this set or the 0b review loop fails open.
const VALID_VERDICTS = new Set(['PASS', 'NEEDS_WORK', 'NEEDS_CHANGES', 'BLOCK']);

/** Text from `heading` up to the next H2 (or end of body). */
function sectionBody(body: string, heading: string): string {
  const start = body.indexOf(heading);
  if (start === -1) return '';
  const after = body.slice(start + heading.length);
  const next = after.search(/\n## /);
  return next === -1 ? after : after.slice(0, next);
}

/** The pipe-separated token line directly under the first `## Verdict` heading. */
function verdictMenuLine(body: string): string | null {
  const idx = body.indexOf('## Verdict');
  if (idx === -1) return null;
  const lines = body.slice(idx).split('\n').slice(1);
  return lines.find((l) => l.trim() !== '') ?? null;
}

describe('Tier A fiche body quality (Bloc C · dim 3 — §12 regression net)', () => {
  it('locks every shipped fiche under the harness (no fiche escapes the bar)', () => {
    expect(fiches.length).toBeGreaterThanOrEqual(9);
  });

  for (const f of fiches) {
    describe(basename(f.fichePath), () => {
      for (const section of REQUIRED_SECTIONS) {
        it(`carries a "${section}" section`, () => {
          expect(f.body).toContain(section);
        });
      }

      it('grounds its Principles in a cited source (// pattern from …)', () => {
        const principles = sectionBody(f.body, '## Principles');
        expect(principles).toMatch(/pattern from/i);
      });

      it('cites a docs/knowledge/ source somewhere in the body (§12.4)', () => {
        expect(f.body).toMatch(/docs\/knowledge\//);
      });

      it('carries the §11 quota-not-cash Red Flag', () => {
        const redFlags = sectionBody(f.body, '## Red Flags');
        expect(redFlags).toMatch(/quota units, never (cash|money)/i);
      });

      it('expresses Verification Criteria as binary [ ] checkboxes', () => {
        const vc = sectionBody(f.body, '## Verification Criteria');
        expect(vc).toMatch(/- \[ \]/);
      });
    });
  }
});

describe('Verdict vocabulary stays parseable (Bloc C · dim 3)', () => {
  const withVerdict = fiches.filter((f) => f.body.includes('## Verdict'));

  it('at least the four critic fiches expose a Verdict block', () => {
    // reviewer, sec-reviewer, quality-controller, agent-evaluator emit a verdict.
    expect(withVerdict.length).toBeGreaterThanOrEqual(4);
  });

  for (const f of withVerdict) {
    it(`${basename(f.fichePath)}: every Verdict token maps through parseVerdict`, () => {
      const menu = verdictMenuLine(f.body);
      expect(menu).not.toBeNull();
      const tokens = (menu ?? '').split('|').map((t) => t.trim()).filter(Boolean);
      expect(tokens.length).toBeGreaterThan(0);
      for (const token of tokens) {
        expect(VALID_VERDICTS.has(token)).toBe(true);
      }
      // And the canonical first token survives a real parse (not the fail-safe).
      const parsed = parseVerdict('t', `## Verdict\n${tokens[0]}\n\n## Findings\n- [info] x`);
      expect(parsed.findings[0]?.message).not.toMatch(/could not parse/);
    });
  }
});
