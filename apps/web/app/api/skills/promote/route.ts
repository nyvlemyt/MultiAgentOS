import { NextResponse } from 'next/server';
import { getDb, skills } from '@mas/db';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const form = await req.formData();
  const id = form.get('id') as string;
  if (!id) return NextResponse.redirect(new URL('/skills', req.url), 303);
  const db = getDb();
  await db.update(skills).set({ tier: 'pinned' }).where(eq(skills.id, id));
  return NextResponse.redirect(new URL('/skills', req.url), 303);
}
