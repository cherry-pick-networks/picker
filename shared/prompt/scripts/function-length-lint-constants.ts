/**
 * Constants for function-length lint plugin (store.md §P).
 */

export const MIN_STATEMENTS = 2;
export const MAX_STATEMENTS = 4;
export const IGNORE_PATTERN =
  /function-length-ignore|function-length\/function-length/;

export const FILE_IGNORE_PATTERN = new RegExp(
  'function-length-ignore-file|' +
    'deno-lint-ignore-file\\s+function-length|function-length-ignore',
);
