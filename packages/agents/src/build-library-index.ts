import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAgentLibraryIndex } from './library.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');

const metas = buildAgentLibraryIndex(REPO_ROOT);
if (metas.length === 0) {
  console.error('[build-library-index] No fiches found under packages/agents/library/.');
  process.exit(1);
}

const byTier: Record<string, number> = {};
for (const m of metas) byTier[m.tier ?? 'untiered'] = (byTier[m.tier ?? 'untiered'] ?? 0) + 1;

console.log(`[build-library-index] wrote packages/agents/library/index.json — ${metas.length} fiches.`);
console.log('[build-library-index] tiers:', JSON.stringify(byTier));
