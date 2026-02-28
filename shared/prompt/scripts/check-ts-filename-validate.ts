/**
 * Validation rules for TS filename check (store.md §E, reference.md, Airbnb).
 * Used by check-ts-filename.ts.
 */

import {
  EXEMPT_PREFIXES,
  PATH_EXCEPTIONS,
  ROOT_ALLOWED,
  SYSTEM_INFIX,
  TEST_NAME_REGEX,
} from './check-ts-filename-config.ts';
import { checkTsBaseName } from './check-ts-filename-helpers.ts';

function isExempt(rel: string): boolean {
  if (PATH_EXCEPTIONS.has(rel)) return true;
  for (const p of EXEMPT_PREFIXES) {
    if (rel.startsWith(p)) return true;
  }
  return false;
}

function validateRoot(base: string): string | null {
  if (ROOT_ALLOWED.has(base)) return null;
  if (base.endsWith('.d.ts')) return null;
  return 'root .ts must be in ROOT_ALLOWED or *.d.ts';
}

function validateTests(base: string): string | null {
  if (!base.endsWith('_test.ts')) return 'tests/ file must end with _test.ts';
  const name = base.slice(0, base.length - 8);
  if (!TEST_NAME_REGEX.test(name)) {
    return 'tests/ name must be camelCase (e.g. mainE2e_test.ts)';
  }
  return null;
}

function validateSystemRoot(rel: string): string | null {
  const ok = rel === 'system/routes.ts';
  return ok ? null : 'system/ file must be under system/<infix>/ or routes.ts';
}

function validateSystemInfix(parts: string[], base: string): string | null {
  const [, infix] = parts;
  if (!SYSTEM_INFIX.has(infix ?? '')) {
    return `system infix "${infix}" not in allowed set`;
  }
  return checkTsBaseName(base);
}

function validateSystem(rel: string, base: string): string | null {
  const parts = rel.split('/');
  if (parts.length < 3) return validateSystemRoot(rel);
  return validateSystemInfix(parts, base);
}

function validateRestTestsOrSystem(rel: string, base: string): string | null {
  if (rel.startsWith('tests/')) return validateTests(base);
  if (rel.startsWith('system/')) return validateSystem(rel, base);
  return null;
}

function validateRestShared(rel: string, base: string): string | null {
  if (rel.startsWith('shared/infra/')) return checkTsBaseName(base);
  if (rel.startsWith('shared/contract/')) return checkTsBaseName(base);
  return null;
}

function validateRest(rel: string, base: string): string | null {
  const a = validateRestTestsOrSystem(rel, base);
  if (a != null) return a;
  const b = validateRestShared(rel, base);
  return b;
}

export function validate(rel: string): string | null {
  const base = rel.split('/').pop() ?? '';
  if (rel === base) return validateRoot(base);
  if (isExempt(rel)) return null;
  return validateRest(rel, base);
}
