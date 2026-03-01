//
// Path validation checks for structure:add-dir (§D/§F). Format and
// segment form only; directory allowlist is config/structure_allowed_dirs.toml.
//
import { SKIP_DIRS } from './structureSkipDirs.ts';

export function segmentForm(name: string): boolean {
  return (
    /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(name) &&
    !name.includes('-') &&
    !name.includes(' ')
  );
}

export function trimPath(
  path: string,
): { trimmed: string; parts: string[] } {
  const trimmed = path.trim().replace(/^\/+|\/+$/g, '');
  const parts = trimmed.split('/').filter(Boolean);
  return { trimmed, parts };
}

/** Max depth per RULESET.md §F (5 components from root). */
const MAX_COMPONENTS = 5;

export function validateTrimmed(
  trimmed: string,
  parts: string[],
): string | null {
  if (!trimmed) return 'Path is empty.';
  if (trimmed.startsWith('.') || trimmed.includes('..')) {
    return 'Path must be root-relative, no . or ..';
  }
  if (parts.length > MAX_COMPONENTS) {
    return `Max ${MAX_COMPONENTS} components per §F.`;
  }
  return null;
}

/** Segment form: lowercase, underscore; 5th segment may be 4 digits. */
const COMPONENT5_NUMERIC = /^[0-9]{4}$/;

export function validateSegmentsForm(
  parts: string[],
): string | null {
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (i === 4 && parts.length === 5 && COMPONENT5_NUMERIC.test(p)) continue;
    if (!segmentForm(p)) {
      return `Segment "${p}": lowercase, underscore, no hyphens (§D).`;
    }
  }
  return null;
}

export function validateNotSkipped(
  parts: string[],
  trimmed: string,
): string | null {
  if (SKIP_DIRS.has(parts[0]) || trimmed === 'scripts') {
    return 'Path is in exception list (§F); use existing dir.';
  }
  return null;
}
