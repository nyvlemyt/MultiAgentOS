export type Domain =
  | 'research'
  | 'code-execution'
  | 'code-review'
  | 'planning'
  | 'memory'
  | 'security'
  | 'ux'
  | 'writing'
  | 'search';

export interface SkillMeta {
  id: string;
  name: string;
  description: string;
  domain: Domain;
  /** ≤200 tokens — for L1 prompt injection */
  summary: string;
  tags: string[];
  path: string;
  /** Library provenance (ECC harvest). Absent for orchestrator skills. */
  origin?: string;
  /** Harvest cluster, e.g. "skill:eng-lang". Absent for orchestrator skills. */
  cluster?: string;
  /** Library batch-priority tier (T0/T1/T2). Absent for orchestrator skills. */
  tier?: string;
}
