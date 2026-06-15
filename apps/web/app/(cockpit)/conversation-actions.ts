'use server';
import { getDb } from '@mas/db';
import { appendExchange } from '@/lib/conversations';
import { managerReply } from '@/lib/manager-script';
import { agentReply } from '@/lib/agent-script';

// Persist a conversation exchange (scripted reply — single seam for a real LLM later).
export async function sendManagerMessage(conversationId: string, text: string, project: string): Promise<void> {
  await appendExchange(getDb(), conversationId, text, managerReply(text, project).text);
}

export async function sendAgentMessage(conversationId: string, text: string, agentId: string): Promise<void> {
  await appendExchange(getDb(), conversationId, text, agentReply(agentId, text));
}
