import { readdirSync, readFileSync, statSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, relative, extname, join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';
import { getDb, contextPacks, projects, type Project } from '@mas/db';

const INCLUDE_EXTS = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.prisma', '.yaml', '.yml']);
const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.turbo', 'coverage', '.cache', 'data']);
const MAX_DEPTH = 4;
const MAX_FILES = 80;
const MAX_PACK_CHARS = 14_000; // ~3.5k tokens

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

function collectFiles(dir: string, depth = 0, acc: string[] = []): string[] {
  if (depth > MAX_DEPTH || acc.length >= MAX_FILES) return acc;
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const entry of entries.sort()) {
    if (acc.length >= MAX_FILES) break;
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry)) collectFiles(full, depth + 1, acc);
    } else if (INCLUDE_EXTS.has(extname(entry))) {
      acc.push(full);
    }
  }
  return acc;
}

function readSnippet(path: string, maxChars = 400): string {
  try {
    const content = readFileSync(path, 'utf-8').trim();
    return content.length <= maxChars ? content : content.slice(0, maxChars) + '\n[truncated]';
  } catch {
    return '[unreadable]';
  }
}

export async function buildContextPack(projectIdOrProject: string | Project): Promise<string> {
  const db = getDb();
  let project: Project;
  if (typeof projectIdOrProject === 'string') {
    const [p] = await db.select().from(projects).where(eq(projects.id, projectIdOrProject));
    if (!p) throw new Error(`project ${projectIdOrProject} not found`);
    project = p;
  } else {
    project = projectIdOrProject;
  }

  if (!existsSync(project.path)) {
    throw new Error(`project path does not exist: ${project.path}`);
  }

  const files = collectFiles(project.path);
  let pack = `# Context pack: ${project.name}\n`;
  pack += `path: ${project.path}\n`;
  pack += `type: ${project.type}\n`;
  pack += `stack: ${(JSON.parse(project.stackJson) as string[]).join(', ')}\n\n`;

  // package.json
  const pkgPath = join(project.path, 'package.json');
  if (existsSync(pkgPath)) {
    pack += `## package.json\n\`\`\`json\n${readSnippet(pkgPath, 600)}\n\`\`\`\n\n`;
  }

  // README (first 30 lines)
  for (const readme of ['README.md', 'readme.md', 'Readme.md']) {
    const rPath = join(project.path, readme);
    if (existsSync(rPath)) {
      const lines = readFileSync(rPath, 'utf-8').split('\n').slice(0, 30).join('\n');
      pack += `## README (first 30 lines)\n${lines}\n\n`;
      break;
    }
  }

  // File tree
  pack += `## File tree (${files.length} files)\n`;
  for (const f of files) {
    if (pack.length > MAX_PACK_CHARS * 0.6) break;
    pack += `- ${relative(project.path, f)}\n`;
  }
  pack += '\n';

  // Key files
  const KEY_FILES = ['tsconfig.json', 'prisma/schema.prisma', 'src/index.ts', 'app/page.tsx'];
  for (const rel of KEY_FILES) {
    const full = join(project.path, rel);
    if (existsSync(full) && pack.length < MAX_PACK_CHARS) {
      pack += `## ${rel}\n\`\`\`\n${readSnippet(full, 500)}\n\`\`\`\n\n`;
    }
  }

  if (pack.length > MAX_PACK_CHARS) {
    pack = pack.slice(0, MAX_PACK_CHARS) + '\n[pack truncated to stay under 4k tokens]';
  }

  // Write to data/context-packs/
  const outDir = resolve(REPO_ROOT, 'data/context-packs');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `${project.id}.md`);
  writeFileSync(outPath, pack, 'utf-8');

  // Upsert contextPacks table
  await db
    .insert(contextPacks)
    .values({
      id: `cp_${randomUUID()}`,
      projectId: project.id,
      version: 1,
      path: outPath,
      generatedAt: new Date(),
      tokenSize: Math.ceil(pack.length / 4),
      fileCount: files.length,
    })
    .onConflictDoNothing();

  return pack;
}
