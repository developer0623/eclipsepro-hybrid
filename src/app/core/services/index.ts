import { module } from 'angular';
import { apiResolverService } from './api/api-resolver.service';
import { systemInfoService } from './systeminfo.service';
import { alertDataService } from './alertdata.service';
import { Dispatcher } from "./lib/store";
import { clientDataStoreService } from './clientData.store';
import { apiService } from './api/api.service';
import { andonService } from './andon.service';
import { authService, interceptorConfig} from './auth.service';
import { searchService } from './search.service';
import { appService } from './appService';
import { featureFlagService } from './featureflag.service';
import { userClaimsService } from './userClaimsService';
import { machineDataService } from './machinedata.service';
import { downtimeDataService } from './downtimedata.service';
import { integrationConfigService } from './integration.service';
import { makeJobsService } from './jobs.service';
import { performanceDataService } from './performanceData.service';
import { productionExplorerDataService } from './productionexplorerdata.service';
import { productionDeviceExplorerDataService } from './productionDeviceExplorerdata.service';
import { productionSummaryService } from './productionSummary.service';
import { subscriptionService } from './subscription.service';
import { unitsService } from './units.service';
import { warehouseService } from './warehouse.service';
import { clientDataHubService } from './hub/clientdatahub.service';
import { reportService } from './report.service';

export default module('app.core.services', [])
.factory('api', apiService)
.factory('clientDataDispatcher', () => {
    let disp = new Dispatcher();
    //disp.subscribe(console.log);
    return disp;
  })
.factory('clientDataStore', clientDataStoreService)
.factory('apiResolver', apiResolverService)
.factory('systemInfoService', systemInfoService)
.factory('alertDataService', alertDataService)
.service('andonService', andonService)
.service('authService', authService)
.factory('searchService', searchService)
.factory('appService', appService)
.factory('featureFlagService', featureFlagService)
.factory('userClaimsService', userClaimsService)
.factory('machineData', machineDataService)
.factory('downtimeData', downtimeDataService)
.factory('integrationConfigService', integrationConfigService)
.factory('jobsService', makeJobsService)
.factory('performanceData', performanceDataService)
.factory('productionExplorerDataService', productionExplorerDataService)
.factory('productionDeviceExplorerDataService', productionDeviceExplorerDataService)
.factory('productionSummaryService', productionSummaryService)
.factory('subscriptionService', subscriptionService)
.factory('unitsService', unitsService)
.service('warehouseService', warehouseService)
.factory('clientDataHub', clientDataHubService)
.factory('reportService', reportService)
.config(interceptorConfig)
.name;
