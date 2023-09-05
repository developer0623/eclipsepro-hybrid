import * as moment from 'moment';
import * as _ from 'lodash';

import { ClientDataStore } from '../../../../core/services/clientData.store';
import { TaskSelector } from '../../../../core/services/store/warehouse/selectors';

TasksController.$inject = ['$scope', '$mdMedia', 'clientDataStore']
export function TasksController($scope, $mdMedia, clientDataStore: ClientDataStore) {
    let vm = this;

    let comFilterDateSubject = new Rx.BehaviorSubject(new Date());


    $scope.$mdMedia = $mdMedia;
    this.comFilterDate = { date: new Date(), isOpen: false };

    comFilterDateSubject.subscribe(date => {
        this.comFilterDate.date = date;
    });

    this.loading = false;

    // Gets initial data and takes the subscriptions
    const taskDataSub_ = clientDataStore.SelectTasks().subscribe();
    const locationDataSub_ = clientDataStore.SelectLocations().subscribe();
    const warehouseViewModel$ = clientDataStore.SelectWarehouseViewModel().subscribe(vm=>{
        console.log('warehouseVM', vm);
    });

    const tasks$ = clientDataStore.Selector(TaskSelector)
        .do(_ => { this.loading = true });

    let readyTasksSub_ = tasks$.map(tasks => tasks.filter(t => t.taskState === "Ready"))
        .subscribe(tasks => {
            vm.readyTasks = _.orderBy(tasks, ['requiredDate']).slice(0, 10);
            vm.readyTasksRemaining = Math.max(tasks.length - 10, 0);
        });
    let completedTasksSub_ = tasks$.map(tasks => tasks.filter(t => t.taskState === "Complete"))
        .combineLatest(comFilterDateSubject, (tasks, comFilterDate) => tasks.filter(t => moment(comFilterDate).isSame(t.completedDate, 'day')))
        .subscribe(tasks => {
            vm.completedTasks = _.orderBy(tasks, ['completedDate'], ['desc']).slice(0, 10);
            vm.completedTasksRemaining = Math.max(tasks.length - 10, 0);
        });
    let activeTasksSub_ = tasks$.map(tasks => tasks.filter(t => t.taskState !== "Complete" && t.taskState !== "Ready"))
        .subscribe(tasks => {
            vm.activeTasks = _.orderBy(tasks, ['requiredDate']).slice(0, 10);
            vm.activeTasksRemaining = Math.max(tasks.length - 10, 0);
        });


    $scope.onChangeDate = function (step: number) {
        let newDate = vm.comFilterDate.date.getTime() + step * 24 * 3600 * 1000;
        comFilterDateSubject.onNext(new Date(newDate));
    }

    $scope.$on('$destroy', function () {
        taskDataSub_.dispose();
        locationDataSub_.dispose();
        readyTasksSub_.dispose();
        completedTasksSub_.dispose();
        activeTasksSub_.dispose();
        warehouseViewModel$.dispose();
    });

}
