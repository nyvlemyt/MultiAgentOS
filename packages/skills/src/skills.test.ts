import { describe, it, expect } from 'vitest';
import { SkillRouter } from './router.js';
import type { SkillMeta } from './types.js';

const mockSkills: SkillMeta[] = [
  {
    id: 'mas-mission-planner',
    name: 'Mission Planner',
    description: 'Plans missions',
    domain: 'planning',
    summary: 'Breaks a mission into tasks.',
    tags: ['planning', 'decomposition'],
    path: '/fake/.claude/skills/mas-mission-planner/SKILL.md',
  },
  {
    id: 'mas-sec-reviewer',
    name: 'Security Reviewer',
    description: 'Reviews security',
    domain: 'security',
    summary: 'Audits code for vulnerabilities.',
    tags: ['security', 'review'],
    path: '/fake/.claude/skills/mas-sec-reviewer/SKILL.md',
  },
];

describe('SkillRouter', () => {
  const router = new SkillRouter(mockSkills);

  it('getSummary returns summary for known skill', () => {
    expect(router.getSummary('mas-mission-planner')).toBe('Breaks a mission into tasks.');
  });

  it('getSummary returns undefined for unknown skill', () => {
    expect(router.getSummary('does-not-exist')).toBeUndefined();
  });

  it('requireSkill returns full meta for known skill', () => {
    const meta = router.requireSkill('mas-sec-reviewer');
    expect(meta.domain).toBe('security');
    expect(meta.tags).toContain('review');
  });

  it('requireSkill throws for unknown skill', () => {
    expect(() => router.requireSkill('ghost')).toThrow('[SkillRouter] skill not found: ghost');
  });

  it('findByDomain returns only matching domain', () => {
    const results = router.findByDomain('security');
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe('mas-sec-reviewer');
  });

  it('findByTags returns skills sharing at least one tag', () => {
    const results = router.findByTags(['review']);
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe('mas-sec-reviewer');
  });

  it('buildPromptContext produces XML with skill summaries', () => {
    const xml = router.buildPromptContext(['mas-mission-planner', 'mas-sec-reviewer']);
    expect(xml).toContain('<available_skills>');
    expect(xml).toContain('<skill id="mas-mission-planner" domain="planning">');
    expect(xml).toContain('Breaks a mission into tasks.');
    expect(xml).toContain('</available_skills>');
  });

  it('buildPromptContext returns empty string for unknown ids', () => {
    expect(router.buildPromptContext(['nope'])).toBe('');
  });

  it('all returns all skills', () => {
    expect(router.all()).toHaveLength(2);
  });
});
