import * as _ from 'lodash';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { machineHasClaim } from '../../../../core/services/store/machines/filters';
import { IMachine } from '../../../../core/dto';
import { Machines } from '../../../../core/services/store/scheduler/selectors';
import Temp from './jobs.html';


const AppJobs_ = {
    transclude: true,
    template: Temp,
    selector: 'appJobs',
    bindings: {},

    controller: ['$scope', '$location', 'clientDataStore', class AppJobsComponentController {
        selectedMachine = 0;
        selectedTabIndex = 0;
        machineSub_;
        machines = [];
        machineSort = 'machineNumber';
        constructor(
            $scope,
            private $location: ng.ILocationService,
            clientDataStore: ClientDataStore
        ){
            this.machineSort = localStorage.getItem('machineSort') ?? 'machineNumber';
            let qs = $location.search();
            console.log('selectedTabIndex', qs)
            if ('machine' in qs) {
                this.selectedMachine = parseInt(qs.machine);
            } else {
                this.selectedMachine = -1;
            }
            this.machineSub_ = clientDataStore
                .Selector(Machines)
                .map(ms => ms.filter(machineHasClaim('pro.machine.schedule.scheduler')))
                .filter(ms => ms && ms.length > 0)
                .subscribe(ms => {
                    if(this.machines?.length > 0) {
                        // this is a stupid hack. It was added because the screen would switch machines when a signalr machine update came in.
                        console.log(`update machines:noop`, ms);
                        return;
                    }
                    this.machines = _.sortBy(ms, this.machineSort);
                  //   this.machines = _.orderBy(ms, ['name']);
                    // Try to keep us on the machine tab, defaulting to first tab if not possible.
                    let cur_mach_index = this.machines.findIndex(
                        m => m.id === this.selectedMachine
                    );
                    console.log(`load machines: cur_mach_index:${cur_mach_index}; selectedTab:${this.selectedTabIndex}; selectedMachine:${this.selectedMachine}`, this.machines);
                    this.selectedTabIndex = cur_mach_index >= 0 ? cur_mach_index : 0;
                    this.selectedMachine = this.machines[this.selectedTabIndex].id;
                    this.selectTab(this.selectedMachine);
                });

            $scope.$on('$destroy',  () => {
                if (this.machineSub_) {
                    this.machineSub_.dispose();
                }
            });

        }

        selectTab(id: number) {
            this.$location.search('machine', id);
            this.selectedMachine = id;
        };

    }]
}

export default AppJobs_;

