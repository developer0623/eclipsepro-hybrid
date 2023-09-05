import Rx from 'rx';
import * as angular from "angular";
import { IMachine, IMachineStateDto, IRollformingStatistics, IStatisticsHistory, IScheduleSummary, IScheduleEstimate, IMachineMetricSettings, IMetricDefinition, IDashboardMachine } from "../dto";
import { ClientDataStore } from "./clientData.store";

machineDataService.$inject = ['$rootScope', 'clientDataStore']
export function machineDataService($rootScope, clientDataStore: ClientDataStore) {
   return new MachineDataService($rootScope, clientDataStore);
}

export class MachineDataService {
   private _dashboardMachine$: Rx.BehaviorSubject<IDashboardMachine[]> = new Rx.BehaviorSubject([]);
   dashboardMachines$: Rx.Observable<IDashboardMachine[]> = this._dashboardMachine$.asObservable();
   // /** @deprecated use dashboardMachines$[] instead */
   machines: Map<number, IMachine> = new Map();
   // /** @deprecated use dashboardMachines$[] instead */
   machinesArray: IMachine[] = [];
   unlicensedMachines: IMachine[] = [];
   metricDefinitions: Map<number, IMetricDefinition> = new Map();
   rootScope;

   constructor(private $rootScope, clientDataStore: ClientDataStore) {
      this.rootScope = $rootScope;

      Rx.Observable.combineLatest(
         clientDataStore.SelectMachines(),
         clientDataStore.SelectMachineMetricSettings(),
         clientDataStore.SelectMetricDefinitions(),
         clientDataStore.SelectMachineStates(),
         Rx.Observable.combineLatest(
            clientDataStore.SelectMachineStatistics(),
            clientDataStore.SelectMachineStatisticsHistory(),
            clientDataStore.SelectMachineScheduleSummary(),
            clientDataStore.SelectMachineSchedule(),
            clientDataStore.SelectUnlicensedMachines(),
         )
      )
         .subscribe(([machines, metrics, metricDefinitions, state, [statistics, statisticsHistory, scheduleSummaries, schedules, unlicensedMachines]]) => {
            machines.forEach(y => {
               this.machines[y.machineNumber] = y;
            });
            this.machinesArray = machines;

            this.unlicensedMachines = unlicensedMachines;

            schedules.forEach(y => {
               // this is not ideal.
               this.notifyUpdatedScheduleEstimate(y.machineNumber);
            });
            metricDefinitions.forEach(y => this.metricDefinitions[y.metricId] = y);

            // publish them all on every change (for now)
            this._dashboardMachine$.onNext(machines.map(m=>{
               return  {
                  machineNumber: m.machineNumber,
                  machine: m,
                  state: state.find(x => x.machineNumber === m.machineNumber),
                  stats: statistics.find(x => x.machineNumber === m.machineNumber),
                  statsHistory: statisticsHistory.find(x => x.machineNumber === m.machineNumber),
                  scheduleSummary: scheduleSummaries.find(x => x.machineNumber === m.machineNumber),
                  scheduleEstimate: this.formatEstimateData(schedules.find(x => x.machineNumber === m.machineNumber)),
                  metricSettings: metrics.find(x => x.machineNumber === m.machineNumber),
               }
            }));
         });
   }

   formatEstimateData(estimate: IScheduleEstimate): IScheduleEstimate {
      if (!estimate){
         return;
      }

      estimate.scheduleBlocks.sort(function (a, b) {
         return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
      });

      let unscheduledTimes = estimate.scheduleBlocks.filter((value) => {
         return value.activityType === 'Unscheduled';
      });

      angular.forEach(estimate.scheduleBlocks, function (block, key) {
         if (block.activityType === 'Unscheduled') {
            let overlapStart = unscheduledTimes.filter(x => {
               return x.startDateTime <= block.startDateTime && x.endDateTime >= block.startDateTime && x.id !== block.id;
            });
            let overlapEnd = unscheduledTimes.filter(x => {
               return x.startDateTime <= block.endDateTime && x.endDateTime >= block.endDateTime && x.id !== block.id;
            });
            block.showLeftLine = overlapStart.length === 0;
            block.showRightLine = overlapEnd.length === 0;
         }
      });
      return estimate;
   };

   //very temporary. Find a better way.
   notifyUpdatedScheduleEstimate(machineNumber) {
      this.rootScope.$broadcast('updatedScheduleEstimate', machineNumber);
   }
}
