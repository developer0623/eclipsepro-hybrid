import { AvailableJobGridItem } from './services/store/scheduler/selectors';
export interface ILicense {
  serverId: string;
  lastUpdate: string;
  updateCount: number;
  modules: Array<{ name: string; expiry: string }>;
  machines: Array<{ unitNum: string; name: string; expiry: string }>;
}

export interface IWebhookConfig {
  id: string;
  settingsId: string;
  type: string;
  state: string;
  settings: any;
  messages: string[];
}
export interface IWebhookEvent {
  id: string;
  start: Date;
  successful: boolean;
  request: string;
  response: string;
}

export interface IExternalConnection {
  id: string;
  type: string;
  state: string;
  settings: any;
  messages: string[];
}
export interface ICoilDto {
  id: string;
  coilId: string;
  documentId: string;
  materialCode: string;
  description: string;
  weightStartLbs: number;
  dateIn: Date;
  dateOut: Date;
  importDate: Date;
  vendorName: string;
  vendorCode: string;
  heatNumber: string;
  purchaseOrder: string;
  user1: string;
  user2: string;
  isComplete: boolean;
  lengthStartFt: number;
  lengthRemainingFt: number;
  lengthUsedFt: number;
  lengthNonExemptScrapFt: number;
  lengthExemptScrapFt: number;
  lengthOtherAdjustmentsFt: number;
  locationId: string;
  gauge: number;
  color: string;
  widthIn: number;
  materialType: string;
}

export interface IMaterialDoc {
  materialCode: string;
  description: string;
  gauge: number;
  color: number;
  widthIn: number;
  type: string;
  lbsPerFt: number;
  costPerLb: number;
  thicknessIn: number;
}
export interface IMaterialDto extends IMaterialDoc {
  id: string;
  demandFt: number;
  onHandFt: number;
  onHandQty: number;
  balanceFt: number;
}

export interface IJobDetailDto {
  id: string;
  ordId: number;
  job: IJobSummaryDto;
  items: IJobItem[];
  bundles: IJobBundle[];
}

export interface IJobState {
  ordId: number;
  orderCode: string;
  toolingCode: string;
  materialCode: string;
  completeFt: number;
  remainingFt: number;
  totalFt: number; // TODO: Is this not already on JobDetail.Job...do we really need to repeat it?
  startDateTime: Date;
  duration: string;
  completionDate: Date;
}

export interface IJobItem {
  itemId: number;
  bundle: number;
  quantity: number;
  quantityDone: number;
  lengthIn: number;
  patternName: string;
  patternId: string;
  //patternNumber: number; //removing this for now. It might come back.
  option: string;
  sequence: number;
  user1: string;
  user2: string;
  user3: string;
  user4: string;
  user5: string;
  externalItemId: string;
  messageText: string;
  holeCount: number;
  calculateLengthFromHole: boolean;
  bundleCode: string;
  bundleGroup: string;
  doneDate: Date;
  stagger: boolean;
  weightLbs: number;
  pieceMark: string;
  patternNotDefined: boolean;
}

export interface IJobBundle {
  bundleId: number;
  bundle: number;

  user1: string;
  user2: string;
  user3: string;
  user4: string;
  user5: string;
}

export type JobScheduleState =
  | { state: 'Scheduled'; machineNumber: number; sequence: number }
  | { state: 'Unscheduled' | 'Done' };

export interface IJobSummaryDto {
  id: string;
  ordId: number;
  orderCode: string;
  toolingCode: string;
  isOnMachine: boolean;
  toolingDescription: string;
  /** @deprecated Use scheduleState instead, or legacyStatus if you really need all those various states COMM provides */
  status: string;
  materialCode: string;
  material: IMaterialDto;
  hold: boolean;
  customerName: string;
  workOrder: string;
  truckNumber: string;
  /** You'll need to call `new Date(x.requiredDate)` or `moment(x.requiredDate)` if you want to use this as an actual `Date`. */
  requiredDate?: string;
  importDate: Date;
  user1: string;
  user2: string;
  user3: string;
  user4: string;
  user5: string;
  customerAddress1: string;
  customerAddress2: string;
  customerCity: string;
  customerState: string;
  customerZip: string;
  customerCountry: string;
  customerInstructions: string;
  stagingBay: string;
  loadingDock: string;
  customerNumber: string;
  customerPhone: string;
  customerPO: string;
  salesOrder: string;
  operatorMessage: string;
  /** You'll need to call `new Date(x.shipDate)` or `moment(x.shipDate)` if you want to use this as an actual `Date`. */
  shipDate?: string;
  legacyStatus: string;
  actionInProcess: boolean;
  completeFt: number;
  remainingFt: number;
  remainingLbs: number;
  totalFt: number;
  quantity: number;
  quantityDone: number;
  startDateTime: Date;
  duration: string;
  completionDate: Date;
  scheduleState: JobScheduleState;
  /** @deprecated Use scheduleState instead */
  sequence: number;
  /** @deprecated Use scheduleState instead */
  machineNumber: number;

  materialColor: string;
  materialGauge: number;
  materialWidthIn: number;
  materialDescription: string;
  longestLengthIn: number;
  shortestLengthIn: number;
  patternNotDefined: boolean;
  materialShortageAlert: boolean;
  bundleCount: number;
  isDeleted: boolean;
}
export interface IAvailableJob {
  id: string;
  expectedRuntime: number;
  warningDueDate: boolean;
  pastDueDate: Date;
  machineNumber: number;
  ordId: number;

  toolingCode: string;
  materialCode: string;
  /** You'll need to call `new Date(x.requiredDate)` or `moment(x.requiredDate)` if you want to use this as an actual `Date`. */
  requiredDate?: string;
  orderCode: string;
  customerName: string;
  totalFt: number;
  remainingFt: number;
  truckNumber: string;
  stagingBay: string;
  loadingDock: string;
  materialColor: string;
  materialGauge: number;
  materialWidthIn: number;
  materialDescription: string;
  toolingDescription: string;
  longestLengthIn: number;
  salesOrder: string;
  user1: string;
  user2: string;
  user3: string;
  user4: string;
  user5: string;
  workOrder: string;
  importDate: Date;
  /** You'll need to call `new Date(x.shipDate)` or `moment(x.shipDate)` if you want to use this as an actual `Date`. */
  shipDate?: string;
  hold: boolean;
}

export type OrderStatus =
  | 'Unscheduled'
  | 'Sequenced'
  | 'Scheduled'
  | 'Sending'
  | 'Machine'
  | 'Return'
  | 'Recall'
  | 'Done'
  | 'Unknown'
  | 'Error'
  | 'ToSequence'
  | 'ToUnschedule'
  | 'ToSend'
  | 'ToRecall'
  | 'ToHold'
  | 'ToUnhold';

export type ScheduledJobGridItem = IScheduleItem &
  IJobSummaryDto & {
    isSelected: boolean;
    requiredDateDisplay: string;
    importDateDisplay: string;
    shipDateDisplay: string;
    mainIndex?: number;
    // remainingRuntime: string;
  };

export type RangeValue = {
  start: string | number;
  end: string | number;
};
export type ScheduledJobColumnFieldName =
  | keyof ScheduledJobGridItem
  | 'remainingRuntime';

export interface IScheduledJobColumn {
  fieldName: ScheduledJobColumnFieldName;
  name: string;
  isChecked: boolean;
  color: string;
  displayName: string;
  units: string;
  width?: number;
  summarizer(
    items: ScheduledJobGridItem[],
    column: { fieldName: ScheduledJobColumnFieldName }
  ): string | RangeValue;
}
export interface IAvailableJobColumn {
  summarizer(
    jobs: AvailableJobGridItem[],
    column: IAvailableJobColumn
  ): string | RangeValue;
  fieldName: keyof AvailableJobGridItem;
  width?: number;
  name: string;
  isChecked: boolean;
  color: string;
  displayName: string;
  units: string;
}
export interface IUserColumnChoice {
  field: string;
  isChecked: boolean;
}
export interface IScheduledDowntimeDto {
  id: string;
  documentID: string;
  /*
  "machines": [
    1,
    2,
    3,
    4,
    5,
    6
  ],
  "title": "Safety Meeting",
  "occurs": "OneTime",
  "timeOfDay": "13:00:00",
  "duration": "00:15:00",
  "activityType": "Break",
  "startDate": "2017-01-31T00:00:00-06:00",
  "occurenceCount": null,
  "daysOfWeek": null,
  "endDate": "1969-12-31T18:00:00-06:00",
  "endRepeat": "Never",
  "everyCount": 0,
  "monthValue": "Each",
  "selectedDate": null,
  "dayOfMonth": "First",
  "weekDayOfMonth": "Sunday"
  */
}
export interface IDashboardMachine {
  machineNumber: number;
  machine: IMachine;
  state: IMachineStateDto;
  stats: IRollformingStatistics;
  statsHistory: IStatisticsHistory;
  scheduleSummary: IScheduleSummary;
  scheduleEstimate: IScheduleEstimate;
  metricSettings: IMachineMetricSettings;
}

export interface IMachineStateDto {
  id: string;
  machineNumber: number;
  lastRunStateChange: Date;
  runState: string;
  isOffline: boolean;
  // "machineName": "Multi-profile Line",//not needed
  // "eventDateTime": "2016-02-16T13:54:37-06:00",
  orderCode: string;
  materialCode: string;
  toolingCode: string;
  bundleNumber: number;
  currentItemAddress: string;
  currentItemLengthIn: number;
  currentItemExternalId: string;
  currentItemQty: number;
  currentItemQtyDone: number;
  currentItmId: number;
  currentCustomerName: string;
  currentWorkOrder: string;
  currentCoilId: string;
  currentCoilMaterialCode: string;
  currentCoilRemainingFeet: number;
  employeeNumber: string;
  employeeName: string;
  currentShiftCode: string;
  lockOutEnabled: boolean;
  isHoleCount: boolean;
  // "serverReceivedDate": "2017-02-24T00:06:06.0382563-06:00"
}

export interface IScheduleSummary {
  id: string;
  // "documentID": "MachineScheduleSummary/1",
  machineNumber: number;
  currentOrderId: number;
  currentOrderCode: string;
  currentMaterialCode: string;
  currentToolingCode: string;
  currentOrderTotalFeet: number;
  currentOrderRemainingFeet: number;
  currentOrderPercentComplete: number;
  currentMaterialRemainingFeet: number;
  currentToolingRemainingFeet: number;
  currentBundleNumber: number;
  currentBundleQuantity: number;
  currentBundleQuantityDone: number;
  lastBundleNumber: number;
  currentLength: number;
  currentItemExternalId: string;
  currentItemQty: number;
  currentItemQtyDone: number;
  currentCustomerName: string;
  currentCoilId: string;
  currentCoilMaterialCode: string;
  currentCoilRemainingFeet: number;
  nextOrderId: number;
  nextOrderCode: string;
  nextMaterialCode: string;
  nextToolingCode: string;
  nextOrderFeet: number;
  nextMaterialFeet: number;
  nextToolingFeet: number;
  nextOrderCustomerName: string;
  nextWorkOrder: string;
  scheduledFeetTotal: number;
  scheduledJobsCount: number;
  availableFeetTotal: number;
  availableJobsCount: number;
  atMachineFeetTotal: number;
  scheduleCompletionDate: Date;
  currentToolingCompletionDate: Date;
  currentToolingRuntimeMs: number;
  currentMaterialCompletionDate: Date;
  currentMaterialRuntimeMs: number;
  currentOrderCompletionDate: Date;
  currentOrderRuntimeMs: number;
  nextOrderRuntimeMs: number;
  nextToolingDurationMs: number;
  nextToolingRuntimeMs: number;
  nextMaterialDurationMs: number;
  nextMaterialRuntimeMs: number;
  nextOrderDurationMs: number;
}

export interface IScheduleEntry {
  id: string;
  activityType: string;
  startDateTime: Date;
  //TimeSpan Duration { get; set; }
  endDateTime: Date;
  durationMs: number;
  machineNumber: number;
  orderCode: string;
  materialCode: string;
  toolingCode: string;
  ordId: number;
  remainingFt: number;
  totalFt: number;
  customerName: string;
  jobId: string;
  title: string;
  state: string;
  downtimeId: string;
  showLeftLine: boolean;
  showRightLine: boolean;
}

export interface IScheduleEstimate {
  id: string;
  documentId: string;
  machineNumber: number;
  scheduleBlocks: IScheduleEntry[];
  asOf: Date;
}

export interface IHistVal {
  shiftCode: string;
  value: number;
}

export interface IStatisticsHistory {
  id: string;
  machineNumber: number;
  oEEHistory: IHistVal[];
  targetPctHistory: IHistVal[];
  scrapPctHistory: IHistVal[];
  goodFeetHistory: IHistVal[];
  runPctHistory: IHistVal[];
}

export interface IRollformingStatistics {
  id: string;
  documentID: string;
  machineNumber: number;
  start: Date;
  end: Date;
  startShiftCode: string;
  endShiftCode: string;
  recordCount: number;

  toolingChangeCount: number;
  coilChangeCount: number;
  materialChangeCount: number;
  goodPieceCount: number;
  scrapPieceCount: number;

  goodFeet: number;
  goodPct: number;
  scrapFeet: number;
  scrapPct: number;
  reclaimedScrapFeet: number;
  reclaimedScrapPct: number;
  scrapPareto: IAggregate[];

  totalMinutes: number;
  runMinutes: number;
  runPct: number;

  totalDelayMinutes: number;

  totalDelayPct: number;
  nonExemptMinutes: number;
  nonExemptPct: number;
  exemptMinutes: number;
  exemptPct: number;

  offlineMinutes: number;
  offlinePct: number;
  totalNonExemptMinutes: number;
  downtimePareto: IAggregate[];

  avgFPM: number;
  avgThroughput: number;
  oee: number;
  targetPct: number;

  actualGoodFeet: number;
  expectedGoodFeet: number;
  targetFPM: number;
  targetGoodFeet: number;
  totalFeet: number;
  totalOperationMinutes: number;
  statusEventTime: Date;
  productionEventTime: Date;
}

export interface IAggregate {
  typeId: number;
  name: string;
  instanceCount: number;
  value: number;
  codeExempt: string;
  codeResponsibility: number;
}

export interface IShiftChoice {
  index: number;
  shiftCode: string;
  shiftDate: Date;
  shift: number;
}

export interface IMachineMetricSettings {
  id: number;
  documentId: string;
  machineNumber: number;
  settings: IMetricConfig[];
}

export interface IMetricConfig {
  metricId: string;
  targetValue: number;
  okRangeStart: number;
  okRangeEnd: number;
  maxValue: number;
  minValue: number;
  showInMini: boolean;
  showInLarge: boolean;
}
export interface IMetricDefinition {
  metricId: string;
  primaryDataKey: string;
  primaryUnits: string;
  secondaryDataKey: string;
  secondaryUnits: string;
  historyKey: string;
  lowerIsBetter: boolean;
  targetValue: number;
  minValue: number;
  maxValue: number;
  okRangeStart: number;
  okRangeEnd: number;
  nameToolTip: string;
  primaryToolTip: string;
  secondaryToolTip: string;
  historyToolTip: string;
  showInMini: boolean;
  showInLarge: boolean;
}

export interface IMachineTooling {
  id: string;
  machineId: string;
  toolingId: string;
}

export type LockdownCodeValue = 'Always' | 'WithKey' | 'Never';
export type LockdownCode = { label: string; value: LockdownCodeValue };
type LockdownCodeModel = LockdownCode[];
type EclipseEnforcedSetup = {
  value: number;
  isEnabled: boolean;
  isLocked: boolean;
  label: string;
  help: string;
  available: boolean;
};

export interface IMachine {
  id: number;
  machineNumber: number;
  description: string;
  isActive: boolean;
  isLicensed: boolean;
  ipAddress: string;
  commName: string;
  uartVersion: number;
  // You probably don't want to access this directly.
  // Go look at `machineHasClaim` function.
  claims: string[];
  autoPushEnabled: boolean;
  autoPushMinFt: number;
  orderLockdownCode: string;
  orderLockdownModel: LockdownCodeModel;
  patternLockdownCode: string;
  patternLockdownModel: LockdownCodeModel;
  eclipseEnforcedSetups: {
    haltDelayMinimum: EclipseEnforcedSetup;
    useScrapCodes: EclipseEnforcedSetup;
    manualShearScrapLengthIn: EclipseEnforcedSetup;
    enforceEclipseCoilValidation: EclipseEnforcedSetup;
    enforceBundlingRules: EclipseEnforcedSetup;
    useCoilInventory: EclipseEnforcedSetup;
    allowCoilOverride: EclipseEnforcedSetup;
    autoRequestOrderFootage: EclipseEnforcedSetup;
    displayBundleIdPrompts: EclipseEnforcedSetup;
    autoDeleteDoneOrdersAfter: EclipseEnforcedSetup;
    showUserDataProgram: EclipseEnforcedSetup;
    showUserDataStatus: EclipseEnforcedSetup;
    staggerPanelField: EclipseEnforcedSetup;
    setDoneItemsToReady: EclipseEnforcedSetup;
  };
}

export interface IMachineTools {
  documentID: string;
  machineNumber: number;
  date: Date;
  softwareModel: string;
  softwareVersion: string;
  controllerListId: number;
  libraryName: string;
  libraryId: number;
  uartVersion: number;
  tools: {
    tool: number;
    press: number;
    gag: number;
    axis: number;
    offsetIn: number;
    yOffsetIn: number;
    name: string;
    kerfAdjustIn: number;
  }[];
}

export interface IMachineSetups {
  documentID: string;
  machineNumber: number;
  date: Date;
  softwareModel: string;
  softwareVersion: string;
  instanceId: number;
  libraryName: string;
  libraryId: number;
  switchCode: string;
  uartVersion: number;
  parameters: IMachineSetup[];
}

export interface IMachineSetup {
  setupName: string;
  setupValue: string;
  isReadOnly: boolean;
  hasChanged: boolean;
  setupId: number;
  autoId: number;
  includeWithDownload: boolean;
  localizedValue: string;
  localizedName: string;
  flags: string;
}

export interface IDevice {
  id: string;
  name: string;
  deviceId: string;
}
export interface IDeviceState {
  id: string;
  deviceId: string;
  runState: string;
  machinePower: boolean;
  faulted: boolean;
  badParts: number;
  goodParts: number;
  cycles: number;
  asOf: string;
  milliSecSinceBoot: number;
  override: boolean;
  operator: string;
  currentPartId: string;
  isTimingOut: boolean;
  /* Used to look up the current IDevicePartRunStatistics. */
  devicePartRunSelectionEventId: string;
}
export interface IDeviceMetrics {
  id: string;
  deviceId: string;
  oee: number;
  speedPpm: number;
  scrapCount: number;
  cyclesPm: number;
}
export interface IDevicePartRunStatistics {
  id: string;
  partRun: {
    devicePartRunSelectionEventId: string;
  };
  badParts: number;
  goodParts: number;
  cycles: number;
  eventCount: number;
  speedPpm: number;
  runtime: string;
}
export interface IDeviceShiftStatistics {
  id: string;
  deviceId: string;
  shiftCode: string;
  totalMinutes: number;
  totalOperations: number;
  totalParts: number;
  runMinutes: number;
  nonExemptMinutes: number;
  avgOpsPerHrTotal: number;
  avgOpsPerHrRunning: number;
}

export interface ISchedule {
  id: string;
  machineNumber: number;
  sequence: (IScheduleItem & { job: IJobSummaryDto })[];
}
export interface IScheduleItem {
  id: string;
  isOnMachine: boolean;
  machineNumber: number;
  ordId: number;
  pastDueDate: boolean;
  remainginRuntime: string;
  sequenceNum: number;
  warningDueDate: boolean;
  warningMaterial: boolean;
  // These members are not sent in the json
  pastDueText: string;
  actionInProgress: boolean;
  warningText: string;
}
export interface IJobs {
  id: string;
  orderId: string;
  requiredDate: Date;
  importDate: Date;
  totalFt: Number;
  hold: Boolean;
  customerName: string;
  workOrder: string;
  truckNumber: string;
  stagingBay: string;
  loadingDock: string;
  customerAddress1: string;
  customerAddress2: string;
  customerCity: string;
  customerState: string;
  customerZip: string;
  customerCountry: string;
  customerInstructions: string;
  toolingId: string;
  coilTypeId: string;
  JobStateId: string;
}

export interface ITooling {
  id: string;
  name: string;
  description: string;
}

/** As returned from `/_api/tooling`.
 */
export interface ToolingHeader {
  machines: {
    machineNumber: number;
    description: string;
  }[];
  id: string;
  description: string;
};
/** As returned from `/_api/tooling/{toolingCode}`.
 */
export interface ToolingDef {
  id: string;
  toolingCode: string;
  needNormalizing: {
    descriptions: boolean;
    pCodeGroups: boolean;
    finWidths: boolean;
    legHeights: boolean;
  };
  description: string;
  pCodeGroup: string;
  legHeight: string;
  profile: string;
  finWidth: number;
  machines: {
    calcLength: number;
    description: string;
    finWidth: number;
    holeCount: number;
    holeSpace: number;
    legHeight: number;
    loadDock: string;
    machineName: string;
    machineNumber: number;
    pcodeGroup: string;
    preferred: boolean;
    stageBay: string;
    id: string;
  }[];
};

export interface PatternDef {
  id: string,
  patternName: string,
  defaultLength: Number,
  option: string,
  importDate: Date,
  isPermanent: boolean,
  hash: string,
  lastUsedDate: Date,
  patternNumber: number,
  isMacro: boolean,
  /** Server guarantees these are indeed sequential, starting at 1. */
  punches: PatternDefPunch[],
  changeId: number,
  machinePatterns: MachinePattern[],
}

export interface PatternDefPunch {
  idType: string;
  macroPatternName: string;
  punchId?: number;
  sequence: number;
  toolId: number;
  xOffset: number;
  xReference: string;
  yOffset: number;
  yReference: string;
}

export interface PatternDefPunchError {
  field: string,
  input: string,
  error: string
}

export interface AvailableMacro {
  id: string
  macroName: string
}

export interface ReferenceColumnsDef {
  value: string,
  text: string,
  resultingRefValue?: string[],
}

export interface MachinePattern {
  machineNumber: Number,
  pattern: Number,
  dontSave: boolean,
  operations: MachinePatternOperation[],
}

export interface MachinePatternOperation {
  idType: string;
  tool: number;
  sequence: number;
  xOffset: number;
  xReference: number;
  yOffset: number;
  yReference: number;
}

export interface ICoilType {
  id: string;
  name: string;
  width: Number;
  materialGauge: Number;
  materialColor: string;
  materialElementType: string;
}

export interface ICoil {
  id: string;
  serialNumber: string;
  vendor: string;
  startingLength: Number;
  storageLocation: string;
  coilTypeId: string;
}

export interface IJobStateDto {
  id: string;
  completionDate: Date;
  remaingRuntime: Number;
  completFt: Number;
  jobId: string;
}

export interface IConsumptionHistory {
  id: string;
  avgFPM: number;
  coilMaterialCode: string;
  coilSerialNumber: string;
  exemptMinutes: number;
  goodFeet: number;
  goodPieceCount: number;
  machineNumber: number;
  materialCode: string;
  nonExemptMinutes: number;
  ordId: number;
  orderCode: number;
  productionDate: Date;
  reclaimedScrapFeet: number;
  recordCount: number;
  runMinutes: number;
  scrapFeet: number;
  scrapPct: number;
  scrapPieceCount: number;
  targetFPM: number;
  toolingCode: string;
  totalFeet: number;
  totalMinutes: number;
  totalOperationMinutes: number;
}

export interface ITask {
  id: string;
  taskType: string;
  coilType: ICoilType;
  requiredFt: number;
  sourceLocationId: string;
  destinationLocationId: string;
  requiredDate: string;
  startedDate: Date;
  availableDate: Date;
  completedDate: Date;
  taskState: string;
  preferredCoils: ITaskCoil[];
  nonpreferredCoils: ITaskCoil[];
  userName: string;
  overrideCode: IReasonCode;
}

export interface ITaskCoil extends ICoil {
  id: string;
  warningFields: string[];
}

export interface IReasonCode {
  id: string;
  codeSet: string;
  reason: string;
  name?: string;
}

export enum LocationCategory {
  Machine,
  Warehouse,
  StagingBay,
  Truck,
  LoadingDock,
  Bin,
}
export interface ILocation {
  id: string;
  code: string;
  name: string;
  category: LocationCategory;
}
export interface ISystemPreferences {
  systemLanguage: string;
  inchesUnit: string;
  allowPrereleaseVersions: boolean;
  intranetUrl: string;
  redirectFromLocalhost: boolean;
  allowGuestUser: boolean;
  plantName: string;
  showMaterialShortageAlerts: boolean;
}
export interface ISystemInfo {
  version: string;
  serverId: string;
  serverStartTime: Date;
  /** Tells you if SignalR is connected to the ClientDataHub. */
  isSignalRConnected: boolean;
  /** Details of the most recent release, pulled from nuget */
  latestReleaseVersion?: {
    description: string;
    published: string; // Date
    version: string;
  };
}
export interface IPendingActionsToAgent {
  id: string;
  type: string;
  count: number;
}
export interface ILanguage {
  title: string;
  translation: string;
  code: string;
}

export interface IAlert {
  id: string;
  isCritical: boolean;
  alertType: string;
}

export interface IAndonSequenceConfig {
  id: string;
}

export interface IAndonView {
  name: string;
  viewKey: string;
  hasChart: string;
  editKey: string;
}

export interface IWallboardDevice {
  id: string;
  wallboardDeviceKey: string;
  wallboardDeviceName: string;
  contentType: 'NoContent' | 'Andon' | 'ExternalUrl' | 'Message' | 'Warehouse';
  contentParams: any;
}

export interface ITaskFacet {
  title: string;
  filters: ITaskFacetValue[];
}
export interface ITaskFacetValue {
  id: string;
  title: string;
}
export interface IUserTaskFilter {
  filterId: string;
  checked: boolean;
}

export interface IUserTaskFilters {
  id: string;
  userName: string;
  filters: IUserTaskFilter[];
}
export interface IOrderImportEvent {
  id: string;
  batchId: string;
  settingsId: string;
  start: Date;
  state: string;
  recordCount: number;
  importedCount: number;
  rejectedCount: number;
  rejects: {
    externalSystemRecordId: string;
    recordTitle: string;
    failureMessages: string[];
  };
}
export interface ICoilImportEvent {
  id: string;
  batchId: string;
  settingsId: string;
  start: Date;
  state: string;
  recordCount: number;
  importedCount: number;
  rejectedCount: number;
  rejects: {
    externalSystemRecordId: string;
    failureMessages: string[];
  };
}
export interface IOrderImportConfig {
  id: string;
  type: string;
  state: string;
  settings: any;
  messages: string[];
}
export interface ICoilImportConfig {
  id: string;
  type: string;
  state: string;
  settings: any;
  messages: string[];
}
export interface IExportConfig {
  id: string;
  type: string;
  state: string;
  settings: any;
  messages: string[];
}

export interface IExportEvent {
  id: string;
  channel: string;
  itemId: string;
  complete: boolean;
  stage: string;
  receivedTime: Date;
  activityLog: string[];
  executionDuration: TimeSpan;
  attemptCount: number;
  relatedId: string;
  relatedDesc: string;
}
export interface IMaterialImportConfig {
  id: string;
  type: string;
  state: string;
  settings: any;
  messages: string[];
}
export interface IMaterialImportEvent {
  id: string;
  batchId: string;
  settingsId: string;
  start: Date;
  state: string;
  recordCount: number;
  importedCount: number;
  rejectedCount: number;
  rejects: {
    externalSystemRecordId: string;
    failureMessages: string[];
  };
}
export interface IScheduleSyncConfig {
  id: string;
  type: string;
  state: string;
  settings: any;
  messages: string[];
}
export interface IScheduleSyncEvent {
  id: string;
  batchId: string;
  settingsId: string;
  start: Date;
  state: string;
  recordCount: number;
  importedCount: number;
  rejectedCount: number;
  rejects: {
    externalSystemRecordId: string;
    failureMessages: string[];
  };
}
export interface IBundleResult {
  id: string;
  bundleCode: string;
  ordId: number;
  orderCode: string;
  materialCode: string;
  toolingCode: string;
  workOrder: string;
  bundleNumber: number;
  producedLengthIn: number;
  longestLengthIn: number;
  exportComplete: boolean;
  hide: boolean;
  complete: boolean;
}

export interface IRecentBundleResult {
  id: string;
  bundleCode: string;
  ordId: number;
  orderCode: string;
  materialCode: string;
  toolingCode: string;
  workOrder: string;
  bundleNumber: number;
  producedLengthIn: number;
  longestLengthIn: number;
  exportComplete: boolean;
  hide: boolean;
  complete: boolean;
  isTagPrinted: boolean;
}

export type Percentage = number;
export type Length = number;
export type Cardinal = number;
export type Velocity = number;
export type TimeSpan = number;
export type UnitOfMeasure = Percentage | Length | Cardinal | Velocity;

export interface IBulletChartModel<TUnitOfMeasure> {
  targetValue: TUnitOfMeasure;
  okRangeStart: TUnitOfMeasure;
  okRangeEnd: TUnitOfMeasure;
  maxValue: TUnitOfMeasure;
  minValue: TUnitOfMeasure;
  // The actual current value
  value: TUnitOfMeasure;
}

export interface IHistoricValue<TUnitOfMeasure> {
  shiftCode: string;
  value: TUnitOfMeasure;
}

export interface IOneValueModel<T> {
  // The primary value of the metric.
  primary: T;
  // The sparkline values
  history: IHistoricValue<T>[];
  // The bullet chart data points
  bullet: IBulletChartModel<T>;
}
export interface ITwoValuesModel<TPrimary, TSecondary>
  extends IOneValueModel<TPrimary> {
  // The secondary value of the metric.
  secondary: TSecondary;
}

export interface IProductionSummaryReportRecord {
  id: number;
  totalGoodLn: ITwoValuesModel<Length, Cardinal>;
  netScrap: ITwoValuesModel<Percentage, Length>;
  runningThroughput: IOneValueModel<Velocity>;
  oee: IOneValueModel<Percentage>;
  target: IOneValueModel<Percentage>;
  availability: IOneValueModel<Percentage>;
  speed: IOneValueModel<Percentage>;
  yield: IOneValueModel<Percentage>;
  timeBar: {
    running: Percentage;
    changeover: Percentage;
    breakdown: Percentage;
    otherUnexpected: Percentage;
    otherExpected: Percentage;
    unscheduled: Percentage;
    availableTime: TimeSpan;
    durationTime: TimeSpan;
  };
}

export interface IMaterialUsageRecord {
  lengthScrapFt: number;
  lengthUsedFt: number;
  materialCode: string;
  scrapPerc: number;
}

export interface IMaterialUsageReportRecord {
  duration: string;
  key: { day: number; month: number; year: number };
  lengthScrapFt: number;
  lengthUsedFt: number;
  scrapPerc: number;
  records: IMaterialUsageRecord[];
}

export interface IProductionSummaryReportModel {
  records: IProductionSummaryReportRecord[];
}

export interface IBundlingRule {
  maxPieceCount: number;
  maxWeightLbs: number;
  minPctOfMaxLength: Percentage;
  itemSort: string;
}

export interface IBundlingRulesDocument {
  systemLevel: IBundlingRule;
  customerRules: { [key: string]: IBundlingRule };
  toolingDefRules: { [key: string]: IBundlingRule };
  materialToolingRules: (
    | { material: string; tooling: string }
    | IBundlingRule
  )[];
  customerToolingRules: (
    | { customer: string; tooling: string }
    | IBundlingRule
  )[];
}

export interface IPrintTemplate {
  id: string;
  name: string;
  pageHeightIn: number;
  pageWidthIn: number;
  type: string;
}

export interface IMachinePrintConfig {
  id: number;
  machineNumber: number;
  bundlePrinterName: string;
  defaultBundleTemplate: string;
  bundlePrintCount: number;
  coilTagTemplate: string;
  coilTagPrinterName: string;
  coilTagPrintCount: number;
}

export interface IInstalledPrinters {
  printers: IPrinterDetail[];
}

export interface IPrinterDetail {
  id: string;
  name: string;
  fullName: string;
  description: string;
  location: string;
  hasPaperProblem: boolean;
  isInError: boolean;
  isOffline: boolean;
  isPaused: boolean;
  numberOfJobs: number;
  hostingPrintServer: string;
  shareName: string;
  queueStatus: string;
  queuePortName: string;
  queueDriverName: string;
}

export interface IHealth {
  id: string;
  effectsName: string;
  serviceName: string;
  status: string; // ServiceStatus
  error: any; // Exception
}

export type HealthSummaryType = {
  collection: string
  count: number
};

export interface ISyncState {
  id: string;
  changeId: number;
  updatesCount: number;
  deletesCount: number;
  startTime: Date;
  lastSyncTime: Date;
  updatesPerMin: number;
  deletesPerMin: number;
}

export interface IUserSession {
  claims: string[];
  roles: string[];
  userName: string;
  token: string;
  isNavigationFolded: boolean;
  serverId: string;
}

export interface IUser {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  roles: string[];
  folderRoles: {
    folderId: string;
    role: 'None' | 'Operator' | 'Administrator';
  }[];
  folderPin: string;
}

export type IPathfinderMachine = {
  id: string;
  serialNumber: string;
  name: string;
  accepted: boolean;
};

export interface IUnitDef {
  key: string;
  system: string;
  base: string;
  title: string;
}

export type ExpressCommState = {
  id: string;
};
export type ExpressCtrlState = {
  id: string;
  machineNumber: number;
  address: string;
  connectionState: string;
  last: {
    command: string;
    response: string;
    responseReceived: string; // a date
  };
  txCount: number;
  sparkData: { ordinal: number; value: number }[];
};
/** We've somewhat standardized on this shape when the api returns 400 (bad result). */
export type BadRequestResponse = {
  errors: string[];
};

export interface IProductionEvent {
  id: string;
  type: string;
  reason: string;
  eventTitle: string; // or enum
  recordDate: Date;
  productionDate: Date;
  shiftCode: string;
  shift: number;
  machineNumber: number;
  machineDescription: string;
  orderCode: string;
  materialCode: string;
  toolingCode: string;
  ordId: number;
  itmId: number;
  bundle: number;
  partLengthIn: number;
  quantity: number;
  producedLengthFt: number;
  consumedLengthFt: number;
  goodFt: number;
  scrapFt: number;
  exemptScrapFt: number;
  reclaimedScrapFt: number;
  coilSerialNumber: string;
  coilMaterialCode: string;
  durationMinutes: number;
  runMinutes: number;
  downMinutes: number;
  exemptMinutes: number;
  lossCode: number;
  lossDescription: string;
};

export namespace Fx {
  export const ALL = 'ALL';
  export const IN = 'IN';
  export const RANGE = 'RANGE';
  export const ALLRECENT = 'ALLRECENT';

  export class In {
    public type = IN;
    constructor(public property: string, public values: (string | number)[]) {
      if (values.length === 0) throw '`values` array cannot be empty';
    }
  }
  export class All {
    public type = ALL;
    constructor() { }
  }
  export class Range {
    public type = RANGE;
    constructor(public property: string, public start: any, public end: any) { }
  }
  export class AllRecent {
    public type = ALLRECENT;
    constructor(public daysOld: number ) {}
  }

  export type FilterDef = In | All | Range;
  export function toFilterExpr<T>(filterDef: FilterDef): (T) => boolean {
    switch (filterDef.type) {
      case ALL: {
        return _ => true;
      }
      case IN: {
        const init = (t: T) => false;
        let in_filter = filterDef as In;
        return in_filter.values.reduce(
          (acc, value) => (t: T) => t[in_filter.property] === value || acc(t),
          init
        );
      }
      case ALLRECENT: {
        // Not exactly accurate, but probably adequate as ALLRECENT is used in
        // only one place at the moment.
        return _ => true;
      }
      default: {
        throw `FilterDef type '${filterDef.type}' is not implemented`;
      }
    }
  }
  export class Subscription {
    public id: string;

    constructor(public collection: string, public filterDef: Fx.FilterDef) {
      this.id = this.uuidv4();
    }

    private uuidv4() {
      // from https://stackoverflow.com/a/2117523/947
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        (c) => {
          let r = Math.random() * 16 | 0;
          let v = c === 'x' ? r : r & 0x3 | 0x8;
          return v.toString(16);
        }
      );
    }
  }
}

export type RebundleResult = {
  ordId: number
  lbsPerFt: number
  rebundledItems: RebundledItem[]
  rebundledBundles: RebundledBundle[]
}

export type RebundledItem = {
  itemId: number
  prototypeItemId: number
  lengthIn: number
  quantity: number
  sequence: number
  bundle: number
}
export type RebundledBundle = {
  prototypeBundleId: number
  bundle: number
}

export type ISingleOrderState = {
  ordId: number;
  clearRebundleOnNextPut: boolean;
  rebundleResult: RebundleResult;
} | null

export interface IPunchPattern {
  id: string
  isMacro: boolean;
  isPermanent: boolean;
  patternName: string;
  patternNumber: number;
  punchCount: number;
  importDate: Date
  lastUsedDate: Date
}

export interface WarehouseViewModel {
  id: string;
  readyTasks: IWarehouseTask[];
  activeTasks: IWarehouseTask[];
  completeTasks: IWarehouseTask[];
}
export interface IWarehouseTask {
  id: string;
  taskType: string;
  coilType: ICoilType;
  requiredFt: number;
  sourceLocation: ILocation;
  destinationLocation: ILocation;
  requiredDate: string;
  startedDate: Date;
  availableDate: Date;
  completedDate: Date;
  taskState: string;
  preferredCoils: ITaskCoil[];
  nonpreferredCoils: ITaskCoil[];
  userName: string;
  overrideCode: IReasonCode;
  unnattainableCode?: string;
}
