import { randomUUID } from 'node:crypto';
import { and, asc, desc, eq } from 'drizzle-orm';
import { getDb, conversations, messages, type Conversation, type Message } from '@mas/db';

type Db = ReturnType<typeof getDb>;
type Role = 'user' | 'agent';
type Scope = 'manager' | 'agent';

function scopeWhere(scope: Scope, projectId: string | null, agentId: string | null) {
  if (scope === 'agent') {
    return and(eq(conversations.scope, 'agent'), eq(conversations.projectId, projectId!), eq(conversations.agentId, agentId!));
  }
  return eq(conversations.scope, 'manager');
}

export async function createConversation(db: Db, scope: Scope, projectId: string | null = null, agentId: string | null = null, now: Date = new Date()): Promise<Conversation> {
  const [row] = await db
    .insert(conversations)
    .values({ id: `conv_${randomUUID()}`, scope, projectId, agentId, title: '', createdAt: now, updatedAt: now })
    .returning();
  return row!;
}

export async function listConversations(db: Db, scope: Scope, projectId: string | null = null, agentId: string | null = null): Promise<Conversation[]> {
  return db.select().from(conversations).where(scopeWhere(scope, projectId, agentId)).orderBy(desc(conversations.updatedAt));
}

export async function getConversation(db: Db, id: string): Promise<Conversation | undefined> {
  const [row] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return row;
}

// Ensure at least one conversation exists for the scope; return the most recent.
export async function ensureConversation(db: Db, scope: Scope, projectId: string | null = null, agentId: string | null = null, now: Date = new Date()): Promise<Conversation> {
  const [latest] = await db.select().from(conversations).where(scopeWhere(scope, projectId, agentId)).orderBy(desc(conversations.updatedAt)).limit(1);
  if (latest) return latest;
  return createConversation(db, scope, projectId, agentId, now);
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

// Persist a user turn + the (scripted) agent turn. Names the thread from the
// first user message (like Claude Code naming a session).
export async function appendExchange(db: Db, conversationId: string, userText: string, agentText: string, now: Date = new Date()): Promise<void> {
  await appendMessage(db, conversationId, 'user', userText, now);
  await appendMessage(db, conversationId, 'agent', agentText, new Date(now.getTime() + 1));
  await db
    .update(conversations)
    .set({ title: userText.slice(0, 48) })
    .where(and(eq(conversations.id, conversationId), eq(conversations.title, '')));
}
