import { describe, it, expect } from 'vitest';
import { PermissionsFile, EMPTY_PERMISSIONS } from './permissions.js';

describe('PermissionsFile', () => {
  it('accepts the empty skeleton', () => {
    expect(() => PermissionsFile.parse(EMPTY_PERMISSIONS)).not.toThrow();
  });

  it('rejects unknown risk levels', () => {
    expect(() =>
      PermissionsFile.parse({
        version: 1,
        categories: [{ category: 'mail', action: 'send', risk: 'apocalyptic', allow_list: [] }],
        allowed_hosts: [],
      }),
    ).toThrow();
  });

  it('rejects wrong version', () => {
    expect(() =>
      PermissionsFile.parse({ version: 2, categories: [], allowed_hosts: [] }),
    ).toThrow();
  });
});
