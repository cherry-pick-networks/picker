/**
 * Classify file paths by scope (path prefix) for multi-scope commit grouping.
 * Output: one line per path "scope\tpath" so that sort groups by scope.
 *
 * Usage:
 *   deno task scope-of-paths -- path1 path2 ...
 *   git status --porcelain | deno task scope-of-paths
 * Or with no args: runs `git status --porcelain` and classifies changed paths.
 *
 * Scopes align with store.md §U and shared/prompt/boundary.md (longest match).
 */
// function-length-ignore-file

/** Path prefixes that define scope (longest first for matching). */
const SCOPE_PREFIXES: string[] = [
  "shared/runtime/store/",
  "shared/prompt/",
  "shared/infra/",
  "shared/runtime/",
  "system/app/config/",
  "system/actor/",
  "system/content/",
  "system/source/",
  "system/script/",
  "system/record/",
  "system/kv/",
  "system/audit/",
  "system/app/",
  ".github/",
  "system/",
  "shared/",
];

function pathToScope(path: string): string {
  const normalized = path.replace(/^\.\//, "").replace(/\\/g, "/");
  for (const prefix of SCOPE_PREFIXES) {
    const hasSlash = prefix.endsWith("/");
    const match = normalized === prefix ||
      normalized.startsWith(prefix) &&
        (hasSlash || normalized.length === prefix.length ||
          normalized[prefix.length] === "/");
    if (match) return prefix.replace(/\/$/, "") || prefix;
  }
  if (normalized.includes("/")) return normalized.split("/")[0] ?? "root";
  return "root";
}

function parsePathsFromGitPorcelain(stdin: string): string[] {
  const paths: string[] = [];
  for (const line of stdin.split(/\r?\n/)) {
    if (line.length < 4) continue;
    const rest = line.slice(3).trim();
    if (rest.includes(" -> ")) {
      const dest = rest.split(" -> ")[1]?.trim();
      if (dest) paths.push(dest);
    } else {
      const first = rest.split(/\s+/)[0];
      if (first) paths.push(first);
    }
  }
  return paths;
}

async function main(): Promise<void> {
  const args = Deno.args.filter((a) => a !== "--" && !a.startsWith("-"));
  let paths: string[];
  if (args.length > 0) {
    paths = args;
  } else {
    const p = new Deno.Command("git", {
      args: ["status", "--porcelain"],
      stdout: "piped",
      stderr: "null",
    });
    const out = await p.output();
    const text = new TextDecoder().decode(out.stdout);
    paths = parsePathsFromGitPorcelain(text);
  }
  const seen = new Set<string>();
  for (const path of paths) {
    const scope = pathToScope(path);
    const key = `${scope}\t${path}`;
    if (!seen.has(key)) {
      seen.add(key);
      console.log(`${scope}\t${path}`);
    }
  }
}

main();
