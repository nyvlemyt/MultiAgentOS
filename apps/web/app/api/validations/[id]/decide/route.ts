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

  try {
    await resumeAfterValidation(v.taskId, approved);
    if (approved) {
      // continue the mission inline
      const taskRow = await db.select().from(validations).where(eq(validations.id, id));
      const missionId = taskRow[0]?.taskId
        ? (await db.query.tasks.findFirst({ where: (t, { eq }) => eq(t.id, taskRow[0]!.taskId) }))?.missionId
        : undefined;
      if (missionId) {
        for (let i = 0; i < 20; i++) {
          const r = await executeNextTask(missionId);
          if (r.kind !== 'task_done') break;
        }
      }
    }
    return NextResponse.json({ ok: true, approved });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
