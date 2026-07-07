import { describe, it, expect } from 'vitest';
import { extractionDoctor, formatExtractionDoctorReport, type BinProbe } from './doctor';

/** Probe where everything is installed and healthy. */
function healthyProbe(overrides: Partial<BinProbe> = {}): BinProbe {
  return {
    resolve: (name) => `/opt/homebrew/bin/${name}`,
    run: () => {},
    ...overrides,
  };
}

function check(result: ReturnType<typeof extractionDoctor>, bin: string) {
  const c = result.checks.find((x) => x.bin === bin);
  if (!c) throw new Error(`no check for ${bin}`);
  return c;
}

describe('extractionDoctor', () => {
  it('reports all four extraction binaries healthy when every probe passes', () => {
    const result = extractionDoctor(healthyProbe());
    expect(result.checks.map((c) => c.bin)).toEqual(['python3', 'markitdown', 'pdftotext', 'yt-dlp']);
    expect(result.checks.every((c) => c.ok)).toBe(true);
    expect(result.allOk).toBe(true);
  });

  it('flags python3 absent with an install remedy and marks markitdown unusable', () => {
    const result = extractionDoctor(
      healthyProbe({
        resolve: (name) => {
          if (name === 'python3') throw new Error('required executable not found: python3');
          return `/opt/homebrew/bin/${name}`;
        },
      }),
    );
    const py = check(result, 'python3');
    expect(py.ok).toBe(false);
    expect(py.remedy).toMatch(/python\.org/);
    const mk = check(result, 'markitdown');
    expect(mk.ok).toBe(false);
    expect(mk.detail).toMatch(/python3/);
    expect(result.allOk).toBe(false);
  });

  it('flags a python3 whose pyexpat import fails (brew 3.14 libexpat incident) with the unlink remedy', () => {
    const result = extractionDoctor(
      healthyProbe({
        run: (_bin, args) => {
          if (args.includes('import pyexpat')) throw new Error('ImportError');
        },
      }),
    );
    const py = check(result, 'python3');
    expect(py.ok).toBe(false);
    expect(py.detail).toMatch(/pyexpat/);
    expect(py.remedy).toMatch(/python\.org/);
    expect(py.remedy).toMatch(/brew unlink/);
    // a broken interpreter cannot vouch for markitdown either
    expect(check(result, 'markitdown').ok).toBe(false);
    expect(result.allOk).toBe(false);
  });

  it('flags markitdown module missing with a pip install remedy', () => {
    const result = extractionDoctor(
      healthyProbe({
        run: (_bin, args) => {
          if (args.includes('markitdown')) throw new Error('No module named markitdown');
        },
      }),
    );
    const mk = check(result, 'markitdown');
    expect(mk.ok).toBe(false);
    expect(mk.remedy).toMatch(/pip install markitdown/);
    expect(check(result, 'python3').ok).toBe(true);
    expect(result.allOk).toBe(false);
  });

  it('flags yt-dlp absent with a brew remedy', () => {
    const result = extractionDoctor(
      healthyProbe({
        resolve: (name) => {
          if (name === 'yt-dlp') throw new Error('not found');
          return `/opt/homebrew/bin/${name}`;
        },
      }),
    );
    const yt = check(result, 'yt-dlp');
    expect(yt.ok).toBe(false);
    expect(yt.remedy).toMatch(/brew install yt-dlp/);
    expect(result.allOk).toBe(false);
  });

  it('flags pdftotext absent with the poppler remedy', () => {
    const result = extractionDoctor(
      healthyProbe({
        resolve: (name) => {
          if (name === 'pdftotext') throw new Error('not found');
          return `/opt/homebrew/bin/${name}`;
        },
      }),
    );
    const pt = check(result, 'pdftotext');
    expect(pt.ok).toBe(false);
    expect(pt.remedy).toMatch(/brew install poppler/);
    expect(result.allOk).toBe(false);
  });
});

describe('formatExtractionDoctorReport', () => {
  it('emits one line per binary and is never empty', () => {
    const lines = formatExtractionDoctorReport(extractionDoctor(healthyProbe()));
    expect(lines).toHaveLength(4);
    for (const line of lines) expect(line).toMatch(/ok/);
  });

  it('failure lines name the binary and carry the remedy', () => {
    const lines = formatExtractionDoctorReport(
      extractionDoctor(
        healthyProbe({
          resolve: (name) => {
            if (name === 'yt-dlp') throw new Error('not found');
            return `/opt/homebrew/bin/${name}`;
          },
        }),
      ),
    );
    const ytLine = lines.find((l) => l.includes('yt-dlp'));
    expect(ytLine).toMatch(/MANQUANT|absent/i);
    expect(ytLine).toMatch(/brew install yt-dlp/);
  });
});
