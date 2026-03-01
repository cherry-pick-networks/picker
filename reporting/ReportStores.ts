//
// Report-domain store aggregate. Single entry for tests and wiring.
//

import * as reviewEffortStore from '#analytics/logicapp/reviewEffortStore.ts';
import * as questionBankCoverageStore from '#analytics/function/questionBankCoverageStore.ts';
import * as cohortWeaknessHeatmapStore from '#analytics/config/cohortWeaknessHeatmapStore.ts';
import * as masteryTrajectoryStore from '#analytics/eventhub/masteryTrajectoryStore.ts';
import * as nodeDensityStore from '#analytics/log/nodeDensityStore.ts';
import * as studyTimeRoiStore from '#analytics/templatespec/studyTimeRoiStore.ts';
import * as itemDiscriminationStore from '#analytics/search/itemDiscriminationStore.ts';
import * as pacingDeviationStore from '#analytics/apimanagement/pacingDeviationStore.ts';
import * as bottleneckStore from '#analytics/datafactory/bottleneckStore.ts';

export const ReportStores = {
  reviewEffortStore,
  questionBankCoverageStore,
  cohortWeaknessHeatmapStore,
  masteryTrajectoryStore,
  nodeDensityStore,
  studyTimeRoiStore,
  itemDiscriminationStore,
  pacingDeviationStore,
  bottleneckStore,
};
