//
// Verify conceptSchemes.ts allowed schemes match global_standards.toml.
// Run: deno task ontology-schemes-check
// Or: deno task ontology-schemes-check
//

import { parse } from '@std/toml';
import {
  COGNITIVE_LEVEL_SCHEMES,
  CONTENT_TYPE_SCHEMES,
  CONTEXT_SCHEMES,
  SUBJECT_SCHEMES,
} from '#api/config/conceptSchemes.ts';

const TOML_PATH = new URL(
  '../../infra/seed/ontology/global_standards.toml',
  import.meta.url,
);

interface SchemeFromToml {
  id: string;
  name?: string;
}

function schemeIdsFromToml(url: URL): string[] {
  const raw = Deno.readTextFileSync(url);
  const data = parse(raw) as {
    concept_scheme?: SchemeFromToml[];
  };
  const schemes = data.concept_scheme ?? [];
  return schemes.map((s) => s.id).filter(Boolean);
}

function sorted(a: readonly string[]): string[] {
  const copy = [...a];
  return copy.sort();
}

interface SchemeDiff {
  inCodeNotToml: string[];
  inTomlNotCode: string[];
}

function getCodeIds(): string[] {
  const ids = sorted([
    ...SUBJECT_SCHEMES,
    ...CONTENT_TYPE_SCHEMES,
    ...COGNITIVE_LEVEL_SCHEMES,
    ...CONTEXT_SCHEMES,
  ]);
  return ids;
}

function getSchemeDiff(): SchemeDiff {
  const tomlIds = sorted(schemeIdsFromToml(TOML_PATH));
  const codeIds = getCodeIds();
  const inCodeNotToml = codeIds.filter((id) =>
    !tomlIds.includes(id)
  );
  return {
    inCodeNotToml,
    inTomlNotCode: tomlIds.filter((id) =>
      !codeIds.includes(id)
    ),
  };
}

function logMismatch(diff: SchemeDiff): void {
  console.error(
    'ontology-schemes-check: conceptSchemes.ts and global_standards.toml ' +
      'must list the same scheme IDs.',
  );
  if (diff.inCodeNotToml.length > 0) {
    console.error(
      '  In code but not in TOML:',
      diff.inCodeNotToml.join(', '),
    );
  }
  if (diff.inTomlNotCode.length > 0) {
    console.error(
      '  In TOML but not in conceptSchemes (add to a facet or remove):',
      diff.inTomlNotCode.join(', '),
    );
  }
}

function reportMismatchAndExit(diff: SchemeDiff): never {
  logMismatch(diff);
  Deno.exit(1);
}

function main(): void {
  const diff = getSchemeDiff();
  const hasMismatch = diff.inCodeNotToml.length > 0 ||
    diff.inTomlNotCode.length > 0;
  if (hasMismatch) reportMismatchAndExit(diff);
  console.log(
    'ontology-schemes-check passed: schemes match global_standards.toml.',
  );
}

main();
