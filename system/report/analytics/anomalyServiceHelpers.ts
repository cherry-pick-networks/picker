//  Anomaly detection helpers: collect rates/drops, mean/std, outlier. Used by anomalyService.

import type {
  AnomalyInput,
  AnomalyResult,
} from './anomalyServiceTypes.ts';
import {
  dateRanges,
  oneActorRatesAndDrops,
} from './anomalyServiceHelpersFetch.ts';

export { dateRanges } from './anomalyServiceHelpersFetch.ts';

export async function collectRatesAndDrops(
  input: AnomalyInput,
  ranges: ReturnType<typeof dateRanges>,
): Promise<{
  results: AnomalyResult[];
  rates: { actor_id: string; rate: number }[];
}> {
  const state = {
    results: [] as AnomalyResult[],
    rates: [] as { actor_id: string; rate: number }[],
  };
  const threshold = input.drop_threshold ?? 0.2;
  for (const actorId of input.actor_ids) {
    const { rate, drop } = await oneActorRatesAndDrops(
      actorId,
      input,
      ranges,
      threshold,
    );
    state.rates.push({ actor_id: actorId, rate });
    if (drop) state.results.push(drop);
  }
  return state;
}

export function meanAndStd(
  rates: { rate: number }[],
): { mean: number; std: number } {
  const mean = rates.reduce((s, r) => s + r.rate, 0) /
    (rates.length || 1);
  const variance =
    rates.reduce((s, r) => s + (r.rate - mean) ** 2, 0) /
    (rates.length || 1);
  const std = Math.sqrt(variance) || 0.01;
  return { mean, std };
}

export function addOutlierLows(
  results: AnomalyResult[],
  rates: { actor_id: string; rate: number }[],
): AnomalyResult[] {
  const { mean, std } = meanAndStd(rates);
  const out = [...results];
  for (const { actor_id, rate } of rates) {
    if (
      rate < mean - 2 * std &&
      !out.some((r) => r.actor_id === actor_id)
    ) {
      out.push({
        actor_id,
        kind: 'outlier_low',
        recent_pass_rate: rate,
        message: `Low pass rate ${
          (rate * 100).toFixed(0)
        }% (mean ${(mean * 100).toFixed(0)}%)`,
      });
    }
  }
  return out;
}
