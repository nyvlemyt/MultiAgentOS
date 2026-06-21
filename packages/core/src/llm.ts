import type { Mode, Risk } from './types';

export interface LLMRequest {
  system: string;
  user: string;
  model: string;
  mode: Mode;
  maxTokens?: number;
  /** Phase 3 skill-domain taxonomy tag — drives Phase 3.5 routing (ADR 0002). */
  domain?: string;
}

export interface LLMResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  quotaUnits: number;
  model: string;
  sessionId?: string;
  /** Source id that served the call (e.g. 'claude:pro20', 'gemini-free'). */
  provider?: string;
}

export interface LLMClient {
  call(req: LLMRequest): Promise<LLMResponse>;
}

export function mockLLM(): LLMClient {
  return {
    async call(req) {
      const text = `[mock:${req.model}] ack ${req.user.slice(0, 60)}`;
      return {
        text,
        inputTokens: 200,
        outputTokens: 60,
        cacheReadTokens: 120,
        cacheCreationTokens: 80,
        quotaUnits: 0,
        model: req.model,
      };
    },
  };
}

// ---- Phase 1: per-agent deterministic responses ---------------------------

export interface PlannerInput {
  missionId: string;
  title: string;
  objective: string;
}

export interface PlannerTask {
  id: string;
  title: string;
  description: string;
  agentHint: string;
  skillsHint: string[];
  dependsOn: string[];
  budgetTokens: number;
  risk: Risk;
}

export interface PlannerOutput {
  clarifyingQuestions: string[];
  objective: string;
  tasks: PlannerTask[];
  estimatedTokens: number;
  estimatedQuotaUnits: number;
}

export function mockMissionPlanner(input: PlannerInput): PlannerOutput {
  const m = input.missionId;
  const tasks: PlannerTask[] = [
    {
      id: `${m}_t1`,
      title: 'Survey 5 best-in-class empty-states',
      description: 'Research and summarize 5 reference designs.',
      agentHint: 'mission-planner',
      skillsHint: ['superpowers:writing-plans'],
      dependsOn: [],
      budgetTokens: 1200,
      risk: 'low',
    },
    {
      id: `${m}_t2`,
      title: 'Pick skills + tier B agents',
      description: 'Skill Router selects skills + agents for downstream tasks.',
      agentHint: 'skill-router',
      skillsHint: ['skill-creator'],
      dependsOn: [`${m}_t1`],
      budgetTokens: 600,
      risk: 'low',
    },
    {
      id: `${m}_t3`,
      title: 'Draft UX wireframe',
      description: 'Produce a low-fi wireframe for the empty-state.',
      agentHint: 'design-ux-architect',
      skillsHint: ['ui-ux-pro-max'],
      dependsOn: [`${m}_t2`],
      budgetTokens: 1500,
      risk: 'low',
    },
    {
      id: `${m}_t4`,
      title: 'Implement empty-state component',
      description: 'Write the component and apply to the manga feed.',
      agentHint: 'engineering-frontend-developer',
      skillsHint: ['frontend-design'],
      dependsOn: [`${m}_t3`],
      budgetTokens: 2500,
      risk: 'medium',
    },
    {
      id: `${m}_t5`,
      title: 'Sec gate before merge',
      description: 'Sec Reviewer evaluates the diff for risky actions.',
      agentHint: 'sec-reviewer',
      skillsHint: ['security-review'],
      dependsOn: [`${m}_t4`],
      budgetTokens: 800,
      risk: 'high',
    },
    {
      id: `${m}_t6`,
      title: 'Final code review',
      description: 'Reviewer verdict for archive.',
      agentHint: 'reviewer',
      skillsHint: ['superpowers:verification-before-completion'],
      dependsOn: [`${m}_t5`],
      budgetTokens: 1000,
      risk: 'low',
    },
  ];
  // Security/cyber missions get an EXTRA defensive task routed to the Tier B
  // pilot (Wave 2 arsenal wiring). Keep the default 6-task plan intact for
  // non-security missions so existing suites are unaffected.
  const signal = `${input.title} ${input.objective}`.toLowerCase();
  if (/security|cyber|threat|vuln/.test(signal)) {
    tasks.push({
      id: `${m}_tsec`,
      title: 'Defensive cyber hardening sweep',
      description: 'Detect threats, analyze findings, and propose mitigations + hardening diffs.',
      agentHint: 'security-defensive-specialist',
      skillsHint: [],
      dependsOn: [`${m}_t1`],
      budgetTokens: 1500,
      risk: 'medium',
    });
  }

  const total = tasks.reduce((s, t) => s + t.budgetTokens, 0);
  return {
    clarifyingQuestions: [],
    objective: input.objective || input.title,
    tasks,
    estimatedTokens: total,
    estimatedQuotaUnits: Math.ceil((total / 1_000_000) * 25),
  };
}

export interface SkillRouterDecision {
  taskId: string;
  requiredSkills: string[];
  favoriteSkills: string[];
  tierBAgents: string[];
  budgetEstimate: { tokens: number; model: string };
  rationale: string;
  requires_validation: boolean;
}

const SKILL_MATRIX: Record<string, Omit<SkillRouterDecision, 'taskId'>> = {
  'ui-ux-pro-max': {
    requiredSkills: ['superpowers:using-superpowers'],
    favoriteSkills: ['ui-ux-pro-max'],
    tierBAgents: ['design-ux-architect'],
    budgetEstimate: { tokens: 1500, model: 'claude-haiku-4-5' },
    rationale: 'UX task signal → ui-ux-pro-max + UX Architect',
    requires_validation: false,
  },
  'frontend-design': {
    requiredSkills: ['superpowers:using-superpowers'],
    favoriteSkills: ['frontend-design'],
    tierBAgents: ['engineering-frontend-developer'],
    budgetEstimate: { tokens: 2500, model: 'claude-haiku-4-5' },
    rationale: 'Frontend component task → frontend-design + Frontend Developer',
    requires_validation: false,
  },
  'security-review': {
    requiredSkills: ['superpowers:using-superpowers', 'security-review'],
    favoriteSkills: [],
    tierBAgents: ['testing-reality-checker'],
    budgetEstimate: { tokens: 800, model: 'claude-haiku-4-5' },
    rationale: 'Security gate → security-review + Reality Checker',
    requires_validation: true,
  },
  default: {
    requiredSkills: ['superpowers:using-superpowers'],
    favoriteSkills: [],
    tierBAgents: [],
    budgetEstimate: { tokens: 800, model: 'claude-haiku-4-5' },
    rationale: 'No specific skill signal — falling back to defaults.',
    requires_validation: false,
  },
};

export function mockSkillRouter(taskId: string, skillsHint: string[]): SkillRouterDecision {
  for (const hint of skillsHint) {
    const match = SKILL_MATRIX[hint];
    if (match) return { taskId, ...match };
  }
  return { taskId, ...SKILL_MATRIX.default! };
}

export interface ReviewerVerdict {
  taskId: string;
  verdict: 'PASS' | 'NEEDS_WORK' | 'BLOCK';
  findings: { severity: 'info' | 'warn' | 'block'; message: string }[];
}

export function mockReviewer(taskId: string, prior: { risk: Risk }): ReviewerVerdict {
  return {
    taskId,
    verdict: 'PASS',
    findings: [
      { severity: 'info', message: 'Mocked review: looks consistent with the task brief.' },
      ...(prior.risk === 'medium' || prior.risk === 'high'
        ? [{ severity: 'warn' as const, message: 'Medium/high risk path — confirm test coverage.' }]
        : []),
    ],
  };
}

export function mockSecReviewer(taskId: string, prior: { risk: Risk }): ReviewerVerdict {
  return {
    taskId,
    verdict: prior.risk === 'blocking' ? 'BLOCK' : 'PASS',
    findings: [
      { severity: 'info', message: 'Mocked sec-review: no risky-action categories matched.' },
    ],
  };
}

// Quality Controller (AGENTS.md §4): post-execution PROCESS/RULES gate, runs
// BEFORE the Reviewer. It checks conventions (Conventional Commits, no-PAYG
// drift, framework-without-ADR, output-language match) rather than the CODE.
// At the mock stage it returns PASS unless a task carries the deterministic
// '[qc-block]' sentinel — the stand-in for a detected process violation, which
// a test can seed to exercise the block path.
const QC_BLOCK_SENTINEL = '[qc-block]';

export function mockQualityController(
  taskId: string,
  input: { taskTitles: string[] },
): ReviewerVerdict {
  const violation = input.taskTitles.find((t) => t.includes(QC_BLOCK_SENTINEL));
  if (violation) {
    return {
      taskId,
      verdict: 'BLOCK',
      findings: [
        { severity: 'block', message: `Mocked quality-control: process/rules violation in "${violation}".` },
      ],
    };
  }
  return {
    taskId,
    verdict: 'PASS',
    findings: [
      { severity: 'info', message: 'Mocked quality-control: conventions, architecture and output language consistent.' },
    ],
  };
}

// ---- Phase 5: Tier B review gate mocks ------------------------------------

// Code Reviewer (AGENTS.md §6): reviews a produced diff for correctness and
// maintainability. The mock passes; with no diff it adds a warn finding since
// there is nothing to assess.
export function mockCodeReviewer(taskId: string, input: { hasDiff: boolean }): ReviewerVerdict {
  return {
    taskId,
    verdict: 'PASS',
    findings: [
      { severity: 'info', message: 'Mocked code-review: change reads consistent with the task brief.' },
      ...(input.hasDiff
        ? []
        : [{ severity: 'warn' as const, message: 'No diff to review — nothing to assess.' }]),
    ],
  };
}

// Reality Checker (AGENTS.md §6): default-to-NEEDS_WORK gate before archive.
// Requires overwhelming proof — passes only when evidence is supplied.
export function mockRealityChecker(taskId: string, input: { evidence: boolean }): ReviewerVerdict {
  if (input.evidence) {
    return {
      taskId,
      verdict: 'PASS',
      findings: [
        { severity: 'info', message: 'Mocked reality-check: evidence supplied — claims substantiated.' },
      ],
    };
  }
  return {
    taskId,
    verdict: 'NEEDS_WORK',
    findings: [
      { severity: 'warn', message: 'Mocked reality-check: no evidence — defaulting to NEEDS_WORK. Provide proof.' },
    ],
  };
}
