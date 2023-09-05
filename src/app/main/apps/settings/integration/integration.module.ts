import angular from 'angular';
import ImportFileTestForm from './import-file-test-form.component';
import IntegrationSettings_ from './integration.component';
import { timeInput } from './directives/time-input.directive';

export default angular
  .module('app.integration', [])
  .component(ImportFileTestForm.selector, ImportFileTestForm)
  .component(IntegrationSettings_.selector, IntegrationSettings_)
  .directive('timeInput', timeInput)
  .config(config)
  .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
  $stateProvider.state('app.integration', {
    url: '/settings/integration',
    title: '',
    views: {
      'content@app': {
        template: '<integration-settings></integration-settings>'
      },
    },
  });

  // Navigation
  msNavigationServiceProvider.saveItem('settings.integration', {
    title: 'Integration',
    state: 'app.integration',
    weight: 6,
    claims: 'pro.integration',
  });

  msNavigationServiceProvider.saveItem('settings.machineapplaunch', {
    title: 'Launch Machine App',
    icon: 'mdi-launch',
    href: '/app/machine/',
    target: '_blank',
    weight: 8,
    // claims: 'pro.machine-app',
  });
}
