import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';
import { getDb, closeDb, skills } from '@mas/db';
import { scanOrchestratorSkills, writeSummaryCache } from './scanner.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const CACHE_DIR = resolve(REPO_ROOT, 'data', 'skill-cache');

async function main() {
  const metas = scanOrchestratorSkills(REPO_ROOT);
  if (metas.length === 0) {
    console.error('[reindex] No SKILL.md files found. Create .claude/skills/mas-*/SKILL.md first.');
    process.exit(1);
  }

  const db = getDb();

  for (const meta of metas) {
    writeSummaryCache(CACHE_DIR, meta);

    await db
      .insert(skills)
      .values({
        id: meta.id,
        source: 'orchestrator',
        path: meta.path,
        summaryPath: `data/skill-cache/${meta.id}/summary.md`,
        tagsJson: JSON.stringify(meta.tags),
        domain: meta.domain,
        tier: 'pinned',
        autoLoad: true,
      })
      .onConflictDoUpdate({
        target: skills.id,
        set: {
          summaryPath: `data/skill-cache/${meta.id}/summary.md`,
          tagsJson: JSON.stringify(meta.tags),
          domain: meta.domain,
          path: meta.path,
        },
      });

    console.log(`[reindex] ✓ ${meta.id}  domain=${meta.domain}  tags=${meta.tags.join(',')}`);
  }

  closeDb();
  console.log(`[reindex] done — ${metas.length} skills indexed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
