import { NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import { eq } from 'drizzle-orm';
import { getDb, projects as projectsTable } from '@mas/db';

// Local-first convenience: reveal the project's external path in Finder or open
// it in VS Code. Path comes from the DB project row (not user input) and is
// validated absolute + existing before any exec. macOS `open` / `code`.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { with: target } = (await req.json().catch(() => ({}))) as { with?: string };
  const [project] = await getDb().select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!project) return NextResponse.json({ ok: false, error: 'unknown project' }, { status: 404 });
  if (!isAbsolute(project.path) || !existsSync(project.path)) {
    return NextResponse.json({ ok: false, error: 'path not found on disk' }, { status: 400 });
  }

  const run = (cmd: string, args: string[]) =>
    new Promise<void>((resolve, reject) => execFile(cmd, args, (err) => (err ? reject(err) : resolve())));

  try {
    if (target === 'vscode') await run('open', ['-a', 'Visual Studio Code', project.path]);
    else await run('open', ['-R', project.path]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'launch failed' }, { status: 500 });
  }
}
