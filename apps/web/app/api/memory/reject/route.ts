import { NextResponse } from 'next/server';
import { getDb, memoryCandidates } from '@mas/db';
import { eq } from 'drizzle-orm';

// Reject / retire a pending candidate. Status-only mutation on the SQLite
// inbox — never touches data/memory/, so no Keeper identity is needed.
export async function POST(req: Request) {
  const form = await req.formData();
  const id = form.get('id') as string;
  if (id) {
    await getDb()
      .update(memoryCandidates)
      .set({ status: 'rejected' })
      .where(eq(memoryCandidates.id, id));
  }
  return NextResponse.redirect(new URL('/memory', req.url), 303);
}
