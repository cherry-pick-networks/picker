export interface OutlookNextMonthPreviewInput {
  actor_id: string;
  as_of?: string;
}

export function getNextMonthPreview(
  _input: OutlookNextMonthPreviewInput,
) {
  const out = { preview: {} };
  return out;
}
