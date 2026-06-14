import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ProjectType } from './templates';

// Phase 7b. PURE, READ-ONLY detection over a registered project's own files.
// Never writes, never throws — an unreadable/markerless path yields the neutral
// { type: 'other', stack: [] }. Deterministic: tags emit in the table's order,
// never sorted from the raw package.json (CLAUDE.md §7).

export interface DetectedStack {
  readonly type: ProjectType;
  readonly stack: readonly string[];
}

// Ordered dep → tag table. Iterating this (not the input) fixes canonical order
// and avoids a raw .sort(). One literal table, no repeated string literals (S1192).
const DEP_TO_TAG: ReadonlyArray<readonly [string, string]> = [
  ['next', 'Next.js'],
  ['react', 'React'],
  ['vue', 'Vue'],
  ['svelte', 'Svelte'],
  ['@angular/core', 'Angular'],
  ['tailwindcss', 'Tailwind'],
  ['express', 'Express'],
  ['fastify', 'Fastify'],
  ['discord.js', 'Discord.js'],
  ['telegraf', 'Telegraf'],
  ['grammy', 'grammY'],
  ['node-telegram-bot-api', 'Telegram'],
];

const BOT_LIBS = new Set(['discord.js', 'telegraf', 'grammy', 'node-telegram-bot-api']);

const TS_TAG = 'TypeScript';
const PYTHON_TAG = 'Python';

// Marker file → ecosystem tag for non-package.json stacks.
const MARKER_TO_TAG: ReadonlyArray<readonly [string, string]> = [
  ['requirements.txt', PYTHON_TAG],
  ['pyproject.toml', PYTHON_TAG],
  ['Cargo.toml', 'Rust'],
  ['go.mod', 'Go'],
];

const EMPTY: DetectedStack = { type: 'other', stack: [] };

function readDeps(rootPath: string): Set<string> {
  const deps = new Set<string>();
  const pkgPath = join(rootPath, 'package.json');
  if (!existsSync(pkgPath)) return deps;
  try {
    const raw = readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw) as {
      dependencies?: Record<string, unknown>;
      devDependencies?: Record<string, unknown>;
    };
    for (const name of Object.keys(pkg.dependencies ?? {})) deps.add(name);
    for (const name of Object.keys(pkg.devDependencies ?? {})) deps.add(name);
  } catch {
    return deps;
  }
  return deps;
}

export function detectStack(rootPath: string): DetectedStack {
  if (!rootPath || !existsSync(rootPath)) return EMPTY;

  const deps = readDeps(rootPath);
  const stack: string[] = [];

  for (const [dep, tag] of DEP_TO_TAG) {
    if (deps.has(dep)) stack.push(tag);
  }

  if (deps.has('typescript') || existsSync(join(rootPath, 'tsconfig.json'))) {
    stack.push(TS_TAG);
  }

  for (const [marker, tag] of MARKER_TO_TAG) {
    if (!stack.includes(tag) && existsSync(join(rootPath, marker))) stack.push(tag);
  }

  if (stack.length === 0) return EMPTY;

  const isBot = [...deps].some((dep) => BOT_LIBS.has(dep));
  return { type: isBot ? 'bot' : 'other', stack };
}
