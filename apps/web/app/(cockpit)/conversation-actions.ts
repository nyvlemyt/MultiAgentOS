'use server';
import { getDb } from '@mas/db';
import { appendExchange } from '@/lib/conversations';
import { managerReply } from '@/lib/manager-script';

// Persist a Manager exchange (scripted reply — single seam for a real LLM later).
export async function sendManagerMessage(conversationId: string, text: string, project: string): Promise<void> {
  const reply = managerReply(text, project);
  await appendExchange(getDb(), conversationId, text, reply.text);
}
