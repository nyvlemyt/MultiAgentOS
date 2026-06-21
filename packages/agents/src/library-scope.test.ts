import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectLibrarySkills, type SkillMeta } from '@mas/skills';
import { SkillRouter, mergeSkillMetas, scanOrchestratorSkills, loadLibraryIndex } from '@mas/skills';
import { TIER_B_DELEGATION_MAP, domainScopeFor } from './library';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');

const PILOT = 'security-defensive-specialist';
const CYBER_PREFIX = 'cyber:';

function libraryRouter(): SkillRouter {
  return new SkillRouter(
    mergeSkillMetas(scanOrchestratorSkills(REPO_ROOT), loadLibraryIndex(REPO_ROOT)),
  );
}

function inScope(skill: SkillMeta): boolean {
  return skill.domain === 'security' || (skill.cluster?.startsWith(CYBER_PREFIX) ?? false);
}

describe('domainScopeFor', () => {
  it('test 7: pilot scope deep-equals the security/cyber union', () => {
    expect(domainScopeFor(PILOT)).toEqual({ domain: 'security', clusterPrefix: CYBER_PREFIX });
  });

  it('returns an empty scope for an unknown agent', () => {
    expect(domainScopeFor('no-such-agent')).toEqual({});
  });

  it('returns an empty scope for undefined/null', () => {
    expect(domainScopeFor(undefined)).toEqual({});
    expect(domainScopeFor(null)).toEqual({});
  });

  it('returns an empty scope for a mapped agent without a scope', () => {
    expect(domainScopeFor('engineering-frontend-developer')).toEqual({});
  });

  it('registers the pilot row in the delegation map', () => {
    expect(TIER_B_DELEGATION_MAP[PILOT]).toMatchObject({
      fiche: PILOT,
      scope: { domain: 'security', clusterPrefix: CYBER_PREFIX },
    });
  });
});

describe('pilot selection is scope-confined (deterministic degrade)', () => {
  it('test 7+8: every selected id is within the security/cyber union, none leaks out', async () => {
    const router = libraryRouter();
    const sel = await selectLibrarySkills({
      task: {
        id: 'pilot-task',
        title: 'Investigate a suspected intrusion and harden the host',
        description: 'Detect lateral movement, analyze logs, propose mitigations.',
      },
      scope: domainScopeFor(PILOT),
      router,
    });

    expect(sel.degraded).toBe(true);
    expect(sel.skillIds.length).toBeGreaterThan(0);
    for (const id of sel.skillIds) {
      const skill = router.requireSkill(id);
      expect(inScope(skill)).toBe(true);
    }
  });
});
