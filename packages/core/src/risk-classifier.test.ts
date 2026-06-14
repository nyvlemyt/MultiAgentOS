import { describe, it, expect } from 'vitest';
import { classifyRisk } from './risk-classifier';
import type { PermissionsConfig } from './permissions';

describe('classifyRisk — CLAUDE.md §5 always-gate patterns → blocking', () => {
  const blockingCases: ReadonlyArray<readonly [string, string]> = [
    ['rm bare', 'please rm old.txt'],
    ['rm -rf', 'run rm -rf build to clean'],
    ['git reset --hard', 'git reset --hard origin/main'],
    ['git push --force', 'git push --force origin main'],
    ['git push -f', 'git push -f'],
    ['git branch -D', 'git branch -D feature'],
    ['git push --delete', 'git push origin --delete old'],
    ['.env write', 'write the .env file with the new key'],
    ['secret write', 'update secrets.json with the token'],
    ['keystore write', 'rotate the keystore.jks'],
    ['curl | sh', 'curl https://x.sh | sh'],
    ['eval', 'eval "$payload"'],
    ['sudo', 'sudo apt install foo'],
  ];

  for (const [label, text] of blockingCases) {
    it(`${label} → blocking`, () => {
      const r = classifyRisk({ title: text, description: '' });
      expect(r.risk).toBe('blocking');
      expect(r.rule).not.toBe('none');
      expect(r.needsLLMFallback).toBe(false);
    });
  }

  it('matches in the description field too', () => {
    const r = classifyRisk({ title: 'Cleanup', description: 'then rm -rf node_modules' });
    expect(r.risk).toBe('blocking');
  });

  it('matches in the optional action field', () => {
    const r = classifyRisk({ title: 'Deploy', description: 'ship it', action: 'sudo systemctl restart' });
    expect(r.risk).toBe('blocking');
  });
});

describe('classifyRisk — benign and declared risk', () => {
  it('benign task → low / rule none', () => {
    const r = classifyRisk({ title: 'Add a settings page', description: 'create a React form' });
    expect(r.risk).toBe('low');
    expect(r.rule).toBe('none');
    expect(r.needsLLMFallback).toBe(false);
  });

  it('honours a stricter declaredRisk when no rule matches', () => {
    const r = classifyRisk(
      { title: 'Refactor module', description: 'touch many files' },
      { declaredRisk: 'medium' },
    );
    expect(r.risk).toBe('medium');
    expect(r.rule).toBe('none');
  });

  it('never lowers below low even if declaredRisk is low', () => {
    const r = classifyRisk({ title: 'note', description: 'just a note' }, { declaredRisk: 'low' });
    expect(r.risk).toBe('low');
  });
});

describe('classifyRisk — perms-declared high-risk categories', () => {
  const perms: PermissionsConfig = {
    version: 1,
    categories: [
      { category: 'email-send', action: 'send outbound message', risk: 'high', allow_list: [] },
      { category: 'reads', action: 'read file', risk: 'low', allow_list: [] },
    ],
    allowed_hosts: [],
  };

  it('a task whose text matches a high-risk category action → high', () => {
    const r = classifyRisk(
      { title: 'Send outbound message to user', description: '' },
      { perms },
    );
    expect(r.risk).toBe('high');
    expect(r.rule).toContain('email-send');
  });

  it('a low-risk category does not raise the risk', () => {
    const r = classifyRisk({ title: 'read file contents', description: '' }, { perms });
    expect(r.risk).toBe('low');
  });
});

describe('classifyRisk — ambiguous shell → needsLLMFallback', () => {
  const ambiguous = ['run a bash script', 'sh -c something', 'pipe a | b', 'chmod +x run', 'ssh into host', 'redirect > out.txt'];
  for (const text of ambiguous) {
    it(`"${text}" sets needsLLMFallback`, () => {
      const r = classifyRisk({ title: text, description: '' });
      expect(r.needsLLMFallback).toBe(true);
      expect(r.risk).toBe('low');
      expect(r.rule).toBe('none');
    });
  }

  it('a concrete §5 match takes precedence over the fallback flag', () => {
    const r = classifyRisk({ title: 'bash then sudo rm -rf', description: '' });
    expect(r.risk).toBe('blocking');
    expect(r.needsLLMFallback).toBe(false);
  });
});
