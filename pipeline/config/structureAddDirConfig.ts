//
// Component 1–4 allowlists for CAF resource naming per RULESET.md §E (CAF 5-axis).
// Used for CAF-style resource and document naming only, not directory validation.
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

export function getComponent3Set(): Set<string> {
  return COMPONENT3_ENVIRONMENT;
}

export function getComponent4Set(): Set<string> {
  return COMPONENT4_REGION;
}
