import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLibraryIndex } from './scanner.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');

const metas = buildLibraryIndex(REPO_ROOT);
if (metas.length === 0) {
  console.error('[build-library-index] No SKILL.md found under packages/skills/library/.');
  process.exit(1);
}

const byDomain: Record<string, number> = {};
for (const m of metas) byDomain[m.domain] = (byDomain[m.domain] ?? 0) + 1;

console.log(`[build-library-index] wrote packages/skills/library/index.json — ${metas.length} skills.`);
console.log('[build-library-index] domains:', JSON.stringify(byDomain));
