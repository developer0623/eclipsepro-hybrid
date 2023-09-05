import angular from 'angular';
import machinesModule from './machines/machines.module';
import machineModule from './machine/machine.module';
import BulletChartPreview from './components/bullet-chart-preview.component';
import BulletChart from './components/bullet-chart.component';
import DeviceDashboardMini from './components/device-dashboard-mini.component';
import LockoutIndicator from './components/lockout.component';
import MachineDashboardLarge from './components/machine-dashboard-large.component';
import MachineDashboardMini, { obscureNumberString } from './components/machine-dashboard-mini.component';
import MetricLarge_ from './components/metric-large.component';
import HoleCountModeIcon from './components/misc.components';
import Pareto from './components/pareto.component';
import RunStateIndicator from './components/run-state.component';
import ScheduleSummary from './components/schedule-summary.component';
import ShiftHistoryChart from './components/shift-history-chart.component';
import ShiftSummary from './components/shiftSummary';
import SnapshotBar from './components/snapshot-bar.component';
import Sparkline from './components/sparkline.component';
import ShiftSelect_ from './components/shift-select.component';

export default angular
    .module('app.dashboards.machines', [
        machinesModule,
        machineModule
    ])
    .component('bulletChartPreview', BulletChartPreview)
    .component('bulletChart', BulletChart)
    .component('deviceDashboardMini', DeviceDashboardMini)
    .component('lockoutIndicator', LockoutIndicator)
    .component('machineDashboardLarge', MachineDashboardLarge)
    .component('machineDashboardMini', MachineDashboardMini)
    // .component('metricLarge', MetricLarge)
    .component(MetricLarge_.selector, MetricLarge_)
    .component('holeCountModeIcon', HoleCountModeIcon)
    .component('pareto', Pareto)
    .component('runStateIndicator', RunStateIndicator)
    .component('scheduleSummary', ScheduleSummary)
    .component('shiftHistoryChart', ShiftHistoryChart)
    .component('shiftSummary', ShiftSummary)
    .component('snapshotBar', SnapshotBar)
    .component('sparkline', Sparkline)
    .component(ShiftSelect_.selector, ShiftSelect_)
    .filter('obscureNumberString', ['$filter', obscureNumberString])
    .name;
