//
// Path validation for structure:add-dir (§D/§F). Format, segment form,
// and exception list only; allowlist is config/structure_allowed_dirs.toml.
//
import {
  trimPath,
  validateTrimmed,
  validateSegmentsForm,
  validateNotSkipped,
} from './structureAddDirValidateChecks.ts';

function checkTrimmed(
  trimmed: string,
  parts: string[],
): { ok: true; trimmed: string; parts: string[] } | {
  ok: false;
  err: string;
} {
  const err = validateTrimmed(trimmed, parts);
  if (err) return { ok: false, err };
  return { ok: true, trimmed, parts };
}

function runTrimAndParts(
  path: string,
): { ok: true; trimmed: string; parts: string[] } | {
  ok: false;
  err: string;
} {
  const { trimmed, parts } = trimPath(path);
  return checkTrimmed(trimmed, parts);
}

export function validatePath(
  path: string,
): { ok: true } | { ok: false; err: string } {
  const step1 = runTrimAndParts(path);
  if (!step1.ok) return step1;
  const { trimmed, parts } = step1;
  const err2 = validateSegmentsForm(parts) ?? validateNotSkipped(parts, trimmed);
  return err2 ? { ok: false, err: err2 } : { ok: true };
}
