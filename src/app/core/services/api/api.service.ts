import * as angular from "angular";
import { Ams } from "../../../amsconfig";
import { IApiService } from "../../../reference";

apiService.$inject = ['$resource']
export function apiService($resource): IApiService {
  // Base Url
  const baseUrl = Ams.Config.BASE_URL + '/api/';
  const jobsUrl = Ams.Config.BASE_URL + '/_api/';
  const reportsUrl = jobsUrl + 'reports/';

  const api = {
    baseUrl: baseUrl,

    user: {
      settings: {
        preferences: $resource(
          jobsUrl + 'user/settings/preferences/:key',
          { key: '@key' },
          {
            post: { method: 'post', isArray: false },
            get: { method: 'get', isArray: false },
          }
        ),
        availableJobColumns: $resource(
          jobsUrl + 'user/settings/availableJobColumns',
          null,
          {
            post: { method: 'post', data: '@data', isArray: true },
            get: { method: 'get', isArray: true },
          }
        ),
        scheduledJobColumns: $resource(
          jobsUrl + 'user/settings/scheduledJobColumns',
          null,
          {
            post: { method: 'post', data: '@data', isArray: true },
            get: { method: 'get', isArray: true },
          }
        ),
        ordersColumns: $resource(
          jobsUrl + 'user/settings/ordersColumns',
          null,
          {
            post: { method: 'post', data: '@data', isArray: true },
            get: { method: 'get', isArray: true },
          }
        ),
        orderItemsColumns: $resource(
          jobsUrl + 'user/settings/orderItemsColumns',
          null,
          {
            post: { method: 'post', data: '@data', isArray: true },
            get: { method: 'get', isArray: true },
          }
        ),
        coilsColumns: $resource(jobsUrl + 'user/settings/coilsColumns', null, {
          post: { method: 'post', data: '@data', isArray: true },
          get: { method: 'get', isArray: true },
        }),
        coilTypesColumns: $resource(
          jobsUrl + 'user/settings/coilTypesColumns',
          null,
          {
            post: { method: 'post', data: '@data', isArray: true },
            get: { method: 'get', isArray: true },
          }
        ),
        machineColumns: $resource(
          jobsUrl + 'user/settings/machineColumns',
          null,
          {
            post: { method: 'post', data: '@data', isArray: true },
            get: { method: 'get', isArray: true },
          }
        ),
      },
      session: $resource(jobsUrl + 'user/session', null, {
        get: { method: 'get', isArray: false },
      }),
      // TODO: Refactor this away in favor of the implicit `query` on `users` below.
      list: $resource(jobsUrl + 'users', null, {
        get: { method: 'get', isArray: true },
      }),
    },
    users: $resource(
      jobsUrl + 'users',
      { username: '@username' },
      {
        setpassword: {
          method: 'post',
          url: jobsUrl + 'users/:username/setpassword',
        },
        addrole: { method: 'post', url: jobsUrl + 'users/:username/addrole' },
        removerole: {
          method: 'post',
          url: jobsUrl + 'users/:username/removerole',
        },
      }
    ),
    machine: {
      list: $resource(baseUrl + 'machine', null, {
        get: { method: 'get', isArray: true },
      }),
      state: $resource(
        baseUrl + 'machine/:id/state',
        { id: '@machineNumber' },
        { get: { method: 'get', isArray: false } }
      ),
      stateList: $resource(baseUrl + 'machine/state', null, {
        get: { method: 'get', isArray: true },
      }),
      scheduleSummary: $resource(
        baseUrl + 'machine/:id/schedule/summary',
        { id: '@id' },
        { get: { method: 'get', isArray: false } }
      ),
      scheduleSummaryList: $resource(
        baseUrl + 'machine/schedule/summary',
        null,
        { get: { method: 'get', isArray: true } }
      ),
      scheduleEstimate: $resource(
        baseUrl + 'machine/:id/schedule/estimate',
        { id: '@id' },
        { get: { method: 'get', isArray: false } }
      ),
      scheduleEstimateList: $resource(
        baseUrl + 'machine/schedule/estimate',
        null,
        { get: { method: 'get', isArray: true } }
      ),
      machineSchedule: $resource(baseUrl + 'machineschedule', null, {
        get: { method: 'get', isArray: true },
      }),
      statsHistory: $resource(
        baseUrl + 'machine/:id/statistics/hist',
        { id: '@id' },
        { get: { method: 'get', isArray: false } }
      ),
      statsHistoryList: $resource(baseUrl + 'machine/statistics/hist', null, {
        get: { method: 'get', isArray: true },
      }),
      statsShiftCurrent: $resource(
        baseUrl + 'machine/:id/statistics/shift/current',
        { id: '@id' },
        { get: { method: 'get', isArray: false } }
      ),
      statsShiftCurrentList: $resource(
        baseUrl + 'machine/statistics/shift/current',
        null,
        { get: { method: 'get', isArray: true } }
      ),
      statsShift: $resource(
        baseUrl + 'machine/:id/statistics/shift/:shiftCode',
        { id: '@id', shiftCode: '@shiftCode' },
        { get: { method: 'get', isArray: false } }
      ),
      statsShiftHistory: $resource(
        baseUrl + 'machine/:id/statistics/shift',
        { id: '@id' },
        { get: { method: 'get', isArray: true } }
      ), //add skip/take
      metricSettings: $resource(
        baseUrl + 'machine/:id/metricsettings',
        { id: '@id' },
        {
          get: { method: 'get', isArray: false },
          update: { method: 'put', isArray: false },
        }
      ),
      metricSettingsList: $resource(baseUrl + 'machine/metricsettings', null, {
        get: { method: 'get', isArray: true },
      }),
      unlicensed: {
        list: $resource(baseUrl + 'machine//.unlicensed', null, {
          get: { method: 'get', isArray: true },
        }),
      },
      machineUpdate: $resource(
        jobsUrl + 'machine/:machineNum',
        { machineNum: '@machineNumber' },
        { patch: { method: 'patch', data: '@data', isArray: false } }
      ),
      tools: $resource(
        jobsUrl + 'machine/:machineNum/tools',
        { machineNum: '@machineNumber' },
        { get: { method: 'get', isArray: true } }
      ),
      setups: $resource(
        jobsUrl + 'machine/:machineNum/setups',
        { machineNum: '@machineNumber' },
        { get: { method: 'get', isArray: true } }
      ),
    },
    device: {
      list: $resource(baseUrl + 'device', null, {
        get: { method: 'get', isArray: true },
      }),
      state: {
        list: $resource(baseUrl + 'devicestates', null, {
          get: { method: 'get', isArray: true },
        }),
      },
      metrics: {
        list: $resource(baseUrl + 'devicemetrics', null, {
          get: { method: 'get', isArray: true },
        }),
      },
    },
    folders: {
      list: $resource(jobsUrl + 'folders', null, {
        get: { method: 'get', isArray: true },
      }),
    },
    folder: {
      // TODO:
    },
    warehouse: {
      viewModel: $resource(baseUrl + 'wallboard/warehouse', null, {
        get: { method: 'get', isArray: false },
      }),
      tasks: $resource(jobsUrl + 'warehouse/tasks', null, {
        get: { method: 'get', isArray: true },
      }),
      locations: $resource(jobsUrl + 'warehouse/locations', null, {
        get: { method: 'get', isArray: true },
      }),
      reasons: $resource(jobsUrl + 'warehouse/reasons', null, {
        get: { method: 'get', isArray: true },
      }),
      taskfilters: $resource(jobsUrl + 'warehouse/facets/tasks', null, {
        get: { method: 'get', isArray: true },
      }),
      userstaskfilters: $resource(
        jobsUrl + 'warehouse/users/taskfilters',
        null,
        { get: { method: 'get', isArray: true } }
      ),
      addreason: $resource(jobsUrl + 'warehouse/reasons', null, {
        post: { method: 'post' },
      }),
      deletereason: $resource(
        jobsUrl + 'warehouse/reasons/:id',
        { id: '@id' },
        { delete: { method: 'delete' } }
      ),
      addlocation: $resource(jobsUrl + 'warehouse/locations', null, {
        post: { method: 'post' },
      }),
      deletelocation: $resource(
        jobsUrl + 'warehouse/locations/:id',
        { id: '@id' },
        { delete: { method: 'delete' } }
      ),
    },

    performance: {
      data: $resource(jobsUrl + 'machinePerformanceStandards', null, {
        get: { method: 'get', isArray: true },
      }),
      update: $resource(jobsUrl + 'machinePerformanceStandards', null, {
        post: { method: 'post', data: '@data', isArray: false },
      }),
    },

    explorer: {
      data: $resource(baseUrl + 'productionexplorer', null, {
        get: { method: 'get', isArray: true },
      }),
      range: $resource(baseUrl + 'productionexplorer/range'),
      device: {
        data: $resource(baseUrl + 'productionexplorer/device', null, {
          get: { method: 'get', isArray: true },
        }),
        range: $resource(baseUrl + 'productionexplorer/device/range'),
      }
    },

    productionEvents: $resource(jobsUrl + 'productionEvents', null, {
      get: { method: 'get', isArray: true },
    }),

    andon: {
      sequence: $resource(
        baseUrl + 'andonSequences/:id',
        { id: '@id' },
        { get: { method: 'get', isArray: false } }
      ),
      sequences: $resource(baseUrl + 'andonSequences', null, {
        get: { method: 'get', isArray: true },
      }),
      views: $resource(baseUrl + 'andonPanelList', null, {
        get: { method: 'get', isArray: true },
      }),
    },

    inventory: {
      coilTypes: {
        list: $resource(baseUrl + 'material', null, {
          get: { method: 'get', isArray: true },
        }),
        coilType: $resource(
          baseUrl + 'material/:id',
          { id: '@id' },
          {
            get: { method: 'get', isArray: false },
            update: { method: 'put', isArray: false },
          }
        ),
        columns: $resource('app/data/table-definitions/coil-types.json', null, {
          get: { method: 'get', isArray: true },
        }),
      },
      coils: {
        list: $resource(baseUrl + 'coils', null, {
          get: { method: 'get', isArray: true },
        }),
        //coil     : $resource(baseUrl + 'coils?coilId=:id', {id: '@coilId'}, {get: {method: 'get', isArray: true}}),
        coil: $resource(
          baseUrl + 'coils/:id',
          { id: '@coilId' },
          {
            get: { method: 'get', isArray: false },
            update: { method: 'put', isArray: false },
          }
        ),
        type: $resource(
          baseUrl + 'coils?materialCode=:id',
          { id: '@materialCode' },
          { get: { method: 'get', isArray: true } }
        ),
        columns: $resource(
          'app/data/table-definitions/coil-inventory.json',
          null,
          { get: { method: 'get', isArray: true } }
        ),
      },
    },
    report: {
      materialUsage: $resource(reportsUrl + 'materialusage', null, {
        get: { method: 'get', isArray: false },
      }),
      toolingUsage: $resource(reportsUrl + 'toolingusage', null, {
        get: { method: 'get', isArray: false },
      }),
      coilSummary: $resource(reportsUrl + 'coilsummary', null, {
        get: { method: 'get', isArray: true },
      }),
      coilScrap: $resource(reportsUrl + 'coilscrap', null, {
        get: { method: 'get', isArray: true },
      }),
      scrapSummary: $resource(reportsUrl + 'scrapSummary', null, {
        get: { method: 'get', isArray: false },
      }),
      downtimeSummary: $resource(reportsUrl + 'downtimesummary', null, {
        get: { method: 'get', isArray: false },
      }),
      orderSummary: $resource(reportsUrl + 'orderSummary', null, {
        get: { method: 'get', isArray: true },
      }),
      machineSchedule: $resource(reportsUrl + 'machineSchedule', null, {
        get: { method: 'get', isArray: true },
      }),
      qualityAudit: $resource(reportsUrl + 'qualityAudit', null, {
        get: { method: 'get', isArray: true },
      }),
      materialDemand: $resource(reportsUrl + 'materialdemand', null, {
        get: { method: 'get', isArray: false },
      }),
    },

    history: {
      consumptionSummary: $resource(baseUrl + 'consumptionSummary', null, {
        get: { method: 'get', isArray: true },
      }),
      productionSummary: $resource(baseUrl + 'productionSummary', null, {
        get: { method: 'get', isArray: true },
      }),
    },

    orders: {
      summaries: {
        list: $resource(baseUrl + 'jobSummaries', null, {
          get: { method: 'get', isArray: true },
        }),
        columns: $resource(
          'app/data/table-definitions/orders-list.json',
          null,
          { get: { method: 'get', isArray: true } }
        ),
      },
      states: {
        list: $resource(baseUrl + 'jobState', null, {
          get: { method: 'get', isArray: true },
        }),
      },
      details: {
        order: $resource(
          baseUrl + 'jobDetails/:id',
          { id: '@ordId' },
          {
            get: { method: 'get', isArray: false },
            update: { method: 'put', isArray: false },
          }
        ),
        list: $resource(baseUrl + 'jobDetails/', null, {
          get: { method: 'get', isArray: true },
        }),
        bundleRules: $resource(
          baseUrl + 'job/:id/bundlerules',
          { id: '@ordId' },
          { get: { method: 'get' } }
        ),
        itemsColumns: $resource(
          'app/data/table-definitions/order-items.json',
          null,
          { get: { method: 'get', isArray: true } }
        ),
      },
      printTemplates: $resource(
        baseUrl + 'job/printTemplates',
        null,
        { get: { method: 'get', isArray: true } }
      ),
    },

    schedules: {
      list: $resource(jobsUrl + 'schedules', null, {
        get: { method: 'get', isArray: true },
      }),
    },
    availablejobsv2: {
      list: $resource(jobsUrl + 'availablejobs', null, {
        get: { method: 'get', isArray: true },
      }),
    },
    toolingv2: {
      list: $resource(jobsUrl + 'tooling', null, {
        get: { method: 'get', isArray: true },
      }),
    },
    coilv2: {
      list: $resource(jobsUrl + 'coiltype', null, {
        get: { method: 'get', isArray: true },
      }),
    },

    jobsAction: {
      scheduleJob: $resource(jobsUrl + 'scheduleJob', null, {
        post: { method: 'post', data: '@data', isArray: true },
      }),
      removeScheduledJob: $resource(jobsUrl + 'removeScheduledJob', null, {
        post: { method: 'post', data: '@data', isArray: true },
      }),
    },

    downtime: {
      downtimeDetails: {
        list: $resource(baseUrl + 'scheduledDowntimeDefinitions', null, {
          get: { method: 'get', isArray: true },
        }),
        saveDowntime: $resource(
          baseUrl + 'scheduledDowntimeDefinitions',
          null,
          { post: { method: 'post', data: '@data', isArray: false } }
        ),
        updateDowntime: $resource(
          baseUrl + 'scheduledDowntimeDefinitions/:id',
          { id: '@id' },
          { update: { method: 'put', data: '@data', isArray: false } }
        ),
        deleteDowntime: $resource(
          baseUrl + 'scheduledDowntimeDefinitions/:id',
          { id: '@id' },
          { delete: { method: 'delete' } }
        ),
      },
    },
    search: $resource(baseUrl + 'search?q=:q', null, {
      get: { method: 'get', isArray: true },
    }),
    metricDefs: $resource(baseUrl + 'metricDefinitions', null, {
      get: { method: 'get', isArray: true },
    }),
    icons: $resource('assets/icons/selection.json'),
    system: {
      system: $resource(baseUrl + 'systemInfo'),
      updateinfo: $resource(baseUrl + 'checkUpdate'),
      systemAgent: $resource(baseUrl + 'agentStatus'),
      health: $resource(baseUrl + 'system/health', null, {
        get: { method: 'get', isArray: true },
      }),
      syncStates: $resource(baseUrl + 'system/syncStates', null, {
        get: { method: 'get', isArray: true },
      }),
      pendingActionsToAgent: $resource(
        baseUrl + 'system/pendingActionsToAgent',
        null,
        { get: { method: 'get', isArray: true } }
      ),
      license: $resource(baseUrl + 'license', null, {
        post: { method: 'post' },
      }),
      languages: $resource(baseUrl + 'languages', null, {
        get: { method: 'get', isArray: true },
      }),
    },
    systemPreferences: $resource(baseUrl + 'systemPreferences'),
    alerts: $resource(baseUrl + 'alerts', null, {
      get: { method: 'get', isArray: true },
    }),
    features: $resource(
      baseUrl + 'features/:feature?enabled=:enabled',
      { feature: '@feature', enabled: '@enabled' },
      {
        get: { method: 'get', isArray: false },
        post: { method: 'post', isArray: false },
      }
    ),
    integration: {
      runConfig: $resource(
        jobsUrl + 'integration/requestImmediateImport/:id',
        { id: '@id' },
        { post: { method: 'post', isArray: false } }
      ),
      configsmasterlist: $resource(
        jobsUrl + 'integration/configsmasterlist',
        null,
        { get: { method: 'get', isArray: true } }
      ),
      orderImportConfigs: {
        list: $resource(jobsUrl + 'integration/orderImportConfigs', null, {
          get: { method: 'get', isArray: true },
        }),
        save: $resource(jobsUrl + 'integration/orderImportConfigs', null, {
          put: { method: 'put', data: '@data', isArray: false },
        }),
        update: $resource(
          jobsUrl + 'integration/orderImportConfigs/:id',
          { id: '@id' },
          { update: { method: 'put', data: '@data', isArray: false } }
        ),
        masterlist: $resource(
          jobsUrl + 'integration/orderImportConfigs/masterlist',
          null,
          { get: { method: 'get', isArray: true } }
        ),
      },
      orderImportEvents: $resource(
        jobsUrl + 'integration/orderImportEvents',
        null,
        { get: { method: 'get', isArray: true } }
      ),
      coilImportConfigs: {
        list: $resource(jobsUrl + 'integration/coilImportConfigs', null, {
          get: { method: 'get', isArray: true },
        }),
        save: $resource(jobsUrl + 'integration/coilImportConfigs', null, {
          put: { method: 'put', data: '@data', isArray: false },
        }),
        update: $resource(
          jobsUrl + 'integration/coilImportConfigs/:id',
          { id: '@id' },
          { update: { method: 'put', data: '@data', isArray: false } }
        ),
        masterlist: $resource(
          jobsUrl + 'integration/coilImportConfigs/masterlist',
          null,
          { get: { method: 'get', isArray: true } }
        ),
      },
      coilImportEvents: $resource(
        jobsUrl + 'integration/coilImportEvents',
        null,
        { get: { method: 'get', isArray: true } }
      ),
      materialImportConfigs: {
        list: $resource(jobsUrl + 'integration/materialImportConfigs', null, {
          get: { method: 'get', isArray: true },
        }),
        save: $resource(jobsUrl + 'integration/materialImportConfigs', null, {
          put: { method: 'put', data: '@data', isArray: false },
        }),
        update: $resource(
          jobsUrl + 'integration/materialImportConfigs/:id',
          { id: '@id' },
          { update: { method: 'put', data: '@data', isArray: false } }
        ),
        masterlist: $resource(
          jobsUrl + 'integration/materialImportConfigs/masterlist',
          null,
          { get: { method: 'get', isArray: true } }
        ),
      },
      materialImportEvents: $resource(
        jobsUrl + 'integration/materialImportEvents',
        null,
        { get: { method: 'get', isArray: true } }
      ),
      scheduleSyncConfigs: {
        list: $resource(jobsUrl + 'integration/scheduleSyncConfigs', null, {
          get: { method: 'get', isArray: true },
        }),
        save: $resource(jobsUrl + 'integration/scheduleSyncConfigs', null, {
          put: { method: 'put', data: '@data', isArray: false },
        }),
        update: $resource(
          jobsUrl + 'integration/scheduleSyncConfigs/:id',
          { id: '@id' },
          { update: { method: 'put', data: '@data', isArray: false } }
        ),
        masterlist: $resource(
          jobsUrl + 'integration/scheduleSyncConfigs/masterlist',
          null,
          { get: { method: 'get', isArray: true } }
        ),
      },
      scheduleSyncEvents: $resource(
        jobsUrl + 'integration/scheduleSyncEvents',
        null,
        { get: { method: 'get', isArray: true } }
      ),
      coilValidationConfigs: {
        list: $resource(jobsUrl + 'integration/coilValidationConfigs', null, {
          get: { method: 'get', isArray: true },
        }),
        save: $resource(jobsUrl + 'integration/coilValidationConfigs', null, {
          put: { method: 'put', data: '@data', isArray: false },
        }),
        update: $resource(
          jobsUrl + 'integration/coilValidationConfigs/:id',
          { id: '@id' },
          { update: { method: 'put', data: '@data', isArray: false } }
        ),
        masterlist: $resource(
          jobsUrl + 'integration/coilValidationConfigs/masterlist',
          null,
          { get: { method: 'get', isArray: true } }
        ),
      },
      coilValidationEvents: $resource(
        jobsUrl + 'integration/coilValidationEvents',
        null,
        { get: { method: 'get', isArray: true } }
      ),
      exportConfigs: {
        list: $resource(jobsUrl + 'integration/exportConfigs', null, {
          get: { method: 'get', isArray: true },
        }),
        save: $resource(jobsUrl + 'integration/exportConfigs', null, {
          put: { method: 'put', data: '@data', isArray: false },
        }),
        update: $resource(
          jobsUrl + 'integration/exportConfigs/:id',
          { id: '@id' },
          { update: { method: 'put', data: '@data', isArray: false } }
        ),
        masterlist: $resource(
          jobsUrl + 'integration/exportConfigs/masterlist',
          null,
          { get: { method: 'get', isArray: true } }
        ),
      },
      exportEvents: $resource(jobsUrl + 'integration/exportEvents', null, {
        get: { method: 'get', isArray: true },
      }),
      webhookConfigs: {
        list: $resource(jobsUrl + 'integration/webhookConfigs', null, {
          get: { method: 'get', isArray: true },
        }),
        save: $resource(jobsUrl + 'integration/webhookConfigs', null, {
          put: { method: 'put', data: '@data', isArray: false },
        }),
        update: $resource(
          jobsUrl + 'integration/webhookConfigs/:id',
          { id: '@id' },
          { update: { method: 'put', data: '@data', isArray: false } }
        ),
        masterlist: $resource(
          jobsUrl + 'integration/webhookConfigs/masterlist',
          null,
          { get: { method: 'get', isArray: true } }
        ),
      },
      webhookEvents: $resource(jobsUrl + 'integration/webhookEvents', null, {
        get: { method: 'get', isArray: true },
      }),
      externalConnectionConfigs: {
        list: $resource(jobsUrl + 'integration/externalConnections', null, {
          get: { method: 'get', isArray: true },
        }),
        save: $resource(jobsUrl + 'integration/externalConnections', null, {
          put: { method: 'put', data: '@data', isArray: false },
        }),
        update: $resource(
          jobsUrl + 'integration/externalConnections/:id',
          { id: '@id' },
          { update: { method: 'put', data: '@data', isArray: false } }
        ),
      },
      bundlerRules: {
        get: $resource(jobsUrl + 'integration/bundlerRules', null, {
          get: { method: 'get', isArray: false },
        }),
        update: $resource(
          jobsUrl +
          'integration/bundlerRules/:type?customer=:customer&tooling=:tooling',
          { type: '@type', customer: '@customer', tooling: '@tooling' },
          { post: { method: 'post', data: '@data', isArray: false } }
        ),
        delete: $resource(
          jobsUrl + 'integration/bundlerRules/:type',
          { type: '@type' },
          { post: { method: 'post', data: '@data', isArray: false } }
        ),
      },
      //        fetchOrders: $resource(jobsUrl + 'netsuite/fetchOrders', null, {post: {method: 'post', isArray: false}}),
    },
    printing: {
      bundleResults: $resource(baseUrl + 'bundleResults', null, {
        get: { method: 'get', isArray: true },
      }),
      recentBundles: $resource(jobsUrl + 'bundle/recentBundles', null, {
        get: { method: 'get', isArray: true },
      }),
      printTemplates: $resource(jobsUrl + 'printing/printTemplates', null, {
        get: { method: 'get', isArray: true },
      }),
      machinePrintConfigs: $resource(
        jobsUrl + 'printing/machinePrintConfigs',
        null,
        {
          get: { method: 'get', isArray: true },
          update: { method: 'post', data: '@data', isArray: false },
        }
      ),
      installedPrinters: $resource(jobsUrl + 'printing/installedPrinters'),
      bundlePrintConfig: $resource(jobsUrl + 'printing/bundlePrintConfig'),
      coilPrintConfig: $resource(jobsUrl + 'printing/coilPrintConfig'),
    },
    wallboard: {
      list: $resource(baseUrl + 'wallboards/registeredDevices', null, {
        get: { method: 'get', isArray: true },
      }),
      updateDevice: $resource(
        baseUrl + 'wallboards/registeredDevices/:id',
        { id: '@id' },
        {
          update: {
            method: 'patch',
            contentType: '@contentType',
            deviceParams: '@deviceParams',
            wallboardDeviceName: '@wallboardDeviceName',
            isArray: false,
          },
        }
      ),
      deleteDevice: $resource(
        baseUrl + 'wallboards/registeredDevices/:id',
        { id: '@id' },
        { delete: { method: 'delete' } }
      ),
    },
    settings: {
      downtimeCodes: $resource(baseUrl + 'settings/downtime'),
      downtimeCodeCategories: $resource(
        baseUrl + 'settings/downtimecategories'
      ),
    },
    tooling: {
      list: $resource(jobsUrl + 'tooling', null, {
        get: { method: 'get', isArray: true },
      }),
      columns: $resource(jobsUrl + 'user/settings/toolingColumns', null, {
        post: { method: 'post', data: '@data', isArray: true },
        get: { method: 'get', isArray: true },
      }),
      add: $resource(
        jobsUrl + 'tooling/:toolingCode',
        { toolingCode: '@toolingCode' },
        {
          put: { method: 'put', isArray: false },
        }
      ),
      update: $resource(
        jobsUrl + 'tooling/:toolingId',
        { toolingId: '@id' },
        { patch: { method: 'patch', data: '@data', isArray: false } }
      ),
      machine: $resource(
        jobsUrl + 'tooling/:toolingCode/machine/:machineNumber',
        { toolingCode: '@toolingCode', machineNumber: '@machineNumber' },
        {
          delete: { method: 'delete' },
          patch: { method: 'patch', data: '@data', isArray: false },
          add: { method: 'put', data: '@data', isArray: false },
        }
      ),
    },
    express: {
      commstate: $resource(baseUrl + 'express/commstate'),
      ctrlstate: $resource(baseUrl + 'express/ctrlstate', null, {
        get: { method: 'get', isArray: true },
      }),
    },
    punchPatterns: {
      list: $resource(jobsUrl + 'punchpatterns', null, {
        get: { method: 'get', isArray: true },
      }),
    },
  };

  return api;
}
