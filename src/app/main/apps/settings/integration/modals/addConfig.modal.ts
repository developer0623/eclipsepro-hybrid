import { IExternalConnection } from '../../../../../core/dto';
import { Ams } from "../../../../../amsconfig";
import { IntegrationConfigService } from '../../../../../core/services/integration.service';

export function AddConfigModalController(
    $scope: angular.IScope,
    $mdDialog,
    config,
    key,
    title,
    integrationConfigService: IntegrationConfigService,
    $http: ng.IHttpService
  ) {
    let vm = this;
    vm.timeStampKey = '';
    vm.title = title;
    vm.configList = integrationConfigService.getConfigs(key);
    vm.settings = {};
    vm.selectedConfig = '';
    vm.configEnabled = !!config.enabled;
    vm.externalConnections = [];

    if (!config.type) {
      vm.selectedConfig = Object.keys(vm.configList)[0];
    } else {
      vm.selectedConfig = config.type;
      vm.settings = { ...config.settings };
    }

    $http
          .get<IExternalConnection[]>(
             `${Ams.Config.BASE_URL}/_api/integration/externalConnections`
          )
          .then((response) => {
             vm.externalConnections = response.data;
          });

    vm.onInitSettings = function () {
      const newItems = Object.keys(vm.itemsList);
      newItems.forEach(item => {
        if (!!vm.settings[item] && vm.itemsList[item].type === 'interval') {
          vm.settings = {
            ...vm.settings,
            [item]: vm.itemsList[item].default.split(':'),
          };
          vm.timeStampKey = item;
        } else if (
          !!vm.settings[item] &&
          vm.itemsList[item].type !== 'interval'
        ) {
          vm.settings = {
            ...vm.settings,
            [item]: vm.settings[item],
          };
        } else if (vm.itemsList[item].type === 'interval') {
          vm.settings = {
            ...vm.settings,
            [item]: vm.itemsList[item].default.split(':'),
          };
          vm.timeStampKey = item;
        } else {
          vm.settings = {
            ...vm.settings,
            [item]: vm.itemsList[item].default,
          };
        }
      });
    };

    vm.messages = config.messages || [];
    vm.itemsList = vm.configList[vm.selectedConfig].items;
    vm.onInitSettings();

    vm.cancel = function () {
      $mdDialog.cancel();
    };

    vm.onChangeConfig = function (configKey) {
      console.log('configKey', configKey)
      vm.itemsList = vm.configList[configKey].items;
      vm.onInitSettings();
    };

    vm.onTest = function () {
      vm.messages.push('Testing is not implemented');
    };

    vm.onSave = function () {
      let newSettings = { ...vm.settings };
      if (vm.timeStampKey) {
        const timestampArr = newSettings[vm.timeStampKey];
        const realTimeVal = `${timestampArr[0]}:${timestampArr[1]}:${timestampArr[2]}`;
        newSettings = {
          ...newSettings,
          [vm.timeStampKey]: realTimeVal,
        };
      }
      const newConfig = {
        ...config,
        type: vm.selectedConfig,
        enabled: vm.configEnabled,
        settings: newSettings,
      };

      if (config.id) {
        integrationConfigService.update(newConfig, key);
      } else {
        integrationConfigService.save(newConfig, key);
      }
      $mdDialog.hide();
    };
  }
