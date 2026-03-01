//
// Report-domain store aggregate. Single entry for tests and wiring.
//

import * as reviewEffortStore from '#analytics/logic_app/reviewEffortStore.ts';
import * as questionBankCoverageStore from '#analytics/function/questionBankCoverageStore.ts';
import * as cohortWeaknessHeatmapStore from '#analytics/config/cohortWeaknessHeatmapStore.ts';
import * as masteryTrajectoryStore from '#analytics/event_hub/masteryTrajectoryStore.ts';
import * as nodeDensityStore from '#analytics/log/nodeDensityStore.ts';
import * as studyTimeRoiStore from '#analytics/template_spec/studyTimeRoiStore.ts';
import * as itemDiscriminationStore from '#analytics/search/itemDiscriminationStore.ts';
import * as pacingDeviationStore from '#analytics/api_management/pacingDeviationStore.ts';
import * as bottleneckStore from '#analytics/data_factory/bottleneckStore.ts';

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
