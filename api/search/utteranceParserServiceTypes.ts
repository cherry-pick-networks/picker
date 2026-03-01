//  Utterance parse result types. Used by utteranceParserService and cache.

export type ParseSuccess = {
  ok: true;
  source_id: string;
  days: number[];
};

export type ParseFailure = {
  ok: false;
  reason: 'no_days' | 'unknown_source' | 'parse_error';
};

export type UtteranceParseResult =
  | ParseSuccess
  | ParseFailure;
