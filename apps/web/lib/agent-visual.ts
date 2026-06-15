export type GlyphKey =
  | 'map' | 'compass' | 'brain' | 'shield' | 'search'
  | 'pen' | 'sparkles' | 'wrench' | 'flask' | 'cpu';

export type AgentVisual = { hue: number; glyph: GlyphKey };

// id/role keyword → glyph. First matching keyword wins (order matters).
const GLYPH_RULES: ReadonlyArray<readonly [RegExp, GlyphKey]> = [
  [/planner|plan/, 'map'],
  [/router|route/, 'compass'],
  [/memory|context/, 'brain'],
  [/sec|security/, 'shield'],
  [/review/, 'search'],
  [/frontend|front/, 'pen'],
  [/ux|design/, 'sparkles'],
  [/backend|architect/, 'wrench'],
  [/reality|test|check/, 'flask'],
];

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Cyan-to-gold arc: 145°-wide band starting at hue 45 (gold) up to ~190 (cyan).
function hueFor(name: string): number {
  return 45 + (hashString(name) % 146);
}

function glyphFor(role: string): GlyphKey {
  for (const [re, glyph] of GLYPH_RULES) {
    if (re.test(role)) return glyph;
  }
  return 'cpu';
}

export function agentVisual(name: string, role?: string): AgentVisual {
  return { hue: hueFor(name), glyph: glyphFor((role ?? name).toLowerCase()) };
}
