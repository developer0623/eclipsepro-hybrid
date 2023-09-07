import { AvailableJobsTree } from '../../../../core/services/jobs.service';
import Temp from './available-jobs.component.html';
import { ICell } from '../schedule-type';

const AvailableJobs = {
  bindings: {
    machineId: '<',
    availableJobsTree: '<',
    isDragingOnAssign: '<',
    dropToAvailableJobs: '&',
    assignAvailableJob: '&',
    sendAvailableJob: '&',
    setHold: '&',
    setSelected: '&',
    toggleSummarized: '&',
  },
  template: Temp,
  /** @ngInject */
  controller: ['$state',  class AvailableJobsComponentController {
    machineId: number;
    availableJobsTree: AvailableJobsTree[];
    isDragingOnAssign;
    availableJobs: ICell[][] = [];
    doubleClickAvailableJob;
    dropToAvailableJobs;
    assignAvailableJob;
    sendAvailableJob;
    toggleHold;
    setHold;
    setSelected;
    toggleSummarized;
    msScrollOptions = {
      suppressScrollX: true,
    };
    rowHeight = 36;

    constructor(private $state) { }

    private nodeToCell = (node: AvailableJobsTree, rowspan: number): ICell => ({
      key: node.key,
      ids: this.getOrderedIds(node),
      href: node.href,
      srefObj: node.srefObj,
      units: node.units,
      rowspan: rowspan,
      background: node.background,
      hold: node.jobs[0].hold,
      warning: node.warning,
      warningText: node.warningText,
      warningColor: 'red',
      isSelected: node.isSelected,
      isSummaryRow: node.isSummaryRow,
      patternNotDefined: node.patternNotDefined,
      width: node.style.width,
      summary: node.summary,
    });

    private getOrderedIds = (node: AvailableJobsTree): number[] => {
      if (node.items.length) {
        return node.items.flatMap(child => this.getOrderedIds(child));
      } else return node.ids;
    };

    $onChanges() {
      if (this.availableJobsTree && this.availableJobsTree.length) {
        this.availableJobs = this.treeToGrid(
          this.availableJobsTree,
          this.nodeToCell
        );
        console.log('availableJobs----', this.availableJobsTree)
      } else {
        this.availableJobs = [];
      }
    }

    private treeToGrid(
      availableJobsTree: AvailableJobsTree[],
      cellCtor: (node: AvailableJobsTree, rowspan: number) => ICell
    ) {
      const traverse = (node: AvailableJobsTree): ICell[][] => {
        if (node.items.length) {
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

    onDragStart(node: ICell) {
      console.log('onDragStart', node);
    }

    onDoubleClickAvailableJob(node: ICell) {
      console.log('AVA:onDoubleClickAvailableJob', node);
      this.doubleClickAvailableJob({ node: node });
    }

    onDropToAvailableJobs(
      event,
      hemi: 'north' | 'south',
      dragSourceData: number[]
    ) {
      console.log('AVA:onDropToAvailableJobs', hemi, dragSourceData);
      this.dropToAvailableJobs({ jobIds: dragSourceData });
    }

    onAssignAvailableJob(node: ICell) {
      console.log('AVA:onAssignAvailableJob', node);
      this.assignAvailableJob({ jobIds: node.ids });
    }

    onSendAvailableJob(node: ICell) {
      console.log('AVA:onSendAvailableJobTo', node);
      this.sendAvailableJob({ jobIds: node.ids });
    }

    onToggleHold(node: ICell) {
      console.log('AVA:toggleHold', node);
      this.setHold({ jobId: node.ids[0], toHold: !node.hold });
    }

    onToggleSelection(node: ICell) {
      this.setSelected({ jobIds: node.ids, checked: !node.isSelected });
    }
    onToggleSummarized(node: ICell) {
      console.log(node);
      this.toggleSummarized({ jobIds: node.ids, checked: !node.isSummaryRow });
    }

    onGetNodeStyle(keyColumn) {
      if (keyColumn.width) {
        return {
          height: `${keyColumn.rowspan * this.rowHeight}px`,
          'z-index': keyColumn.rowspan,
          width: `${keyColumn.width}px`,
          background: keyColumn.background,
          flex: 'none'
        }
      }
      return {
        height: `${keyColumn.rowspan * this.rowHeight}px`,
        'z-index': keyColumn.rowspan,
        background: keyColumn.background,
        flex: 1
      }
    }

    onGetGroupStyle(keyColumn, rowspan) {
      if (keyColumn.width) {
        return {
          height: `${rowspan * this.rowHeight}px`,
          'z-index': rowspan,
          width: `${keyColumn.width}%`,
          background: keyColumn.color
        }
      }
      return {
        height: `${rowspan * 50}px`,
        'z-index': rowspan,
        background: keyColumn.color,
        flex: 1
      }
    }
  }],
}



export default AvailableJobs;
