//
// Flatten api/ to root, delete dirs, run c2 structure script, distribute files, delete empty dirs.
// Run from project root. Usage: deno run -A pipeline/config/apiFlattenRestore.ts
//

const API_DIR = "api";
const FLAT_TEMP = "api_flat_temp";
const MAP_FILE = "api_distribute_map.json";

function destPath(rel: string): string {
  if (!rel.includes("/")) return `app/${rel}`;
  if (rel.startsWith("record/")) return `config/${rel}`;
  return rel;
}

async function collectFiles(
  dir: string,
  prefix: string,
): Promise<{ rel: string; abs: string }[]> {
  const out: { rel: string; abs: string }[] = [];
  for await (const e of Deno.readDir(dir)) {
    const name = e.name;
    if (name === FLAT_TEMP || name === MAP_FILE) continue;
    const abs = `${dir}/${name}`;
    const rel = prefix ? `${prefix}/${name}` : name;
    const info = await Deno.stat(abs);
    if (info.isDirectory) {
      out.push(...(await collectFiles(abs, rel)));
    } else {
      out.push({ rel, abs });
    }
  }
  return out;
}

async function main(): Promise<void> {
  const root = Deno.cwd();
  const api = `${root}/${API_DIR}`;
  const tempDir = `${root}/${FLAT_TEMP}`;

  // 1. Collect files and build mapping (flat name -> dest path)
  const files = await collectFiles(api, "");
  const seen = new Map<string, string>();
  const mapping: Record<string, string> = {};
  const sorted = files.sort(
    (a, b) =>
      (a.rel.split("/").length - b.rel.split("/").length) ||
      a.rel.localeCompare(b.rel),
  );
  for (const { rel, abs } of sorted) {
    const base = rel.replace(/.*\//, "");
    let flatName: string;
    if (!seen.has(base)) {
      seen.set(base, rel);
      flatName = base;
      mapping[flatName] = destPath(rel);
    } else {
      flatName = rel.replace(/\//g, "_").replace(/\\/g, "_");
      mapping[flatName] = destPath(rel);
    }
    const destFile = `${tempDir}/${flatName}`;
    await Deno.mkdir(tempDir, { recursive: true });
    await Deno.copyFile(abs, destFile);
  }
  await Deno.writeTextFile(
    `${root}/${MAP_FILE}`,
    JSON.stringify(mapping, null, 0),
  );
  console.log(`Flattened ${files.length} files to ${FLAT_TEMP}`);

  // 2. Delete everything under api/
  for await (const e of Deno.readDir(api)) {
    const path = `${api}/${e.name}`;
    if (e.name === FLAT_TEMP || e.name === MAP_FILE) continue;
    await Deno.remove(path, { recursive: true });
  }
  console.log("Cleared api/");

  // 3. Move flat files into api/
  for await (const e of Deno.readDir(tempDir)) {
    await Deno.rename(`${tempDir}/${e.name}`, `${api}/${e.name}`);
  }
  await Deno.remove(tempDir, { recursive: true });
  console.log("Moved flat files to api/");

  // 4. Run structure:add-c2-dirs:api
  const structure = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "-A",
      "pipeline/config/structureAddC2Dirs.ts",
      "api",
    ],
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  const res = await structure.output();
  if (!res.success) {
    throw new Error(`structureAddC2Dirs exited ${res.code}`);
  }
  console.log("Created c2 dirs");

  // 5. Distribute files using mapping
  const map = JSON.parse(
    await Deno.readTextFile(`${root}/${MAP_FILE}`),
  ) as Record<string, string>;
  let moved = 0;
  for await (const e of Deno.readDir(api)) {
    if (e.isFile && e.name !== MAP_FILE) {
      const destRel = map[e.name];
      if (!destRel) continue;
      const dest = `${api}/${destRel}`;
      await Deno.mkdir(dest.replace(/\/[^/]+$/, ""), { recursive: true });
      await Deno.rename(`${api}/${e.name}`, dest);
      moved++;
    }
  }
  console.log(`Distributed ${moved} files`);

  // 6. Delete empty dirs at any depth (collect then remove deepest first)
  async function collectDirs(dir: string): Promise<string[]> {
    const list: string[] = [];
    for await (const e of Deno.readDir(dir)) {
      if (!e.isDirectory) continue;
      const path = `${dir}/${e.name}`;
      list.push(path, ...(await collectDirs(path)));
    }
    return list;
  }
  const allDirs = await collectDirs(api);
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
  console.log("Removed empty dirs under api/");

  await Deno.remove(`${root}/${MAP_FILE}`);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
