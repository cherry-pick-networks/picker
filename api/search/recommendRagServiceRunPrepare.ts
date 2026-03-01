//
// GraphRAG: prepare input (query, expand, cap). Used by ragServiceRun.ts.
//

import { expandConcepts } from '#api/search/recommendRagServiceExpand.ts';

const MAX_LIMIT = 100;

export type PreparedRag =
  | {
    ok: false;
    response: {
      ok: false;
      status: 400 | 502;
      message: string;
    };
  }
  | {
    ok: true;
    embeddingText: string;
    expandedIds: string[];
    expandedLabels: string[];
    cap: number;
  };

export async function prepareRagInput(
  query: string,
  conceptIds: string[] | undefined,
  expandConceptsFlag: boolean,
  limit: number,
): Promise<PreparedRag> {
  const q = typeof query === 'string' ? query.trim() : '';
  if (q.length === 0) {
    return {
      ok: false as const,
      response: {
        ok: false,
        status: 400,
        message: 'query required',
      },
    };
  }
  const expanded = await expandConcepts(
    conceptIds,
    expandConceptsFlag,
    q,
  );
  return {
    ok: true as const,
    ...expanded,
    cap: Math.min(Math.max(1, limit), MAX_LIMIT),
  };
}
