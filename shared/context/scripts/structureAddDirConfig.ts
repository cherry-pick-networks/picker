//
// Tier1~4 allowlists for structure:add-dir per RULESET.md §D, §E, §F (CAF 5-axis).
// WP4: validation uses only Tier1~4 Sets.
//
import {
  TIER1_WORKLOAD,
  TIER2_RESOURCE_TYPE,
  TIER3_ENVIRONMENT,
  TIER4_REGION,
} from './structureAddDirConfigSetsData.ts';

// Returns Tier1 allowed set (workload/application names per CAF §E).
export function getTier1Set(): Set<string> {
  return TIER1_WORKLOAD;
}

// Returns Tier2 allowed set (resource type values per CAF §E).
export function getTier2Set(): Set<string> {
  return TIER2_RESOURCE_TYPE;
}

// Returns Tier3 allowed set (environment segment values).
export function getTier3Set(): Set<string> {
  return TIER3_ENVIRONMENT;
}

// Returns Tier4 allowed set (region segment values per CAF §E).
export function getTier4Set(): Set<string> {
  return TIER4_REGION;
}
