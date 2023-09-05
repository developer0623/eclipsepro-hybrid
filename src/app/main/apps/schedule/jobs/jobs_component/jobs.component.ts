import angular from 'angular';
import * as moment from "moment";
import * as _ from "lodash";
import Temp from "./jobs.component.html";
import {
   mapToScheduleJobsGridDataModel,
   JobSetSummary,
   AvailableJobColumnsSelector,
   ScheduledJobColumnsSelector,
   AssignedJobsGridData,
   DisableScheduler,
} from "../../../../../core/services/store/scheduler/selectors";
import {
   UnscheduleJobAction,
   ScheduleJobAction,
   ResetAvailableJobColumnsAction,
   ResetScheduledJobColumnsAction,
   ToggleAvailableJobColumnAction,
   ToggleScheduledJobColumnAction,
   ReorderAvailableColumn,
   SetJobsInFlight,
   LandJobsInFlight,
   PatchJobs,
   SetJobSelection,
   SetJobSummarized,
   ChangeWidthAvailableJobColumnAction
} from "../../../../../core/services/store/scheduler/actions";
import { Put } from "../../../../../core/services/clientData.actions";

import { UserHasRole } from "../../../../../core/services/store/user/selectors";
import { SchedulingSpeed } from "../../../../../core/services/store/scheduler/reducers";
import {
   AvailableJobsTree,
   JobsService,
} from "../../../../../core/services/jobs.service";
import { ClientDataStore } from "../../../../../core/services/clientData.store";
import {
   IAvailableJobColumn,
   IScheduledJobColumn,
   IJobSummaryDto,
   IMachine,
   ISystemPreferences,
} from "../../../../../core/dto";
import { Ams } from "../../../../../amsconfig";
import { IApiResolverService } from "../../../../../reference";

declare let gtag;

type ScheduleJobsGridDataModel = ReturnType<
   typeof mapToScheduleJobsGridDataModel
>;

const Jobs_ = {
   transclude: true,
   template: Temp,
   bindings: {
      machineIdInput: "<",
      machine: "<",
   },
   /** @ngInject */
   controller: ['$scope', 'clientDataStore', 'jobsService', 'api', '$mdToast', '$http', '$state', 'apiResolver', class JobsComponentController {
      $onChanges: (changes: any) => void;
      _;
      machineId: number = 0;
      machine: IMachine;
      machineId$ = new Rx.Subject<number>();

      availableJobs: AvailableJobsTree[] = [];

      scheduledJobsData: ScheduleJobsGridDataModel;

      filterText$ = new Rx.BehaviorSubject("");
      schedulingSpeed: any;

      disableScheduler = false;
      userHasSchedulerRole = false;

      wideSchedule = false;

      movedType: string = "ass";
      movedPos: number = 0;
      numberOfJobsonMachine: number = 0;

      containerHeight: number = 0;

      dateAndTime: { date: string; times: string[] }[];
      scrollLeft: number = 0;

      availableJobColumns: IAvailableJobColumn[] = [];
      scheduledJobColumns: IScheduledJobColumn[] = [];

      scheduledSummary: JobSetSummary = {
         totalFt: 0,
         count: 0,
         jobIds: [],
         heldJobIds: [],
         notHeldJobIds: [],
      };
      selectedScheduledSummary: JobSetSummary = {
         totalFt: 0,
         count: 0,
         jobIds: [],
         heldJobIds: [],
         notHeldJobIds: [],
      };

      availableSummary: JobSetSummary;
      selectedAvailableSummary: JobSetSummary;

      dropZoneHeight: number;
      availableJobsHeight: number;

      msScrollOptions = {
         suppressScrollX: true,
      };

      systemPreferences: ISystemPreferences;

      isMovingHeader = false;
      clickedHeaderItem;
      columnsWidth = 0;
      startPoint = 0;
      checkedColumns;
      isDragingOnAssign = false;

      constructor(
         $scope: angular.IScope,
         private readonly clientDataStore: ClientDataStore,
         private readonly jobsService: JobsService,
         private api,
         private $mdToast,
         private $http: angular.IHttpService,
         private $state,
         private apiResolver: IApiResolverService
      ) {
         const localWideSchedule = localStorage.getItem('wideSchedule');
         this.wideSchedule = localWideSchedule ? localWideSchedule === 'true' : false;

         this.clientDataStore
            .Selector(state => state.SystemPreferences)
            .subscribe(prefs => {
               this.systemPreferences = prefs;
            });

         this.clientDataStore
            .Selector(AvailableJobColumnsSelector)
            .subscribe((columns) => {
               console.log('columns-------', columns)
               this.availableJobColumns = columns;
               this.checkedColumns = this.availableJobColumns.filter(item => item.isChecked);
            });
         this.clientDataStore
            .Selector(ScheduledJobColumnsSelector)
            .subscribe((columns) => {
               this.scheduledJobColumns = columns;
            });

         // Create a `filter` function to apply against the jobs. This function only looks for the search string
         // in job members whose corresponding columns are currently visible.
         let filter$ = this.filterText$
            .debounce(250)
            .combineLatest(
               clientDataStore.Selector(AvailableJobColumnsSelector),
               (filterText, columns) => {
                  if (filterText.trim().length === 0)
                     return (_: IJobSummaryDto) => true;
                  return (job: IJobSummaryDto) => {
                     return (
                        columns
                           .filter((c) => c.isChecked)
                           .map((col) => job[col.fieldName])
                           .join()
                           .toString()
                           .toLowerCase()
                           .indexOf(filterText.toLowerCase()) > -1
                     );
                  };
               }
            );
         const subscriptions_ = [
            this.machineId$
               .map((machineId) =>
                  this.jobsService.takeSubscriptionsForMachine(machineId)
               )
               .switch()
               .subscribe(),

            this.machineId$
               .map((machine) =>
                  this.jobsService.selectAvailableJobsOldTree(machine, filter$)
               )
               .switch()
               .subscribe((availJobsTree) => {
                  this.availableJobs = availJobsTree.jobs;
                  this.availableSummary = availJobsTree.summary;
                  this.selectedAvailableSummary = availJobsTree.selectedSummary;
               }),

            this.machineId$
               .map((machine) => {
                  return this.clientDataStore.Selector((state) => {
                     return mapToScheduleJobsGridDataModel(
                        AssignedJobsGridData(machine)(state),
                        state.ScheduledJobColumns,
                        this.$state,
                        state
                     );
                  });
               })
               .switch()
               .subscribe((scheJobsTree) => {
                  // console.log('scheduledJobsData', scheJobsTree)
                  this.scheduledJobsData = scheJobsTree;
                  this.numberOfJobsonMachine = scheJobsTree.machineJobsCount;
                  this.containerHeight = this.numberOfJobsonMachine * 76 + 16;
                  let dta = scheJobsTree.dates.map((d) => {
                     let md = moment(d);
                     return {
                        date: md.format("YYYY-MM-DD"),
                        time: md.format("hh:mm A"),
                     };
                  });
                  this.dateAndTime = _(dta)
                     .groupBy("date")
                     .map((items, date) => {
                        return { date: date, times: _.map(items, "time") };
                     })
                     .value();
                  this.scheduledSummary = scheJobsTree.summary;
                  this.selectedScheduledSummary = scheJobsTree.selectedSummary;
               }),

            clientDataStore
               .Select<SchedulingSpeed>("SchedulingSpeed")
               .subscribe((schedulingSpeed) => {
                  this.schedulingSpeed = schedulingSpeed;
               }),

            clientDataStore.Selector(DisableScheduler).subscribe((b) => {
               this.disableScheduler = b;
            }),
            clientDataStore
               .Selector(UserHasRole("Scheduler"))
               .subscribe((userHasSchedulerRole) => {
                  this.userHasSchedulerRole = userHasSchedulerRole;
               }),
         ];

         this.$onChanges = function (changes: {
            machineIdInput: { currentValue?: number };
         }) {
            this.machineId$.onNext(changes.machineIdInput.currentValue);
         };
         this.machineId$.subscribe((machineId) => {
            this.machineId = machineId;
         });

         $scope.$on("$destroy", () => {
            subscriptions_.forEach((sub) => sub.dispose());
         });
      }

      private toast(textContent: string) {
         this.$mdToast.show(
            this.$mdToast
               .simple()
               .textContent(textContent)
               .position("top right")
               .hideDelay(2000)
               .parent("#content")
         );
      }

      toggleAssignedMode() {
         this.wideSchedule = !this.wideSchedule;
         localStorage.setItem('wideSchedule', this.wideSchedule.toString());
         gtag(
            "event",
            `scheduler_toggleMode_${this.wideSchedule ? "wide" : "default"}`
         );
      }

      dropToAvailableJobs(jobIds: number[]) {
         console.log("JOB:dropToAvailableJobs", jobIds);
         if (!this.userHasSchedulerRole) {
            this.toastUserCanNotSchedule();
            return;
         }
         //is this different if on machine (will this do a recall)?
         this.clientDataStore.Dispatch(
            new UnscheduleJobAction({
               scheduledJobIds: jobIds,
               machineId: this.machineId,
            })
         );
      }

      onDropToAvailableJobs(
         event,
         hemi: "north" | "south",
         dragSourceData: number[]
      ) {
         this.dropToAvailableJobs(dragSourceData);
      }

      assignAvailableJob(jobIds: number[]) {
         console.log("JOB:assignAvailableJob", jobIds);
         if (!this.userHasSchedulerRole) {
            this.toastUserCanNotSchedule();
            return;
         }
         this.clientDataStore.Dispatch(
            new ScheduleJobAction({
               jobIds: jobIds,
               machineId: this.machineId,
               isOnMachine: false,
            })
         );
      }

      sendAvailableJob(jobIds: number[]) {
         console.log("JOB:sendAvailableJob", jobIds);
         this.sendToMachine(jobIds);
      }

      dropToMachine(jobIds: number[]) {
         console.log("JOB:dropToMachine", jobIds);
         this.sendToMachine(jobIds);
      }

      toastCannotSendHeldJobs() {
         this.$mdToast.show({
            position: "bottom right",
            template:
               "<md-toast>" +
               "<span flex>Held jobs cannot be sent to the machine. Deselect the held jobs.</span>" +
               "</md-toast>",
         });
      }

      sendToMachine(jobIds: number[]) {
         if (!this.userHasSchedulerRole) {
            this.toastUserCanNotSchedule();
            return;
         }

         const avajobs = this.availableJobs
            .flatMap((ajobs) => ajobs.jobs)
            .filter((j) => jobIds.includes(j.ordId) && j.hold);
         const schjobs = this.scheduledJobsData.jobsTree
            .flatMap((t) => t.jobs)
            .filter((j) => jobIds.includes(j.ordId) && j.hold);

         if (avajobs.length > 0 || schjobs.length > 0) {
            this.toastCannotSendHeldJobs();
            return;
         }

         this.clientDataStore.Dispatch(
            new ScheduleJobAction({
               jobIds: jobIds,
               machineId: this.machineId,
               isOnMachine: true,
            })
         );
      }

      dropToAssignedJobs(jobIds: number[], seq: number) {
         console.log("JOB:dropToAssignedJobs", jobIds);
         if (!this.userHasSchedulerRole) {
            this.toastUserCanNotSchedule();
            return;
         }
         this.clientDataStore.Dispatch(
            new ScheduleJobAction({
               jobIds: jobIds,
               machineId: this.machineId,
               isOnMachine: false,
               requestedSequenceNumber: seq,
            })
         );
      }

      dropToAssignedJobsEnd(jobIds: number[]) {
         console.log("JOB:dropToAssignedJobsEnd", jobIds);
         if (!this.userHasSchedulerRole) {
            this.toastUserCanNotSchedule();
            return;
         }
         this.clientDataStore.Dispatch(
            new ScheduleJobAction({
               jobIds: jobIds,
               machineId: this.machineId,
               isOnMachine: false,
            })
         );
      }

      recallFromMachine(jobIds: number[]) {
         console.log("JOB:recallFromMachine", jobIds);
         if (!this.userHasSchedulerRole) {
            this.toastUserCanNotSchedule();
            return;
         }
         this.clientDataStore.Dispatch(
            new ScheduleJobAction({
               jobIds: jobIds,
               machineId: this.machineId,
               isOnMachine: false,
            })
         );
      }

      private toastUserCanNotSchedule() {
         this.$mdToast.show({
            position: "bottom right",
            template:
               "<md-toast>" +
               "<span flex>Schedule is in read-only mode as the current user is not a member of the <em>Scheduler</em> role.</span>" +
               "</md-toast>",
         });
      }

      resetDefaultColumns() {
         this.clientDataStore.Dispatch(new ResetAvailableJobColumnsAction());
      }
      resetScheduledDefaultColumns() {
         this.clientDataStore.Dispatch(new ResetScheduledJobColumnsAction());
      }
      onAvailableJobColumnToggle(column) {
         this.clientDataStore.Dispatch(
            new ToggleAvailableJobColumnAction(column)
         );
      }
      onScheduledJobColumnToggle(column) {
         this.clientDataStore.Dispatch(
            new ToggleScheduledJobColumnAction(column)
         );
      }
      dragOverAvailableHeader(event, hemi, otherhemi) {
         // console.log(event, hemi, otherhemi);
      }

      dropOnAvailableHeader(index, otherhemi: string, dragSourceData: string) {
         const when = otherhemi === "west" ? "to" : "after";
         console.log(
            "dropOnAvailableHeader",
            `move column ${dragSourceData} ${when} position ${index}`
         );
         this.clientDataStore.Dispatch(
            new ReorderAvailableColumn({
               column: { fieldName: dragSourceData },
               position: index,
            })
         );
      }

      onDbClickAvailableJobsHeader(column) {
         this.clientDataStore.Dispatch(
            new ReorderAvailableColumn({ column, position: 0 })
         );
      }

      launchAFlight(jobId: number | number[]) {
         const flightNumber = Math.floor(Math.random() * 10000);
         this.clientDataStore.Dispatch(
            new SetJobsInFlight(flightNumber, jobId)
         );

         return {
            land: () => {
               this.clientDataStore.Dispatch(
                  new LandJobsInFlight(flightNumber)
               );
            },
         };
      }

      onSetHold(jobId: number | number[], toHold) {
         if (!this.userHasSchedulerRole) {
            this.toastUserCanNotSchedule();
            return;
         }

         let flight = this.launchAFlight(jobId);
         this.$http({
            url: `${Ams.Config.BASE_URL}/api/orders/sethold`,
            method: "POST",
            params: { ordIds: jobId, hold: toHold },
         })
            .then(
               (_) =>
                  this.clientDataStore.Dispatch(
                     new PatchJobs(jobId, { hold: toHold })
                  ),
               (ex) =>
                  this.toast(
                     `Error: Schedule change was not saved. Most likely your Agent service is not running. [${ex.statusText}]`
                  )
            )
            // Remove the indicators upon completion, regardless of success or failure.
            .finally(() => flight.land());
      }
      onSetSelected(jobIds: number[], checked: boolean) {
         console.log("Dispatching...", jobIds, checked);
         this.clientDataStore.Dispatch(
            new SetJobSelection({ jobIds, selected: checked })
         );
      }
      onToggleSummarized(jobIds: number[], checked: boolean) {
         console.log("Dispatching...", jobIds, checked);
         this.clientDataStore.Dispatch(
            new SetJobSummarized({ jobIds, selected: checked })
         );
      }

      onDeselectAvailable() {
         this.clientDataStore.Dispatch(
            new SetJobSelection({
               jobIds: this.availableSummary.jobIds,
               selected: false,
            })
         );
      }
      onDeselectScheduled() {
         this.clientDataStore.Dispatch(
            new SetJobSelection({
               jobIds: this.scheduledSummary.jobIds,
               selected: false,
            })
         );
      }
      onChangeEnable() {
         this.onChangeDetail(this.machine.autoPushEnabled, "autoPushEnabled");
      }
      onChangeMin() {
         this.onChangeDetail(this.machine.autoPushMinFt, "autoPushMinFt");
      }
      onChangeDetail(value, field: string) {
         console.log("value-key", value, field);
         const data = {
            machineNumber: this.machineId,
            [field]: value,
         };
         this.apiResolver
            .resolve<IMachine>("machine.machineUpdate@patch", data)
            .then(
               (response) => {
                  this.clientDataStore.Dispatch(new Put("Machine", response));
                  return this.toast("Machine updated successfully");
               },
               (ex) =>
                  this.toast(
                     "Machine change was not saved. " +
                     ex.data.errors.reduce((x, y) => x + " " + y)
                  )
            );
      }

      /**
       * Select input text on click/focus
       */
      focusSelect(form) {
         const input = form.$editables[0].inputEl;
         setTimeout(() => {
            input.select();
         }, 0);
      }

      onGetWidth(item) {
         if (item.width) {
            return { width: `${item.width}px`, flex: 'none' }
         }
         return {
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
         if (isMoving) {
            this.clickedHeaderItem = item;
            this.startPoint = event.clientX;
         } else {
            console.log(`onClickedColumn ${this.clickedHeaderItem.fieldName} to ${this.clickedHeaderItem.width}`, item, this.clickedHeaderItem);
            if (this.clickedHeaderItem.fieldName) {
               this.clientDataStore.Dispatch(
                  new ChangeWidthAvailableJobColumnAction({
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

      onGetRowWidth() {
         this.columnsWidth = angular.element(".ava-column-header")[0].clientWidth - 18;
      }

      onDragingFromAssign(isDraging) {
         this.isDragingOnAssign = isDraging;
      }

      gotoOrderSequence() {
         this.$state.go('app.report_order-sequence', {machines: this.machineId})

      }
   }],
};

export default Jobs_;
