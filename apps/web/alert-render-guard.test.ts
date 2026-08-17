import { describe, it, expect, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..');
const script = resolve(repoRoot, 'scripts/lint-alert-render.sh');

let dir: string | undefined;
afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

function fixture(relPath: string, content: string): string {
  dir ??= mkdtempSync(join(tmpdir(), 'mas-alert-guard-'));
  const file = join(dir, 'apps/web', relPath);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, content);
  return dir;
}

function runGuard(root: string, scanRoot = 'apps/web'): { code: number; out: string } {
  try {
    // stderr en `pipe` : les cas de rejet sont attendus, leur sortie appartient
    // à l'assertion, pas au journal de la suite.
    const out = execFileSync('/bin/bash', [script, scanRoot], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, out };
  } catch (e) {
    const err = e as { status: number; stdout?: string; stderr?: string };
    return { code: err.status, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

// Les noms sont assemblés par concaténation : ce fichier de test ne doit jamais
// matcher le portique lui-même s'il est un jour étendu au-delà des .tsx.
const BANNER = 'Foo' + 'Banner';
const BADGE = 'Alert' + 'Badge';
const BUILDER = 'budgetPause' + 'Alert';

describe('lint-alert-render — contournements de déclaration (C12)', () => {
  it('forme 1 — rejette une arrow function exportée', () => {
    const root = fixture('components/Probe.tsx', `export const ${BANNER} = (p) => <div>{p.x}</div>;\n`);
    const r = runGuard(root);
    expect(r.code).toBe(1);
    expect(r.out).toContain('Probe.tsx');
  });

  it('forme 2 — rejette un export default function', () => {
    const root = fixture('components/Probe.tsx', `export default function ${BANNER}(p) { return <div />; }\n`);
    expect(runGuard(root).code).toBe(1);
  });

  it('forme 3 — rejette un re-export depuis un autre module', () => {
    const root = fixture('components/Probe.tsx', `export { ${BANNER} } from './ailleurs';\n`);
    expect(runGuard(root).code).toBe(1);
  });

  it('forme 3 — rejette aussi un nom au milieu de la liste de re-export', () => {
    const root = fixture('components/Probe.tsx', `export { Bar, ${BANNER}, Baz } from './ailleurs';\n`);
    expect(runGuard(root).code).toBe(1);
  });

  it('forme 4 — rejette une signature dont le nom et le "(" sont sur deux lignes', () => {
    const root = fixture('components/Probe.tsx', `export function ${BANNER}\n  (props) {\n  return <div />;\n}\n`);
    expect(runGuard(root).code).toBe(1);
  });

  it('forme 4 — rejette une const dont la flèche est sur la ligne suivante', () => {
    const root = fixture('components/Probe.tsx', `export const ${BANNER} =\n  (props) => <div />;\n`);
    expect(runGuard(root).code).toBe(1);
  });

  it('rejette un export default async function', () => {
    const root = fixture('components/Probe.tsx', `export default async function ${BANNER}(p) { return <div />; }\n`);
    expect(runGuard(root).code).toBe(1);
  });

  it('rejette une classe exportée', () => {
    const root = fixture('components/Probe.tsx', `export default class ${BANNER} extends Component {}\n`);
    expect(runGuard(root).code).toBe(1);
  });

  it('rejette la forme scindée : déclaration locale puis export default du nom', () => {
    const root = fixture('components/Probe.tsx', `function ${BANNER}() { return <div />; }\nexport default ${BANNER};\n`);
    expect(runGuard(root).code).toBe(1);
  });

  it('rejette un badge fait main (le nom doit CONTENIR Alert, pas y finir)', () => {
    const root = fixture('components/Probe.tsx', `export function ${BADGE}(p) { return <span />; }\n`);
    expect(runGuard(root).code).toBe(1);
  });

  it('rejette un composant nommé exactement Alert', () => {
    const root = fixture('components/Probe.tsx', `export const Alert = (p) => <div />;\n`);
    expect(runGuard(root).code).toBe(1);
  });

  it('rejette même si le fichier cite AlertSurface.tsx en commentaire', () => {
    // L'exclusion porte sur le chemin, pas sur la ligne : citer le composant
    // contractuel ne doit pas acheter un laissez-passer.
    const root = fixture('components/Probe.tsx', `// voir components/AlertSurface.tsx\nexport const ${BANNER} = (p) => <div />;\n`);
    expect(runGuard(root).code).toBe(1);
  });
});

describe('lint-alert-render — zéro faux positif (C12)', () => {
  it('laisse passer AlertSurface.tsx, le seul rendu autorisé', () => {
    const root = fixture('components/AlertSurface.tsx', `export function AlertBanner(p) { return <output />; }\nexport function AlertBadge(p) { return <span />; }\n`);
    expect(runGuard(root).code).toBe(0);
  });

  it('laisse passer RiskBadge et les autres composants non-alerte', () => {
    const root = fixture('components/RiskBadge.tsx', `export function RiskBadge(p) { return <span />; }\n`);
    expect(runGuard(root).code).toBe(0);
  });

  it("laisse passer l'import et l'usage JSX du composant contractuel", () => {
    const root = fixture(
      'app/page.tsx',
      `import { AlertBanner } from '@/components/AlertSurface';\nexport function Page() { return <AlertBanner alert={null} />; }\n`,
    );
    expect(runGuard(root).code).toBe(0);
  });

  it('laisse passer les icônes lucide dont le nom contient Alert', () => {
    const root = fixture(
      'components/Probe.tsx',
      `import { Info, OctagonAlert, TriangleAlert } from 'lucide-react';\nexport function Probe() { return <TriangleAlert />; }\n`,
    );
    expect(runGuard(root).code).toBe(0);
  });

  it('laisse passer un constructeur de fait en camelCase (il ne rend rien)', () => {
    const root = fixture('components/Probe.tsx', `export const ${BUILDER} = (n) => ({ what: 'x' });\n`);
    expect(runGuard(root).code).toBe(0);
  });

  it('laisse passer un constructeur de fait re-exporté en camelCase', () => {
    const root = fixture('components/Probe.tsx', `export { ${BUILDER} } from '@/lib/alerts';\n`);
    expect(runGuard(root).code).toBe(0);
  });

  it("passe l'arbre réel du dépôt", () => {
    expect(runGuard(repoRoot).code).toBe(0);
  });

  it('crie au lieu de passer si la racine de scan est introuvable', () => {
    const root = fixture('components/RiskBadge.tsx', 'export function RiskBadge() { return <span />; }\n');
    const r = runGuard(root, 'apps/nope');
    expect(r.code).toBe(2);
    expect(r.out).toContain('introuvable');
  });
});
