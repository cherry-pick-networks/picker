export interface OutlookWeeklyWinInput {
  actor_id: string;
  week_start?: string;
}

export function getWeeklyWin(
  _input: OutlookWeeklyWinInput,
) {
  const out = { wins: [] };
  return out;
}
