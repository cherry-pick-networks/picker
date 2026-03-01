//
// Content-domain store aggregate. Single entry for tests and wiring.
//

import * as itemStore from './bank/store.ts';
import * as sourceStore from './material/sourceStore.ts';
import * as chunkStore from './material/chunkStore.ts';
import * as itemEmbeddingStore from './bank/embeddingStore.ts';
import * as lexisStore from './material/lexisStore.ts';

export const ContentStores = {
  itemStore,
  sourceStore,
  chunkStore,
  itemEmbeddingStore,
  lexisStore,
};
