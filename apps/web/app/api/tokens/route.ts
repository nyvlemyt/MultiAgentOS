import { NextResponse } from 'next/server';
import { getTokenSnapshot } from '@/lib/tokens';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getTokenSnapshot());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
