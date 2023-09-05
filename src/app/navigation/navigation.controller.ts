import { Ams } from '../amsconfig';
import { UserSession } from '../core/services/store/user/selectors';
import { ClientDataStore } from '../core/services/clientData.store';

/** @ngInject */
NavigationController.$inject = ['$scope', '$rootScope', 'msNavigationService', 'clientDataStore', '$http']
export function NavigationController($scope: angular.IScope, $rootScope: angular.IRootScopeService, msNavigationService, clientDataStore: ClientDataStore, $http: angular.IHttpService) {
  let vm = this;


  clientDataStore
    .Selector((state) => state.SystemPreferences)
    .subscribe((systemPreferences) => {
      vm.systemPreferences = systemPreferences;
    });

  clientDataStore
    .Selector((state) => state.SystemInfo)
    .subscribe((systemInfo) => {
      vm.systemInfo = systemInfo;
    });

  // Data
  vm.msScrollOptions = {
    suppressScrollX: true
  };

  vm.toggleMsNavigationFolded = toggleMsNavigationFolded;

  //////////

  /**
       * Toggle folded status
       */
  vm.isFolded = false;

  clientDataStore
    .Selector(UserSession)
    .subscribe(x => {
      if (x) return msNavigationService.setFolded(x.isNavigationFolded);
    }
    );

  function toggleMsNavigationFolded() {
    vm.isFolded = !vm.isFolded;
    $rootScope.$broadcast('isFolded', vm.isFolded);
    msNavigationService.toggleFolded();

    $http.post(Ams.Config.BASE_URL + '/_api/user/settings', { isNavigationFolded: vm.isFolded });
  }
}
