/**
 * FSRS scheduler (in-house). Formulas/weights from rs-fsrs (open-source).
 * Rating: 1=Again, 2=Hard, 3=Good, 4=Easy. State: D, S (stability days).
 */
// function-length-ignore-file — algorithm (store.md §P).

/** 19 weights from rs-fsrs DEFAULT_WEIGHTS. */
const W: number[] = [
  0.4072,
  1.1829,
  3.1262,
  15.4722,
  7.2102,
  0.5316,
  1.0651,
  0.0234,
  1.616,
  0.1544,
  1.0824,
  1.9813,
  0.0953,
  0.2975,
  2.2042,
  0.2407,
  2.9466,
  0.5034,
  0.6567,
];

const DECAY = -0.5;
const FACTOR = 19 / 81;
const REQUEST_RETENTION = 0.9;
const MAX_INTERVAL = 365;

export interface FSRSState {
  difficulty: number;
  stability: number;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function forgettingCurve(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  const x = 1 + (FACTOR * elapsedDays) / stability;
  return Math.pow(x, DECAY);
}

function initDifficulty(rating: number): number {
  const g = clamp(rating, 1, 4);
  return clamp(W[4] - Math.exp(W[5] * (g - 1)) + 1, 1, 10);
}

function initStability(rating: number): number {
  const g = clamp(rating, 1, 4);
  return Math.max(W[g - 1] ?? 0.1, 0.1);
}

function nextInterval(stability: number, _elapsedDays: number): number {
  const term = Math.pow(REQUEST_RETENTION, 1 / DECAY) - 1;
  const interval = (stability / FACTOR) * term;
  return clamp(Math.round(interval), 1, MAX_INTERVAL);
}

function meanReversion(initial: number, current: number): number {
  return W[7] * initial + (1 - W[7]) * current;
}

function nextDifficulty(difficulty: number, rating: number): number {
  const g = clamp(rating, 1, 4);
  const next = difficulty + W[6] * (-(g - 3));
  return clamp(meanReversion(initDifficulty(4), next), 1, 10);
}

function _shortTermStability(stability: number, rating: number): number {
  const g = clamp(rating, 1, 4);
  return stability * Math.exp(W[17] * (g - 3 + W[18]));
}

function nextRecallStability(
  difficulty: number,
  stability: number,
  retrievability: number,
  rating: number,
): number {
  const modifier = rating === 2 ? W[15] : rating === 4 ? W[16] : 1;
  const inner = Math.exp(W[8]) *
    (11 - difficulty) *
    Math.pow(stability, -W[9]) *
    (Math.exp((1 - retrievability) * W[10]) - 1);
  return stability * (1 + modifier * inner);
}

function nextForgetStability(
  difficulty: number,
  stability: number,
  retrievability: number,
): number {
  return (
    W[11] *
    Math.pow(difficulty, -W[12]) *
    (Math.pow(stability + 1, W[13]) - 1) *
    Math.exp((1 - retrievability) * W[14])
  );
}

/** New card: no prior review. Returns next_due_at (ISO) and new state. */
export function scheduleNew(
  rating: number,
  at: Date,
): { nextDue: Date; state: FSRSState } {
  const d = initDifficulty(rating);
  const s = initStability(rating);
  const g = clamp(rating, 1, 4);
  let intervalDays = 1;
  if (g === 4) intervalDays = nextInterval(s, 0);
  else if (g === 3) intervalDays = 7;
  else if (g === 2) intervalDays = 3;
  const next = new Date(at);
  next.setUTCDate(next.getUTCDate() + intervalDays);
  return { nextDue: next, state: { difficulty: d, stability: s } };
}

/** Reviewed card: D, S, last review. Returns next_due_at and new state. */
export function scheduleReview(
  state: FSRSState,
  rating: number,
  lastReviewedAt: Date,
  now: Date,
): { nextDue: Date; state: FSRSState } {
  const elapsedDays = Math.max(
    0,
    (now.getTime() - lastReviewedAt.getTime()) / (24 * 60 * 60 * 1000),
  );
  const r = forgettingCurve(elapsedDays, state.stability);
  const dNext = nextDifficulty(state.difficulty, rating);
  const g = clamp(rating, 1, 4);
  let sNext: number;
  let intervalDays: number;
  if (g === 1) {
    sNext = nextForgetStability(state.difficulty, state.stability, r);
    intervalDays = 1;
  } else {
    sNext = nextRecallStability(
      state.difficulty,
      state.stability,
      r,
      rating,
    );
    intervalDays = nextInterval(sNext, Math.round(elapsedDays));
  }
  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + intervalDays);
  return { nextDue: next, state: { difficulty: dNext, stability: sNext } };
}

export function initState(): FSRSState {
  return { difficulty: 5, stability: 0 };
}
