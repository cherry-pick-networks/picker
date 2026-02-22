/**
 * Domain boundary check: fail if any system/<domain> file imports another
 * domain's *.store.ts. Cross-domain access must use that domain's service.
 * Run from repo root: deno run --allow-read shared/prompt/scripts/check-domain-boundary.ts
 */

const SYSTEM_DIR = "system";
const DOMAINS = [
  "actor",
  "content",
  "source",
  "script",
  "record",
  "kv",
  "audit",
  "app",
];

const IMPORT_RE = /from\s+["']([^"']+)["']/g;

async function* findTsFiles(dir: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(dir)) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory) {
      yield* findTsFiles(path);
    } else if (entry.name.endsWith(".ts")) {
      yield path;
    }
  }
}

function extractImports(content: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = IMPORT_RE.exec(content)) !== null) out.push(m[1]);
  return out;
}

function isCrossDomainStoreImport(
  importPath: string,
  currentDomain: string,
): boolean {
  if (!importPath.startsWith("../")) return false;
  const rest = importPath.slice(3);
  const nextSlash = rest.indexOf("/");
  const otherDomain = nextSlash === -1 ? rest : rest.slice(0, nextSlash);
  if (otherDomain === currentDomain) return false;
  if (!DOMAINS.includes(otherDomain)) return false;
  return rest.includes(".store") || rest.endsWith(".store");
}

async function main(): Promise<void> {
  const root = Deno.cwd();
  const systemPath = `${root}/${SYSTEM_DIR}`;
  const violations: { file: string; importPath: string }[] = [];

  for (const domain of DOMAINS) {
    const domainDir = `${systemPath}/${domain}`;
    try {
      await Deno.stat(domainDir);
    } catch {
      continue;
    }
    for await (const filePath of findTsFiles(domainDir)) {
      const content = await Deno.readTextFile(filePath);
      const relPath = filePath.slice(root.length + 1);
      for (const imp of extractImports(content)) {
        if (isCrossDomainStoreImport(imp, domain)) {
          violations.push({ file: relPath, importPath: imp });
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error(
      "Domain boundary violation: do not import another domain's store. Use that domain's service.",
    );
    for (const v of violations) {
      console.error(`  ${v.file} → ${v.importPath}`);
    }
    Deno.exit(1);
  }
  console.log(
    "Domain boundary check passed: no cross-domain store imports.",
  );
}

main();
