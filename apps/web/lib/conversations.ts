import { randomUUID } from 'node:crypto';
import { and, asc, eq } from 'drizzle-orm';
import { getDb, conversations, messages, type Conversation, type Message } from '@mas/db';

type Db = ReturnType<typeof getDb>;
type Role = 'user' | 'agent';

export async function getOrCreateManagerConversation(db: Db, now: Date = new Date()): Promise<Conversation> {
  const [existing] = await db.select().from(conversations).where(eq(conversations.scope, 'manager')).limit(1);
  if (existing) return existing;
  const [row] = await db
    .insert(conversations)
    .values({ id: `conv_${randomUUID()}`, scope: 'manager', projectId: null, agentId: null, title: 'Manager', createdAt: now, updatedAt: now })
    .returning();
  return row!;
}

export async function getOrCreateAgentConversation(db: Db, projectId: string, agentId: string, now: Date = new Date()): Promise<Conversation> {
  const [existing] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.scope, 'agent'), eq(conversations.projectId, projectId), eq(conversations.agentId, agentId)))
    .limit(1);
  if (existing) return existing;
  const [row] = await db
    .insert(conversations)
    .values({ id: `conv_${randomUUID()}`, scope: 'agent', projectId, agentId, title: agentId, createdAt: now, updatedAt: now })
    .returning();
  return row!;
}

export async function listMessages(db: Db, conversationId: string): Promise<Message[]> {
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(asc(messages.createdAt));
}

export async function appendMessage(db: Db, conversationId: string, role: Role, text: string, now: Date = new Date()): Promise<Message> {
  const [row] = await db
    .insert(messages)
    .values({ id: `msg_${randomUUID()}`, conversationId, role, text, createdAt: now })
    .returning();
  await db.update(conversations).set({ updatedAt: now }).where(eq(conversations.id, conversationId));
  return row!;
}

// Persist a user turn followed by the (scripted) agent turn in one call.
export async function appendExchange(db: Db, conversationId: string, userText: string, agentText: string, now: Date = new Date()): Promise<void> {
  await appendMessage(db, conversationId, 'user', userText, now);
  await appendMessage(db, conversationId, 'agent', agentText, new Date(now.getTime() + 1));
}
