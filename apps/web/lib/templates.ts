// Phase 7 project templates. PURE DATA — no LLM, no DB. The wizard prefills the
// new-project form from these and createProject (lib/projects.ts) seeds links +
// memory candidates from the chosen template. Autonomy floors are DEFAULTS, not
// §5 overrides: high/blocking tasks still gate regardless of the floor.

import type { Project } from '@mas/db';

// The 5 long-term memory registers (docs/knowledge/project-doctrine.md).
export const MEMORY_REGISTERS = ['decisions', 'learnings', 'blockers', 'journal', 'evals'] as const;
export type MemoryRegister = (typeof MEMORY_REGISTERS)[number];
// Named aliases so register values aren't repeated as bare literals (Sonar S1192).
const [DECISIONS, LEARNINGS, BLOCKERS, JOURNAL, EVALS] = MEMORY_REGISTERS;

// Single default model literal — referenced by every template (Sonar S1192).
const DEFAULT_MODEL = 'claude-haiku-4-5';

export type ProjectType = Project['type'];
export type Autonomy = Project['autonomy'];
export type ProjectMode = Project['defaultMode'];

export interface SeedMemory {
  readonly register: MemoryRegister;
  readonly body: string;
}

export interface ProjectTemplate {
  readonly id: string;
  readonly label: string;
  readonly blurb: string;
  readonly type: ProjectType;
  readonly autonomyFloor: Autonomy;
  readonly defaultMode: ProjectMode;
  readonly defaultModel: string;
  readonly stack: readonly string[];
  readonly seedMemory: readonly SeedMemory[];
  readonly skillPolicy: readonly string[];
  readonly tierARoster: readonly string[];
}

// Shared Tier A core present on every project (planner → router → context →
// reviewer → memory keeper). Kept as one literal to avoid duplication (Sonar).
const CORE_ROSTER = [
  'mas-mission-planner',
  'mas-skill-router',
  'mas-context-manager',
  'mas-reviewer',
  'mas-memory-keeper',
] as const;

export const PROJECT_TEMPLATES: readonly ProjectTemplate[] = [
  {
    id: 'manga-app',
    label: 'Manga / social app',
    blurb: 'A manga-reading social network. Internal edits run assisted; shell, git and outbound stay gated.',
    type: 'manga-app',
    autonomyFloor: 'assisted',
    defaultMode: 'eco',
    defaultModel: DEFAULT_MODEL,
    stack: ['next', 'typescript', 'tailwind', 'prisma', 'postgres'],
    seedMemory: [
      { register: DECISIONS, body: 'Stack locked to Next.js + Tailwind; feed cards over infinite spinners.' },
      { register: LEARNINGS, body: 'Prefer feed skeletons over spinners for the empty-state.' },
      { register: JOURNAL, body: 'Project registered from a MultiAgentOS manga-app template.' },
    ],
    skillPolicy: ['mas-skill-router', 'mas-mission-planner', 'mas-reviewer'],
    tierARoster: [...CORE_ROSTER, 'design-ux-architect', 'engineering-frontend-developer'],
  },
  {
    id: 'bot',
    label: 'Bot / automation agent',
    blurb: 'A chat or task bot. Internal edits run assisted; integrations and sends require a click.',
    type: 'bot',
    autonomyFloor: 'assisted',
    defaultMode: 'eco',
    defaultModel: DEFAULT_MODEL,
    stack: ['node', 'typescript', 'mcp'],
    seedMemory: [
      { register: DECISIONS, body: 'Outbound message sends are risk:high — always human-gated (§5).' },
      { register: BLOCKERS, body: 'Rate limits on the chat platform throttle bursts; batch sends.' },
      { register: JOURNAL, body: 'Project registered from a MultiAgentOS bot template.' },
    ],
    skillPolicy: ['mas-skill-router', 'mas-sec-reviewer'],
    tierARoster: [...CORE_ROSTER, 'mas-sec-reviewer', 'engineering-backend-architect'],
  },
  {
    id: 'business-website',
    label: 'Business website',
    blurb: 'A client-facing site or audit. Floors at manual — every write and deploy waits for your click.',
    type: 'business-website',
    autonomyFloor: 'manual',
    defaultMode: 'standard',
    defaultModel: DEFAULT_MODEL,
    stack: ['next', 'typescript', 'tailwind'],
    seedMemory: [
      { register: DECISIONS, body: 'Client-facing site: manual autonomy floor; no auto-deploy.' },
      { register: EVALS, body: 'Audit outputs reviewed against the brief before delivery.' },
      { register: JOURNAL, body: 'Project registered from a MultiAgentOS business-website template.' },
    ],
    skillPolicy: ['mas-reviewer', 'mas-sec-reviewer'],
    tierARoster: [...CORE_ROSTER, 'design-ui-designer', 'testing-accessibility-auditor'],
  },
  {
    id: 'personal-automation',
    label: 'Personal automation',
    blurb: 'Low-risk personal batches (summaries, indexing, research). Autopilot-friendly off the clock.',
    type: 'automation',
    autonomyFloor: 'autopilot',
    defaultMode: 'eco',
    defaultModel: DEFAULT_MODEL,
    stack: ['node', 'typescript'],
    seedMemory: [
      { register: DECISIONS, body: 'Only low/medium-risk batches run on autopilot; high/blocking still gates.' },
      { register: LEARNINGS, body: 'Summaries + indexing are safe to batch overnight.' },
      { register: JOURNAL, body: 'Project registered from a MultiAgentOS personal-automation template.' },
    ],
    skillPolicy: ['mas-context-manager', 'mas-memory-keeper'],
    tierARoster: [...CORE_ROSTER, 'product-trend-researcher'],
  },
];

export function getTemplate(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((tpl) => tpl.id === id);
}
