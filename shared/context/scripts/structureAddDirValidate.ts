//
// Path validation for structure:add-dir (§D/§E/§F). Exports validatePath.
// WP6: runTrimAndParts then Tier1→Tier2→…→Tier5 (+ length caps) only.
//
import {
  trimPath,
  validateTier1,
  validateTier2,
  validateTier3,
  validateTier4,
  validateTier5,
  validateTierCaps,
  validateTrimmed,
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

// Tier1 → Tier2 → … → Tier5 then per-tier length caps.
function runTierChecks(parts: string[]): string | null {
  return (
    validateTier1(parts) ??
    validateTier2(parts) ??
    validateTier3(parts) ??
    validateTier4(parts) ??
    validateTier5(parts) ??
    validateTierCaps(parts)
  );
}

export function validatePath(
  path: string,
): { ok: true } | { ok: false; err: string } {
  const step1 = runTrimAndParts(path);
  if (!step1.ok) return step1;
  const err2 = runTierChecks(step1.parts);
  return err2 ? { ok: false, err: err2 } : { ok: true };
}
