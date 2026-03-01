// function-length-ignore-file — CI/utility script (§P reserved).
//
// Print direct dependencies of an entry file (for AI session todo).
// Only relative imports (./ or ../) are resolved; npm/jsr are skipped.
// Run: deno task todo-discovery -- <entry-file>
// Options: --oneline  print paths on one line for pasting into a prompt.
//
import { Project } from 'ts-morph';
import { resolvePath } from './todoDiscoveryResolve.ts';

const ROOT = Deno.cwd();

function getRelativeImports(
  entryPath: string,
  content: string,
): string[] {
  const project = new Project({
    useInMemoryFileSystem: true,
  });
  const src = project.createSourceFile(entryPath, content, {
    overwrite: true,
  });
  const out: string[] = [];
  for (const imp of src.getImportDeclarations()) {
    const spec = imp.getModuleSpecifierValue();
    const resolved = resolvePath(entryPath, spec);
    if (resolved && !out.includes(resolved)) {
      out.push(resolved);
    }
  }
  return out;
}

async function main(): Promise<void> {
  const args = Deno.args.filter((a) =>
    a !== '--oneline' && a !== '--'
  );
  const oneline = Deno.args.includes('--oneline');
  if (args.length === 0) {
    console.error(
      'Usage: todoDiscovery.ts <entry-file> [--oneline]',
    );
    Deno.exit(1);
  }
  const entryArg = args[0]!;
  const entryRel = entryArg.startsWith('/')
    ? entryArg.slice(ROOT.length + 1)
    : entryArg.replace(/^\.\//, '');
  const fullPath = `${ROOT}/${entryRel}`;
  let content: string;
  try {
    content = await Deno.readTextFile(fullPath);
  } catch (e) {
    console.error('Cannot read entry file:', fullPath, e);
    Deno.exit(1);
  }
  const deps = getRelativeImports(entryRel, content);
  if (oneline) {
    console.log([entryRel, ...deps].join(' '));
  } else {
    console.log(entryRel);
    for (const d of deps) console.log(d);
  }
}

await main();
