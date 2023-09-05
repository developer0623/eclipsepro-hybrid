import MachineInfoPng from '../../../../../assets/images/helpImages/Screen 1 Machine Info.png';
import MaintenancePng from '../../../../../assets/images/helpImages/Screen 2 Maintenance.png';
import MaterialPng from '../../../../../assets/images/helpImages/Screen 3 Machine Config and Material.png';
import ProductionInfoPng from '../../../../../assets/images/helpImages/Screen 4 Production Info.png';
import CoilChangePng from '../../../../../assets/images/helpImages/Screen 5 Coil Changes.png';
import MeetingPng from '../../../../../assets/images/helpImages/Screen 6 Meetings and Breaks.png';
import UnscheduledPng from '../../../../../assets/images/helpImages/Screen 7 Unscheduled Time.png';
import BreakdownsPng from '../../../../../assets/images/helpImages/Screen 8 Breakdowns.png';

export function helpScreensDialogController($scope: angular.IScope, $mdDialog) {
  let vm = this;
  vm.helpScreens = [
    { image: MachineInfoPng },
    { image: MaintenancePng },
    {
      image: MaterialPng,
    },
    { image: ProductionInfoPng },
    { image: CoilChangePng },
    { image: MeetingPng },
    { image: UnscheduledPng },
    { image: BreakdownsPng },
  ];

  vm.direction = 'left';
  vm.currentIndex = 0;

  vm.setCurrentSlideIndex = function (index) {
    vm.direction = index > vm.currentIndex ? 'left' : 'right';
    vm.currentIndex = index;
  };

  vm.isCurrentSlideIndex = function (index) {
    return vm.currentIndex === index;
  };

  vm.prevSlide = function () {
    vm.direction = 'left';
    vm.currentIndex =
      vm.currentIndex < vm.helpScreens.length - 1 ? ++vm.currentIndex : 0;
  };

  vm.nextSlide = function () {
    vm.direction = 'right';
    vm.currentIndex =
      vm.currentIndex > 0 ? --vm.currentIndex : vm.helpScreens.length - 1;
  };
  vm.cancel = function () {
    $mdDialog.hide();
  };
}
