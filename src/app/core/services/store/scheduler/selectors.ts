import * as moment from "moment"
import { IScheduleItem, IScheduledJobColumn, IJobSummaryDto, IAvailableJob, RangeValue, ScheduledJobGridItem } from "../../../dto"
import { IAppState } from "..";
import * as _ from "lodash";
import { appendSummarizer2, jobColor, materialColor, toolingColor } from './reducers';


export const Machines = (store: IAppState) => store.Machine;
export const AvailableJobColumnsSelector = (store: IAppState) =>
  store.AvailableJobColumns;
export const ScheduledJobColumnsSelector = (store: IAppState) =>
  store.ScheduledJobColumns;
export const ScheduledJobs = (store: IAppState) => store.Schedule;
export const AvailableJobs = (store: IAppState) => store.AvailableJob;
export const AssignedJobsGridData = (machineNumber: number) => (state: IAppState) => {
  const schedule = ScheduledJobs(state).find(
    s => s.machineNumber === machineNumber
  );

  const scheduledJobs = !schedule ? [] : schedule.sequence;

  const gridData = scheduledJobs
    // How do I make this automatically be of type (ISchedule & IJobSummaryDto)?
    .map(x => ({
      ...x.job,
      ...x,
      completePct: x.job.completeFt / x.job.totalFt,
      isSelected: state.SelectedJobs.includes(x.ordId),
      inFlight: state.JobsInFlight.fliers.includes(x.ordId),
      requiredDateDisplay: x.job.requiredDate
        ? moment(x.job.requiredDate).format('YYYY-MM-DD')
        : '<none>',
      importDateDisplay: x.job.importDate
        ? moment(x.job.importDate).format('YYYY-MM-DD')
        : '<none>',
      shipDateDisplay: x.job.shipDate
        ? moment(x.job.shipDate).format('YYYY-MM-DD')
        : '<none>',
    }))
    // Remove the extra job property that came from the server
    .map(({ job, ...rest }) => rest);

  const selected = gridData.filter(j => j.isSelected);
  return {
    gridData: gridData,
    summary: {
      count: gridData.length,
      totalFt: gridData.reduce((acc, j) => j.totalFt + acc, 0),
      jobIds: gridData.map(j => j.ordId),
      heldJobIds: gridData.filter(j => j.hold).map(j => j.ordId),
      notHeldJobIds: gridData.filter(j => !j.hold).map(j => j.ordId),
    },
    selectedSummary: {
      count: selected.length,
      totalFt: selected.reduce((acc, j) => j.totalFt + acc, 0),
      jobIds: selected.map(j => j.ordId),
      heldJobIds: selected.filter(j => j.hold).map(j => j.ordId),
      notHeldJobIds: selected.filter(j => !j.hold).map(j => j.ordId),
    },
  };
};

type AssignedJobsGridDataType = ReturnType<
  ReturnType<typeof AssignedJobsGridData>
>;

export type SJT = {
  key: string | RangeValue;
  keyColumn: { fieldName: string; color: string };
  jobs: (IScheduleItem & IJobSummaryDto & { isSelected: boolean })[];
  items: SJT[];
  jobIds: number[];
  id: string;
  isSelected: boolean;
  href: string;
  srefObj?: {sref: string, param: any}
  isSummaryRow: boolean;
  summary: any
};

function groupWhile<T, TKey>(array: T[], keyselector: (t: T) => TKey) {
  const seed: { key: TKey; items: T[] }[] = [];
  return array.reduce((acc, cur) => {
    let key = keyselector(cur);

    if (acc.length > 0 && acc[acc.length - 1].key === key) {
      let end = acc[acc.length - 1];

      end.items.push(cur);

      acc.splice(acc.length - 1, 1, end);

      return acc;
    }
    return [...acc, { key, items: [cur] }];
  }, seed);
}
function buildSummaryItem(
  items: ScheduledJobGridItem[],
  columns: IScheduledJobColumn[],
  $state: any,
  state: IAppState
): SJT {
  let [keyColumn, ...remainingColumns] = columns;
  const key = keyColumn.summarizer(items, keyColumn);
  console.log(keyColumn.fieldName, key);
  return {
    key: key,
    keyColumn: keyColumn,
    jobs: items,
    items:
      remainingColumns.length > 0
        ? [buildSummaryItem(items, remainingColumns, $state, state)]
        : [],
    jobIds: items.map(j => j.ordId),
    id: key.toString() + columns.length + items.length, // lengths are just because I feel like I need some uniqueness on this id
    isSelected: items.every(j => j.isSelected),
    href: '',
    isSummaryRow: true,
    summary: toSummaryModel(items)
  };
}

const toSummaryModel = (
  jobs: ScheduledJobGridItem[]
) => ({
  count: jobs.length,
  totalFt: jobs.reduce((sum, j) => sum + j.totalFt, 0)
})

const buildScheduledJobsTree = (
  jobs: ScheduledJobGridItem[],
  jobsTitles: IScheduledJobColumn[],
  $state,
  state: IAppState
): SJT[] => {
  if (jobsTitles.length > 0) {
    let [keyColumn, ...remainingColumns] = jobsTitles;
    let groups = groupWhile(jobs, j => j[keyColumn.fieldName]);
    return groups.map((grp, i) => {
      const jobIds = grp.items.map(j => j.ordId);
      const isSummaryRow = jobIds.every(
        jobid => state.SummarizedJobs.indexOf(jobid) !== -1
      );
      return {
        key: grp.key,
        keyColumn,
        jobs: grp.items,
        items: isSummaryRow
          ? [buildSummaryItem(grp.items, remainingColumns, $state, state)]
          : buildScheduledJobsTree(grp.items, remainingColumns, $state, state),
        jobIds: jobIds,
        id: grp.key + ':' + i,
        isSelected: grp.items.every(j => j.isSelected),
        href:
          keyColumn.fieldName === 'orderCode'
            ? $state.href('app.orders.detail', { id: grp.items[0].ordId })
            : keyColumn.fieldName === 'materialCode'
              ? $state.href('app.inventory.coil-types.coil-type', {
                id: grp.items[0].materialCode,
              })
              : '',
        srefObj:
          keyColumn.fieldName === 'orderCode'
            ? {sref: 'app.orders.detail', param: { id: grp.items[0].ordId }}
            : keyColumn.fieldName === 'materialCode'
              ? {sref: 'app.inventory.coil-types.coil-type', param: {
                id: grp.items[0].materialCode}}
              : undefined,
        isSummaryRow: isSummaryRow,
        summary: toSummaryModel(grp.items)
      };
    });
  } else return [];
};

export const mapToScheduleJobsGridDataModel = (
  jobs: AssignedJobsGridDataType,
  columns: IScheduledJobColumn[],
  $state,
  state: IAppState
) => {
  let dateClosure: Date = null;
  let sortedJobs = _.orderBy(jobs.gridData, 'sequenceNum', 'asc')
    .map((job, i) => {
      return {
        ...job,
        mainIndex: i,
        pastDueDate:
          job.requiredDate && new Date(job.requiredDate) < new Date(Date.now()),
        iconColor: 'red-fg',
        warningText:
          'Warning: Job is scheduled to be completed after due date!',
        pastDueText: 'Job is Late!',
      };
    })
    .map(j => {
      const completionDate = moment(j.completionDate).toDate();
      return {
        ...j,
        dateChange:
          // We only want to test that the _date_ portion changed, not
          // the time. getDate is kinda cheating, but with this data
          // we know date changes will be consecutive days. getDate
          // ought to be adequate.
          completionDate?.getDate() === dateClosure?.getDate()
            ? undefined
            : (dateClosure = completionDate),
      };
    });

  function newColumn(init: {
    fieldName: keyof ScheduledJobGridItem;
    color: string;
  }): IScheduledJobColumn {
    return {
      ...init,
      name: init.fieldName,
      isChecked: false,
      displayName: init.fieldName,
      units: '',
      summarizer: (items, column) => '<< no summary >>',
    };
  }
  return {
    jobsTree: buildScheduledJobsTree(
      sortedJobs,
      [
        newColumn({
          fieldName: 'isOnMachine',
          color: toolingColor,
        }),
        {
          ...newColumn({
            fieldName: 'toolingCode',
            color: toolingColor,
          }),
          summarizer: appendSummarizer2,
        },
        {
          ...newColumn({
            fieldName: 'materialCode',
            color: materialColor,
          }),
          summarizer: appendSummarizer2,
        },
        newColumn({ fieldName: 'id', color: jobColor }), // using job id as the final column means there is exactly one job in the final items array
      ],
      $state,
      state
    ),
    jobsTreeWide: buildScheduledJobsTree(
      sortedJobs,
      [
        // We always need to start with `isOnMachine` and end with `id` (at least for now)
        newColumn({ fieldName: 'isOnMachine', color: toolingColor }),
        ...columns.filter(x => x.isChecked),
        newColumn({ fieldName: 'id', color: jobColor }), // using job id as the final column means there is exactly one job in the final items array
      ],
      $state,
      state
    ),
    machineJobsCount: jobs.gridData.filter(j => j.isOnMachine).length,
    machineJobsFt: jobs.gridData.filter(j => j.isOnMachine).reduce((acc, current) => acc + current.remainingFt, 0),
    summary: jobs.summary,
    selectedSummary: jobs.selectedSummary,
    dates: jobs.gridData.map(j => j.completionDate),
  };
};

export type ScheduleJobsGridDataModel = ReturnType<
  typeof mapToScheduleJobsGridDataModel
>;

export type JobSetSummary = {
  count: number;
  totalFt: number;
  jobIds: number[];
  heldJobIds: number[];
  notHeldJobIds: number[];
};

export type AvailableJobGridItem = IAvailableJob & {
  isSelected: boolean;
  totalFt: number;
  requiredDateDisplay: string;
  importDateDisplay: string;
  shipDateDisplay: string;
  inFlight: boolean;
};

export const AvailableJobsGridData = (machineId: number) => (state: IAppState) => {
  const availableJobs = AvailableJobs(state).filter(
    sj => sj.machineNumber === machineId
  );

  const mapFootageToDisplayPreference = (lengthFt: number) =>
    // TODO: Convert this value to the system preference for footage display.
    Math.round(lengthFt);

  const gridData: AvailableJobGridItem[] = availableJobs.map(x => ({
    ...x,
    totalFt: mapFootageToDisplayPreference(x.totalFt),
    requiredDateDisplay: x.requiredDate
      ? moment(x.requiredDate).format('YYYY-MM-DD')
      : '<none>',
    importDateDisplay: x.importDate
      ? moment(x.importDate).format('YYYY-MM-DD')
      : '<none>',
    shipDateDisplay: x.shipDate
      ? moment(x.shipDate).format('YYYY-MM-DD')
      : '<none>',
    isSelected: state.SelectedJobs.includes(x.ordId),
    inFlight: state.JobsInFlight.fliers.includes(x.ordId),
    isSummarized: state.SummarizedJobs.includes(x.ordId),
    pendingAction: false
  }));

  const selected = gridData.filter(j => j.isSelected);
  return {
    gridData,
    totalJobsAvailable: availableJobs.length,
    summary: {
      count: gridData.length,
      totalFt: gridData.reduce((acc, j) => j.totalFt + acc, 0),
      jobIds: gridData.map(j => j.ordId),
      heldJobIds: gridData.filter(j => j.hold).map(j => j.ordId),
      notHeldJobIds: gridData.filter(j => !j.hold).map(j => j.ordId),
    },
    selectedSummary: {
      count: selected.length,
      totalFt: selected.reduce((acc, j) => j.totalFt + acc, 0),
      jobIds: selected.map(j => j.ordId),
      heldJobIds: selected.filter(j => j.hold).map(j => j.ordId),
      notHeldJobIds: selected.filter(j => !j.hold).map(j => j.ordId),
    },
  };
};

export const DisableScheduler = (state: IAppState) =>
  state.Alerts.findIndex(
    a => a.alertType === 'AgentOffline' || a.alertType === 'AgentConfiguration'
  ) > -1;
