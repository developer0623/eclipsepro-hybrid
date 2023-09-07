import angular from 'angular';
import Temp from './assigned-jobs-wide.component.html';
import { IScheduledJobColumn, ISystemPreferences } from '../../../../core/dto';

import {
  mapToScheduleJobsGridDataModel,
  SJT,
} from '../../../../core/services/store/scheduler/selectors';
import { ReorderScheduledColumn } from '../../../../core/services/store/scheduler/actions';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { IANode, IACell, ICell } from '../schedule-type';
import { ChangeWidthScheduledJobColumnAction } from "../../../../core/services/store/scheduler/actions";

type ScheduleJobsGridDataModel = ReturnType<
  typeof mapToScheduleJobsGridDataModel
>;

const AssignedJobsWide = {
  selector: 'assignedJobsWide',
  bindings: {
    machineId: '<',
    scheduledJobsData: '<',
    jobColumns: '<',
    dropToAssignedJobs: '&',
    dropToAssignedJobsEnd: '&',
    dropToMachine: '&',
    setHold: '&',
    unscheduleJob: '&',
    recallFromMachine: '&',
    setSelected: '&',
    toggleSummarized: '&',
    systemPreferences: '<',
  },
  template: Temp,
  /** @ngInject */
  controller: ['clientDataStore', '$state', class AssignedJobsWideComponent {
    machineId: number;
    assignedJobs = [];
    dropToAssignedJobs;
    dropToAssignedJobsEnd;
    dropToMachine;
    setHold;
    unscheduleJob;
    recallFromMachine;
    setSelected;
    numberOfJobsOnMachine = 0;
    machineJobsFt = 0;
    canDropToMachine = false;
    assignedTopIndex = 0;
    jobColumns: IScheduledJobColumn[];
    toggleSummarized;
    isMovingHeader = false;
    clickedHeaderItem;
    columnsWidth = 0;
    startPoint = 0;
    checkedColumns;
    rowHeight = 36;
    systemPreferences: ISystemPreferences;


    scheduledJobsData: ScheduleJobsGridDataModel;

    constructor(private clientDataStore: ClientDataStore, private $state) {
      this.columnsWidth = angular.element(".ass-wide-header")[0].clientWidth - 140;
    }

    private nodeToCell = (node: SJT, rowspan: number): IACell => ({
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
          this.scheduledJobsData.jobsTreeWide,
          this.nodeToCell
        );
        //console.log('this.assignedJobs', this.assignedJobs)
        this.numberOfJobsOnMachine = this.scheduledJobsData.machineJobsCount;
        this.machineJobsFt = this.scheduledJobsData.machineJobsFt;
      }
      if (this.jobColumns) {
        this.checkedColumns = this.jobColumns.filter(item => item.isChecked);
        //console.log('job columns', this.jobColumns)
      }
    }

    OnMachineContainerHeight() {
      // the virtual scroll seems to keep 3 items hidden on top.
      return (this.scheduledJobsData.machineJobsCount * this.rowHeight) + 34;
      // -          Math.max(0, this.assignedTopIndex - 3)
    }

    private treeToGrid(
      availableJobsTree: SJT[],
      cellCtor: (node: SJT, rowspan: number) => IACell
    ) {
      const traverse = (node: SJT): IACell[][] => {
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

    dragOverAvailableHeader(event, hemi, otherhemi) {
      // console.log(event, hemi, otherhemi);
    }

    dropOnAvailableHeader(index, otherhemi: string, dragSourceData: string) {
      const when = otherhemi === 'west' ? 'to' : 'after';
      console.log(
        'dropOnAvailableHeader',
        `move column ${dragSourceData} ${when} position ${index}`
      );
      this.clientDataStore.Dispatch(
        new ReorderScheduledColumn({
          column: { fieldName: dragSourceData },
          position: index,
        })
      );
    }

    onDbClickAvailableJobsHeader(column) {
      this.clientDataStore.Dispatch(
        new ReorderScheduledColumn({ column, position: 0 })
      );
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
      event: angular.IAngularEvent,
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

    onDragStart(node) {
      console.log('onDragStart', node);
    }
    onAllowedTypeDragStarted(cdndType) {
      console.log(
        'onAllowedTypeDragStarted',
        cdndType + ', which I can accept, is being drug'
      );
      this.canDropToMachine = true;
    }
    onAllowedTypeDragEnd(cdndType) {
      console.log(
        'onAllowedTypeDragEnd',
        cdndType + ', which I can accept, has stopped being drug'
      );
      this.canDropToMachine = false;
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

    onGetWidth(item) {
      if (item.width) {
        return { width: `${item.width}px`, flex: 'none' }
      }
      return {
        flex: 1
      }
    }

    onGetNodeStyle(keyColumn) {
      if (keyColumn.width) {
        return {
          width: `${keyColumn.width}px`,
          flex: `none`,
          background: keyColumn.color
        }
      }
      return {
        background: keyColumn.color,
        flex: 1
      }
    }

    onGetGroupStyle(keyColumn, rowspan) {
      if (keyColumn.width) {
        return {
          height: `${rowspan * this.rowHeight - 1}px`,
          'z-index': rowspan,
          width: `${keyColumn.width}px`,
          background: keyColumn.color
        }
      }
      return {
        height: `${rowspan * this.rowHeight - 1}px`,
        'z-index': rowspan,
        background: keyColumn.color,
        flex: 1
      }
    }

    onResizeColumn(event) {
      if (this.isMovingHeader) {
        const offsetX = event.clientX - this.startPoint;
        this.startPoint = event.clientX;
        if (this.clickedHeaderItem.width) {
          this.clickedHeaderItem = {
            ...this.clickedHeaderItem,
            width: this.clickedHeaderItem.width + offsetX
          }
        } else {
          this.clickedHeaderItem = {
            ...this.clickedHeaderItem,
            width: Math.floor(this.columnsWidth / this.checkedColumns.length) + offsetX
          }
        }
        this.checkedColumns = this.checkedColumns.map(item => {
          if (item.fieldName === this.clickedHeaderItem.fieldName) {
            return this.clickedHeaderItem;
          }
          return item;
        });
        event.preventDefault();
      }

    }

    onClickedColumn(event, isMoving, item) {
      this.isMovingHeader = isMoving;
      if (status) {
        this.clickedHeaderItem = item;
        this.startPoint = event.clientX;
      } else {
        console.log(`onClickedColumn ${this.clickedHeaderItem.fieldName} to ${this.clickedHeaderItem.width}`, item, this.clickedHeaderItem);
        if (this.clickedHeaderItem.fieldName) {
          this.clientDataStore.Dispatch(
            new ChangeWidthScheduledJobColumnAction({
              fieldName: this.clickedHeaderItem.fieldName,
              width: this.clickedHeaderItem.width
            })
          );
        } else {
          console.error('onClickedColumn: clickedHeaderItem.fieldName is undefined', this.clickedHeaderItem);
       }
        this.clickedHeaderItem = null;
        this.startPoint = 0;
      }
    }
  }],
};

export default AssignedJobsWide;


