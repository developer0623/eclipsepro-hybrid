import angular from 'angular';
import { ClientDataStore } from '../../../../core/services/clientData.store';
import { IBundlingRule } from '../../../../core/dto';
import { Ams } from '../../../../amsconfig';
import { AddConfigModalController } from './modals/addConfig.modal';
import ModalTemp from './modals/addConfig.modal.html';
import Temp from './integration.html';
import { UserHasRole } from '../../../../core/services/store/user/selectors';

const IntegrationSettings_ = {
  selector: 'integrationSettings',
  bindings: {},
  template: Temp,
  /** @ngInject */
  controller: ['$scope', '$http', 'clientDataStore', 'integrationConfigService', '$mdDialog', '$location', class IntegrationSettingsComponent {
    userHasAdminRole = false;
    selectedTabIndex = 0;
    integrationTabs = [
      {
        label: 'Order Import',
        key: 'orderImport',
        items: [],
        enableRun: true,
      },
      {
        label: 'Coil Import',
        key: 'coilImport',
        items: [],
        enableRun: true,
      },
      {
        label: 'Export',
        key: 'export',
        items: [],
        enableRun: false,
      },
      {
        label: 'Material Import',
        key: 'materialImport',
        items: [],
        enableRun: true,
      },
      {
        label: 'Coil Validation',
        key: 'coilValidation',
        items: [],
        enableRun: false,
      },
      {
        label: 'Web Hooks',
        key: 'webhook',
        items: [],
        enableRun: true,
      },
      {
        label: 'Schedule Sync',
        key: 'scheduleSync',
        items: [],
        enableRun: true,
      },
      {
        label: 'External Connection',
        key: 'externalConnection',
        items: [],
        enableRun: false,
      },
    ];
    orderImportConfigsSub_;
    orderImportEventsSub_;
    coilImportConfigsSub_;
    coilImportEventsSub_;
    exportConfigsSub_;
    exportEventsSub_;
    materialImportConfigsSub_;
    materialImportEventsSub_;
    scheduleSyncConfigsSub_;
    scheduleSyncEventsSub_;
    coilValidationConfigsSub_;
    coilValidationEventsSub_;
    webhookConfigsSub_;
    webhookEventsSub_;
    externalConnectionsSub_;
    orderImportEvents = [];
    coilImportEvents = [];
    exportEvents = [];
    materialImportEvents = [];
    scheduleSyncEvents = [];
    coilValidationEvents = [];
    webhookEvents = [];
    hideComplete = false;
    constructor(
      $scope: angular.IScope,
      private $http: angular.IHttpService,
      clientDataStore: ClientDataStore,
      private integrationConfigService,
      private $mdDialog,
      private $location: angular.ILocationService
    ) {
      let qs = this.$location.search();
      if ('tab' in qs) {
        this.selectedTabIndex = parseInt(qs.tab);
      }

      clientDataStore
        .Selector(UserHasRole('administrator'))
        .subscribe(userHasAdminRole => {
          this.userHasAdminRole = userHasAdminRole;
        });

      this.orderImportConfigsSub_ = clientDataStore
        .SelectOrderImportConfigs()
        .subscribe(configs => {
          this.integrationTabs[0].items = [...configs];
        });

      this.orderImportEventsSub_ = clientDataStore
        .SelectOrderImportEvents()
        .subscribe(importEvents => {
          this.orderImportEvents = importEvents.sort(this.descBy('start'));
        });

      this.coilImportConfigsSub_ = clientDataStore
        .SelectCoilImportConfigs()
        .subscribe(configs => {
          this.integrationTabs[1].items = [...configs];
        });
      this.coilImportEventsSub_ = clientDataStore
        .SelectCoilImportEvents()
        .subscribe(importEvents => {
          this.coilImportEvents = importEvents.sort(this.descBy('start'));
        });

      this.exportConfigsSub_ = clientDataStore
        .SelectExportConfigs()
        .subscribe(configs => {
          this.integrationTabs[2].items = [...configs];
        });

      this.exportEventsSub_ = clientDataStore
        .SelectChannelItemStates()
        .subscribe(exportEvents => {
          this.exportEvents = exportEvents.sort(this.descBy('receivedTime'));
        });

      this.materialImportConfigsSub_ = clientDataStore
        .SelectMaterialImportConfigs()
        .subscribe(configs => {
          this.integrationTabs[3].items = [...configs];
        });

      this.materialImportEventsSub_ = clientDataStore
        .SelectMaterialImportEvents()
        .subscribe(importEvents => {
          this.materialImportEvents = importEvents.sort(this.descBy('start'));
        });

      this.scheduleSyncConfigsSub_ = clientDataStore
        .SelectScheduleSyncConfigs()
        .subscribe(configs => {
          console.log(configs);
          this.integrationTabs[6].items = [...configs];
        });

      this.scheduleSyncEventsSub_ = clientDataStore
        .SelectScheduleSyncEvents()
        .subscribe(syncEvents => {
          this.scheduleSyncEvents = syncEvents;
        });

      this.coilValidationConfigsSub_ = clientDataStore
        .SelectCoilValidationConfigs()
        .subscribe(configs => {
          this.integrationTabs[4].items = [...configs];
        });

      this.coilValidationEventsSub_ = clientDataStore
        .SelectCoilValidationEvents()
        .subscribe(coilValidationEvents => {
          this.coilValidationEvents = coilValidationEvents.sort(
            this.descBy('receivedTime')
          );
        });

      this.webhookConfigsSub_ = clientDataStore
        .SelectWebhookConfigs()
        .subscribe(configs => {
          this.integrationTabs[5].items = [...configs];
        });

      this.webhookEventsSub_ = clientDataStore
        .SelectWebhookEvents()
        .subscribe(webhookEvents => {
          this.webhookEvents = webhookEvents;
        });

      this.externalConnectionsSub_ = clientDataStore
        .SelectExternalConnections()
        .subscribe(connections => {
          this.integrationTabs[7].items = [...connections];
        });

      $scope.$on('$destroy', () => {
        this.orderImportConfigsSub_.dispose();
        this.orderImportEventsSub_.dispose();
        this.coilImportConfigsSub_.dispose();
        this.coilImportEventsSub_.dispose();
        this.exportConfigsSub_.dispose();
        this.exportEventsSub_.dispose();
        this.materialImportConfigsSub_.dispose();
        this.materialImportEventsSub_.dispose();
        this.scheduleSyncConfigsSub_.dispose();
        this.scheduleSyncEventsSub_.dispose();
        this.coilValidationConfigsSub_.dispose();
        this.coilValidationEventsSub_.dispose();
        this.webhookConfigsSub_.dispose();
        this.webhookEventsSub_.dispose();
        this.externalConnectionsSub_.dispose();
      });
    }

    descBy = <T>(key: keyof T) => {
      return (e1: T, e2: T) =>
        e1[key] > e2[key] ? -1 : e1[key] < e2[key] ? 1 : 0;
    };

    by = <T>(key: keyof T) => {
      return (e1: T, e2: T) =>
        e1[key] > e2[key] ? 1 : e1[key] < e2[key] ? -1 : 0;
    };

    selectTab = () => {
      this.$location.search({ tab: this.selectedTabIndex });
    };

    showModal = (key, title, config = {}) => {
      this.$mdDialog.show({
        parent: angular.element(document.body),
        template: ModalTemp,
        controller: ['$scope', '$mdDialog', 'config', 'key', 'title', 'integrationConfigService', '$http', AddConfigModalController],
        controllerAs: 'vm',
        locals: {
          config,
          key,
          title,
        },
      });
    };

    onAddConfig = (key: string, title: string) => {
      this.showModal(key, title);
    };

    onEditConfig = (config, key: string, title: string) => {
      this.showModal(key, title, config);
    };

    onRunConfig = (id: string) => {
      this.integrationConfigService.runConfig(id);
    };

    onChangeEnable = (config, key, enabled) => {
      const newConfig = { ...config, enabled };
      this.integrationConfigService.update(newConfig, key);
    };

    triggerImport = (importConfigId: string) => {
      console.log(importConfigId);
      this.$http.post(
        Ams.Config.BASE_URL +
        `/_api/integration/requestImmediateImport/${importConfigId}`,
        {}
      );
    };

    triggerExport = (itemId: string) => {
      console.log('export:' + itemId);
      this.$http.post(
        Ams.Config.BASE_URL +
        `/_api/integration/retryExportAction?item=${itemId}`,
        {}
      );
    };

    cancelExport = (id: string) => {
      console.log('canceling export:' + id);
      this.$http.post(
        Ams.Config.BASE_URL + `/_api/integration/cancelExportAction?id=${id}`,
        {}
      );
    };

    focusSelect = (form) => {
      const input = form.$editables[0].inputEl;
      setTimeout(() => {
        input.select();
      }, 0);
    };

    filterHideComplete = (item: { complete: boolean }) => {
      return !this.hideComplete || !item.complete;
    };


  }],
};

export default IntegrationSettings_;
