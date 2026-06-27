import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

// Tier-1 identity backfill (STRUCTURE.md §5 id/slug, §8 schema_version).
// Stamps ONLY the 6 immutable-identity fields onto legacy docs so each becomes
// a legal relation target. Zero-LLM, additive, idempotent. Tier-2 rich fields
// (kind/register/doc_type/…) are GRANDFATHERED — never stamped mechanically.

type Frontmatter = Record<string, unknown>;

interface StampOpts {
  path: string;
  contentHash: string;
  slug?: string;
}

interface StampResult {
  text: string;
  frontmatter: Frontmatter;
  changed: boolean;
}

// STRUCTURE.md §5 charset rule: lowercase, strip diacritics, [a-z0-9-] only,
// collapse repeats, trim leading/trailing '-'.
function kebab(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// PURE: never mutates `taken`. First-come keeps the bare slug; collisions get -2, -3…
export function allocateSlug(title: string, taken: Set<string>): string {
  const base = kebab(title);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function firstH1(body: string): string | null {
  for (const line of body.split('\n')) {
    const m = /^#\s+(.+)$/.exec(line);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function deriveTitle(data: Frontmatter, content: string, path: string): string {
  const fromData = typeof data.title === 'string' ? data.title : undefined;
  return fromData ?? firstH1(content) ?? basename(path).replace(/\.md$/, '');
}

export function stampIdentity(raw: string, opts: StampOpts): StampResult {
  const parsed = matter(raw);
  const data = parsed.data as Frontmatter;

  const slug = (data.slug as string | undefined) ?? opts.slug ?? kebab(deriveTitle(data, parsed.content, opts.path));
  const identity: Frontmatter = {
    id: data.id ?? slug,
    slug: data.slug ?? slug,
    source_key: data.source_key ?? opts.contentHash,
    lifecycle: data.lifecycle ?? 'active',
    trust: data.trust ?? 'trusted',
    schema_version: data.schema_version ?? '1',
  };

  const changed = Object.keys(identity).some((k) => !(k in data));
  if (!changed) return { text: raw, frontmatter: data, changed: false };

  // Identity keys first (the immutable anchor), then existing keys in order.
  const newData: Frontmatter = { ...identity, ...data };
  return { text: matter.stringify(parsed.content, newData), frontmatter: newData, changed: true };
}

function sha256hex(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function collectMarkdown(root: string, acc: string[]): void {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) collectMarkdown(full, acc);
    else if (entry.isFile() && entry.name.endsWith('.md')) acc.push(full);
  }
}

interface BackfillResult {
  scanned: number;
  changed: number;
  errors: Array<{ path: string; error: string }>;
}

// First pass reserves every existing slug so allocation never collides with one.
function reserveExistingSlugs(files: string[], taken: Set<string>): void {
  for (const file of files) {
    try {
      const slug = matter(readFileSync(file, 'utf8')).data.slug;
      if (typeof slug === 'string' && slug.length > 0) taken.add(slug);
    } catch {
      // Parse errors surface in the main loop where they are recorded.
    }
  }
}

function processFile(file: string, taken: Set<string>, dryRun: boolean, result: BackfillResult): void {
  result.scanned += 1;
  const bytes = readFileSync(file);
  const raw = bytes.toString('utf8');
  const contentHash = `sha256:${sha256hex(bytes)}`;
  const parsed = matter(raw);
  const existingSlug = parsed.data.slug;

  let slug: string;
  if (typeof existingSlug === 'string' && existingSlug.length > 0) {
    slug = existingSlug;
  } else {
    slug = allocateSlug(deriveTitle(parsed.data as Frontmatter, parsed.content, file), taken);
    taken.add(slug);
  }

  const out = stampIdentity(raw, { path: file, contentHash, slug });
  if (out.changed) {
    result.changed += 1;
    if (!dryRun) writeFileSync(file, out.text, 'utf8');
  }
}

export function runBackfill(roots: string[], opts: { dryRun?: boolean } = {}): BackfillResult {
  const dryRun = opts.dryRun ?? false;
  const result: BackfillResult = { scanned: 0, changed: 0, errors: [] };

  const files: string[] = [];
  for (const root of roots) {
    if (existsSync(root) && statSync(root).isDirectory()) collectMarkdown(root, files);
  }
  files.sort();

  const taken = new Set<string>();
  reserveExistingSlugs(files, taken);

  for (const file of files) {
    try {
      processFile(file, taken, dryRun, result);
    } catch (err) {
      result.errors.push({ path: file, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return result;
}

function runCli(): void {
  const dryRun = process.argv.includes('--dry-run');
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
  const roots = ['docs/resources', 'docs/knowledge'].map((r) => resolve(repoRoot, r));
  const { changed, errors } = runBackfill(roots, { dryRun });
  const verb = dryRun ? 'would-change' : 'stamped';
  console.log(`${changed} ${verb}, ${errors.length} errors`);
  for (const e of errors) console.error(`  error ${e.path}: ${e.error}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}
