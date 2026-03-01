// function-length-ignore-file — CI/utility script (§P reserved).
//
// Logical structure check: (1) no cross-component store import,
// (2) cross-component imports only to public API (Endpoint/OpenApi),
// (3) dependency acyclic and in allowed matrix. Run: deno task
// logical-structure-check
//

import {
  ALLOWED_EDGES,
  getComponentRoots,
  getRootDir,
  isPublicEntry,
  PATH_KEY_TO_DOMAIN,
  DEPENDENCY_DOMAIN_KEYS,
  whichComponent,
  resolveImportToRootRelative,
} from './logicalStructureConfig.ts';
import { extractImports, findCycle, findTsFiles } from './checkDomainDepsHelpers.ts';

type Violation =
  | { kind: 'boundary'; file: string; importPath: string }
  | { kind: 'public-api'; file: string; importPath: string; targetPath: string }
  | { kind: 'dependency-disallowed'; from: string; to: string }
  | { kind: 'dependency-cycle'; cycle: string[] };

function isStoreLikePath(rootRel: string): boolean {
  return (
    /Store\.ts$/i.test(rootRel) ||
    /\.store\.ts$/i.test(rootRel) ||
    /\/[^/]*Store[^/]*\.ts$/i.test(rootRel)
  );
}

async function main(): Promise<void> {
  const root = getRootDir();
  const roots = getComponentRoots();
  const violations: Violation[] = [];
  const edgeList: [string, string][] = [];

  for (const [compKey, compRoot] of Object.entries(roots)) {
    const absDir = `${root}/${compRoot}`;
    try {
      await Deno.stat(absDir);
    } catch {
      continue;
    }
    for await (const absPath of findTsFiles(absDir)) {
      const fromRootRel = absPath.slice(root.length + 1);
      const fromComp = whichComponent(fromRootRel, roots);
      if (fromComp === null) continue;
      const content = await Deno.readTextFile(absPath);
      for (const spec of extractImports(content)) {
        const targetRootRel = resolveImportToRootRelative(
          fromRootRel,
          spec.replace(/\?.*$/, ''),
          root,
        );
        if (targetRootRel === null) continue;
        const toComp = whichComponent(targetRootRel, roots);
        if (toComp === null) continue;
        if (fromComp === toComp) continue;

        if (isStoreLikePath(targetRootRel)) {
          violations.push({
            kind: 'boundary',
            file: fromRootRel,
            importPath: spec,
          });
        }
        const toRoot = roots[toComp];
        if (!isPublicEntry(targetRootRel, toRoot)) {
          violations.push({
            kind: 'public-api',
            file: fromRootRel,
            importPath: spec,
            targetPath: targetRootRel,
          });
        }

        const fromDom = PATH_KEY_TO_DOMAIN[fromComp];
        const toDom = PATH_KEY_TO_DOMAIN[toComp];
        if (
          fromDom !== undefined &&
          toDom !== undefined &&
          DEPENDENCY_DOMAIN_KEYS.includes(fromComp as never) &&
          DEPENDENCY_DOMAIN_KEYS.includes(toComp as never)
        ) {
          edgeList.push([fromDom, toDom]);
        }
      }
    }
  }

  const allowedSet = new Set(
    ALLOWED_EDGES.map(([a, b]) => `${a}\t${b}`),
  );
  const edgeSet = new Set<string>();
  for (const [a, b] of edgeList) {
    const key = `${a}\t${b}`;
    if (edgeSet.has(key)) continue;
    edgeSet.add(key);
    if (!allowedSet.has(key)) {
      violations.push({
        kind: 'dependency-disallowed',
        from: a,
        to: b,
      });
    }
  }
  const graph = new Map<string, string[]>();
  for (const [a, b] of edgeList) {
    const list = graph.get(a) ?? [];
    if (!list.includes(b)) list.push(b);
    graph.set(a, list);
  }
  const cycle = findCycle(graph);
  if (cycle !== null) {
    violations.push({ kind: 'dependency-cycle', cycle });
  }

  if (violations.length > 0) {
    console.error(
      'Logical structure violation(s). See MANUAL.md § Modular monolith.',
    );
    for (const v of violations) {
      if (v.kind === 'boundary') {
        console.error(`  [boundary] ${v.file} → ${v.importPath}`);
      } else if (v.kind === 'public-api') {
        console.error(
          `  [public-api] ${v.file} → ${v.importPath} (${v.targetPath})`,
        );
      } else if (v.kind === 'dependency-disallowed') {
        console.error(`  [dependency] ${v.from} → ${v.to} not in matrix`);
      } else {
        console.error(`  [cycle] ${v.cycle.join(' → ')}`);
      }
    }
    Deno.exit(1);
  }
  console.log(
    'Logical structure check passed: boundary, public API, dependency.',
  );
}

main();
