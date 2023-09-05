import { module, bootstrap } from 'angular';
import * as angular from 'angular';
import "angulartics";
import "angulartics-google-analytics";
import "angular-advanced-searchbox";
import "angular-ui-bootstrap";
import "angular-filter";

//@require "./**/*.html";

import customDndModule from './main/apps/schedule/jobs/custom-drag-drop/custom-drag-and-drop-lists';
import coreModule from './core/core.module';
import navModule from './navigation/navigation.module';
import toolbarModule from './toolbar/toolbar.module';
import panelModule from './quick-panel/quick-panel.module';

import dashboardModule from './main/apps/dashboards/dashboards.module';
import scheduleModule from "./main/apps/schedule/schedule.module";
import inventoryModule from "./main/apps/inventory/inventory.module";
import orderModule from "./main/apps/orders/orders.module";
import explorerModule from "./main/apps/explorer/explorer.module";
import reportModule from "./main/apps/report/report.module";
import settingsModule from "./main/apps/settings/settings.module";
import warehouseModule from './main/apps/warehouse/warehouse.module';
import machinesModule from './main/apps/machines/machines.module';
import toolingModule from './main/apps/tooling/tooling.module';
import punchPatternModule from './main/apps/punch-pattern/punch-pattern.module';
import componentsModule from './components';

import { httpConfig } from './index.config';
import { runBlock } from './index.run';
import routeConfig from './index.route';
import { AppController } from './index.controller';
// import './index.scss';

import * as agGrid from 'ag-grid-community'
// import 'ag-grid-community'
//import {initialiseAgGridWithAngular1} from 'ag-grid-community';

agGrid.initialiseAgGridWithAngular1(angular);

export const app = module('eclipsePro', [
    // Core
    coreModule,

    // // Navigation
    navModule,

    // // Toolbar
    toolbarModule,

    // // Quick panel
    panelModule,

    // // // Dashboards
    dashboardModule,

    // // Schedule
    scheduleModule,

    // // Material/Coil Inventory
    inventoryModule,

    // // Orders
    orderModule,

    // // Production Explorer
    explorerModule,

    warehouseModule,

    reportModule,
    componentsModule,

    // System settings
    settingsModule,

    machinesModule,
    toolingModule,
    punchPatternModule,

   //  // // UI - remove
   //  // 'app.ui',

    // // tracking. Does these go here?
    'angulartics', 'angulartics.google.analytics', 'angular-advanced-searchbox',
    'ui.bootstrap', /* 'infinite-scroll', */
    customDndModule, /* 'dndLists', */ 'angular.filter',
    'agGrid'
])
    .controller('AppController', ['eclipseProTheming', AppController])
    .run(['$rootScope', '$state', '$timeout', runBlock])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', routeConfig])
    .config(['$httpProvider', httpConfig]);

// bootstrap(document.querySelector('#main'), ['eclipsePro'])
