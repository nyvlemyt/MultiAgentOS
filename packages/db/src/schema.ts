import { sqliteTable, text, integer, real, primaryKey, index } from 'drizzle-orm/sqlite-core';

const epoch = () => integer({ mode: 'timestamp' }).$defaultFn(() => new Date());

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  path: text('path').notNull(),
  type: text('type', {
    enum: ['manga-app', 'bot', 'business-website', 'automation', 'other'],
  }).notNull(),
  stackJson: text('stack_json').notNull().default('[]'),
  autonomy: text('autonomy', {
    enum: ['manual', 'assisted', 'autonomous', 'autopilot'],
  }).notNull().default('manual'),
  defaultModel: text('default_model').notNull().default('claude-haiku-4-5'),
  defaultMode: text('default_mode', {
    enum: ['eco', 'standard', 'expert'],
  }).notNull().default('eco'),
  language: text('language', {
    enum: ['fr', 'en'],
  }).notNull().default('fr'),
  monthlyBudgetCents: integer('monthly_budget_cents').notNull().default(500),
  sessionId: text('session_id'),
  createdAt: epoch().notNull(),
  lastActiveAt: epoch().notNull(),
});

export const projectLinks = sqliteTable(
  'project_links',
  {
    projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['agent', 'skill'] }).notNull(),
    refId: text('ref_id').notNull(),
    pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
    weight: real('weight').notNull().default(1),
  },
  (t) => ({ pk: primaryKey({ columns: [t.projectId, t.kind, t.refId] }) }),
);

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  tier: text('tier', { enum: ['A', 'B'] }).notNull(),
  fichePath: text('fiche_path').notNull(),
  name: text('name').notNull(),
  emoji: text('emoji'),
  avatarPath: text('avatar_path'),
  model: text('model').notNull().default('claude-haiku-4-5'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  totalRuns: integer('total_runs').notNull().default(0),
  totalTokens: integer('total_tokens').notNull().default(0),
  successRate: real('success_rate').notNull().default(1),
});

export const skills = sqliteTable('skills', {
  id: text('id').primaryKey(),
  source: text('source').notNull(),
  path: text('path').notNull(),
  summaryPath: text('summary_path'),
  tagsJson: text('tags_json').notNull().default('[]'),
  domain: text('domain', {
    enum: ['research', 'code-execution', 'code-review', 'planning', 'memory', 'security', 'ux', 'writing', 'search'],
  }),
  tier: text('tier', { enum: ['pinned', 'project-pinned', 'on-demand', 'methodology'] })
    .notNull()
    .default('on-demand'),
  autoLoad: integer('auto_load', { mode: 'boolean' }).notNull().default(false),
  lastUsedAt: epoch(),
});

export const missions = sqliteTable(
  'missions',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull().references(() => projects.id),
    title: text('title').notNull(),
    objective: text('objective').notNull(),
    status: text('status', {
      enum: [
        'draft',
        'clarified',
        'planned',
        'dispatched',
        'executing',
        'review',
        'validated',
        'archived',
        'blocked',
      ],
    }).notNull().default('draft'),
    risk: text('risk', { enum: ['low', 'medium', 'high', 'blocking'] })
      .notNull()
      .default('low'),
    budgetTokens: integer('budget_tokens').notNull().default(20000),
    spentTokens: integer('spent_tokens').notNull().default(0),
    autonomyOverride: text('autonomy_override'),
    modeOverride: text('mode_override'),
    // Phase 4.5-receptacle: planning fields. All deterministic, no LLM.
    deadline: integer('deadline', { mode: 'timestamp' }),
    milestone: text('milestone'),
    priorityScore: integer('priority_score').notNull().default(0),
    createdAt: epoch().notNull(),
    updatedAt: epoch().notNull(),
  },
  (t) => ({ statusIdx: index('missions_status_idx').on(t.projectId, t.status) }),
);

// Phase 4.5-receptacle: Ideas Inbox. An idea is a pre-mission; on conversion it
// spawns a draft mission and links via ideaIdLink. priorityScore is computed by
// the deterministic scorer (apps/web/lib/prioritize.ts) — never an LLM.
export const ideas = sqliteTable(
  'ideas',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    body: text('body').notNull().default(''),
    scope: text('scope', { enum: ['global', 'project'] }).notNull().default('global'),
    projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    status: text('status', {
      enum: ['inbox', 'to_clarify', 'prioritized', 'converted', 'archived'],
    }).notNull().default('inbox'),
    priorityScore: integer('priority_score').notNull().default(0),
    impact: integer('impact').notNull().default(50),
    urgency: integer('urgency').notNull().default(50),
    effortEst: integer('effort_est').notNull().default(50),
    riskScore: integer('risk_score').notNull().default(0),
    costEstTokens: integer('cost_est_tokens').notNull().default(0),
    sourceDossier: text('source_dossier'),
    // Link to the mission spawned by convert-to-mission (null until converted).
    ideaIdLink: text('idea_id_link').references(() => missions.id),
    createdAt: epoch().notNull(),
    updatedAt: epoch().notNull(),
  },
  (t) => ({ statusIdx: index('ideas_status_idx').on(t.status) }),
);

// Phase 4.5-receptacle: Decision Log. MVP = user-logged manually (source=user).
// The Keeper-proposed-decision path is deferred (no proposeMemory seam yet);
// source enum keeps room for it without a new writer (§8 intact).
export const decisions = sqliteTable('decisions', {
  id: text('id').primaryKey(),
  scope: text('scope', { enum: ['global', 'project'] }).notNull().default('global'),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  source: text('source', { enum: ['user', 'mission', 'validation', 'agent'] }).notNull().default('user'),
  sourceMissionId: text('source_mission_id').references(() => missions.id),
  sourceTaskId: text('source_task_id').references(() => tasks.id),
  title: text('title').notNull(),
  body: text('body').notNull().default(''),
  createdAt: epoch().notNull(),
});

export const tasks = sqliteTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    missionId: text('mission_id').notNull().references(() => missions.id, { onDelete: 'cascade' }),
    parentTaskId: text('parent_task_id'),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    status: text('status', {
      enum: ['todo', 'running', 'done', 'blocked', 'needs_validation'],
    }).notNull().default('todo'),
    risk: text('risk', { enum: ['low', 'medium', 'high', 'blocking'] })
      .notNull()
      .default('low'),
    agentId: text('agent_id').references(() => agents.id),
    skillsJson: text('skills_json').notNull().default('[]'),
    dependsOnJson: text('depends_on_json').notNull().default('[]'),
    budgetTokens: integer('budget_tokens').notNull().default(2000),
    spentTokens: integer('spent_tokens').notNull().default(0),
    outputPath: text('output_path'),
    createdAt: epoch().notNull(),
    updatedAt: epoch().notNull(),
  },
  (t) => ({ missionIdx: index('tasks_mission_status_idx').on(t.missionId, t.status) }),
);

export const events = sqliteTable(
  'events',
  {
    id: text('id').primaryKey(),
    missionId: text('mission_id').references(() => missions.id, { onDelete: 'cascade' }),
    taskId: text('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
    agentId: text('agent_id').references(() => agents.id),
    type: text('type').notNull(),
    payloadJson: text('payload_json').notNull().default('{}'),
    tokensIn: integer('tokens_in').notNull().default(0),
    tokensOut: integer('tokens_out').notNull().default(0),
    cacheRead: integer('cache_read').notNull().default(0),
    cacheCreation: integer('cache_creation').notNull().default(0),
    // Per-event weight (proxy: round(total_cost_usd * 100)).
    // The §8 5-hour window cap reads COUNT(*) on llm_call events, NOT SUM(quota_units).
    // Treat quota_units as a routing/telemetry signal, not as a quota counter.
    quotaUnits: integer('quota_units').notNull().default(0),
    risk: text('risk', { enum: ['low', 'medium', 'high', 'blocking'] }).notNull().default('low'),
    createdAt: epoch().notNull(),
  },
  (t) => ({
    byMission: index('events_mission_idx').on(t.missionId, t.createdAt),
    byAgent: index('events_agent_idx').on(t.agentId, t.createdAt),
  }),
);

export const memoryItems = sqliteTable('memory_items', {
  id: text('id').primaryKey(),
  scope: text('scope', { enum: ['global', 'project'] }).notNull(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['user', 'feedback', 'project', 'reference'] }).notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  sourceMissionId: text('source_mission_id').references(() => missions.id),
  accepted: integer('accepted', { mode: 'boolean' }).notNull().default(true),
  createdAt: epoch().notNull(),
});

export const memoryCandidates = sqliteTable('memory_candidates', {
  id: text('id').primaryKey(),
  sourceTaskId: text('source_task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['user', 'feedback', 'project', 'reference'] }).notNull(),
  body: text('body').notNull(),
  status: text('status', { enum: ['pending', 'accepted', 'rejected'] }).notNull().default('pending'),
  // Intake provenance (Phase 4.5, ADR 0004). Null for ritual/legacy candidates.
  sourceKind: text('source_kind', { enum: ['note', 'skill', 'pattern', 'repo', 'course', 'mission'] }),
  dossierPath: text('dossier_path'),
  classifierDecision: text('classifier_decision'),
  autoFiled: integer('auto_filed', { mode: 'boolean' }).notNull().default(false),
  createdAt: epoch().notNull(),
});

export const validations = sqliteTable('validations', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  requestedByAgent: text('requested_by_agent').notNull(),
  actionSummary: text('action_summary').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  decidedAt: epoch(),
  decidedByUser: text('decided_by_user'),
  payloadJson: text('payload_json').notNull().default('{}'),
});

export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  scope: text('scope', { enum: ['global', 'project', 'mission', 'task'] }).notNull(),
  scopeId: text('scope_id'),
  period: text('period', { enum: ['day', 'week', 'month', 'mission'] }).notNull(),
  tokensCap: integer('tokens_cap').notNull(),
  tokensSpent: integer('tokens_spent').notNull().default(0),
  moneyCapCents: integer('money_cap_cents').notNull().default(0),
  moneySpentCents: integer('money_spent_cents').notNull().default(0),
});

export const contextPacks = sqliteTable('context_packs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  version: integer('version').notNull().default(1),
  path: text('path').notNull(),
  generatedAt: epoch().notNull(),
  tokenSize: integer('token_size').notNull().default(0),
  fileCount: integer('file_count').notNull().default(0),
});

// Phase 6: autopilot scheduler. One enabled schedule per project drives the
// autopilot window. maxRisk is the auto-run breaker — the worker NEVER runs a
// task whose risk exceeds it (higher-risk tasks stay gated). All time logic in
// the engine takes an explicit `now: Date`; this table only stores the window.
export const schedules = sqliteTable(
  'schedules',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['autopilot'] }).notNull().default('autopilot'),
    windowStart: text('window_start').notNull(),
    windowEnd: text('window_end').notNull(),
    daysJson: text('days_json').notNull().default('[0,1,2,3,4,5,6]'),
    maxRisk: text('max_risk', { enum: ['low', 'medium'] }).notNull().default('low'),
    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
    lastRunAt: integer('last_run_at', { mode: 'timestamp' }),
    createdAt: epoch().notNull(),
  },
  (t) => ({ byProject: index('schedules_project_idx').on(t.projectId, t.enabled) }),
);

// UI redesign: persistent conversations. A 'manager' conversation is global
// (projectId/agentId null). An 'agent' conversation is one running instance of a
// base agent scoped to a project (the "Docker container" model): unique per
// (projectId, agentId). Messages survive navigation and are revisitable.
export const conversations = sqliteTable(
  'conversations',
  {
    id: text('id').primaryKey(),
    scope: text('scope', { enum: ['manager', 'agent'] }).notNull(),
    projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    agentId: text('agent_id').references(() => agents.id),
    title: text('title').notNull().default(''),
    createdAt: epoch().notNull(),
    updatedAt: epoch().notNull(),
  },
  (t) => ({ byScope: index('conversations_scope_idx').on(t.scope, t.projectId, t.agentId) }),
);

export const messages = sqliteTable(
  'messages',
  {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['user', 'agent'] }).notNull(),
    text: text('text').notNull(),
    createdAt: epoch().notNull(),
  },
  (t) => ({ byConversation: index('messages_conversation_idx').on(t.conversationId, t.createdAt) }),
);

export const permissions = sqliteTable('permissions', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  action: text('action').notNull(),
  risk: text('risk', { enum: ['low', 'medium', 'high', 'blocking'] }).notNull(),
  allowListJson: text('allow_list_json').notNull().default('[]'),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Mission = typeof missions.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type Event = typeof events.$inferSelect;
export type MemoryItem = typeof memoryItems.$inferSelect;
export type Idea = typeof ideas.$inferSelect;
export type NewIdea = typeof ideas.$inferInsert;
export type Decision = typeof decisions.$inferSelect;
export type NewDecision = typeof decisions.$inferInsert;
export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
