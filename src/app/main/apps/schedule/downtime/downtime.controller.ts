import angular from 'angular';
import { MachineDataService } from '../../../../core/services/machinedata.service';
import { DowntimeDataService } from '../../../../core/services/downtimedata.service';
import { machineHasClaim } from '../../../../core/services/store/machines/filters';
import DialogTemp from './downtimeDetails.modal.html';
import { DowntimePopupController } from './downtime-popup.controller';

export function ScheduleDowntimeController(
    $scope: angular.IScope,
    machineData: MachineDataService,
    downtimeData: DowntimeDataService,
    $mdDialog,
    $mdMedia
  ) {
    let vm = this;
    vm.init = function () {
      vm.downtimeData = downtimeData;
      vm.machineData = machineData;
      downtimeData.downtimeObs.subscribe(downtimes => {
        vm.downtimeData = downtimes;
      });
    };
    vm.showDowntimeDetailsModal = function (downtime, showDelete, ev) {
      vm.showDelete = showDelete;
      if (showDelete === 'true') {
        vm.singleDowntimeData = angular.copy(downtime);
      } else {
        vm.singleDowntimeData = {};
      }
      $mdDialog.show({
        parent: angular.element(document.body),
        targetEvent: ev,
        template: DialogTemp,
        clickOutsideToClose: false,
        controller: ['$scope', '$mdDialog', 'machinesArray', '$mdMedia', 'downtimeData', 'singleDowntimeData', 'showDelete', 'eclipseProHelper', DowntimePopupController],
        controllerAs: 'vm',
        locals: {
          machinesArray: vm.machineData.machinesArray.filter(
            machineHasClaim(
              'pro.machine.schedule.scheduler pro.machine.schedule.timeline'
            )
          ),
          singleDowntimeData: vm.singleDowntimeData,
          showDelete: vm.showDelete,
        },
      });
    };
  }
