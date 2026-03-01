//  Achievement storage: concept outcomes and item responses (Postgres).

import { getPg } from '#api/postgresql/connections/pgClient.ts';
import { loadSql } from '#api/postgresql/connections/sqlLoader.ts';
import type {
  ConceptOutcome,
  ItemResponse,
} from "#identity/config/roles/schema.ts";

const sqlDir = new URL("./", import.meta.url);
const SQL_UPSERT_OUTCOME = await loadSql(
  sqlDir,
  'upsert_concept_outcome.sql',
);
const SQL_LIST_OUTCOMES = await loadSql(
  sqlDir,
  'list_concept_outcomes_by_actor.sql',
);
const SQL_INSERT_RESPONSE = await loadSql(
  sqlDir,
  'insert_item_response.sql',
);
const SQL_LIST_RESPONSES = await loadSql(
  sqlDir,
  'list_item_responses_by_actor.sql',
);

export async function upsertConceptOutcome(
  row: Omit<ConceptOutcome, 'recorded_at'>,
): Promise<void> {
  const pg = await getPg();
  await pg.queryArray(SQL_UPSERT_OUTCOME, [
    row.actor_id,
    row.scheme_id,
    row.code,
    row.passed,
  ]);
}

export async function listConceptOutcomesByActor(
  actorId: string,
  from?: string,
  to?: string,
): Promise<ConceptOutcome[]> {
  const pg = await getPg();
  const r = await pg.queryObject<ConceptOutcome>(
    SQL_LIST_OUTCOMES,
    [
      actorId,
      from ?? null,
      to ?? null,
    ],
  );
  return r.rows;
}

// function-length-ignore — insert + assert row.
export async function recordItemResponse(
  row: Omit<ItemResponse, 'id' | 'recorded_at'>,
): Promise<ItemResponse> {
  const pg = await getPg();
  const r = await pg.queryObject<ItemResponse>(
    SQL_INSERT_RESPONSE,
    [
      row.actor_id,
      row.item_id,
      row.selected_option_index,
      row.correct,
    ],
  );
  const row_ = r.rows[0];
  if (row_ == null) {
    throw new Error('insert_item_response returned no row');
  }
  return row_;
}

export async function listItemResponsesByActor(
  actorId: string,
  from?: string,
  to?: string,
): Promise<ItemResponse[]> {
  const pg = await getPg();
  const r = await pg.queryObject<ItemResponse>(
    SQL_LIST_RESPONSES,
    [
      actorId,
      from ?? null,
      to ?? null,
    ],
  );
  const rows = r.rows;
  return rows;
}
