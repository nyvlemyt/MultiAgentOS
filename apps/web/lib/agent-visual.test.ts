import { describe, it, expect } from 'vitest';
import { agentVisual, type GlyphKey } from './agent-visual';

describe('agentVisual', () => {
  it('is deterministic for the same name', () => {
    expect(agentVisual('Mission Planner')).toEqual(agentVisual('Mission Planner'));
  });

  it('gives different hues to different names', () => {
    expect(agentVisual('Mission Planner').hue).not.toBe(agentVisual('Security Reviewer').hue);
  });

  it('keeps hue within a valid range', () => {
    const { hue } = agentVisual('anything at all');
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
  });

  it('maps known roles to glyphs by id keyword', () => {
    const cases: Array<[string, GlyphKey]> = [
      ['mission-planner', 'map'],
      ['skill-router', 'compass'],
      ['context-manager', 'brain'],
      ['memory-keeper', 'brain'],
      ['sec-reviewer', 'shield'],
      ['reviewer', 'search'],
      ['engineering-frontend-developer', 'pen'],
      ['design-ux-architect', 'sparkles'],
      ['engineering-backend-architect', 'wrench'],
      ['testing-reality-checker', 'flask'],
    ];
    for (const [id, glyph] of cases) {
      expect(agentVisual('x', id).glyph).toBe(glyph);
    }
  });

  it('falls back to the cpu glyph for unknown roles', () => {
    expect(agentVisual('Mystery', 'totally-unknown').glyph).toBe('cpu');
  });
});
