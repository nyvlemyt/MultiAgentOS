import { randomUUID } from 'node:crypto';
import { isAbsolute, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb, closeDb } from './client';
import { assertSafeToWipe } from './seed-safety';
import {
  projects,
  agents,
  missions,
  tasks,
  events,
  memoryItems,
  memoryCandidates,
  validations,
  skills,
  budgets,
  contextPacks,
  projectLinks,
  permissions,
  ideas,
  decisions,
  reports,
  conversations,
} from './schema';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);

function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function resolveDbPath(): string {
  const envPath = process.env.MAS_DB_PATH;
  if (envPath && envPath.length > 0) {
    return isAbsolute(envPath) ? envPath : resolve(findRepoRoot(), envPath);
  }
  return resolve(findRepoRoot(), 'data/mas.db');
}

const MIGRATIONS_FOLDER = resolve(dirname(fileURLToPath(import.meta.url)), '../migrations');

async function main() {
  const repoRoot = findRepoRoot();
  const dbPath = resolveDbPath();
  assertSafeToWipe(dbPath, {
    repoRoot,
    allowOverride: process.env.MAS_ALLOW_DESTRUCTIVE_SEED === 'true',
    nodeEnv: process.env.NODE_ENV,
  });
  console.log(`[seed] target DB: ${dbPath}`);
  const db = getDb(dbPath);

  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  console.log('seeding…');

  const projectId = 'proj_otakugo';

  // Deterministic reset: every table the seed owns gets wiped, then rewritten.
  // FK cascades cover most of the chain but we wipe explicitly so reseeds are
  // idempotent regardless of prior mutations from the lifecycle tests.
  await db.delete(decisions);
  await db.delete(ideas);
  await db.delete(conversations); // messages cascade; FK to missions is RESTRICT, wipe before missions
  await db.delete(events);
  await db.delete(validations);
  await db.delete(memoryCandidates);
  await db.delete(memoryItems);
  await db.delete(contextPacks);
  await db.delete(projectLinks);
  await db.delete(tasks);
  await db.delete(missions);
  await db.delete(projects);
  await db.delete(agents);
  await db.delete(skills);
  await db.delete(budgets);
  await db.delete(permissions);
  await db
    .insert(projects)
    .values({
      id: projectId,
      name: 'OtakuGO_UP',
      slug: 'otakugo',
      path: '/Users/melvyn/Documents/03_PROFESSIONNEL/OtakuGO_UP',
      type: 'manga-app',
      stackJson: JSON.stringify(['next', 'ts', 'tailwind', 'prisma', 'postgres']),
      autonomy: 'manual',
      defaultModel: 'claude-haiku-4-5',
      defaultMode: 'eco',
      monthlyBudgetCents: 500,
      createdAt: minutesAgo(60 * 24 * 7),
      lastActiveAt: minutesAgo(15),
    })
    .onConflictDoNothing();

  const tierA = [
    { id: 'mission-planner', name: 'Mission Planner', emoji: '🗺️', avatar: 'mission-planner.svg' },
    { id: 'skill-router', name: 'Skill Router', emoji: '🧭', avatar: 'skill-router.svg' },
    { id: 'context-manager', name: 'Context Manager', emoji: '🧠', avatar: 'context-manager.svg' },
    { id: 'memory-keeper', name: 'Memory Keeper', emoji: '📚', avatar: 'memory-keeper.svg' },
    { id: 'quality-controller', name: 'Quality Controller', emoji: '🎯', avatar: 'quality-controller.svg' },
    { id: 'reviewer', name: 'Code Reviewer', emoji: '🔍', avatar: 'reviewer.svg' },
    { id: 'sec-reviewer', name: 'Security Reviewer', emoji: '🛡️', avatar: 'sec-reviewer.svg' },
  ];

  for (const a of tierA) {
    await db
      .insert(agents)
      .values({
        id: a.id,
        tier: 'A',
        fichePath: `packages/agents/fiches/${a.id}.md`,
        name: a.name,
        emoji: a.emoji,
        avatarPath: `packages/agents/avatars/${a.avatar}`,
        model: 'claude-haiku-4-5',
        enabled: true,
        totalRuns: Math.floor(Math.random() * 40),
        totalTokens: Math.floor(Math.random() * 50_000),
        successRate: 0.85 + Math.random() * 0.13,
      })
      .onConflictDoNothing();
  }

  const tierB = [
    { id: 'engineering-frontend-developer', name: 'Frontend Developer', emoji: '🎨' },
    { id: 'engineering-backend-architect', name: 'Backend Architect', emoji: '🛠️' },
    { id: 'design-ux-architect', name: 'UX Architect', emoji: '✨' },
    { id: 'testing-reality-checker', name: 'Reality Checker', emoji: '🧪' },
  ];

  for (const b of tierB) {
    await db
      .insert(agents)
      .values({
        id: b.id,
        tier: 'B',
        fichePath: `.claude/agents/${b.id}.md`,
        name: b.name,
        emoji: b.emoji,
        avatarPath: null,
        model: 'claude-sonnet-4-6',
        enabled: true,
        totalRuns: Math.floor(Math.random() * 20),
        totalTokens: Math.floor(Math.random() * 30_000),
        successRate: 0.8 + Math.random() * 0.15,
      })
      .onConflictDoNothing();
  }

  const missionId = 'mission_seed_001';
  await db
    .insert(missions)
    .values({
      id: missionId,
      projectId,
      title: 'Polish OtakuGO feed empty-state',
      objective:
        'Redesign the manga feed empty-state with empty-state UX best practices (illustration, primary CTA, secondary CTA, supportive copy).',
      status: 'draft',
      risk: 'low',
      budgetTokens: 20000,
      spentTokens: 0,
      // Phase 4.5-receptacle: deadline within 7d → Command Center warning badge.
      deadline: minutesAgo(-3 * 24 * 60),
      milestone: 'feed v2',
      priorityScore: 72,
      createdAt: minutesAgo(30),
      updatedAt: minutesAgo(5),
    })
    .onConflictDoNothing();

  const taskRows = [
    { title: 'Survey 5 best-in-class empty-states', status: 'todo', risk: 'low', agentId: 'mission-planner' },
    { title: 'Pick skills + tier B agents', status: 'todo', risk: 'low', agentId: 'skill-router' },
    { title: 'Draft UX wireframe', status: 'todo', risk: 'low', agentId: 'design-ux-architect' },
    { title: 'Implement empty-state component', status: 'todo', risk: 'medium', agentId: 'engineering-frontend-developer' },
    { title: 'Review + sec check', status: 'todo', risk: 'low', agentId: 'reviewer' },
  ] as const;

  let i = 0;
  for (const t of taskRows) {
    await db
      .insert(tasks)
      .values({
        id: `task_seed_${++i}`,
        missionId,
        title: t.title,
        description: '',
        status: t.status,
        risk: t.risk,
        agentId: t.agentId,
        skillsJson: '["ui-ux-pro-max","frontend-design"]',
        dependsOnJson: i === 1 ? '[]' : `["task_seed_${i - 1}"]`,
        budgetTokens: 3000,
        spentTokens: 0,
        createdAt: minutesAgo(30 - i * 2),
        updatedAt: minutesAgo(30 - i * 2),
      })
      .onConflictDoNothing();
  }

  const reportRows = [
    { id: 'rep_seed_1', taskId: 'task_seed_1', agentId: 'mission-planner', kind: 'task' as const, title: 'Survey des empty-states',
      humanMd: '# Survey des empty-states\n\n**Objectif** : recenser 5 références best-in-class.\n\n## Trouvailles\n- Linear — illustration + 1 CTA\n- Notion — phrase + raccourci\n- GitHub — checklist d\'onboarding\n\n## Reco\nUn message court + **un seul** CTA, ton de la marque.',
      ai: '{"task":"survey-empty-states","status":"done","refs":5,"recommendation":"one short message + single CTA","nextStep":"pick skills"}' },
    { id: 'rep_seed_2', taskId: 'task_seed_2', agentId: 'skill-router', kind: 'task' as const, title: 'Skills + agents choisis',
      humanMd: '# Skills + agents\n\nChoisis : `ui-ux-pro-max`, `frontend-design`.\nAgents Tier B : **UX Architect** puis **Frontend Developer**.',
      ai: '{"task":"pick-skills","status":"done","skills":["ui-ux-pro-max","frontend-design"],"agents":["design-ux-architect","engineering-frontend-developer"]}' },
    { id: 'rep_seed_3', taskId: 'task_seed_4', agentId: 'engineering-frontend-developer', kind: 'task' as const, title: 'Composant EmptyState implémenté',
      humanMd: '# EmptyState implémenté\n\nLe feed vide affiche un message + CTA. `+38` / `-4` lignes.',
      ai: '{"task":"implement-empty-state","status":"review","filesTouched":["components/Feed.tsx","components/EmptyState.tsx"],"linesAdded":38,"linesRemoved":4}',
      diff: '--- a/components/Feed.tsx\n+++ b/components/Feed.tsx\n@@ -12,6 +12,9 @@\n-  if (items.length === 0) return null;\n+  if (items.length === 0) {\n+    return <EmptyState title="Aucun manga ici" cta="Explorer" />;\n+  }' },
    { id: 'rep_seed_proj', taskId: null, agentId: null, kind: 'project' as const, title: 'État du projet — semaine',
      humanMd: '# État du projet\n\n**OtakuGO_UP** · 1 mission en cours, 0 bloquée.\n\n## Avancement\n- Polish feed empty-state : 3/5 tâches faites, en revue\n\n## À surveiller\n- Échéance feed v2 le 18/06\n\n> Rapport agrégé par le Manager projet (démo).',
      ai: '{"scope":"project","missionsActive":1,"missionsBlocked":0,"nextDeadline":"2026-06-18","summary":"feed empty-state in review"}' },
  ];
  for (const r of reportRows) {
    await db.insert(reports).values({
      id: r.id, projectId, missionId: r.kind === 'project' ? null : missionId,
      taskId: r.taskId ?? null, agentId: r.agentId ?? null, kind: r.kind, title: r.title,
      humanMd: r.humanMd, ai: r.ai, diff: 'diff' in r ? (r as { diff: string }).diff : '',
      createdAt: minutesAgo(20 - reportRows.indexOf(r) * 3),
    }).onConflictDoNothing();
  }

  const eventTypes = ['llm_call', 'task_start', 'task_done', 'skill_used', 'delegate', 'tick'];
  // Provider attribution for the /tokens per-source breakdown (Phase 3.5).
  const seedProviders = ['claude:pro20', 'gemini-free', 'claude:max100'];
  for (let e = 0; e < 30; e++) {
    const eventType = eventTypes[e % eventTypes.length] ?? 'tick';
    const agent = tierA[e % tierA.length] ?? tierA[0]!;
    const isLlmCall = eventType === 'llm_call' || eventType === 'task_done';
    const payload: Record<string, unknown> = { note: `seed event ${e + 1}` };
    if (isLlmCall) payload.provider = seedProviders[e % seedProviders.length];
    await db
      .insert(events)
      .values({
        id: `evt_${randomUUID()}`,
        missionId,
        taskId: `task_seed_${(e % 5) + 1}`,
        agentId: agent.id,
        type: eventType,
        payloadJson: JSON.stringify(payload),
        tokensIn: Math.floor(Math.random() * 800),
        tokensOut: Math.floor(Math.random() * 400),
        cacheRead: Math.floor(Math.random() * 500),
        cacheCreation: Math.floor(Math.random() * 200),
        quotaUnits: Math.floor(Math.random() * 10),
        risk: 'low',
        createdAt: minutesAgo(30 - e),
      })
      .onConflictDoNothing();
  }

  await db
    .insert(memoryItems)
    .values([
      {
        id: 'mem_global_1',
        scope: 'global',
        projectId: null,
        type: 'user',
        title: '20 € Anthropic envelope — eco-first',
        body: 'Default to haiku-4-5 + caching. Prefer mocked LLM in dev.',
        accepted: true,
        createdAt: minutesAgo(60 * 24),
      },
      {
        id: 'mem_proj_1',
        scope: 'project',
        projectId,
        type: 'reference',
        title: 'OtakuGO uses Tailwind tokens with manga-themed palette',
        body: 'Brand colors: ink-black, scroll-cream, sakura-pink. Documented in OtakuGO/THEME.md.',
        accepted: true,
        createdAt: minutesAgo(60 * 24 * 3),
      },
    ])
    .onConflictDoNothing();

  // Library skills carry domain + tags so the Phase 3.5 router can route to them.
  // domain ∈ research|code-execution|code-review|planning|memory|security|ux|writing|search
  const installedSkills: Array<{
    id: string;
    domain: (typeof skills.$inferInsert)['domain'];
    tags: string[];
  }> = [
    { id: 'caveman', domain: 'writing', tags: ['compression', 'style', 'eco'] },
    { id: 'claude-api', domain: 'code-execution', tags: ['anthropic', 'api', 'sdk'] },
    { id: 'frontend-design', domain: 'ux', tags: ['frontend', 'design', 'ui'] },
    { id: 'ui-ux-pro-max', domain: 'ux', tags: ['ui', 'ux', 'design'] },
    { id: 'webapp-testing', domain: 'code-review', tags: ['testing', 'webapp', 'qa'] },
    { id: 'mcp-builder', domain: 'code-execution', tags: ['mcp', 'server', 'integration'] },
    { id: 'theme-factory', domain: 'ux', tags: ['theme', 'design', 'branding'] },
    { id: 'brand-guidelines', domain: 'ux', tags: ['brand', 'design', 'style'] },
    { id: 'canvas-design', domain: 'ux', tags: ['design', 'canvas', 'visual'] },
    { id: 'algorithmic-art', domain: 'ux', tags: ['art', 'generative', 'p5'] },
    { id: 'slack-gif-creator', domain: 'ux', tags: ['gif', 'slack', 'media'] },
    { id: 'pdf', domain: 'writing', tags: ['pdf', 'document'] },
    { id: 'docx', domain: 'writing', tags: ['docx', 'document', 'word'] },
    { id: 'pptx', domain: 'writing', tags: ['pptx', 'presentation', 'slides'] },
    { id: 'xlsx', domain: 'writing', tags: ['xlsx', 'spreadsheet', 'data'] },
    { id: 'internal-comms', domain: 'writing', tags: ['communication', 'writing', 'internal'] },
    { id: 'doc-coauthoring', domain: 'writing', tags: ['documentation', 'writing', 'collaboration'] },
    { id: 'skill-creator', domain: 'planning', tags: ['skill', 'authoring', 'meta'] },
    { id: 'web-artifacts-builder', domain: 'ux', tags: ['web', 'artifacts', 'frontend'] },
    { id: 'superpowers', domain: 'planning', tags: ['methodology', 'workflow', 'tdd'] },
  ];
  for (const skill of installedSkills) {
    await db
      .insert(skills)
      .values({
        id: skill.id,
        source: '.claude/skills',
        path: `.claude/skills/${skill.id}`,
        summaryPath: null,
        tagsJson: JSON.stringify(skill.tags),
        domain: skill.domain,
        tier: 'on-demand',
        autoLoad: false,
        lastUsedAt: null,
      })
      // domain + tags are system-managed: refresh them on reseed.
      // tier + autoLoad are user-managed (promote action): never overwrite.
      .onConflictDoUpdate({
        target: skills.id,
        set: { domain: skill.domain, tagsJson: JSON.stringify(skill.tags) },
      });
  }

  await db
    .insert(budgets)
    .values([
      {
        id: 'budget_global_month',
        scope: 'global',
        scopeId: null,
        period: 'month',
        tokensCap: 5_000_000,
        tokensSpent: 320_000,
        moneyCapCents: 1500,
        moneySpentCents: 240,
      },
      {
        id: 'budget_global_day',
        scope: 'global',
        scopeId: null,
        period: 'day',
        tokensCap: 1_000_000,
        tokensSpent: 42_000,
        moneyCapCents: 300,
        moneySpentCents: 35,
      },
    ])
    .onConflictDoNothing();

  // Phase 4.5-receptacle: Ideas Inbox + Decision Log fixtures for smoke.
  await db
    .insert(ideas)
    .values([
      {
        id: 'idea_seed_dark', title: 'Add dark mode toggle', body: 'Readers keep asking for a night theme.',
        scope: 'project', projectId, status: 'inbox',
        impact: 70, urgency: 40, effortEst: 30, riskScore: 10,
        priorityScore: Math.round(70 * 0.35 + 40 * 0.3 + (100 - 30) * 0.2 + (100 - 10) * 0.15),
        costEstTokens: 8000, createdAt: minutesAgo(120), updatedAt: minutesAgo(120),
      },
      {
        id: 'idea_seed_search', title: 'Manga full-text search', body: 'Search across titles + chapters.',
        scope: 'project', projectId, status: 'prioritized',
        impact: 90, urgency: 60, effortEst: 70, riskScore: 30,
        priorityScore: Math.round(90 * 0.35 + 60 * 0.3 + (100 - 70) * 0.2 + (100 - 30) * 0.15),
        costEstTokens: 25000, createdAt: minutesAgo(200), updatedAt: minutesAgo(90),
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(decisions)
    .values({
      id: 'dec_seed_stack', scope: 'project', projectId, source: 'user',
      title: 'Keep OtakuGO on Postgres (no Mongo migration)',
      body: 'Relational integrity for manga metadata outweighs document flexibility.',
      createdAt: minutesAgo(300),
    })
    .onConflictDoNothing();

  console.log('seed complete.');
  closeDb();
}

try {
  await main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
