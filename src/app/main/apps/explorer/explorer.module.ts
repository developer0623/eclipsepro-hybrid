import * as angular from "angular";
import downtimeModule from "./downtime/downtime.module";
import goodProductionModule from "./good-production/good-production.module";
import scrapModule from "./scrap/scrap.module";
import oeeModule from "./oee/oee.module";
import targetModule from "./target/target.module";
import pathfinderModule from "./pathfinder-goodparts/pathfinder.module";
import pathfinderOperationsModule from "./pathfinder-operations/pathfinder-operations.module";

import DcParetoChart from './components/dc-pareto-chart.component';
import DcLinearbarChart from "./components/dc-linear-bar-chart.component";
import DcTimeBarChart from "./components/dc-time-bar-chart.component";

export default angular
  .module('app.explorer', [
    downtimeModule,
    goodProductionModule,
    scrapModule,
    oeeModule,
    targetModule,
    pathfinderModule,
    pathfinderOperationsModule
  ])
  .component(DcLinearbarChart.selector, DcLinearbarChart)
  .component(DcParetoChart.selector, DcParetoChart)
  .component(DcTimeBarChart.selector, DcTimeBarChart)
  .config(config)
  .name;

/** @ngInject */
function config() {
}

