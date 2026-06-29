import { describe, it, expect } from 'vitest';
import { assertFetchAllowed, BlockedHostError, type NetGuardDeps } from './net-guard';

const deps = (allowedHosts: string[], ips: string[]): NetGuardDeps => ({
  allowedHosts,
  resolve: async () => ips,
});

describe('assertFetchAllowed', () => {
  it('passes an allowlisted host that resolves to a public IP', async () => {
    const u = await assertFetchAllowed('https://help.obsidian.md/bases', deps(['help.obsidian.md'], ['185.199.108.153']));
    expect(u.hostname).toBe('help.obsidian.md');
  });

  it('rejects a non-http(s) scheme', async () => {
    await expect(assertFetchAllowed('file:///etc/passwd', deps(['x'], ['1.1.1.1']))).rejects.toThrow(BlockedHostError);
  });

  it('rejects a host not in the allowlist', async () => {
    await expect(assertFetchAllowed('https://evil.example.com/', deps(['help.obsidian.md'], ['1.1.1.1']))).rejects.toThrow(/not in allowed_hosts/);
  });

  it('rejects DNS-rebind: allowlisted host resolving to a private IP', async () => {
    await expect(assertFetchAllowed('https://help.obsidian.md/', deps(['help.obsidian.md'], ['127.0.0.1']))).rejects.toThrow(/private/);
  });

  it('rejects a v4-mapped IPv6 loopback', async () => {
    await expect(assertFetchAllowed('https://help.obsidian.md/', deps(['help.obsidian.md'], ['::ffff:127.0.0.1']))).rejects.toThrow(/private/);
  });

  it('rejects when the host does not resolve at all', async () => {
    await expect(assertFetchAllowed('https://help.obsidian.md/', deps(['help.obsidian.md'], []))).rejects.toThrow(/did not resolve/);
  });

  it('empty allowlist denies everything (secure default)', async () => {
    await expect(assertFetchAllowed('https://help.obsidian.md/', deps([], ['1.1.1.1']))).rejects.toThrow(BlockedHostError);
  });
});
