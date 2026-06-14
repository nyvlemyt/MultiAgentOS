import { NextResponse } from 'next/server';
import { getDb } from '@mas/db';
import { setProjectLanguage, isProjectLanguage } from '@/lib/projects';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { language?: string };
  if (!isProjectLanguage(body.language)) {
    return NextResponse.json({ ok: false, error: 'invalid language' }, { status: 400 });
  }
  const project = await setProjectLanguage(getDb(), id, body.language);
  if (!project) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, project });
}
