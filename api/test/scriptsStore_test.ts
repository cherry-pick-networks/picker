import { assertEquals } from '@std/assert';
import { writeScript } from '#api/config/scriptsStore.ts';

Deno.test('writeScript rejects path escape with 403', async () => {
  const result = await writeScript(
    'x/../../../other',
    'content',
  );
  assertEquals(result.ok, false);
  if (!result.ok) {
    assertEquals(result.status, 403);
  }
});
