/**
 * Read and parse JSON file for migrate-old-to-data.
 */

export async function readAndParse(
  abs: string,
): Promise<{ raw: string; parsed: unknown }> {
  const raw = await Deno.readTextFile(abs);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  return { raw, parsed };
}
