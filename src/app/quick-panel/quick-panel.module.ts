import { module } from 'angular';
import { QuickPanelController } from './quick-panel.controller';
import AlertGeneral from './tabs/alerts/alertGeneral';
import AlertIntegrationError from './tabs/alerts/alertIntegrationError';
import AlertScheduleSlip from './tabs/alerts/alertScheduleSlip';
import AlertWarehouseLate from './tabs/alerts/warehouseLate';

export default module('app.quick-panel', [])
    .controller('QuickPanelController', QuickPanelController)
    .component('alertGeneral', AlertGeneral)
    .component('alertIntegrationError', AlertIntegrationError)
    .component('alertScheduleSlip', AlertScheduleSlip)
    .component('alertWarehouseLate', AlertWarehouseLate)
    .config(config)
    .name;

    config.$inject = ['$translatePartialLoaderProvider']
function config($translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('app/sidenav/quick-panel');
}
