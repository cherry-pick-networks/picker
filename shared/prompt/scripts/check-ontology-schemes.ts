/**
 * Verify concept-schemes.ts allowed schemes match global-standards.toml.
 * Run: deno run --allow-read shared/prompt/scripts/check-ontology-schemes.ts
 * Or: deno task ontology-schemes-check
 */

import { parse } from "@std/toml";
import {
  COGNITIVE_LEVEL_SCHEMES,
  CONTENT_TYPE_SCHEMES,
  CONTEXT_SCHEMES,
  SUBJECT_SCHEMES,
} from "#system/concept/concept-schemes.ts";

const TOML_PATH = new URL(
  "../../infra/seed/ontology/global-standards.toml",
  import.meta.url,
);

interface SchemeFromToml {
  id: string;
  name?: string;
}

function schemeIdsFromToml(url: URL): string[] {
  const raw = Deno.readTextFileSync(url);
  const data = parse(raw) as { concept_scheme?: SchemeFromToml[] };
  const schemes = data.concept_scheme ?? [];
  return schemes.map((s) => s.id).filter(Boolean);
}

function sorted(a: readonly string[]): string[] {
  return [...a].sort();
}

function main(): void {
  const tomlIds = sorted(schemeIdsFromToml(TOML_PATH));
  const codeIds = sorted([
    ...SUBJECT_SCHEMES,
    ...CONTENT_TYPE_SCHEMES,
    ...COGNITIVE_LEVEL_SCHEMES,
    ...CONTEXT_SCHEMES,
  ]);
  const inCodeNotToml = codeIds.filter((id) => !tomlIds.includes(id));
  const inTomlNotCode = tomlIds.filter((id) => !codeIds.includes(id));
  if (inCodeNotToml.length > 0 || inTomlNotCode.length > 0) {
    console.error(
      "ontology-schemes-check: concept-schemes.ts and global-standards.toml " +
        "must list the same scheme IDs.",
    );
    if (inCodeNotToml.length > 0) {
      console.error("  In code but not in TOML:", inCodeNotToml.join(", "));
    }
    if (inTomlNotCode.length > 0) {
      console.error(
        "  In TOML but not in concept-schemes (add to a facet or remove):",
        inTomlNotCode.join(", "),
      );
    }
    Deno.exit(1);
  }
  console.log(
    "ontology-schemes-check passed: schemes match global-standards.toml.",
  );
}

main();
