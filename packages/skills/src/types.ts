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
}
