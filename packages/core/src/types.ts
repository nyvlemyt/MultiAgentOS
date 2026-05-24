export type MissionStatus =
  | 'draft'
  | 'clarified'
  | 'planned'
  | 'dispatched'
  | 'executing'
  | 'review'
  | 'validated'
  | 'archived'
  | 'blocked';

export type TaskStatus = 'todo' | 'running' | 'done' | 'blocked' | 'needs_validation';

export type Risk = 'low' | 'medium' | 'high' | 'blocking';
export type Autonomy = 'manual' | 'assisted' | 'autonomous' | 'autopilot';
export type Mode = 'eco' | 'standard' | 'expert';
export type AgentTier = 'A' | 'B';

export interface AgentRef {
  id: string;
  tier: AgentTier;
  name: string;
  emoji?: string;
  avatarPath?: string | null;
}

export type Artifact =
  | { kind: 'patch'; path: string }
  | { kind: 'markdown'; path: string }
  | { kind: 'json'; path: string };

export interface MemoryCandidate {
  type: 'user' | 'feedback' | 'project' | 'reference';
  body: string;
}

export type TaskResult =
  | { kind: 'done'; outputs: Artifact[]; memoryCandidates: MemoryCandidate[] }
  | { kind: 'blocked'; reason: string; suggested_next: string }
  | { kind: 'needsValidation'; action: string; risk: 'high' | 'blocking' }
  | { kind: 'delegate'; to: string; subtask: { title: string; description: string } };

export interface MissionSummary {
  id: string;
  title: string;
  status: MissionStatus;
  risk: Risk;
  budgetTokens: number;
  spentTokens: number;
}
