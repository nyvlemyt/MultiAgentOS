import { NextResponse } from 'next/server';
import { getDb, projects } from '@mas/db';
import { desc } from 'drizzle-orm';
import { createProject, type CreateProjectInput } from '@/lib/projects';
import { type ProjectType } from '@/lib/templates';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PROJECT_TYPES = new Set<ProjectType>(['manga-app', 'bot', 'business-website', 'automation', 'other']);

function isProjectType(v: unknown): v is ProjectType {
  return typeof v === 'string' && PROJECT_TYPES.has(v as ProjectType);
}

export async function GET() {
  const rows = await getDb().select().from(projects).orderBy(desc(projects.lastActiveAt));
  return NextResponse.json({ ok: true, projects: rows });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const path = typeof body.path === 'string' ? body.path.trim() : '';
  if (name === '') return NextResponse.json({ ok: false, error: 'name required' }, { status: 400 });
  if (path === '') return NextResponse.json({ ok: false, error: 'path required' }, { status: 400 });
  if (!isProjectType(body.type)) {
    return NextResponse.json({ ok: false, error: 'valid type required' }, { status: 400 });
  }

  const input: CreateProjectInput = {
    name,
    path,
    type: body.type,
    templateId: typeof body.templateId === 'string' && body.templateId ? body.templateId : undefined,
    autonomy: typeof body.autonomy === 'string' ? (body.autonomy as CreateProjectInput['autonomy']) : undefined,
    mode: typeof body.mode === 'string' ? (body.mode as CreateProjectInput['mode']) : undefined,
    stack: Array.isArray(body.stack) ? body.stack.filter((s): s is string => typeof s === 'string') : undefined,
  };

  const project = await createProject(getDb(), input);
  return NextResponse.json({ ok: true, project }, { status: 201 });
}
