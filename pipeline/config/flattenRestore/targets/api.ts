//
// Flatten-restore target config for api/.
//

import type { TargetConfig } from "../types.ts";

function destPath(rel: string): string {
  if (!rel.includes("/")) return `app/${rel}`;
  if (rel.startsWith("record/")) return `config/${rel}`;
  return rel;
}

export const apiTarget: TargetConfig = {
  baseDir: "api",
  flatTempDir: "api_flat_temp",
  mapFileName: "api_distribute_map.json",
  destPath,
  structureTask: "structure:add-c2-dirs:api",
};
