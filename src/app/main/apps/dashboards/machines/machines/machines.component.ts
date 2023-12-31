import { ClientDataStore } from "../../../../../core/services/clientData.store";
import { IDevice, IDeviceMetrics, IDeviceState, IMetricDefinition } from './../../../../../core/dto';
import { MachineDataService } from './../../../../../core/services/machinedata.service';
import MachinesTemplate from './machines.html';

const Machines_ = {
  selector: 'machines',
  bindings: {},
  template: MachinesTemplate,
  /** @ngInject */
  controller: ['$scope', '$mdMedia', 'apiResolver', 'machineData', 'clientDataStore', class MachinesComponent {
    machineData: MachineDataService;
    metricDefinitions: {
      [index: string]: IMetricDefinition;
    };
    machineSort = 'machineNumber';
    devices: (IDevice & { state: IDeviceState; metrics: IDeviceMetrics })[];
    constructor(
      $scope: angular.IScope,
      $mdMedia,
      apiResolver,
      machineData: MachineDataService,
      clientDataStore: ClientDataStore
    ) {
      this.machineSort = localStorage.getItem('machineSort') ?? 'machineNumber'
      this.machineData = machineData;
      apiResolver
        .resolve('metricDefs@get')
        .then((results: IMetricDefinition[]) => {
          results.forEach(def => {
            this.metricDefinitions = {
              ...this.metricDefinitions,
              [def.metricId]: def,
            };
          });
        });

      clientDataStore
        .SelectDevices()
        .combineLatest(
          clientDataStore.SelectDeviceMetrics(),
          clientDataStore.SelectDeviceStates(),
          clientDataStore.SelectDevicePartRunStatistics(),
          clientDataStore.SelectDeviceCurrentShiftStatistics(),
          (devices, metrics, states, partruns, allShiftStats) => {
            return devices.map(d => {
              const state = states
                .map(this.toRunStateIndicatorModel)
                .find(s => s.deviceId === d.deviceId);

              const metricFromState = state
                ? [
                  // These two are not correct, in so far as what their tooltips say.
                  // { name: 'Good Parts', value: state.goodParts, tooltip:'Parts since last power cycle' },
                  // { name: 'Operations', value: state.cycles, tooltip:'Operations since last power cycle.' },
                  {
                    name: 'Operator',
                    value: state.operator,
                    tooltip: 'User currently logged into the device',
                  },
                  {
                    name: 'Current Part',
                    value: state.currentPartId,
                    tooltip: 'Current part',
                  },
                ]
                : [];

              const shiftStats = allShiftStats.find(
                x => x.deviceId === d.deviceId
              );

              const metricsFromShiftStatistics = shiftStats
                ? [
                  {
                    name: 'Parts',
                    value: shiftStats.totalParts,
                    tooltip: 'Count of parts produced on this shift',
                  },
                  {
                    name: 'Op Rate (overall)',
                    value: shiftStats.avgOpsPerHrTotal,
                    units: 'ops/hr',
                    tooltip: 'Average operations per hour',
                  },
                  {
                    name: 'Op Rate (run mode)',
                    value: shiftStats.avgOpsPerHrRunning,
                    units: 'ops/hr',
                    tooltip: 'Average operations per hour, while running',
                  },
                  // { name: 'Shift', value: shiftStats.shiftCode, tooltip: 'Current shift code' },
                  // { name: 'Runtime', value: shiftStats.runMinutes.toFixed(1), units: 'min', tooltip: 'Time in run mode for the current shift, in minutes' },
                  // { name: 'Downtime', value: shiftStats.nonExemptMinutes.toFixed(1), units: 'min', tooltip: 'Nonexempt downtime, in minutes.' },
                  // { name: 'Operations', value: shiftStats.totalOperations, tooltip: 'Count of operations in this shift' },
                  // { name: 'Shift Time', value: shiftStats.totalMinutes.toFixed(1), units: 'min', tooltip: 'Total time that has been tracked for this shift, so far.' },
                ]
                : [];

              const metricsFromMetricsRecord = metrics ? [] : [];

              const metricModels = [
                ...metricFromState,
                ...metricsFromShiftStatistics,
                ...metricsFromMetricsRecord,
              ];

              return {
                ...d,
                state: state,
                metrics: metrics.find(m => m.deviceId === d.deviceId),
                metricModels,
                partrun: partruns.find(
                  pr =>
                    pr.partRun.devicePartRunSelectionEventId ===
                    state.devicePartRunSelectionEventId
                ),
                shiftStats: shiftStats,
              };
            });
          }
        )
        .do(console.log)
        .subscribe(devices => (this.devices = devices));
    }

    toRunStateIndicatorModel = (state: IDeviceState) => ({
      ...state,
      lastRunStateChange: new Date(state.asOf),
      isNoPower: state.machinePower !== true,
      isOffline: state.isTimingOut,
      runState:
        state.runState === 'Running'
          ? 'R'
          : state.runState === 'NotRunning'
            ? 'H'
            : 'O',
    });
    swapSort = () => {
      this.machineSort = this.machineSort === 'machineNumber' ? 'machine.description' : 'machineNumber';
      localStorage.setItem('machineSort', this.machineSort);
    }
  }],
};

export default Machines_;
