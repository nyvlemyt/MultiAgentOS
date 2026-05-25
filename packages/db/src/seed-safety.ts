import { resolve, sep } from 'node:path';

export interface SeedSafetyOptions {
  repoRoot: string;
  allowOverride: boolean;
  nodeEnv?: string;
}

export function assertSafeToWipe(dbPath: string, opts: SeedSafetyOptions) {
  if (opts.nodeEnv === 'production') {
    throw new Error(
      '[seed] refusing to run in NODE_ENV=production. ' +
        'This seed wipes every app-owned table. Set NODE_ENV=development or run against a dev DB.',
    );
  }

  if (opts.allowOverride) return;

  const defaultDb = resolve(opts.repoRoot, 'data/mas.db');
  const testDir = resolve(opts.repoRoot, 'data/test');

  if (dbPath === defaultDb) {
    throw new Error(
      `[seed] refusing to wipe the default dev DB without MAS_ALLOW_DESTRUCTIVE_SEED=true.\n` +
        `  target: ${dbPath}`,
    );
  }

  if (!dbPath.startsWith(testDir + sep)) {
    throw new Error(
      `[seed] refusing to wipe a DB that is not an explicit test DB.\n` +
        `  target  : ${dbPath}\n` +
        `  test dir: ${testDir}\n` +
        `  If this is intentional, set MAS_ALLOW_DESTRUCTIVE_SEED=true.`,
    );
  }
}
