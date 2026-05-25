import { NextResponse } from 'next/server';
import { getDb, validations } from '@mas/db';
import { resumeAfterValidation, executeNextTask } from '@mas/agents';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { approve?: boolean };
  const approved = body.approve === true;

  const db = getDb();
  const [v] = await db.select().from(validations).where(eq(validations.id, id));
  if (!v) return NextResponse.json({ ok: false, error: 'validation not found' }, { status: 404 });

  // Idempotent: if already decided, return without re-applying side effects.
  if (v.status !== 'pending') {
    return NextResponse.json({ ok: true, approved: v.status === 'approved', idempotent: true });
  }

  try {
    const { acted, missionId } = await resumeAfterValidation(v.taskId, approved);
    if (approved && acted && missionId) {
      for (let i = 0; i < 20; i++) {
        const r = await executeNextTask(missionId);
        if (r.kind !== 'task_done') break;
      }
    }
    return NextResponse.json({ ok: true, approved, acted });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
