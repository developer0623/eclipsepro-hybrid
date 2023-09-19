import DefaultTemplate from './core/layouts/default.html';
import ToolbarTemplate from './toolbar/toolbar.html';
import NavTemplate from './navigation/navigation.html';
import QuickTemplate from './quick-panel/quick-panel.html';
import { MainController } from './main/main.controller';
import { ToolbarController } from './toolbar/toolbar.controller';
import { NavigationController } from './navigation/navigation.controller';
import { QuickPanelController } from './quick-panel/quick-panel.controller';

routeConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', 'msNavigationServiceProvider'];
export default function routeConfig($stateProvider, $urlRouterProvider, $locationProvider, msNavigationServiceProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('dashboards/machines');
    // $urlRouterProvider.otherwise('dashboards/machines');

    // State definitions
    $stateProvider
        .state('app', {
            abstract: true,
            views: {
                'main@': {
                    template: DefaultTemplate,
                    controller: MainController,
                    controllerAs: 'vm',
                },
                'toolbar@app': {
                    template: ToolbarTemplate,
                    controller: ToolbarController ,
                    controllerAs: 'vm',
                },
                'navigation@app': {
                    template: NavTemplate,
                    controller: NavigationController,
                    controllerAs: 'vm',
                },
                'quickPanel@app': {
                    template: QuickTemplate,
                    controller: QuickPanelController,
                    controllerAs: 'vm',
                }
            }
        });



    msNavigationServiceProvider.saveItem('dashboards', {
      title: 'dashboards',
      icon: 'mdi-microsoft',//tile-four',
      weight: 1
    });
    msNavigationServiceProvider.saveItem('dashboards.machines', {
      title: 'machines',
      state: 'app.dashboards',
      weight: 1,
    });

}
