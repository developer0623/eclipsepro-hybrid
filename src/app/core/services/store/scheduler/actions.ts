import { Action, IAction } from "./../../lib/store";

export const INIT_SCHEDULER_DATA = '[INIT_SCHEDULER_DATA]';
export const TOGGLE_AVAILABLE_COLUMN = '[TOGGLE_AVAILABLE_COLUMN]';
export const REORDER_AVAILABLE_COLUMN = '[REORDER_AVAILABLE_COLUMN]';
export const REORDER_SCHEDULED_COLUMN = '[REORDER_SCHEDULED_COLUMN]';
export const RESET_AVAILABLE_COLUMNS = '[RESET_AVAILABLE_COLUMNS]';
export const RESET_SCHEDULED_COLUMNS = '[RESET_SCHEDULED_COLUMNS]';
export const TOGGLE_SCHEDULED_COLUMN = '[TOGGLE_SCHEDULED_COLUMN]';
export const SCHEDULE_JOB_ACTION = '[SCHEDULE_JOB_ACTION]';
export const UNSCHEDULE_JOB_ACTION = '[UNSCHEDULE_JOB_ACTION]';
export const SET_JOB_SELECTION = '[SET_JOB_SELECTION]';
export const SET_JOB_SUMMARIZED = '[SET_JOB_SUMMARIZED]';
export const PATCH_JOBS = '[PATCH_JOBS]';
export const SET_JOBS_IN_FLIGHT = '[SET_JOBS_IN_FLIGHT]';
export const LAND_JOBS_IN_FLIGHT = '[LAND_JOBS_IN_FLIGHT]';
export const CHANGE_WIDTH_SCHEDULED_COLUMN = '[CHANGE_WIDTH_SCHEDULED_COLUMN]';
export const CHANGE_WIDTH_AVAILABLE_COLUMN = '[CHANGE_WIDTH_AVAILABLE_COLUMN]';

export class InitSchedulerData implements Action {
  readonly type = INIT_SCHEDULER_DATA;
}
export class ToggleAvailableJobColumnAction implements Action {
  readonly type = TOGGLE_AVAILABLE_COLUMN;
  constructor(public payload: { fieldName: string }) { }
}
export class ReorderAvailableColumn implements Action {
  readonly type = REORDER_AVAILABLE_COLUMN;
  constructor(
    public payload: { column: { fieldName: string }; position: number }
  ) { }
}
export class ResetAvailableJobColumnsAction implements IAction<any> {
  readonly type = RESET_AVAILABLE_COLUMNS;
}
export class ToggleScheduledJobColumnAction implements Action {
  readonly type = TOGGLE_SCHEDULED_COLUMN;
  constructor(public payload: { fieldName: string }) { }
}

export class ChangeWidthScheduledJobColumnAction implements Action {
  readonly type = CHANGE_WIDTH_SCHEDULED_COLUMN;
  constructor(public payload: { fieldName: string, width: number }) { }
}

export class ChangeWidthAvailableJobColumnAction implements Action {
  readonly type = CHANGE_WIDTH_AVAILABLE_COLUMN;
  constructor(public payload: { fieldName: string, width: number }) { }
}

export class ReorderScheduledColumn implements Action {
  readonly type = REORDER_SCHEDULED_COLUMN;
  constructor(
    public payload: { column: { fieldName: string }; position: number }
  ) { }
}
export class ResetScheduledJobColumnsAction implements IAction<any> {
  readonly type = RESET_SCHEDULED_COLUMNS;
}
export class ScheduleJobAction implements Action {
  readonly type = SCHEDULE_JOB_ACTION;
  constructor(
    public payload: {
      jobIds: number[];
      machineId: number;
      requestedSequenceNumber?: number;
      isOnMachine: boolean;
      preceedingJobId?: number;
    }
  ) { }
}
export class UnscheduleJobAction implements Action {
  readonly type = UNSCHEDULE_JOB_ACTION;
  constructor(
    public payload: { scheduledJobIds: number[]; machineId: number }
  ) { }
}
export class SetJobSelection implements Action {
  readonly type = SET_JOB_SELECTION;
  constructor(public payload: { jobIds: number[]; selected: boolean }) { }
}

export class SetJobSummarized implements Action {
  readonly type = SET_JOB_SUMMARIZED;
  constructor(public payload: { jobIds: number[]; selected: boolean }) { }
}

export class PatchJobs<T> implements Action {
  readonly type = PATCH_JOBS;
  constructor(
    public ordIds: number | number[],
    public patch: {
      /** TODO: require the members here to exist on T */
    }
  ) { }
}

export class LandJobsInFlight implements Action {
  readonly type = LAND_JOBS_IN_FLIGHT;
  constructor(public flightNumber: number) { }
}
export class SetJobsInFlight implements Action {
  readonly type = SET_JOBS_IN_FLIGHT;
  jobIds: number[];
  constructor(public flightNumber: number, jobId: number | number[]) {
    if (Array.isArray(jobId)) this.jobIds = jobId;
    else this.jobIds = [jobId];
  }
}
