//
// Load/write config/structure_allowed_dirs.toml (max 5 components per §F).
// Used by structureAddDir.ts and checkStructureDirs.ts.
//

import { join } from '@std/path';
import { parse } from '@std/toml';
import { getPath, getRoot } from './pathConfig.ts';

const ALLOWLIST_FILENAME = 'structure_allowed_dirs.toml';

function allowlistPath(): string {
  return join(getRoot(), getPath('config'), ALLOWLIST_FILENAME);
}

export function loadAllowlist(): string[] {
  const raw = Deno.readTextFileSync(allowlistPath());
  const data = parse(raw) as { allowed?: string[] };
  return Array.isArray(data.allowed)
    ? [...data.allowed]
    : [];
}

export function writeAllowlist(entries: string[]): void {
  const path = allowlistPath();
  const lines = [
    '# Allowed directory paths (single source). Max 5 components per §F.',
    '# New dirs: deno task structure:add-dir -- <path>',
    '# §F: exceptions (.git, .cursor, node_modules, scripts, tests) skipped by check.',
    '',
    'allowed = [',
    ...entries.map((e) => `  "${e}",`),
    ']',
    '',
  ];
  Deno.writeTextFileSync(path, lines.join('\n'));
}
