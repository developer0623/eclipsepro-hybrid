import angular from "angular";
import DurationDisplayComp from "./durationDisplay.component";
import FoldersGrid from "./folders-grid.component";
import PathfinderUsersGrid from "./pathfinder-users-grid.component";
import StoreStatisticsComp from "./store.diagnostics.component";
import ProductionLog from "./production-log.component";
import LinkHelper from './link-helper/link-helper.component';
import HelpIcon_ from './help-icon.component';
import ConsumptionSummary from './consumption-summary.component';
import AmsTabs from './ams-tabs/tabs';
import JobDetailPreview from "./link-helper/job-detail-preview.component";
import PunchPatternlPreview from "./link-helper/punch-pattern-preview.component";
import CoilTypelPreview from "./link-helper/coil-type-preview.component";

export default angular
   .module("app.components", [AmsTabs])
   // .module("app.components", [])
   .component("durationDisplay", DurationDisplayComp)
   .component(FoldersGrid.selector, FoldersGrid)
   .component(PathfinderUsersGrid.selector, PathfinderUsersGrid)
   .component(ProductionLog.selector, ProductionLog)
   .component(ConsumptionSummary.selector, ConsumptionSummary)
   .component(LinkHelper.selector, LinkHelper)
   .component("storeStatistics", StoreStatisticsComp)
   .component(HelpIcon_.selector, HelpIcon_)
   .component(JobDetailPreview.selector, JobDetailPreview)
   .component(PunchPatternlPreview.selector, PunchPatternlPreview)
   .component(CoilTypelPreview.selector, CoilTypelPreview)
   .name;
