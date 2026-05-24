import { randomUUID } from 'node:crypto';
import { getDb, closeDb } from './client.js';
import {
  projects,
  agents,
  missions,
  tasks,
  events,
  memoryItems,
  skills,
  budgets,
} from './schema.js';

const now = () => new Date();
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);

async function main() {
  const db = getDb();

  console.log('seeding…');

  const projectId = 'proj_otakugo';
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

  const eventTypes = ['llm_call', 'task_start', 'task_done', 'skill_used', 'delegate', 'tick'];
  for (let e = 0; e < 30; e++) {
    const eventType = eventTypes[e % eventTypes.length] ?? 'tick';
    const agent = tierA[e % tierA.length] ?? tierA[0]!;
    await db
      .insert(events)
      .values({
        id: `evt_${randomUUID()}`,
        missionId,
        taskId: `task_seed_${(e % 5) + 1}`,
        agentId: agent.id,
        type: eventType,
        payloadJson: JSON.stringify({ note: `seed event ${e + 1}` }),
        tokensIn: Math.floor(Math.random() * 800),
        tokensOut: Math.floor(Math.random() * 400),
        cacheRead: Math.floor(Math.random() * 500),
        cacheCreation: Math.floor(Math.random() * 200),
        costCents: Math.floor(Math.random() * 10),
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

  const installedSkillIds = [
    'caveman',
    'claude-api',
    'frontend-design',
    'ui-ux-pro-max',
    'webapp-testing',
    'mcp-builder',
    'theme-factory',
    'brand-guidelines',
    'canvas-design',
    'algorithmic-art',
    'slack-gif-creator',
    'pdf',
    'docx',
    'pptx',
    'xlsx',
    'internal-comms',
    'doc-coauthoring',
    'skill-creator',
    'web-artifacts-builder',
    'superpowers',
  ];
  for (const id of installedSkillIds) {
    await db
      .insert(skills)
      .values({
        id,
        source: '.claude/skills',
        path: `.claude/skills/${id}`,
        summaryPath: null,
        tagsJson: '[]',
        tier: 'on-demand',
        autoLoad: false,
        lastUsedAt: null,
      })
      .onConflictDoNothing();
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

  console.log('seed complete.');
  closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
