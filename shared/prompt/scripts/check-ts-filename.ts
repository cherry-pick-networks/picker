/**
 * TS filename check: system/, shared/infra, shared/contract, tests/ use
 * camelCase or PascalCase base name (no dot or hyphen) per store.md §E and
 * reference.md (Airbnb style). Run from repo root:
 *   deno run --allow-read shared/prompt/scripts/check-ts-filename.ts
 * Or: deno task ts-filename-check
 */

import { walkTsFiles } from "./check-ts-filename-helpers.ts";
import { validate } from "./check-ts-filename-validate.ts";

async function collectFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  await walkTsFiles(root, root, files);
  return files;
}

function collectErrors(files: string[]): [string, string][] {
  const withErrors = files.map(
    (rel) => [rel, validate(rel)] as [string, string | null],
  );
  return withErrors.filter(([, e]) => e != null) as [string, string][];
}

function reportAndExit(errors: [string, string][]): void {
  if (errors.length > 0) {
    console.error("TS filename check failed (store.md §E, reference.md):");
    for (const [file, msg] of errors) console.error(`  ${file}: ${msg}`);
    Deno.exit(1);
  }
  console.log(
    "TS filename check passed: system/, shared/infra, shared/contract, tests/ " +
      "follow naming rules.",
  );
}

async function main(): Promise<void> {
  const root = Deno.cwd();
  const files = await collectFiles(root);
  const errors = collectErrors(files);
  reportAndExit(errors);
}

main();
