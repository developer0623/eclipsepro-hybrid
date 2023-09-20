import { Component, Inject, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import * as moment from "moment";
import * as _ from 'lodash';
import { Transition, StateService } from '@uirouter/core';

import { IMachine, IMetricDefinition, IMetricConfig, IRollformingStatistics, IShiftChoice, IMachineStateDto, IStatisticsHistory, IScheduleSummary, IScheduleEstimate, IMachineMetricSettings, IDashboardMachine, IScheduleEntry } from 'src/app/core/dto';

@Component({
  selector: 'app-machine-detail',
  templateUrl: './machine-detail.component.html',
  styleUrls: ['./machine-detail.component.scss']
})
export class MachineDetailComponent implements OnDestroy {
    @ViewChild('tabGroup', { static: true }) tabGroup: any;
    machineId$ = new Rx.Subject<number>();
    focusExtent: [Date, Date] = [
      moment().subtract(10, 'minutes').toDate(),
      moment().add(8, 'hours').toDate(),
    ];
    cursor: number = Date.now();
    machineNumber: number = 0;
    machineData;
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

    subscriptions_ = [];

    constructor(
      @Inject('apiResolver') public apiResolver,
      @Inject('machineData') public machineDataService,
      @Inject('clientDataStore') public clientDataStore,
      @Inject('api') public api,
      $transition$: Transition,
      private state: StateService,
      private _location: Location
    ) {
      console.log('77777777')

      this.machineData = machineDataService;
      this.machineSort = localStorage.getItem('machineSort') ?? 'machineNumber';
      this.machineNumber = $transition$.params().id;
      this.machineId$.onNext(this.machineNumber);

      this.subscriptions_ = [
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

      console.log(
        '$transition$.params().id',
        $transition$.params().id
      );


      this.onUpdateShifts();

    }

    ngOnDestroy(): void {
      this.subscriptions_.forEach((sub) => sub.dispose());
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
      this.shiftIndex = shiftIdx; // todo: find out why this is an object and not a number
      this.selectMachineData();
      this.updateQueryString();
    }

    updateQueryString() {
      const exportQuery = {} as {shift?: string};
      if (this.shiftIndex > 0) {
        exportQuery.shift = this.availableShifts.find(x=>x.index === this.shiftIndex)?.shiftCode;
      }

      // this.$location.search(exportQuery);
    }

    readQueryString() {
      // // const queryString = this.$location.search();
      // if (queryString.shift) {
      //   this.shiftIndex = this.availableShifts.findIndex(x => x.shiftCode === queryString.shift);
      // } else {
      //   this.shiftIndex = 0
      // }
    }

    selectTab(id: number) {
      this.machineNumber = id;
      // this.$state.go('.', {id: id}, {notify: false});
      this.machineId$.onNext(this.machineNumber);
      this.centerSelectedTab();
    };

    trackByKey = (index: number, m: IMachine): number => {
      return m.id;
    };

    onChangeTab() {
      this.selectedTabIndex = this.tabGroup.selectedIndex;
      this.machineNumber = this.dashboardMachines[this.selectedTabIndex].machineNumber;
      // this.state.go('.', {id: this.machineNumber}, {reload: false});
      // this._location.replaceState(`/dashboards/machines/${this.machineNumber}`);
      this.machineId$.onNext(this.machineNumber);
      this.centerSelectedTab()
    }

    centerSelectedTab() {
      const tabHeader = this.tabGroup._tabHeader;
      const tabList = tabHeader._tabList.nativeElement;
      const tabElement = tabList.children[0].children[this.selectedTabIndex];
      const tabWidth = tabElement.offsetWidth;
      const screenWidth = this.tabGroup._tabHeader._tabListContainer.nativeElement.clientWidth;

      const scrollAmount = tabElement.offsetLeft + tabWidth / 2 - screenWidth / 2;
      tabHeader.scrollDistance = scrollAmount;
    }

}
