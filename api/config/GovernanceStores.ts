//
// Governance-domain store aggregate. Single entry for tests and wiring.
//

import * as conceptStore from './conceptStore.ts';
import * as conceptStoreAllowlist from './conceptStoreAllowlist.ts';
import * as unitConceptStore from './unitConceptStore.ts';
import * as scriptsStore from './scriptsStore.ts';

export const GovernanceStores = {
  conceptStore,
  conceptStoreAllowlist,
  unitConceptStore,
  scriptsStore,
};
