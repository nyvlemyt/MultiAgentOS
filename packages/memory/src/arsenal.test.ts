import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildArsenalStubs, parseFrontmatter, serializeStub, type ArsenalStub } from './arsenal';

let root: string;
let outDir: string;

function write(rel: string, content: string): void {
  const full = join(root, rel);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, content, 'utf8');
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'mas-arsenal-'));
  outDir = join(root, 'out');

  write(
    'packages/skills/library/my-skill/SKILL.md',
    [
      '---',
      'name: my-skill',
      'summary: "A reusable skill that audits pull requests for security issues."',
      'metadata:',
      '  cluster: skill:core-security',
      '  tier: T1',
      '---',
      '',
      '# My Skill',
      '',
      'This is the full body that must NOT be indexed verbatim — only the L1 summary.',
    ].join('\n'),
  );
  write('packages/skills/library/README.md', '# index, not a skill');

  write(
    'packages/agents/library/my-agent.md',
    ['---', 'id: my-agent', 'name: My Agent', 'role: "Reviews architecture decisions."', 'domains: [architecture, all]', '---', '', '# body'].join('\n'),
  );
  write(
    '.claude/agents/cool-agent.md',
    ['---', 'name: Cool Agent', 'description: A defensive security reviewer agent.', '---', '', '# personality'].join('\n'),
  );

  write('docs/rules/typescript/security.md', '# TypeScript security\n\nNever use any for untrusted input; narrow with Zod.');
  write('.claude/commands/foo.md', ['---', 'description: "Run the foo workflow."', '---', '', '# Foo'].join('\n'));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('parseFrontmatter', () => {
  it('parses flow arrays and flattens nested keys', () => {
    const fm = parseFrontmatter('---\nname: x\ndomains: [a, b]\nmetadata:\n  cluster: skill:core\n---\nbody');
    expect(fm['name']).toBe('x');
    expect(fm['domains']).toEqual(['a', 'b']);
    expect(fm['cluster']).toBe('skill:core');
  });

  it('returns {} when there is no frontmatter', () => {
    expect(parseFrontmatter('# just a heading')).toEqual({});
  });
});

describe('serializeStub', () => {
  it('emits unified frontmatter + summary body, scope global', () => {
    const stub: ArsenalStub = { id: 'skill/x', type: 'skill', title: 'X', summary: 'does X', tags: ['t'], domain: 'd', source: 'a/b.md' };
    const out = serializeStub(stub);
    expect(out).toContain('id: skill/x');
    expect(out).toContain('type: skill');
    expect(out).toContain('scope: global');
    expect(out).toContain('status: library');
    expect(out.trimEnd().endsWith('does X')).toBe(true);
  });
});

describe('buildArsenalStubs', () => {
  it('emits one stub per arsenal item across all five sources', () => {
    const res = buildArsenalStubs(root, outDir);
    expect(res.byType.skill).toBe(1);
    expect(res.byType.agent).toBe(2); // library + .claude/agents
    expect(res.byType.rule).toBe(1);
    expect(res.byType.command).toBe(1);
    expect(res.written).toBe(5);
  });

  it('indexes the L1 summary only — never the full skill body', () => {
    buildArsenalStubs(root, outDir);
    const stub = readFileSync(join(outDir, 'skill', 'my-skill.md'), 'utf8');
    expect(stub).toContain('audits pull requests for security issues');
    expect(stub).not.toContain('must NOT be indexed verbatim');
  });

  it('skips README/index shells', () => {
    buildArsenalStubs(root, outDir);
    const skillStubs = readdirSync(join(outDir, 'skill'));
    expect(skillStubs).toEqual(['my-skill.md']);
  });

  it('derives a rule stub title from its path', () => {
    buildArsenalStubs(root, outDir);
    const ruleFiles = readdirSync(join(outDir, 'rule'));
    expect(ruleFiles).toHaveLength(1);
    const stub = readFileSync(join(outDir, 'rule', ruleFiles[0]!), 'utf8');
    expect(stub).toContain('typescript: security');
  });

  it('is idempotent — a rebuild clears stale stubs', () => {
    buildArsenalStubs(root, outDir);
    rmSync(join(root, 'packages/skills/library/my-skill'), { recursive: true, force: true });
    const res = buildArsenalStubs(root, outDir);
    expect(res.byType.skill).toBe(0);
    expect(existsSync(join(outDir, 'skill', 'my-skill.md'))).toBe(false);
  });
});
