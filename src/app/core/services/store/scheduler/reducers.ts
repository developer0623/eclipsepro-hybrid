import * as _ from "lodash";
import * as moment from 'moment';
import { IAvailableJobColumn, IAvailableJob, ScheduledJobGridItem, IScheduledJobColumn, ScheduledJobColumnFieldName, RangeValue } from "../../../dto";
import { INITIALIZE, PUT } from "../../clientData.actions";
import { Action } from "../../lib/store";
import {
  TOGGLE_AVAILABLE_COLUMN,
  REORDER_AVAILABLE_COLUMN,
  RESET_AVAILABLE_COLUMNS,
  SCHEDULE_JOB_ACTION,
  UNSCHEDULE_JOB_ACTION,
  SET_JOB_SELECTION,
  SET_JOBS_IN_FLIGHT,
  LAND_JOBS_IN_FLIGHT,
  PATCH_JOBS,
  ScheduleJobAction,
  PatchJobs,
  LandJobsInFlight,
  SetJobsInFlight,
  SetJobSelection,
  RESET_SCHEDULED_COLUMNS,
  TOGGLE_SCHEDULED_COLUMN,
  CHANGE_WIDTH_SCHEDULED_COLUMN,
  REORDER_SCHEDULED_COLUMN,
  SET_JOB_SUMMARIZED,
  SetJobSummarized,
  CHANGE_WIDTH_AVAILABLE_COLUMN
} from "./actions";
import { AvailableJobGridItem } from './selectors';

const isDateString: (string: any) => boolean = str => !isNaN(Date.parse(str));

export const jobColor = 'rgb(186, 205, 113)'; //'rgb(217, 227, 177)';// 
export const materialColor = 'rgb(249, 181, 112)'; //'rgb(255, 209, 163)';// 
export const toolingColor = 'rgb(236, 212, 129)'; //'rgb(255, 243, 201)';// 

export const initialAvailableColumnState: IAvailableJobColumn[] = [
  {
    fieldName: 'toolingCode',
    displayName: 'tooling',
    name: 'Tooling',
    isChecked: true,
    color: toolingColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'materialCode',
    displayName: 'material',
    name: 'Material',
    isChecked: true,
    color: materialColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'requiredDateDisplay',
    displayName: 'requiredBy',
    name: 'Required By',
    isChecked: true,
    color: jobColor,
    units: '',
    summarizer: rangeSummarizer(isDateString),
  },
  {
    fieldName: 'orderCode',
    displayName: 'order',
    name: 'Order',
    isChecked: true,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'customerName',
    displayName: 'customer',
    name: 'Customer',
    isChecked: true,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'totalFt',
    displayName: 'length',
    name: 'Length',
    isChecked: true,
    color: jobColor,
    units: 'ft',
    summarizer: sumSummarizer,
  },
  {
    fieldName: 'truckNumber',
    displayName: 'truck',
    name: 'Truck',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'stagingBay',
    displayName: 'stagingBay',
    name: 'Staging Bay',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'loadingDock',
    displayName: 'loadingDock',
    name: 'Loading Dock',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'materialColor',
    displayName: 'color',
    name: 'Color',
    isChecked: false,
    color: materialColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'materialGauge',
    displayName: 'gauge',
    name: 'Gauge',
    isChecked: false,
    color: materialColor,
    units: '',
    summarizer: rangeSummarizer(),
  },
  {
    fieldName: 'materialWidthIn',
    displayName: 'width',
    name: 'Width',
    isChecked: false,
    color: materialColor,
    units: 'in',
    summarizer: rangeSummarizer(),
  },
  {
    fieldName: 'materialDescription',
    displayName: 'materialDescription',
    name: 'Material Description',
    isChecked: false,
    color: materialColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'toolingDescription',
    displayName: 'toolingDescription',
    name: 'Tooling Description',
    isChecked: false,
    color: materialColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'longestLengthIn',
    displayName: 'longestPart',
    name: 'Longest Part',
    isChecked: false,
    color: jobColor,
    units: 'in',
    summarizer: rangeSummarizer(),
  },
  {
    fieldName: 'salesOrder',
    displayName: 'so',
    name: 'SO',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'user1',
    displayName: 'orderUser1',
    name: 'User1',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer,
  }, //
  {
    fieldName: 'user2',
    displayName: 'orderUser2',
    name: 'User2',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'user3',
    displayName: 'orderUser3',
    name: 'User3',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'user4',
    displayName: 'orderUser4',
    name: 'User4',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'user5',
    displayName: 'orderUser5',
    name: 'User5',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'workOrder',
    displayName: 'Work Order',
    name: 'Work Order',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer,
  },
  {
    fieldName: 'importDateDisplay',
    displayName: 'imported',
    name: 'Imported',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: rangeSummarizer(isDateString),
  },
  {
    fieldName: 'shipDateDisplay',
    displayName: 'shipDate',
    name: 'Ship Date',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: rangeSummarizer(isDateString),
  },
];

export const initialScheduledJobColumnState: IScheduledJobColumn[] = [
  {
    fieldName: 'toolingCode',
    displayName: 'tooling',
    name: 'Tooling',
    isChecked: true,
    color: toolingColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'materialCode',
    displayName: 'material',
    name: 'Material',
    isChecked: true,
    color: materialColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'requiredDateDisplay',
    displayName: 'requiredBy',
    name: 'Required By',
    isChecked: true,
    color: jobColor,
    units: '',
    summarizer: rangeSummarizer2(isDateString),
  },
  {
    fieldName: 'orderCode',
    displayName: 'order',
    name: 'Order',
    isChecked: true,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'customerName',
    displayName: 'customer',
    name: 'Customer',
    isChecked: true,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'totalFt',
    displayName: 'total',
    name: 'Length',
    isChecked: false,
    color: jobColor,
    units: 'ft',
    summarizer: sumSummarizer2,
  },
  {
    fieldName: 'remainingFt',
    displayName: 'remaining',
    name: 'RemainingLength',
    isChecked: true,
    color: jobColor,
    units: 'ft',
    summarizer: sumSummarizer2,
  },
  {
    fieldName: 'truckNumber',
    displayName: 'truck',
    name: 'Truck',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'stagingBay',
    displayName: 'stagingBay',
    name: 'Staging Bay',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'loadingDock',
    displayName: 'loadingDock',
    name: 'Loading Dock',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'materialColor',
    displayName: 'color',
    name: 'Color',
    isChecked: false,
    color: materialColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'materialGauge',
    displayName: 'gauge',
    name: 'Gauge',
    isChecked: false,
    color: materialColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'materialWidthIn',
    displayName: 'width',
    name: 'Width',
    isChecked: false,
    color: materialColor,
    units: 'in',
    summarizer: rangeSummarizer2(),
  },
  {
    fieldName: 'materialDescription',
    displayName: 'materialDescription',
    name: 'Material Description',
    isChecked: false,
    color: materialColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'toolingDescription',
    displayName: 'toolingDescription',
    name: 'Tooling Description',
    isChecked: false,
    color: materialColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'longestLengthIn',
    displayName: 'longestPart',
    name: 'Longest Part',
    isChecked: false,
    color: jobColor,
    units: 'in',
    summarizer: rangeSummarizer2(),
  },
  {
    fieldName: 'salesOrder',
    displayName: 'so',
    name: 'SO',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'user1',
    displayName: 'orderUser1',
    name: 'User1',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer2,
  }, //
  {
    fieldName: 'user2',
    displayName: 'orderUser2',
    name: 'User2',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'user3',
    displayName: 'orderUser3',
    name: 'User3',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'user4',
    displayName: 'orderUser4',
    name: 'User4',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'user5',
    displayName: 'orderUser5',
    name: 'User5',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'workOrder',
    displayName: 'Work Order',
    name: 'Work Order',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: appendSummarizer2,
  },
  {
    fieldName: 'importDateDisplay',
    displayName: 'imported',
    name: 'Imported',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: rangeSummarizer2(isDateString),
  },
  {
    fieldName: 'shipDateDisplay',
    displayName: 'shipDate',
    name: 'Ship Date',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: rangeSummarizer2(isDateString),
  },
  {
    fieldName: 'sequence',
    displayName: 'sequence',
    name: 'Sequence',
    isChecked: false,
    color: jobColor,
    units: '',
    summarizer: rangeSummarizer2(),
  },
];

const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
};
function appendSummarizer(
  jobs: AvailableJobGridItem[],
  column: IAvailableJobColumn
) {
  const set = jobs
    .map(job => job[column.fieldName].toString())
    // TODO: Use [...new Set(...)] when we go to ES6 target
    .filter(onlyUnique);

  if (set.length === 1) return set[0];

  return (
    set.reduce((acc, val) => acc + ', ' + val).substr(0, 15) +
    `... (${set.length} items)`
  );
}
export function appendSummarizer2(
  jobs: ScheduledJobGridItem[],
  column: { fieldName: ScheduledJobColumnFieldName }
) {
  const set = jobs
    .map(job => job[column.fieldName].toString())
    // TODO: Use [...new Set(...)] when we go to ES6 target
    .filter(onlyUnique);

  if (set.length === 1) return set[0];

  return (
    set.reduce((acc, val) => acc + ', ' + val).substr(0, 15) +
    `... (${set.length} items)`
  );
}
function countSummarizer2(
  jobs: ScheduledJobGridItem[],
  column: { fieldName: ScheduledJobColumnFieldName },
  suffix = 'item'
) {
  const set = jobs
    .map(job => job[column.fieldName].toString())
    // TODO: Use [...new Set(...)] when we go to ES6 target
    .filter(onlyUnique);

  return `${set.length} ${suffix}` + (set.length > 1 ? 's' : '');
}
function rangeSummarizer(filter?: (str: string) => boolean) {
  const summarizer = (
    jobs: AvailableJobGridItem[],
    column: IAvailableJobColumn
  ) => {
    if (jobs.length === 1) return jobs[0][column.fieldName].toString();

    const sortedCopy = jobs
      .map(x => x[column.fieldName].toString())
      .filter(x => filter === undefined || filter(x));

    sortedCopy.sort()

    if (sortedCopy.length > 1)
      return `${sortedCopy[0]} - ${sortedCopy[sortedCopy.length - 1]}`;
    else if (sortedCopy.length === 1) return `${sortedCopy[0]}`;
    else return '<none>';
  };

  return summarizer;
}
function rangeSummarizer2(filter?: (str: string) => boolean) {
  function summarizer(
    jobs: ScheduledJobGridItem[],
    column: { fieldName: ScheduledJobColumnFieldName }
  ): string | RangeValue {
    if (jobs.length === 1) return jobs[0][column.fieldName].toString();

    const sortedCopy = jobs
      .map(x => x[column.fieldName].toString())
      .filter(x => filter === undefined || filter(x));

    const by = selector => (e1, e2) => selector(e1) > selector(e2) ? 1 : -1;
    sortedCopy.sort(by(x => x[column.fieldName]));

    if (sortedCopy.length > 1)
      return {
        start: sortedCopy[0],
        end: sortedCopy[sortedCopy.length - 1],
      };
    else if (sortedCopy.length === 1) return `${sortedCopy[0]}`;
    else return '<none>';
  }

  return summarizer;
}

function sumSummarizer(
  jobs: AvailableJobGridItem[],
  column: IAvailableJobColumn
) {
  return jobs
    .map(j => Number(j[column.fieldName]))
    .reduce((sum, n) => sum + n, 0)
    .toString();
}
function sumSummarizer2(
  jobs: ScheduledJobGridItem[],
  column: { fieldName: ScheduledJobColumnFieldName }
) {
  return jobs
    .map(j => Number(j[column.fieldName]))
    .reduce((sum, n) => sum + n, 0)
    .toString();
}
function timespanSummarizer2(
  jobs: ScheduledJobGridItem[],
  column: { fieldName: ScheduledJobColumnFieldName }
) {
  return jobs
    .map(j => moment.duration(j[column.fieldName]))
    .reduce((acc, cur) => acc.add(cur))
    .toISOString();
}

export function AvailableJobColumns(
  state: IAvailableJobColumn[] = initialAvailableColumnState,
  action: Action
): IAvailableJobColumn[] {
  switch (action.type) {
    case TOGGLE_AVAILABLE_COLUMN: {
      return state.map(column => {
        if (column.fieldName === action.payload.fieldName) {
          return { ...column, isChecked: !column.isChecked };
        }
        return column;
      });
    }
    case REORDER_AVAILABLE_COLUMN: {
      const from = state.findIndex(
        x => x.fieldName === action.payload.column.fieldName
      );
      if (from > -1) {
        const to = action.payload.position;

        // Move from one position to another, shifting everything
        // as necessary.
        const copy = [...state];
        copy.splice(to, 0, copy.splice(from, 1)[0]);

        return copy;
      }
      return state;
    }
    case RESET_AVAILABLE_COLUMNS: {
      return initialAvailableColumnState;
    }
    // Initializing these columns is a special case, because the server might return
    // an empty set. If we ever get an empty set, we simply use the initial values.
    case PUT:
    case INITIALIZE: {
      if (action.collection === 'AvailableJobColumns') {
        if (action.payload.length > 0) {
          // Join the master column list to the server stored user settings.
          return initialAvailableColumnState
            .map((col, i) => {
              const pos = action.payload.findIndex(
                u => u.fieldName === col.fieldName
              );
              return {
                ...col,
                // The server value can dictate checked state...
                isChecked:
                  pos > -1 ? action.payload[pos].isChecked : col.isChecked,
                // ...and column order.
                position:
                  pos > -1 ? pos : i + initialAvailableColumnState.length,
                width: pos > -1 ?  action.payload[pos].width : -1, // todo: what is a good default?
              };
            })
            .sort((a, b) => (a.position > b.position ? 1 : -1));
        } else return initialAvailableColumnState;
      }
      break;
    }
    case CHANGE_WIDTH_AVAILABLE_COLUMN: {
      return state.map(column => {
        if (column.fieldName === action.payload.fieldName) {
          return { ...column, width: action.payload.width };
        }
        return column;
      });
    }
  }

  return state;
}

export function AvailableJobsLocalModificationsReducer(
  state: IAvailableJob[],
  action: Action
) {
  switch (action.type) {
    case SCHEDULE_JOB_ACTION: {
      // Remove from available jobs
      return state.filter(
        avj =>
          !(
            _.includes(action.payload.availableJobIds, avj.ordId) &&
            avj.machineNumber === action.payload.machineId
          )
      );
    }
    case UNSCHEDULE_JOB_ACTION: {
      // Add back to available jobs
      let newJobs = action.payload.scheduledJobIds.map(id => {
        return {
          id: `${action.payload.machineId}-${id}`,
          expectedRuntime: 0,
          warningDueDate: false,
          machineId: action.payload.machineId,
          jobId: id,
        };
      });
      return _([...state, ...newJobs])
        .sortBy(j => j.id)
        .value();
    }
  }
  return state;
}

export function ScheduledJobColumns(
  state: IScheduledJobColumn[] = initialScheduledJobColumnState,
  action: Action
): IScheduledJobColumn[] {
  switch (action.type) {
    case RESET_SCHEDULED_COLUMNS:
      return initialScheduledJobColumnState;
    case TOGGLE_SCHEDULED_COLUMN: {
      return state.map(column => {
        if (column.fieldName === action.payload.fieldName) {
          return { ...column, isChecked: !column.isChecked };
        }
        return column;
      });
    }
    case CHANGE_WIDTH_SCHEDULED_COLUMN: {
      return state.map(column => {
        if (column.fieldName === action.payload.fieldName) {
          return { ...column, width: action.payload.width };
        }
        return column;
      });
    }
    case REORDER_SCHEDULED_COLUMN: {
      const from = state.findIndex(
        x => x.fieldName === action.payload.column.fieldName
      );
      if (from > -1) {
        const to = action.payload.position;

        // Move from one position to another, shifting everything
        // as necessary.
        const copy = [...state];
        copy.splice(to, 0, copy.splice(from, 1)[0]);

        return copy;
      }
      return state;
    }
    // Initializing these columns is a special case, because the server might return
    // an empty set. If we ever get an empty set, we simply use the initial values.
    case PUT:
    case INITIALIZE: {
      if (action.collection === 'ScheduledJobColumns') {
        if (action.payload.length > 0) {
          // Join the master column list to the server stored user settings.
          return initialScheduledJobColumnState
            .map((col, i) => {
              const pos = action.payload.findIndex(
                u => u.fieldName === col.fieldName
              );
              return {
                ...col,
                // The server value can dictate checked state...
                isChecked:
                  pos > -1 ? action.payload[pos].isChecked : col.isChecked,
                // ...and column order.
                position:
                  pos > -1 ? pos : i + initialScheduledJobColumnState.length,
                width: pos > -1 ? action.payload[pos].width : -1, // todo: what is a good default?
              };
            })
            .sort((a, b) => (a.position > b.position ? 1 : -1));
        } else return initialScheduledJobColumnState;
      }
    }
  }
  return state;
}

export type SchedulingSpeed = { pending: number[]; asOf: Date; isPending: boolean };
export function schedulingSpeed(
  state: SchedulingSpeed = { pending: [], asOf: new Date(), isPending: false },
  action
) {
  switch (action.type) {
    case SCHEDULE_JOB_ACTION: {
      const a = action as ScheduleJobAction;
      // Reset the date when we *start* pending. Otherwise, just leave it be.
      if (state.pending.length === 0)
        return {
          ...state,
          pending: a.payload.jobIds,
          asOf: new Date(),
          isPending: true,
        };
      else
        return {
          ...state,
          pending: [...state.pending, ...a.payload.jobIds],
          isPending: true,
        };
    }
    case PUT: {
      if (action.collection === 'Schedule') {
        const dones = action.payload.sequence.map(x => x.ordId) as number[];
        const pending = state.pending.filter(ordId => !dones.includes(ordId));
        return { ...state, pending, isPending: pending.length > 0 };
      }
    }
  }
  return state;
}

export function SelectedJobs(state: number[] = [], action: Action) {
  switch (action.type) {
    case SET_JOB_SELECTION:
      const sjs_action = action as SetJobSelection;
      const without_payload = state.filter(
        x => !sjs_action.payload.jobIds.includes(x)
      );
      if (sjs_action.payload.selected) {
        return without_payload.concat(sjs_action.payload.jobIds);
      } else {
        return without_payload;
      }
  }
  return state;
}

export function SummarizedJobs(state: number[] = [], action: Action) {
  switch (action.type) {
    case SET_JOB_SUMMARIZED:
      const sjs_action = action as SetJobSummarized;
      const without_payload = state.filter(
        x => !sjs_action.payload.jobIds.includes(x)
      );
      if (sjs_action.payload.selected) {
        return without_payload.concat(sjs_action.payload.jobIds);
      } else {
        return without_payload;
      }
  }
  return state;
}

export function ApplyJobPatch<T extends { ordId: number }>(
  state: T[],
  action: Action
): T[] {
  switch (action.type) {
    case PATCH_JOBS:
      const a = action as PatchJobs<T>;

      return state.map(x => {
        if (Array.isArray(a.ordIds)) {
          if (a.ordIds.includes(x.ordId)) {
            return { ...x, ...a.patch };
          }
        } else if (a.ordIds === x.ordId) {
          return { ...x, ...a.patch };
        }

        return x;
      });
  }
  return state;
}

export type JobsInFlightState = { flights: SetJobsInFlight[]; fliers: number[] };
export function JobsInFlight(
  state: JobsInFlightState = { flights: [], fliers: [] },
  action: Action
) {
  switch (action.type) {
    case SET_JOBS_IN_FLIGHT:
      const a = action as SetJobsInFlight;
      return {
        flights: [...state.flights, a],
        fliers: [...state.fliers, ...a.jobIds],
      };
    case LAND_JOBS_IN_FLIGHT:
      const a1 = action as LandJobsInFlight;
      const flights = state.flights.filter(
        x => x.flightNumber !== a1.flightNumber
      );
      return {
        flights: flights,
        fliers: flights.flatMap(x => x.jobIds),
      };
  }
  return state;
}

