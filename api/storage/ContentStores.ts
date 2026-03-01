//
// Content-domain store aggregate. Single entry for tests and wiring.
//

import * as itemStore from '#api/search/assets/bankStore.ts';
import * as sourceStore from './catalog/sourceStore.ts';
import * as chunkStore from './catalog/chunkStore.ts';
import * as itemEmbeddingStore from '#api/search/assets/bankEmbeddingStore.ts';
import * as lexisStore from './catalog/lexisStore.ts';

export const ContentStores = {
  itemStore,
  sourceStore,
  chunkStore,
  itemEmbeddingStore,
  lexisStore,
};
