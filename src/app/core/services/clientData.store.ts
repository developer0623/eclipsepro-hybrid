import * as angular from "angular";
import Rx from 'rx';
import { IApiResolverService } from "./../../reference";
import {
  IReasonCode, ILocation, ITask, ISystemPreferences, ISystemInfo, IBundlingRulesDocument,
  IMachine, IMetricDefinition, IMachineStateDto, IRollformingStatistics, IStatisticsHistory,
  IMachineMetricSettings, IScheduleSummary, IScheduleEstimate, ICoilDto, IMaterialDto,
  IJobSummaryDto, IJobDetailDto, IScheduledDowntimeDto, IAvailableJob, ISchedule, IAlert,
  IHealth, IPendingActionsToAgent, ISyncState, IAndonSequenceConfig, IAndonView, IConsumptionHistory,
  ITaskFacet, IUserTaskFilters, IAvailableJobColumn, IBundleResult, IOrderImportEvent,
  ICoilImportEvent, IOrderImportConfig, ICoilImportConfig, IExportConfig, IExportEvent,
  IMaterialImportConfig, IMaterialImportEvent, IScheduleSyncConfig, IScheduleSyncEvent,
  IDevice, IDeviceState, IDeviceMetrics, IDevicePartRunStatistics, IDeviceShiftStatistics,
  IWebhookConfig, IWebhookEvent, IPrintTemplate, IMachinePrintConfig, IInstalledPrinters,
  ILicense, IWallboardDevice, IUser, Fx, ILanguage, IProductionSummaryReportRecord, IPathfinderMachine,
  ToolingHeader, IProductionEvent, ToolingDef, ExpressCommState, ExpressCtrlState, IRecentBundleResult,
  IPunchPattern, WarehouseViewModel, IExternalConnection
} from "../dto";
import { Initialize, AddSubscription, DelSubscription } from "./clientData.actions";
import { collectionReducer, collectionReducerSingleton, SystemInfoReducer, ProductionSummaryReport, UserSessionReducer, Subscriptions } from "./clientData.reducers";
import { DebugCollectionMetricsReducer, DebugActionMetricsReducer } from "./store/diagnostic/reducers";
import { DeviceExplorerDataReducer, ExplorerDataReducer } from "./store/productionexplorer/reducers";
import { AvailableJobColumns, ScheduledJobColumns, ApplyJobPatch, schedulingSpeed, SelectedJobs, JobsInFlight, SummarizedJobs } from "./store/scheduler/reducers";
import { BundleRules } from './store/order/selectors';
import { SingleOrderStateReducer } from './store/order/reducers';
import { Action, combineReducers, DataStore, appendReducers } from "./lib/store";
import { IAppState } from "./store";

export function getPagedItems<T>(
  apiname: string,
  queryArgs: { skip: number; take: number },
  apiResolver: IApiResolverService
) {
  let getPage = function <T>(skiptake) {
    return Rx.Observable.fromPromise<T[]>(
      apiResolver.resolve(apiname, skiptake)
    );
  };
  let result = getPage<T>(queryArgs).flatMap(data => {
    let result = Rx.Observable.return(data);
    // This take-10 is because of a pesky bug in the server side filtering. Sometimes, the server returns less than the take even if there are more items.
    // 10 is arbitrary.
    if (data.length >= (queryArgs.take - 10)) {
      result = result.concat(
        getPagedItems(
          apiname,
          Object.assign(queryArgs, {
            skip: queryArgs.skip + data.length, //queryArgs.take,
            take: queryArgs.take,
          }),
          apiResolver
        )
      );
    }
    return result;
  });
  return result;
}

clientDataStoreService.$inject = ['clientDataDispatcher', 'apiResolver']
export function clientDataStoreService(clientDataDispatcher, apiResolver) {

  // 1. Call the `collectionReducer` factory, to create a reducer for the put/delete collection.
  let rootReducer = combineReducers({
    ReasonCode: collectionReducer<IReasonCode>('ReasonCode'),
    Location: collectionReducer<ILocation>('Location'),
    MaterialTask: collectionReducer<ITask>('MaterialTask'),
    SystemPreferences: collectionReducerSingleton<ISystemPreferences>(
      'SystemPreferences',
      {
        systemLanguage: 'en',
        allowPrereleaseVersions: false,
        inchesUnit: 'in',
        intranetUrl: null,
        redirectFromLocalhost: false,
        allowGuestUser: false,
        plantName: '',
        showMaterialShortageAlerts: false,
      }
    ),
    SystemInfo: SystemInfoReducer,
    UpdateInfo: collectionReducerSingleton<any>('UpdateInfo', {}),
    SystemAgent: collectionReducerSingleton<any>('SystemAgent', {}),
    BundlingRulesDocument:
      collectionReducerSingleton<IBundlingRulesDocument>(
        'BundlingRulesDocument',
        {
          systemLevel: {
            maxWeightLbs: 0,
            maxPieceCount: 0,
            minPctOfMaxLength: 0,
            itemSort: null,
          },
          customerRules: {},
          toolingDefRules: {},
          materialToolingRules: [],
          customerToolingRules: [],
        }
      ),
    Machine: collectionReducer<IMachine>('Machine'),
    MetricDefinition: collectionReducerSingleton<IMetricDefinition[]>(
      'MetricDefinition',
      []
    ),
    MachineState: collectionReducer<IMachineStateDto>('MachineState'),
    MachineStatistics:
      collectionReducer<IRollformingStatistics>('MachineStatistics'),
    MachineStatisticsHistory: collectionReducer<IStatisticsHistory>(
      'MachineStatisticsHistory'
    ),
    MachineMetricSettings: collectionReducer<IMachineMetricSettings>(
      'MachineMetricSettings'
    ),
    MachineScheduleSummary: collectionReducer<IScheduleSummary>(
      'MachineScheduleSummary'
    ),
    MachineSchedule:
      collectionReducer<IScheduleEstimate>('MachineSchedule'),
    Coil: collectionReducer<ICoilDto>('Coil'),
    CoilTypes: collectionReducer<IMaterialDto>('CoilTypes'),
    JobSummary: appendReducers(
      collectionReducer<IJobSummaryDto>('JobSummary'),
      ApplyJobPatch
    ),
    JobDetail: appendReducers(
      collectionReducer<IJobDetailDto>('JobDetail'),
      ApplyJobPatch
    ),
    ScheduledDowntimeDefinition: collectionReducer<IScheduledDowntimeDto>(
      'ScheduledDowntimeDefinition'
    ),
    AvailableJob: appendReducers(
      collectionReducer<IAvailableJob>('AvailableJob'),
      ApplyJobPatch
    ),
    Schedule: collectionReducer<ISchedule>('Schedule'),
    Alerts: collectionReducerSingleton<IAlert[]>('Alerts', []),
    Health: collectionReducer<IHealth>('Health'),
    PendingActionsToAgent: collectionReducer<IPendingActionsToAgent>(
      'PendingActionsToAgent'
    ),
    SyncState: collectionReducer<ISyncState>('SyncState'),
    AndonSequenceConfig: collectionReducer<IAndonSequenceConfig>(
      'AndonSequenceConfig'
    ),
    AndonViews: collectionReducerSingleton<IAndonView[]>('AndonViews', []),
    ConsumptionHistory:
      collectionReducer<IConsumptionHistory>('ConsumptionHistory'),
    Subscriptions,
    TaskFilters: collectionReducerSingleton<ITaskFacet[]>(
      'TaskFilters',
      []
    ),
    UsersTaskFilters:
      collectionReducer<IUserTaskFilters>('UsersTaskFilters'),
    AvailableJobColumns: AvailableJobColumns,
    ScheduledJobColumns: ScheduledJobColumns,
    ProductionSummaryReport: ProductionSummaryReport,
    BundleResult: collectionReducer<IBundleResult>('BundleResult'),
    OrderImportEvents:
      collectionReducer<IOrderImportEvent>('OrderImportEvents'),
    CoilImportEvents:
      collectionReducer<ICoilImportEvent>('CoilImportEvents'),
    OrderImportConfigs:
      collectionReducer<IOrderImportConfig>('OrderImportConfigs'),
    CoilImportConfigs:
      collectionReducer<ICoilImportConfig>('CoilImportConfigs'),
    ExportConfigs: collectionReducer<IExportConfig>('ExportConfigs'),
    ChannelItemStates: collectionReducer<IExportEvent>('ChannelItemStates'),
    MaterialImportConfigs: collectionReducer<IMaterialImportConfig>(
      'MaterialImportConfigs'
    ),
    MaterialImportEvents: collectionReducer<IMaterialImportEvent>(
      'MaterialImportEvents'
    ),
    ScheduleSyncConfigs: collectionReducer<IScheduleSyncConfig>(
      'ScheduleSyncConfigs'
    ),
    ScheduleSyncEvents:
      collectionReducer<IScheduleSyncEvent>('ScheduleSyncEvents'),
    Devices: collectionReducer<IDevice>('Devices'),
    DeviceState: collectionReducer<IDeviceState>('DeviceState'),
    DeviceMetrics: collectionReducer<IDeviceMetrics>('DeviceMetrics'),
    DevicePartRunStatistics: collectionReducer<IDevicePartRunStatistics>(
      'DevicePartRunStatistics'
    ),
    DeviceShiftStatistics: collectionReducer<IDeviceShiftStatistics>(
      'DeviceShiftStatistics'
    ),
    CoilValidationConfigs: collectionReducer<IExportConfig>(
      'CoilValidationConfigs'
    ),
    CoilValidationEvents: collectionReducer<IExportEvent>(
      'CoilValidationEvents'
    ),
    WebhookConfigs: collectionReducer<IWebhookConfig>('WebhookConfigs'),
    ExternalConnections: collectionReducer<IExternalConnection>('ExternalConnections'),
    WebhookEvents: collectionReducer<IWebhookEvent>('WebhookEvents'),
    RecentBundles: collectionReducer<IRecentBundleResult>('RecentBundles'),
    PrintTemplates: collectionReducer<IPrintTemplate>('PrintTemplates'),
    MachinePrintConfigs: collectionReducer<IMachinePrintConfig>(
      'MachinePrintConfigs'
    ),
    InstalledPrinters: collectionReducerSingleton<IInstalledPrinters>(
      'InstalledPrinters',
      { printers: [] }
    ),
    UnlicensedMachine: collectionReducer<IMachine>('UnlicensedMachine'),
    License: collectionReducerSingleton<ILicense>('License', {
      serverId: '',
      lastUpdate: '',
      updateCount: 0,
      modules: [],
      machines: [],
    }),
    UserSession: UserSessionReducer,
    ExplorerData: ExplorerDataReducer,
    DeviceExplorerData: DeviceExplorerDataReducer,
    DebugCollectionMetrics: DebugCollectionMetricsReducer,
    DebugActionMetrics: DebugActionMetricsReducer,
    SchedulingSpeed: schedulingSpeed,
    WallboardDevices:
      collectionReducer<IWallboardDevice>('WallboardDevices'),
    Users: collectionReducer<IUser>('Users'),
    BundleRules: collectionReducer<BundleRules>('BundleRules'),
    SingleOrder: SingleOrderStateReducer,
    Folders: collectionReducer<IPathfinderMachine>('Folders'),
    SelectedJobs,
    SummarizedJobs,
    JobsInFlight,
    ToolingItems: collectionReducer<ToolingHeader>('ToolingItems'),
    ToolingDefs: collectionReducer<ToolingDef>('ToolingDefs'),
    ExpressCommState: collectionReducerSingleton<ExpressCommState>(
      'ExpressCommState',
      {
        id: 'ExpressCommState',
      }
    ),
    ExpressCtrlState:
      collectionReducer<ExpressCtrlState>('ExpressCtrlState'),
    ProductionEvents:
      collectionReducer<IProductionEvent>('ProductionEvents'),
    PunchPatterns: collectionReducer<IPunchPattern>('PunchPatterns'),
    WarehouseViewModel: collectionReducerSingleton<WarehouseViewModel>(
      'WarehouseViewModel',
      {
        id: 'WarehouseViewModel',
        activeTasks: [],
        completeTasks: [],
        readyTasks:[]
      }
    ),
  });

  const initialAppState = rootReducer(undefined, new Action('___INITIALIZATION_ACTION______'));

  const store = new ClientDataStore(clientDataDispatcher, rootReducer, initialAppState);

  return store;
}

export type Collection = keyof IAppState;

// 2. Create a typed `Select...` member, so we don't have use magic strings.
// (Add a `Select...All` or `Select...In` if it's a subscription collection
// (aka, it's reducer was created via `collectionReducer` above).
export class ClientDataStore extends DataStore<IAppState> {
  // Note that the `filterDef` is _not_ applied to the returned
  // observable.
  private SelectAndSubscribe<T>(
    collection: Collection,
    filterDef: Fx.FilterDef
  ) {
    const subscription = new Fx.Subscription(collection, filterDef);

    this.Dispatch(new AddSubscription(subscription));

    return this.Select<T>(collection).finally(() =>
      this.Dispatch(new DelSubscription(subscription))
    );
  }
  /** Note that the `filterDef` is _not_ applied to the returned
   observable. */
  public SelectAll<T>(collection: Collection) {
    return this.SelectAndSubscribe<T>(collection, new Fx.All());
  }
  /** Note that the `filterDef` is _not_ applied to the returned
   observable. */
  private SelectIn<T>(collection: Collection, filterDef: Fx.In) {
    return this.SelectAndSubscribe<T>(collection, filterDef);
  }
  /** Note that the `filterDef` is _not_ applied to the returned
   observable. */
  private SelectRange<T>(collection: Collection, filterDef: Fx.Range) {
    throw 'range subscriptions not implemented';
  }
  public SelectMachines() {
    return this.SelectAll<IMachine[]>('Machine');
  }
  public SelectUnlicensedMachines() {
    return this.SelectAll<IMachine[]>('UnlicensedMachine');
  }
  public SelectReasonCodes() {
    return this.SelectAll<IReasonCode[]>('ReasonCode');
  }
  public SelectTasks() {
    return this.SelectAll<ITask[]>('MaterialTask');
  }
  public SelectTasksIn(filter: {
    property: 'sourceLocationId' | 'destinationLocationId';
    values: (string | number)[];
  }) {
    return this.SelectIn<ITask[]>(
      'MaterialTask',
      new Fx.In(filter.property, filter.values)
    );
  }
  public SelectLocations() {
    return this.SelectAll<ILocation[]>('Location');
  }
  public SelectSystemPreferences() {
    return this.SelectAll<ISystemPreferences>('SystemPreferences');
  }
  public SelectMetricDefinitions() {
    return this.SelectAll<IMetricDefinition[]>('MetricDefinition');
  }
  public SelectMachineStates() {
    return this.SelectAll<IMachineStateDto[]>('MachineState');
  }
  public SelectMachineStatistics() {
    return this.SelectAll<IRollformingStatistics[]>('MachineStatistics');
  }
  public SelectMachineStatisticsHistory() {
    return this.SelectAll<IStatisticsHistory[]>('MachineStatisticsHistory');
  }
  public SelectMachineMetricSettings() {
    return this.SelectAll<IMachineMetricSettings[]>('MachineMetricSettings');
  }
  public SelectMachineScheduleSummary() {
    return this.SelectAll<IScheduleSummary[]>('MachineScheduleSummary');
  }
  public SelectMachineScheduleSummaryIn(filter: {
    property: string;
    values: (string | number)[];
  }) {
    return this.SelectIn<IScheduleSummary[]>(
      'MachineScheduleSummary',
      new Fx.In(filter.property, filter.values)
    );
  }
  public SelectMachineSchedule() {
    return this.SelectAll<IScheduleEstimate[]>('MachineSchedule');
  }
  public SelectCoils() {
    return this.SelectAll<ICoilDto[]>('Coil');
  }
  public SelectCoilsIn(filter: { property: string; values: string[] }) {
    return this.SelectIn<ICoilDto[]>(
      'Coil',
      new Fx.In(filter.property, filter.values)
    );
  }
  public SelectCoilTypes() {
    return this.SelectAll<IMaterialDto[]>('CoilTypes');
  }
  public SelectJobSummaries() {
    return this.SelectAll<IJobSummaryDto[]>('JobSummary');
  }
  public SelectJobSummariesIn(filter: {
    property: 'ordId';
    values: (string | number)[];
  }) {
    return this.SelectIn<IJobSummaryDto[]>(
      'JobSummary',
      new Fx.In(filter.property, filter.values)
    );
  }
  SelectJobSummariesAllRecent(daysOld: number) {
    return this.SelectAndSubscribe<IJobSummaryDto[]>('JobSummary', new Fx.AllRecent(daysOld));
  }
  public SelectJobDetailIn(filter: {
    property: 'ordId';
    values: (string | number)[];
  }) {
    return this.SelectIn<IJobDetailDto[]>(
      'JobDetail',
      new Fx.In(filter.property, filter.values)
    );
  }
  public SelectScheduledDowntimeDefinition() {
    return this.SelectAll<IScheduledDowntimeDto[]>(
      'ScheduledDowntimeDefinition'
    );
  }
  public SelectAvailableJobs() {
    return this.SelectAll<IAvailableJob[]>('AvailableJob');
  }
  public SelectAvailableJobsIn(filter: {
    property: 'machineNumber';
    values: (string | number)[];
  }) {
    return this.SelectIn<IAvailableJob[]>(
      'AvailableJob',
      new Fx.In(filter.property, filter.values)
    );
  }
  public SelectScheduledJobsIn(filter: {
    property: 'machineNumber';
    values: (string | number)[];
  }) {
    return this.SelectIn<ISchedule[]>(
      'Schedule',
      new Fx.In(filter.property, filter.values)
    );
  }
  public SelectAlerts() {
    return this.SelectAll<IAlert[]>('Alerts');
  }
  public SelectHealth() {
    return this.SelectAll<IHealth[]>('Health');
  }
  public SelectSyncState() {
    return this.SelectAll<ISyncState[]>('SyncState');
  }
  public SelectPendingActionsToAgent() {
    return this.SelectAll<IPendingActionsToAgent[]>('PendingActionsToAgent');
  }
  public SelectAndonSequenceConfig() {
    return this.SelectAll<IAndonSequenceConfig[]>('AndonSequenceConfig');
  }
  public SelectAndonViews() {
    return this.SelectAll<IAndonView[]>('AndonViews');
  }
  public SelectConsumptionHistoryIn(filter: {
    property:
    | 'orderCode'
    | 'materialCode'
    | 'toolingCode'
    | 'coilSerialNumber'
    | 'ordId';
    values: any[];
  }) {
    return this.SelectIn<IConsumptionHistory[]>(
      'ConsumptionHistory',
      new Fx.In(filter.property, filter.values)
    );
  }
  public SelectTaskFilters() {
    return this.SelectAll<ITaskFacet[]>('TaskFilters');
  }
  public SelectUsersTaskFilters() {
    return this.SelectAll<IUserTaskFilters[]>('UsersTaskFilters');
  }
  public SelectBundleResults() {
    return this.SelectAll<IBundleResult[]>('BundleResult');
  }
  public SelectBundleResultsIn(filter: {
    property: 'ordId';
    values: (string | number)[];
  }) {
    return this.SelectIn<IBundleResult[]>(
      'BundleResult',
      new Fx.In(filter.property, filter.values)
    );
  }
  public SelectRecentBundles() {
    return this.SelectAll<IRecentBundleResult[]>('RecentBundles');
  }
  public SelectOrderImportEvents() {
    return this.SelectAll<IOrderImportEvent[]>('OrderImportEvents');
  }
  public SelectCoilImportEvents() {
    return this.SelectAll<ICoilImportEvent[]>('CoilImportEvents');
  }
  public SelectOrderImportConfigs() {
    return this.SelectAll<IOrderImportConfig[]>('OrderImportConfigs');
  }
  public SelectCoilImportConfigs() {
    return this.SelectAll<ICoilImportConfig[]>('CoilImportConfigs');
  }
  public SelectExportConfigs() {
    return this.SelectAll<IExportConfig[]>('ExportConfigs');
  }
  public SelectChannelItemStates() {
    return this.SelectAll<IExportEvent[]>('ChannelItemStates');
  }
  public SelectMaterialImportConfigs() {
    return this.SelectAll<IMaterialImportConfig[]>('MaterialImportConfigs');
  }
  public SelectMaterialImportEvents() {
    return this.SelectAll<IMaterialImportEvent[]>('MaterialImportEvents');
  }
  public SelectScheduleSyncConfigs() {
    return this.SelectAll<IScheduleSyncConfig[]>('ScheduleSyncConfigs');
  }
  public SelectScheduleSyncEvents() {
    return this.SelectAll<IScheduleSyncEvent[]>('ScheduleSyncEvents');
  }
  public SelectCoilValidationConfigs() {
    return this.SelectAll<IExportConfig[]>('CoilValidationConfigs');
  }
  public SelectCoilValidationEvents() {
    return this.SelectAll<IExportEvent[]>('CoilValidationEvents');
  }
  public SelectWebhookConfigs() {
    return this.SelectAll<IWebhookConfig[]>('WebhookConfigs');
  }
  public SelectWebhookEvents() {
    return this.SelectAll<IWebhookEvent[]>('WebhookEvents');
  }
  public SelectExternalConnections() {
    return this.SelectAll<IExternalConnection[]>('ExternalConnections');
  }
  public SelectPrintTemplates() {
    return this.SelectAll<IPrintTemplate[]>('PrintTemplates');
  }
  public SelectMachinePrintConfigs() {
    return this.SelectAll<IMachinePrintConfig[]>('MachinePrintConfigs');
  }
  public SelectInstalledPrinters() {
    return this.SelectAll<IInstalledPrinters>('InstalledPrinters');
  }
  public SelectUpdateInfo() {
    return this.SelectAll<any>('UpdateInfo');
  }
  public SelectSystemAgent() {
    return this.SelectAll<any>('SystemAgent');
  }
  public SelectLicense() {
    return this.SelectAll<ILicense>('License');
  }

  public SelectBundlerRules() {
    return this.SelectAll<IBundlingRulesDocument>('BundlingRulesDocument');
  }

  public SelectDevices() {
    return this.SelectAll<IDevice[]>('Devices');
  }

  public SelectDeviceStates() {
    return this.SelectAll<IDeviceState[]>('DeviceState');
  }
  public SelectDeviceMetrics() {
    return this.SelectAll<IDeviceMetrics[]>('DeviceMetrics');
  }
  public SelectDevicePartRunStatistics() {
    return this.SelectAll<IDevicePartRunStatistics[]>(
      'DevicePartRunStatistics'
    );
  }
  public SelectDeviceCurrentShiftStatistics() {
    return this.SelectAll<IDeviceShiftStatistics[]>('DeviceShiftStatistics');
  }

  public SelectWallboardDevices() {
    return this.SelectAll<IWallboardDevice[]>('WallboardDevices');
  }

  public SelectWarehouseViewModel() {
    return this.SelectAll<WarehouseViewModel>('WarehouseViewModel');
  }

  public SelectCoilDtosIn(filter: {
    property: 'MaterialCode';
    values: string[];
  }) {
    let coilsObs = this.SelectIn<ICoilDto[]>(
      'Coil',
      new Fx.In(filter.property, filter.values)
    );
    let locationObs = this.SelectLocations();

    return coilsObs.combineLatest(locationObs, (coils, locs) => {
      return coils.map(c => {
        let loc = locs.find(l => l.id === c.locationId);
        return { ...c, location: loc };
      });
    });
  }

  //This logic should be combined with the above. Maybe using the Fx.All filter
  public SelectCoilDtos() {
    let coilsObs = this.SelectAll<ICoilDto[]>('Coil');
    let locationObs = this.SelectLocations();

    return coilsObs.combineLatest(locationObs, (coils, locs) => {
      return coils.map(c => {
        let loc = locs.find(l => l.id === c.locationId);
        return { ...c, location: loc };
      });
    });
  }
  public SelectProductionSummaryReport() {
    return this.Select<IProductionSummaryReportRecord[]>(
      'ProductionSummaryReport'
    );
  }

  public SelectUsers() {
    return this.SelectAll<IUser[]>('Users');
  }

  public SelectTooling() {
    return this.SelectAll<ToolingHeader[]>('ToolingItems');
  }
  public SelectPunchPatterns() {
    return this.SelectAll<IPunchPattern[]>('PunchPatterns');
  }
  public SelectProductionEventsIn(filter: {
    property: 'machineNumber' | 'shiftCode' | 'eventTitle';
    values: number[];
  }) {
    return this.SelectIn<IProductionEvent>(
      'ProductionEvents',
      new Fx.In(filter.property, filter.values)
    );
  }
}

// 4. Find a controller you want to upgrade, and inject a `ClientDataStore`.
// 5. Write some code like:
/*
        clientDataStore.SelectReasonCodes()
            .subscribe(codes => {
                vm.reasons = codes;
            });

    Or, if perhaps you were joining two collections...

        Rx.Observable.combineLatest(
          clientDataStore.SelectJobDetails(),
          clientDataStore.SelectAvailableJobs(),
          (jobDetails, availableJobs) =>
                availableJobs.map(aj => {
                    let jd = jobDetails.find(j => j.id === aj.jobId);
                    return Object.assign({}, jd, aj);
                });
        )
        .subscribe(jobs => {
          vm.availableJobs = jobs;
        });
*/
