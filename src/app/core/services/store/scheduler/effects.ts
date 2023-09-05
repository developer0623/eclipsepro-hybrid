import Rx from 'rx';
import { IAvailableJobColumn, IScheduledJobColumn, IScheduleEstimate } from "./../../../../core/dto";
import { IApiResolverService } from "./../../../../reference";
import { Initialize, Put } from "../../clientData.actions";
import { ClientDataStore, getPagedItems } from "../../clientData.store";
import { NODISPATCH } from "../../lib/effects";
import { Action, Dispatcher } from "../../lib/store";
import { AvailableJobColumnsSelector, ScheduledJobColumnsSelector } from "./selectors";
import {
  INIT_SCHEDULER_DATA,
  REORDER_AVAILABLE_COLUMN,
  RESET_AVAILABLE_COLUMNS,
  SCHEDULE_JOB_ACTION,
  TOGGLE_AVAILABLE_COLUMN,
  UNSCHEDULE_JOB_ACTION,
  TOGGLE_SCHEDULED_COLUMN,
  CHANGE_WIDTH_SCHEDULED_COLUMN,
  REORDER_SCHEDULED_COLUMN,
  RESET_SCHEDULED_COLUMNS,
  CHANGE_WIDTH_AVAILABLE_COLUMN
} from "./actions";

declare let gtag;

export class SchedulerEffects {
  constructor(
    private actions: Rx.Observable<Action>,
    private apiResolver: IApiResolverService,
    private clientDataDispatcher: Dispatcher,
    private store: ClientDataStore,
    private $mdToast
  ) { }

  private toast(textContent: string) {
    this.$mdToast.show(
      this.$mdToast
        .simple()
        .textContent(textContent)
        .position('top right')
        .hideDelay(2000)
        .parent('#content')
    );
  }

  loadInitialData$ = this.actions
    .filter(action => action.type === INIT_SCHEDULER_DATA)
    .flatMap(_ => {
      return getPagedItems<IAvailableJobColumn[]>(
        'user.settings.availableJobColumns@get',
        { skip: 0, take: 1000 },
        this.apiResolver
      );
    })
    .do(data =>
      this.clientDataDispatcher.dispatch(
        new Initialize<IAvailableJobColumn[]>('AvailableJobColumns', data)
      )
    )
    .filter(NODISPATCH);

  loadInitialData2$ = this.actions
    .filter(action => action.type === INIT_SCHEDULER_DATA)
    .flatMap(_ => {
      return getPagedItems<IScheduledJobColumn[]>(
        'user.settings.scheduledJobColumns@get',
        { skip: 0, take: 1000 },
        this.apiResolver
      );
    })
    .do(data =>
      this.clientDataDispatcher.dispatch(
        new Initialize<IScheduledJobColumn[]>('ScheduledJobColumns', data)
      )
    )
    .filter(NODISPATCH);

  postAvailableColumnSelectionToTheServer$ = this.actions
    .filter(
      a =>
        [
          TOGGLE_AVAILABLE_COLUMN,
          REORDER_AVAILABLE_COLUMN,
          RESET_AVAILABLE_COLUMNS,
          CHANGE_WIDTH_AVAILABLE_COLUMN
        ].indexOf(a.type) > -1
    )
    .withLatestFrom(
      this.store.Selector(AvailableJobColumnsSelector),
      (_, columns) => columns
    )
    .map(columns =>
      Rx.Observable.fromPromise(
        this.apiResolver.resolve(
          'user.settings.availableJobColumns@post',
          columns
        )
      )
    )
    .filter(NODISPATCH);

  postScheduledColumnSelectionToTheServer$ = this.actions
    .filter(
      a =>
        [
          TOGGLE_SCHEDULED_COLUMN,
          REORDER_SCHEDULED_COLUMN,
          RESET_SCHEDULED_COLUMNS,
          CHANGE_WIDTH_SCHEDULED_COLUMN
        ].indexOf(a.type) > -1
    )
    .withLatestFrom(
      this.store.Selector(ScheduledJobColumnsSelector),
      (_, columns) => columns
    )
    .map(columns =>
      Rx.Observable.fromPromise(
        this.apiResolver.resolve(
          'user.settings.scheduledJobColumns@post',
          columns
        )
      )
    )
    .filter(NODISPATCH);

  postScheduleChangesToTheServer$ = Rx.Observable.merge(
    this.actions
      .filter(action => action.type === SCHEDULE_JOB_ACTION)
      .flatMap(action => {
        gtag('event', 'scheduler_scheduleJob', {
          event_catetory: 'scheduler',
          event_label: action.payload.isOnMachine ? 'toMachine' : 'toSchedule',
          value: action.payload.jobIds.length,
        });
        return (
          Rx.Observable.fromPromise<IScheduleEstimate[]>(
            this.apiResolver.resolve(
              'jobsAction.scheduleJob@post',
              action.payload
            )
          )
            .do(
	      (schedules) => {
                schedules.forEach((s) =>
                  this.clientDataDispatcher.dispatch(
                     new Put<IScheduleEstimate>("MachineSchedule", s)
                  )
                );
                return this.toast("Schedule change accepted");
              },
              (ex: any) => {
                const msg =
                  ex.status === 400
                    ? ex.data.errors.join('\n')
                    : `Most likely your Agent service is not running. [${ex.statusText}]`;

                return this.toast(
                  `Error: Schedule change was not saved. ${msg}`
                );
              }
            )
            // A scheduling api error shouldn't stop the effect.
            .catch(_ => Rx.Observable.of())
        );
      }),
    this.actions
      .filter(action => action.type === UNSCHEDULE_JOB_ACTION)
      .flatMap(action => {
        gtag('event', 'scheduler_unScheduleJob', {
          event_catetory: 'scheduler',
          value: action.payload.scheduledJobIds.length,
        });
        return (
          Rx.Observable.fromPromise<IScheduleEstimate[]>(
            this.apiResolver.resolve(
              'jobsAction.removeScheduledJob@post',
              action.payload
            )
          )
            .do(
	      (schedules) => {
                schedules.forEach((s) =>
                  this.clientDataDispatcher.dispatch(
                     new Put<IScheduleEstimate>("MachineSchedule", s)
                  )
                );
                return this.toast("Schedule change accepted");
              },
              (ex: any) => {
                const msg =
                  ex.status === 400
                    ? ex.data.errors.join('\n')
                    : `Most likely your Agent service is not running. [${ex.statusText}]`;

                return this.toast(
                  `Error: Schedule change was not saved. ${msg}`
                );
              }
            )
            // A scheduling api error shouldn't stop the effect.
            .catch(_ => Rx.Observable.of())
        );
      })
  )
    // It seems this ui concern should be over the in ui. But the whole
    // effects/redux thing makes it non-obvious how to do so. Therefore,
    // putting it here is the path of least resistance. We can move it
    // once we get a better feel for the right place to do this in a redux
    // architecture.
    .filter(NODISPATCH);
}