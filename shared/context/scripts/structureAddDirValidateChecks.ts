//
// Path validation checks for structure:add-dir (§D/§E/§F). Used by
// structureAddDirValidate.ts. WP5: Tier1–Tier5 + length caps + Tier5 numeric.
//
import {
  getTier1Set,
  getTier2Set,
  getTier3Set,
  getTier4Set,
} from './structureAddDirConfig.ts';
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

/** Max tiers per RULESET.md §F (Tier1 through Tier5). */
const MAX_TIERS = 5;

export function validateTrimmed(
  trimmed: string,
  parts: string[],
): string | null {
  if (!trimmed) return 'Path is empty.';
  if (trimmed.startsWith('.') || trimmed.includes('..')) {
    return 'Path must be root-relative, no . or ..';
  }
  if (parts.length > MAX_TIERS) {
    return `Max ${MAX_TIERS} tiers (Tier1→Tier5) per §F.`;
  }
  return null;
}

export function validateTier1(
  parts: string[],
): string | null {
  const tier1 = getTier1Set();
  if (!tier1.has(parts[0])) {
    return `Tier1 "${
      parts[0]
    }" not in §E allowed set (Tier1 workload).`;
  }
  return null;
}

export function validateTier2(
  parts: string[],
): string | null {
  if (parts.length < 2) return null;
  const tier2 = getTier2Set();
  if (!tier2.has(parts[1])) {
    return `Tier2 "${
      parts[1]
    }" not in §E allowed set (resource type).`;
  }
  return null;
}

export function validateTier3(
  parts: string[],
): string | null {
  if (parts.length < 3) return null;
  const tier3 = getTier3Set();
  if (!tier3.has(parts[2])) {
    return `Tier3 "${
      parts[2]
    }" not in §E allowed set (environment).`;
  }
  return null;
}

export function validateTier4(
  parts: string[],
): string | null {
  if (parts.length < 4) return null;
  const tier4 = getTier4Set();
  if (!tier4.has(parts[3])) {
    return `Tier4 "${
      parts[3]
    }" not in §E allowed set (region).`;
  }
  return null;
}

/** Tier5: numeric pattern 2–4 digits per CAF_ALLOWLIST_SPEC § Tier5. */
const TIER5_NUMERIC = /^[0-9]{2,4}$/;

export function validateTier5(
  parts: string[],
): string | null {
  if (parts.length < 5) return null;
  if (!TIER5_NUMERIC.test(parts[4])) {
    return `Tier5 "${
      parts[4]
    }": must be 2–4 digits per §E (e.g. 01, 001).`;
  }
  return null;
}

/** Per-tier length caps (Tier1/3 from WP0; Tier2/4/5 per CAF allowlist max). */
const CAP_TIER1 = 14;
const CAP_TIER2 = 25;
const CAP_TIER3 = 13;
const CAP_TIER4 = 20;
const CAP_TIER5 = 4;
const TIER_CAPS = [
  CAP_TIER1,
  CAP_TIER2,
  CAP_TIER3,
  CAP_TIER4,
  CAP_TIER5,
] as const;

export function validateTierCaps(
  parts: string[],
): string | null {
  for (
    let i = 0;
    i < parts.length && i < TIER_CAPS.length;
    i++
  ) {
    const cap = TIER_CAPS[i];
    if (parts[i].length > cap) {
      return `Tier${i + 1} "${
        parts[i]
      }" exceeds ${cap} chars (max per §E).`;
    }
  }
  return null;
}

/** Runs Tier1–Tier5 allowlist, Tier5 numeric, and length-cap checks. */
export function validateTiers(
  parts: string[],
): string | null {
  return (
    validateTier1(parts) ??
      validateTier2(parts) ??
      validateTier3(parts) ??
      validateTier4(parts) ??
      validateTier5(parts) ??
      validateTierCaps(parts)
  );
}

/** Segment form for Tier1–Tier4 only; Tier5 is validated by validateTier5 (numeric). */
export function validateSegmentsForm(
  parts: string[],
): string | null {
  for (let i = 0; i < parts.length; i++) {
    if (i === 4 && parts.length === 5) continue;
    const p = parts[i];
    if (!segmentForm(p)) {
      return `Segment "${p}": lowercase, one underscore between words, no hyphens (§D/§E).`;
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
