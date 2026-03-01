//
// daysParser: regex extraction of day numbers from Korean utterance.
//

import { assertEquals } from '@std/assert';
import {
  parseDays,
  parseDaysWithRegex,
} from '#api/search/services/daysParser.ts';

Deno.test('parseDaysWithRegex single day', () => {
  assertEquals(parseDaysWithRegex('17일차'), [17]);
  assertEquals(
    parseDaysWithRegex('워드마스터 17일차 단어'),
    [17],
  );
});

Deno.test('parseDaysWithRegex range with middle dot', () => {
  assertEquals(parseDaysWithRegex('17·18일차'), [17, 18]);
  assertEquals(
    parseDaysWithRegex('17·18일차 단어 알려줘'),
    [17, 18],
  );
});

Deno.test('parseDaysWithRegex range hyphen and tilde', () => {
  assertEquals(parseDaysWithRegex('1-5일차'), [
    1,
    2,
    3,
    4,
    5,
  ]);
  assertEquals(parseDaysWithRegex('3~4일차'), [3, 4]);
});

Deno.test('parseDaysWithRegex reversed range normalizes to ascending', () => {
  assertEquals(parseDaysWithRegex('18·17일차'), [17, 18]);
});

Deno.test('parseDaysWithRegex multiple singles', () => {
  assertEquals(
    parseDaysWithRegex('17일차 18일차 단어'),
    [17, 18],
  );
});

Deno.test('parseDaysWithRegex no match returns null', () => {
  assertEquals(parseDaysWithRegex('단어 알려줘'), null);
  assertEquals(parseDaysWithRegex(''), null);
});

Deno.test('parseDays success', () => {
  const r = parseDays('중등 실력 17·18일차');
  assertEquals(r.ok, true);
  if (r.ok) assertEquals(r.days, [17, 18]);
});

Deno.test('parseDays failure when no days', () => {
  const r = parseDays('단어만 알려줘');
  assertEquals(r.ok, false);
});
