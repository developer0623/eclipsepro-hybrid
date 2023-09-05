import angular from 'angular';
import ProductionSummaryReport_ from './production-summary.component';
import MachineSummary from './components/machine-summary.component';
import PrintSummary from './components/print-machine-summary.component';
import PrintSummaryState from './components/print-summary-state.component';
import PrintSummaryTimebar from './components/print-summary-timebar.component';
import SummaryHistory from './components/summary-history.component';
import SummaryState from './components/summary-state.component';
import SummaryTimebar from './components/summary-timebar.component';
import { headerTooltip } from './directives/summary-tooltip.directive';
import {
  productionDateSummaryFilter,
  summarPercentFilter,
  timebarPercentFilter,
  printDateFilter,
  numberFilter
} from './filter/date.filter';

export default angular
  .module('app.report.production-summary', [])
  .component(ProductionSummaryReport_.selector, ProductionSummaryReport_)
  .component('machineSummary', MachineSummary)
  .component('printSummary', PrintSummary)
  .component('printSummaryState', PrintSummaryState)
  .component('printSummaryTimebar', PrintSummaryTimebar)
  .component('summaryHistory', SummaryHistory)
  .component('summaryState', SummaryState)
  .component('summaryTimebar', SummaryTimebar)
  .directive('headerTooltip', headerTooltip)
  .filter('summaryDateFilter', productionDateSummaryFilter)
  .filter('summarPercent', summarPercentFilter)
  .filter('timebarPercent', timebarPercentFilter)
  .filter('printDateFilter', printDateFilter)
  .filter('numberFilter', numberFilter)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.report_production-summary', {
    url: '/report/production-summary',
    title: '',
    views: {
      'content@app': {
        template: '<production-summary-report></production-summary-report>',
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('report.production-summary', {
    title: 'productionSummary',
    state: 'app.report_production-summary',
    weight: 10,
    // claims: 'pro.machine.reports',
  });
}
