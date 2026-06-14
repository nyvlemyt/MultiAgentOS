import { describe, it, expect } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getDb, projects, projectLinks, memoryCandidates } from '@mas/db';
import { setupTempDb } from '@mas/db/testing';
import { eq } from 'drizzle-orm';
import { createProject, slugify } from './projects';
import { getTemplate } from './templates';

setupTempDb();

const A_PATH = join(tmpdir(), 'demo');

describe('slugify', () => {
  it('lowercases, strips accents/punct and joins with hyphens', () => {
    expect(slugify('OtakuGO_UP!')).toBe('otakugo-up');
    expect(slugify('  Café  Déjà ')).toBe('cafe-deja');
  });
});

describe('createProject', () => {
  it('inserts a project with the slugified name and bare input', async () => {
    const p = await createProject(getDb(), { name: 'My Site', path: A_PATH, type: 'other' });
    expect(p.slug).toBe('my-site');
    expect(p.name).toBe('My Site');
    expect(p.type).toBe('other');
    const rows = await getDb().select().from(projects);
    expect(rows).toHaveLength(1);
  });

  it('appends a numeric suffix on slug collision', async () => {
    const a = await createProject(getDb(), { name: 'Audit', path: A_PATH, type: 'other' });
    const b = await createProject(getDb(), { name: 'Audit', path: A_PATH, type: 'other' });
    const c = await createProject(getDb(), { name: 'Audit', path: A_PATH, type: 'other' });
    expect(a.slug).toBe('audit');
    expect(b.slug).toBe('audit-2');
    expect(c.slug).toBe('audit-3');
  });

  it('applies template defaults (type, autonomy floor, mode, model, stack)', async () => {
    const tpl = getTemplate('business-website')!;
    const p = await createProject(getDb(), {
      name: 'Website audit',
      path: A_PATH,
      type: 'other',
      templateId: 'business-website',
    });
    expect(p.type).toBe('business-website');
    expect(p.autonomy).toBe(tpl.autonomyFloor);
    expect(p.defaultMode).toBe(tpl.defaultMode);
    expect(p.defaultModel).toBe(tpl.defaultModel);
    expect(JSON.parse(p.stackJson)).toEqual(tpl.stack);
  });

  it('inserts project_links (skill + agent) and pending memory_candidates from a template', async () => {
    const tpl = getTemplate('manga-app')!;
    const p = await createProject(getDb(), {
      name: 'Manga',
      path: A_PATH,
      type: 'manga-app',
      templateId: 'manga-app',
    });
    const links = await getDb().select().from(projectLinks).where(eq(projectLinks.projectId, p.id));
    const skillLinks = links.filter((l) => l.kind === 'skill');
    const agentLinks = links.filter((l) => l.kind === 'agent');
    const byName = (a: string, b: string) => a.localeCompare(b);
    expect(skillLinks.map((l) => l.refId).sort(byName)).toEqual([...tpl.skillPolicy].sort(byName));
    expect(agentLinks.map((l) => l.refId).sort(byName)).toEqual([...tpl.tierARoster].sort(byName));

    const cands = await getDb().select().from(memoryCandidates);
    expect(cands).toHaveLength(tpl.seedMemory.length);
    expect(cands.every((c) => c.status === 'pending')).toBe(true);
  });

  it('creates no links or candidates without a template', async () => {
    await createProject(getDb(), { name: 'Bare', path: A_PATH, type: 'other' });
    expect(await getDb().select().from(projectLinks)).toHaveLength(0);
    expect(await getDb().select().from(memoryCandidates)).toHaveLength(0);
  });

  it('lets explicit autonomy/mode/stack override template defaults', async () => {
    const p = await createProject(getDb(), {
      name: 'Override',
      path: A_PATH,
      type: 'other',
      templateId: 'manga-app',
      autonomy: 'manual',
      mode: 'expert',
      stack: ['svelte'],
    });
    expect(p.autonomy).toBe('manual');
    expect(p.defaultMode).toBe('expert');
    expect(JSON.parse(p.stackJson)).toEqual(['svelte']);
  });
});
