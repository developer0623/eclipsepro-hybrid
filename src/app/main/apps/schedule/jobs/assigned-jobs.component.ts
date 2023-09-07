import angular from 'angular';
import Temp from './assigned-jobs.component.html';
import { IANode, IACell, ICell } from '../schedule-type';
import { ISystemPreferences } from '../../../../core/dto';

const AssignedJobs = {
  selector: 'assignedJobs',
  bindings: {
    machineId: '<',
    scheduledJobsData: '<',
    dropToAssignedJobs: '&',
    dropToAssignedJobsEnd: '&',
    dropToMachine: '&',
    setHold: '&',
    unscheduleJob: '&',
    recallFromMachine: '&',
    setSelected: '&',
    onDragingFromAssign: '&',
    toggleSummarized: '&',
    systemPreferences: '<',
  },
  template: Temp,
  /** @ngInject */
  controller: ['$state', class AssignedJobsComponent {
    machineId: number;
    assignedJobs = [];
    dropToAssignedJobs;
    dropToAssignedJobsEnd;
    onDragingFromAssign;
    dropToMachine;
    setHold;
    unscheduleJob;
    recallFromMachine;
    setSelected;
    toggleSummarized;
    numberOfJobsOnMachine = 0;
    machineJobsFt = 0;
    canDropToMachine = false;
    assignedTopIndex = 0;
    systemPreferences: ISystemPreferences;

    scheduledJobsData;
    containerHeight = 0;
    contentHeight = 0;
    isShowAssignMachine = false;
    isScInBottom = false;
    isDragFromMachine = false;
    isShowAction1 = false;
    isShowAction2 = false;

    currentIndex = 1;
    assMainHeight = 0;
    assScposY = 0;
    assScHeight = 0;
    currentNode;
    isOnButton = false;

    msScrollOptions = {
      suppressScrollX: true
    };

    rowHeight = 76;

    constructor(private $state) {
      this.containerHeight = document.querySelectorAll(".assign-grid-container")[0].clientHeight;
      angular.element(document.querySelector('.assign-container .md-virtual-repeat-scroller')).bind('scroll', (e: any) => {
        this.assMainHeight = e.currentTarget.clientHeight;
        this.assScHeight = e.currentTarget.scrollHeight;
        this.assScposY = e.currentTarget.scrollTop;
        if ((this.assScposY + this.assMainHeight + 50) > this.assScHeight) {
          this.isScInBottom = true;
        } else {
          this.isScInBottom = false;
        }
      })
    }

    private nodeToCell = (node: IANode, rowspan: number): IACell => ({
      key: node.key,
      ids: node.jobIds,
      href: node.href,
      srefObj: node.srefObj,
      rowspan: rowspan,
      keyColumn: node.keyColumn,
      jobs: node.jobs,
      isSelected: node.isSelected,
      isSummaryRow: node.isSummaryRow,
      summary: node.summary,
      // background:node.background,
      // hold:node.jobs[0].hold,
      // warning:node.warning,
      // warningText:node.warningText,
      // warningColor:'red',
    });

    $onChanges() {
      if (this.scheduledJobsData) {
         this.assignedJobs = this.treeToGrid(
          this.scheduledJobsData.jobsTree,
          this.nodeToCell
        );
        this.numberOfJobsOnMachine = this.scheduledJobsData.machineJobsCount;
        this.machineJobsFt = this.scheduledJobsData.machineJobsFt;
        if (this.numberOfJobsOnMachine === 0) {
          this.contentHeight = 35;
        }
        this.contentHeight = this.contentHeight + this.scheduledJobsData.summary.count * this.rowHeight;
        this.isShowAssignMachine = this.containerHeight > this.contentHeight + 40;
      }

      console.log('asdfdsfadsfsad', this.assignedJobs)
    }

    OnMachineContainerHeight() {
      // the virtual scroll seems to keep 3 items hidden on top.
      return (
        (this.numberOfJobsOnMachine * this.rowHeight) +
        34 // the height of the header- Math.max(0, this.assignedTopIndex - 3)
      );
    }

    private treeToGrid(
      availableJobsTree: IANode[],
      cellCtor: (node: IANode, rowspan: number) => IACell
    ) {
      const traverse = (node: IANode): IACell[][] => {
        if (node.items && node.items.length) {
          const subgrid = node.items.flatMap(child => traverse(child));

          const rows_ = subgrid.map((row, i) => {
            return [cellCtor(node, subgrid.length - i), ...row];
          });
          return rows_;
        } else return [[cellCtor(node, 1)]];
      };
      return availableJobsTree.flatMap(node => traverse(node));
    }

    onSrefClick(node){
      this.$state.go(node.srefObj.sref, node.srefObj.param);
    }

    onDoubleClickAssigned(node) {
      console.log('dblclick', node);
      this.unscheduleJob({ jobIds: node.ids });
    }
    onStartDragAssigned(node) {
      console.log('onStartDragAssigned', node);
      // check to see if this node is in the selected list. If not, the selected list should be replaced with this node
    }
    onDropToSchedule(
      event,
      node: IANode,
      hemi: 'north' | 'south',
      dragSourceData: number[]
    ) {
      const when = hemi === 'north' ? 'before' : 'after';
      const seq =
        hemi === 'north'
          ? node.jobs[0].sequence
          : node.jobs[node.jobs.length - 1].sequence + 1;

      console.log(
        'onDropToSchedule',
        `Schedule ${dragSourceData.length} jobs ${when}. At sequence ${seq}`,
        dragSourceData
      );
      this.dropToAssignedJobs({ jobIds: dragSourceData, seq: seq });
    }
    onDropToScheduleEnd(dragSourceData: number[]) {
      console.log(
        'onDropToScheduleEnd',
        `Schedule ${dragSourceData.length} jobs. At end sequence.`,
        dragSourceData
      );
      this.dropToAssignedJobsEnd({ jobIds: dragSourceData });
    }
    onDropToMachine(dragSourceData: number[]) {
      console.log(
        'onDropToMachine',
        `Schedule ${dragSourceData.length} jobs on machine`
      );
      this.dropToMachine({ jobIds: dragSourceData });
    }

    onMove(node: IANode, direction: 'up' | 'down', currentIndex) {
      const parentIndex = node.jobs[0].mainIndex;
      let seq = 0;
      if (direction === 'up') {
         const index = parentIndex - this.assignedJobs[parentIndex - 1][currentIndex].jobs.length;
         seq = this.assignedJobs[index][currentIndex].jobs[0].sequence || 1;
      }
      else {
         const index = parentIndex + node.jobs.length;
         const nextIndex = index + this.assignedJobs[index][currentIndex].jobs.length;
         if (this.assignedJobs.length - 1 < nextIndex) {
          // we are at the end, take the last sequence number in the last group and add 1
          seq = Math.max(...this.assignedJobs[this.assignedJobs.length - 1][currentIndex].jobs.map((j) => j.sequence)) + 1;
         } else {
          seq = this.assignedJobs[nextIndex][currentIndex].jobs[0].sequence;
         }
      }
      this.dropToAssignedJobs({ jobIds: node.ids, seq: seq });
    }

    onDragStart(node, isMachine = false) {
      console.log('onDragStart', node);
      this.isDragFromMachine = node.jobs[0].isOnMachine;
    }
    onAllowedTypeDragStarted(cdndType) {
      console.log(
        'onAllowedTypeDragStarted',
        cdndType + ', which I can accept, is being drug'
      );
      if (!this.isDragFromMachine) {
        this.canDropToMachine = true;
      }
      this.onDragingFromAssign({ isDraging: true });
    }
    onAllowedTypeDragEnd(cdndType) {
      console.log(
        'onAllowedTypeDragEnd',
        cdndType + ', which I can accept, has stopped being drug'
      );
      this.canDropToMachine = false;
      this.isDragFromMachine = false;
      this.onDragingFromAssign({ isDraging: false });
    }

    dragOnScheduleJobs(index, items) {
      console.log('dragOnScheduleJobs', index, items);
    }
    onDragOver(event, hemi, otherhemi) {
      console.log('onDragOver', hemi, otherhemi);
    }

    onSetHold(jobId, toHold) {
      console.log('ASS:toggleHold', jobId, toHold);
      this.setHold({ jobId: jobId, toHold: toHold });
    }

    onRecallFromMachine(jobIds) {
      console.log('ASS:recall - NOT IMPLEMENTED', jobIds);

      // for this, I expect the job to show up at the start of the assigned list.
      this.recallFromMachine({ jobIds: jobIds });
    }

    onUnschedule(jobIds) {
      console.log('ASS:unschedule', jobIds);
      this.unscheduleJob({ jobIds: jobIds });
    }

    onSendToMachine(jobIds) {
      console.log('ASS:send', jobIds);
      this.dropToMachine({ jobIds: jobIds });
    }

    onSetSelected(jobIds, checked) {
      this.setSelected({ jobIds: jobIds, checked: checked });
    }
    onToggleNodeChecked(node) {
      this.setSelected({ jobIds: node.ids, checked: !node.isSelected });
    }
    onToggleSummarized(node: ICell) {
      console.log(node);
      this.toggleSummarized({ jobIds: node.ids, checked: !node.isSummaryRow });
    }

    onGetActionContainer1() {
      if(!this.currentNode || this.currentNode && this.currentNode.jobs.length < 4 || this.currentIndex !== 1) {
         return {
            display: 'none',
         }
      }
      const index = Math.floor(this.assScposY / 76);
      const count = Math.floor(this.assMainHeight / 76);
      if(index + count >= this.assignedJobs.length) {
         return {
            display: 'none',
         }
      }
      const currentRow = this.assignedJobs[index + count];
      this.isShowAction1 = this.currentNode.key === currentRow[1].key && (this.currentNode.jobs.length - 4) > currentRow[1].rowspan && currentRow[1].rowspan > 1;

      if (this.isShowAssignMachine) {
        return {
          width: '4.1%',
          display: this.isShowAction1 ? 'flex' : 'none'
        }
      } else {
        return {
          width: 'calc(4.1% - 2px)',
          display: this.isShowAction1 ? 'flex' : 'none'
        }
      }
    }

    onGetActionContainer2() {
      if(!this.currentNode || this.currentNode && this.currentNode.ids.length < 4 || this.currentIndex !== 2) {
         return {
            display: 'none',
         }
      }
      const index = Math.floor(this.assScposY / 76);
      const count = Math.floor(this.assMainHeight / 76);
      if(index + count >= this.assignedJobs.length) {
         return {
            display: 'none',
         }
      }
      const currentRow = this.assignedJobs[index + count];
      this.isShowAction2 = this.currentNode.key === currentRow[2].key && this.currentNode.ids.length - 4 > currentRow[2].rowspan && currentRow[2].rowspan > 1;
      if (this.isShowAssignMachine) {
        return {
          width: '4.1%',
          left: 'calc(104px + 4.1%)',
          display: this.isShowAction2 ? 'flex' : 'none'
        }
      } else {
        return {
          width: 'calc(4.1% - 2px)',
          left: 'calc(112px + 4.1%)',
          display: this.isShowAction2 ? 'flex' : 'none'
        }
      }
    }

    onMouseOver(e, node, idx) {
      this.currentIndex = idx;
      this.currentNode = node;
    }
    onMouseLeave(idx) {
      setTimeout(() => {
         if(!this.isOnButton && !this.currentIndex) {
            this.onInitMouseAction()
         }
      }, 100)
    }

    onActionButtonOver() {
      this.isOnButton = true;
    }

    onActionButtonLeave() {
      this.isOnButton = false;
      if(!this.currentIndex) {
         this.onInitMouseAction();
      }
    }

    onInitMouseAction() {
      this.currentIndex = 0;
      this.currentNode = null;
    }
    onActionMove(direction) {
      this.onMove(this.currentNode, direction, this.currentIndex);
    }

    onGetAssignContainer() {
      if (this.isShowAssignMachine) {
        return {
          height: `${this.containerHeight - this.contentHeight - 10}px`,
          width: '41.66%',
          display: this.canDropToMachine ? 'flex' : 'none'
        }
      } else {
        return {
          height: '35px',
          width: 'calc(41.66% - 23px)',
          display: (this.canDropToMachine || this.isScInBottom) ? 'flex' : 'none'
        }
      }
    }
  }]
};

export default AssignedJobs;
