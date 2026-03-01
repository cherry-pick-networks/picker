//
// Identity-domain store aggregate. Single entry for tests and wiring.
//

import * as profileStore from './actors/profileStore.ts';
import * as achievementStore from './achievement/store.ts';
import * as curriculumStore from './curriculum/store.ts';
import * as scheduleStore from './schedule/store.ts';

export const IdentityStores = {
  profileStore,
  achievementStore,
  curriculumStore,
  scheduleStore,
};
