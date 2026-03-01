//
// TS filename check: system/, tests/ use camelCase or PascalCase base name
// (no dot or hyphen) per RULESET.md §E and MANUAL.md (Airbnb style).
// Run: deno task ts-filename-check
//

import { walkTsFiles } from './checkTsFilenameHelpers.ts';
import { validate } from './checkTsFilenameValidate.ts';

async function collectFiles(
  root: string,
): Promise<string[]> {
  const files: string[] = [];
  await walkTsFiles(root, root, files);
  return files;
}

function collectErrors(
  files: string[],
): [string, string][] {
  const withErrors = files.map(
    (rel) =>
      [rel, validate(rel)] as [string, string | null],
  );
  return withErrors.filter(([, e]) => e != null) as [
    string,
    string,
  ][];
}

function reportAndExit(errors: [string, string][]): void {
  if (errors.length > 0) {
    console.error(
      'TS filename check failed (RULESET.md §E, MANUAL.md):',
    );
    for (const [file, msg] of errors) {
      console.error(`  ${file}: ${msg}`);
    }
    Deno.exit(1);
  }
  console.log(
    'TS filename check passed: system/, tests/ follow naming rules.',
  );
}

async function main(): Promise<void> {
  const root = Deno.cwd();
  const files = await collectFiles(root);
  const errors = collectErrors(files);
  reportAndExit(errors);
}

main();
