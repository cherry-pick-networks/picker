//
// Flatten-restore target config for identity/.
// No structure task; dirs are created during distribute via mkdir recursive.
//

import type { TargetConfig } from "../types.ts";

export const identityTarget: TargetConfig = {
  baseDir: "identity",
  flatTempDir: "identity_flat_temp",
  mapFileName: "identity_distribute_map.json",
  destPath: (rel) => rel,
};
