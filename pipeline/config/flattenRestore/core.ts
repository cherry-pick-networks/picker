//
// Shared flatten-restore: flatten baseDir to root, clear dirs, optional structure task, distribute, remove empty dirs.
// Run from project root. Used by flattenRestoreApi.ts and flattenRestoreIdentity.ts.
//

import { join, dirname } from "@std/path";
import type { TargetConfig } from "./types.ts";

async function collectFiles(
  dir: string,
  prefix: string,
  skipNames: Set<string>,
): Promise<{ rel: string; abs: string }[]> {
  const out: { rel: string; abs: string }[] = [];
  for await (const e of Deno.readDir(dir)) {
    const name = e.name;
    if (skipNames.has(name)) continue;
    const abs = join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    const info = await Deno.stat(abs);
    if (info.isDirectory) {
      out.push(...(await collectFiles(abs, rel, skipNames)));
    } else {
      out.push({ rel, abs });
    }
  }
  return out;
}

export async function runFlattenRestore(
  config: TargetConfig,
  root: string = Deno.cwd(),
): Promise<void> {
  const base = join(root, config.baseDir);
  const tempDir = join(root, config.flatTempDir);
  const skipNames = new Set([config.flatTempDir, config.mapFileName]);

  // 1. Collect files and build mapping (flat name -> dest path)
  const files = await collectFiles(base, "", skipNames);
  const seen = new Map<string, string>();
  const mapping: Record<string, string> = {};
  const sorted = files.sort(
    (a, b) =>
      (a.rel.split("/").length - b.rel.split("/").length) ||
      a.rel.localeCompare(b.rel),
  );
  for (const { rel, abs } of sorted) {
    const baseName = rel.replace(/.*\//, "");
    let flatName: string;
    if (!seen.has(baseName)) {
      seen.set(baseName, rel);
      flatName = baseName;
      mapping[flatName] = config.destPath(rel);
    } else {
      flatName = rel.replace(/\//g, "_").replace(/\\/g, "_");
      mapping[flatName] = config.destPath(rel);
    }
    const destFile = join(tempDir, flatName);
    await Deno.mkdir(tempDir, { recursive: true });
    await Deno.copyFile(abs, destFile);
  }
  await Deno.writeTextFile(
    join(root, config.mapFileName),
    JSON.stringify(mapping, null, 0),
  );
  console.log(`Flattened ${files.length} files to ${config.flatTempDir}`);

  // 2. Delete everything under baseDir
  for await (const e of Deno.readDir(base)) {
    const path = join(base, e.name);
    if (skipNames.has(e.name)) continue;
    await Deno.remove(path, { recursive: true });
  }
  console.log(`Cleared ${config.baseDir}/`);

  // 3. Move flat files into baseDir
  for await (const e of Deno.readDir(tempDir)) {
    await Deno.rename(join(tempDir, e.name), join(base, e.name));
  }
  await Deno.remove(tempDir, { recursive: true });
  console.log(`Moved flat files to ${config.baseDir}/`);

  // 4. Run structure task if configured
  if (config.structureTask) {
    const structure = new Deno.Command("deno", {
      args: ["task", config.structureTask],
      cwd: root,
      stdout: "inherit",
      stderr: "inherit",
    });
    const res = await structure.output();
    if (!res.success) {
      throw new Error(`deno task ${config.structureTask} exited ${res.code}`);
    }
    console.log("Created c2 dirs");
  }

  // 5. Distribute files using mapping
  const map = JSON.parse(
    await Deno.readTextFile(join(root, config.mapFileName)),
  ) as Record<string, string>;
  let moved = 0;
  for await (const e of Deno.readDir(base)) {
    if (e.isFile && e.name !== config.mapFileName) {
      const destRel = map[e.name];
      if (!destRel) continue;
      const dest = join(base, destRel);
      await Deno.mkdir(dirname(dest), { recursive: true });
      await Deno.rename(join(base, e.name), dest);
      moved++;
    }
  }
  console.log(`Distributed ${moved} files`);

  // 6. Delete empty dirs (deepest first)
  async function collectDirs(dir: string): Promise<string[]> {
    const list: string[] = [];
    for await (const e of Deno.readDir(dir)) {
      if (!e.isDirectory) continue;
      const path = join(dir, e.name);
      list.push(path, ...(await collectDirs(path)));
    }
    return list;
  }
  const allDirs = await collectDirs(base);
  const byDepth = allDirs.sort(
    (a, b) => b.split("/").length - a.split("/").length,
  );
  for (const p of byDepth) {
    try {
      let hasAny = false;
      for await (const _ of Deno.readDir(p)) {
        hasAny = true;
        break;
      }
      if (!hasAny) await Deno.remove(p);
    } catch {
      /* already removed */
    }
  }
  console.log(`Removed empty dirs under ${config.baseDir}/`);

  await Deno.remove(join(root, config.mapFileName));
  console.log("Done.");
}
