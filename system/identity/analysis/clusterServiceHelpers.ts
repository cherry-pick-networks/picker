//  Clustering helpers: similarity, vectors, group collection.

import { IdentityStores } from '#system/identity/IdentityStores.ts';
import type {
  ActorConceptVector,
  ClusterInput,
} from './clusterServiceTypes.ts';

export { buildClusters } from './clusterServiceHelpersClusters.ts';
export {
  cosineSimilarity,
  intersectionSize,
} from './clusterServiceHelpersSimilarity.ts';

export function toVector(
  actorId: string,
  outcomes: Awaited<
    ReturnType<
      typeof IdentityStores.achievementStore.listConceptOutcomesByActor
    >
  >,
  input: ClusterInput,
): ActorConceptVector {
  const relevant = outcomes.filter((o) =>
    o.scheme_id === input.scheme_id
  );
  return {
    actor_id: actorId,
    passed_codes: relevant.filter((o) => o.passed).map((
      o,
    ) => o.code),
    failed_codes: relevant.filter((o) => !o.passed).map((
      o,
    ) => o.code),
  };
}

export async function buildVectors(
  input: ClusterInput,
): Promise<ActorConceptVector[]> {
  const vectors: ActorConceptVector[] = [];
  for (const actorId of input.actor_ids) {
    const outcomes = await IdentityStores.achievementStore
      .listConceptOutcomesByActor(
        actorId,
        input.from,
        input.to,
      );
    vectors.push(toVector(actorId, outcomes, input));
  }
  return vectors;
}
