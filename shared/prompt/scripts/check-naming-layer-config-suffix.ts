/**
 * Layer allowed suffix sets per store.md §E.
 */

export const LAYER_SUFFIX: Record<string, Set<string>> = {
  presentation: new Set([
    'endpoint',
    'response',
    'config',
    'format',
    'middleware',
    'exception',
    'trace',
    'boundary',
    'validation',
  ]),
  application: new Set([
    'pipeline',
    'config',
    'event',
    'store',
    'metrics',
    'trace',
    'boundary',
    'constraint',
    'validation',
    'compliance',
  ]),
  domain: new Set([
    'schema',
    'event',
    'boundary',
    'constraint',
    'contract',
    'principle',
    'types',
  ]),
  infrastructure: new Set([
    'store',
    'storage',
    'config',
    'mapping',
    'pipeline',
    'metrics',
    'trace',
    'log',
    'boundary',
    'isolation',
  ]),
};
