/**
 * One-off migration: flatten system/<domain>/<artifact>/file.ts to
 * system/<domain>/file.<artifact>.ts and fix all imports.
 * Run from repo root: deno run -A scripts/migration-flatten-system.ts
 */

const SYSTEM = "system";

const MIGRATION_MAP: Record<string, string> = {
  "actor/endpoint/profile.ts": "actor/profile.endpoint.ts",
  "actor/endpoint/profile-patch-input.ts": "actor/profile-patch-input.dto.ts",
  "actor/endpoint/profile.types.ts": "actor/profile.types.ts",
  "actor/service/profile.ts": "actor/profile.service.ts",
  "actor/service/profile-schema.ts": "actor/profile.schema.ts",
  "actor/service/progress.ts": "actor/progress.service.ts",
  "actor/store/profile.ts": "actor/profile.store.ts",
  "content/endpoint/content.ts": "content/content.endpoint.ts",
  "content/service/content.ts": "content/content.service.ts",
  "content/service/content-parse.ts": "content/content-parse.service.ts",
  "content/service/content-prompt.ts": "content/content-prompt.service.ts",
  "content/service/content-prompt-load.ts": "content/content-prompt-load.service.ts",
  "content/service/content-prompt.types.ts": "content/content-prompt.types.ts",
  "content/service/content-worksheet.ts": "content/content-worksheet.service.ts",
  "content/schema/content-schema.ts": "content/content.schema.ts",
  "content/store/content.ts": "content/content.store.ts",
  "source/endpoint/source.ts": "source/source.endpoint.ts",
  "source/service/source.ts": "source/source.service.ts",
  "source/store/source.ts": "source/source.store.ts",
  "script/endpoint/ast.ts": "script/ast.endpoint.ts",
  "script/endpoint/ast-apply.ts": "script/ast-apply.endpoint.ts",
  "script/endpoint/ast-demo.ts": "script/ast-demo.endpoint.ts",
  "script/endpoint/scripts.ts": "script/scripts.endpoint.ts",
  "script/service/ast.ts": "script/ast.service.ts",
  "script/store/scripts.ts": "script/scripts.store.ts",
  "script/store/scripts-types.ts": "script/scripts.types.ts",
  "script/validation/index.ts": "script/governance.validation.ts",
  "record/endpoint/data.ts": "record/data.endpoint.ts",
  "record/store/data.ts": "record/data.store.ts",
  "kv/endpoint/kv.ts": "kv/kv.endpoint.ts",
  "kv/store/kv.ts": "kv/kv.store.ts",
  "audit/log/log.ts": "audit/audit.log.ts",
  "app/config/add.ts": "app/add.config.ts",
  "app/config/home.ts": "app/home.config.ts",
  "app/config/routes-register.ts": "app/routes-register.config.ts",
  "app/config/routes-register-ast.ts": "app/routes-register-ast.config.ts",
};

function resolveRelative(fromDir: string, importPath: string): string {
  const parts = fromDir.split("/").filter(Boolean);
  const importParts = importPath.replace(/\.ts$/, "").split("/").filter(Boolean);
  for (const p of importParts) {
    if (p === "..") parts.pop();
    else if (p !== ".") parts.push(p);
  }
  return parts.join("/") + (importPath.endsWith(".ts") ? ".ts" : "");
}

function relativePath(fromDirPath: string, toFile: string): string {
  const fromParts = fromDirPath.split("/").filter(Boolean);
  const toParts = toFile.split("/").filter(Boolean);
  let i = 0;
  while (
    i < fromParts.length &&
    i < toParts.length &&
    fromParts[i] === toParts[i]
  ) {
    i++;
  }
  const up = fromParts.length - i;
  const down = toParts.slice(i);
  const segments = [...Array(up).fill(".."), ...down];
  const joined = segments.join("/");
  return up === 0 && down.length > 0 && !joined.startsWith(".")
    ? "./" + joined
    : joined;
}

function rewriteImports(
  content: string,
  currentFile: string,
  newFile: string,
  map: Record<string, string>,
): string {
  const currentDir = currentFile.split("/").slice(0, -1).join("/");
  const newDir = newFile.split("/").slice(0, -1).join("/");
  return content.replace(
    /from\s+["']([^"']+)["']/g,
    (_match, importPath: string) => {
      const resolved = resolveRelative(currentDir, importPath);
      const newTarget = map[resolved];
      if (!newTarget) return _match;
      let newRelative = relativePath(newDir, newTarget);
      if (!newRelative.endsWith(".ts")) newRelative += ".ts";
      return `from "${newRelative}"`;
    },
  );
}

async function main() {
  const dryRun = Deno.args.includes("--dry-run");
  if (dryRun) console.log("DRY RUN - no files written or deleted\n");

  for (const [oldPath, newPath] of Object.entries(MIGRATION_MAP)) {
    const fullOld = `${SYSTEM}/${oldPath}`;
    const fullNew = `${SYSTEM}/${newPath}`;
    try {
      const content = await Deno.readTextFile(fullOld);
      const rewritten = rewriteImports(content, oldPath, newPath, MIGRATION_MAP);
      if (!dryRun) {
        await Deno.mkdir(fullNew.split("/").slice(0, -1).join("/"), {
          recursive: true,
        });
        await Deno.writeTextFile(fullNew, rewritten);
      }
      console.log(`${fullOld} -> ${fullNew}`);
    } catch (e) {
      console.error(`Failed ${fullOld}:`, e);
      throw e;
    }
  }

  const routesPath = `${SYSTEM}/routes.ts`;
  let routesContent = await Deno.readTextFile(routesPath);
  const before = routesContent;
  routesContent = routesContent.replace(
    /from\s+["']\.\/app\/config\/routes-register\.ts["']/,
    'from "./app/routes-register.config.ts"',
  );
  if (routesContent !== before && !dryRun) {
    await Deno.writeTextFile(routesPath, routesContent);
    console.log(`Updated ${routesPath}`);
  }

  const externalFiles = [
    "tests/system/main_test.ts",
    "tests/system/scripts_store_test.ts",
    "tests/system/validator_test.ts",
    "shared/prompt/scripts/run-e2e-record.ts",
    "shared/prompt/scripts/migrate-old-to-data.ts",
    "shared/prompt/scripts/migrate-old-to-data-run-identity.ts",
    "shared/prompt/scripts/migrate-old-to-data-run-extracted.ts",
  ];

  for (const rel of externalFiles) {
    try {
      let content = await Deno.readTextFile(rel);
      let changed = false;
      for (const [oldPath, newPath] of Object.entries(MIGRATION_MAP)) {
        const oldFull = `system/${oldPath}`;
        const newFull = `system/${newPath}`;
        if (content.includes(oldFull)) {
          content = content.replaceAll(oldFull, newFull);
          changed = true;
        }
      }
      if (changed && !dryRun) {
        await Deno.writeTextFile(rel, content);
        console.log(`Updated ${rel}`);
      }
    } catch (e) {
      if ((e as Error).name === "NotFound") continue;
      throw e;
    }
  }

  if (dryRun) {
    console.log(
      "\nEmpty dirs to remove after run: endpoint, service, store, schema, validation, log, config",
    );
    return;
  }

  for (const oldPath of Object.keys(MIGRATION_MAP)) {
    const fullOld = `${SYSTEM}/${oldPath}`;
    try {
      await Deno.remove(fullOld);
      console.log(`Deleted ${fullOld}`);
    } catch (e) {
      if ((e as Error).name !== "NotFound") throw e;
    }
  }

  const removedDirs = new Set<string>();
  for (const oldPath of Object.keys(MIGRATION_MAP)) {
    const dir = oldPath.split("/").slice(0, -1).join("/");
    if (dir) removedDirs.add(`${SYSTEM}/${dir}`);
  }
  const dirsByDepth = [...removedDirs].sort(
    (a, b) => b.split("/").length - a.split("/").length,
  );
  for (const d of dirsByDepth) {
    try {
      const entries = [];
      for await (const e of Deno.readDir(d)) entries.push(e);
      if (entries.length === 0) {
        await Deno.remove(d);
        console.log(`Removed empty dir ${d}`);
      }
    } catch {
      // ignore
    }
  }

  console.log("Migration done.");
}

main();
