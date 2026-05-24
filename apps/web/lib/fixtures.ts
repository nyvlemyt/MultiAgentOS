import type { AgentCardData } from '@/components/AgentCard';
import type { MissionCardData } from '@/components/MissionCard';
import type { TimelineRow } from '@/components/Timeline';
import type { OrbitNode, OrbitEdge } from '@/components/studio/OrbitView';

export const tierAFixture: AgentCardData[] = [
  { id: 'mission-planner', name: 'Mission Planner', emoji: '🗺️', avatarPath: '/avatars/mission-planner.svg', tier: 'A', status: 'running', currentTask: 'Decomposing "polish feed empty-state"', model: 'claude-sonnet-4-6', successRate: 0.94, totalTokens: 42000, spark: [3, 4, 6, 5, 8, 7, 9, 11] },
  { id: 'skill-router', name: 'Skill Router', emoji: '🧭', avatarPath: '/avatars/skill-router.svg', tier: 'A', status: 'waiting', currentTask: 'Awaiting planner output', model: 'claude-haiku-4-5', successRate: 0.97, totalTokens: 12000, spark: [1, 2, 1, 3, 2, 4, 3, 5] },
  { id: 'context-manager', name: 'Context Manager', emoji: '🧠', avatarPath: '/avatars/context-manager.svg', tier: 'A', status: 'idle', currentTask: undefined, model: 'claude-haiku-4-5', successRate: 0.91, totalTokens: 24000, spark: [2, 3, 2, 4, 5, 3, 4, 6] },
  { id: 'memory-keeper', name: 'Memory Keeper', emoji: '📚', avatarPath: '/avatars/memory-keeper.svg', tier: 'A', status: 'idle', currentTask: undefined, model: 'claude-haiku-4-5', successRate: 1.0, totalTokens: 3000, spark: [0, 1, 0, 1, 1, 0, 2, 1] },
  { id: 'reviewer', name: 'Code Reviewer', emoji: '🔍', avatarPath: '/avatars/reviewer.svg', tier: 'A', status: 'idle', currentTask: undefined, model: 'claude-sonnet-4-6', successRate: 0.89, totalTokens: 18000, spark: [1, 2, 2, 1, 3, 4, 3, 5] },
  { id: 'sec-reviewer', name: 'Security Reviewer', emoji: '🛡️', avatarPath: '/avatars/sec-reviewer.svg', tier: 'A', status: 'idle', currentTask: undefined, model: 'claude-sonnet-4-6', successRate: 0.96, totalTokens: 9000, spark: [0, 0, 1, 1, 1, 2, 1, 2] },
];

export const tierBFixture: AgentCardData[] = [
  { id: 'engineering-frontend-developer', name: 'Frontend Developer', emoji: '🎨', tier: 'B', status: 'running', currentTask: 'Wiring empty-state component', model: 'claude-sonnet-4-6', successRate: 0.88, totalTokens: 31000, spark: [4, 6, 5, 7, 9, 8, 10, 12] },
  { id: 'engineering-backend-architect', name: 'Backend Architect', emoji: '🛠️', tier: 'B', status: 'idle', currentTask: undefined, model: 'claude-sonnet-4-6', successRate: 0.92, totalTokens: 22000, spark: [3, 4, 3, 5, 4, 6, 5, 7] },
  { id: 'design-ux-architect', name: 'UX Architect', emoji: '✨', tier: 'B', status: 'running', currentTask: 'Drafting empty-state wireframe', model: 'claude-sonnet-4-6', successRate: 0.9, totalTokens: 14000, spark: [2, 3, 4, 3, 5, 4, 6, 5] },
  { id: 'testing-reality-checker', name: 'Reality Checker', emoji: '🧪', tier: 'B', status: 'waiting', currentTask: 'Awaiting diff', model: 'claude-sonnet-4-6', successRate: 0.99, totalTokens: 7000, spark: [1, 1, 2, 1, 2, 1, 2, 2] },
];

export const allAgents = [...tierAFixture, ...tierBFixture];

export const missions: MissionCardData[] = [
  { id: 'mission_seed_001', title: 'Polish OtakuGO feed empty-state', agents: [{ name: 'UX Architect', avatarPath: null }, { name: 'Frontend Developer', avatarPath: null }], skills: ['ui-ux-pro-max', 'frontend-design'], risk: 'low', budgetSpent: 4200, budgetCap: 20000 },
  { id: 'mission_seed_002', title: 'Add user-follow notifications', agents: [{ name: 'Backend Architect', avatarPath: null }], skills: ['mcp-builder'], risk: 'medium', budgetSpent: 8500, budgetCap: 25000 },
  { id: 'mission_seed_003', title: 'Audit comment moderation flow', agents: [{ name: 'Security Reviewer', avatarPath: '/avatars/sec-reviewer.svg' }], skills: ['security-review'], risk: 'high', budgetSpent: 11000, budgetCap: 15000 },
  { id: 'mission_seed_004', title: 'Bump Tailwind 3→4', agents: [{ name: 'Frontend Developer', avatarPath: null }], skills: ['frontend-design'], risk: 'low', budgetSpent: 2000, budgetCap: 8000 },
  { id: 'mission_seed_005', title: 'Generate weekly digest brief', agents: [{ name: 'Mission Planner', avatarPath: '/avatars/mission-planner.svg' }], skills: ['internal-comms'], risk: 'low', budgetSpent: 1200, budgetCap: 5000 },
];

export const kanbanColumns = [
  { key: 'inbox', title: 'Inbox', missions: [missions[0]] },
  { key: 'clarify', title: 'To clarify', missions: [missions[4]] },
  { key: 'planned', title: 'Planned', missions: [missions[3]] },
  { key: 'in-progress', title: 'In progress', missions: [missions[1]] },
  { key: 'review', title: 'Review', missions: [missions[2]] },
  { key: 'ready', title: 'Ready to validate', missions: [] },
  { key: 'done', title: 'Done', missions: [] },
] as const;

export const trace: TimelineRow[] = Array.from({ length: 18 }).map((_, i) => {
  const agents = ['mission-planner', 'skill-router', 'engineering-frontend-developer', 'design-ux-architect', 'context-manager'];
  const actions = [
    'parsed mission objective',
    'selected skills + tier B agents',
    'opened wireframe draft',
    'rebuilt context pack',
    'emitted task DAG',
    'requested clarification',
    'wrote diff against OtakuGO',
    'reviewer verdict: NEEDS_WORK',
    'tick',
  ];
  const risks: Array<'low' | 'medium' | 'high'> = ['low', 'low', 'low', 'medium', 'low', 'low', 'low', 'high', 'low'];
  return {
    id: `evt_${i}`,
    ts: new Date(Date.now() - (18 - i) * 5 * 60_000).toISOString().slice(11, 19),
    agent: agents[i % agents.length] ?? 'system',
    action: actions[i % actions.length] ?? 'tick',
    tokens: Math.floor(Math.random() * 1200),
    risk: risks[i % risks.length],
    skills: i % 3 === 0 ? ['ui-ux-pro-max'] : i % 3 === 1 ? ['frontend-design'] : ['superpowers:writing-plans'],
  };
});

export const orbitNodes: OrbitNode[] = [
  ...tierAFixture.map((a) => ({ id: a.id, name: a.name, avatarPath: a.avatarPath, tier: 'A' as const, status: a.status })),
  ...tierBFixture.map((b) => ({ id: b.id, name: b.name, avatarPath: b.avatarPath, tier: 'B' as const, status: b.status })),
];

export const orbitEdges: OrbitEdge[] = [
  { from: 'mission-planner', to: 'skill-router', active: true },
  { from: 'skill-router', to: 'design-ux-architect' },
  { from: 'skill-router', to: 'engineering-frontend-developer' },
  { from: 'context-manager', to: 'mission-planner' },
];

export const dailyTokens = [12, 18, 14, 22, 19, 28, 24, 31, 27, 34, 30, 42];
export const monthlySpend = [1.2, 2.0, 1.6, 2.8, 2.4, 3.2, 2.9, 3.8, 3.5];

export const memoryGlobal = [
  { id: 'g1', type: 'user', title: '20 € Anthropic envelope', body: 'Default eco mode + haiku-4-5 + prompt cache.' },
  { id: 'g2', type: 'feedback', title: 'Validate phase gates explicitly', body: 'No phase advance without explicit "go".' },
];
export const memoryProject = [
  { id: 'p1', type: 'reference', title: 'OtakuGO theme tokens', body: 'ink-black, scroll-cream, sakura-pink (THEME.md).' },
  { id: 'p2', type: 'project', title: 'Manga feed uses Tailwind cards', body: 'Lives in OtakuGO/src/components/feed.' },
];
export const memoryCandidates = [
  { id: 'c1', type: 'project', title: 'Prefer feed skeleton over spinner', body: 'Observed during empty-state mission.', mission: 'mission_seed_001' },
];

export const skillRows = [
  { id: 'ui-ux-pro-max', tier: 'project-pinned', source: '.claude/skills/ui-ux-pro-max', tags: ['ui', 'design'], usedBy: ['frontend-developer'], lastUsed: '2 min ago' },
  { id: 'frontend-design', tier: 'project-pinned', source: '.claude/skills/frontend-design', tags: ['frontend'], usedBy: ['frontend-developer'], lastUsed: '5 min ago' },
  { id: 'webapp-testing', tier: 'project-pinned', source: '.claude/skills/webapp-testing', tags: ['testing'], usedBy: ['reviewer'], lastUsed: '12 min ago' },
  { id: 'theme-factory', tier: 'on-demand', source: '.claude/skills/theme-factory', tags: ['theme'], usedBy: [], lastUsed: '—' },
  { id: 'caveman', tier: 'pinned', source: '.claude/skills/caveman', tags: ['compression'], usedBy: ['mission-planner', 'skill-router'], lastUsed: '1 min ago' },
  { id: 'mcp-builder', tier: 'project-pinned', source: '.claude/skills/mcp-builder', tags: ['mcp'], usedBy: [], lastUsed: '—' },
  { id: 'claude-api', tier: 'project-pinned', source: '.claude/skills/claude-api', tags: ['anthropic'], usedBy: [], lastUsed: '—' },
  { id: 'security-review', tier: 'pinned', source: '.claude/commands/security-review.md', tags: ['security'], usedBy: ['sec-reviewer'], lastUsed: '3 min ago' },
  { id: 'superpowers:writing-plans', tier: 'methodology', source: 'superpowers', tags: ['planning'], usedBy: ['mission-planner'], lastUsed: '4 min ago' },
  { id: 'superpowers:test-driven-development', tier: 'methodology', source: 'superpowers', tags: ['tdd'], usedBy: ['reviewer'], lastUsed: '—' },
];
