import * as angular from "angular";
import Rx from 'rx';
import * as _ from "lodash";
import * as moment from "moment";
import { IJobSummaryDto, IAvailableJobColumn, RangeValue } from "../dto";
import { ClientDataStore } from "./clientData.store";
import { InitSchedulerData } from "./store/scheduler/actions";
import { AvailableJobGridItem, AvailableJobColumnsSelector, AvailableJobsGridData } from "./store/scheduler/selectors";


makeJobsService.$inject = ['clientDataStore', '$state']
export function makeJobsService(clientDataStore: ClientDataStore, $state) {
  return new JobsService(clientDataStore, $state);
}

export type AvailableJobsTree = {
  key: string | RangeValue;
  jobs: AvailableJobGridItem[];
  items: AvailableJobsTree[];
  ids: number[];
  id: string;
  style: { width: number; background: string };
  background: string;
  units: string;
  href: string;
  srefObj?: {sref: string, param: any};
  warning: boolean;
  pastDue: Date;
  iconColor: string;
  warningText: string;
  pastDueText: string;
  isSelected: boolean;
  isSummaryRow: boolean;
  patternNotDefined?: boolean;
};

export class JobsService {
  constructor(private clientDataStore: ClientDataStore, private $state) {
    clientDataStore.Dispatch(new InitSchedulerData());
  }

  private buildSummary(
    jobs: AvailableJobGridItem[],
    columns: IAvailableJobColumn[]
  ): AvailableJobsTree[] {
    const columnWidth = 100 / columns.length;
    // const width = Math.round(columnWidth * 100) / 100 + '%';

    const [keyColumn, ...remainingColumns] = columns;
    const key = keyColumn.summarizer(jobs, keyColumn);
    return [
      {
        key: key,
        jobs,
        items:
          remainingColumns.length > 0
            ? this.buildSummary(jobs, remainingColumns)
            : [],
        ids: jobs.map(j => j.ordId),
        id: key + ':',
        style: { width: keyColumn.width, background: keyColumn.color },
        background: keyColumn.color,
        units: keyColumn.units,
        href: '',
        warning: false,
        pastDue: null,
        iconColor: 'red-fg',
        warningText: '',
        pastDueText: '',
        isSelected: jobs.every(j => j.isSelected),
        isSummaryRow: true,
      },
    ];
  }
  private buildAvailableJobsTree(
    jobs: AvailableJobGridItem[],
    jobsTitles: IAvailableJobColumn[]
  ): AvailableJobsTree[] {
    const [keyColumn, ...remainingColumns] = jobsTitles;

    // Each node will be rendered as a two column grid. We only need to specify the width (%) of the first
    // column. The second column gets all the rest of the space. Inside that second column will be a nested
    // two column grid. So, from left to right these column width percentages get *bigger* because the nested
    // grid has less columns than it's parent grid.
    const columnWidth = 100 / jobsTitles.length;

    // Round to two decimal places. Only because the original implementation did so.
    // const width = Math.round(columnWidth * 100) / 100 + '%';

    return _(jobs)
      .groupBy(j => j[keyColumn.fieldName])
      .toPairs()
      .map(([key, jobs]) => {
        const summarize = jobs.every(j => j.isSummarized);
        return {
          key,
          jobs,
          items:
            remainingColumns.length > 0
              ? summarize
                ? this.buildSummary(jobs, remainingColumns)
                : this.buildAvailableJobsTree(jobs, remainingColumns)
              : [],
          ids: jobs.map(j => j.ordId),
          id: key + ':',
          style: { width: keyColumn.width, background: keyColumn.color },
          background: keyColumn.color,
          units: keyColumn.units,
          //this might be better to come from the column definition
          href:
            keyColumn.fieldName === 'orderCode'
              ? this.$state.href('app.orders.detail', { id: jobs[0].ordId })
              : keyColumn.fieldName === 'materialCode'
                ? this.$state.href('app.inventory.coil-types.coil-type', {
                  id: jobs[0].materialCode,
                })
                : '',
          srefObj:
            keyColumn.fieldName === 'orderCode'
              ? {sref: 'app.orders.detail', param: { id: jobs[0].ordId }}
              : keyColumn.fieldName === 'materialCode'
                ? {sref: 'app.inventory.coil-types.coil-type', param: {
                  id: jobs[0].materialCode}}
                : undefined,
          warning:
            keyColumn.fieldName === 'requiredDateDisplay' &&
            jobs[0].warningDueDate,
          pastDue:
            keyColumn.fieldName === 'requiredDateDisplay' &&
            jobs[0].pastDueDate,
          iconColor: 'red-fg',
          warningText:
            'Warning: Job is scheduled to be completed after due date!',
          pastDueText: 'Job is late!',
          isSelected: jobs.every(j => j.isSelected),
          isSummaryRow: summarize,
          patternNotDefined: jobs[0].patternNotDefined
        };
      })
      .sortBy(n => n.key)
      .value();
  }

  selectAvailableJobsOldTree(
    machineNumber: number,
    jobFilter$: Rx.Observable<(IJobSummaryDto) => boolean>
  ) {
    // Select the model
    let availableColumns$ = this.clientDataStore.Selector(
      AvailableJobColumnsSelector
    );
    return this.clientDataStore
      .Selector(AvailableJobsGridData(machineNumber))
      .combineLatest(
        jobFilter$,
        availableColumns$,
        (gridDataModel, jobFilter, columns) => {
          let checkedColumns = columns.filter(x => x.isChecked);
          let filteredJobs = gridDataModel.gridData.filter(jobFilter);

          return {
            jobs: this.buildAvailableJobsTree(filteredJobs, checkedColumns),
            summary: gridDataModel.summary,
            selectedSummary: gridDataModel.selectedSummary,
          };
        }
      );
  }

  distinctArray(obs: Rx.Observable<number[]>): Rx.Observable<number[]> {
    let seed = { next: <number[]>[], buf: <number[]>[] };
    const reducer = (acc: { next: number[]; buf: number[] }, ids: number[]) => {
      let next = ids.filter(id => !acc.buf.includes(id));
      return { next, buf: [...next, ...acc.buf] };
    };
    return obs
      .scan(reducer, seed)
      .map(x => x.next)
      .filter(arr => arr.length > 0);
  }

  takeSubscriptionsForMachine(machineNumber: number) {
    // Subscribe to available and scheduled jobs for this machine...
    const scheduled$ = this.clientDataStore
      .SelectScheduledJobsIn({
        property: 'machineNumber',
        values: [machineNumber],
      })
      .flatMap(arr => arr.map(j => j.sequence.map(k => k.ordId)));
    const available$ = this.clientDataStore.SelectAvailableJobsIn({
      property: 'machineNumber',
      values: [machineNumber],
    });

    // Merge them simply so both will be unsubscribed together.
    // Also casts this down to a pretend unit type.
    return scheduled$.merge(available$.map(_ => [])).map(_ => null);
  }
}
