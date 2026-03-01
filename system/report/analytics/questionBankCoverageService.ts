import { ReportStores } from '#system/report/ReportStores.ts';

export interface QuestionBankCoverageInput {
  scheme_id: string;
  concept_ids?: string[];
}

function filterByConcepts(
  rows: Awaited<
    ReturnType<
      typeof ReportStores.questionBankCoverageStore.getQuestionBankCoverage
    >
  >,
  conceptIds: string[] | undefined,
): Awaited<
  ReturnType<
    typeof ReportStores.questionBankCoverageStore.getQuestionBankCoverage
  >
> {
  if (!conceptIds?.length) return rows;
  const set = new Set(conceptIds);
  return rows.filter((r) => set.has(r.concept_id));
}

function toCoveragePct(
  filtered: { concept_id: string; item_count: number }[],
): {
  concept_id: string;
  item_count: number;
  coverage_pct: number;
}[] {
  const maxCount = Math.max(
    ...filtered.map((r) => r.item_count),
    1,
  );
  return filtered.map((r) => ({
    concept_id: r.concept_id,
    item_count: r.item_count,
    coverage_pct: (r.item_count / maxCount) * 100,
  }));
}

export async function buildQuestionBankCoverage(
  input: QuestionBankCoverageInput,
) {
  const rows = await ReportStores.questionBankCoverageStore
    .getQuestionBankCoverage(
      input.scheme_id,
    );
  const filtered = filterByConcepts(
    rows,
    input.concept_ids,
  );
  const coverage = toCoveragePct(filtered);
  return { coverage };
}
