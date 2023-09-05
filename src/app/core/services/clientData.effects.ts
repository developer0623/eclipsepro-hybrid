import { IApiResolverService } from "./../../reference";
import { Fx } from "../dto";
import { Initialize, ADD_SUBSCRIPTION, AddSubscription, RESET, DEL_SUBSCRIPTION, DelSubscription, Chop, UI_UPDATE_AVAILABLE, SIGNALR_RECONNECTED } from "./clientData.actions";
import { ClientDataStore, getPagedItems } from "./clientData.store";
import { NODISPATCH } from "./lib/effects";
import { Action } from "./lib/store";
import { SubscriptionService } from "./subscription.service";
import * as Rx from 'rx';
import rg4js from "raygun4js";

export class ClientDataEffects {
  constructor(
    private actions: Rx.Observable<Action>,
    private subscriptionService: SubscriptionService,
    private clientDataStore: ClientDataStore,
    private apiResolver: IApiResolverService,
    private $mdToast,
    private $rootScope
  ) { }

  private collectionApiMap = {
    ReasonCode: 'warehouse.reasons@get',
    Location: 'warehouse.locations@get',
    MaterialTask: 'warehouse.tasks@get',
    SystemPreferences: 'systemPreferences@get',
    Machine: 'machine.list@get',
    UnlicensedMachine: 'machine.unlicensed.list@get',
    License: 'system.license@get',
    MetricDefinition: 'metricDefs@get',
    MachineState: 'machine.stateList@get',
    MachineStatistics: 'machine.statsShiftCurrentList@get',
    MachineStatisticsHistory: 'machine.statsHistoryList@get',
    MachineMetricSettings: 'machine.metricSettingsList@get',
    MachineScheduleSummary: 'machine.scheduleSummaryList@get',
    MachineSchedule: 'machine.machineSchedule@get',
    Coil: 'inventory.coils.list@get',
    CoilTypes: 'inventory.coilTypes.list@get',
    JobSummary: 'orders.summaries.list@get',
    JobDetail: 'orders.details.list@get',
    ScheduledDowntimeDefinition: 'downtime.downtimeDetails.list@get',
    AvailableJob: 'availablejobsv2.list@get',
    Schedule: 'schedules.list@get',
    Coiltypes: 'coilv2.list@get',
    ToolingItems: 'toolingv2.list@get',
    Alerts: 'alerts@get',
    AndonSequenceConfig: 'andon.sequences@get',
    AndonViews: 'andon.views@get',
    ConsumptionHistory: 'history.consumptionSummary@get',
    TaskFilters: 'warehouse.taskfilters@get',
    UsersTaskFilters: 'warehouse.userstaskfilters@get',
    AvailableJobColumns: 'user.settings.availableJobColumns@get',
    ScheduledJobColumns: 'user.settings.scheduledJobColumns@get',
    OrderImportEvents: 'integration.orderImportEvents@get',
    CoilImportEvents: 'integration.coilImportEvents@get',
    OrderImportConfigs: 'integration.orderImportConfigs.list@get',
    CoilImportConfigs: 'integration.coilImportConfigs.list@get',
    ExportConfigs: 'integration.exportConfigs.list@get',
    ChannelItemStates: 'integration.exportEvents@get',
    MaterialImportConfigs: 'integration.materialImportConfigs.list@get',
    MaterialImportEvents: 'integration.materialImportEvents@get',
    ScheduleSyncConfigs: 'integration.scheduleSyncConfigs.list@get',
    ScheduleSyncEvents: 'integration.scheduleSyncEvents@get',
    CoilValidationConfigs: 'integration.coilValidationConfigs.list@get',
    CoilValidationEvents: 'integration.coilValidationEvents@get',
    WebhookConfigs: 'integration.webhookConfigs.list@get',
    WebhookEvents: 'integration.webhookEvents@get',
    ExternalConnections: 'integration.externalConnectionConfigs.list@get',
    SystemInfo: 'system.system@get',
    UpdateInfo: 'system.updateinfo@get',
    SystemAgent: 'system.systemAgent@get',
    Health: 'system.health@get',
    SyncState: 'system.syncStates@get',
    PendingActionsToAgent: 'system.pendingActionsToAgent@get',
    BundlingRulesDocument: 'integration.bundlerRules.get@get',
    BundleResult: 'printing.bundleResults@get',
    RecentBundles: 'printing.recentBundles@get',
    PrintTemplates: 'printing.printTemplates@get',
    MachinePrintConfigs: 'printing.machinePrintConfigs@get',
    InstalledPrinters: 'printing.installedPrinters@get',
    Devices: 'device.list@get',
    DeviceState: 'device.state.list@get',
    DeviceMetrics: 'device.metrics.list@get',
    WallboardDevices: 'wallboard.list@get',
    Users: 'user.list@get',
    Folders: 'folders.list@get',
    ExpressCommState: 'express.commstate@get',
    ExpressCtrlState: 'express.ctrlstate@get',
    ProductionEvents: 'productionEvents@get',
    PunchPatterns: 'punchPatterns.list@get',
    WarehouseViewModel: 'warehouse.viewmodel@get',
    // Note there is no 'DevicePartRunStatistics' or 'DeviceShiftStatistics'.
    // We're cheating and just letting them come to us via signalr.
  };

  private preLoad<T>(
    collection: string,
    apiname: string,
    filterDef: Fx.FilterDef
  ) {
    // On one machine the average load times of take values was: 25:60s, 100:35s, 200:35s, 500:22s, 1000:16s.
    // The big take size seems reasonable. We might hit an http body size limit at some point. If so, just
    // reduce it.
    getPagedItems<T>(
      apiname,
      Object.assign({ skip: 0, take: 1000 }, filterDef),
      this.apiResolver
    ).subscribe(page => {
      this.clientDataStore.Dispatch(new Initialize<T>(collection, page));
      this.$rootScope.$apply();
    });
  }

  addServerSubscription$: Rx.Observable<Action> = this.actions
    .filter(action => action.type === ADD_SUBSCRIPTION)
    // Post the subscription to the server
    .do((action: AddSubscription) => {
      this.subscriptionService.addSubscription(action.payload);
    })
    .filter(NODISPATCH);

  resetStore$: Rx.Observable<Action> = this.actions
    .filter(action => action.type === RESET)
    // Post the subscription to the server
    .do((action: any) => {
      // this.subscriptionService.addSubscription(action.payload);
      console.log('resetstore');
    })
    .filter(NODISPATCH);

  initiallyLoadSubscription$ = this.actions
    .filter(action => action.type === ADD_SUBSCRIPTION)
    .withLatestFrom(
      this.clientDataStore.Select<Fx.Subscription[]>('Subscriptions'),

      (newsubAction: AddSubscription, currentSubs: Fx.Subscription[]) => {
        return { newsub: newsubAction.payload, currentSubs };
      }
    )
    .filter(({ newsub, currentSubs }) => {
      // If we have an existing ALL subscription, the values are already prefetched.
      return (
        currentSubs
          .filter(s => s.collection === newsub.collection)
          .filter(s => s.filterDef.type === Fx.ALL)
          .filter(s => s.id !== newsub.id).length === 0 // it's possible this subscription has been added already.
      );
    })
    .do(({ newsub, currentSubs }) => {
      // Fetch the initial set
      let apiName = this.collectionApiMap[newsub.collection];

      if (!apiName) {
        // Throwing here would stop the observable pump. We don't want that, so just error log is enough.
        console.error(
          `No initializer url for collection '${newsub.collection}'`
        );
        return;
      }

      this.preLoad<any>(newsub.collection, apiName, newsub.filterDef);
    })
    .filter(NODISPATCH);

  deleteServerSubscription$: Rx.Observable<Action> = this.actions
    .filter(action => action.type === DEL_SUBSCRIPTION)
    .do((action: DelSubscription) => {
      this.subscriptionService.deleteSubscription(action.payload);
    })
    .filter(NODISPATCH);

  chopStoreCollection$: Rx.Observable<Action> = this.actions
    .filter(action => action.type === DEL_SUBSCRIPTION)
    .map((x: DelSubscription) => x.payload)
    .withLatestFrom(
      this.clientDataStore.Select<Fx.Subscription[]>('Subscriptions'),

      (deletedSub, currentSubs) => {
        let chopSubs = currentSubs
          .filter(s => s.collection === deletedSub.collection)
          .filter(s => s.id !== deletedSub.id);
        return new Chop(deletedSub.collection, chopSubs);
      }
    );

  clientDataReconnected$ = this.actions
      .filter(action => action.type === SIGNALR_RECONNECTED)      
      .withLatestFrom(
         this.clientDataStore.Select<Fx.Subscription[]>('Subscriptions'),  
         (_, currentSubs) => {
          return currentSubs;
         })
      .do(currentSubs => {
        currentSubs.forEach(sub => {
          this.subscriptionService.addSubscription(sub);
        });
      })
      .filter(NODISPATCH);

  autorefreshNewUi$ = this.clientDataStore
    .Selector(state => state.SystemInfo)
    .filter(si => si.version.length > 0) // skip the startup default empty string
    .distinctUntilChanged(si => si.version)
    .tap(si => {
      // tell raygun about the version
      rg4js('setVersion', si.version);
    })
    .skip(1) // Skip the emit of the version at startup
    .tap(si => {
      let message =
        'A new version of the application has been installed! (' +
        si.version +
        ')';
      this.$mdToast.show(
        this.$mdToast
          .simple()
          .textContent(message)
          .position('top right')
          .hideDelay(2000)
          .parent('#content')
      );
      document.location.reload();
    })
    .filter(NODISPATCH);
}
