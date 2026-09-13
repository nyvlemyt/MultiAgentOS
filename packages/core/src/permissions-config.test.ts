import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPermissions } from './permissions';
import { classifyRisk } from './risk-classifier';

// Guards the SHIPPED config/permissions.json — not a fixture. CLAUDE.md §5 names
// its risky-action families in prose; this file is the machine-readable half, and
// an empty `categories` array silently disarms the perms branch of classifyRisk
// (the portico exists but has nothing to compare against). These tests fail if
// anyone empties it again, or widens it into false positives.
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const perms = loadPermissions(resolve(REPO_ROOT, 'config/permissions.json'));

describe('config/permissions.json — §5 categories are declared', () => {
  it('parses against the schema and is not empty', () => {
    expect(perms.categories.length).toBeGreaterThan(0);
  });

  // Every family CLAUDE.md §5 names in prose must have at least one entry.
  const REQUIRED_CATEGORIES = [
    'destructive-filesystem',
    'destructive-git',
    'secrets-write',
    'dangerous-shell',
    'path-escape',
    'outbound-message',
    'payment',
    'outbound-network',
  ];
  for (const category of REQUIRED_CATEGORIES) {
    it(`declares the §5 family "${category}"`, () => {
      expect(perms.categories.some((c) => c.category === category)).toBe(true);
    });
  }

  it('gates every declared entry at high or blocking (§5: always a human click)', () => {
    expect(perms.categories.filter((c) => c.risk === 'low' || c.risk === 'medium')).toEqual([]);
  });

  it('declares both high and blocking tiers', () => {
    const risks = new Set(perms.categories.map((c) => c.risk));
    expect(risks.has('high')).toBe(true);
    expect(risks.has('blocking')).toBe(true);
  });
});

describe('config/permissions.json — each entry actually escalates', () => {
  // classifyRisk matches an entry by plain substring on the task text, so an
  // action string that never appears in a task is dead config. Feeding the
  // action back in is the minimum proof that the entry can fire at all.
  for (const entry of perms.categories) {
    it(`"${entry.action}" → ${entry.risk} or stricter`, () => {
      const r = classifyRisk({ title: entry.action, description: '' }, { perms });
      // The hardcoded §5 rule table runs first and pre-empts the shell/git/secrets
      // literals with its own (stricter, regex-anchored) `blocking` verdict — same
      // gate, different provenance. Either path must gate.
      expect(['high', 'blocking']).toContain(r.risk);
    });
  }
});

describe('config/permissions.json — no false positives on benign work', () => {
  // The 10 dispatch test-suites that run planMission load this very file. A
  // sloppy action string ("rm " matches "perfo*rm a*") would escalate ordinary
  // tasks, break those suites, and — worse — train the user to click through the
  // gate. This corpus is the mock planner's tasks plus common dev prose (EN/FR).
  const BENIGN = [
    'Survey 5 best-in-class empty-states. Research and summarize 5 reference designs.',
    'Pick skills + tier B agents. Skill Router selects skills + agents for downstream tasks.',
    'Draft UX wireframe. Produce a low-fi wireframe for the empty-state.',
    'Implement empty-state component. Write the component and apply to the manga feed.',
    'Sec gate before merge. Sec Reviewer evaluates the diff for risky actions.',
    'Final code review. Reviewer verdict for archive.',
    'Defensive cyber hardening sweep. Detect threats, analyze findings, and propose mitigations.',
    'Perform a cleanup of the build folder',
    'Write pseudo-code for the algorithm',
    'Format the error message shown to the user',
    'Evaluate the payload size of the response',
    'Transform the form data before submit',
    'Add a postgres index',
    'Corriger le formulaire de connexion',
    'Publier la documentation interne dans le repo',
    'Analyser les performances du composant',
  ];
  for (const text of BENIGN) {
    it(`does not escalate: "${text.slice(0, 48)}…"`, () => {
      const r = classifyRisk({ title: text, description: '' }, { perms });
      expect(r.risk).toBe('low');
    });
  }
});
