import { describe, it, expect } from 'vitest';
import { PROJECT_TEMPLATES, getTemplate, MEMORY_REGISTERS } from './templates';

const PROJECT_TYPES = new Set(['manga-app', 'bot', 'business-website', 'automation', 'other']);
const AUTONOMY = new Set(['manual', 'assisted', 'autonomous', 'autopilot']);
const MODES = new Set(['eco', 'standard', 'expert']);
const REGISTERS = new Set(MEMORY_REGISTERS);

describe('PROJECT_TEMPLATES', () => {
  it('ships exactly the four expected templates', () => {
    expect(PROJECT_TEMPLATES.map((t) => t.id)).toEqual([
      'manga-app',
      'bot',
      'business-website',
      'personal-automation',
    ]);
  });

  it('maps personal-automation to the automation project type', () => {
    expect(getTemplate('personal-automation')?.type).toBe('automation');
  });

  it('uses only valid enum values everywhere', () => {
    for (const tpl of PROJECT_TEMPLATES) {
      expect(PROJECT_TYPES.has(tpl.type)).toBe(true);
      expect(AUTONOMY.has(tpl.autonomyFloor)).toBe(true);
      expect(MODES.has(tpl.defaultMode)).toBe(true);
      for (const seed of tpl.seedMemory) expect(REGISTERS.has(seed.register)).toBe(true);
    }
  });

  it('gives every template a non-empty stack, skill policy and Tier A roster', () => {
    for (const tpl of PROJECT_TEMPLATES) {
      expect(tpl.stack.length).toBeGreaterThan(0);
      expect(tpl.skillPolicy.length).toBeGreaterThan(0);
      expect(tpl.tierARoster.length).toBeGreaterThan(0);
      expect(tpl.seedMemory.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('floors business-website at manual and personal-automation at autopilot', () => {
    expect(getTemplate('business-website')?.autonomyFloor).toBe('manual');
    expect(getTemplate('personal-automation')?.autonomyFloor).toBe('autopilot');
  });
});

describe('getTemplate', () => {
  it('returns a template on a hit', () => {
    expect(getTemplate('bot')?.id).toBe('bot');
  });

  it('returns undefined on a miss', () => {
    expect(getTemplate('nope')).toBeUndefined();
  });
});
