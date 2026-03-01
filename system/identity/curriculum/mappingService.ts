//
// Orchestrate curriculum dump → LLM mapping → optional file save.
//

import { getPath } from '#context/scripts/pathConfig.ts';
import { buildDumpText } from './dumpService.ts';
import { IdentityLlmService } from '#system/identity/IdentityLlmService.ts';
import type { CurriculumMappingOutput } from './mappingSchema.ts';

export type MappingServiceResult =
  | {
    ok: true;
    mapping: CurriculumMappingOutput;
    saved?: boolean;
  }
  | { ok: false; status: 400 | 404 | 502; message: string };

function safeFilenameSegment(s: string): string {
  return s.replace(/[^a-zA-Z0-9-_]/g, '_');
}

async function saveMapping(
  mapping: CurriculumMappingOutput,
): Promise<boolean> {
  const dir = getPath('infraMapping');
  await Deno.mkdir(dir, { recursive: true });
  await Deno.writeTextFile(
    `${dir}/${safeFilenameSegment(mapping.level)}-${
      safeFilenameSegment(mapping.national_standard)
    }.json`,
    JSON.stringify(mapping, null, 2),
  );
  return true;
}

//
// Produce external-standard mapping for a level. Optionally save to infraMapping.
//
async function runGenerateMapping(
  dump: string,
  nationalStandard: string,
  level: string,
): Promise<MappingServiceResult> {
  const llm = await IdentityLlmService.generateMapping(
    dump,
    nationalStandard,
    level,
  );
  if (!llm.ok) {
    return { ok: false, status: 502, message: llm.error };
  }
  return { ok: true, mapping: llm.output, saved: false };
}

async function applySave(
  result: { ok: true; mapping: CurriculumMappingOutput },
  saveToFile: boolean,
): Promise<MappingServiceResult> {
  if (!saveToFile) return result;
  const saved = await saveMapping(result.mapping);
  return { ok: true, mapping: result.mapping, saved };
}

async function getDumpThenMapping(options: {
  level: string;
  national_standard: string;
}): Promise<MappingServiceResult> {
  const dump = await buildDumpText({
    level: options.level,
  });
  if (dump.length === 0) {
    return {
      ok: false,
      status: 404,
      message:
        `No curriculum data for level: ${options.level}`,
    };
  }
  return runGenerateMapping(
    dump,
    options.national_standard,
    options.level,
  );
}

export async function produceMapping(options: {
  level: string;
  national_standard: string;
  save_to_file?: boolean;
}): Promise<MappingServiceResult> {
  const result = await getDumpThenMapping(options);
  return result.ok
    ? await applySave(result, options.save_to_file ?? false)
    : result;
}
