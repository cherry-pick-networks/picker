//  Anomaly detection types.

export interface AnomalyInput {
  actor_ids: string[];
  scheme_id: string;
  recent_days?: number;
  baseline_days?: number;
  drop_threshold?: number;
}

export interface AnomalyResult {
  actor_id: string;
  kind: 'pass_rate_drop' | 'outlier_low';
  recent_pass_rate: number;
  baseline_pass_rate?: number;
  message: string;
}
