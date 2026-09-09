// packages/memory/src/conveyor/extractors/doctor.ts
// Extraction-binary health check for `pnpm mem:doctor` (retrievalDoctor pattern: loud, actionable,
// never silent). Motivated by the 2026-07-07 incident: brew python 3.14 shipped a broken
// pyexpat/libexpat on Darwin 25.2, so resolveBin('python3') answered but every PDF capture died
// with "No module named markitdown" — a resolvable binary is not a healthy one, hence the probes.
import { execFileSync } from 'node:child_process';
import { resolveBin } from './bin';

/** Probe seam — injected so tests spawn zero child processes (pdf.ts PdfRunner pattern). */
export interface BinProbe {
  /** resolveBin: absolute path from the fixed allowlist; throws when absent. */
  resolve(name: string): string;
  /** Run `bin args…` for its exit code only; throws on non-zero exit. */
  run(bin: string, args: string[]): void;
}

export const realBinProbe: BinProbe = {
  resolve: (name) => resolveBin(name),
  run: (bin, args) => {
    execFileSync(bin, args, { stdio: 'ignore', timeout: 15_000 });
  },
};

export interface ExtractionCheck {
  bin: 'python3' | 'markitdown' | 'pdftotext' | 'yt-dlp';
  ok: boolean;
  detail: string;
  remedy?: string;
}

export interface ExtractionDoctorResult {
  checks: ExtractionCheck[];
  allOk: boolean;
}

const PYTHON_REMEDY =
  'Installer python.org 3.13 (https://www.python.org/downloads/) puis `brew unlink python@3.14` ' +
  '— le python3 brew 3.14 casse pyexpat/libexpat sur Darwin 25.2 (incident 2026-07-07).';

function probePython3(probe: BinProbe): { check: ExtractionCheck; path?: string } {
  let path: string;
  try {
    path = probe.resolve('python3');
  } catch {
    return {
      check: {
        bin: 'python3',
        ok: false,
        detail: 'python3 introuvable dans les BIN_DIRS (allowlist fixe, jamais PATH)',
        remedy: PYTHON_REMEDY,
      },
    };
  }
  try {
    probe.run(path, ['-c', 'import pyexpat']);
  } catch {
    return {
      check: {
        bin: 'python3',
        ok: false,
        detail: `${path} répond mais \`import pyexpat\` échoue (libexpat cassée)`,
        remedy: PYTHON_REMEDY,
      },
      path,
    };
  }
  return { check: { bin: 'python3', ok: true, detail: `${path} — pyexpat ok` }, path };
}

function probeMarkitdown(probe: BinProbe, python: { check: ExtractionCheck; path?: string }): ExtractionCheck {
  if (!python.check.ok) {
    return {
      bin: 'markitdown',
      ok: false,
      detail: python.path
        ? 'invérifiable : le python3 résolu est cassé (pyexpat)'
        : 'invérifiable : python3 absent (markitdown tourne via `python3 -m markitdown`)',
      remedy: 'Réparer python3 d’abord (remède ci-dessus), puis relancer mem:doctor.',
    };
  }
  try {
    probe.run(python.path as string, ['-m', 'markitdown', '--version']);
  } catch {
    return {
      bin: 'markitdown',
      ok: false,
      detail: `\`${python.path} -m markitdown --version\` échoue (module absent de ce python)`,
      remedy: `\`${python.path} -m pip install markitdown\` (installer dans LE python résolu par l’allowlist, pas un autre).`,
    };
  }
  return { bin: 'markitdown', ok: true, detail: `\`${python.path} -m markitdown --version\` ok` };
}

function probePresence(
  probe: BinProbe,
  bin: 'pdftotext' | 'yt-dlp',
  remedy: string,
  role: string,
): ExtractionCheck {
  try {
    const path = probe.resolve(bin);
    return { bin, ok: true, detail: `${path} présent` };
  } catch {
    return { bin, ok: false, detail: `${bin} introuvable dans les BIN_DIRS — ${role}`, remedy };
  }
}

/** Health-check the four capture-critical extraction binaries. Pure given the probe seam. */
export function extractionDoctor(probe: BinProbe): ExtractionDoctorResult {
  const python = probePython3(probe);
  const checks: ExtractionCheck[] = [
    python.check,
    probeMarkitdown(probe, python),
    probePresence(probe, 'pdftotext', '`brew install poppler`', 'cross-check PDF impossible'),
    probePresence(probe, 'yt-dlp', '`brew install yt-dlp`', 'capture YouTube impossible'),
  ];
  return { checks, allOk: checks.every((c) => c.ok) };
}

/** One actionable line per binary — never an empty report. */
export function formatExtractionDoctorReport(result: ExtractionDoctorResult): string[] {
  return result.checks.map((c) =>
    c.ok
      ? `capture-bin ${c.bin}=ok (${c.detail})`
      : `capture-bin ${c.bin}=MANQUANT/CASSÉ — ${c.detail}. Remède : ${c.remedy ?? 'voir docs/workflows/'}`,
  );
}
