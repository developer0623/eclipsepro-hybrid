import angular from 'angular';
import * as moment from 'moment';
import { IScheduledDowntimeDto, } from '../../../../core/dto';
import { MachineDataService } from '../../../../core/services/machinedata.service';
import { DowntimeDataService } from '../../../../core/services/downtimedata.service';
import Temp from './timeline.template.html';
import HelpModalTemp from './helpScreen.modal.html';
import { helpScreensDialogController } from './helpScreensPopup.controller';
import InfoIcon from '../../../../../assets/images/helpImages/infoIcon.svg';
import { DowntimePopupController } from './downtime-popup.controller';

const ScheduleTimeline = {
  selector: 'scheduleTimeline',
  bindings: {},
  template: Temp,
  /** @ngInject */
  controller: ['$scope', '$mdMedia', '$mdDialog', 'machineData', 'downtimeData', class ScheduleTimelineComponent {
    focusExtent = [
      moment().subtract(10, 'minutes').toDate(),
      moment().add(8, 'hours').toDate(),
    ];

    cursor = Date.now();
    showDelete: boolean;
    singleDowntimeData: IScheduledDowntimeDto | {};
    machineSort = 'machineNumber';

    constructor(
      private $scope,
      private $mdMedia,
      private $mdDialog,
      private machineData: MachineDataService,
      downtimeData: DowntimeDataService
    ) {
      this.machineSort = localStorage.getItem('machineSort') ?? 'machineNumber';
      $scope.$on('openDowntimePopup', (event, data) => {
        let singleDowntime = downtimeData.getDowntimeMachine(data.downtimeId);
        this.showDowntimeDetailsModal(singleDowntime, 'true');
      });
      $scope.$watch(
        () => {
          return $mdMedia('xs') || $mdMedia('sm');
        },
        (wantsFullScreen) => {
          $scope.customFullscreen = wantsFullScreen === true;
        }
      );
    }

    loadImage = function () {
      return InfoIcon;
    }

    openHelpScreen = ev => {
      let useFullScreen =
        (this.$mdMedia('sm') || this.$mdMedia('xs')) &&
        this.$scope.customFullscreen;
      let parentPath = angular.element(document.body);
      this.$mdDialog
        .show({
          parent: angular.element(document.body),
          targetEvent: ev,
          template: HelpModalTemp,
          clickOutsideToClose: false,
          fullscreen: useFullScreen,
          controller: ['$scope', '$mdDialog', helpScreensDialogController],
          controllerAs: 'vm',
        })
        .then(function () { });
      this.$scope.$watch(
        () => {
          return this.$mdMedia('xs') || this.$mdMedia('sm');
        },
        (wantsFullScreen) => {
          this.$scope.customFullscreen = wantsFullScreen === true;
        }
      );
    };
    showDowntimeDetailsModal(downtime: IScheduledDowntimeDto, showDelete, ev?) {
      this.showDelete = showDelete;
      if (showDelete === 'true') {
        this.singleDowntimeData = angular.copy(downtime);
      } else {
        this.singleDowntimeData = {};
      }
      let useFullScreen =
        (this.$mdMedia('sm') || this.$mdMedia('xs')) &&
        this.$scope.customFullscreen;
      let parentPath = angular.element(document.body);
      this.$mdDialog
        .show({
          parent: angular.element(document.body),
          targetEvent: ev,
          templateUrl:
            'app/main/apps/schedule/downtime/downtimeDetails.modal.html',
          clickOutsideToClose: false,
          fullscreen: useFullScreen,
          controller: ['$scope', '$mdDialog', 'machinesArray', '$mdMedia', 'downtimeData', 'singleDowntimeData', 'showDelete', 'eclipseProHelper', DowntimePopupController],
          controllerAs: 'vm',
          locals: {
            machinesData: this.machineData.machines,
            singleDowntimeData: this.singleDowntimeData,
            showDelete: this.showDelete,
          },
        })
        .then(function (downtimeModalData) {
          //then what?
        });
      this.$scope.$watch(
        () => {
          return this.$mdMedia('xs') || this.$mdMedia('sm');
        },
        (wantsFullScreen) => {
          this.$scope.customFullscreen = wantsFullScreen === true;
        }
      );
    }
  }],
};

export default ScheduleTimeline;
