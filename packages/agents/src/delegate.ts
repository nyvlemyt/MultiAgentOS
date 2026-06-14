import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  languageDirective,
  type LLMClient,
  type LLMResponse,
  type Mode,
  type ProjectLanguage,
  type TaskResult,
} from '@mas/core';
import { loadTierBFiche } from './library';

const BLOCKED_SENTINEL = '[blocked]';
// Single source of truth for the diff-fence shape (S1192): reused by both
// extractDiff() and parseResponse().
const DIFF_FENCE_RE = /```diff\s*\n([\s\S]*?)```/;
const DEFAULT_MODEL = 'claude-haiku-4-5';
const DEFAULT_MODE: Mode = 'standard';

// Inline fallback used when the prompts file cannot be read (e.g. under a
// bundler where the relative path does not resolve). Kept tight; the canonical
// copy lives in packages/agents/prompts/tier-b-system.md.
const PREFACE_FALLBACK = [
  '# Tier B delegated call — operating contract',
  'Read + propose only. Express code changes as a unified ```diff block against the',
  'sandbox copy; never write outside the active project; never write data/memory/.',
  'Non-code work → markdown report with a 2-line TL;DR. Emit [blocked] + reason if stuck.',
].join('\n');

function loadPreface(): string {
  try {
    const here = fileURLToPath(new URL('.', import.meta.url));
    const path = resolve(here, '../prompts/tier-b-system.md');
    return readFileSync(path, 'utf-8').trim();
  } catch {
    return PREFACE_FALLBACK;
  }
}

export interface DelegateProject {
  defaultModel?: string;
  defaultMode?: Mode;
}

export interface DelegateInput {
  agentId: string;
  task: { title: string; description: string };
  llm: LLMClient;
  project?: DelegateProject;
  skillContext?: string;
  memoryText?: string;
  language?: ProjectLanguage;
  fichesDir?: string;
}

/**
 * Returns the trimmed inner body of the first ```diff fenced block, or null when
 * the text has no diff fence.
 */
export function extractDiff(text: string): string | null {
  const match = DIFF_FENCE_RE.exec(text);
  return match ? match[1].trim() : null;
}

function parseResponse(agentId: string, text: string): TaskResult {
  if (extractDiff(text) !== null) {
    return {
      kind: 'done',
      outputs: [{ kind: 'patch', path: `data/outputs/${agentId}.patch` }],
      memoryCandidates: [],
    };
  }
  const blockedAt = text.indexOf(BLOCKED_SENTINEL);
  if (blockedAt !== -1) {
    const reason = text.slice(blockedAt + BLOCKED_SENTINEL.length).trim() || 'agent blocked';
    return { kind: 'blocked', reason, suggested_next: 'review task scope' };
  }
  return {
    kind: 'done',
    outputs: [{ kind: 'markdown', path: `data/outputs/${agentId}.md` }],
    memoryCandidates: [],
  };
}

export interface DelegateOutcome {
  readonly result: TaskResult;
  readonly diff: string | null;
  readonly response: LLMResponse;
}

export async function delegateWithDiff(input: DelegateInput): Promise<DelegateOutcome> {
  const { agentId, task, llm, project, skillContext, memoryText, language, fichesDir } = input;
  // Unknown agent → loadTierBFiche throws; let it propagate.
  const fiche = loadTierBFiche(agentId, fichesDir);

  const system = [
    loadPreface(),
    fiche.body,
    language ? languageDirective(language) : '',
    memoryText,
    skillContext,
  ]
    .filter(Boolean)
    .join('\n\n');

  const resp = await llm.call({
    system,
    user: `Task: ${task.title}\n\n${task.description}`,
    model: project?.defaultModel ?? DEFAULT_MODEL,
    mode: project?.defaultMode ?? DEFAULT_MODE,
  });

  return {
    result: parseResponse(agentId, resp.text),
    diff: extractDiff(resp.text),
    response: resp,
  };
}

export async function delegate(input: DelegateInput): Promise<TaskResult> {
  return (await delegateWithDiff(input)).result;
}
