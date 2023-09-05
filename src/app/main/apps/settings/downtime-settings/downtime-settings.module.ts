import angular from 'angular';
import DowntimeSettings_ from './downtime-settings.component';
import DowntimeSettingsModal_ from './downtime-settings-modal.component';

export default angular
   .module('app.downtime-settings', [])
   .component(DowntimeSettings_.selector, DowntimeSettings_)
   .component(DowntimeSettingsModal_.selector, DowntimeSettingsModal_)
   .config(config)
   .name;

/** @ngInject */
config.$inject = ['$stateProvider', 'msNavigationServiceProvider']
function config($stateProvider, msNavigationServiceProvider) {
   $stateProvider.state('app.downtime-settings', {
      url: '/settings/downtime',
      title: '',
      views: {
         'content@app': {
            template: '<downtime-settings></downtime-settings>',
         },
         resolve: {
            downtimeCodes: (apiResolver) => apiResolver.resolve('settings.downtimeCodes@list')
         }
      }
   });

   msNavigationServiceProvider.saveItem('settings.downtime-settings', {
      title: 'Downtime',
      state: 'app.downtime-settings',
      weight: 5,
   });
}
