
import {
  IReasonCode, ILocation, ITask, ISystemPreferences, ISystemInfo, ISchedule, IAlert, IAvailableJob, IJobSummaryDto,
  IJobDetailDto, IHealth, IAvailableJobColumn, ILicense, IWebhookConfig, IWebhookEvent, IScheduleSummary, IAndonView,
  IMetricDefinition, IMachine, IMachineStateDto, IRollformingStatistics, IStatisticsHistory, IUser, IUserSession, Fx,
  IBundlingRulesDocument, ILanguage, IMachineMetricSettings, IScheduleEstimate, ICoilDto, IMaterialDto, IScheduledDowntimeDto,
  IPendingActionsToAgent, ISyncState, IAndonSequenceConfig, IConsumptionHistory, ITaskFacet, IUserTaskFilter, IUserTaskFilters,
  IProductionSummaryReportModel, IBundleResult, IOrderImportEvent, ICoilImportEvent, IExportConfig, IExportEvent, IMaterialImportConfig,
  IMaterialImportEvent, IScheduleSyncConfig, IScheduleSyncEvent, IDevice, IDeviceMetrics, IDevicePartRunStatistics, IDeviceShiftStatistics,
  IDeviceState, IInstalledPrinters, IMachinePrintConfig, IPrintTemplate, IWallboardDevice, IOrderImportConfig, ICoilImportConfig,
  IScheduledJobColumn, IPathfinderMachine, ISingleOrderState, ToolingHeader, ToolingDef, ExpressCtrlState, ExpressCommState,
  IRecentBundleResult, IProductionEvent, WarehouseViewModel, IExternalConnection
} from "../../dto";
import { IDeviceExplorerDataModel, IExplorerDataModel } from "./productionexplorer/models";
import { SchedulingSpeed, JobsInFlightState } from "./scheduler/reducers";
import { BundleRules } from './order/selectors';



/**
* Defines the shape of the all the data in the store. Iow,
* this is what the reducers create.
*/
// Seems like this could be implied as a result of combineReducers(), 


// instead of manually created like this.
export interface IAppState {
  ReasonCode: IReasonCode[];
  Location: ILocation[];
  MaterialTask: ITask[];
  SystemPreferences: ISystemPreferences;
  SystemInfo: ISystemInfo;
  UpdateInfo: any;
  SystemAgent: any;
  BundlingRulesDocument: IBundlingRulesDocument;
  Machine: IMachine[];
  MetricDefinition: IMetricDefinition[];
  MachineState: IMachineStateDto[];
  MachineStatistics: IRollformingStatistics[];
  MachineStatisticsHistory: IStatisticsHistory[];
  MachineMetricSettings: IMachineMetricSettings[];
  MachineScheduleSummary: IScheduleSummary[];
  MachineSchedule: IScheduleEstimate[];
  Coil: ICoilDto[];
  CoilTypes: IMaterialDto[];
  JobSummary: IJobSummaryDto[];
  JobDetail: IJobDetailDto[];
  ScheduledDowntimeDefinition: IScheduledDowntimeDto[];
  AvailableJob: IAvailableJob[];
  Schedule: ISchedule[];
  Alerts: IAlert[];
  Health: IHealth[];
  PendingActionsToAgent: IPendingActionsToAgent[];
  SyncState: ISyncState[];
  AndonSequenceConfig: IAndonSequenceConfig[];
  AndonViews: IAndonView[];
  ConsumptionHistory: IConsumptionHistory[];
  Subscriptions: Fx.Subscription[];
  TaskFilters: ITaskFacet[];
  UsersTaskFilters: IUserTaskFilters[];
  AvailableJobColumns: IAvailableJobColumn[];
  ScheduledJobColumns: IScheduledJobColumn[];
  ProductionSummaryReport: IProductionSummaryReportModel;
  BundleResult: IBundleResult[];
  OrderImportEvents: IOrderImportEvent[];
  CoilImportEvents: ICoilImportEvent[];
  OrderImportConfigs: IOrderImportConfig[];
  CoilImportConfigs: ICoilImportConfig[];
  ExportConfigs: IExportConfig[];
  ChannelItemStates: IExportEvent[];
  MaterialImportConfigs: IMaterialImportConfig[];
  MaterialImportEvents: IMaterialImportEvent[];
  ScheduleSyncConfigs: IScheduleSyncConfig[];
  ScheduleSyncEvents: IScheduleSyncEvent[];

  ToolingItems: ToolingHeader[];
  ToolingDefs: ToolingDef[];

  Devices: IDevice[];
  DeviceState: IDeviceState[];
  DeviceMetrics: IDeviceMetrics[];
  DevicePartRunStatistics: IDevicePartRunStatistics[];
  DeviceShiftStatistics: IDeviceShiftStatistics[];
  CoilValidationConfigs: IExportConfig[];
  CoilValidationEvents: IExportEvent[];
  WebhookConfigs: IWebhookConfig[];
  WebhookEvents: IWebhookEvent[];
  ExternalConnections: IExternalConnection[];
  RecentBundles: IRecentBundleResult[];
  PrintTemplates: IPrintTemplate[];
  MachinePrintConfigs: IMachinePrintConfig[];
  InstalledPrinters: IInstalledPrinters;
  UnlicensedMachine: IMachine[];
  License: ILicense;
  UserSession: IUserSession;
  ExplorerData: IExplorerDataModel;
  DeviceExplorerData: IDeviceExplorerDataModel;
  DebugCollectionMetrics: any;
  DebugActionMetrics: any;
  SchedulingSpeed: SchedulingSpeed;
  WallboardDevices: IWallboardDevice[];
  Users: IUser[];

  BundleRules: BundleRules[];
  SingleOrder: ISingleOrderState;
  Folders: IPathfinderMachine[];

  SelectedJobs: number[];
  SummarizedJobs: number[];
  JobsInFlight: JobsInFlightState;

  ExpressCtrlState: ExpressCtrlState[];
  ExpressCommState: ExpressCommState;

  ProductionEvents: IProductionEvent[];
  PunchPatterns: any[];

  WarehouseViewModel: WarehouseViewModel;

  // Summary: IScheduleSummary[];
  // IsAuthTried: boolean;
  // ScheduledJobs: ISchedule[];
  // JobSummaries: IJobSummaryDto[];
}
