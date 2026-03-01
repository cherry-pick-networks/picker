//
// Types for shared flatten-restore. See PRIMER.md § Flatten-restore.
//

/** Target config for one component (api, identity, etc.). */
export interface TargetConfig {
  /** Base directory under project root (e.g. "api", "identity"). */
  baseDir: string;
  /** Temp dir name for flat files (e.g. "api_flat_temp"). Must not sit under baseDir. */
  flatTempDir: string;
  /** Map file name for distribute step (e.g. "api_distribute_map.json"). */
  mapFileName: string;
  /** Map relative path within baseDir to final relative path under baseDir. */
  destPath: (rel: string) => string;
  /** Deno task to run after flatten to create c2 dirs (e.g. "structure:add-c2-dirs:api"). Omit to skip. */
  structureTask?: string;
}
