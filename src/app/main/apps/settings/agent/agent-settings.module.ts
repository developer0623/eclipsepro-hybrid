import angular from 'angular';
import { AgentSettingsController } from './agent-settings.controller';
import AgentSettings from './agent-settings.component';

export default angular
    .module('app.agent-settings', [])
    .component(AgentSettings.selector, AgentSettings)
    .config(config)
    .name;

/** @ngInject */
function config($stateProvider, msNavigationServiceProvider) {
    $stateProvider.state('app.agent-settings', {
        url: '/settings/agent',
        views: {
            'content@app': {
                template: '<agent-settings></agent-settings>'
            }
        }
    });

    // Navigation
    msNavigationServiceProvider.saveItem('settings.agent-settings', {
        title: 'agentStatus',
        state: 'app.agent-settings',
        weight: 7
    });
}


