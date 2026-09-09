// packages/memory/src/conveyor/extractors/bin.ts
// Shared binary resolver: absolute path from a fixed allowlist, never a PATH lookup (S4036).
// Lifted out of pdf.ts so the YouTube leaf (yt-dlp) reuses the same hardened resolution.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** Fixed, unwriteable-by-default install dirs — resolve binaries here, never via PATH. */
export const BIN_DIRS = ['/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin'];

/** Resolve a binary to an absolute path from the fixed allowlist; throw if absent (no silent fallback). */
export function resolveBin(name: string): string {
  for (const dir of BIN_DIRS) {
    const abs = join(dir, name);
    if (existsSync(abs)) return abs;
  }
  throw new Error(`required executable not found in ${BIN_DIRS.join(', ')}: ${name}`);
}
