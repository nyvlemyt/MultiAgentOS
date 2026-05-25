import { initLLM } from '@mas/agents';
import { realLLM, mockLLM } from '@mas/core';
import { listDispatchableMissions, executeNextTask } from '@mas/agents';
import { getDb } from '@mas/db';

const TICK_MS = 1500;

let busy = false;

async function tick() {
  if (busy) return;
  busy = true;
  try {
    const dispatchable = await listDispatchableMissions();
    if (dispatchable.length === 0) return;
    for (const m of dispatchable) {
      const res = await executeNextTask(m.id);
      if (res.kind === 'task_done') {
        console.log(`[worker] task done in ${m.id}: ${res.taskId}`);
      } else if (res.kind === 'paused_for_validation') {
        console.log(`[worker] mission ${m.id} paused — task ${res.taskId} needs validation`);
      } else if (res.kind === 'mission_complete') {
        console.log(`[worker] mission ${m.id} complete (validated)`);
      }
    }
  } catch (e) {
    console.error('[worker:tick]', e);
  } finally {
    busy = false;
  }
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    initLLM(realLLM(apiKey));
    console.log('[worker] real LLM initialized (claude API)');
  } else {
    initLLM(mockLLM());
    console.log('[worker] mock LLM active (set ANTHROPIC_API_KEY to use real Claude)');
  }

  console.log('[worker] alive');
  getDb();
  setInterval(() => {
    void tick();
  }, TICK_MS);
}

main().catch((e) => {
  console.error('[worker] fatal', e);
  process.exit(1);
});
