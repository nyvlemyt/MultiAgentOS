import { readdirSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import matter from 'gray-matter';

export interface AgentFiche {
  id: string;
  name: string;
  emoji?: string;
  avatar?: string;
  tier: 'A' | 'B';
  role: string;
  domains: string[];
  responsibilities: string[];
  limits: string[];
  favorite_skills: string[];
  required_skills: string[];
  permissions: { fs_write: string | boolean; shell: boolean; network: string | boolean };
  budget: { default_tokens: number; model: string };
  quality_criteria: string[];
  output_format: 'json' | 'markdown' | 'patch';
  common_mistakes: string[];
  escalate_when: string[];
  status_visible?: boolean;
  body: string;
  fichePath: string;
}

const FICHES_DIR = resolve(process.cwd(), 'packages/agents/fiches');

export function loadTierAFiches(dir: string = FICHES_DIR): AgentFiche[] {
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  return files.map((file) => {
    const fullPath = join(dir, file);
    const raw = readFileSync(fullPath, 'utf-8');
    const { data, content } = matter(raw);
    return {
      ...(data as Omit<AgentFiche, 'body' | 'fichePath'>),
      body: content.trim(),
      fichePath: fullPath,
    };
  });
}
