import angular from 'angular';
import coilScrapModule from './coil-scrap/coil-scrap.module';
import coilSummaryModule from './coil-summary/coil-summary.module';
import downtimeModule from './downtime-summary/downtime-summary.module';
import materialModule from './material-usage/material-usage.module';
import materialDemandModule from './material-demand/material-demand.module';
import toolingUsageModule from './tooling-usage/tooling-usage.module';
import orderSummaryModule from './order-summary/order-summary.module';
import orderSequenceModule from './order-sequence/order-sequence.module';
import qualityAuditModule from './quality-audit/quality-audit.module';
import scrapSummaryModule from './scrap-summary/scrap-summary.module';
import productionSummaryModule from "./production-summary/production-summary.module";
import productionEventsModule from './production-events/production-events.module';

import CheckboxMenu_ from './components/checkbox-menu/checkbox-menu.component';
import CustomMenu_ from './components/custom-menu/custom-menu.component';
import GroupHeader_ from './components/group-header/group-header.component';
import ReportDateCol_ from './components/report-date-col/report-date-col.component';
import ReportHeader_ from './components/report-header/report-header.component';
import { focusMe } from './directives/focus';

export default angular
    .module('app.report', [
        coilScrapModule,
        coilSummaryModule,
        downtimeModule,
        materialModule,
        materialDemandModule,
        orderSummaryModule,
        orderSequenceModule,
        qualityAuditModule,
        scrapSummaryModule,
        toolingUsageModule,
        productionSummaryModule,
        productionEventsModule,
    ])
    .component(CheckboxMenu_.selector, CheckboxMenu_)
    .component(CustomMenu_.selector, CustomMenu_)
    .component(GroupHeader_.selector, GroupHeader_)
    .component(ReportDateCol_.selector, ReportDateCol_)
    .component(ReportHeader_.selector, ReportHeader_)
    .directive('focusMe', focusMe)
    .config(config)
    .name;

/** @ngInject */
config.$inject = ['msNavigationServiceProvider']
function config(msNavigationServiceProvider) {
    // Navigation
    msNavigationServiceProvider.saveItem('report', {
        title: 'reports',
        icon: 'mdi-chart-bar',
        //icon: 'icon-poll',
        weight: 6,
    });
}
