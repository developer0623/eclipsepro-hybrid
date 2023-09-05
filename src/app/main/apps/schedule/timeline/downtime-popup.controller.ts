import angular from 'angular';
import { IMachine,  } from '../../../../core/dto';
import { DowntimeDataService } from '../../../../core/services/downtimedata.service';
import DialogTemp from '../downtime/repeatDetails.modal.html';

export function DowntimePopupController(
    $scope,
    $mdDialog,
    machinesData: Map<number, IMachine>,
    $mdMedia,
    downtimeData: DowntimeDataService,
    singleDowntimeData,
    showDelete,
    eclipseProHelper
  ) {
    let vm = this;
    vm.machinesData = machinesData;
    vm.downtime = {};
    vm.startTime = {};
    vm.duration = {};
    vm.machineNames = [];
    vm.machinesData.forEach(function (m) {
      vm.machineNames.push(m.description);
    });
    vm.Types = ['Break', 'Breakdown', 'Maintenance', 'Meeting', 'Unscheduled'];

    vm.repeatData = [
      {
        label: 'One Time',
        value: 'OneTime',
      },
      {
        label: 'Daily',
        value: 'Daily',
      },
      {
        label: 'Weekly',
        value: 'Weekly',
      },
      {
        label: 'Monthly',
        value: 'Monthly',
      },
    ];

    vm.endRepeatData = [
      {
        label: 'Never',
        value: 'Never',
      },
      {
        label: 'After',
        value: 'After',
      },
      {
        label: 'On Date',
        value: 'OnDate',
      },
    ];

    vm.meridianData = ['AM', 'PM'];

    vm.repeatCount = [1, 2, 3, 4, 5];

    vm.showAllMachines = true;
    vm.selectAllMachines = false;
    vm.durationHours = [];
    vm.durationMins = [];
    vm.hours = [];
    vm.mins = [];
    let i;
    for (i = 0; i <= 12; i++) {
      if (i < 10) {
        i = '0' + i;
      }
      vm.hours.push(i);
    }

    for (i = 0; i <= 59; i++) {
      if (i < 10) {
        i = '0' + i;
      }
      vm.mins.push(i);
    }

    for (i = 0; i <= 23; i++) {
      vm.durationHours.push(i);
    }

    for (i = 0; i <= 59; i++) {
      vm.durationMins.push(i);
    }

    vm.occursData = angular.copy(vm.repeatData);
    if (singleDowntimeData && showDelete === 'true') {
      vm.downtime = singleDowntimeData;
      if (vm.downtime.duration) {
        vm.duration = eclipseProHelper.buildDuration(vm.downtime.duration);
      }
      if (vm.downtime.timeOfDay) {
        vm.startTime = eclipseProHelper.buildStartTime(vm.downtime.timeOfDay);
      }
      vm.downtime.startDate = new Date(vm.downtime.startDate);
      vm.selectedMachines = [];
      angular.forEach(vm.downtime.machines, m =>
        vm.selectedMachines.push(vm.machinesData[m])
      );
      vm.downtime.endDate = new Date(vm.downtime.endDate);
      if (eclipseProHelper.buildRepeatText(vm.downtime)) {
        vm.downtime.occursText = eclipseProHelper.buildRepeatText(vm.downtime);
        vm.downtime.occurs = vm.downtime.occursText;
      }
      if (vm.downtime.occursText === 'One Time') {
        vm.downtime.occurs = 'OneTime';
        vm.downtime.occursText = '';
      }
    } else {
      vm.duration.hours = vm.durationHours[0];
      vm.duration.mins = vm.durationMins[30];
      vm.startTime.hours = vm.hours[12];
      vm.startTime.mins = vm.mins[0];
      vm.startTime.meridian = vm.meridianData[1];
      vm.downtime.occurs = 'OneTime';
      vm.downtime.endRepeat = 'Never';
      vm.downtime.occurenceCount = vm.repeatCount[0];
      vm.downtime.startDate = new Date();
      vm.downtime.endDate = new Date();
      vm.downtime.occursText = '';
    }

    vm.openRepeatPopup = function (oldval, ev) {
      if (vm.downtime.occurs !== 'OneTime') {
        vm.occursText = angular.copy(vm.downtime.occurs);
        let useFullScreen =
          ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        let parentPath = angular.element(document.body);
        $mdDialog
          .show({
            parent: angular.element(document.body),
            targetEvent: ev,
            template: DialogTemp,
            clickOutsideToClose: false,
            fullscreen: useFullScreen,
            skipHide: true,
            controller:  ['$scope', '$mdDialog', 'downtimeData', 'RepeatDialogController'],
            controllerAs: 'vm',
            locals: {
              downtimeData: vm.downtime,
            },
            multiple: true,
          })
          .then(function (result) {
            if (result === 'cancel') {
              if (oldval === 'OneTime') {
                vm.downtime.occurs = oldval;
              } else {
                vm.downtime.occurs = vm.occursText;
              }
            } else {
              vm.downtime = result;
              if (vm.downtime.occurs === 'OneTime') {
                vm.downtime.occursText = '';
              } else {
                vm.downtime.occursText = eclipseProHelper.buildRepeatText(
                  vm.downtime
                );
                vm.downtime.occurs = vm.downtime.occursText;
              }
            }
          });
        $scope.$watch(
          function () {
            return $mdMedia('xs') || $mdMedia('sm');
          },
          function (wantsFullScreen) {
            $scope.customFullscreen = wantsFullScreen === true;
          }
        );
      } else if (vm.downtime.occurs === 'OneTime') {
        vm.downtime.endRepeat = 'Never';
        vm.downtime.occurs = 'OneTime';
      }
    };
    vm.hide = function () {
      $mdDialog.hide();
    };
    vm.cancel = function () {
      $mdDialog.cancel();
    };
    vm.showDelete = false;
    if (showDelete === 'true') {
      vm.showDelete = true;
    }
    vm.downtimeModalData = {};
    vm.deleteDowntime = function (isDelete) {
      if (showDelete === 'true') {
        downtimeData.deleteDowntime(singleDowntimeData.id).then(function () {
          $mdDialog.hide();
        });
      }
    };

    vm.saveDowntimeDetails = function (isDelete) {
      if (vm.duration) {
        vm.downtime.duration =
          (vm.duration.hours < 10
            ? '0' + vm.duration.hours
            : vm.duration.hours) +
          ':' +
          (vm.duration.mins < 10 ? '0' + vm.duration.mins : vm.duration.mins);
      }
      if (vm.startTime && vm.startTime.hours && vm.startTime.mins) {
        vm.formatTime = {};
        vm.formatTime.hours =
          vm.startTime.meridian === 'PM'
            ? parseInt(vm.startTime.hours) === 12
              ? parseInt(vm.startTime.hours)
              : parseInt(vm.startTime.hours) + 12
            : vm.startTime.hours === 12
            ? vm.startTime.hours - 12
            : vm.startTime.hours;
        vm.downtime.timeOfDay =
          (vm.formatTime.hours === 0 ? '00' : vm.formatTime.hours) +
          ':' +
          vm.startTime.mins +
          ':00';
      }
      if (vm.downtime.occurs !== 'OneTime') {
        let occurs = vm.downtime.occurs.split(' :');
        vm.downtime.occurs = occurs[0];
      }

      if (vm.downtime.weekDayOfMonth === 'Weekend Day') {
        vm.downtime.weekDayOfMonth = 'WeekendDay';
      } else if (vm.downtime.weekDayOfMonth === 'Week Day') {
        vm.downtime.weekDayOfMonth = 'WeekDay';
      }

      let machines = [];
      angular.forEach(vm.selectedMachines, function (downtimeMachine) {
        machines.push(downtimeMachine.machineNumber);
      });
      vm.downtime.machines = machines.sort();

      if (vm.downtime.id) {
        downtimeData.updateDowntime(vm.downtime).then(function () {
          $mdDialog.hide();
        });
      } else {
        downtimeData.saveDowntime(vm.downtime).then(function () {
          $mdDialog.hide();
        });
      }
    };
  }
