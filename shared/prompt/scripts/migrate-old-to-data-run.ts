/**
 * Migration runners: extracted (knowledge/content) and identity.
 * Re-exports from run-extracted and run-identity for backward compatibility.
 */

export { runExtractedMigration } from "./migrate-old-to-data-run-extracted.ts";
export { runIdentityMigration } from "./migrate-old-to-data-run-identity.ts";
