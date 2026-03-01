//  Root-cause inference: failed concepts that are prerequisites of other failures.

import { GovernanceStores } from '#api/config/GovernanceStores.ts';
import { IdentityStores } from '#identity/sql/IdentityStores.ts';

export interface RootCauseInput {
  actor_id: string;
  scheme_id: string;
  from?: string;
  to?: string;
}

export interface RootCauseResult {
  root_cause_codes: string[];
  details: { code: string; pref_label?: string }[];
}

function getFailedCodes(
  outcomes: Awaited<
    ReturnType<
      typeof IdentityStores.achievementStore.listConceptOutcomesByActor
    >
  >,
  input: RootCauseInput,
): string[] {
  return outcomes
    .filter((o) =>
      o.scheme_id === input.scheme_id && !o.passed
    )
    .map((o) => o.code);
}

async function buildRootCauseDetails(
  rootCauseCodes: string[],
): Promise<RootCauseResult['details']> {
  const labels = await GovernanceStores.conceptStore
    .getConceptPrefLabels(rootCauseCodes);
  return rootCauseCodes.map((code) => ({
    code,
    pref_label: labels.get(code),
  }));
}

async function completeRootCause(
  failedCodes: string[],
): Promise<RootCauseResult> {
  const rootCauseCodes = (
    await GovernanceStores.conceptStore
      .getRequiresPredecessors(failedCodes)
  ).filter((c) => failedCodes.includes(c));
  const details = await buildRootCauseDetails(
    rootCauseCodes,
  );
  return { root_cause_codes: rootCauseCodes, details };
}

export async function inferRootCause(
  input: RootCauseInput,
): Promise<RootCauseResult> {
  const outcomes = await IdentityStores.achievementStore
    .listConceptOutcomesByActor(
      input.actor_id,
      input.from,
      input.to,
    );
  const failedCodes = getFailedCodes(outcomes, input);
  return failedCodes.length === 0
    ? { root_cause_codes: [], details: [] }
    : completeRootCause(failedCodes);
}
