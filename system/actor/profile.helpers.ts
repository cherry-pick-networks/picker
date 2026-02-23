/**
 * Row types and row↔app mappers for actor profile/progress PostgreSQL store.
 */

export type ProfileRow = {
  id: string;
  created_at: string;
  updated_at: string;
  grade: string | null;
  preferences: unknown;
  goals: unknown;
};

export type ProgressRow = {
  id: string;
  updated_at: string;
  state: string | null;
  current_step: string | null;
};

export function rowToProfile(row: ProfileRow): unknown {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.grade != null && { grade: row.grade }),
    ...(row.preferences != null && { preferences: row.preferences }),
    ...(row.goals != null && { goals: row.goals }),
  };
}

export function rowToProgress(row: ProgressRow): unknown {
  return {
    id: row.id,
    updatedAt: row.updated_at,
    ...(row.state != null && { state: row.state }),
    ...(row.current_step != null && { currentStep: row.current_step }),
  };
}

export function valueToProfileRow(id: string, value: unknown): ProfileRow {
  const v = value as Record<string, unknown>;
  const now = new Date().toISOString();
  return {
    id,
    created_at: (v.createdAt as string) ?? now,
    updated_at: (v.updatedAt as string) ?? now,
    grade: (v.grade as string) ?? null,
    preferences: v.preferences ?? null,
    goals: v.goals ?? null,
  };
}

export function valueToProgressRow(id: string, value: unknown): ProgressRow {
  const v = value as Record<string, unknown>;
  const now = new Date().toISOString();
  return {
    id,
    updated_at: (v.updatedAt as string) ?? now,
    state: (v.state as string) ?? null,
    current_step: (v.currentStep as string) ?? null,
  };
}
