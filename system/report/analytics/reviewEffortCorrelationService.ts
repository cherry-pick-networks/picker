import { ReportStores } from '#system/report/ReportStores.ts';
import { IdentityStores } from '#system/identity/IdentityStores.ts';

export interface ReviewEffortCorrelationInput {
  actor_id: string;
  from?: string;
  to?: string;
}

export async function getReviewEffortCorrelation(
  input: ReviewEffortCorrelationInput,
) {
  const reviewCount = await ReportStores.reviewEffortStore
    .getReviewCount(
      input.actor_id,
      input.from,
      input.to,
    );
  const outcomes = await IdentityStores.achievementStore
    .listConceptOutcomesByActor(
      input.actor_id,
      input.from,
      input.to,
    );
  const passRate = outcomes.length > 0
    ? outcomes.filter((o) => o.passed).length /
      outcomes.length
    : 0;
  return {
    correlation: reviewCount > 0 && outcomes.length > 0
      ? passRate
      : 0,
    review_count: reviewCount,
    outcome_count: outcomes.length,
    pass_rate: passRate,
  };
}
