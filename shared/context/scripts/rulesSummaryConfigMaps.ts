//
// Task-type → context → section maps for rulesSummary (RULESET.md Rule index).
// Used by rulesSummaryConfig.ts.
//

export type TaskType =
  | 'feature'
  | 'refactor'
  | 'docs'
  | 'commit'
  | 'migration'
  | 'system'
  | 'dependency'
  | 'sql'
  | 'directory'
  | 'seed'
  | 'all';

export const CONTEXT_TO_SECTIONS: Record<string, string> = {
  'always': 'C, I, O',
  'handoff / long session': 'B',
  'feature + code': 'Q, P, B, S, T, N',
  'refactor + code': 'P, B, S, T, N',
  'docs': 'R, D, E',
  'commit': 'A, B',
  'migration': 'J, D, E, F',
  'system': 'K, L, M, F',
  'dependency': 'G, H',
  'sql': 'U',
  'directory': 'F, D, E',
  'seed': 'V, U, E',
};

export const TASK_TO_CONTEXTS: Record<TaskType, string[]> =
  {
    feature: ['feature + code'],
    refactor: ['refactor + code'],
    docs: ['docs'],
    commit: ['commit'],
    migration: ['migration'],
    system: ['system'],
    dependency: ['dependency'],
    sql: ['sql'],
    directory: ['directory'],
    seed: ['seed'],
    all: [
      'always',
      'handoff / long session',
      'feature + code',
      'refactor + code',
      'docs',
      'commit',
      'migration',
      'system',
      'dependency',
      'sql',
      'directory',
      'seed',
    ],
  };

export function parseSectionIds(
  applyCol: string,
): string[] {
  return applyCol.split(',').map((s) =>
    s.trim().replace(/^§/, '')
  );
}
