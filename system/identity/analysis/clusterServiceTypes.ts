//  Types for clustering actors by concept outcome.

export interface ClusterInput {
  actor_ids: string[];
  scheme_id: string;
  from?: string;
  to?: string;
}

export interface ActorConceptVector {
  actor_id: string;
  passed_codes: string[];
  failed_codes: string[];
}
