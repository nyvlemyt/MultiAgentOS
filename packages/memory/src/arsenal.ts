import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Arsenal index builder (Phase 9 · 0a renforcée). Emits one small Markdown stub
 * per cold arsenal item — **L1 summary + unified frontmatter only, never the full
 * body** — into a derived, gitignored folder that QMD's `mas-arsenal` collection
 * indexes. This keeps cold skill/agent bodies out of the search index (cost) while
 * making "find the right skill/agent" a semantic query (skill-router candidates).
 *
 * Boundary (PHASE9-0a-UNIFIED-RETRIEVAL §1): QMD searches these stubs; the Skill
 * Router decides what to load; Markdown stays the source of truth. The stubs are
 * derived & rebuildable (principle 1) — regenerate with `pnpm arsenal:build`.
 *
 * A local frontmatter parser is used (not @mas/skills) to keep packages decoupled
 * and this module self-contained/testable — same acyclic-import discipline as
 * retriever.ts. The arsenal spans skills + agents + rules + commands, wider than
 * any single package.
 */

export type ArsenalKind = 'skill' | 'agent' | 'rule' | 'command';

export interface ArsenalStub {
  id: string;
  type: ArsenalKind;
  title: string;
  summary: string;
  tags: string[];
  domain: string;
  source: string;
}

export interface ArsenalBuildResult {
  written: number;
  byType: Record<ArsenalKind, number>;
  outDir: string;
}

/** Parse YAML frontmatter into a flat map (nested keys flattened; flow arrays kept). */
export function parseFrontmatter(raw: string): Record<string, string | string[]> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!match?.[1]) return {};
  const fm: Record<string, string | string[]> = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    if (!key) continue;
    const val = line.slice(colon + 1).trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      fm[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter((s) => s.length > 0);
    } else {
      fm[key] = val.replace(/^["']|["']$/g, '');
    }
  }
  return fm;
}

function fmStr(fm: Record<string, string | string[]>, key: string): string {
  const v = fm[key];
  return typeof v === 'string' ? v : '';
}

function fmArr(fm: Record<string, string | string[]>, key: string): string[] {
  const v = fm[key];
  if (Array.isArray(v)) return v;
  return typeof v === 'string' && v.length > 0 ? [v] : [];
}

/** First non-empty, non-heading, non-comment line of the body — a summary fallback. */
function firstProseLine(body: string): string {
  for (const line of body.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith('<!--') || t.startsWith('---')) continue;
    return t;
  }
  return '';
}

const SUMMARY_MAX = 800; // ~200 token L1 budget (CLAUDE.md §6/§12)

function clip(s: string): string {
  const one = s.replace(/\s+/g, ' ').trim();
  return one.length > SUMMARY_MAX ? `${one.slice(0, SUMMARY_MAX - 1)}…` : one;
}

function bodyAfterFrontmatter(raw: string): string {
  const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(raw);
  return m ? raw.slice(m[0].length) : raw;
}

function slugify(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

/** Map one source file to a stub, or null when it is not an arsenal item. */
function toStub(type: ArsenalKind, absPath: string, repoRoot: string): ArsenalStub | null {
  const raw = readFileSync(absPath, 'utf8');
  const fm = parseFrontmatter(raw);
  const body = bodyAfterFrontmatter(raw);
  const source = relative(repoRoot, absPath).replaceAll('\\', '/');

  let title: string;
  let summary: string;
  let tags: string[];
  let domain: string;
  let id: string;

  switch (type) {
    case 'skill': {
      // packages/skills/library/<slug>/SKILL.md — frontmatter: name, summary, cluster
      const slug = source.split('/').slice(-2, -1)[0] ?? slugify(fmStr(fm, 'name'));
      id = `skill/${slug}`;
      title = fmStr(fm, 'name') || slug;
      summary = clip(fmStr(fm, 'summary') || fmStr(fm, 'description') || firstProseLine(body));
      tags = [fmStr(fm, 'cluster'), fmStr(fm, 'tier')].filter((t) => t.length > 0);
      domain = fmStr(fm, 'cluster') || 'skill';
      break;
    }
    case 'agent': {
      // packages/agents/library/*.md (role) OR .claude/agents/*.md (description)
      const slug = fmStr(fm, 'id') || slugify(fmStr(fm, 'name')) || slugify(baseName(absPath));
      id = `agent/${slug}`;
      title = fmStr(fm, 'name') || slug;
      summary = clip(fmStr(fm, 'role') || fmStr(fm, 'description') || fmStr(fm, 'vibe') || firstProseLine(body));
      tags = fmArr(fm, 'domains');
      domain = fmArr(fm, 'domains')[0] ?? 'agent';
      break;
    }
    case 'rule': {
      // docs/rules/<lang>/<concern>.md — usually no frontmatter
      const parts = source.split('/');
      const lang = parts[parts.length - 2] ?? 'common';
      const concern = baseName(absPath).replace(/\.md$/, '');
      id = `rule/${lang}/${concern}`;
      title = `${lang}: ${concern}`;
      summary = clip(fmStr(fm, 'description') || firstHeadingOrProse(body));
      tags = [lang, concern];
      domain = 'rule';
      break;
    }
    case 'command': {
      // .claude/commands/*.md — frontmatter: description
      const slug = slugify(baseName(absPath).replace(/\.md$/, ''));
      id = `command/${slug}`;
      title = `/${slug}`;
      summary = clip(fmStr(fm, 'description') || firstProseLine(body));
      tags = ['command'];
      domain = 'command';
      break;
    }
  }

  if (!summary) return null; // skip empty shells (READMEs, indexes)
  return { id, type, title, summary, tags, domain, source };
}

function baseName(p: string): string {
  return p.split(/[/\\]/).pop() ?? p;
}

function firstHeadingOrProse(body: string): string {
  const prose = firstProseLine(body);
  if (prose) return prose;
  for (const line of body.split('\n')) {
    const t = line.trim();
    if (t.startsWith('#')) return t.replace(/^#+\s*/, '');
  }
  return '';
}

/** Serialize a stub to unified-frontmatter Markdown (frontmatter + summary body). */
export function serializeStub(s: ArsenalStub): string {
  return [
    '---',
    `id: ${s.id}`,
    `type: ${s.type}`,
    `title: ${JSON.stringify(s.title)}`,
    `summary: ${JSON.stringify(s.summary)}`,
    `tags: [${s.tags.map((t) => JSON.stringify(t)).join(', ')}]`,
    `domain: ${s.domain}`,
    'scope: global',
    `source: ${s.source}`,
    'status: library',
    '---',
    '',
    s.summary,
    '',
  ].join('\n');
}

interface SourceSpec {
  type: ArsenalKind;
  dir: string;
  /** 'skill-dir' = each <slug>/SKILL.md; 'flat' = top-level .md files; 'recursive' = all nested .md. */
  layout: 'skill-dir' | 'flat' | 'recursive';
}

function arsenalSources(repoRoot: string): SourceSpec[] {
  return [
    { type: 'skill', dir: join(repoRoot, 'packages/skills/library'), layout: 'skill-dir' },
    { type: 'agent', dir: join(repoRoot, 'packages/agents/library'), layout: 'flat' },
    { type: 'agent', dir: join(repoRoot, '.claude/agents'), layout: 'flat' },
    { type: 'rule', dir: join(repoRoot, 'docs/rules'), layout: 'recursive' },
    { type: 'command', dir: join(repoRoot, '.claude/commands'), layout: 'flat' },
  ];
}

function walkMd(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkMd(full));
    else if (e.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function filesFor(spec: SourceSpec): string[] {
  if (!existsSync(spec.dir)) return [];
  if (spec.layout === 'skill-dir') {
    return readdirSync(spec.dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => join(spec.dir, e.name, 'SKILL.md'))
      .filter((p) => existsSync(p));
  }
  if (spec.layout === 'flat') {
    return readdirSync(spec.dir)
      .filter((n) => n.endsWith('.md') && n.toLowerCase() !== 'readme.md')
      .map((n) => join(spec.dir, n));
  }
  return walkMd(spec.dir);
}

/**
 * Regenerate the arsenal stub index under `outDir` (default data/arsenal-index).
 * Idempotent: the folder is cleared then rebuilt, so deletions propagate. Stubs are
 * written under `<outDir>/<type>/<slug>.md` and sorted-deterministic.
 */
export function buildArsenalStubs(repoRoot: string, outDir = join(repoRoot, 'data/arsenal-index')): ArsenalBuildResult {
  const stubs: ArsenalStub[] = [];
  for (const spec of arsenalSources(repoRoot)) {
    for (const file of filesFor(spec)) {
      const stub = toStub(spec.type, file, repoRoot);
      if (stub) stubs.push(stub);
    }
  }
  stubs.sort((a, b) => a.id.localeCompare(b.id));

  rmSync(outDir, { recursive: true, force: true });
  const byType: Record<ArsenalKind, number> = { skill: 0, agent: 0, rule: 0, command: 0 };
  for (const stub of stubs) {
    const file = join(outDir, stub.type, `${stub.id.split('/').slice(1).join('__')}.md`);
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, serializeStub(stub), 'utf8');
    byType[stub.type] += 1;
  }
  return { written: stubs.length, byType, outDir };
}
