/**
 * SQL (DDL) filename check: shared/infra/schema/*.sql must follow
 * reference.md (Schema DDL file naming). Run from repo root:
 *   deno run --allow-read shared/prompt/scripts/check-sql-filename.ts
 * Or: deno task sql-filename-check
 */

const SCHEMA_DIR = "shared/infra/schema";
const NAME_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const FILENAME_REGEX = /^(\d{2})_([a-z][a-z0-9]*(-[a-z0-9]+)*)\.sql$/;

function validateFilename(base: string): string | null {
  const m = base.match(FILENAME_REGEX);
  if (!m) {
    return "must match NN_<name>.sql (NN=00-99, name=lowercase+hyphens only)";
  }
  const name = m[2];
  if (!NAME_REGEX.test(name)) {
    return "name must match ^[a-z][a-z0-9]*(-[a-z0-9]+)*$";
  }
  return null;
}

async function main(): Promise<void> {
  const root = Deno.cwd();
  const dir = `${root}/${SCHEMA_DIR}`;
  const errors: [string, string][] = [];
  try {
    for await (const e of Deno.readDir(dir)) {
      if (!e.isFile || !e.name.endsWith(".sql")) continue;
      const rel = `${SCHEMA_DIR}/${e.name}`;
      const err = validateFilename(e.name);
      if (err) errors.push([rel, err]);
    }
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      console.error(`${SCHEMA_DIR} not found`);
      Deno.exit(1);
    }
    throw e;
  }
  if (errors.length > 0) {
    console.error("SQL filename check failed (reference.md Schema DDL naming):");
    for (const [file, msg] of errors) console.error(`  ${file}: ${msg}`);
    Deno.exit(1);
  }
  console.log(
    `SQL filename check passed: ${SCHEMA_DIR} files follow naming rules.`,
  );
}

main();
