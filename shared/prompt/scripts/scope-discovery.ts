/**
 * Print direct dependencies of an entry file (for AI session scope).
 * Only relative imports (./ or ../) are resolved; npm/jsr are skipped.
 * Run from repo root:
 *   deno run --allow-read shared/prompt/scripts/scope-discovery.ts <entry-file>
 * Or: deno task scope-discovery -- <entry-file>
 * Options:
 *   --oneline              print paths on one line for pasting into a prompt.
 *   --ontology-scheme=ID    append concept-tree notations as in-scope hints
 *                           (requires -A and seed:ontology applied).
 */
// function-length-ignore-file
import { Project } from "ts-morph";

const ROOT = Deno.cwd();

function dirname(path: string): string {
  const i = path.lastIndexOf("/");
  return i <= 0 ? "" : path.slice(0, i);
}

function normalizeRel(baseDir: string, spec: string): string {
  const parts: string[] = [];
  const segs = (baseDir + "/" + spec).split("/");
  for (const s of segs) {
    if (s === "" || s === ".") continue;
    if (s === "..") {
      parts.pop();
      continue;
    }
    parts.push(s);
  }
  return parts.join("/");
}

function resolvePath(entryRel: string, spec: string): string | null {
  if (!spec.startsWith(".")) return null;
  const baseDir = dirname(entryRel);
  const resolved = normalizeRel(baseDir, spec);
  const candidates = [resolved];
  if (!resolved.includes(".") || resolved.endsWith(".json")) {
    candidates.push(resolved + ".ts", resolved + ".tsx");
  }
  for (const p of candidates) {
    try {
      const full = `${ROOT}/${p}`;
      Deno.statSync(full);
      return p;
    } catch {
      // continue
    }
  }
  return null;
}

function getRelativeImports(entryPath: string, content: string): string[] {
  const project = new Project({ useInMemoryFileSystem: true });
  const src = project.createSourceFile(entryPath, content, { overwrite: true });
  const out: string[] = [];
  for (const imp of src.getImportDeclarations()) {
    const spec = imp.getModuleSpecifierValue();
    const resolved = resolvePath(entryPath, spec);
    if (resolved && !out.includes(resolved)) out.push(resolved);
  }
  return out;
}

function parseOntologySchemeArg(): string | null {
  const arg = Deno.args.find((a) => a.startsWith("--ontology-scheme="));
  if (!arg) return null;
  const value = arg.slice("--ontology-scheme=".length).trim();
  return value.length > 0 ? value : null;
}

async function fetchOntologyNotations(schemeId: string): Promise<string[]> {
  const mod = await import("#system/concept/concept.service.ts");
  const tree = await mod.getTree(schemeId);
  if (tree == null) return [];
  return tree.concepts
    .map((c) => c.notation ?? c.id)
    .filter((n): n is string => n != null && n.length > 0);
}

async function main(): Promise<void> {
  const ontologyScheme = parseOntologySchemeArg();
  const args = Deno.args.filter(
    (a) =>
      a !== "--oneline" &&
      a !== "--" &&
      !a.startsWith("--ontology-scheme="),
  );
  const oneline = Deno.args.includes("--oneline");
  if (args.length === 0) {
    console.error(
      "Usage: scope-discovery.ts <entry-file> [--oneline] [--ontology-scheme=ID]",
    );
    Deno.exit(1);
  }
  const entryArg = args[0]!;
  const entryRel = entryArg.startsWith("/")
    ? entryArg.slice(ROOT.length + 1)
    : entryArg.replace(/^\.\//, "");
  const fullPath = `${ROOT}/${entryRel}`;
  let content: string;
  try {
    content = await Deno.readTextFile(fullPath);
  } catch (e) {
    console.error("Cannot read entry file:", fullPath, e);
    Deno.exit(1);
  }
  const deps = getRelativeImports(entryRel, content);
  if (oneline) {
    console.log([entryRel, ...deps].join(" "));
  } else {
    console.log(entryRel);
    for (const d of deps) console.log(d);
  }
  if (ontologyScheme != null) {
    try {
      const notations = await fetchOntologyNotations(ontologyScheme);
      if (notations.length > 0) {
        if (!oneline) {
          console.log(
            `# ontology (--ontology-scheme=${ontologyScheme}, notation):`,
          );
        }
        if (oneline) {
          console.log(notations.join(" "));
        } else {
          for (const n of notations) console.log(n);
        }
      }
    } catch (e) {
      console.error(
        "Ontology fetch failed (ensure seed:ontology and -A):",
        e,
      );
    }
  }
}

await main();
