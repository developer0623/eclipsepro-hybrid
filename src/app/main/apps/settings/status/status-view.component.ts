import * as _ from "lodash";
import { HealthSummaryType } from '../../../../core/dto';
import { HealthSummary } from '../../../../core/services/store/status/selectors';
import { SystemInfo } from '../../../../core/services/store/misc/selectors';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import Temp from './status-view.html';
import { Ams } from '../../../../amsconfig';

const StatusView = {
   selector: 'statusView',
   bindings: {},
   template: Temp,
   controller: ['$scope', '$http', '$mdToast', 'clientDataStore', '$location', 'systemInfoService', class StatusViewComponent {
      selectedTabIndex = 0;
      health = [];
      alerts = [];
      syncState = [];
      systemInfo = { isSignalRConnected: false };
      pendingAgentActions = [];
      healthSummary: HealthSummaryType[];

      /** @ngInject */
      constructor(
         $scope: angular.IScope,
         private $http: ng.IHttpService,
         private $mdToast,
         clientDataStore: ClientDataStore,
         private $location: ng.ILocationService,
         private systemInfoService
      ) {
         this.systemInfoService.refresh();
         let qs = $location.search();
         if ('tab' in qs) {
            this.selectedTabIndex = parseInt(qs.tab);
         }

         let systemInfoSub_ = clientDataStore
            .Selector(SystemInfo)
            .subscribe(sysInfo => {
               this.systemInfo = sysInfo;
            });

         let healthSub_ = clientDataStore.SelectHealth().subscribe(health => {
            this.health = _.orderBy(health, ['status', 'serviceName']);
         });

         let healthSummarySub_ = clientDataStore
            .Selector(HealthSummary)
            .subscribe(healthSummary => {
               this.healthSummary = healthSummary;
            });

         let alertSub_ = clientDataStore.SelectAlerts().subscribe(alerts => {
            this.alerts = _.orderBy(
               alerts.filter(alert => alert.isCritical),
               ['created']
            );
         });

         let syncStateSub_ = clientDataStore.SelectSyncState().subscribe(sync => {
            this.syncState = _.orderBy(sync, ['id']);
         });

         let pendingAgentActionsSub_ = clientDataStore
            .SelectPendingActionsToAgent()
            .subscribe(actions => {
               this.pendingAgentActions = actions;
            });

         $scope.$on('$destroy', () => {
            systemInfoSub_.dispose();
            healthSub_.dispose();
            healthSummarySub_.dispose();
            alertSub_.dispose();
            syncStateSub_.dispose();
            pendingAgentActionsSub_.dispose();
         });
      }
      private toast(message: string) {
         this.$mdToast.show(
            this.$mdToast
               .simple()
               .textContent(message)
               .position('top right')
               .hideDelay(2000)
               .parent('#content')
         );
      }

      triggerHistorySync() {
         this.$http.post(Ams.Config.BASE_URL + `/api/system/startHistorySync`, {});
         this.toast('Agent history synchronization requested.');
      }
      toastDiagnosticDownload() {
         const message =
            'Diagnostic package download initiated. Check your Downloads folder.';
         this.toast(message);
      }
      doDiagnosticUpload() {
         this.$http
            .post(Ams.Config.BASE_URL + '/api/system/diagnostics/send', {})
            .then(_ => this.toast('Uploaded successfully'))
            .catch(ex =>
               this.toast(
                  'Failed to upload. ' + ex.data.errors.reduce((x, y) => x + ' ' + y)
               )
            );
         const message = 'Diagnostic package upload initiated.';
         this.toast(message);
      }
      selectTab() {
         this.$location.search({ tab: this.selectedTabIndex });
      }
      synchronizeOrdersWithAgent() {
         this.$http
            .post<string>(Ams.Config.BASE_URL + '/api/orders/synccleanup', {})
            .then(resp => this.toast(resp.data))
            .catch(ex => this.toast('Failed. ' + ex.data));
      }
   }],
};


export default StatusView;
