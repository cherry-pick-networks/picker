/**
 * Type declaration for "ts-morph" so IDE/TypeScript can resolve the module
 * when it is provided by deno.json import map (jsr:@ts-morph/ts-morph@^27).
 */
declare module 'ts-morph' {
  export class Project {
    constructor(options?: { useInMemoryFileSystem?: boolean });
    createSourceFile(
      filePath: string,
      sourceText: string,
    ): {
      getVariableDeclarations(): Array<{ getName(): string }>;
    };
  }
}
