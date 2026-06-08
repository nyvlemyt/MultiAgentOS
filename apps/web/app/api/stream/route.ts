import type { NextRequest } from 'next/server';
import { getDb, events } from '@mas/db';
import { gt } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const POLL_MS = 1500;

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  const db = getDb();
  let cursor = new Date();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, payload: unknown) => {
        controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`));
      };
      send('hello', { ok: true, at: new Date().toISOString() });
      const interval = setInterval(async () => {
        try {
          const rows = await db
            .select()
            .from(events)
            .where(gt(events.createdAt, cursor))
            .orderBy(events.createdAt)
            .limit(50);
          for (const r of rows) {
            cursor = new Date(Math.max(cursor.getTime(), r.createdAt.getTime()));
            send('event', {
              id: r.id,
              missionId: r.missionId,
              taskId: r.taskId,
              agentId: r.agentId,
              type: r.type,
              tokens: r.tokensIn + r.tokensOut,
              risk: r.risk,
              at: r.createdAt.toISOString(),
              payload: JSON.parse(r.payloadJson),
            });
          }
        } catch (e) {
          send('error', { message: (e as Error).message });
        }
      }, POLL_MS);
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
