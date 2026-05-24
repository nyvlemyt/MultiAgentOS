import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let n = 0;
      const send = (type: string, payload: unknown) => {
        const data = JSON.stringify(payload);
        controller.enqueue(encoder.encode(`event: ${type}\ndata: ${data}\n\n`));
      };
      send('hello', { ok: true, at: new Date().toISOString() });
      const interval = setInterval(() => {
        n += 1;
        send('tick', { id: `web_tick_${n}`, type: 'tick', at: new Date().toISOString() });
      }, 5000);

      const onClose = () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      };
      _req.signal.addEventListener('abort', onClose);
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
