import { NextResponse } from 'next/server';
import { runMission, executeNextTask, listDispatchableMissions } from '@mas/agents';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Phase 1: drive the mission to completion inline so the UI sees the run
// even when the external worker isn't running. The worker also picks up
// dispatched missions in parallel; both paths converge on the DB.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const m = await runMission(id);
    // Drive up to 20 steps to bound the inline loop in case of validation
    let last: Awaited<ReturnType<typeof executeNextTask>> = { kind: 'no_runnable' };
    for (let i = 0; i < 20; i++) {
      last = await executeNextTask(id);
      if (last.kind === 'paused_for_validation' || last.kind === 'mission_complete' || last.kind === 'no_runnable') {
        break;
      }
    }
    return NextResponse.json({ ok: true, mission: m, dispatchable: (await listDispatchableMissions()).length, last });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
