//
// Component 1–4 data for CAF resource naming per RULESET.md §E (CAF 5-axis).
// C1/C2/C5 are allowlist; C3/C4 are reference only. Used for CAF-style resource
// and document naming only, not directory validation.
//
import {
  COMPONENT1_WORKLOAD,
  COMPONENT2_RESOURCE_TYPE,
  COMPONENT3_ENVIRONMENT,
  COMPONENT4_REGION,
} from './structureAddDirConfigSetsData.ts';

export function getComponent1Set(): Set<string> {
  return COMPONENT1_WORKLOAD;
}

export function getComponent2Set(): Set<string> {
  return COMPONENT2_RESOURCE_TYPE;
}

/** Reference only; not enforced by allowlist. */
export function getComponent3Set(): Set<string> {
  return COMPONENT3_ENVIRONMENT;
}

/** Reference only; not enforced by allowlist. */
export function getComponent4Set(): Set<string> {
  return COMPONENT4_REGION;
}
