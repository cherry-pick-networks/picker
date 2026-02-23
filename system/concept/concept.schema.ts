/**
 * Concept domain types: ConceptScheme, Concept, ConceptRelation (service API).
 */

export type ConceptScheme = {
  id: string;
  prefLabel: string;
  createdAt?: string;
};

export type Concept = {
  id: string;
  schemeId: string;
  prefLabel: string;
  notation: string | null;
  source: string | null;
  path: string | null;
  createdAt?: string;
};

export type ConceptRelation = {
  sourceId: string;
  targetId: string;
  relationType: string;
};

export type ConceptSchemeRow = {
  id: string;
  pref_label: string;
  created_at: string;
};

export type ConceptRow = {
  id: string;
  scheme_id: string;
  pref_label: string;
  notation: string | null;
  source: string | null;
  path: string | null;
  created_at: string;
};

// function-length-ignore: simple DTO mapper
export function schemeRowToScheme(row: ConceptSchemeRow): ConceptScheme {
  return {
    id: row.id,
    prefLabel: row.pref_label,
    createdAt: row.created_at,
  };
}

// function-length-ignore: simple DTO mapper
export function conceptRowToConcept(row: ConceptRow): Concept {
  return {
    id: row.id,
    schemeId: row.scheme_id,
    prefLabel: row.pref_label,
    notation: row.notation,
    source: row.source,
    path: row.path,
    createdAt: row.created_at,
  };
}
