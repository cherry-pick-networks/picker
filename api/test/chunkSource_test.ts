//
// chunkSource: chunkBody splits by paragraph and caps size.
//

import { assertEquals } from '@std/assert';
import { chunkBody } from '#api/search/services/chunkSource.ts';

Deno.test('chunkBody returns single chunk for short text', () => {
  const out = chunkBody('One paragraph.');
  assertEquals(out, ['One paragraph.']);
});

Deno.test('chunkBody splits by double newline', () => {
  const out = chunkBody('First.\n\nSecond.');
  assertEquals(out, ['First.', 'Second.']);
});

Deno.test('chunkBody splits long segment into multiple', () => {
  const long = 'a'.repeat(600);
  const out = chunkBody(long);
  assertEquals(out.length >= 2, true);
  out.forEach((s) => assertEquals(s.length <= 500, true));
});
