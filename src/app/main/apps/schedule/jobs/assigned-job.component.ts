import { ISystemPreferences } from '../../../../core/dto';
import Temp from './assigned-job.component.html';

const AssignedJob = {
  bindings: {
    job: '<',
    setHold: '&',
    recallFromMachine: '&',
    unschedule: '&',
    sendToMachine: '&',
    setSelected: '&',
    onMove: '&',
    systemPreferences: '<',
    isFirsthide: '<',
    isLasthide: '<'
  },
  template: Temp,
  controller: class AssignedJobComponentController {
    job;
    setHold;
    recallFromMachine;
    unschedule;
    sendToMachine;
    setSelected;
    onMove;
    systemPreferences: ISystemPreferences;

    constructor() { }

    $onChanges() { }

    onToggleHold() {
      console.log('J:toggleHold', this.job);
      this.setHold({ jobId: this.job.ordId, toHold: !this.job.hold });
    }

    onRecallFromMachine() {
      console.log('J:recall', this.job);
      this.recallFromMachine({ jobIds: [this.job.ordId] });
    }

    onUnschedule() {
      console.log('J:unschedule', this.job);
      this.unschedule({ jobIds: [this.job.ordId] });
    }

    onSendToMachine() {
      console.log('J:send', this.job);
      this.sendToMachine({ jobIds: [this.job.ordId] });
    }

    onToggleSelection() {
      this.setSelected({
        jobIds: [this.job.ordId],
        checked: !this.job.isSelected,
      });
    }
    onMove1(direction) {
      this.onMove({direction})
    }
  },
}

export default AssignedJob;
