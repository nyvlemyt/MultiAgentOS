import type { SkillMeta, Domain } from './types.js';

export class SkillRouter {
  private readonly skills: Map<string, SkillMeta>;

  constructor(skills: SkillMeta[]) {
    this.skills = new Map(skills.map((s) => [s.id, s]));
  }

  /** L1: summary only — for prompt assembly (cheap). */
  getSummary(id: string): string | undefined {
    return this.skills.get(id)?.summary;
  }

  /** L2: full meta — on-demand hydration. Throws if not found. */
  requireSkill(id: string): SkillMeta {
    const s = this.skills.get(id);
    if (!s) throw new Error(`[SkillRouter] skill not found: ${id}`);
    return s;
  }

  findByDomain(domain: Domain): SkillMeta[] {
    return [...this.skills.values()].filter((s) => s.domain === domain);
  }

  findByTags(tags: string[]): SkillMeta[] {
    const set = new Set(tags);
    return [...this.skills.values()].filter((s) =>
      s.tags.some((t) => set.has(t)),
    );
  }

  /**
   * Build an XML context block with skill summaries (L1).
   * Injects into agent system prompts — never full bodies.
   */
  buildPromptContext(skillIds: string[]): string {
    const blocks = skillIds
      .map((id) => {
        const meta = this.skills.get(id);
        if (!meta) return null;
        return `<skill id="${id}" domain="${meta.domain}">\n${meta.summary}\n</skill>`;
      })
      .filter((b): b is string => b !== null);
    if (blocks.length === 0) return '';
    return `<available_skills>\n${blocks.join('\n')}\n</available_skills>`;
  }

  all(): SkillMeta[] {
    return [...this.skills.values()];
  }
}
