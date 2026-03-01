//
// Runs fn with SCRIPTS_BASE set to a temp dir. Cleans up in finally.
// Use so tests do not write into shared/runtime/store/.
//
export async function withTempScriptsStore(
  fn: () => Promise<void>,
  options?: { seedHello?: boolean },
): Promise<void> {
  const tmpDir = await Deno.makeTempDir();
  try {
    if (options?.seedHello) {
      await Deno.writeTextFile(
        `${tmpDir}/hello.txt`,
        'hello from shared/runtime/store',
      );
    }
    Deno.env.set('SCRIPTS_BASE', tmpDir);
    await fn();
  } finally {
    Deno.env.delete('SCRIPTS_BASE');
    await Deno.remove(tmpDir, { recursive: true }).catch(
      () => {
        void tmpDir;
        return;
      },
    );
  }
}
