//
// DDL/DML filename validation for sql-filename check. Used by
// checkSqlFilename.ts and checkSqlFilenameCollect.ts.
//

const DDL_FILENAME_REGEX =
  /^(\d{2})_([a-z][a-z0-9]*(_[a-z0-9]+)*)\.sql$/;
const DDL_NAME_REGEX = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
const DML_FILENAME_REGEX =
  /^[a-z][a-z0-9]*(_[a-z0-9]+)*\.sql$/;

export function validateDdlFilename(
  base: string,
): string | null {
  const m = base.match(DDL_FILENAME_REGEX);
  if (!m) {
    return 'must match NN_<name>.sql (NN=00-99, name=lowercase snake_case only)';
  }
  return DDL_NAME_REGEX.test(m[2])
    ? null
    : 'name must match ^[a-z][a-z0-9]*(_[a-z0-9]+)*$';
}

export function validateDmlFilename(
  base: string,
): string | null {
  const ok = DML_FILENAME_REGEX.test(base);
  return ok
    ? null
    : 'must be lowercase snake_case (e.g. get_schedule_item.sql)';
}
