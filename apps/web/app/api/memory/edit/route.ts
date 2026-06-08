import { NextResponse } from 'next/server';
import { getDb, memoryCandidates } from '@mas/db';
import { eq } from 'drizzle-orm';

// Edit a pending candidate body before promotion. Inbox-only mutation.
export async function POST(req: Request) {
  const form = await req.formData();
  const id = form.get('id') as string;
  const body = ((form.get('body') as string) ?? '').trim();
  if (id && body) {
    await getDb()
      .update(memoryCandidates)
      .set({ body })
      .where(eq(memoryCandidates.id, id));
  }
  return NextResponse.redirect(new URL('/memory', req.url), 303);
}
