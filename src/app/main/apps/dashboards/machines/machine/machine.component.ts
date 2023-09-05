import angular from 'angular';
import * as moment from "moment";
import * as _ from 'lodash';
import { IMachine, IMetricDefinition, IMetricConfig, IRollformingStatistics, IShiftChoice, IMachineStateDto, IStatisticsHistory, IScheduleSummary, IScheduleEstimate, IMachineMetricSettings, IDashboardMachine, IScheduleEntry } from "../../../../../core/dto";
import { MachineDataService } from "../../../../../core/services/machinedata.service";
import { ClientDataStore } from '../../../../../core/services/clientData.store';
import { IApiService } from "../../../../../reference";
import { Machines } from '../../../../../core/services/store/scheduler/selectors';
import MachineTemplate from './machine.html';
import { selectDataForMachine } from '../../../../../core/services/store/machines/selectors';

const Machine_ = {
  selector: 'machine',
  bindings: {},
  template: MachineTemplate,
  controller: ['$scope', 'machineData', 'apiResolver', '$stateParams', 'msNavigationService', 'api', '$location', '$state', 'clientDataStore', '$mdMedia', class MachineComponent {
    mdMedia;
    machineId$ = new Rx.Subject<number>();
    focusExtent: [Date, Date] = [
      moment().subtract(10, 'minutes').toDate(),
      moment().add(8, 'hours').toDate(),
    ];
    cursor: number = Date.now();
    machineNumber: number = 0;
    machineData: MachineDataService;
    metricDefinitions: { [index: string]: IMetricDefinition };
    metrics: (IMetricConfig & { definition: IMetricDefinition })[];
    shifts: IRollformingStatistics[] = [];
    availableShifts: IShiftChoice[] = [];

    selectedTabIndex = 0;
    shiftIndex: number = 0;

    dashboardMachines: IDashboardMachine[] = [];
    selectedMachine: IDashboardMachine;
    selectedStats: IRollformingStatistics;

    debugActivities: IScheduleEntry[] = [];
    machineSort = 'machineNumber';

    constructor(
      $scope: angular.IScope,
      machineData: MachineDataService,
      apiResolver,
      $stateParams,
      msNavigationService,
      private api: IApiService,
      private $location: angular.ILocationService,
      private $state,
      clientDataStore: ClientDataStore,
      $mdMedia
    ) {
      // Remove Machines nav object
      // msNavigationService.deleteItem('dashboards.machines');
      // Replace with active Machine using the same title since we aren't
      // showing a list of machines under the original Machines object
      // msNavigationService.saveItem('dashboards.machine', {
      //   title: 'machines',
      //   state: 'app.dashboards_machines_machine({id: machine.machineNumber})',
      //   weight: 1,
      // });

      this.mdMedia = $mdMedia;
      this.machineData = machineData;
      this.machineSort = localStorage.getItem('machineSort') ?? 'machineNumber';

      const subscriptions_ = [
        this.machineData.dashboardMachines$
          .filter(ms => ms && ms.length > 0)
          .subscribe(machines => {
            this.dashboardMachines = _.sortBy(machines, this.machineSort);
            this.selectMachineData();
        }),

        this.machineId$.subscribe(id=>{
          // when the machine changes, get the history
          this.onUpdateShifts();
          this.selectMachineData();
        })
      ];

      this.machineNumber = $stateParams.id;
      this.machineId$.onNext(this.machineNumber);

      console.log(
        'this.machineData = machineData;',
        this.machineData.machinesArray
      );


        this.onUpdateShifts();

      // Replace Machines nav object on state change
      $scope.$on('$stateChangeStart', () => {
        msNavigationService.deleteItem('dashboards.machine');
        msNavigationService.saveItem('dashboards.machines', {
          title: 'machines',
          state: 'app.dashboards_machines_machines',
          weight: 1,
        });
      });
      $scope.$on('$destroy',  () => {
        subscriptions_.forEach((sub) => sub.dispose());
      });
    }

    private selectMachineData() {
      if (this.machineNumber > 0 && this.dashboardMachines.length > 0) {
         let cur_mach_index = this.dashboardMachines.findIndex(
              m => m.machineNumber === Number(this.machineNumber)
         );
         this.selectedTabIndex = cur_mach_index >= 0 ? cur_mach_index : 0;
         if(cur_mach_index === -1) {
            this.machineNumber = this.dashboardMachines[this.selectedTabIndex].machineNumber;
            this.selectTab(this.machineNumber);
         }
         this.selectedMachine = this.dashboardMachines[this.selectedTabIndex];
         if (this.selectedMachine) {
            if (this.shiftIndex > 0) {
               if (this.shifts.length > this.shiftIndex) {
               this.selectedStats = this.shifts[this.shiftIndex];
               } else {
               this.selectedStats = this.selectedMachine.stats;
               }
            } else {
               this.selectedStats = this.selectedMachine.stats;
            }

            // debug
            if (this.selectedMachine.scheduleEstimate) {
               this.debugActivities = this.selectedMachine.scheduleEstimate.scheduleBlocks.filter(x => x.activityType !== 'MachineConfig');
            }
         }
      }
    }

    onUpdateShifts() {
      this.api.machine.statsShiftHistory.get(
        { id: this.machineNumber },
        data => {
          console.log('shifts[0]', this.shifts[0])
          this.shifts = data;
          this.availableShifts = this.shifts.map((s, index)=>({
            'index': index,
            'shiftCode': s.startShiftCode,
            'shiftDate': moment(s.startShiftCode.slice(0,-1), 'YYYYMMDD').toDate(),
            'shift': +s.startShiftCode.slice(-1)
          }));
          this.readQueryString();
        },
        error => {
          console.log(error);
        }
      );

    }

    // Should metric status be a filter or part of the data service?
    metricStatus(metric, shiftStats) {
      const metricValue =
        shiftStats[this.metricDefinitions[metric.metricId].primaryDataKey];
      const lowerBetter = this.metricDefinitions[metric.metricId].lowerIsBetter;
      if (metricValue <= metric.okRangeStart) {
        return lowerBetter ? 'lower-better metric-good' : 'metric-bad';
      } else if (
        metricValue > metric.okRangeStart &&
        metricValue < metric.okRangeEnd
      ) {
        return 'metric-ok';
      } else {
        return lowerBetter ? 'lower-better metric-bad' : 'metric-good';
      }
    }

    preventDefault(e) {
      e.preventDefault();
    }

    disableScroll(ev) {
      this.preventDefault(ev);
      const parent = document.querySelector<HTMLElement>('#dashboard-machines');
      // console.log('disabled', parent.getBoundingClientRect());
      parent.style.overflow = 'hidden';
      parent.style.marginRight = '4px';
    }

    enableScroll() {
      const parent = document.querySelector<HTMLElement>('#dashboard-machines');
      parent.style.overflow = 'auto';
      parent.style.marginRight = '0';
    }

    updateShiftIndex(shiftIdx){
      this.shiftIndex = shiftIdx.shiftIdx; // todo: find out why this is an object and not a number
      this.selectMachineData();
      this.updateQueryString();
    }

    updateQueryString() {
      const exportQuery = {} as {shift?: string};
      if (this.shiftIndex > 0) {
        exportQuery.shift = this.availableShifts.find(x=>x.index === this.shiftIndex)?.shiftCode;
      }

      this.$location.search(exportQuery);
    }

    readQueryString() {
      const queryString = this.$location.search();
      if (queryString.shift) {
        this.shiftIndex = this.availableShifts.findIndex(x => x.shiftCode === queryString.shift);
      } else {
        this.shiftIndex = 0
      }
    }

    selectTab(id: number) {
      this.machineNumber = id;
      this.$state.go('.', {id: id}, {notify: false});
      this.machineId$.onNext(this.machineNumber);
    };
  }],
};

export default Machine_;;
