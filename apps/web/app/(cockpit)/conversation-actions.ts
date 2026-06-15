'use server';
import { redirect } from 'next/navigation';
import { getDb } from '@mas/db';
import { appendExchange, createConversation } from '@/lib/conversations';
import { managerReply } from '@/lib/manager-script';
import { agentReply } from '@/lib/agent-script';

// Persist a conversation exchange (scripted reply — single seam for a real LLM later).
export async function sendManagerMessage(conversationId: string, text: string, project: string): Promise<void> {
  await appendExchange(getDb(), conversationId, text, managerReply(text, project).text);
}

export async function sendAgentMessage(conversationId: string, text: string, agentId: string): Promise<void> {
  await appendExchange(getDb(), conversationId, text, agentReply(agentId, text));
}

// Start a fresh thread (like a new Claude Code session) and open it.
export async function newManagerConversation(): Promise<void> {
  const c = await createConversation(getDb(), 'manager');
  redirect(`/?c=${c.id}`);
}

export async function newAgentConversation(slug: string, projectId: string, agentId: string): Promise<void> {
  const c = await createConversation(getDb(), 'agent', projectId, agentId);
  redirect(`/projects/${slug}/agents/${agentId}?c=${c.id}`);
}
