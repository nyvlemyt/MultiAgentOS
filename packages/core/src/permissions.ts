import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const PermissionEntry = z.object({
  category: z.string(),
  action: z.string(),
  risk: z.enum(['low', 'medium', 'high', 'blocking']),
  allow_list: z.array(z.string()).default([]),
});

export const PermissionsFile = z.object({
  version: z.literal(1),
  categories: z.array(PermissionEntry),
  allowed_hosts: z.array(z.string()).default([]),
});

export type PermissionsConfig = z.infer<typeof PermissionsFile>;

export function loadPermissions(path = resolve(process.cwd(), 'config/permissions.json')): PermissionsConfig {
  const raw = readFileSync(path, 'utf-8');
  const parsed = JSON.parse(raw);
  return PermissionsFile.parse(parsed);
}

export const EMPTY_PERMISSIONS: PermissionsConfig = {
  version: 1,
  categories: [],
  allowed_hosts: [],
};
