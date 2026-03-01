//  Anomaly detection: actors with unusual pass-rate drop or outlier.

import type {
  AnomalyInput,
  AnomalyResult,
} from './anomalyServiceTypes.ts';
import {
  addOutlierLows,
  collectRatesAndDrops,
  dateRanges,
} from './anomalyServiceHelpers.ts';

export type {
  AnomalyInput,
  AnomalyResult,
} from './anomalyServiceTypes.ts';

export async function detectAnomalies(
  input: AnomalyInput,
): Promise<AnomalyResult[]> {
  const now = new Date();
  const ranges = dateRanges(
    now,
    input.recent_days ?? 7,
    input.baseline_days ?? 30,
  );
  const { results, rates } = await collectRatesAndDrops(
    input,
    ranges,
  );
  return addOutlierLows(results, rates);
}
