//
// Validation rules for TS filename check (RULESET.md §E, MANUAL.md).
// Used by checkTsFilename.ts. No project-only allowlists.
//

import {
  EXEMPT_PREFIXES,
  TEST_NAME_REGEX,
} from './checkTsFilenameConfig.ts';
import { checkTsBaseName } from './checkTsFilenameHelpers.ts';

function isExempt(rel: string): boolean {
  for (const p of EXEMPT_PREFIXES) {
    if (rel.startsWith(p)) return true;
  }
  return false;
}

function validateRoot(base: string): string | null {
  if (base.endsWith('.d.ts')) return null;
  if (base.includes('.')) return null;
  return checkTsBaseName(base);
}

function validateTests(base: string): string | null {
  if (base.endsWith('_test.ts')) {
    const name = base.slice(0, base.length - 8);
    if (!TEST_NAME_REGEX.test(name)) {
      return 'tests/ name must be camelCase (e.g. mainE2e_test.ts)';
    }
    return null;
  }
  return null;
}

function validateSystemRoot(_rel: string, base: string): string | null {
  return checkTsBaseName(base);
}

function validateSystemInfix(_parts: string[], base: string): string | null {
  return checkTsBaseName(base);
}

function validateSystem(
  rel: string,
  base: string,
): string | null {
  const parts = rel.split('/');
  if (parts.length < 3) return validateSystemRoot(rel, base);
  return validateSystemInfix(parts, base);
}

function validateRestTestsOrSystem(
  rel: string,
  base: string,
): string | null {
  if (rel.startsWith('tests/')) return validateTests(base);
  if (rel.startsWith('application/')) {
    return validateSystem(rel, base);
  }
  return null;
}

//  sharepoint/context/scripts/: base filename camelCase or PascalCase per §E.
function validateRestShared(
  rel: string,
  base: string,
): string | null {
  if (!rel.startsWith('sharepoint/context/scripts/')) {
    return null;
  }
  return checkTsBaseName(base);
}

function validateRest(
  rel: string,
  base: string,
): string | null {
  const a = validateRestTestsOrSystem(rel, base);
  if (a != null) return a;
  if (rel.startsWith('sharepoint/')) {
    return validateRestShared(rel, base);
  }
  return null;
}

export function validate(rel: string): string | null {
  const base = rel.split('/').pop() ?? '';
  if (rel === base) return validateRoot(base);
  if (isExempt(rel)) return null;
  return validateRest(rel, base);
}
