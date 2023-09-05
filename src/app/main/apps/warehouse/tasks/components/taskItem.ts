import angular from 'angular';
import TaskItemTemp from './templates/taskItem.html';
import TaskActiveContentTemp from './templates/taskActiveContent.html';
import TaskCompletedContentTemp from './templates/taskCompletedContent.html';
import TaskCurrentFooterTemp from './templates/taskCurrentFooter.html';
import TaskActiveFooterTemp from './templates/taskActiveFooter.html';
import TaskHeaderTemp from './templates/taskHeader.html';

import AlertPng from '../../../../../../assets/images/taskicons/alert.png';
import ErrorPng from '../../../../../../assets/images/taskicons/error.png';
import ZonePng from '../../../../../../assets/images/taskicons/zone.png';
import MachinePng from '../../../../../../assets/images/taskicons/machine.png';

export default angular
  .module('app.warehouse.components', [])
  .component("taskItem", {
    bindings: {
      task: '<',
      state: '<'
    },
    template: TaskItemTemp,
    controller: TaskItemController
  })
  .component("taskActiveContent", {
    require: {
      parentCtrl: '^taskItem'
    },
    template: TaskActiveContentTemp,

  })
  .component("taskCompletedContent", {
    require: {
      parentCtrl: '^taskItem'
    },
    template: TaskCompletedContentTemp,

  })
  .component("taskCurrentFooter", {
    require: {
      parentCtrl: '^taskItem'
    },
    template: TaskCurrentFooterTemp,
  })
  .component("taskActiveFooter", {
    require: {
      parentCtrl: '^taskItem'
    },
    template: TaskActiveFooterTemp,
  })
  .component("taskHeader", {
    require: {
      parentCtrl: '^taskItem'
    },
    template: TaskHeaderTemp,
  })
  .name;



function TaskItemController() {
  let ctrl = this;

  // Methods

  //////////

  ctrl.$onInit = function () {
    let time1 = new Date(ctrl.task.requiredDate);
    let nowDate = new Date();
    if ((time1.getTime() - nowDate.getTime()) < 86400000 && (time1.getTime() - nowDate.getTime()) > -86400000 && time1.getDate() === nowDate.getDate()) {
      ctrl.timeOffsetFlag = true;
    } else {
      ctrl.timeOffsetFlag = false;
    }
    ctrl.late = (nowDate > time1);
  }

  ctrl.loadImage = function (img) {
    if (img === 'alert') {
      return AlertPng
    } else if (img === 'zone') {
      return ZonePng;
    } else if (img === 'machine') {
      return MachinePng;
    }
    return ErrorPng;
  }

}
